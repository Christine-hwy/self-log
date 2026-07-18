# Implementation Plan: globe-full-geo-labels-lod

## Overview

Add `world-countries` and `all-the-cities` as devDependencies, write a dev-time generation script that projects them into a small static `src/data/geoLabels.ts` file, extract a pure altitude-based visibility selector into its own testable module, wire `GlobeView.tsx` to filter labels through that selector before passing them to `htmlElementsData`, and verify with property + unit tests plus a full `npm run build`.

## Tasks

- [ ] 1. Add geo-database devDependencies and generate the static dataset
  - Add `world-countries` (exact version `5.1.0`) and `all-the-cities` (exact version `3.1.0`) to `package.json` `devDependencies`, then run install
  - Create `scripts/generate-geo-labels.mjs`: filter `world-countries` records to `independent === true` and map to `{ kind: 'country', name: name.common, lat: latlng[0], lng: latlng[1] }`; classify `all-the-cities` records by population into `tier1` (>= 5,000,000), `tier2` (>= 1,000,000), `tier3` (>= 300,000), discarding records below 300,000 and any record missing `population` or `loc.coordinates`; map qualifying city records to `{ kind: 'city', name, lat: loc.coordinates[1], lng: loc.coordinates[0], population, tier }`
  - Run the script to generate `src/data/geoLabels.ts` exporting the `GeoLabel`/`GeoLabelKind`/`CityTier` types and the combined `geoLabels: GeoLabel[]` array
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 1.2 Write unit tests for the generation script's mapping helpers
    - Extract the pure `tierForPopulation(population)` function and the country/city mapping functions into a small importable module (e.g. `scripts/geoLabelMapping.mjs`) so they can be unit- and property-tested without invoking file I/O
    - Test representative fixture records (a few countries, a few cities spanning each tier boundary) map to the expected output shape
    - _Requirements: 1.2, 1.3, 2.5_

  - [ ]* 1.3 Write property tests for country mapping and city tier classification
    - **Property 1: Country mapping is a faithful, complete projection**
    - **Validates: Requirements 1.1, 1.2, 1.3**
    - **Property 2: City population-to-tier classification is total and boundary-correct**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - **Property 3: City mapping preserves source fields**
    - **Validates: Requirements 2.5**
    - Use fast-check to generate randomized fixture-shaped country/city records (not the live npm package data) and random population floats/integers

- [ ] 2. Implement the pure altitude-based label visibility selector
  - Create `src/app/components/geoLabelVisibility.ts` exporting `CITY_TIER_ALTITUDE`, `COUNTRY_HIDE_ALTITUDE`, and `getVisibleGeoLabels(labels: GeoLabel[], altitude: number): GeoLabel[]` per the design (tier1 threshold 2.0, tier2 threshold 1.2, tier3 threshold 0.6, country hide threshold 0.6)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 5.1_

  - [ ]* 2.1 Write property test for monotonic nesting of the visible label set
    - **Property 4: Visible label set is a monotonically nested function of altitude**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 4.1, 4.2**

  - [ ]* 2.2 Write property test for exact filtering correctness
    - **Property 5: Filtering excludes exactly the non-visible entries**
    - **Validates: Requirements 5.1**

- [ ] 3. Checkpoint - Ensure generation and selector tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Wire `GlobeView.tsx` to the new dataset and selector
  - Replace the `import { worldLocations } from '../../data/worldLocations'` import with `import { geoLabels } from '../../data/geoLabels'` and `import { getVisibleGeoLabels } from './geoLabelVisibility'`
  - In the data-effect, replace the unconditional `worldLocations.map(...)` with a call to `getVisibleGeoLabels(geoLabels, altitude)` followed by mapping the filtered result into the `{ kind: 'geo-label', ..., text, size }` shape used by `htmlElementsData`, keeping `memoryBadgeEntries` construction and the `combinedHtmlEntries` concatenation pattern unchanged
  - Update the `.htmlElement()` factory's `'geo-label'` branch: rename the discriminant checks from `d.type === 'country'` to `d.kind === 'country'`, simplify the font-size/opacity logic to a single "always visible at full opacity/size when present" step (since entries are now pre-filtered by tier before reaching this call) while preserving the existing color values, font weights, `text-shadow`, and the `transition: opacity 0.3s ease` (and `font-size 0.3s ease`) declarations
  - Delete `src/data/worldLocations.ts` once no file references it
  - _Requirements: 3.5, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 4.1 Write property test that memory-badge entries are unaffected by geo-label filtering
    - **Property 6: Memory badge entries are unaffected by geo-label filtering**
    - **Validates: Requirements 5.2, 6.5**

  - [ ]* 4.2 Write unit tests for label element styling
    - Test that a country-kind entry produces the light-blue (`rgba(147, 197, 253, 0.9)`) 600-weight style and a city-kind entry produces the white/slate (`rgba(226, 232, 240, 0.8)`) 500-weight style, both including the existing `text-shadow` declaration and the `0.3s` opacity transition
    - _Requirements: 3.5, 6.1, 6.2, 6.3_

- [ ] 5. Final checkpoint - Full verification
  - Run the full test suite and `npm run build`, confirm no TypeScript/build errors and no remaining references to `worldLocations.ts`
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; core implementation tasks (1, 2, 4) are required.
- `world-countries` and `all-the-cities` are devDependencies only — they are consumed by the Node generation script, never imported into browser/runtime code, keeping the production bundle unaffected.
- The memory-badge rendering layer (`globeMarkerBadge.tsx`, `resolveCityIcon`, click/hover handlers) is explicitly out of scope and must not be modified.
