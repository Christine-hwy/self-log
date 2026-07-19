// src/app/utils/placeLookupService.ts
//
// The `Place_Lookup_Service` abstraction (design.md, "Place_Lookup_Service
// abstraction"). `AddMemoryDialog` depends only on the `PlaceLookupService`
// interface below; `createLocalPlaceLookupService` is today's implementation,
// backed by the generated local dataset at `src/data/places.ts`. That dataset
// is loaded lazily via a dynamic `import()` (never a static import) so
// bundlers code-split it away from the main bundle (design.md, Architecture
// and Data Models) — this module is the *only* place that references it.

import { matchPlaces, type MatchableCandidate } from './matchPlaces';
import type { PlaceCandidate } from './matchPlaces';

export type { PlaceCandidate } from './matchPlaces';

export interface PlaceLookupService {
  /**
   * Resolves with Search_Results for `query`, already ranked by relevance and
   * truncated to at most 10 candidates. Implementations MUST be safe to call
   * repeatedly and concurrently (callers may issue overlapping calls).
   */
  search(query: string): Promise<PlaceCandidate[]>;
}

/**
 * Memoized promise for the transformed candidate list, shared across every
 * `search()` call on every `PlaceLookupService` instance returned by
 * `createLocalPlaceLookupService` (Requirement 5.2/5.3: repeated/concurrent
 * calls must not re-trigger the dynamic import or redo the tuple ->
 * candidate transformation). Overlapping calls made before the first load
 * resolves all share the same in-flight promise.
 */
let candidatesPromise: Promise<MatchableCandidate[]> | null = null;

function loadCandidates(): Promise<MatchableCandidate[]> {
  if (!candidatesPromise) {
    candidatesPromise = import('../../data/places')
      .then(({ placeRecords, countryNames }) =>
        placeRecords.map(
          ([kind, name, countryCode, lat, lng, population]): MatchableCandidate => ({
            id: `${kind}:${name}:${lat}:${lng}`,
            name,
            // A country-kind record's `name` already *is* the country name,
            // so using it again as its own "detail" would be redundant and
            // uninformative in the UI ("France" / "France"). City-kind
            // records get the resolved country name as their distinguishing
            // detail (design.md, "Data Models"). Falls back to the raw ISO
            // code if it's ever missing from `countryNames` (defensive only
            // — shouldn't happen with the generated dataset).
            detail: kind === 'country' ? '' : countryNames[countryCode] ?? countryCode,
            lat,
            lng,
            population,
          })
        )
      )
      .catch(() => {
        // Design.md, Error Handling: a failed dynamic import (e.g. a
        // simulated chunk-load failure) must degrade to "no results" rather
        // than throwing/rejecting out of `search()`. Reset the memoization
        // so a later call can retry the import instead of being permanently
        // stuck with an empty dataset for the lifetime of the page.
        candidatesPromise = null;
        return [];
      });
  }
  return candidatesPromise;
}

/** Today's implementation: backed by the generated local dataset. */
export function createLocalPlaceLookupService(): PlaceLookupService {
  return {
    async search(query: string): Promise<PlaceCandidate[]> {
      const candidates = await loadCandidates();
      // `MatchableCandidate` extends `PlaceCandidate` (matchPlaces.ts), so
      // the array `matchPlaces` returns is already structurally assignable
      // to `PlaceCandidate[]` — no explicit `population` stripping is
      // needed to satisfy the type-level `PlaceLookupService` contract.
      // `population` is simply not part of the `PlaceCandidate`/
      // `PlaceLookupService` *type*, so callers restricted to that type
      // (as `AddMemoryDialog`/`PlaceSearchField` are) never reference it,
      // matching design.md's intent that a future remote implementation
      // isn't obligated to expose it (Requirement 5.2/5.3).
      return matchPlaces(candidates, query);
    },
  };
}
