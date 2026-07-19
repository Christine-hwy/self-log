import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createSearchController } from '../utils/createSearchController';
import type { PlaceCandidate, PlaceLookupService } from '../utils/placeLookupService';

interface PlaceSearchFieldProps {
  onSelect: (candidate: PlaceCandidate) => void;
  service: PlaceLookupService;
}

// Must match `createSearchController`'s own default `minLength` (see the
// `{ debounceMs: 200, minLength: 2 }` options passed below) — used here only
// to decide whether the dropdown can be shown at all (Requirement 1.1/1.2),
// mirroring the controller's own gate rather than importing a shared magic
// number for two call sites.
const MIN_QUERY_LENGTH = 2;

/**
 * Search-as-you-type place lookup field for the Add Memory dialog
 * (design.md, "`PlaceSearchField` component"). Renders a plain text input
 * styled identically to the dialog's other fields, plus an
 * absolutely-positioned results dropdown driven by a `createSearchController`
 * instance built from the `service` prop.
 *
 * "Transient no-results flash" handling: alongside `results`, we track
 * `resultsForQuery` — the exact query string the currently-held `results`
 * array corresponds to (set inside the `onResults(results, query)` callback
 * passed to the controller). We only render the "No matching place found"
 * message when `resultsForQuery === query` (i.e. a search for *this exact*
 * query has actually completed and came back empty). While a debounced
 * search for the current query is still in flight, `resultsForQuery` still
 * points at an older query, so we simply keep showing whatever the previous
 * non-empty result list was (avoids dropdown flicker between keystrokes) and
 * suppress the empty-state message until we're sure it's not misleading. If
 * there's nothing to show yet (no cached non-empty results and no completed
 * search for the current query — e.g. right after typing the 2nd character),
 * the dropdown renders nothing at all rather than an empty box.
 */
export function PlaceSearchField({ onSelect, service }: PlaceSearchFieldProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceCandidate[]>([]);
  const [resultsForQuery, setResultsForQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // Escape dismisses the suggestion list without clearing what the user
  // typed (see handleKeyDown). Any subsequent edit to the query re-arms the
  // dropdown by clearing this flag.
  const [dismissed, setDismissed] = useState(false);

  // Stable across re-renders, but intentionally recreated if `service`
  // itself changes (dependency array below) — a fresh controller is built
  // against the new service rather than continuing to query the old one.
  const controller = useMemo(
    () =>
      createSearchController(
        service,
        (nextResults, resultsQuery) => {
          setResults(nextResults);
          setResultsForQuery(resultsQuery);
          setHighlightedIndex(-1);
        },
        { debounceMs: 200, minLength: MIN_QUERY_LENGTH }
      ),
    [service]
  );

  // Disposes the current controller both when `service` changes (a new
  // controller replaces it) and when the component unmounts, so no pending
  // debounce timer ever calls back into an unmounted/stale component.
  useEffect(() => {
    return () => {
      controller.dispose();
    };
  }, [controller]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value);
    setDismissed(false);
    controller.setQuery(value);
  }

  function handleSelect(candidate: PlaceCandidate) {
    onSelect(candidate);
    // Clear local query/results state and hide the dropdown (task 8.1, item
    // 8). The parent dialog is responsible for actually writing the
    // candidate's name/coordinates into its own location state via
    // `onSelect` — this component only resets its own search UI.
    setQuery('');
    setDismissed(false);
    setHighlightedIndex(-1);
    // Cancels any pending debounce timer from before the selection and
    // synchronously resets `results`/`resultsForQuery` to the empty query's
    // state (below `MIN_QUERY_LENGTH`, so `onResults([], '')` fires
    // synchronously) — without this, a timer already in flight when the
    // user picks a result could still resolve afterwards and repopulate
    // `results` for a query that's no longer displayed.
    controller.setQuery('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
        if (results.length === 0) return;
        event.preventDefault();
        // Wraps from the last item back to the first.
        setHighlightedIndex((current) => (current + 1) % results.length);
        break;
      case 'ArrowUp':
        if (results.length === 0) return;
        event.preventDefault();
        // Wraps from the first item (or "no selection") back to the last.
        setHighlightedIndex((current) => (current - 1 + results.length) % results.length);
        break;
      case 'Enter':
        // Only intercepts Enter when a suggestion is actually highlighted;
        // otherwise Enter is left alone (e.g. to allow normal form
        // submission when the user typed a value without picking a
        // suggestion).
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          event.preventDefault();
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        // Dismisses the suggestion list only — deliberately does not clear
        // `query`, so the text the user typed stays in the input.
        if (!dismissed) {
          event.preventDefault();
          setDismissed(true);
          setHighlightedIndex(-1);
        }
        break;
      default:
        break;
    }
  }

  const hasSearchedCurrentQuery = resultsForQuery === query;
  const hasContentToShow = results.length > 0 || hasSearchedCurrentQuery;
  const showDropdown = query.length >= MIN_QUERY_LENGTH && !dismissed && hasContentToShow;

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search for a place..."
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
      />

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-lg shadow-black/20 backdrop-blur-xl">
          {results.length > 0 ? (
            results.map((candidate, index) => (
              <div
                key={candidate.id}
                onMouseDown={(event) => {
                  // onMouseDown (not onClick) so selection registers before
                  // any blur-driven dropdown-close logic could run first.
                  event.preventDefault();
                  handleSelect(candidate);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  index === highlightedIndex ? 'bg-violet-500/20' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="text-white text-sm">{candidate.name}</div>
                <div className="text-xs text-slate-400">{candidate.detail}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-400">No matching place found</div>
          )}
        </div>
      )}
    </div>
  );
}
