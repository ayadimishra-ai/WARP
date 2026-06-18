# Supplier Location Master - Requirements Document

## Epic: First Time User Experience — Empty State

### User Story: 1st Time User Experience Screen

**As a** first-time user with no supplier location data, **I want to** see a guided empty state screen, **So that** I understand how to get started with adding supplier locations.

#### Acceptance Criteria

- When no supplier locations exist, the empty state is displayed with clear calls to action.
- Two primary actions are visible:
  1. **Upload Data** (with dropdown options):
     - Bulk Upload Data
     - Download Template
  2. **Add New Supplier Location** (opens a form)
- Both actions are enabled and clickable.
- The empty state is replaced by the listing view once at least one supplier location is added.

---

### User Story: Download Template

**As a user,** I want to download a sample template, **So that** I can prepare my supplier location data for bulk upload in the correct format.

#### Acceptance Criteria

- Clicking "Download Template" triggers a file download of the sample template (`.xlsx` format).
- The template contains the following column headers:
  - SupplierCode
  - LocationName
  - LocationCode
  - LocationAddress
  - LocationCountry
  - LocationPinOrZipCode

---

### User Story: Bulk Upload Data

**As an** Organization Admin, **I want to** upload an Excel file containing supplier location data, **So that** I can add multiple supplier locations at once without manual entry.

#### Acceptance Criteria

- Clicking "Bulk Upload Data" opens a file upload dialog.
- Only `.xlsx` file format is accepted.
- A progress indicator is shown during file processing.
- On partial success (some rows have errors), the system displays a row-level error report.

#### Excel Column Specifications

| Column               | Mandatory | Validation Rules                                                                        |
| -------------------- | --------- | --------------------------------------------------------------------------------------- |
| SupplierCode         | Yes       | Alphanumeric with special characters (as per Supplier Specs)                            |
| LocationName         | Yes       | Must be unique                                                                          |
| LocationCode         | No        | Must be unique                                                                          |
| LocationAddress      | Yes       | Free-text field; no special characters except punctuation (`, . - / _`); max 2000 chars |
| LocationCountry      | Yes       | Alphabets only                                                                          |
| LocationPinOrZipCode | Yes       | Alphanumeric                                                                            |

#### Validations & Edge Cases

- If the uploaded file is empty (no data rows), display an error: "The uploaded file contains no data."
- If mandatory columns are missing, display an error listing all missing columns.
- If the file contains duplicate LocationName or LocationCode values, show validation errors for specific duplicate rows and return a failure file.

---

### User Story: Add New Supplier Location (Form)

**As an** Organization Admin, **I want to** click "Add New Supplier Location" and see a form panel on the right side, **So that** I can manually enter supplier location details.

#### Acceptance Criteria

- Clicking "Add New Supplier Location" opens a side panel form on the right side of the application.
- The form contains fields matching the bulk upload columns with the same validation rules.
- Mandatory fields are clearly marked with an asterisk (`*`).
- Form validates input on submission according to the column specifications above.

---

## Epic: Supplier Location Listing Management

### User Story: Listing Page Layout

**As a user,** I want to see all supplier locations in a paginated table, **So that** I can browse, search, and manage supplier location records.

#### Acceptance Criteria

##### Page Header

- Title: **"List of Supplier Locations"**
- Below the header, display total count of supplier location entries, e.g., `All (350)`.
- The count updates dynamically as entries are added or removed.

##### Table Column Headers

| #   | Column           |
| --- | ---------------- |
| 1   | SN               |
| 2   | Supplier Code    |
| 3   | Supplier Name    |
| 4   | Location Name    |
| 5   | Location Code    |
| 6   | Location Address |
| 7   | Country          |
| 8   | Pin/Zip Code     |
| 9   | Action           |

##### Action Buttons (Above Table, Right-Aligned)

- **ADD DATA** button with a dropdown containing three options:
  - Bulk Upload Data
  - Download Template
  - Add New Supplier Location Data (Form)

##### Header Buttons

- **Back** and **Next** navigation buttons are displayed.

---

### User Story: Search

**As a user,** I want to search across supplier location data, **So that** I can quickly find specific records.

#### Acceptance Criteria

- A search input is displayed above the table.
- Search filters across the following columns:
  - Supplier Code
  - Supplier Name
  - Location Name
  - Location Code
  - Location Address
  - Country
  - Pin/Zip Code

---

### User Story: Sorting

**As a user,** I want to sort columns in ascending or descending order, **So that** I can organize the listing by any column.

#### Acceptance Criteria

- All column headers support ascending and descending sort.
- Sort icons are displayed on each sortable column header.
- Only one column can be sorted at a time.

---

### User Story: Pagination

**As a user,** I want pagination controls at the bottom of the table, **So that** I can navigate through large datasets.

#### Acceptance Criteria

- Pagination controls are displayed at the bottom of the table.
- "Rows per page" selector is available.
- Current page range is displayed (e.g., `1-5 of 10`).

---

### User Story: Edit Supplier Location

**As a user,** I want to edit a supplier location record, **So that** I can update incorrect or outdated information.

#### Acceptance Criteria

- An edit icon is displayed in the Action column for each row.
- Clicking the edit icon opens the edit form (side panel).
- **If there is any mapped data against the supplier location, the edit option is disabled** for that particular record.

---

### User Story: Sticky Action Column

**As a user,** I want the Action column to remain visible while scrolling horizontally, **So that** I can always access edit actions regardless of how wide the table is.

#### Acceptance Criteria

- The Action column is frozen/sticky on the right side of the table.
- When horizontal scrolling occurs (due to many columns), the Action column remains fixed and does not scroll with the rest of the content.
- The sticky behavior does not break table alignment or cause visual artifacts.
