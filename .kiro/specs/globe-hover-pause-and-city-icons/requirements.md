# Requirements Document

## Introduction

This feature improves how visitors interact with the 3D travel globe on the app's main page (`GlobeView.tsx`, rendered by `App.tsx` as `Globe3D`). It covers two independent improvements:

1. **Rotation control**: The globe currently spins continuously via `globe.gl`'s `controls().autoRotate`. It should stop spinning while the pointer is over the globe, and resume spinning once the pointer moves away.
2. **Marker redesign**: Each travel memory is currently marked with an oversized purple point (`pointsData`) and a large purple text label (`labelsData`). These are replaced with a small, uniformly-styled icon badge drawn from the `lucide-react` icon library already installed in the project, with a per-city icon mapping (e.g. a landmark-style icon for Paris) and a generic landmark/building icon fallback for any city not in the mapping. Badges are visible at all zoom levels and match the app's dark slate / violet glassmorphism theme.

## Glossary

- **Globe_View**: The interactive 3D globe component (`GlobeView.tsx`) that displays Earth, Memory_Markers, and supports pointer-driven rotation and zoom. "The Globe_View bounds" refers to the rectangular on-screen area the component's container element occupies.
- **Auto_Rotation**: The continuous, automatic rotation of the Globe_View about its vertical axis, controlled via `controls().autoRotate`, that runs when no one is manually dragging it.
- **Pointer**: The visitor's mouse or trackpad cursor used to hover over and interact with the Globe_View.
- **Travel_Memory**: A single entry from the `memories` array (`TravelMemory` type) passed into Globe_View, with a `location` string and `lat`/`lng` coordinates.
- **Memory_Marker**: The visual indicator placed at a Travel_Memory's coordinates on the Globe_View, replacing the previous purple point and text label.
- **Marker_Badge**: The shared visual container (shape, size, border, background, shadow) rendered for every Memory_Marker, independent of which city it represents.
- **Landmark_Icon**: The specific icon glyph rendered inside a Marker_Badge to represent a Travel_Memory's location.
- **Icon_Mapping**: A predefined table associating a recognized city name with a specific Landmark_Icon drawn from the `lucide-react` icon set.
- **Default_Marker_Icon**: The Landmark_Icon shown inside a Marker_Badge when the Travel_Memory's location does not match any entry in the Icon_Mapping.
- **Geo_Label_Layer**: The existing, unrelated `htmlElementsData` layer driven by `worldLocations` that renders general country/city reference text. This layer has no association with Travel_Memory data and is out of scope for this feature.

## Requirements

### Requirement 1: Pause Auto-Rotation While Pointer Is Over the Globe

**User Story:** As a visitor viewing the travel journey globe, I want the globe to stop spinning while my pointer is over it and start again once my pointer moves away, so that I can comfortably read and click on markers without them drifting under my cursor.

#### Acceptance Criteria

1. WHILE the Pointer is outside the Globe_View bounds, THE Globe_View SHALL continue Auto_Rotation.
2. WHEN the Pointer enters the Globe_View bounds, THE Globe_View SHALL stop Auto_Rotation.
3. WHILE the Pointer remains within the Globe_View bounds, THE Globe_View SHALL keep Auto_Rotation stopped.
4. WHEN the Pointer leaves the Globe_View bounds, THE Globe_View SHALL resume Auto_Rotation.
5. THE Globe_View SHALL allow manual pointer-drag rotation regardless of the current Auto_Rotation state.

### Requirement 2: Replace Marker Point and Label with a Marker Badge

**User Story:** As a visitor viewing the travel journey globe, I want each marked location to show a small, tidy badge instead of a large purple dot and text label, so that the globe looks clean instead of cluttered.

#### Acceptance Criteria

1. THE Globe_View SHALL render each Travel_Memory as a Marker_Badge in place of the previous point-and-label rendering.
2. THE Globe_View SHALL render every Marker_Badge at the same fixed width and height as every other Marker_Badge.
3. THE Globe_View SHALL render each Marker_Badge within a bounding box no larger than 32 by 32 pixels at any zoom level.
4. THE Globe_View SHALL render a Marker_Badge for a Travel_Memory at any zoom level, without requiring the visitor to zoom in first.

### Requirement 3: Icon Reflects the Recognized City

**User Story:** As a visitor, I want recognizable cities such as Paris or Tokyo to show an icon that reflects that city, so that I can identify locations at a glance.

#### Acceptance Criteria

1. WHEN a Travel_Memory's location matches an entry in the Icon_Mapping, THE Globe_View SHALL display that entry's Landmark_Icon inside the Marker_Badge for that Travel_Memory.
2. IF a Travel_Memory's location does not match any entry in the Icon_Mapping, THEN THE Globe_View SHALL display the Default_Marker_Icon inside the Marker_Badge for that Travel_Memory.
3. THE Icon_Mapping SHALL match location names without regard to letter case.
4. THE Icon_Mapping SHALL match a location name whenever that location name contains a mapped city name as a substring (for example, "Paris, France" SHALL match the "Paris" entry).

### Requirement 4: Consistent Visual Style Across Marker Badges

**User Story:** As a visitor, I want every marker badge, including the fallback icon, to share the same visual style, so that the globe looks cohesive rather than mismatched.

#### Acceptance Criteria

1. THE Marker_Badge SHALL use a shared shape, size, border treatment, background, and shadow across every Travel_Memory, including Travel_Memories using the Default_Marker_Icon.
2. THE Landmark_Icon set, including the Default_Marker_Icon, SHALL render using a single shared color drawn from the application's existing violet accent palette.
3. THE Landmark_Icon set, including the Default_Marker_Icon, SHALL render at the same fixed icon size and stroke weight within the Marker_Badge.

### Requirement 5: Preserve Existing Marker Interactions

**User Story:** As a visitor, I want to still be able to preview and open memory details after the visual redesign, so that the redesign doesn't take away functionality I rely on.

#### Acceptance Criteria

1. WHEN a visitor clicks a Marker_Badge, THE Globe_View SHALL open the memory detail view for the corresponding Travel_Memory.
2. WHEN a visitor clicks a Marker_Badge, THE Globe_View SHALL animate the camera to center on that Travel_Memory's coordinates at an altitude of 1.5.
3. WHEN a visitor clicks a location on the Globe_View that does not correspond to any Marker_Badge, THE Globe_View SHALL invoke the existing add-memory callback with the clicked coordinates.
4. WHEN a new Travel_Memory is added, THE Globe_View SHALL render a corresponding Marker_Badge using the Icon_Mapping or the Default_Marker_Icon.
5. THE Globe_View SHALL leave the Geo_Label_Layer rendering behavior unchanged.
6. WHERE the Pointer hovers over a Marker_Badge, THE Globe_View SHALL display preview information for the corresponding Travel_Memory.
