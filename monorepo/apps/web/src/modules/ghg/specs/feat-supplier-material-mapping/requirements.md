# Supplier Material Mapping - Requirements Document

## Epic: Adding New Mapping Row

### User Story: Add a New Supplier Material Mapping

**As a Supply Chain Admin,** I want to add a new row with a supplier, material, and dates, **So that** the system knows who is supplying what and for which period.

#### Acceptance Criteria

- When I click "ADD DATA", a new empty row appears in the list.
- I can fill in the start date, end date, supplier name, and material name.
- After filling all fields and clicking "SAVE", the record is saved successfully.
- A success message appears saying the mapping was saved.
- The total record count at the top increases by 1.

#### Validations

- If I click SAVE without selecting a supplier, I get an error saying "Please select a supplier."
- If I click SAVE without selecting a material, I get an error saying "Please select a material."
- If I leave all fields empty and click SAVE, nothing is saved and no blank row is added.
- If the same supplier, material, and date combination already exists, I get an error saying "This mapping already exists."

#### Edge Cases

- If I click ADD DATA very quickly multiple times, only one new row should appear, not many.
- If the mapping period crosses two years (e.g., Dec 2025 to Feb 2026), it should save without any errors.
- If a supplier has zero materials linked to them, the material dropdown should say "No materials available" and saving should be blocked.

> **Note on batch row creation:** The following edge cases describe a batch creation pattern where multiple empty rows can be added before saving. If the chosen UI framework (mantine-react-table inline editing) only supports one editable row at a time, these scenarios apply sequentially — the user adds and saves rows one by one. Empty rows that are cancelled (not saved) simply disappear.

- If I add a row but leave it empty and click ADD DATA again, the empty row should be discarded before a new one appears.
- If I am editing a row and it has an invalid date range, the error should appear on that row and I must fix or cancel before saving.

---

## Epic: Selecting Reporting Periods

### User Story: Select Start and End Date

**As a Supply Chain Admin,** I want to choose a start date and end date for each mapping, **So that** I know exactly when that supplier-material link is active.

#### Acceptance Criteria

- Clicking the "From" date field opens a calendar and I can pick any valid month & year.
- Clicking the "To" date field opens a calendar and I can pick any valid month & year.
- The selected dates show in a clear format like "Jan 2026".
- A small X button next to each date lets me clear it quickly.
- If I save and come back to the page, my dates are still showing correctly.

#### Validations

- If I leave both date fields empty and click SAVE, it shows "Please select a reporting period."
- If the "To" date is before the "From" date, it shows "End date must be after start date."

#### Edge Cases

- If the "From" date and "To" date are the same month, it should still be accepted as a valid one-month period.
- If I edit an already saved date, it should update the existing record and not create a new duplicate.
- If the date picker is opened on a small screen like a tablet, it should display properly without getting cut off.

---

## Epic: Searching and Selecting Suppliers

### User Story: Search for a Supplier in the Dropdown

**As a Supply Chain Admin,** I want to type in the supplier dropdown to filter the list, **So that** I can find the right supplier quickly without scrolling through hundreds of names.

#### Acceptance Criteria

- Clicking the supplier dropdown opens a list with a search box at the top.
- Typing any name or code filters the list and displays matching results.
- Clicking a supplier name selects it and closes the dropdown.

#### Validations

- If the supplier list fails to load from the server, it shows "Could not load suppliers. Please try again" instead of a blank dropdown.
- If the supplier API is slow and I click SAVE before it loads, it should not allow saving without a valid supplier selected.

#### Edge Cases

- Pressing the Escape key should close the dropdown without selecting anything.
- If there are 500+ suppliers and I search, the list should load fast without freezing the screen.

---

## Epic: Searching and Selecting Materials

### User Story: Search for a Material in the Dropdown

**As a Supply Chain Admin,** I want to select the materials dropdown to search for the code or name, **So that** I can pick the right material fast.

#### Acceptance Criteria

- Clicking the material field opens a dropdown.
- The selected material appears highlighted in blue.
- Selecting a material will fill in the cell.

#### Validations

- If a material has been deactivated in the system, it should not appear in the dropdown.
- If the material list fails to load, it shows a clear error message and not just a blank list.

#### Edge Cases

- If a material name is very long, it should shorten with "..." in the dropdown and show the full name when I hover over it.
- If I close the material dropdown without selecting anything (e.g., pressing Escape), the field should remain empty and the previous value (if any) should be retained.

---

## Epic: Editing Existing Mappings

### User Story: Edit an Existing Supplier-Material Mapping

**As a Supply Chain Admin,** I want to click edit on any row and change its details, **So that** I can fix mistakes or update information without deleting and recreating the record.

#### Acceptance Criteria

- Clicking the pencil icon on a row makes all its fields editable.
- I can change the supplier, material, or dates on that row.
- After making changes and clicking Save, the row goes back to read-only mode with the updated values.
- The total record count stays the same.

#### Validations

- If I edit a row and clear a required field, the system should not let me save until I fill it back in.
- If my edit creates a duplicate of another existing row, it should warn me and block saving.
- If someone else deletes the same record while I am editing it, I should see a message saying the record no longer exists when I try to save.

#### Edge Cases

- If I start editing a row and then try to leave the page, a popup should ask "You have unsaved changes. Are you sure you want to leave?"
- If the row I am editing is near the bottom of a long list, the page should scroll so I can still see what I am editing.
- If the internet disconnects while I am saving an edit, I should see an error and my changes should not be lost silently.

---

## Epic: Delete Mappings

### User Story: Delete a Supplier-Material Mapping

**As a Supply Chain Admin,** I want to delete a mapping I no longer need, **So that** the list stays clean and accurate.

#### Acceptance Criteria

- Clicking the delete icon on a row shows a confirmation message asking "Are you sure? This cannot be undone."
- After I confirm, the record is removed from the list.
- The total record count goes down by 1.
- A message appears saying "Mapping deleted successfully."

#### Validations

- If the mapping is being used in an active report or purchase order, deletion is blocked with a message saying "Cannot delete - this mapping is currently in use."
- If deletion fails because of a server error, the record stays in the list and shows "Delete failed. Please try again."
- Clicking the delete icon should never delete immediately - it must always ask for confirmation first.

---

## General Validations

- All form fields must have associated labels, all buttons must have aria-labels, and all tables must be accessible to screen readers to ensure compliance with accessibility standards.
- Role-based access controls must be enforced so that only authorized roles such as Supply Chain Admin can add, edit, or delete mappings, while view-only roles should see action buttons in a disabled state.
- All table views should display a skeleton loader or spinner while data is being fetched from the backend to provide a smooth loading experience.
- If any dropdown in the application fails to load its options due to an API error, the system should display an error message stating "Failed to load options. Please refresh." rather than showing an empty or broken dropdown.
- The inline editing pattern (editable rows within a table) must handle concurrent edits gracefully - only one row should be editable at a time unless explicitly designed for batch editing.
- The total record count badge at the top of the listing must always reflect the current state accurately after any add, edit, or delete operation.
