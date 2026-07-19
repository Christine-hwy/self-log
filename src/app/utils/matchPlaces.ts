// src/app/utils/matchPlaces.ts
//
// Pure, framework-free matching/ranking function for place search.
// See design.md ("Pure matching/ranking function") for the full contract.

/**
 * The public shape returned to callers of `PlaceLookupService.search()`.
 * Deliberately omits `population`/`kind` — those are internal ranking
 * inputs specific to today's dataset, not part of the Place_Lookup_Service
 * contract (design.md, "Runtime types").
 */
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

/**
 * The shape `matchPlaces` actually operates on: a `PlaceCandidate` plus the
 * internal `population` ranking field.
 *
 * Design decision (option (a) from the task): rather than have `matchPlaces`
 * accept a loosely-shaped generic input, we define this slightly richer
 * local type that extends the public `PlaceCandidate` contract with the one
 * extra field needed for ranking. This keeps `matchPlaces` fully-typed and
 * directly testable with realistic candidate objects, while keeping
 * `population` out of the public `PlaceCandidate` interface entirely (per
 * design.md's "Runtime types" section). The caller responsible for the
 * public contract (`placeLookupService.ts`, a later task) is expected to
 * build `MatchableCandidate[]` from the raw dataset, call `matchPlaces`,
 * then strip `population` back off (a no-op given structural typing, since
 * `MatchableCandidate` is already assignable to `PlaceCandidate`) before
 * resolving `search()`.
 */
export interface MatchableCandidate extends PlaceCandidate {
  /** Internal ranking input, not part of the public `PlaceCandidate` contract. */
  population: number;
}

/**
 * Matches `candidates` against `query` (case-insensitive substring match on
 * `name`), ranks the matches by relevance, and truncates to `limit`.
 *
 * Ranking (design.md, Requirement 5.4):
 *   1. Ascending match-index of `query` within `name` (earlier match wins).
 *   2. Ascending `name` length (shorter name wins ties).
 *   3. Descending `population` (higher population wins remaining ties).
 *   4. Ascending `name` alphabetically (final deterministic tiebreak).
 *
 * Empty-query behavior: an empty (or whitespace-only) `query` is treated as
 * matching every candidate (index 0 for all, since every string "contains"
 * the empty string at position 0), so with an empty query candidates are
 * ordered purely by name length, then population, then alphabetically, and
 * truncated to `limit`. This is chosen over "match nothing" because it is
 * the mathematically consistent extension of "case-insensitive substring
 * match" to the empty string (every string contains "" as a substring at
 * index 0), it requires no special-casing in this function, and it keeps
 * `matchPlaces` a straightforward, total function over any input string.
 * The 2-character minimum that prevents an empty/short query from ever
 * reaching `matchPlaces` in practice is `createSearchController`'s
 * responsibility (a separate, later task), not this function's.
 *
 * @param candidates candidates to search, each carrying an internal `population` ranking field
 * @param query the search query (matched case-insensitively as a substring of `name`)
 * @param limit maximum number of results to return (default 10, Requirement 1.6)
 */
export function matchPlaces(
  candidates: MatchableCandidate[],
  query: string,
  limit = 10
): MatchableCandidate[] {
  const lowerQuery = query.toLowerCase();

  const matched: Array<{ candidate: MatchableCandidate; matchIndex: number }> = [];
  for (const candidate of candidates) {
    const matchIndex = candidate.name.toLowerCase().indexOf(lowerQuery);
    if (matchIndex !== -1) {
      matched.push({ candidate, matchIndex });
    }
  }

  matched.sort((a, b) => {
    if (a.matchIndex !== b.matchIndex) {
      return a.matchIndex - b.matchIndex;
    }
    const aName = a.candidate.name;
    const bName = b.candidate.name;
    if (aName.length !== bName.length) {
      return aName.length - bName.length;
    }
    if (a.candidate.population !== b.candidate.population) {
      return b.candidate.population - a.candidate.population;
    }
    return aName.localeCompare(bName);
  });

  return matched.slice(0, limit).map((m) => m.candidate);
}
