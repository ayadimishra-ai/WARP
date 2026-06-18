# Supplier Material Mapping — OP Implementation Plan

## 1. Feature Overview

**Feature:** Supplier Material Mapping — CRUD with inline-editable listing
**Module:** OpsContainer (Operations/Admin)
**User Role:** Supply Chain Admin (OrganizationAdmin)
**Architecture:** React SPA container with iframe-embedded listing (Next.js embed page), Material-UI Drawer for add/edit form, `window.postMessage` for parent↔child communication. Follows the same pattern as Supplier Master and Product Master.

**Summary:** A Supply Chain Admin can view, add, edit, and delete supplier-material mappings. Each mapping links a supplier to a material with an active reporting period (start month/year → end month/year). The listing table supports inline row editing with searchable dropdowns for supplier and material, and month/year date pickers for the reporting period.

---

## 2. User Stories & Acceptance Criteria

### 2.1 Adding a New Mapping Row

**Story:** As a Supply Chain Admin, I want to add a new row with a supplier, material, and dates, so that the system knows who is supplying what and for which period.

#### Positive Scenarios
- Clicking **ADD DATA** inserts a new empty editable row at the top of the list.
- The row has fields: Start Date, End Date, Supplier Name, Material Name.
- After filling all fields and clicking **SAVE**, the record is persisted.
- A success message appears: *"Mapping saved successfully"*.
- The total record count badge at the top increases by 1.

#### Negative Scenarios
- Clicking **SAVE** without selecting a supplier → error: *"Please select a supplier"*.
- Clicking **SAVE** without selecting a material → error: *"Please select a material"*.
- All fields left empty and **SAVE** clicked → nothing saved, blank row removed.
- Duplicate (supplier + material + date combination) → error: *"This mapping already exists"*.

#### Edge Cases
- Rapid-clicking **ADD DATA** → only one new row appears (debounce/lock).
- Cross-year date range (e.g. Dec 2025 → Feb 2026) → saves without error.
- Supplier with zero linked materials → material dropdown shows *"No materials available"*, saving blocked.
- 10 rows added but only 3 filled → only the 3 filled rows save; 7 empty rows discarded on save.
- Multiple rows filled but one has invalid date range → only that row shows error; the rest save.

---

### 2.2 Selecting Reporting Periods

**Story:** As a Supply Chain Admin, I want to choose a start date and end date for each mapping, so that I know exactly when that supplier-material link is active.

#### Positive Scenarios
- Clicking the **From** date field opens a month/year calendar picker.
- Clicking the **To** date field opens a month/year calendar picker.
- Selected dates display in a clear format: `"Jan 2026"`.
- A small **×** button next to each date allows quick clearing.
- Saved dates persist correctly when the page is revisited.

#### Negative Scenarios
- Both date fields empty on **SAVE** → error: *"Please select a reporting period"*.
- To date before From date → error: *"End date must be after start date"*.

#### Edge Cases
- Same month for From and To → accepted as a valid single-month period.
- Editing an already-saved date → updates the existing record, no duplicate created.
- Date picker renders correctly on smaller screens / tablets without being clipped.

---

### 2.3 Searching and Selecting Suppliers

**Story:** As a Supply Chain Admin, I want to type in the supplier dropdown to filter the list, so that I can find the right supplier quickly without scrolling through hundreds of names.

#### Positive Scenarios
- Clicking the supplier dropdown opens a list with a search box at the top.
- Typing filters by name or code in real time.
- Clicking a supplier name selects it and closes the dropdown.

#### Negative Scenarios
- Supplier list fails to load → dropdown shows: *"Could not load suppliers. Please try again"*.
- Supplier API is slow and user clicks **SAVE** before data loads → saving blocked without a valid supplier.

#### Edge Cases
- Pressing **Escape** closes the dropdown without selecting.
- 500+ suppliers → search/filter remains responsive (no UI freeze).

---

### 2.4 Searching and Selecting Materials

**Story:** As a Supply Chain Admin, I want to select the materials dropdown to search by code or name, so that I can pick the right material quickly.

#### Positive Scenarios
- Clicking the material field opens a searchable dropdown.
- The currently selected material is highlighted in blue.
- Selecting a material fills the cell.

#### Negative Scenarios
- Deactivated materials do not appear in the dropdown.
- Material list fails to load → clear error message (not a blank list).

#### Edge Cases
- Material dropdown open in one row, clicking a different row → the open dropdown stays open.
- Very long material names truncated with `"..."` in dropdown; full name shown on hover via tooltip.

---

### 2.5 Editing Existing Mappings

**Story:** As a Supply Chain Admin, I want to click edit on any row and change its details, so that I can fix mistakes or update information without deleting and recreating the record.

#### Positive Scenarios
- Clicking the **pencil icon** makes all fields in that row editable.
- Supplier, material, and dates can be changed.
- Clicking **Save** returns the row to read-only mode with updated values.
- Total record count stays the same.

#### Negative Scenarios
- Clearing a required field during edit → saving blocked until filled.
- Edit creates a duplicate of another existing row → warning, save blocked.
- Another user deletes the same record during editing → on save: *"This record no longer exists"*.

#### Edge Cases
- Starting an edit and navigating away → popup: *"You have unsaved changes. Are you sure you want to leave?"*.
- Editing a row near the bottom of a long list → page keeps the row visible.
- Internet disconnects during save → error message; changes not lost silently.

---

### 2.6 Deleting Mappings

**Story:** As a Supply Chain Admin, I want to delete a mapping I no longer need, so that the list stays clean and accurate.

#### Positive Scenarios
- Clicking the **delete icon** shows confirmation: *"Are you sure? This cannot be undone"*.
- After confirming, the record is removed from the list.
- Total record count decreases by 1.
- Success message: *"Mapping deleted successfully"*.

#### Negative Scenarios
- Mapping in use in an active report or purchase order → deletion blocked: *"Cannot delete — this mapping is currently in use"*.
- Server error during delete → record stays: *"Delete failed. Please try again"*.
- Delete icon **never** deletes immediately — always confirms first.

---

## 3. Technical Architecture

### 3.1 Data Model (Hasura / PostgreSQL)

**Table:** `OrgSupplierMaterialMapping` (confirm existence in Hasura console or create migration)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `supplier_id` | UUID | FK → `OrgSupplierMaster.id` |
| `material_id` | UUID | FK → `OrgProductMaster.id` (or dedicated material table) |
| `start_date` | Date | Reporting period start (month/year precision, stored as 1st of month) |
| `end_date` | Date | Reporting period end (month/year precision, stored as 1st of month) |
| `organization_id` | UUID | Tenant isolation |
| `is_deleted` | Boolean | Soft delete flag, default `false` |
| `created_at` | Timestamptz | Auto |
| `updated_at` | Timestamptz | Auto |
| `created_by` | UUID | User who created |
| `updated_by` | UUID | User who last modified |

**Unique Constraint:** `(supplier_id, material_id, start_date, end_date, organization_id)` — prevents duplicate mappings.

**Relationships (Hasura):**
- `OrgSupplierMaterialMapping.supplier_id` → `OrgSupplierMaster.id` (object relationship: `Supplier`)
- `OrgSupplierMaterialMapping.material_id` → `OrgProductMaster.id` (object relationship: `Material`)

### 3.2 System Diagram

```
┌──────────────────────────────────────────────────────────┐
│  React SPA (below2_spanew)                               │
│                                                          │
│  OpsContainer/SupplierMaterialMapping.js                 │
│    ├─ <iframe> → embed/.../supplier-material-list        │
│    ├─ <Drawer> → <iframe> → embed/.../add-mapping        │
│    └─ window.postMessage ↕ communication                 │
│    ├─ popupAlert() for success / error / confirm         │
│    └─ BulkUploadSupplierMaterialMapping.js (if needed)   │
└──────────────────────────────────────────────────────────┘
         │ postMessage                        ▲
         ▼                                    │
┌──────────────────────────────────────────────────────────┐
│  Next.js OP Backend (snowkap_op_nextjs)                  │
│                                                          │
│  Embed Pages:                                            │
│    supplier-material-list/page.tsx                        │
│    add-supplier-material-mapping/page.tsx                 │
│                                                          │
│  API Routes:                                             │
│    /api/v1/master-data/supplier-material-mapping/         │
│      ├─ listing/route.ts       (GET)                     │
│      ├─ form/route.ts          (GET / POST / PUT)        │
│      ├─ delete/route.ts        (DELETE)                  │
│      └─ counts/route.ts        (GET)                     │
│                                                          │
│  Services:                                               │
│    lib/supplier-material-mapping/                        │
│      ├─ mapping-form.service.ts                          │
│      ├─ mapping.interface.ts                             │
│      └─ mapping.validation.ts                            │
└──────────────────────────────────────────────────────────┘
         │ Hasura GraphQL SDK
         ▼
┌──────────────────────────────────────────────────────────┐
│  PostgreSQL (via Hasura)                                 │
│    OrgSupplierMaterialMapping                            │
│    OrgSupplierMaster   (supplier dropdown lookup)        │
│    OrgProductMaster    (material dropdown lookup)        │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Key Technical Concepts (mirrors Product Master)

- **Next.js 15 App Router** with embed pages under `app/[organizationId]/embed/v1/[accessToken]/`
- **Hasura GraphQL** via server SDK (`getGraphQlServerSDK()`)
- **GraphQL Codegen** (`yarn codegen`) to regenerate `graphql/shared/types.ts` and `graphql/shared/sdk.ts`
- **Zod** schemas for form validation
- **react-hook-form** with `zodResolver` for the add/edit form
- **mantine-react-table** v2 (`useMantineReactTable`, `MRT_ColumnDef`, manual pagination/sorting/filtering)
- **Mantine Select / Combobox** for searchable supplier and material dropdowns
- **react-datepicker** for month/year date selection (already used in `DateRangeFilter`)
- **window.postMessage** for parent SPA ↔ embed page communication via `platform-window-message-service.ts`
- **ClickHouse** for audit logging
- **API guard chain:** `apiExceptionGuard(withRateLimit(apiAuthGuard(handler)))`
- **`isOrganizationAdmin()`** from `shared/constants/user-roles.constant.ts` for permission checks
- **`apiClientWithAuth`** from `lib/fetcher/index.ts` for client-side API calls
- **`popupAlert()`** from `src/UI/Popups/popup.js` for SPA-side alerts
- **Material-UI Drawer** (width: 400px, right-side, z-index: 1001) for form panel

---

## 4. Implementation Plan

### Phase 1: GraphQL Layer (Next.js OP Backend)

**GraphQL Queries to create:**

| File | Operation Name | Purpose |
|------|----------------|---------|
| `graphql/queries/get-supplier-material-mapping-list.gql` | `getSupplierMaterialMappingList` | Paginated listing with `$where`, `$order_by`, `$limit`, `$offset`; joins `Supplier { id, name, code }` and `Material { id, name, code }`; returns aggregate count |
| `graphql/queries/get-supplier-material-mapping-by-id.gql` | `getSupplierMaterialMappingById` | Fetch single mapping by `$id` + `$organizationId` |
| `graphql/queries/check-duplicate-supplier-material-mapping.gql` | `checkDuplicateMapping` | Check existing `(supplier_id, material_id, start_date, end_date, organization_id)` combo, with `$excludeId` (defaults to nil UUID) |
| `graphql/queries/get-suppliers-for-dropdown.gql` | `getSuppliersForDropdown` | All active suppliers for the org (`id, name, code`) where `is_deleted = false`, ordered by `name asc` |
| `graphql/queries/get-materials-for-dropdown.gql` | `getMaterialsForDropdown` | All active materials for the org (`id, name, code`) where `is_deleted = false`, ordered by `name asc` |

**GraphQL Mutations to create:**

| File | Operation Name | Purpose |
|------|----------------|---------|
| `graphql/mutations/insert-supplier-material-mapping.gql` | `insertSupplierMaterialMapping` | Insert one mapping via `insert_OrgSupplierMaterialMapping_one` |
| `graphql/mutations/update-supplier-material-mapping.gql` | `updateSupplierMaterialMapping` | Update one mapping via `update_OrgSupplierMaterialMapping_by_pk` |
| `graphql/mutations/soft-delete-supplier-material-mapping.gql` | `softDeleteSupplierMaterialMapping` | Set `is_deleted = true` via `update_OrgSupplierMaterialMapping_by_pk` |

After creating these, run `yarn codegen` to regenerate SDK types.

---

### Phase 2: Backend Services & API Routes (Next.js OP Backend)

**Interfaces:**

| File | Contents |
|------|----------|
| `lib/supplier-material-mapping/mapping.interface.ts` | `ISupplierMaterialMapping` (all table columns + joined supplier/material names), `ISupplierDropdownItem { id, name, code }`, `IMaterialDropdownItem { id, name, code }` |

**Validation Schema:**

| File | Contents |
|------|----------|
| `schemas/supplier-material-mapping.schema.ts` | Zod schema factory `SupplierMaterialMappingFormSchema(isEdit)` |

```typescript
// Schema shape:
z.object({
  id: isEdit ? z.string().uuid() : z.string().uuid().optional(),
  supplier_id: z.string().uuid("Please select a supplier"),
  material_id: z.string().uuid("Please select a material"),
  start_date: z.string().min(1, "Please select a reporting period"),
  end_date: z.string().min(1, "Please select a reporting period"),
}).refine(
  (data) => new Date(data.end_date) >= new Date(data.start_date),
  { message: "End date must be after start date", path: ["end_date"] }
);
```

**Validation Utility:**

| File | Contents |
|------|----------|
| `lib/supplier-material-mapping/mapping.validation.ts` | `validateMappingFormInput(data, isEdit)` — Zod safeParse returning `{ success, data, errors }` |

**Service Layer:**

| File | Function | Purpose |
|------|----------|---------|
| `lib/supplier-material-mapping/mapping-form.service.ts` | `GetMappingList(userSession, params)` | Paginated listing with search (supplier name, material name), sort, filter; builds Hasura `where` / `order_by`; default sort `created_at desc` |
| | `GetMappingById(id, organizationId)` | Single record fetch with joined supplier/material |
| | `CheckDuplicateMapping(supplierId, materialId, startDate, endDate, orgId, excludeId?)` | Uniqueness check; uses nil UUID default for `excludeId` |
| | `SaveMapping(data, userSession)` | Insert with duplicate check → `insertSupplierMaterialMapping` |
| | `UpdateMapping(data, userSession)` | Update with duplicate check → `updateSupplierMaterialMapping` |
| | `DeleteMapping(id, userSession)` | Soft delete with in-use check → `softDeleteSupplierMaterialMapping` |
| | `GetSuppliersForDropdown(organizationId)` | Active supplier list for dropdown |
| | `GetMaterialsForDropdown(organizationId)` | Active material list for dropdown |

**API Routes:**

| Route | Methods | Purpose |
|-------|---------|---------|
| `app/api/v1/master-data/supplier-material-mapping/listing/route.ts` | **GET** | Paginated list. Query params: `pageIndex`, `pageSize`, `search`, `sortBy`, `sortOrder` |
| `app/api/v1/master-data/supplier-material-mapping/form/route.ts` | **GET** | Fetch by `id`; or `action=suppliers` for supplier dropdown; or `action=materials` for material dropdown |
| | **POST** | Create new mapping (validate + duplicate check + insert) |
| | **PUT** | Update existing mapping (validate + duplicate check + update) |
| `app/api/v1/master-data/supplier-material-mapping/delete/route.ts` | **DELETE** | Soft delete by `id` (with in-use check). Query param: `id` |
| `app/api/v1/master-data/supplier-material-mapping/counts/route.ts` | **GET** | Total active mapping count for the org |
| `app/api/v1/master-data/supplier-material-mapping/template/route.ts` | **GET** | Returns a signed S3 URL for downloading the bulk upload Excel template |

All routes wrapped with: `apiExceptionGuard(withRateLimit(apiAuthGuard(handler)))`.

---

### Phase 3: Embed Pages & UI Components (Next.js OP Backend)

**Listing Table Component:**

| File | Details |
|------|---------|
| `components/supplier-material-mapping/supplierMaterialMappingListingTable.tsx` | `"use client"` component using `mantine-react-table` v2 |

**Table Columns (`MRT_ColumnDef<SupplierMaterialMappingRow>[]`):**

| # | Column | Source | Sortable | Editable | Notes |
|---|--------|--------|----------|----------|-------|
| 1 | SN | Row index | No | No | Auto-numbered |
| 2 | Supplier Name | `Supplier.name` (join) | Yes | Yes | Searchable Mantine `Select` / `Combobox` in edit mode |
| 3 | Material Name | `Material.name` (join) | Yes | Yes | Searchable Mantine `Select` / `Combobox` in edit mode |
| 4 | From Date | `start_date` | Yes | Yes | Month/Year picker (`react-datepicker` with `showMonthYearPicker`), display `"MMM YYYY"` |
| 5 | To Date | `end_date` | Yes | Yes | Month/Year picker, display `"MMM YYYY"`, clear (×) button |
| 6 | Created On | `created_at` | Yes | No | Read-only, formatted date |
| 7 | Actions | — | No | — | Edit (pencil) / Delete (trash) / Save (✓) / Cancel (✕) icons |

**Top Toolbar:** Title + badge count (total records) + global search input + **ADD DATA** button.
**Bottom Toolbar:** `MRT_TablePagination` + record range text (`"Showing 1-10 of 50"`).

**Inline Edit Behavior:**
1. **ADD DATA** → inserts an editable row at top with empty fields + Save/Cancel icons.
2. **Pencil icon** on existing row → switches that row to edit mode.
3. **Save (✓)** → validates → API call (POST or PUT) → on success: row becomes read-only, refresh data.
4. **Cancel (✕)** → discards changes, reverts to read-only (or removes new empty row).
5. Only one row editable at a time; clicking Edit on another row cancels the current edit.

**Searchable Dropdown (Supplier/Material) Behavior:**
- Mantine `Combobox` with `TextInput` for search.
- Fetched from `/api/v1/master-data/supplier-material-mapping/form?action=suppliers` or `?action=materials`.
- `useDebouncedValue(searchTerm, 300)` for API filtering (or client-side filter if list is small).
- Long names truncated with `textOverflow: "ellipsis"` + tooltip on hover.
- Error state: *"Could not load suppliers/materials. Please try again"*.
- Escape key closes without selection.

**Date Picker Behavior:**
- `react-datepicker` with `showMonthYearPicker`, `dateFormat="MMM yyyy"`.
- Clear button (×) via `isClearable` prop.
- No day-level selection — month/year only.

**Empty State Component:**

| File | Details |
|------|---------|
| `components/supplier-material-mapping/supplierMaterialMappingEmptyState.tsx` | Illustration + "Add Your First Supplier-Material Mapping" title + **ADD DATA** primary button |

**Add/Edit Form Component (Drawer-based):**

| File | Details |
|------|---------|
| `components/supplier-material-mapping/addSupplierMaterialMappingForm.tsx` | `"use client"`, `react-hook-form` + `zodResolver(SupplierMaterialMappingFormSchema)` |

**Form Fields:**
1. **Supplier** — Searchable `Select` (required). Fetches from `?action=suppliers`.
2. **Material** — Searchable `Select` (required). Fetches from `?action=materials`. Shows *"No materials available"* if empty.
3. **From Date** — `react-datepicker` month/year picker (required).
4. **To Date** — `react-datepicker` month/year picker (required). Must be ≥ From Date.

**Form Behavior:**
- Edit mode: reads `searchParams.get("id")`, fetches via `GET /form?id=...`, populates fields.
- On submit: validates → POST or PUT → `postParentMessage(supplierMaterialMappingFormSubmitted(false/true))`.
- Listens for `window.message === "clearForm"` to reset.
- Cancel sends `supplierMaterialMappingFormSubmitted(false)` + resets form.

**Embed Pages:**

| File | Renders |
|------|---------|
| `app/[organizationId]/embed/v1/[accessToken]/supplier-material-list/page.tsx` | `<SupplierMaterialMappingListingTable />` |
| `app/[organizationId]/embed/v1/[accessToken]/add-supplier-material-mapping/page.tsx` | `<Stack><AddSupplierMaterialMappingForm /></Stack>` |

---

### Phase 4: React SPA Integration (below2_spanew)

**New Container Page:**

| File | Details |
|------|---------|
| `src/containers/OpsContainer/SupplierMaterialMapping.js` | Class component, mirrors `SupplierMasterListing.js` pattern |

**Component Structure (mirrors SupplierMasterListing.js / ManageProductMaster.js):**

```javascript
class SupplierMaterialMapping extends Component {
  state = {
    jwtToken: "",
    organizationId: "",
    isOpen: false,        // Drawer open/close
    mappingId: "",        // For edit mode
    sidebarLoader: false,
  };

  componentDidMount() {
    // 1. Decode opsToken → extract organizationId
    // 2. Set up window message listener (newHandle)
  }

  newHandle = () => {
    window.addEventListener("message", async (event) => {
      const messageData = JSON.parse(event.data);
      switch (messageData.type) {
        case "add-edit-supplier-material-mapping":
          this.setState({
            isOpen: messageData.data.openDrawer,
            mappingId: messageData.data.mappingId || "",
          });
          break;
        case "supplier-material-mapping-form-submitted":
          this.setState({ isOpen: false, mappingId: "" });
          if (!messageData.isFailed) {
            popupAlert("success", "Success", "Mapping saved successfully");
          }
          // Refresh listing iframe
          this.listingIframe.contentWindow.postMessage("callApi", "*");
          break;
        case "delete-supplier-material-mapping":
          // Show popupAlert("deleteConfirmWarpPopup", ...) → on confirm, call delete API
          break;
      }
    });
  };

  render() {
    return (
      <div>
        {/* Main listing iframe */}
        <iframe
          ref={ref => this.listingIframe = ref}
          src={`${GetGHGEstimationUrl()}${this.state.organizationId}/embed/v1/${opsToken}/supplier-material-list`}
          style={{ width: "100%", height: "100vh", border: "none" }}
        />

        {/* Drawer for add/edit form */}
        <Drawer anchor="right" open={this.state.isOpen} classes={...}>
          <IconButton onClick={() => this.setState({ isOpen: false })}>
            <ChevronLeftIcon />
          </IconButton>
          <iframe
            src={`${GetGHGEstimationUrl()}${this.state.organizationId}/embed/v1/${opsToken}/add-supplier-material-mapping${this.state.mappingId ? `?id=${this.state.mappingId}` : ""}`}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </Drawer>
      </div>
    );
  }
}
```

**Window Message Types to add in Next.js `shared/services/platform-window-message-service.ts`:**

```typescript
export const addEditSupplierMaterialMapping = (
  openDrawer: boolean,
  mappingId: string
) =>
  JSON.stringify({
    type: "add-edit-supplier-material-mapping",
    data: { openDrawer, mappingId },
  });

export const supplierMaterialMappingFormSubmitted = (isFailed: boolean) =>
  JSON.stringify({
    type: "supplier-material-mapping-form-submitted",
    isFailed,
  });
```

**Message Constants to add in `src/ops/message-constant.js`:**

```javascript
export const MESSAGE_ADD_EDIT_SUPPLIER_MATERIAL_MAPPING = "add-edit-supplier-material-mapping";
export const MESSAGE_SUPPLIER_MATERIAL_MAPPING_SUBMITTED = "supplier-material-mapping-form-submitted";
```

**Route in `src/App.js`:**

```jsx
<OPPrivateRoute
  path="/supplier-material-mapping"
  component={SupplierMaterialMapping}
/>
```

---

### Phase 5: Delete Flow (Detail)

The delete action requires confirmation and server-side validation:

1. **Listing table** → user clicks trash icon → `postParentMessage` with type `"delete-supplier-material-mapping"` and `mappingId`.
2. **SPA container** receives message → calls `popupAlert("deleteConfirmWarpPopup", "Delete Mapping", "Are you sure? This cannot be undone", onConfirm, "Cancel", "Delete")`.
3. **On confirm** → SPA calls `DELETE /api/v1/master-data/supplier-material-mapping/delete?id={mappingId}` (via fetch or `apiClientWithAuth`).
4. **Server** checks if mapping is in use (active report / PO reference) → if in use, returns 409 with message *"Cannot delete — this mapping is currently in use"*.
5. **Server** performs soft delete (`is_deleted = true`) → returns 200.
6. **SPA** shows success popup → refreshes listing iframe via `postMessage("callApi")`.

---

### Phase 6: Audit Logging

Append to `lib/auditlog/auditlog.service.ts`:

```typescript
export async function saveOrgSupplierMaterialMapping(
  data: any[],
  userSession: any
) {
  // Insert to ClickHouse: snowkap_op_logs.OrgSupplierMaterialMapping
  // Fields: id, supplier_id, material_id, start_date, end_date,
  //         organization_id, is_deleted, created_at, updated_at,
  //         created_by, updated_by
}
```

Call this after every successful insert, update, or soft-delete.

---

## 5. Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| `supplier_id` | Required (valid UUID) | "Please select a supplier" |
| `material_id` | Required (valid UUID) | "Please select a material" |
| `start_date` | Required | "Please select a reporting period" |
| `end_date` | Required | "Please select a reporting period" |
| `end_date` ≥ `start_date` | Date comparison | "End date must be after start date" |
| Unique combo | DB uniqueness check | "This mapping already exists" |
| In-use check (delete) | FK / report reference check | "Cannot delete — this mapping is currently in use" |
| Empty rows on save | Client-side filter | Silently removed, not saved |

---

## 6. UI/UX Specifications

### Inline Edit Mode
- Only **one row** can be in edit mode at a time.
- Editable row shows: Supplier `Select`, Material `Select`, From `DatePicker`, To `DatePicker`, **Save ✓** + **Cancel ✕** icons.
- Read-only row shows: text values + **Edit ✎** + **Delete 🗑** icons.
- New row (ADD DATA) inserts at top; if user cancels, row is removed.

### Delete Confirmation Dialog
- Uses `popupAlert("deleteConfirmWarpPopup", ...)` from SPA.
- Title: *"Delete Mapping"*
- Message: *"Are you sure? This cannot be undone"*
- Buttons: **Cancel** (secondary) | **Delete** (danger/red)
- Never auto-deletes without confirmation.

### Unsaved Changes Guard
- `window.addEventListener("beforeunload", ...)` when a row is in edit mode.
- Prompt: *"You have unsaved changes. Are you sure you want to leave?"*

### Debounce / Throttle
- **ADD DATA** button: disabled after click until current new row is saved/cancelled.
- **Search input**: `useDebouncedValue(globalFilter, 200)` (matches existing pattern).
- **Dropdown search**: debounced 300ms for type-ahead filtering.

### Date Picker
- Type: Month/Year only (`showMonthYearPicker` prop in `react-datepicker`).
- Display format: `"MMM YYYY"` (e.g. "Jan 2026").
- Clear button (×) via `isClearable`.
- Library: `react-datepicker` (already in use — `DateRangeFilter` component).

### Dropdown Behavior
- Searchable with type-ahead.
- Long names: `text-overflow: ellipsis` + `title` attribute / Mantine `Tooltip` on hover.
- Empty state: *"No items found"* or *"No materials available"*.
- Error state: *"Could not load suppliers/materials. Please try again"*.
- Escape key closes without selecting.
- Selected item highlighted in blue (`backgroundColor` or Mantine `active` style).

### Success / Error Messages
- **SPA side:** `popupAlert()` from `src/UI/Popups/popup.js`.
- **Embed side:** Mantine `notifications.show()` or inline error text below fields.

### Responsive Behavior
- Listing table: horizontal scroll on narrow screens.
- Date picker: portal-based rendering to avoid clipping (`popperPlacement="bottom-start"`).
- Drawer: fixed 400px width on desktop; full-width on mobile (if applicable).

---

## 7. Files To Create / Modify

### Next.js OP Backend (snowkap_op_nextjs) — New Files

| # | File | Type |
|---|------|------|
| 1 | `graphql/queries/get-supplier-material-mapping-list.gql` | GraphQL Query |
| 2 | `graphql/queries/get-supplier-material-mapping-by-id.gql` | GraphQL Query |
| 3 | `graphql/queries/check-duplicate-supplier-material-mapping.gql` | GraphQL Query |
| 4 | `graphql/queries/get-suppliers-for-dropdown.gql` | GraphQL Query |
| 5 | `graphql/queries/get-materials-for-dropdown.gql` | GraphQL Query |
| 6 | `graphql/mutations/insert-supplier-material-mapping.gql` | GraphQL Mutation |
| 7 | `graphql/mutations/update-supplier-material-mapping.gql` | GraphQL Mutation |
| 8 | `graphql/mutations/soft-delete-supplier-material-mapping.gql` | GraphQL Mutation |
| 9 | `lib/supplier-material-mapping/mapping.interface.ts` | TypeScript Interface |
| 10 | `lib/supplier-material-mapping/mapping-form.service.ts` | Service Layer |
| 11 | `lib/supplier-material-mapping/mapping.validation.ts` | Validation Utility |
| 12 | `schemas/supplier-material-mapping.schema.ts` | Zod Schema |
| 13 | `app/api/v1/master-data/supplier-material-mapping/listing/route.ts` | API Route |
| 14 | `app/api/v1/master-data/supplier-material-mapping/form/route.ts` | API Route |
| 15 | `app/api/v1/master-data/supplier-material-mapping/delete/route.ts` | API Route |
| 16 | `app/api/v1/master-data/supplier-material-mapping/counts/route.ts` | API Route |
| 17 | `app/api/v1/master-data/supplier-material-mapping/template/route.ts` | API Route |
| 18 | `components/supplier-material-mapping/supplierMaterialMappingListingTable.tsx` | UI Component |
| 19 | `components/supplier-material-mapping/supplierMaterialMappingEmptyState.tsx` | UI Component |
| 20 | `components/supplier-material-mapping/addSupplierMaterialMappingForm.tsx` | UI Component |
| 21 | `components/supplier-material-mapping/addSupplierMaterialMappingForm.css` | Styles |
| 22 | `app/[organizationId]/embed/v1/[accessToken]/supplier-material-list/page.tsx` | Embed Page |
| 23 | `app/[organizationId]/embed/v1/[accessToken]/add-supplier-material-mapping/page.tsx` | Embed Page |

### Next.js OP Backend — Modified Files

| # | File | Change |
|---|------|--------|
| 1 | `shared/services/platform-window-message-service.ts` | Add `addEditSupplierMaterialMapping()` and `supplierMaterialMappingFormSubmitted()` message functions |
| 2 | `lib/auditlog/auditlog.service.ts` | Add `saveOrgSupplierMaterialMapping()` audit logger |

### React SPA (below2_spanew) — New Files

| # | File | Type |
|---|------|------|
| 1 | `src/containers/OpsContainer/SupplierMaterialMapping.js` | Container Page |

### React SPA — Modified Files

| # | File | Change |
|---|------|--------|
| 1 | `src/App.js` | Add `OPPrivateRoute` for `/supplier-material-mapping` + import |
| 2 | `src/ops/message-constant.js` | Add message type constants |

---

## 8. Implementation Order

| Step | Task | Depends On | Est. Complexity |
|------|------|------------|-----------------|
| 1 | Confirm/create `OrgSupplierMaterialMapping` table + relationships in Hasura | — | Low |
| 2 | Create 5 GraphQL query files (.gql) | Step 1 | Low |
| 3 | Create 3 GraphQL mutation files (.gql) | Step 1 | Low |
| 4 | Run `yarn codegen` to generate SDK types | Steps 2, 3 | Low |
| 5 | Create `mapping.interface.ts` | Step 4 | Low |
| 6 | Create `supplier-material-mapping.schema.ts` (Zod) | — | Low |
| 7 | Create `mapping.validation.ts` | Step 6 | Low |
| 8 | Create `mapping-form.service.ts` (all 8 functions) | Steps 4, 5 | Medium |
| 9 | Create API routes: listing, form, delete, counts | Steps 7, 8 | Medium |
| 10 | Create listing table component (with inline edit) | Step 9 | High |
| 11 | Create add/edit form component (Drawer form) | Step 9 | Medium |
| 12 | Create empty state component | Step 10 | Low |
| 13 | Create embed pages | Steps 10, 11 | Low |
| 14 | Add window message functions to `platform-window-message-service.ts` | Step 13 | Low |
| 15 | Create SPA container (`SupplierMaterialMapping.js`) | Step 14 | Medium |
| 16 | Add route in `App.js` + message constants | Step 15 | Low |
| 17 | Add audit logging to `auditlog.service.ts` | Step 9 | Low |
| 18 | Run `yarn build` + `yarn lint` to verify | All | Low |

---

## 9. Testing Checklist

### Functional Tests — Add
- [ ] Add mapping with all fields → saves, count +1, success message
- [ ] Add without supplier → "Please select a supplier"
- [ ] Add without material → "Please select a material"
- [ ] Add without dates → "Please select a reporting period"
- [ ] Add duplicate → "This mapping already exists"
- [ ] Add 10 rows, fill 3, save → only 3 saved, 7 discarded
- [ ] Multiple rows, one invalid → only invalid row shows error, rest save

### Functional Tests — Date
- [ ] From date picker opens month/year calendar
- [ ] To date picker opens month/year calendar
- [ ] Dates display as "MMM YYYY"
- [ ] Clear (×) button works
- [ ] Cross-year range (Dec 2025 → Feb 2026) → saves OK
- [ ] Same month From and To → accepted
- [ ] To date before From date → "End date must be after start date"
- [ ] Saved dates persist on page reload

### Functional Tests — Supplier Dropdown
- [ ] Opens with search box
- [ ] Type-ahead filters by name and code
- [ ] Click selects and closes
- [ ] Escape closes without selecting
- [ ] API failure → error message in dropdown
- [ ] 500+ suppliers → no UI freeze

### Functional Tests — Material Dropdown
- [ ] Opens with search
- [ ] Selected item highlighted blue
- [ ] Deactivated materials excluded
- [ ] Long names truncated with tooltip
- [ ] API failure → error message

### Functional Tests — Edit
- [ ] Pencil icon → row becomes editable
- [ ] Can change supplier, material, dates
- [ ] Save → row goes read-only with updated values
- [ ] Record count unchanged
- [ ] Clear required field → save blocked
- [ ] Edit to create duplicate → blocked
- [ ] Concurrent delete by another user → "This record no longer exists"

### Functional Tests — Delete
- [ ] Trash icon → confirmation dialog
- [ ] Confirm → record removed, count −1, success message
- [ ] Mapping in use → "Cannot delete — this mapping is currently in use"
- [ ] Server error → "Delete failed. Please try again"
- [ ] Never deletes without confirmation

### Edge Case Tests
- [ ] Rapid ADD DATA clicks → only one new row
- [ ] Navigate away with unsaved changes → beforeunload prompt
- [ ] Internet disconnect during save → error, data not lost
- [ ] Edit row at bottom of list → row stays visible
- [ ] Dropdown open in row A, click row B → dropdown stays open
- [ ] Tablet screen → date picker not clipped

### Integration Tests
- [ ] Listing loads with correct pagination
- [ ] Sort by each sortable column works
- [ ] Global search filters results
- [ ] Record count badge correct after add/edit/delete
- [ ] Empty state shown when no records
- [ ] postMessage communication works between SPA and embed pages
- [ ] Drawer opens/closes correctly
- [ ] Audit logs written to ClickHouse on create/update/delete