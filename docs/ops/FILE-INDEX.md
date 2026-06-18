# OPs GHG Calculator — File Index

Files grouped by category with a one-line purpose. Paths relative to project root.

---

## Config Files

| File | Purpose |
|---|---|
| `package.json` | Dependencies, scripts, engine constraints (yarn only, Node >=16) |
| `next.config.js` | Next.js configuration |
| `tsconfig.json` | TypeScript compiler options, `~/` path alias |
| `.eslintrc.json` | ESLint: extends next/core-web-vitals; `no-unused-vars` and `no-empty` disabled |
| `.prettierrc` | Prettier formatting rules |
| `.nvmrc` | Node version pin |
| `.yarnrc.yml` | Yarn package manager config |
| `Dockerfile` | node:18 image, installs deps, builds, exposes 3000 [QA: node:18 but Volta pins node:20] |
| `codegen.ts` | GraphQL codegen configuration |
| `utils/drizzle/drizzle.config.ts` | Drizzle Kit migration configuration |
| `utils/drizzle/0000_fair_young_avengers.sql` | Initial Drizzle migration SQL |
| `utils/drizzle/0001_activity_task_request_status.sql` | Migration: adds status column to activity task request |
| `.husky/pre-commit` | Runs `yarn lint` before every commit |
| `.husky/pre-push` | Runs `yarn build` before every push |
| `.husky/commit-msg` | Enforces Conventional Commits via commitlint |
| `scripts/load-secrets.mjs` | Loads AWS Secrets Manager secrets into `process.env` at startup |

---

## App Pages

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout: Mantine providers, global styles |
| `app/page.tsx` | Root page (landing / redirect) |
| `app/admin/layout.tsx` | Admin panel layout with auth guard |
| `app/admin/loading.tsx` | Admin loading skeleton |
| `app/admin/error.tsx` | Admin error boundary |
| `app/admin/unauthorized.tsx` | Renders when admin access is denied |
| `app/admin/(features)/emission-factors/listing/page.tsx` | Admin: emission factor listing table |
| `app/admin/(features)/uom-conversion/listing/page.tsx` | Admin: unit-of-measure conversion listing |
| `app/[organizationId]/embed/v1/[accessToken]/layout.tsx` | Embed layout: validates tokens, wraps in ApolloWrapper |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/layout.tsx` | GHG dashboard parallel-slot layout |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/page.tsx` | GHG dashboard root (placeholder — actual content in parallel slots) [QA: body is nearly empty] |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/@emission_intensity_insight_block/page.tsx` | Emission intensity KPI block slot |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/@ghg_snapshot_org/page.tsx` | Org-level GHG snapshot slot |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/@ghg_snapshot_my_view/page.tsx` | User-view GHG snapshot slot |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/@MapChartLocationBlock/page.tsx` | Map chart by location slot |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/@TotalEmissionProductsTable/page.tsx` | Total emissions by product table slot |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/@emission_contributors_block/page.tsx` | Emission contributors chart slot |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/@emission_by_critical_factors/page.tsx` | Emission by critical factors slot |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/@left_sidebar/page.tsx` | Dashboard left sidebar slot |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-dashboard/(emission-by-scope)/test.tsx` | Test file — not a route [QA: test file in production app directory] |
| `app/[organizationId]/embed/v1/[accessToken]/data-log-summary/page.tsx` | Monthly activity summary table with approve/export; full filter bar |
| `app/[organizationId]/embed/v1/[accessToken]/ghg-forms/page.tsx` | Multi-step accordion form for manual GHG data entry |
| `app/[organizationId]/embed/v1/[accessToken]/activity-data-records/page.tsx` | Activity data records table (wraps `MonthyDataRecords` component) |
| `app/[organizationId]/embed/v1/[accessToken]/ai-verify-extracted-data/page.tsx` | AI document viewer + extracted data verification UI |
| `app/[organizationId]/embed/v1/[accessToken]/add-location/page.tsx` | Add/edit organisation location form |
| `app/[organizationId]/embed/v1/[accessToken]/location-listing/page.tsx` | Location listing table |
| `app/[organizationId]/embed/v1/[accessToken]/add-user/page.tsx` | Add/edit user form |
| `app/[organizationId]/embed/v1/[accessToken]/user-listing/page.tsx` | User listing table |
| `app/[organizationId]/embed/v1/[accessToken]/user-activity-mapping/page.tsx` | User ↔ activity permission mapping |
| `app/[organizationId]/embed/v1/[accessToken]/organization-details/page.tsx` | Organisation profile form |
| `app/[organizationId]/embed/v1/[accessToken]/organization-setup/locations/form/page.tsx` | Location setup form (setup flow variant) |
| `app/[organizationId]/embed/v1/[accessToken]/supplier-master-listing-enterprise-setup/page.tsx` | Supplier master listing for enterprise setup |
| `app/[organizationId]/embed/v1/[accessToken]/supplier-location-master/page.tsx` | Supplier location master form/listing |
| `app/[organizationId]/embed/v1/[accessToken]/supplier-location-master-list/page.tsx` | Supplier location master list view |
| `app/[organizationId]/embed/v1/[accessToken]/supplier-material-mapping/page.tsx` | Supplier–material mapping management |
| `app/[organizationId]/embed/v1/[accessToken]/material-listing/page.tsx` | Material master listing |
| `app/[organizationId]/embed/v1/[accessToken]/buyer-share-details/page.tsx` | Buyer share details (PCF attribution) |
| `app/[organizationId]/embed/v1/[accessToken]/net-zero-target-setting/page.tsx` | Net-zero target setting UI |
| `app/[organizationId]/embed/v1/[accessToken]/save-mapping-popup/page.tsx` | Save mapping confirmation popup |
| `app/[organizationId]/embed/v1/[accessToken]/common-table/page.tsx` | Generic reusable table page |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/api/history/page.tsx` | API import history log |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/excel/history/page.tsx` | Excel import history log |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-fuel-consumption/heating-water/page.tsx` | Manual entry: heating water fuel form |
| `app/[organizationId]/embed/v1/[accessToken]/manual-entry-data/fuel-consumption/page.tsx` | Manual entry: fuel consumption |
| `app/[organizationId]/embed/v1/[accessToken]/manual-entry-data/energy-grid/page.tsx` | Manual entry: grid energy |
| `app/[organizationId]/embed/v1/[accessToken]/manual-entry-data/waste-data/page.tsx` | Manual entry: waste data |
| `app/[organizationId]/embed/v1/[accessToken]/manual-entry-data/captive-power/page.tsx` | Manual entry: captive power |

---

## API Routes

| File | Purpose |
|---|---|
| `app/api/v1/auth/access-token/route.ts` | POST: generate JWT access token |
| `app/api/v1/auth/refresh-token/route.ts` | POST: stub — not implemented [QA] |
| `app/api/v1/auth/revoke-token/route.ts` | POST: stub — not implemented [QA] |
| `app/api/v1/activity/route.ts` | GET: list all activities for org |
| `app/api/v1/activity-form/mode/route.ts` | GET/POST: activity form mode config |
| `app/api/v1/emission-factor/get-emission-factor/route.ts` | GET: fetch emission factor |
| `app/api/v1/monthly-activity-summary/route.ts` | POST: paginated summary or export (dual-path by `is_export` flag) |
| `app/api/v1/monthly-activity-summary/approve/route.ts` | POST: approve activity records (OrgAdmin only) |
| `app/api/v1/monthly-activity-summary/filters/route.ts` | GET: filter metadata (locations, years, months with data) |
| `app/api/v1/monthly-activity-data/route.ts` | GET/POST: monthly activity data CRUD |
| `app/api/v1/organization-address/route.ts` | GET: fetch organisation addresses |
| `app/api/v1/org-buyersuppliermethod-data/route.ts` | GET/POST: buyer-supplier method data |
| `app/api/v1/org-buyer-supplier-mapping/route.ts` | GET/POST: buyer-supplier mapping |
| `app/api/v1/users/activity-permissions/route.ts` | GET/POST: user activity permissions |
| `app/api/v1/users/buyer-supplier-role/route.ts` | GET: user buyer/supplier role |
| `app/api/v1/ghg-data-import/transaction/energy-fuel-purchased/excel/route.ts` | POST: bulk import fuel purchased Excel |
| `app/api/v1/ghg-data-import/transaction/energy-grid-power/excel/route.ts` | POST: bulk import grid power Excel |
| `app/api/v1/ghg-data-import/transaction/energy-captive-power/excel/route.ts` | POST: bulk import captive power Excel |
| `app/api/v1/ghg-data-import/transaction/transport-upstream/route.ts` | POST: upstream transport data |
| `app/api/v1/ghg-data-import/transaction/transport-upstream/excel/route.ts` | POST: bulk import upstream transport Excel |
| `app/api/v1/ghg-data-import/transaction/transport-downstream/route.ts` | POST: downstream transport data |
| `app/api/v1/ghg-data-import/transaction/transport-downstream/excel/route.ts` | POST: bulk import downstream transport Excel |
| `app/api/v1/ghg-data-import/transaction/transport-employee-travel/excel/route.ts` | POST: bulk import employee travel Excel |
| `app/api/v1/ghg-data-import/transaction/transport-business-travel/excel/route.ts` | POST: bulk import business travel Excel |
| `app/api/v1/ghg-data-import/transaction/waste/excel/route.ts` | POST: bulk import waste Excel |
| `app/api/v1/ghg-data-import/transaction/water-withdrawal/excel/route.ts` | POST: bulk import water withdrawal Excel |
| `app/api/v1/ghg-data-import/transaction/water-consumption/excel/route.ts` | POST: bulk import water consumption Excel |
| `app/api/v1/ghg-data-import/transaction/wastewater-generation/excel/route.ts` | POST: bulk import wastewater generation Excel |
| `app/api/v1/ghg-data-import/transaction/wastewater-treatment/excel/route.ts` | POST: bulk import wastewater treatment Excel |
| `app/api/v1/ghg-data-import/transaction/fugitive/excel/route.ts` | POST: bulk import fugitive emissions Excel |
| `app/api/v1/ghg-data-import/transaction/general/excel/route.ts` | POST: bulk import general activity Excel |
| `app/api/v1/ghg-data-import/transaction/production/route.ts` | POST: production data |
| `app/api/v1/ghg-data-import/transaction/production/excel/route.ts` | POST: bulk import production Excel |
| `app/api/v1/ghg-data-import/transaction/material-procurement/excel/route.ts` | POST: bulk import material procurement Excel |
| `app/api/v1/ghg-data-import/transaction/capital-goods/excel/route.ts` | POST: bulk import capital goods Excel |
| `app/api/v1/ghg-data-import/transaction/use-of-sold-products/excel/route.ts` | POST: bulk import use-of-sold-products Excel |
| `app/api/v1/ghg-data-import/transaction/buyer-share/excel/route.ts` | POST: bulk import buyer-share Excel |
| `app/api/v1/ghg-data-import/transaction/product-share-allocation/excel/route.ts` | POST: bulk import product share allocation Excel |
| `app/api/v1/ghg-data-import/transaction/product-share-allocation/template/route.ts` | GET: download product share allocation template |
| `app/api/v1/ghg-data-import/transaction/clickhouse/route.ts` | POST: import transaction data to ClickHouse |
| `app/api/v1/master-data/organization-locations/listing/route.ts` | GET: paginated location listing |
| `app/api/v1/master-data/organization-locations/form/route.ts` | GET/POST/PUT: location CRUD |
| `app/api/v1/master-data/organization-locations/excel/route.ts` | POST: bulk import locations Excel |
| `app/api/v1/master-data/organization-details/form/route.ts` | GET/POST/PUT: organisation details CRUD |
| `app/api/v1/master-data/org-master-data/city/route.ts` | GET: city lookup |
| `app/api/v1/master-data/org-master-data/state/route.ts` | GET: state lookup |
| `app/api/v1/master-data/org-master-data/country/route.ts` | GET: country lookup |
| `app/api/v1/master-data/users/listing/route.ts` | GET: user listing |
| `app/api/v1/master-data/users/form/route.ts` | POST/PUT: user create/update (also calls SPA `CreateUser` API, sends welcome email) |
| `app/api/v1/master-data/users/user-activity-permission/route.ts` | GET/POST: user activity permission assignments |
| `app/api/v1/master-data/materials/listing/route.ts` | GET: material master listing |
| `app/api/v1/master-data/materials/excel/route.ts` | POST: bulk import materials Excel |
| `app/api/v1/master-data/supplier-material-mapping/listing/route.ts` | GET: supplier material mapping listing |
| `app/api/v1/master-data/supplier-material-mapping/counts/route.ts` | GET: mapping count by supplier |
| `app/api/v1/master-data/supplier-material-mapping/form/route.ts` | POST/PUT/DELETE: mapping CRUD |
| `app/api/v1/master-data/supplier-material-mapping/excel/route.ts` | POST: bulk import mapping Excel |
| `app/api/v1/master-data/supplier-material-mapping/template/route.ts` | GET: download mapping template |
| `app/api/v1/master-data/org-supplier-master-enterprise-setup/listing/route.ts` | GET: supplier master listing (enterprise) |
| `app/api/v1/master-data/org-supplier-master-enterprise-setup/export/route.ts` | GET: export supplier master |
| `app/api/v1/master-data/org-supplier-master-enterprise-setup/excel/route.ts` | POST: bulk import supplier master Excel |
| `app/api/v1/master-data/org-supplier-location-master/listing/route.ts` | GET: supplier location master listing |
| `app/api/v1/master-data/org-supplier-location-master/excel/route.ts` | POST: bulk import supplier location Excel |
| `app/api/v1/master-data/org-supplier-location-master/template/route.ts` | GET: download supplier location template |
| `app/api/v1/master-data/activity/[code]/download-template/route.ts` | GET: download activity-specific Excel template |
| `app/api/v1/master-data/activity/supplier-master/download-template/route.ts` | GET: download supplier master template |
| `app/api/v1/file-system/get-s3-upload-url/activity-excel-import/route.ts` | POST: presigned S3 URL for activity Excel uploads |
| `app/api/v1/file-system/get-s3-upload-url/master-data-excel-import/route.ts` | POST: presigned S3 URL for master data uploads |
| `app/api/v1/file-system/get-s3-upload-url/material-master-import/route.ts` | POST: presigned S3 URL for material master uploads |
| `app/api/v1/file-system/get-s3-upload-url/supplier-master-import/route.ts` | POST: presigned S3 URL for supplier master uploads |
| `app/api/v1/webhook/data-flow/route.ts` | POST: ESG data extraction webhook (static token `sk-op-test-token-123456`) [QA: hardcoded token] |
| `app/api/v1/webhook/internal/calculate-emission/route.ts` | POST: internal emission recalculation trigger |
| `app/api/v1/test/route.ts` | GET: test endpoint |
| `app/admin/api/emission-factor/route.ts` | GET/POST: admin emission factor management |
| `app/admin/api/uom-conversion/route.ts` | GET/POST: admin UOM conversion management |

---

## Embed Form Routes (API)

| File | Purpose |
|---|---|
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-fuel-consumption/general-purpose/route.ts` | POST/PUT/DELETE: general fuel consumption form entry |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-fuel-consumption/general-purpose/list/route.ts` | GET: list general fuel consumption entries |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/waste/route.ts` | POST/PUT/DELETE: waste data form entry |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/waste/list/route.ts` | GET: list waste entries |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-captive-power/non-renewable-fuel/route.ts` | POST/PUT/DELETE: non-renewable captive power fuel entry |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-captive-power/non-renewable-fuel/list/route.ts` | GET: list non-renewable captive power entries |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-captive-power/renewable/route.ts` | POST/PUT/DELETE: renewable captive power entry |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-captive-power/renewable/paginated/route.ts` | GET: paginated renewable captive power list |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-captive-power/renewable-fuel/route.ts` | POST/PUT/DELETE: renewable fuel captive power entry |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-grid-power/route.ts` | POST/PUT/DELETE: grid power form entry |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/energy-grid-power/list/route.ts` | GET: list grid power entries |

---

## Components

| File | Purpose |
|---|---|
| `components/ai-modules/DocumentViewer.tsx` | Renders PDF/image document for AI verification side-by-side view |
| `components/ai-modules/PDFViewer.tsx` | PDF.js-based PDF renderer |
| `components/ai-modules/ExtractedDataTable.tsx` | Editable table of AI-extracted data for human verification |
| `components/activity-data-records/activityDataRecordsTable.tsx` | MRT table of monthly activity data records |
| `components/location-listing-add-location/addLocationPage.tsx` | Location listing page wrapper |
| `components/location-listing-add-location/addLocationForm.tsx` | Location create/edit form (react-hook-form + zod) |
| `components/users-listing-add-users/addUserPage.tsx` | User listing page wrapper |
| `components/users-listing-add-users/addUserForm.tsx` | User create/edit form |
| `components/supplier-material-mapping/supplierMaterialMappingTable.tsx` | Supplier–material mapping MRT table |
| `components/supplier-material-mapping/SupplierMaterialMappingBulkUploadModal.tsx` | Bulk upload modal for supplier-material mapping |
| `components/supplier-location-master/supplierLocationMasterListingTable.tsx` | Supplier location master MRT table |
| `components/ghg-emission/GhgEmissionTable.tsx` | GHG emission summary table |
| `components/tables/mrtTable.tsx` | Generic reusable MRT table wrapper |
| `components/tables/DataImportHistoryTable.tsx` | Excel import history listing |
| `components/tables/AIDataImportHistoryTable.tsx` | AI import history listing |
| `components/tables/DataImportHistoryToolbar.tsx` | Toolbar for import history tables |
| `components/buyer-share-details/buyerShareDetails.tsx` | Buyer share details UI (PCF attribution) |
| `components/listing/index.tsx` | Generic listing container |
| `components/listing/header.tsx` | Listing page header with title and actions |
| `components/listing/body.tsx` | Listing body (table area) |
| `components/listing/footer.tsx` | Listing footer (pagination) |
| `components/listing/action-filters.tsx` | Listing filter action bar |
| `components/listing/header-filter.tsx` | Listing header filter controls |
| `components/ui/PhoneNumberInput.tsx` | Phone number input with country code |
| `components/ui/UnauthorizedPleaseLoginAgain.tsx` | Unauthorized state display |
| `components/user-activity-mapping-listing-popup/saveMappingPopup.tsx` | Confirm-save popup for user-activity mapping |
| `components/supplier-listing-add-supplier-enterprise-setup/addSupplierPage.tsx` | Supplier add page wrapper |
| `components/forms/EnergyDetails/CaptivePowerDetails.tsx` | Captive power accordion section component |
| `components/forms/EnergyDetails/FuelPurchased.tsx` | Fuel purchased accordion section component |
| `components/forms/EnergyDetails/GridPowerDetails.tsx` | Grid power accordion section component |
| `components/forms/GeneralDetails/GeneralDetails.tsx` | General details accordion section |
| `components/forms/Production/ProductionThisMonth.tsx` | Production data accordion section |
| `components/forms/Transport/BusinessTravelDetails.tsx` | Business travel accordion section |
| `components/forms/Transport/DownstreamTransportDetails.tsx` | Downstream transport accordion section |
| `components/forms/Transport/EmployeeTravelDetails.tsx` | Employee travel accordion section |
| `components/forms/Transport/UpstreamTransportDetails.tsx` | Upstream transport accordion section |
| `components/forms/Waste/Waste.tsx` | Waste data accordion section |

---

## Utils

| File | Purpose |
|---|---|
| `utils/types.ts` | Email-related TypeScript interfaces (`SendEmailParams`, `EmailTemplate`, `EmailSendResult`) |
| `utils/sanitize.util.ts` | String sanitisation functions (trim, lowercase, remove spaces) |
| `utils/common-functions.ts` | `handleDownload`, `formatDateDisplay`, `parseDateInput`, MRT table config helpers |
| `utils/date.util.ts` | Month arrays, date arithmetic, `validateMonthYear`, `getMonthNumberAndIndex`, `getPastYears` |
| `utils/enums.ts` | `YearType` enum (CALENDAR/FINANCIAL), `YearStartMonth` |
| `utils/const.ts` | App-wide constants and email template type keys |
| `utils/logger.ts` | Structured logger wrapper |
| `utils/email.util.ts` | `sendEmail`, `saveEmailLog`, `fetchEmailTemplate`, `dynamicEmailHeader`, template variable replacement |
| `utils/data-transformer.util.ts` | Data transformation helpers (e.g. `getFilenameFromURL`) |
| `utils/comapre.util.ts` | [QA: typo in filename] Comparison utility functions |
| `utils/env/env.server.ts` | `getServerEnv()` — Zod-validated server environment (loads from AWS Secrets Manager) |
| `utils/env/env.client.ts` | `clientEnv` — public-only client environment variables |
| `utils/jwt/client.ts` | `decodeToken()` — client-side JWT decode (no verification) |
| `utils/jwt/server.ts` | Server-side JWT sign/verify |
| `utils/jwt/getUserDataFromToken.ts` | `getUserRoleFromToken`, `getOrganizationIdFromToken`, `getUserIdFromToken`, `isAIEnable` |
| `utils/database/db-context.ts` | `GetOPSDBContext()` — Drizzle singleton connection |
| `utils/drizzle/connection.ts` | Drizzle Postgres connection setup |
| `utils/drizzle/schema.ts` | Drizzle table and view definitions |
| `utils/drizzle/schema-relations.ts` | Drizzle relational definitions |
| `utils/drizzle/relations.ts` | Additional Drizzle relation helpers |
| `utils/file-storage/server.service.ts` | S3 operations: presign, upload, get filename from S3 URL |
| `utils/file-storage/client.service.ts` | Client-side S3 upload helpers |
| `utils/dom-purifier/dom-purify.client.util.ts` | DOMPurify wrapper for client-side HTML sanitisation |
| `utils/dom-purifier/dom-purifier.server.util.ts` | DOMPurify wrapper for server-side HTML sanitisation (jsdom) |
| `utils/affinda/affinda.config.ts` | Affinda (AI document parser) API configuration |

---

## SQL Queries

| File | Purpose |
|---|---|
| `utils/queries/kpi_queries/view_overall_emission_from_kpi_main.sql` | View: total and scoped emissions per org/location/month from KPIMain |
| `utils/queries/kpi_queries/view_total_fuel_consumption.sql` | View: total Diesel fuel consumption from KPIEnergy |
| `utils/queries/kpi_queries/view_total_electricity_consumption.sql` | View: total electricity (captive + grid) from KPIEnergy |
| `utils/queries/kpi_queries/view_electricity_consumption_renewable_vs_non_reneweable.sql` | View: electricity split by renewable vs non-renewable and contract type |
| `utils/queries/kpi_queries/View_KPI_Water_Consumption.sql` | View: fresh/waste/harvested water consumption per org/location/month |
| `utils/queries/kpi_queries/View_KPI_Waste_Management.sql` | View: waste generated by type and disposal mechanism |
| `utils/queries/kpi_queries/view_global_filters.sql` | View: UNION of all KPI tables to derive available org/location/year/month filter options |

---

## Store / State

| File | Purpose |
|---|---|
| `app/[organizationId]/embed/v1/[accessToken]/data-import/store/global.store.ts` | Zustand global store for data import flow |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store.ts` | Zustand dashboard state for data import |
| `app/[organizationId]/embed/v1/[accessToken]/data-import/store/types.ts` | TypeScript types for import store |

---

## Server Actions

| File | Purpose |
|---|---|
| `app/actions/emissioncalculation.ts` | Server action: trigger emission recalculation |
| `app/actions/auditlog.ts` | Server action: write audit log entries |

---

## Admin Libs

| File | Purpose |
|---|---|
| `app/admin/libs/helpers/route-helpers.ts` | Admin route utilities |
| `app/admin/libs/fetcher/app-fetcher.ts` | Admin API fetch helper |
| `app/admin/libs/fetcher/use-fetcher.tsx` | Admin React hook for data fetching |
| `app/admin/libs/auth/auth-helpers.ts` | Admin authentication helpers |
| `app/admin/libs/common/types.ts` | Admin shared types |
| `app/admin/libs/guards/api-super-admin.guard.ts` | Guard: super-admin only API access |
| `app/admin/libs/guards/auth-guard.tsx` | Guard: admin auth React component |
| `app/admin/api/api-routes.ts` | Admin API route constants |
