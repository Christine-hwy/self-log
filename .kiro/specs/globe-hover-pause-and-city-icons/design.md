# Design Document

## Overview

This feature modifies `src/app/components/GlobeView.tsx`, the only Globe implementation actually used by the app. It makes two independent changes:

1. **Rotation pause/resume**: attach `pointerenter`/`pointerleave` listeners to the globe's container element (the same `containerRef` div already used) that toggle `myGlobe.controls().autoRotate`.
2. **Marker redesign**: remove the existing `pointsData` purple dot's *visual* styling and the `labelsData` purple text label entirely, replacing them with a small, fixed-size "glass badge" containing a `lucide-react` icon chosen via a new per-city icon mapping module. The existing `pointsData` mesh is kept as an **invisible hit-target** so that click/hover/tooltip interaction (already proven to work correctly and to avoid double-firing the background `onGlobeClick` handler) continues to work unchanged.

Both changes are scoped entirely to `GlobeView.tsx` plus one new pure-logic module for icon resolution. No other component needs to change.

### Why keep `pointsData` as an invisible hit-target instead of building a fully custom interactive layer

`globe.gl` dispatches click/hover through a single raycasting pipeline keyed by object type (`point`, `object`, `label`, `globe`, etc.) — whichever type is hit determines which single callback fires (confirmed by reading `node_modules/globe.gl/dist/globe.gl.js`, the `.onClick`/`.onHover` wiring around `objFns`/`hoverObjFns`). Clicking a `point` calls `onPointClick` only; `onGlobeClick` is only invoked when nothing is hit (`if (!obj) return` guard in the click handler ignores background clicks for object handlers, and vice versa). This means the current `pointsData` → `onPointClick` → open detail + zoom, and background click → `onGlobeClick` → add memory, wiring already can't double-fire.

The `htmlElementsData` layer (used for the geography reference labels and, in this design, the new badges) is **not** part of that raycasting/click system at all — it's a plain DOM/CSS2D overlay. Making the badges interactive would require manual `stopPropagation` plumbing to avoid accidentally re-triggering the globe click-raycast. Since the point layer's interaction handling already works correctly, this design keeps `pointsData` as the click/hover target (now invisible) and layers the new badge purely as a **non-interactive, decorative** overlay positioned at the same coordinates. This avoids new event-routing risk entirely while still satisfying Requirement 5 (preserved interactions) with no behavior change to the interaction code path.

This also means badges automatically get the same far-side occlusion the geography labels already have: `globe.gl` only wires up its internal "hide when behind the globe" check for the `htmlElementsData` layer (confirmed: only `HtmlElementsLayerKapsule` declares an `isBehindGlobe` prop in the bundled source). Combining the new badges into the *same* `htmlElementsData` call the geo-labels already use means badges inherit this occlusion for free, rather than needing new logic.

## Architecture

```
GlobeView.tsx
├── useEffect (mount, once)
│   ├── existing: create Globe(), set image/atmosphere, autoRotate = true
│   └── NEW: containerRef.addEventListener('pointerenter'|'pointerleave', ...)
│         → toggles myGlobe.controls().autoRotate
│
└── useEffect (memories, callbacks, altitude)
    ├── pointsData(memories)                    [MODIFIED: transparent color, kept as hit-target]
    │     .onPointClick → onMemoryClick + pointOfView(...)   [UNCHANGED]
    │     .pointLabel → existing rich tooltip                 [UNCHANGED]
    ├── labelsData(...)                          [REMOVED]
    └── htmlElementsData(combinedEntries)        [MODIFIED: now carries two kinds of entries]
          ├── existing geoLabels entries  → geo text element      [UNCHANGED branch]
          └── NEW memory-badge entries    → badge element via
                createMemoryBadgeElement(memory)  [NEW, src/app/components/globeMarkerBadge.tsx]
                  └── resolveCityIcon(location)   [NEW, src/data/cityIcons.ts]
```

## Components and Interfaces

### `src/data/cityIcons.ts` (new)

Pure lookup module with no React/DOM dependency, so it is trivial to unit/property test in isolation.

```typescript
import type { LucideIcon } from 'lucide-react';
import {
  Landmark,
  TowerControl,
  RadioTower,
  Building2,
  Building,
  Castle,
  Waves,
  Flower2,
  Sailboat,
} from 'lucide-react';

export interface CityIconEntry {
  /** Lowercase substring matched against a memory's location field. */
  matchKey: string;
  icon: LucideIcon;
}

// Order matters only in that the first case-insensitive substring match wins.
export const CITY_ICON_MAP: CityIconEntry[] = [
  { matchKey: 'paris', icon: TowerControl },
  { matchKey: 'tokyo', icon: RadioTower },
  { matchKey: 'new york', icon: Building2 },
  { matchKey: 'london', icon: Castle },
  { matchKey: 'hong kong', icon: Waves },
  { matchKey: 'guangzhou', icon: Flower2 },
  { matchKey: 'shanghai', icon: Building },
  { matchKey: 'sydney', icon: Sailboat },
];

export const DEFAULT_MARKER_ICON: LucideIcon = Landmark;

/**
 * Resolves the Landmark_Icon for a given Travel_Memory location string.
 * Case-insensitive substring match; falls back to DEFAULT_MARKER_ICON.
 */
export function resolveCityIcon(location: string): LucideIcon {
  const normalized = location.toLowerCase();
  const match = CITY_ICON_MAP.find(entry => normalized.includes(entry.matchKey));
  return match ? match.icon : DEFAULT_MARKER_ICON;
}
```

### `src/app/components/globeMarkerBadge.tsx` (new)

Builds the actual DOM node handed to `globe.gl`'s `htmlElement` accessor. Kept as a small pure function (`data in, HTMLElement out`) so the "shared styling" property can be tested without mounting `GlobeView`.

```typescript
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveCityIcon } from '../../data/cityIcons';
import { TravelMemory } from '../../data/site';

export const MARKER_BADGE_SIZE_PX = 28;
export const MARKER_ICON_SIZE_PX = 15;
export const MARKER_ICON_COLOR = '#e9d5ff'; // violet-200, shared across every badge
export const MARKER_ICON_STROKE_WIDTH = 2;

/**
 * Builds the fixed-size "glass badge" DOM element for a single Travel_Memory.
 * Every badge shares identical container styling; only the inner icon differs.
 * Purely decorative: pointer-events is disabled so clicks/hovers pass through
 * to the invisible point-layer hit-target beneath it.
 */
export function createMemoryBadgeElement(memory: TravelMemory): HTMLDivElement {
  const Icon = resolveCityIcon(memory.location);
  const iconSvg = renderToStaticMarkup(
    createElement(Icon, {
      size: MARKER_ICON_SIZE_PX,
      color: MARKER_ICON_COLOR,
      strokeWidth: MARKER_ICON_STROKE_WIDTH,
    })
  );

  const el = document.createElement('div');
  el.setAttribute('data-memory-badge', memory.id);
  el.style.cssText = `
    width: ${MARKER_BADGE_SIZE_PX}px;
    height: ${MARKER_BADGE_SIZE_PX}px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: rgba(30, 27, 60, 0.65);
    border: 1.5px solid rgba(196, 132, 252, 0.7);
    box-shadow: 0 0 10px rgba(167, 139, 250, 0.45), 0 2px 6px rgba(0,0,0,0.4);
    backdrop-filter: blur(6px);
    pointer-events: none;
  `;
  el.innerHTML = iconSvg;
  return el;
}
```

### `GlobeView.tsx` changes

**Mount effect** — add pause/resume wiring right after `autoRotate` is enabled:

```typescript
myGlobe.controls().autoRotate = true;
myGlobe.controls().autoRotateSpeed = 0.3;

const handlePointerEnter = () => {
  myGlobe.controls().autoRotate = false;
};
const handlePointerLeave = () => {
  myGlobe.controls().autoRotate = true;
};
containerRef.current.addEventListener('pointerenter', handlePointerEnter);
containerRef.current.addEventListener('pointerleave', handlePointerLeave);
```

The corresponding `removeEventListener` calls are added to the effect's existing cleanup function alongside the existing `resize` listener removal. `controls().enableRotate` is never touched, so manual drag-rotation keeps working regardless of hover state (Requirement 1.5).

**Data effect** — three changes:

1. `pointsData(memories).pointColor(() => 'rgba(0,0,0,0)')` — fully transparent (was `'#c084fc'`); geometry-based raycasting still hits it, so `onPointClick`/`onPointHover`/`pointLabel` are untouched.
2. The `labelsData(memories)...` block is deleted.
3. `geoLabels` (existing) and a new `memories.map(m => ({ kind: 'memory-badge' as const, memory: m, lat: m.lat, lng: m.lng }))` array are concatenated into one array passed to `.htmlElementsData(...)`. The single `.htmlElement()` factory branches on `d.kind`: the existing geo-text branch is untouched (Requirement 5.5); a new branch calls `createMemoryBadgeElement(d.memory)` and does **not** apply the altitude-based opacity/size scaling used for geo-text, so badges stay visible at every zoom level (Requirement 2.4).

## Data Models

No changes to `TravelMemory` (`src/data/site.ts`). The icon mapping is derived purely from the existing free-text `location` field, so no migration is needed for existing or newly-added memories (Requirement 5.4 is satisfied automatically since new memories flow through the same `memories` array/effect).

```typescript
// New, in src/data/cityIcons.ts — no changes to existing interfaces.
interface CityIconEntry {
  matchKey: string;
  icon: LucideIcon;
}
```

## Error Handling

- **Unmapped location**: `resolveCityIcon` always returns `DEFAULT_MARKER_ICON` when no `matchKey` matches (including an empty string location) — never throws, never returns `undefined`.
- **Container not yet mounted**: mirrors the existing guard already in the mount effect (`if (!containerRef.current) return`); pointer listeners are only attached after that guard passes.
- **Globe instance destroyed mid-hover**: the existing unmount cleanup removes the new pointer listeners the same way it already removes the `resize` listener, so no dangling handlers reference a destroyed globe instance.
- **Icon render failure**: `renderToStaticMarkup` operates on plain data-driven `lucide-react` components with static props, so no user input reaches it directly; the only variable input is which icon component is selected, and every entry in `CITY_ICON_MAP` plus the default is a valid, statically-imported component.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property reflection notes**: The prework identified 16 acceptance criteria as property-testable. Several collapse into a single property because they describe different facets of the same underlying pure function or state machine: 1.1–1.5 are all transitions of one hover/auto-rotate state machine (Property 1); 2.1–2.4 are all invariants of the same badge-creation function (Property 2); 3.1–3.4 are all cases of the same case-insensitive substring lookup, with 3.4 subsuming 3.1 and 3.3 as special cases (Property 3, split into match/fallback halves); 4.1–4.3 are all facets of "the container/icon styling is shared" for the same rendered output (Property 4); 5.1–5.2 are both effects of the same click handler (Property 5). 5.3–5.5 were classified as not property-testable (unrelated/unchanged code, or pure passthrough); 5.6 stands alone as it exercises a distinct code path (tooltip content) (Property 6).

### Property 1: Hover state drives auto-rotate, drag always stays enabled

For any sequence of pointer `enter`/`leave` events applied to the globe container, after processing the sequence the controls' `autoRotate` flag equals `true` if and only if the most recent event was `leave` (or no event has occurred yet), and `enableRotate` (manual drag) remains `true` regardless of the sequence.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Every memory produces exactly one fixed-size, always-visible badge

For any array of Travel_Memory objects and any altitude value (including values below and above the old 1.8 label threshold), building the badge layer produces exactly one badge element per memory, and every produced badge element has width and height equal to `MARKER_BADGE_SIZE_PX` (≤ 32px), independent of the altitude value supplied.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: Icon resolution matches mapped cities case-insensitively as a substring, and falls back otherwise

For any mapped `matchKey` in `CITY_ICON_MAP`, any casing transformation of that key, and any prefix/suffix strings concatenated around it, `resolveCityIcon(prefix + casedKey + suffix)` returns that entry's icon. For any location string that does not contain any `matchKey` as a case-insensitive substring, `resolveCityIcon(location)` returns `DEFAULT_MARKER_ICON`.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Every badge shares identical container and icon styling

For any two Travel_Memory objects (regardless of whether their locations resolve to the same icon or different icons, including the default), the badge elements produced for them have identical container dimensions, border, background, and shadow styling, and identical icon size, stroke width, and color — differing only in the icon markup itself.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 5: Clicking a memory's badge opens its detail and centers the camera

For any array of Travel_Memory objects and any single memory chosen from that array, simulating the recorded click handler for that memory invokes the memory-click callback with that exact memory object, and invokes the camera positioning call with that memory's `lat`/`lng` and an altitude of exactly `1.5`.

**Validates: Requirements 5.1, 5.2**

### Property 6: Hover preview content reflects the hovered memory

For any Travel_Memory, the tooltip content generated when it is hovered includes that memory's `location` text and `date` text.

**Validates: Requirements 5.6**

## Testing Strategy

- **Unit tests** cover: background-click-still-adds-memory passthrough (Requirement 5.3, classified as INTEGRATION/example in prework, not a property), the geo-label rendering branch remaining byte-for-byte unchanged (Requirement 5.5, smoke-level check), and a couple of concrete `resolveCityIcon` examples (e.g. `"Paris, France"` and `"Nowhere, Nowhereland"`) as documentation-style examples alongside the property test.
- **Property tests** cover the six properties above, each with a minimum of 100 generated iterations, using `fast-check` (already compatible with the existing Vite/TypeScript toolchain; no runtime dependency changes needed beyond a dev dependency for the test runner/PBT library — see tasks for setup).
- Both test types are complementary: unit tests pin down the two non-property-testable/regression-risk behaviors (5.3, 5.5), property tests cover the input space for everything that varies meaningfully with input.
