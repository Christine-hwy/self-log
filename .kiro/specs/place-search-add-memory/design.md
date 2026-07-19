# Design Document: Place Search in Add Memory

## Overview

This feature adds a search-as-you-type place lookup to `Add_Memory_Dialog`, backed by a swappable `Place_Lookup_Service` abstraction. Today's implementation is backed by a rich, locally generated dataset derived from the `all-the-cities` and `world-countries` dev-time packages (never shipped as raw npm dependencies to the browser — only a generated static data file is). The design keeps three concerns cleanly separated so each can be tested and evolved independently:

1. **Data**: a generated, code-split static dataset of countries + cities/towns (`src/data/places.ts`), analogous in spirit to the existing `scripts/generate-geo-labels.mjs` → `src/data/geoLabels.ts` pattern, but with a much lower population floor and a different consumer (interactive search, not passive globe labels).
2. **Logic**: pure, framework-free functions and closures — matching/ranking, debouncing, stale-result discarding, and the dialog's location-field state machine — all testable without rendering React.
3. **UI wiring**: `AddMemoryDialog.tsx` plus one small new component (`PlaceSearchField`) that composes the pure pieces above and renders results using the app's existing hand-rolled Tailwind dark/violet styling (not the shadcn `Command`/`Popover` primitives — rationale below).

## Research Findings

**Dataset size and shape** (verified by running throwaway scripts against the installed `all-the-cities`/`world-countries` packages in this repo, then deleting them):
- `all-the-cities` has 135,233 records total; every record has a `population` field (min 0). At `population >= 500` there are 116,378 records; at `>= 1000` there are 112,320; the existing `geoLabels.ts` uses `>= 300,000` (only 1,422 cities) which is far too sparse for real place search per Requirement 5.1.
- Encoding the `population >= 500` set as compact tuples `[name, countryCode, lat, lng, population]` (rather than repeated object keys) produces ~4.9MB of JSON, which gzips to **~1.9MB**. That's too large to include in the main JS bundle (would block initial load), so it must be code-split and lazy-loaded (see Architecture).
- `world-countries` has 250 entries (194 independent), each with a common name and `latlng`, but **no population field** — fine, since countries are included as their own record `kind`, not filtered by population.
- A naive linear scan (case-insensitive substring match) over all 112k+ city records took **4–14ms per query** in a Node benchmark. That's well within the 200ms debounce budget, so no prebuilt search index (trie/n-gram) is needed today. This is called out explicitly as a decision, not an oversight.

**Existing UI primitives**: `src/app/components/ui/command.tsx` and `popover.tsx` (Radix `cmdk`-based) exist but are **not used anywhere in the app currently**. They render using shadcn's CSS-variable theme (`--popover`, `--popover-foreground`, etc., defined in `src/styles/theme.css`), which defaults to a **light** theme unless a `.dark` class is applied somewhere up the tree — and nothing in this app ever adds a `.dark` class. Meanwhile `AddMemoryDialog.tsx` and the rest of the app style themselves entirely with hardcoded Tailwind utilities (`bg-slate-900/50`, `border-violet-500/20`, etc.), bypassing the CSS-variable theme entirely. Reusing `Command`/`Popover` as-is would render an incongruous white dropdown inside the dark dialog. Additionally, `cmdk`'s `Command` does its own client-side fuzzy filtering by default, which would fight with our async, debounced, service-driven result list (we'd have to set `shouldFilter={false}` and wire everything manually anyway, gaining little). Given this, the design uses a small custom dropdown built from the same plain-Tailwind pattern already used throughout `AddMemoryDialog.tsx`, not the shadcn primitives.

## Architecture

```mermaid
flowchart TD
    subgraph "Dev-time only (never shipped)"
        AC[all-the-cities] --> GEN[scripts/generate-places.mjs]
        WC[world-countries] --> GEN
        GEN --> PLACES[src/data/places.ts\ncommitted, generated]
    end

    subgraph "Runtime"
        DIALOG[AddMemoryDialog.tsx] --> FIELD[PlaceSearchField.tsx]
        FIELD --> CONTROLLER[createSearchController\n(debounce + stale-discard)]
        CONTROLLER --> SERVICE[PlaceLookupService]
        SERVICE -.dynamic import\n(code-split chunk).-> PLACES
        SERVICE --> MATCH[matchPlaces\n(pure match+rank+truncate)]
        DIALOG --> REDUCER[locationFieldsReducer\n(pure state machine)]
        FIELD --> REDUCER
    end
```

Key architectural decisions:

- **Dataset is generated at dev time, committed as source, and lazy-loaded at runtime.** `scripts/generate-places.mjs` (mirroring `generate-geo-labels.mjs`) reads the `all-the-cities` and `world-countries` devDependencies and writes `src/data/places.ts` as a plain exported array. It is not part of `npm run build` and the raw npm packages stay dev-only.
- **The large dataset module is never statically imported** by any component or by the dialog. `createLocalPlaceLookupService` is the *only* place that references it, via a dynamic `import('../../data/places')`, so Vite/Rollup code-splits it into its own chunk. The chunk (~1.9MB gzipped) is fetched once, the first time a search actually happens (or optionally prefetched on dialog open), and cached by the browser thereafter — it never blocks the initial app bundle.
- **No prebuilt search index.** A linear scan is fast enough at this dataset size (measured 4–14ms); building an inverted/n-gram index would add real complexity for no measurable benefit today. If the dataset grows an order of magnitude, this can be revisited inside `createLocalPlaceLookupService` without touching its interface or any caller.
- **Pure-function core, thin React shell.** All logic with interesting input/output behavior (matching, ranking, truncation, debouncing, stale-result discarding, and location-field state transitions) is implemented as plain TypeScript functions/closures with no React dependency, so it can be property-tested directly with `fast-check` (already a devDependency) without needing a component-rendering test library. `AddMemoryDialog.tsx` and the new `PlaceSearchField.tsx` only wire these pieces to JSX.

## Components and Interfaces

### `Place_Lookup_Service` abstraction

```typescript
// src/app/utils/placeLookupService.ts

export interface PlaceCandidate {
  /** Stable identifier for the candidate (used for React keys, not shown to the user). */
  id: string;
  /** Display name, e.g. "Paris" or "France". */
  name: string;
  /** Distinguishing detail shown alongside the name, e.g. the country name. */
  detail: string;
  lat: number;
  lng: number;
}

export interface PlaceLookupService {
  /**
   * Resolves with Search_Results for `query`, already ranked by relevance and
   * truncated to at most 10 candidates. Implementations MUST be safe to call
   * repeatedly and concurrently (callers may issue overlapping calls).
   */
  search(query: string): Promise<PlaceCandidate[]>;
}

/** Today's implementation: backed by the generated local dataset. */
export function createLocalPlaceLookupService(): PlaceLookupService;
```

`AddMemoryDialog` (via `PlaceSearchField`) depends only on the `PlaceLookupService` interface, taking an instance as a prop with `createLocalPlaceLookupService()` as the default:

```typescript
interface AddMemoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memory: Omit<TravelMemory, 'id'>) => void;
  initialLat?: number;
  initialLng?: number;
  /** Defaults to the local-dataset implementation; injectable for tests or a future API-backed service. */
  placeLookupService?: PlaceLookupService;
}
```

A future database/API-backed implementation is a drop-in replacement: `createRemotePlaceLookupService(apiClient): PlaceLookupService`, satisfying the same `search(query): Promise<PlaceCandidate[]>` contract. No change to `AddMemoryDialog.tsx` or `PlaceSearchField.tsx` is required — this directly satisfies Requirement 5.2/5.3.

### Pure matching/ranking function

```typescript
// src/app/utils/matchPlaces.ts

export function matchPlaces(
  candidates: PlaceCandidate[],
  query: string,
  limit = 10
): PlaceCandidate[];
```

Behavior:
- Case-insensitive substring match on `candidate.name` (Requirement 5.5).
- Ranked by: (1) earlier match index within the name, (2) shorter name length, (3) higher `population` (an internal ranking field carried on the generated data, not part of the public `PlaceCandidate` shape returned to callers — see Data Models), (4) name alphabetically, as a final deterministic tiebreak.
- Truncated to `limit` (default 10, Requirement 1.6).

`createLocalPlaceLookupService().search(query)` lazy-loads the dataset (memoized after first load) and delegates to `matchPlaces`.

### Debounce + stale-result controller

```typescript
// src/app/utils/createSearchController.ts

export interface SearchController {
  /** Called on every keystroke with the raw current input value. */
  setQuery(query: string): void;
  dispose(): void;
}

export function createSearchController(
  service: PlaceLookupService,
  onResults: (results: PlaceCandidate[], query: string) => void,
  options?: { debounceMs?: number; minLength?: number }
): SearchController;
```

Behavior (framework-free, uses real `setTimeout`/`Promise`, testable with fake timers):
- Below `minLength` (default 2) characters, `onResults([], query)` is invoked synchronously and no service call is made (Requirement 1.3).
- Keystrokes are debounced: a call to the service is only made after `debounceMs` (default 200ms) of no further `setQuery` calls (Requirement 6.1).
- Each dispatched service call is tagged with an internal monotonically increasing sequence number. When a call resolves, its result is only forwarded via `onResults` if it is still the most recently *dispatched* call; otherwise it is silently discarded (Requirement 6.2). This guards against out-of-order resolution regardless of actual network/timing variance, which is more robust than relying on debounce timing alone.

### Location fields state machine

Today, `AddMemoryDialog` holds `location`, `lat`, `lng` as three independent `useState` strings. This design consolidates them into one `useReducer` so that "select a candidate" vs. "manually edit a field" vs. "open with `initialLat`/`initialLng`" are explicit, testable transitions rather than implicit effects scattered across `useState` setters and a `useEffect`.

```typescript
// src/app/utils/locationFieldsReducer.ts

export interface LocationFieldsState {
  location: string;
  lat: string;
  lng: string;
}

export type LocationFieldsAction =
  | { type: 'initializeCoords'; lat: number; lng: number }
  | { type: 'selectPlace'; candidate: PlaceCandidate }
  | { type: 'editLocation'; value: string }
  | { type: 'editLat'; value: string }
  | { type: 'editLng'; value: string }
  | { type: 'reset' };

export function locationFieldsReducer(
  state: LocationFieldsState,
  action: LocationFieldsAction
): LocationFieldsState;

export function initialLocationFieldsState(
  initialLat?: number,
  initialLng?: number
): LocationFieldsState;
```

- `initializeCoords` sets `lat`/`lng` and leaves `location` untouched (used when the dialog opens with `initialLat`/`initialLng` — Requirement 4.1/4.2).
- `selectPlace` sets `location`, `lat`, and `lng` from the candidate, unconditionally overwriting whatever was there before — including a prior manual edit or a prior `initialLat`/`initialLng` pre-fill (Requirement 2.1, 2.2, 4.3).
- `editLocation`/`editLat`/`editLng` set exactly one field to the given raw value; this is what the plain manual `<input>` fields dispatch on every keystroke, and it always wins over whatever a prior `selectPlace` set, because it's simply the more recent action (Requirement 3.2, 3.3).
- `reset` returns the empty state (used after successful submission).

`AddMemoryDialog` renders `Manual_Location_Fields` (the existing plain `<input>`s) bound to `state.location`/`state.lat`/`state.lng`, dispatching `editLocation`/`editLat`/`editLng` on change — this is unchanged from today's manual-entry UX, just routed through the reducer instead of three `useState`s. `PlaceSearchField` dispatches `selectPlace` when a result is chosen.

### `PlaceSearchField` component

New component, colocated with other dialog subcomponents:

```typescript
// src/app/components/PlaceSearchField.tsx

interface PlaceSearchFieldProps {
  onSelect: (candidate: PlaceCandidate) => void;
  service: PlaceLookupService;
}
```

Renders:
- A text `<input>` styled identically to the dialog's other fields (`bg-slate-900/50 border-slate-700/50 ...`), bound to local `query` state, feeding `SearchController.setQuery` on every change.
- Below it, an absolutely-positioned dropdown (`absolute z-10 mt-1 w-full ...`, same slate/violet dark palette) shown only while `query.length >= 2`, listing up to 10 results, each rendering `name` and `detail` (Requirement 1.4), or a "No matching place found" message when the service returned zero results for the current query (Requirement 1.5).
- Basic keyboard support (`ArrowUp`/`ArrowDown`/`Enter`/`Escape`) and `onMouseDown` selection, calling `onSelect(candidate)` — which the dialog wires to `dispatch({ type: 'selectPlace', candidate })` and closes the dropdown.

This is a self-contained, absolutely-positioned dropdown rather than a Radix `Popover` because `AddMemoryDialog`'s own modal is already a hand-rolled fixed-position overlay (not Radix `Dialog`), so nesting a Radix `Popover`'s portal inside it adds z-index/focus-trap interactions to reason about for no benefit over a simple relatively-positioned `<div>`.

### `AddMemoryDialog.tsx` changes

- Replace the three `location`/`lat`/`lng` `useState`s with `useReducer(locationFieldsReducer, initialLocationFieldsState(initialLat, initialLng))`.
- Replace the `useEffect` that pushes `initialLat`/`initialLng` into state with a `dispatch({ type: 'initializeCoords', ... })` call in the same effect (only fires when the dialog opens with those props set, unchanged trigger condition).
- Replace the plain "Location Name" `<input>` with `<PlaceSearchField onSelect={...} service={placeLookupService ?? defaultService} />` positioned above (or wrapping) a still-present manual-entry `<input>` bound to `state.location` — both the search box and the manual text field write into the same reducer, satisfying Requirement 3.1/3.3 (manual entry remains fully available and independent of search).
- Latitude/longitude `<input>`s remain, now bound to `state.lat`/`state.lng` and dispatching `editLat`/`editLng`.
- `handleSubmit`'s existing guard (`if (!location || !lat || !lng || !date) return;`) is unchanged in spirit, just reads from `state.location`/`state.lat`/`state.lng` (Requirement 2.4, 3.4).

## Data Models

### Generated dataset (`src/data/places.ts`)

Produced by `scripts/generate-places.mjs`. Compact tuple encoding to control bundle size:

```typescript
// src/data/places.ts (generated, do not hand-edit)

export type PlaceRecordKind = 'country' | 'city';

/** [kind, name, countryCode, lat, lng, population] */
export type PlaceRecord = [PlaceRecordKind, string, string, number, number, number];

export const placeRecords: PlaceRecord[] = [ /* ~116,600 tuples */ ];

/** ISO 3166-1 alpha-2 code -> country common name, for the "detail" field. */
export const countryNames: Record<string, string> = { /* 250 entries */ };
```

Generation rules (in `generate-places.mjs`):
- **Countries**: all 250 `world-countries` entries with a valid `latlng`, `kind: 'country'`, `population` set to `0` (unused for countries; ranking falls back to name length/alphabetical).
- **Cities/towns**: all `all-the-cities` entries with `population >= 500` (116,378 records) — chosen to be meaningfully richer than `geoLabels.ts`'s `>= 300,000` floor (Requirement 5.1) while keeping the generated chunk a manageable size (~1.9MB gzipped).
- `countryNames` is a small separate map (from `world-countries`) so the country name string isn't repeated per-city-record; cities carry their ISO country code (`c.country` from `all-the-cities`) and the `PlaceLookupService` resolves it to a full name at query time to build `PlaceCandidate.detail`.

This file is imported **only** via a dynamic `import()` inside `createLocalPlaceLookupService`, so bundlers code-split it away from the main bundle.

### Runtime types

```typescript
export interface PlaceCandidate {
  id: string;      // `${kind}:${name}:${lat}:${lng}` — stable, derived, not stored
  name: string;
  detail: string;  // resolved country name
  lat: number;
  lng: number;
}
```

`PlaceCandidate` deliberately omits `population`/`kind` from the public contract — those are internal ranking inputs specific to today's dataset, not part of the `Place_Lookup_Service` contract, so a future remote implementation isn't obligated to expose them (Requirement 5.2/5.3).

No changes are needed to `TravelMemory` (`src/data/site.ts`) — a selected or manually-entered place still ultimately produces a plain `location: string`, `lat: number`, `lng: number` on submission, exactly as today.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Minimum-length gate

For any query string of fewer than 2 characters, `createSearchController` never invokes the underlying `PlaceLookupService.search`.

**Validates: Requirements 1.3**

### Property 2: Debounce coalesces rapid input

For any sequence of `setQuery` calls where each call occurs less than `debounceMs` (200ms) after the previous one, only the last query in that burst is ever passed to `PlaceLookupService.search`. For any two `setQuery` calls separated by at least `debounceMs`, both are passed to `PlaceLookupService.search`.

**Validates: Requirements 6.1**

### Property 3: Stale results are discarded

For any two queries `q1` issued before `q2`, if the search promise for `q1` resolves after the search promise for `q2` has already been dispatched (regardless of resolution order), the results ultimately delivered via `onResults` are always `q2`'s results, never `q1`'s.

**Validates: Requirements 6.2**

### Property 4: Results are truncated to 10

For any array of `PlaceCandidate` inputs of any length and any query, `matchPlaces` returns at most 10 candidates.

**Validates: Requirements 1.6**

### Property 5: Case-insensitive substring matching is inclusive

For any candidate name and any non-empty substring of that name in any mix of casing, searching for that substring (in any casing) with `matchPlaces` includes the candidate whose name it was drawn from, provided the result set is not truncated away by higher-ranked matches (verified using a candidate list small enough to avoid truncation, or by asserting the candidate's presence within the first `limit` matches when the substring is drawn from a candidate deliberately ranked at the top).

**Validates: Requirements 5.5**

### Property 6: Results are ordered by relevance

For any array of candidates and any query, `matchPlaces`'s output is sorted according to the defined relevance comparator: ascending match-index within the name, then ascending name length, then descending population, then ascending name (alphabetical tiebreak). This same property, run against arbitrary generated candidate arrays, also validates that any future `PlaceLookupService` implementation reusing `matchPlaces` preserves the ordering contract (Requirement 5.3's substitutability).

**Validates: Requirements 5.4**

### Property 7: Selecting a candidate populates all three fields, from any prior state

For any `LocationFieldsState` (empty, manually filled, or initialized via `initializeCoords`) and any `PlaceCandidate`, dispatching `selectPlace` results in a state where `location === candidate.name`, `lat === String(candidate.lat)`, and `lng === String(candidate.lng)`, regardless of what the prior state held.

**Validates: Requirements 2.1, 2.2, 4.3**

### Property 8: Manual edits after selection always win

For any `PlaceCandidate` followed by any subsequent `editLocation`/`editLat`/`editLng` action with any string value, dispatching `selectPlace` and then the edit action results in that one field holding the edited value (not the candidate's original value), while the other two fields remain whatever `selectPlace` set.

**Validates: Requirements 3.2, 3.3**

### Property 9: Submission is gated on all required fields being non-empty

For any combination of empty/non-empty `location`, `lat`, `lng`, and `date` values, `AddMemoryDialog`'s submit handler creates a memory if and only if all four are non-empty.

**Validates: Requirements 2.4, 3.4**

### Property 10: Opening with initial coordinates pre-fills lat/lng and leaves location empty

For any numeric `initialLat`/`initialLng` pair, `initialLocationFieldsState(initialLat, initialLng)` produces a state where `lat`/`lng` equal those values (formatted) and `location` is the empty string.

**Validates: Requirements 4.1, 4.2**

## Error Handling

- **`PlaceLookupService.search` rejects (e.g., a future remote implementation's network error)**: `createSearchController` catches the rejection, forwards an empty result array via `onResults` for that query (so the UI shows the "no matching place found" state rather than a stale list or an unhandled exception), and does not mark the controller itself as failed — subsequent queries continue to work normally.
- **Dynamic import of `src/data/places.ts` fails** (unexpected in production since it's a committed static asset, but guarded defensively): `createLocalPlaceLookupService` treats this the same as a service rejection — resolves `search()` with `[]` rather than throwing, so a transient chunk-load failure degrades to "no results" instead of crashing the dialog. Manual entry remains fully usable regardless (Requirement 3).
- **Query containing only whitespace or below the 2-character minimum**: handled by Property 1 (no service call); the dropdown is simply not shown, distinct from the "zero results" empty state.
- **User closes the dialog or unmounts mid-search**: `PlaceSearchField` calls `SearchController.dispose()` on cleanup, which cancels any pending debounce timer so no `onResults` callback fires against an unmounted component.
- **Submission with a selected place but a missing required field (e.g., date)**: unchanged existing guard in `handleSubmit`, now reading from reducer state (Property 9) — submission is a no-op until every required field is non-empty; no partial memory is created.

## Testing Strategy

**Unit tests** (concrete examples and edge cases, using plain `vitest` — no new test-rendering dependency needed since the logic under test is framework-free):
- `matchPlaces`: empty query, query with no matches, query matching a candidate with no `detail`, ties broken by population.
- `createSearchController`: dispose during an in-flight debounce timer produces no callback; a rejected `search()` call surfaces as `onResults([], query)`.
- `locationFieldsReducer`: `reset` returns the empty state; `initializeCoords` after a prior `selectPlace` does not clear `location`.
- `PlaceSearchField`/`AddMemoryDialog` structural checks (Requirements 1.1, 1.4, 1.5, 3.1): a small number of lightweight DOM checks rendering the components directly with `react-dom/client` (already a project dependency, no new test library needed) to confirm the search input and manual fields are present, a rendered result item's text includes both `name` and `detail`, and the "no matching place found" message appears when results are empty for a non-trivial query.

**Property-based tests** (`fast-check`, already a devDependency; minimum 100 iterations each, tagged with `Feature: place-search-add-memory, Property N: <text>`):
- Properties 1–6 test the pure `createSearchController` and `matchPlaces` modules directly (using `vi.useFakeTimers()` for the debounce/staleness properties 2–3), with no React involved.
- Properties 7–10 test `locationFieldsReducer` directly as a pure reducer (state in, action in, state out), with no React involved.
- Property 9 additionally gets one focused unit test exercising the real `handleSubmit` guard in `AddMemoryDialog` end-to-end (rendered via `react-dom/client`) to confirm the reducer-based refactor didn't change the existing gating behavior — the exhaustive combination coverage itself is the property test on the reducer.

Both test types are complementary: unit tests pin down specific, human-chosen scenarios (including the handful of purely structural/rendering checks that don't vary meaningfully with input), while property tests exercise the matching, ranking, debouncing, staleness, and field-state-transition logic across a wide range of generated inputs where bugs are more likely to hide.

No new runtime or test dependencies are required. `@testing-library/react` was considered for hook-level testing but is not needed because the debounce/stale-discard logic is implemented as a framework-free closure (`createSearchController`) rather than a React hook, and the location-field logic is a plain reducer function — both testable with vanilla `vitest`/`fast-check`.
