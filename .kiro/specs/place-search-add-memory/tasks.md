# Implementation Plan: place-search-add-memory

## Overview

Generate a rich local place dataset (`scripts/generate-places.mjs` → `src/data/places.ts`), build a framework-free pure-function core (`matchPlaces`, `placeLookupService`, `createSearchController`, `locationFieldsReducer`), wire it into a new `PlaceSearchField` component, and refactor `AddMemoryDialog.tsx` to use the reducer and the new field instead of its three separate `useState`s. `vitest` and `fast-check` are already devDependencies (from a prior feature), so no test-tooling setup task is needed.

## Tasks

- [x] 1. Generate the place dataset
  - Create `scripts/generate-places.mjs`, mirroring the structure of `scripts/generate-geo-labels.mjs`: read the `all-the-cities` and `world-countries` devDependencies, filter cities to `population >= 500`, map countries to `{ kind: 'country', name, countryCode, lat, lng, population: 0 }` and cities to `{ kind: 'city', name, countryCode, lat, lng, population }`, and write the compact tuple-encoded `PlaceRecord`/`PlaceRecordKind` array plus the `countryNames: Record<string, string>` map (ISO alpha-2 -> country common name) to `src/data/places.ts`
  - Run the script to produce the committed `src/data/places.ts` file
  - _Requirements: 5.1_

- [x] 2. Implement the pure matching/ranking function
  - [x] 2.1 Create `src/app/utils/matchPlaces.ts` exporting `matchPlaces(candidates, query, limit = 10)`, performing case-insensitive substring matching on name and sorting by ascending match-index, then ascending name length, then descending population, then ascending name (alphabetical tiebreak), truncated to `limit`
    - _Requirements: 1.6, 5.4, 5.5_

  - [ ]* 2.2 Write unit tests for `matchPlaces`
    - Cover empty query, query with no matches, a candidate with no `detail`, and ties broken by population
    - _Requirements: 5.5_

  - [ ]* 2.3 Write property test for result truncation
    - **Property 4: Results are truncated to 10**
    - **Validates: Requirements 1.6**

  - [ ]* 2.4 Write property test for case-insensitive substring matching
    - **Property 5: Case-insensitive substring matching is inclusive**
    - **Validates: Requirements 5.5**

  - [ ]* 2.5 Write property test for relevance ordering
    - **Property 6: Results are ordered by relevance**
    - **Validates: Requirements 5.4**

- [x] 3. Implement the `PlaceLookupService` abstraction
  - [x] 3.1 Create `src/app/utils/placeLookupService.ts` exporting the `PlaceCandidate` and `PlaceLookupService` interfaces and `createLocalPlaceLookupService()`, which lazy-loads `src/data/places.ts` via a dynamic `import('../../data/places')` (memoized after first load), resolves each city's `countryCode` to a full name via `countryNames` to build `detail`, delegates matching/ranking to `matchPlaces`, and resolves with `[]` instead of throwing if the dynamic import rejects
    - _Requirements: 5.2, 5.3_

  - [ ]* 3.2 Write unit test for `createLocalPlaceLookupService`
    - Verify the dataset module is only loaded once across repeated `search()` calls (memoization), and that a failed dynamic import resolves with `[]` rather than rejecting
    - _Requirements: 5.2, 5.3_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement the debounce + stale-result controller
  - [x] 5.1 Create `src/app/utils/createSearchController.ts` exporting `SearchController` and `createSearchController(service, onResults, options)`: below `minLength` (default 2) invoke `onResults([], query)` synchronously with no service call, debounce service calls by `debounceMs` (default 200ms) of quiescence, tag each dispatched call with a monotonically increasing sequence number and discard results from any call that is not the most recently dispatched, catch `search()` rejections and forward `onResults([], query)`, and implement `dispose()` to cancel any pending debounce timer
    - _Requirements: 1.3, 6.1, 6.2_

  - [ ]* 5.2 Write property test for the minimum-length gate
    - **Property 1: Minimum-length gate**
    - **Validates: Requirements 1.3**

  - [ ]* 5.3 Write property test for debounce coalescing
    - **Property 2: Debounce coalesces rapid input**
    - **Validates: Requirements 6.1**

  - [ ]* 5.4 Write property test for stale-result discarding
    - **Property 3: Stale results are discarded**
    - **Validates: Requirements 6.2**

  - [ ]* 5.5 Write unit tests for controller edge cases
    - Cover `dispose()` called during an in-flight debounce timer producing no callback, and a rejected `search()` call surfacing as `onResults([], query)`
    - _Requirements: 6.1, 6.2_

- [x] 6. Implement the location fields reducer
  - [x] 6.1 Create `src/app/utils/locationFieldsReducer.ts` exporting `LocationFieldsState`, `LocationFieldsAction`, `locationFieldsReducer(state, action)` (handling `initializeCoords`, `selectPlace`, `editLocation`, `editLat`, `editLng`, `reset`), and `initialLocationFieldsState(initialLat?, initialLng?)`
    - _Requirements: 2.1, 2.2, 3.2, 3.3, 4.1, 4.2, 4.3_

  - [ ]* 6.2 Write property test for selection populating all three fields
    - **Property 7: Selecting a candidate populates all three fields, from any prior state**
    - **Validates: Requirements 2.1, 2.2, 4.3**

  - [ ]* 6.3 Write property test for manual edits winning after selection
    - **Property 8: Manual edits after selection always win**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 6.4 Write property test for initial-coordinates pre-fill
    - **Property 10: Opening with initial coordinates pre-fills lat/lng and leaves location empty**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 6.5 Write unit tests for reducer edge cases
    - Cover `reset` returning the empty state, and `initializeCoords` after a prior `selectPlace` not clearing `location`
    - _Requirements: 4.1, 4.2_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement the `PlaceSearchField` component
  - [x] 8.1 Create `src/app/components/PlaceSearchField.tsx` rendering a text `<input>` styled consistently with the dialog's other fields, feeding a `createSearchController` instance built from the `service` prop; render an absolutely-positioned dropdown (shown only while the query has at least 2 characters) listing up to 10 results with `name` and `detail`, or a "no matching place found" message when results are empty; support `ArrowUp`/`ArrowDown`/`Enter`/`Escape` keyboard navigation and mouse selection, calling `onSelect(candidate)`; call the controller's `dispose()` on unmount
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 6.1, 6.2_

  - [ ]* 8.2 Write unit tests for `PlaceSearchField` structural behavior
    - Render with `react-dom/client` and verify the search input is present, a rendered result item's text includes both `name` and `detail`, and the "no matching place found" message appears when the service returns zero results for a non-trivial query
    - _Requirements: 1.1, 1.4, 1.5_

- [x] 9. Wire the reducer and `PlaceSearchField` into `AddMemoryDialog.tsx`
  - [x] 9.1 Replace the `location`/`lat`/`lng` `useState`s with `useReducer(locationFieldsReducer, initialLocationFieldsState(initialLat, initialLng))`; replace the `useEffect` that pushes `initialLat`/`initialLng` into state with a `dispatch({ type: 'initializeCoords', lat: initialLat, lng: initialLng })` call under the same trigger condition; render `PlaceSearchField` (dispatching `selectPlace` on `onSelect`, defaulting its `service` prop to `createLocalPlaceLookupService()`) alongside a manual-entry `<input>` bound to `state.location` dispatching `editLocation`; bind the latitude/longitude `<input>`s to `state.lat`/`state.lng` dispatching `editLat`/`editLng`; update `handleSubmit`'s existing guard and the reset-on-submit logic to read from/dispatch against reducer state instead of the removed `useState`s
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.2_

  - [ ]* 9.2 Write property test for submission gating
    - **Property 9: Submission is gated on all required fields being non-empty**
    - **Validates: Requirements 2.4, 3.4**

  - [ ]* 9.3 Write unit test for the real submit guard end-to-end
    - Render `AddMemoryDialog` with `react-dom/client`, exercise the case of a selected place with the date field left empty, and confirm `onAdd` is not called until every required field is filled
    - _Requirements: 2.4, 3.4_

- [x] 10. Final checkpoint - Ensure all tests pass and the app builds
  - Run the full test suite
  - Run `npm run build` and confirm it completes without errors
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; core implementation tasks (1, 2.1, 3.1, 5.1, 6.1, 8.1, 9.1) are required.
- Each task references specific requirements for traceability.
- Checkpoints ensure incremental validation; the final checkpoint also verifies the production build still passes.
- Property tests validate the ten universal correctness properties from `design.md`.
- Unit tests validate specific examples, edge cases, and structural/rendering checks that don't vary meaningfully with input.
- `all-the-cities` and `world-countries` are already devDependencies (added by a prior feature) and are only consumed by the dev-time generation script, never shipped to the browser bundle.
