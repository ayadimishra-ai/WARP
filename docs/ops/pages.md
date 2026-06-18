# OPs GHG Calculator — Pages

All pages live under `app/[organizationId]/embed/v1/[accessToken]/` unless noted. Pages are rendered inside an iframe within the parent WARP SPA.

---

## Root / Admin Pages

### `app/page.tsx`
Root landing page. Redirects or shows initial state before tenant routing.

### `app/layout.tsx`
Root Next.js layout. Wraps the entire app in Mantine's `MantineProvider`, `ModalsProvider`, `Notifications`, and other global providers.

### `app/admin/layout.tsx`
Admin panel layout. Protects children via admin auth guard. Renders admin navigation shell.

### `app/admin/(features)/emission-factors/listing/page.tsx`
Lists all emission factors in an MRT table. Super-admin only. Fetches from `GET /admin/api/emission-factor`. Columns include gas type, activity, factor value, unit.

### `app/admin/(features)/uom-conversion/listing/page.tsx`
Lists UOM conversion factors. Super-admin only. Fetches from `GET /admin/api/uom-conversion`.

---

## Embed Layout

### `app/[organizationId]/embed/v1/[accessToken]/layout.tsx`
Server component. Validates `accessToken` and `organizationId` URL params. Wraps children in:
- `ComponentAuthGuardWrapper` — server-side JWT validation; renders error if token missing/invalid
- `ApolloWrapper` — injects Apollo Client configured with org-scoped auth headers

---

## GHG Dashboard

### `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/page.tsx`
Root dashboard page shell. [QA: Body is nearly empty — all content is commented out. Parallel route slots below carry the actual content.] Returns `<div />`.

### `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/layout.tsx`
Parallel routes layout. Assembles the following named slots into the dashboard grid:
- `@left_sidebar` — navigation/filter sidebar
- `@ghg_snapshot_org` — org-level emission snapshot card
- `@ghg_snapshot_my_view` — user-scoped view card
- `@emission_intensity_insight_block` — intensity KPIs (per tonne, per employee, per product)
- `@emission_contributors_block` — top emission contributors chart
- `@emission_by_critical_factors` — emission breakdown by critical factors
- `@MapChartLocationBlock` — amcharts5 map showing emissions by location
- `@TotalEmissionProductsTable` — table of total emissions by product

Each `@slot/page.tsx` fetches its own data (via Apollo or REST) and renders a self-contained card. Data sources: `view_overall_emission_from_kpi_main`, `KPIMain`, related KPI views.

---

## Data Log Summary

### `app/[organizationId]/embed/v1/[accessToken]/data-log-summary/page.tsx`
**Type:** `"use client"`

The main data management and approval screen. Fetches filter metadata on mount, then fetches summary data on filter change.

**Key data fetched:**
- `GET /api/v1/monthly-activity-summary/filters` — locations, years, months with data, default year/month
- `POST /api/v1/monthly-activity-summary` — paginated activity or location-wise rows

**Key state:**
- `selectedLocations`, `selectedYear`, `selectedMonths`, `selectedStatus`
- `activeTab`: `"activity_type"` | `"location_wise"`
- `filterData`, `summary` (total/pending/approved/rejected counts)
- `approvingKeys`, `exportingKeys` (per-row loading sets)

**Features:**
- Year type (financial/calendar) aware — converts calendar year from email deep-link to financial year
- Deep-link support: `?filters=<base64url JSON>` pre-populates filters from email CTAs; consumed and stripped after mount
- Tab toggle: Activity Type view (grouped by activity) vs Location Wise view (per location per activity)
- Approve action (OrgAdmin only): sends `POST /api/v1/monthly-activity-summary/approve`; confirmation via `window.parent.postMessage`
- Export action: sends `POST /api/v1/monthly-activity-summary` with `is_export: true`; opens presigned S3 URL via `window.open`
- 400ms debounced search on Location Wise tab

**Key components used:** `MainFilterBlock`, `CheckboxMultiSelect`, `MantineReactTable`

**postMessage events:**
- Sends: `data-log-approval-confirm-popup` (open modal in parent), `warp-approved-successfully`
- Receives: `data-log-approval-confirmed` (parent user confirmed)

---

## GHG Forms (Multi-step Manual Entry)

### `app/[organizationId]/embed/v1/[accessToken]/ghg-forms/page.tsx`
**Type:** `"use client"`

Multi-step accordion form for manual GHG data entry. Sections:
- General → `<GeneralDetails />`
- Production → `<ProductionThisMonth />`
- Energy: Grid Power Details → `<GridPowerDetails />`, Captive Power Details → `<CaptivePowerDetails />`, Fuel Purchased → `<FuelPurchased />`
- Transport: Upstream → `<UpstreamTransportDetails />`, Downstream → `<DownstreamTransportDetails />`, Employee Travel → `<EmployeeTravelDetails />`, Business Travel → `<BusinessTravelDetails />`
- Waste → `<Waste />`

Progress bar shows "3% Completed" (hardcoded — [QA: progress not dynamically calculated]). Next/Reset buttons navigate between sections. Sends `scrollToTop` postMessage to parent on Next.

---

## AI Verify Extracted Data

### `app/[organizationId]/embed/v1/[accessToken]/ai-verify-extracted-data/page.tsx`
**Type:** `"use client"`

Side-by-side AI document verification interface.

**Left panel:** `DocumentViewer` (PDF/image renderer with zoom/pan)
**Right panel:** `ExtractedDataTable` (editable table of AI-extracted values)

**Data fetched:** `useGetFileForVerificationOrEditQuery` (Apollo) filtered by:
- Executive: `status = VerificationPending`, own files
- Admin: `status = Verified`, all org files

**Features:**
- Supports `?fileId=` and `?isEdit=true` query params (edit mode)
- Bill navigation (Prev/Next) with unsaved-changes guard
- Unsaved-changes handled via `window.parent.postMessage("AIExtractedDataValidationPopup", ...)` — parent shows modal
- URL updated via `window.parent.postMessage("ai-verify-url-change", ...)` on index change
- File download via `handleDownload()`

---

## Activity Data Records

### `app/[organizationId]/embed/v1/[accessToken]/activity-data-records/page.tsx`
Thin wrapper. Renders `<MonthyDataRecords />` from `components/activity-data-records/activityDataRecordsTable.tsx`.

The MRT table shows monthly activity data records with columns for activity type, location, month, year, status (pending/approved), and values. Data fetched via server action `activity-data-records-server-action.ts`.

---

## Location Management

### `app/[organizationId]/embed/v1/[accessToken]/location-listing/page.tsx`
Renders location listing table. Uses `components/location-listing-add-location/addLocationPage.tsx`.

### `app/[organizationId]/embed/v1/[accessToken]/add-location/page.tsx`
Location create/edit form. Uses `components/location-listing-add-location/addLocationForm.tsx`.
- Calls `GET /api/v1/master-data/organization-locations/form` for edit data
- Calls `POST` or `PUT` for save

### `app/[organizationId]/embed/v1/[accessToken]/organization-setup/locations/form/page.tsx`
Alternative location form used in the onboarding setup flow.

---

## User Management

### `app/[organizationId]/embed/v1/[accessToken]/user-listing/page.tsx`
User listing table. Fetches from `GET /api/v1/master-data/users/listing`.

### `app/[organizationId]/embed/v1/[accessToken]/add-user/page.tsx`
User create/edit form. Calls `POST`/`PUT /api/v1/master-data/users/form`. Welcome email sent on create.

### `app/[organizationId]/embed/v1/[accessToken]/user-activity-mapping/page.tsx`
Maps users to activity permissions. Calls `GET`/`POST /api/v1/master-data/users/user-activity-permission`.

---

## Organisation Details

### `app/[organizationId]/embed/v1/[accessToken]/organization-details/page.tsx`
Renders organisation profile form. Fetches from `GET /api/v1/master-data/organization-details/form`.

---

## Supplier & Material Management

### `app/[organizationId]/embed/v1/[accessToken]/supplier-master-listing-enterprise-setup/page.tsx`
Supplier master listing for enterprise setup. Fetches from `/api/v1/master-data/org-supplier-master-enterprise-setup/listing`.

### `app/[organizationId]/embed/v1/[accessToken]/supplier-location-master/page.tsx`
Supplier location master entry/edit form.

### `app/[organizationId]/embed/v1/[accessToken]/supplier-location-master-list/page.tsx`
Supplier location master listing table. Fetches from `/api/v1/master-data/org-supplier-location-master/listing`.

### `app/[organizationId]/embed/v1/[accessToken]/supplier-material-mapping/page.tsx`
Supplier–material mapping management. Uses `components/supplier-material-mapping/supplierMaterialMappingTable.tsx`. Supports bulk upload via `SupplierMaterialMappingBulkUploadModal`.

### `app/[organizationId]/embed/v1/[accessToken]/material-listing/page.tsx`
Material master listing. Fetches from `/api/v1/master-data/materials/listing`.

---

## Other Pages

### `app/[organizationId]/embed/v1/[accessToken]/buyer-share-details/page.tsx`
PCF buyer share details. Renders `components/buyer-share-details/buyerShareDetails.tsx`. Data via server action `buyerShareDetails-server-action.ts`.

### `app/[organizationId]/embed/v1/[accessToken]/net-zero-target-setting/page.tsx`
Net-zero target setting form/display.

### `app/[organizationId]/embed/v1/[accessToken]/save-mapping-popup/page.tsx`
Confirmation popup for saving user-activity mapping. Renders `saveMappingPopup.tsx`.

### `app/[organizationId]/embed/v1/[accessToken]/common-table/page.tsx`
Generic reusable table page. Configurable via query params or store.

### `app/[organizationId]/embed/v1/[accessToken]/data-import/api/history/page.tsx`
API import history log. Renders `AIDataImportHistoryTable` filtered to API imports.

### `app/[organizationId]/embed/v1/[accessToken]/data-import/excel/history/page.tsx`
Excel import history log. Renders `DataImportHistoryTable` filtered to Excel imports.

### `app/[organizationId]/embed/v1/[accessToken]/manual-entry-data/fuel-consumption/page.tsx`
Manual fuel consumption data entry form.

### `app/[organizationId]/embed/v1/[accessToken]/manual-entry-data/energy-grid/page.tsx`
Manual grid energy data entry form.

### `app/[organizationId]/embed/v1/[accessToken]/manual-entry-data/waste-data/page.tsx`
Manual waste data entry form.

### `app/[organizationId]/embed/v1/[accessToken]/manual-entry-data/captive-power/page.tsx`
Manual captive power data entry form.
