// src/app/utils/locationFieldsReducer.ts
//
// Pure, framework-free state machine for the Add Memory dialog's location
// fields (location name, latitude, longitude). See design.md ("Location
// fields state machine") for the full contract.

import type { PlaceCandidate } from './matchPlaces';

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

const EMPTY_STATE: LocationFieldsState = { location: '', lat: '', lng: '' };

/**
 * Pure reducer for the three `Manual_Location_Fields` (`location`, `lat`,
 * `lng`). See design.md's "Location fields state machine" section for the
 * rationale behind consolidating these into a single reducer.
 *
 * - `initializeCoords`: sets `lat`/`lng` (formatted with `.toFixed(4)`, matching
 *   the pre-existing `AddMemoryDialog.tsx` convention for pre-filling
 *   coordinates from a globe click) and leaves `location` UNCHANGED
 *   (Requirement 4.1/4.2 — pre-filling coordinates must not touch the
 *   location name field, so a search or manual entry already in progress
 *   survives a later `initializeCoords` dispatch).
 * - `selectPlace`: unconditionally overwrites all three fields from the
 *   candidate, regardless of prior state (Requirement 2.1, 2.2, 4.3).
 *   `lat`/`lng` are set via plain `String(candidate.lat)` / `String(candidate.lng)`
 *   (NOT `.toFixed(4)`) to match design.md's Property 7 exactly
 *   (`lat === String(candidate.lat)`, `lng === String(candidate.lng)`) — a
 *   later property test asserts this exact format, so it must not be
 *   rounded/reformatted here.
 * - `editLocation`/`editLat`/`editLng`: set exactly one field to
 *   `action.value`, leaving the other two untouched. This is what the plain
 *   manual `<input>` fields dispatch on every keystroke (Requirement 3.2, 3.3).
 * - `reset`: returns the empty state (used after successful submission).
 */
export function locationFieldsReducer(
  state: LocationFieldsState,
  action: LocationFieldsAction
): LocationFieldsState {
  switch (action.type) {
    case 'initializeCoords':
      return {
        ...state,
        lat: action.lat.toFixed(4),
        lng: action.lng.toFixed(4)
      };

    case 'selectPlace':
      return {
        location: action.candidate.name,
        lat: String(action.candidate.lat),
        lng: String(action.candidate.lng)
      };

    case 'editLocation':
      return { ...state, location: action.value };

    case 'editLat':
      return { ...state, lat: action.value };

    case 'editLng':
      return { ...state, lng: action.value };

    case 'reset':
      return { ...EMPTY_STATE };

    default:
      return state;
  }
}

/**
 * Builds the initial `LocationFieldsState` for `AddMemoryDialog`.
 *
 * Matches the existing (pre-refactor) `AddMemoryDialog.tsx` behavior of
 * pre-filling `lat`/`lng` from the globe-click flow's `initialLat`/`initialLng`
 * props (formatted with `.toFixed(4)`) while leaving `location` empty
 * (Requirement 4.1/4.2).
 *
 * Edge case decision — only one of `initialLat`/`initialLng` provided:
 * the existing `AddMemoryDialog.tsx` `useEffect` sets `lat`/`lng`
 * independently (`if (initialLat !== undefined) setLat(...)`, and likewise
 * for `lng`, as two separate conditionals rather than one joint check), and
 * `AddMemoryDialogProps` declares them as two independent optional props
 * with no indication they're validated as a pair. To preserve that existing
 * behavior exactly, this function also treats them independently: whichever
 * of `initialLat`/`initialLng` is provided (non-`undefined`) is formatted
 * into the corresponding field, and whichever is omitted stays the empty
 * string, regardless of the other.
 *
 * If neither is provided, returns the same empty state as `reset`.
 */
export function initialLocationFieldsState(
  initialLat?: number,
  initialLng?: number
): LocationFieldsState {
  return {
    location: '',
    lat: initialLat !== undefined ? initialLat.toFixed(4) : '',
    lng: initialLng !== undefined ? initialLng.toFixed(4) : ''
  };
}
