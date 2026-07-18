# Implementation Plan: globe-hover-pause-and-city-icons

## Overview

Implement pointer-driven auto-rotate pause/resume and replace the purple dot + text label memory markers with a uniform icon badge, entirely within `GlobeView.tsx` plus two new small modules (`src/data/cityIcons.ts` and `src/app/components/globeMarkerBadge.tsx`). Set up `vitest` + `fast-check` for property-based testing since no test runner currently exists in the project.

## Tasks

- [x] 1. Set up test tooling
  - Add `vitest` and `fast-check` as dev dependencies
  - Add a `"test": "vitest --run"` script to `package.json`
  - Create a minimal `vitest.config.ts` (or reuse `vite.config.ts` via `defineConfig` merge) with the `jsdom` environment enabled, and add `jsdom` as a dev dependency
  - Verify the toolchain works with a trivial placeholder test, then remove the placeholder
  - _Requirements: (tooling only, no direct requirement)_

- [x] 2. Implement per-city icon resolution module
  - [x] 2.1 Create `src/data/cityIcons.ts` with `CityIconEntry` interface, the `CITY_ICON_MAP` array (Paris, Tokyo, New York, London, Hong Kong, Guangzhou, Shanghai, Sydney using distinct `lucide-react` icons per the design), `DEFAULT_MARKER_ICON`, and the exported `resolveCityIcon(location: string): LucideIcon` function performing case-insensitive substring matching
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.2 Write unit tests for `resolveCityIcon`
    - Cover concrete examples: `"Paris, France"` resolves to the Paris icon, `"HONG KONG"` resolves case-insensitively, an unrecognized location (e.g. `"Nowhere, Nowhereland"`) resolves to `DEFAULT_MARKER_ICON`
    - _Requirements: 3.1, 3.2_

  - [ ]* 2.3 Write property test for icon resolution matching and fallback
    - **Property 3: Icon resolution matches mapped cities case-insensitively as a substring, and falls back otherwise**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 3. Implement the marker badge DOM factory
  - [x] 3.1 Create `src/app/components/globeMarkerBadge.tsx` exporting `MARKER_BADGE_SIZE_PX`, `MARKER_ICON_SIZE_PX`, `MARKER_ICON_COLOR`, `MARKER_ICON_STROKE_WIDTH` constants and the `createMemoryBadgeElement(memory: TravelMemory): HTMLDivElement` function that renders the resolved icon via `renderToStaticMarkup` into a fixed-size glass badge `<div>` with `pointer-events: none`
    - _Requirements: 2.2, 2.3, 4.1, 4.2, 4.3_

  - [ ]* 3.2 Write property test for badge creation invariants
    - **Property 2: Every memory produces exactly one fixed-size, always-visible badge**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [ ]* 3.3 Write property test for consistent styling across badges
    - **Property 4: Every badge shares identical container and icon styling**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 4. Checkpoint - Ensure all tests pass
  - Run the test suite and confirm the icon-resolution and badge-factory modules pass in isolation, ask the user if questions arise.

- [x] 5. Wire pointer-driven auto-rotate pause/resume into GlobeView
  - [x] 5.1 In the mount `useEffect` of `GlobeView.tsx`, add `pointerenter`/`pointerleave` listeners on `containerRef.current` that set `myGlobe.controls().autoRotate` to `false`/`true` respectively, and remove both listeners in the effect's existing cleanup function
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 5.2 Write property test for the hover/auto-rotate state machine
    - **Property 1: Hover state drives auto-rotate, drag always stays enabled**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

- [x] 6. Replace the purple dot and text label with the marker badge layer
  - [x] 6.1 In the data `useEffect` of `GlobeView.tsx`, change `pointColor` on the `pointsData` layer to a fully transparent color, keeping `pointLat`/`pointLng`/`pointAltitude`/`pointRadius`/`onPointClick`/`pointLabel` unchanged
    - _Requirements: 2.1, 5.1, 5.2_
  - [x] 6.2 Remove the `labelsData(...)` block (the purple text label) entirely
    - _Requirements: 2.1_
  - [x] 6.3 Build a combined entries array merging the existing `geoLabels` entries with new memory-badge entries (`{ kind: 'memory-badge', memory, lat, lng }` derived from `memories`), pass it to the single `.htmlElementsData(...)` call, and branch the `.htmlElement()` factory on `d.kind`: keep the existing geo-text element construction unchanged for geo entries, and call `createMemoryBadgeElement(d.memory)` for memory-badge entries without applying the altitude-based opacity/size scaling used for geo text
    - _Requirements: 2.1, 2.4, 3.1, 3.2, 5.4, 5.5_

  - [ ]* 6.4 Write unit test confirming background clicks still trigger add-memory
    - Simulate a globe click that does not hit the point layer and assert `onLocationClick` is invoked with the clicked coordinates
    - _Requirements: 5.3_

  - [ ]* 6.5 Write property test for click-to-open-detail and camera centering
    - **Property 5: Clicking a memory's badge opens its detail and centers the camera**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 6.6 Write property test for hover preview content
    - **Property 6: Hover preview content reflects the hovered memory**
    - **Validates: Requirements 5.6**

- [x] 7. Final checkpoint - Ensure all tests pass and the app builds
  - Run the full test suite
  - Run `vite build` (per `package.json`) and confirm it completes without errors
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Each task references specific requirements for traceability.
- Checkpoints ensure incremental validation; the final checkpoint also verifies the production build still passes.
- Property tests validate the six universal correctness properties from `design.md`.
- Unit tests validate the two non-property-testable behaviors (background-click passthrough, geo-label layer regression) plus a couple of concrete icon-resolution examples.
