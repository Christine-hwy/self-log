# Requirements Document

## Introduction

The 3D globe view currently displays a hand-picked subset of roughly 30 countries and 70 cities as text labels, and every label fades in/out together based on a single altitude threshold. This feature expands the geo-label dataset to cover all sovereign countries and a much larger, population-tiered set of cities sourced from real geo-database packages (`world-countries` and `all-the-cities`), and reworks the globe's label rendering so that city labels progressively reveal in three zoom-based tiers (Google-Maps style), country labels stay visible until the closest zoom tier (where they fade to avoid clutter), and the number of DOM label nodes rendered at any given time is filtered by the current zoom tier for performance, rather than keeping every label as an always-present, opacity-toggled DOM node.

## Glossary

- **Globe_View**: The `GlobeView` React component that renders the interactive 3D globe (`src/app/components/GlobeView.tsx`).
- **Geo_Label_Dataset**: The data module supplying country and city label entries (replacing/expanding `src/data/worldLocations.ts`), sourced from the `world-countries` and `all-the-cities` npm packages.
- **Country_Label**: A text label entry representing one of the sovereign countries recognized in the Geo_Label_Dataset.
- **City_Label**: A text label entry representing a populated place in the Geo_Label_Dataset, assigned to exactly one City_Tier.
- **City_Tier**: One of three population-based classifications assigned to a City_Label: Tier_1_World_Major, Tier_2_Major, or Tier_3_Mid_Size.
- **Camera_Altitude**: The current `altitude` value of the globe camera's point of view, as reported by the globe.gl controls, where smaller values represent a closer zoom.
- **Visible_Label_Set**: The set of Country_Label and City_Label entries that Globe_View passes into its HTML label rendering call for the current Camera_Altitude.
- **Memory_Badge_Layer**: The pre-existing, unrelated rendering layer showing the user's travel memory markers on Globe_View; out of scope for this feature.

## Requirements

### Requirement 1: Complete country coverage

**User Story:** As a globe viewer, I want to see the name of every sovereign country on the globe, so that no country is missing regardless of where I look.

#### Acceptance Criteria

1. THE Geo_Label_Dataset SHALL contain exactly one Country_Label entry for each sovereign country listed as `independent: true` in the `world-countries` package data.
2. THE Country_Label entries in the Geo_Label_Dataset SHALL each include a name, a latitude, and a longitude derived from the `world-countries` package's `latlng` field.
3. WHERE a sovereign country in the `world-countries` package data has multiple official names, THE Geo_Label_Dataset SHALL use the `name.common` value for that Country_Label's displayed text.

### Requirement 2: Tiered city coverage

**User Story:** As a globe viewer, I want many more cities available than today's ~70, organized by size, so that zooming in can progressively reveal more detail like Google Maps.

#### Acceptance Criteria

1. THE Geo_Label_Dataset SHALL contain City_Label entries sourced from the `all-the-cities` package, each assigned to exactly one City_Tier based on population.
2. THE Geo_Label_Dataset SHALL assign City_Label entries with population greater than or equal to 5,000,000 to Tier_1_World_Major.
3. THE Geo_Label_Dataset SHALL assign City_Label entries with population greater than or equal to 1,000,000 and less than 5,000,000 to Tier_2_Major.
4. THE Geo_Label_Dataset SHALL assign City_Label entries with population greater than or equal to 300,000 and less than 1,000,000 to Tier_3_Mid_Size.
5. THE City_Label entries in the Geo_Label_Dataset SHALL each include a name, a latitude, a longitude, and a population value derived from the `all-the-cities` package data.

### Requirement 3: Zoom-based progressive city reveal

**User Story:** As a globe viewer, I want cities to appear progressively as I zoom in, so that the globe feels uncluttered when zoomed out and detailed when zoomed in, similar to Google Maps.

#### Acceptance Criteria

1. WHILE Camera_Altitude is greater than or equal to 2.0, THE Globe_View SHALL exclude all City_Label entries from the Visible_Label_Set.
2. WHILE Camera_Altitude is less than 2.0 and greater than or equal to 1.2, THE Globe_View SHALL include only Tier_1_World_Major City_Label entries in the Visible_Label_Set.
3. WHILE Camera_Altitude is less than 1.2 and greater than or equal to 0.6, THE Globe_View SHALL include Tier_1_World_Major and Tier_2_Major City_Label entries in the Visible_Label_Set.
4. WHILE Camera_Altitude is less than 0.6, THE Globe_View SHALL include Tier_1_World_Major, Tier_2_Major, and Tier_3_Mid_Size City_Label entries in the Visible_Label_Set.
5. WHEN Camera_Altitude changes such that a City_Label enters the Visible_Label_Set, THE Globe_View SHALL transition that label's opacity using the same CSS transition duration used today (0.3s).

### Requirement 4: Country label de-emphasis at closest zoom

**User Story:** As a globe viewer, I want country names to step aside once I'm fully zoomed into city-level detail, so that dense city labels aren't cluttered by overlapping country names.

#### Acceptance Criteria

1. WHILE Camera_Altitude is greater than or equal to 0.6, THE Globe_View SHALL include all Country_Label entries in the Visible_Label_Set at full opacity.
2. WHILE Camera_Altitude is less than 0.6, THE Globe_View SHALL exclude all Country_Label entries from the Visible_Label_Set.

### Requirement 5: Rendering performance via filtered DOM nodes

**User Story:** As a globe viewer, I want the globe to stay smooth to rotate and drag even with a much larger label dataset, so that expanding coverage doesn't degrade the experience.

#### Acceptance Criteria

1. WHEN Globe_View computes the Visible_Label_Set for the current Camera_Altitude, THE Globe_View SHALL pass only the entries in the Visible_Label_Set into the HTML label rendering call, excluding entries not in the Visible_Label_Set from that call entirely.
2. THE Globe_View SHALL continue to render Memory_Badge_Layer entries in the same HTML label rendering call regardless of Camera_Altitude, unaffected by Visible_Label_Set filtering.

### Requirement 6: Preserved visual style and unrelated behavior

**User Story:** As a returning user, I want the labels to keep looking like they do today and the rest of the globe interactions to keep working, so that this change feels like a natural improvement rather than a redesign.

#### Acceptance Criteria

1. THE Globe_View SHALL render Country_Label text using the existing light-blue color (`rgba(147, 197, 253, 0.9)`) and 600 font weight.
2. THE Globe_View SHALL render City_Label text using the existing white/slate color (`rgba(226, 232, 240, 0.8)`) and 500 font weight.
3. THE Globe_View SHALL apply the existing `text-shadow` styling to Country_Label and City_Label elements for legibility against the globe texture.
4. THE Globe_View SHALL continue to pause automatic globe rotation when the pointer enters the globe container and resume it when the pointer leaves, unchanged from current behavior.
5. THE Globe_View SHALL continue to render, position, and handle click/hover interactions for Memory_Badge_Layer entries unchanged from current behavior.

## Notes for Design Phase

- Exact altitude thresholds above (2.0, 1.2, 0.6) are illustrative EARS-testable boundaries; the design may tune these values slightly during implementation for visual quality but must preserve the three-tier city reveal + country de-emphasis behavior.
- `world-countries` and `all-the-cities` are new npm dependencies to be added with pinned exact versions.
