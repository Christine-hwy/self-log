// src/app/utils/createSearchController.ts
//
// The debounce + stale-result controller (design.md, "Debounce + stale-result
// controller"). `PlaceSearchField` feeds every keystroke into `setQuery`; this
// module is the only place responsible for deciding *when* (and whether) that
// turns into an actual `PlaceLookupService.search()` call, and for making
// sure only the most recently dispatched call's results ever reach
// `onResults`. It is framework-free (no React) so it can be property-tested
// directly with fake timers.

import type { PlaceCandidate, PlaceLookupService } from './placeLookupService';

export interface SearchController {
  /** Called on every keystroke with the raw current input value. */
  setQuery(query: string): void;
  dispose(): void;
}

export interface CreateSearchControllerOptions {
  /** Milliseconds of quiescence before a dispatched service call fires. Default 200. */
  debounceMs?: number;
  /** Minimum query length required before any service call is dispatched. Default 2. */
  minLength?: number;
}

export function createSearchController(
  service: PlaceLookupService,
  onResults: (results: PlaceCandidate[], query: string) => void,
  options?: CreateSearchControllerOptions
): SearchController {
  const debounceMs = options?.debounceMs ?? 200;
  const minLength = options?.minLength ?? 2;

  // Monotonically increasing sequence number identifying the most recently
  // *dispatched* service call (design.md, Property 3). Bumped both when a
  // debounced call actually fires and when a below-minLength query
  // supersedes any earlier in-flight call — either way, it marks the point
  // at which older in-flight work becomes stale.
  let seq = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  function clearPendingTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function setQuery(query: string): void {
    // Every call to setQuery supersedes whatever debounce timer was
    // previously pending, regardless of which branch below is taken.
    clearPendingTimer();

    if (query.length < minLength) {
      // Requirement 1.3: below the minimum length, respond synchronously
      // with no service call. Bumping `seq` here invalidates any
      // already-dispatched-but-not-yet-resolved call for a previous longer
      // query, so its eventual resolution (success or rejection) is
      // discarded as stale once it arrives (design.md's "short query
      // supersedes in-flight long-query search" edge case).
      seq += 1;
      if (!disposed) {
        onResults([], query);
      }
      return;
    }

    // Requirement 6.1: debounce — only dispatch after `debounceMs` of no
    // further setQuery calls. Each new setQuery call resets this timer via
    // the clearPendingTimer() call above.
    timer = setTimeout(() => {
      timer = null;
      const dispatchedSeq = ++seq;
      service.search(query).then(
        (results) => {
          // Requirement 6.2: only forward results from the most recently
          // dispatched call. This check is based on dispatch order, not
          // resolution order, so it stays correct even if an
          // earlier-dispatched call resolves after a later one.
          if (!disposed && dispatchedSeq === seq) {
            onResults(results, query);
          }
        },
        () => {
          // Rejection handling: forward an empty result set instead of
          // throwing or leaving the caller hanging, subject to the same
          // staleness check.
          if (!disposed && dispatchedSeq === seq) {
            onResults([], query);
          }
        }
      );
    }, debounceMs);
  }

  function dispose(): void {
    disposed = true;
    clearPendingTimer();
  }

  return { setQuery, dispose };
}
