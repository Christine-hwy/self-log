# Requirements Document

## Introduction

Today, the Add Memory dialog requires a user to manually type a free-text location name and manually type latitude/longitude numbers by hand. This is error-prone and requires the user to already know a place's exact coordinates. This feature adds a search-as-you-type place lookup to the Add Memory dialog so a user can search for a real-world place by name (city, town, or smaller locality, not just major cities), select a matching result, and have the location name and coordinates filled in automatically. The dataset backing this search must be rich enough to cover more than just major world cities. During development, this dataset is stored and searched locally; the lookup mechanism must be structured so the underlying data source can later be replaced with a real database or external API without reworking the dialog's UI or interaction logic. Manual entry of location name and coordinates must remain available, including the existing flow where a memory is started by clicking a point on the globe (pre-filling coordinates via `initialLat`/`initialLng`).

## Glossary

- **Add_Memory_Dialog**: The dialog component (`AddMemoryDialog.tsx`) presented to the user for creating a new travel memory, including its location, date, description, and media fields.
- **Place_Lookup_Service**: The abstraction that accepts a search query string and returns a list of matching Place_Candidates. Its internal data source (local dataset today, external database/API in the future) is an implementation detail hidden behind this abstraction.
- **Place_Candidate**: A single searchable place record with, at minimum, a display name and a coordinate pair (latitude and longitude).
- **Place_Dataset**: The underlying collection of place records that the Place_Lookup_Service searches against during local development.
- **Search_Query**: The text a user has typed into the place search input.
- **Search_Results**: The ordered list of Place_Candidates returned by the Place_Lookup_Service for a given Search_Query.
- **Selected_Place**: The Place_Candidate a user has chosen from Search_Results.
- **Manual_Location_Fields**: The location name text field and latitude/longitude numeric fields in the Add_Memory_Dialog that allow direct manual entry, independent of search.

## Requirements

### Requirement 1: Search for a place by name

**User Story:** As a user adding a memory, I want to search for a place by typing its name, so that I can find and select the correct location without knowing its coordinates.

#### Acceptance Criteria

1. THE Add_Memory_Dialog SHALL provide a place search input as part of the location entry step.
2. WHEN a user types into the place search input, THE Add_Memory_Dialog SHALL send the current Search_Query to the Place_Lookup_Service and display the returned Search_Results.
3. WHILE the Search_Query contains fewer than 2 characters, THE Add_Memory_Dialog SHALL NOT query the Place_Lookup_Service.
4. WHEN the Place_Lookup_Service returns Search_Results for the current Search_Query, THE Add_Memory_Dialog SHALL display, for each result, at least a place name and a distinguishing detail (such as region or country) sufficient to differentiate places that share the same name.
5. IF the Place_Lookup_Service returns zero Search_Results for a Search_Query, THEN THE Add_Memory_Dialog SHALL display a message indicating no matching place was found.
6. THE Search_Results list SHALL be limited to a maximum of 10 displayed results per Search_Query.

### Requirement 2: Select a search result to populate location details

**User Story:** As a user adding a memory, I want selecting a search result to fill in the location name and coordinates automatically, so that I don't have to manually determine or type coordinates.

#### Acceptance Criteria

1. WHEN a user selects a Place_Candidate from Search_Results, THE Add_Memory_Dialog SHALL set the Selected_Place and populate the location name field with the Selected_Place's display name.
2. WHEN a user selects a Place_Candidate from Search_Results, THE Add_Memory_Dialog SHALL populate the latitude and longitude fields with the Selected_Place's coordinates.
3. WHEN a user submits the Add_Memory_Dialog form after selecting a Place_Candidate without further edits, THE Add_Memory_Dialog SHALL create the memory using the Selected_Place's name and coordinates.
4. IF a user submits the Add_Memory_Dialog form after selecting a Place_Candidate while another required field of the Add_Memory_Dialog (such as the date) remains empty, THEN THE Add_Memory_Dialog SHALL prevent memory creation until every required field is filled.

### Requirement 3: Preserve manual entry of location details

**User Story:** As a user adding a memory, I want to still be able to manually type or adjust the location name and coordinates, so that I can record places that search doesn't find or fine-tune a selected result.

#### Acceptance Criteria

1. THE Add_Memory_Dialog SHALL provide Manual_Location_Fields that accept direct text and numeric entry independent of place search.
2. WHEN a user edits a Manual_Location_Field after selecting a Place_Candidate, THE Add_Memory_Dialog SHALL retain the edited value and use it on submission instead of the corresponding original Selected_Place value.
3. WHEN a user submits the Add_Memory_Dialog form, THE Add_Memory_Dialog SHALL create the memory using the current values of the Manual_Location_Fields, regardless of whether those values originated from manual entry or from a Selected_Place.
4. THE Add_Memory_Dialog SHALL require the location name, latitude, and longitude fields to be non-empty before allowing form submission.

### Requirement 4: Preserve pre-filled coordinates from the globe click flow

**User Story:** As a user who clicked a specific point on the globe to add a memory, I want that point's coordinates to still be pre-filled, so that the existing click-to-add flow keeps working alongside the new search feature.

#### Acceptance Criteria

1. WHEN the Add_Memory_Dialog is opened with `initialLat` and `initialLng` props provided, THE Add_Memory_Dialog SHALL populate the latitude and longitude fields with those values.
2. WHEN the Add_Memory_Dialog is opened with `initialLat` and `initialLng` props provided, THE Add_Memory_Dialog SHALL leave the place search input empty and allow the user to independently search for or manually enter a location name.
3. WHEN a user selects a Place_Candidate from Search_Results after the Add_Memory_Dialog was opened with `initialLat`/`initialLng` props, THE Add_Memory_Dialog SHALL overwrite the pre-filled latitude and longitude fields with the Selected_Place's coordinates.

### Requirement 5: Rich, swappable place dataset for local development

**User Story:** As the developer of this application, I want the local place dataset to cover far more than just major cities, and I want the search mechanism decoupled from that dataset, so that place search is useful worldwide today and can later be backed by a real database without rewriting the dialog.

#### Acceptance Criteria

1. THE Place_Dataset SHALL include place records for towns and localities beyond a major-city-only threshold, in addition to major cities and country-level entries.
2. THE Add_Memory_Dialog SHALL invoke place search exclusively through the Place_Lookup_Service abstraction, and SHALL NOT directly reference the Place_Dataset or its storage format.
3. WHERE the Place_Lookup_Service's underlying data source is replaced with a different implementation, THE Add_Memory_Dialog SHALL continue to function without modification, provided the replacement implementation conforms to the Place_Lookup_Service's query-in, Search_Results-out contract.
4. FOR ALL Search_Queries, THE Place_Lookup_Service SHALL return Search_Results ordered by relevance to the Search_Query.
5. THE Place_Lookup_Service SHALL match Place_Candidates whose name contains the Search_Query as a case-insensitive substring, at a minimum.

### Requirement 6: Place search performance

**User Story:** As a user typing into the place search input, I want results to appear quickly, so that the search feels responsive while I type.

#### Acceptance Criteria

1. WHEN a user types into the place search input, THE Add_Memory_Dialog SHALL debounce Place_Lookup_Service queries so that no more than one query is issued per 200 milliseconds of continuous typing.
2. WHEN a new Search_Query is issued before a prior query's Search_Results have been displayed, THE Add_Memory_Dialog SHALL discard the prior query's Search_Results and display only the Search_Results for the most recent Search_Query.
