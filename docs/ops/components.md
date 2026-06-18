# OPs GHG Calculator — Components

Components live under `components/` and `app/[organizationId]/embed/v1/[accessToken]/data-log-summary/` (inline page components).

---

## AI Modules

### `components/ai-modules/DocumentViewer.tsx`
Renders uploaded documents (PDF or image) for the AI verification flow.

**Props:** `fileURL: string`

Internally delegates to `PDFViewer` for `.pdf` files and to `react-tiff` or standard `<img>` for images. Includes zoom/pan via `react-zoom-pan-pinch`. Key prop is `fileURL` — changes cause full re-render via React `key`.

---

### `components/ai-modules/PDFViewer.tsx`
PDF.js-based PDF renderer using `pdfjs-dist`.

**Props:** `fileURL: string`

Renders a multi-page PDF onto HTML5 canvas elements. Handles page navigation.

---

### `components/ai-modules/ExtractedDataTable.tsx`
Editable MRT table for reviewing and correcting AI-extracted data from documents.

**Props:**
- `fileId: string | undefined` — the AI file upload ID to display
- `onUnsavedChangesChange: (hasChanges: boolean) => void` — callback for unsaved state

Fetches `AIFileData` by `fileId` via Apollo. Allows inline cell editing. Tracks dirty state and reports it to parent via callback so the parent page can trigger the unsaved-changes popup. "Verify and Confirm" button saves edits and updates file status to `Verified`.

---

## Activity Data Records

### `components/activity-data-records/activityDataRecordsTable.tsx`
MRT table showing monthly activity data records for the authenticated user.

Fetches data via `activity-data-records-server-action.ts`. Columns: activity name, location, month, year, status badge, values. No direct props — uses session context internally.

---

## Location Management

### `components/location-listing-add-location/addLocationPage.tsx`
Page wrapper for the location listing. Renders `addLocationForm.tsx` in a modal/drawer alongside the listing table.

### `components/location-listing-add-location/addLocationForm.tsx`
react-hook-form + zod form for creating or editing an organisation location.

**Key fields:** name, code, address line, city (lookup), state (lookup), country (lookup), ownership_type (owned/leased/contract), type (manufacturing/office/warehouse), has WWTP flag.

**API calls:**
- `GET /api/v1/master-data/organization-locations/form` (edit mode)
- `POST /api/v1/master-data/organization-locations/form` (create)
- `PUT /api/v1/master-data/organization-locations/form` (update)

---

## User Management

### `components/users-listing-add-users/addUserPage.tsx`
Page wrapper for user listing with add/edit capability.

### `components/users-listing-add-users/addUserForm.tsx`
react-hook-form + zod form for creating or editing a user.

**Key fields:** name, email, mobile (PhoneNumberInput), role (OrganizationAdmin / LocationExecutive).

**API calls:**
- `POST /api/v1/master-data/users/form` — create
- `PUT /api/v1/master-data/users/form` — update

---

## Supplier & Material

### `components/supplier-material-mapping/supplierMaterialMappingTable.tsx`
MRT table for managing supplier–material mappings. Supports pagination, search, edit, and delete. Fetches from `/api/v1/master-data/supplier-material-mapping/listing`.

**Key actions:** Add mapping (form modal), edit (inline), delete (confirm modal), bulk upload (via `SupplierMaterialMappingBulkUploadModal`).

### `components/supplier-material-mapping/SupplierMaterialMappingBulkUploadModal.tsx`
Modal for bulk Excel upload of supplier–material mappings. Provides template download link. Calls `/api/v1/master-data/supplier-material-mapping/excel` after S3 upload.

### `components/supplier-material-mapping/supplierMaterialMappingEmptyState.tsx`
Empty state illustration shown when no mappings exist.

### `components/supplier-location-master/supplierLocationMasterListingTable.tsx`
MRT table for supplier location master. Fetches from `/api/v1/master-data/org-supplier-location-master/listing`. Supports export and bulk upload.

### `components/supplier-location-master/supplierLocationMasterEmptyState.tsx`
Empty state for supplier location master.

---

## GHG Emission

### `components/ghg-emission/GhgEmissionTable.tsx`
Table displaying GHG emission summary data. Uses Mantine table with custom styling (SCSS module). Data passed as props from dashboard parallel slots.

---

## Tables

### `components/tables/mrtTable.tsx`
Generic MRT table wrapper with default configuration. Accepts `columns`, `data`, and optional overrides. Used across multiple listing pages to reduce boilerplate.

**Key defaults:** `enableColumnActions: false`, `enableSorting: false`, `enableTopToolbar: false`, consistent cell styling.

### `components/tables/DataImportHistoryTable.tsx`
MRT table for Excel import history. Shows file name, activity type, location, import date, status (success/failure), download link for error Excel.

**Props:** `activityCode?: string`, `locationId?: string` — filters applied.

### `components/tables/AIDataImportHistoryTable.tsx`
MRT table for AI (document) import history. Similar to `DataImportHistoryTable` but scoped to AI file uploads. Shows AI verification status.

### `components/tables/DataImportHistoryToolbar.tsx`
Toolbar for import history tables. Provides date range filter and activity type filter controls.

### `components/tables/useDataImportHistoryToolbarActions.ts`
Custom hook encapsulating filter state and fetch logic for import history toolbars.

---

## Buyer Share Details

### `components/buyer-share-details/buyerShareDetails.tsx`
Displays PCF (Product Carbon Footprint) buyer share allocation details. Shows how emissions are attributed from supplier to buyer organisations. Data fetched via server action.

---

## Listing (Generic)

### `components/listing/index.tsx`
Generic listing container. Composes header, body (table), footer (pagination), and action-filters.

### `components/listing/header.tsx`
**Props:** `title: string`, `actions: ReactNode` — renders page title + action buttons (e.g. Add, Export).

### `components/listing/body.tsx`
Table body area. Passes columns and data to `mrtTable`.

### `components/listing/footer.tsx`
Pagination footer.

### `components/listing/action-filters.tsx`
Filter controls bar (search input, dropdown filters).

### `components/listing/header-filter.tsx`
Header-level filter chips / toggles.

---

## User Activity Mapping

### `components/user-activity-mapping-listing-popup/saveMappingPopup.tsx`
Confirmation modal shown before saving user–activity permission mappings. Sends postMessage to parent when confirmed.

---

## Supplier Listing (Enterprise)

### `components/supplier-listing-add-supplier-enterprise-setup/addSupplierPage.tsx`
Page wrapper for enterprise supplier master management. Includes listing table and add/import controls.

---

## UI Utilities

### `components/ui/PhoneNumberInput.tsx`
Wrapper around `react-phone-number-input` integrated with Mantine styling. Handles country code selection and number validation.

### `components/ui/UnauthorizedPleaseLoginAgain.tsx`
Full-page unauthorised state display with message prompting the user to log in again.

---

## Inline Page Components (Data Log Summary)

These components are defined in `app/[organizationId]/embed/v1/[accessToken]/data-log-summary/`:

### `MainFilterBlock.tsx`
Filter bar for the data-log-summary page.

**Props:**
- `selectedYear`, `onFinancialYearChange` — year dropdown
- `selectedLocations`, `onLocationsChange`, `locationOptions` — location multi-select
- `selectedMonths`, `onMonthsChange`, `monthsWithData` — month tiles (green if data exists)
- `summary` (`{ total, pending, approved, rejected }`) — clickable status summary badges
- `selectedStatus`, `onStatusChange` — status filter
- `financialYearStartMonth`, `baselineYear`
- `onResetToDefault` — reset button

Renders clickable month tiles that highlight months containing data. Renders status summary badges that act as filter toggles.

### `CheckboxMultiSelect.tsx`
Custom multi-select with "Select All" toggle. Used inside `MainFilterBlock` for location selection.

**Props:** `options: { value, label }[]`, `value: string[]`, `onChange: (vals: string[]) => void`, `label: string`

### `MainFilterBlockUtils.ts`
Constants: `MONTH_FULL_TO_BADGE` and `MONTH_BADGE_TO_FULL` lookup maps (e.g. `"January"` ↔ `"Jan"`).

---

## Icons

All in `components/icons/`. These are simple TSX wrappers around SVG paths, no significant props beyond `size` and `color`:

`ApproveIcon`, `RejectIcon`, `PartiallyRejectIcon`, `AISparkleIcon`, `CheckedStarIcon`, `EditIcon`, `EditIconDisabled`, `TrashIcon`, `DownloadIcon`, `TableDownloadIcon`, `GreenCheck`, `GreyCheck`, `GreenBullet`, `TrendingUp`, `TrendingDown`, `RedUpIcon`, `GreenDownIcon`, `UserIcon`, `FactoryIcon`, `EnergyIcon`, `EnergyIconNew`, `WasteIcon`, `TransportIcon`, `MaterialIcon`, `BoxIcon`, `PackageIcon`, `TableExclamationIcon`, `TableSortIcon`, `TableHeadingFilterIcon`, `PendingVerificationIcon`, `Standing3Dots`, `InfoIcon`, `SearchIcon`, `SaveIcon`, `EyeIcon`, `CalenderIcon`, `RangeIcon`, `IndianFlagIcon`, `GearIcon`, `AddUser_LocationPageIcon`, `TotalEmission`

---

## Form Components

Located in `components/forms/` — referenced by `ghg-forms/page.tsx`:

| Component | Section | Description |
|---|---|---|
| `GeneralDetails/GeneralDetails.tsx` | General | Organisation period, baseline data fields |
| `Production/ProductionThisMonth.tsx` | Production | Production volume entry |
| `EnergyDetails/GridPowerDetails.tsx` | Energy | Grid electricity consumption entry |
| `EnergyDetails/CaptivePowerDetails.tsx` | Energy | On-site captive power generation entry |
| `EnergyDetails/FuelPurchased.tsx` | Energy | Purchased fuel consumption entry |
| `Transport/UpstreamTransportDetails.tsx` | Transport | Upstream logistics emissions entry |
| `Transport/DownstreamTransportDetails.tsx` | Transport | Downstream logistics emissions entry |
| `Transport/EmployeeTravelDetails.tsx` | Transport | Employee commuting emissions entry |
| `Transport/BusinessTravelDetails.tsx` | Transport | Business travel emissions entry |
| `Waste/Waste.tsx` | Waste | Waste generated by type and disposal method |

All form components use react-hook-form + zod, are marked `"use client"`, and call the corresponding form API routes under `data-import/forms/`.
