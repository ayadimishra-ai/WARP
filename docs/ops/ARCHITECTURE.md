# OPs GHG Calculator — Architecture

## System Purpose

Snowkap OPs is a multi-tenant GHG (Greenhouse Gas) emissions calculator built as a Next.js application. It enables organisations to:

- Import activity data (energy, fuel, transport, waste, water, material procurement) via Excel upload or manual forms
- Run automated emission calculations against configurable emission factors (Scope 1, 2, and 3)
- Track approval workflows for uploaded data (Pending → Approved)
- View KPI dashboards (total emissions by scope, intensity per tonne/employee/product, water consumption, waste, electricity)
- Support buyer–supplier supply chain emission attribution (PCF)
- Serve embedded widget pages inside a parent SPA (the WARP shell)

---

## Technology Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | React 19, Turbopack for dev |
| Language | TypeScript 5 | Strict mode |
| UI Library | Mantine v8 | Full suite: core, dates, charts, forms, modals, notifications, spotlight |
| Styling | TailwindCSS + PostCSS | PostCSS Mantine preset |
| Icons | Tabler Icons, FontAwesome | |
| Tables | mantine-react-table v2 | Column defs via `useMemo<MRT_ColumnDef<T>[]>()` |
| Charts | amcharts5 | GHG dashboard visualisations; also recharts in some places |
| State Management | Zustand + react-hook-form | No Redux/Recoil |
| Forms | react-hook-form + zod | Always `"use client"`, zodResolver, mode: `"onChange"` |
| GraphQL (browser) | Apollo Client 3 | Hasura backend, JWT auth via auth link |
| GraphQL (server) | graphql-request SDK | Admin secret, generated via codegen |
| Direct DB | Drizzle ORM 0.33 | Postgres; secondary for non-Hasura tables only |
| Auth | Custom JWT (HS256) | Header: `x-sk-op-authorization`, Hasura claims embedded |
| File Storage | AWS S3 + S3 presigned URLs | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` |
| Secrets | AWS Secrets Manager | No `.env` files in production |
| Email | Nodemailer (SMTP) | Templates stored in Hasura, variables replaced at send time |
| Rate Limiting | express-rate-limit (in-memory) | Progressive delay variant; resets on server restart [QA] |
| Excel | exceljs + xlsx | Import parsing and export generation |
| PDF | pdfjs-dist + jspdf + html2canvas | Document viewer and export |
| Analytics DB | ClickHouse | `@clickhouse/client`; used for transaction import via clickhouse route |
| Cache | Redis | Session / KPI cache |
| Package Manager | yarn 1.22 (only) | npm is blocked in engine config |
| Node | 20.x (Volta pinned) | Dockerfile uses node:18 [QA: mismatch] |

---

## App Router Layout

```
app/
  layout.tsx                          Root layout (Mantine providers)
  page.tsx                            Root redirect / landing
  admin/                              Admin panel (super-admin protected)
    layout.tsx
    api/
      emission-factor/route.ts
      uom-conversion/route.ts
    (features)/
      emission-factors/listing/page.tsx
      uom-conversion/listing/page.tsx
  actions/                            Next.js server actions
    emissioncalculation.ts
    auditlog.ts
  api/v1/                             REST API surface
    auth/access-token/route.ts
    auth/refresh-token/route.ts       [QA: stub — returns nothing]
    auth/revoke-token/route.ts        [QA: stub — returns nothing]
    activity/route.ts
    activity-form/mode/route.ts
    emission-factor/get-emission-factor/route.ts
    ghg-data-import/transaction/      Bulk Excel import per activity type
      energy-fuel-purchased/excel/route.ts
      energy-grid-power/excel/route.ts
      energy-captive-power/excel/route.ts
      transport-upstream/route.ts + excel/
      transport-downstream/route.ts + excel/
      waste/excel/route.ts
      water-withdrawal/excel/route.ts
      water-consumption/excel/route.ts
      wastewater-generation/excel/route.ts
      wastewater-treatment/excel/route.ts
      fugitive/excel/route.ts
      general/excel/route.ts
      production/route.ts + excel/
      material-procurement/excel/route.ts
      capital-goods/excel/route.ts
      use-of-sold-products/excel/route.ts
      buyer-share/excel/route.ts
      product-share-allocation/excel/ + template/
      transport-employee-travel/excel/route.ts
      transport-business-travel/excel/route.ts
      clickhouse/route.ts
    master-data/
      organization-locations/listing/ + form/ + excel/
      organization-details/form/
      org-master-data/city/ + state/ + country/
      users/listing/ + form/ + user-activity-permission/
      materials/listing/ + excel/
      supplier-material-mapping/listing/ + form/ + counts/ + excel/ + template/
      org-supplier-master-enterprise-setup/listing/ + export/ + excel/
      org-supplier-location-master/listing/ + excel/ + template/
      activity/[code]/download-template/
      activity/supplier-master/download-template/
    monthly-activity-summary/
      route.ts                        POST: summary query or export
      approve/route.ts                POST: approve activity (OrganizationAdmin only)
      filters/route.ts                GET: available locations, years, months
    org-buyersuppliermethod-data/route.ts
    org-buyer-supplier-mapping/route.ts
    organization-address/route.ts
    users/activity-permissions/route.ts
    users/buyer-supplier-role/route.ts
    monthly-activity-data/route.ts
    file-system/get-s3-upload-url/    S3 presigned URL generators
    webhook/
      data-flow/route.ts              ESG data extraction webhook (static token auth)
      internal/calculate-emission/    Internal emission recalculation trigger
    test/route.ts
  [organizationId]/
    embed/v1/[accessToken]/           Embeddable tenant-scoped pages
      layout.tsx                      ComponentAuthGuardWrapper + ApolloWrapper
      ghg-dashboard/                  GHG KPI dashboard (parallel route slots)
      data-log-summary/               Monthly activity summary + approval UI
      activity-data-records/
      ai-verify-extracted-data/
      ghg-forms/                      Accordion multi-step form entry
      data-import/
        forms/energy-fuel-consumption/
        forms/energy-captive-power/
        forms/energy-grid-power/
        forms/waste/
        api/history/
        excel/history/
      manual-entry-data/
        fuel-consumption/
        energy-grid/
        waste-data/
        captive-power/
      add-location/
      location-listing/
      add-user/
      user-listing/
      user-activity-mapping/
      organization-details/
      organization-setup/locations/form/
      supplier-master-listing-enterprise-setup/
      supplier-location-master/
      supplier-location-master-list/
      supplier-material-mapping/
      material-listing/
      buyer-share-details/
      net-zero-target-setting/
      save-mapping-popup/
      common-table/
```

---

## Auth Model

1. The parent SPA calls `POST /api/v1/auth/access-token` with `{ organization_id, user_email }`.
2. The server signs a HS256 JWT containing Hasura claims:
   - `x-hasura-org-id` — used for Hasura row-level security
   - `x-hasura-user-id`
   - `x-hasura-default-role` (`OrganizationAdmin` or `LocationExecutive`)
   - `x-hasura-allowed-roles`
   - `x-hasura-is-AI-enabled`
3. The client stores the token in `localStorage.access_token`.
4. All API route calls carry the token in the `x-sk-op-authorization` header.
5. Embedded pages receive `organizationId` and `accessToken` as URL path segments: `/:organizationId/embed/v1/:accessToken/...`
6. Apollo Client injects a Bearer token via auth link for GraphQL operations.
7. Server-side SDK (`getGraphQlServerSDK()`) uses the Hasura admin secret directly — bypasses RLS.

Roles enforced:
- `OrganizationAdmin` — can approve activity data, view all locations, export, toggle tabs
- `LocationExecutive` — can upload data, export, view only their assigned locations

---

## Data Flow

```
Parent SPA
  │ iframe / embed URL with [organizationId]/[accessToken]
  ▼
EmbedLayout (ComponentAuthGuardWrapper validates JWT)
  │
  ├─► Apollo Client (browser) ──► Hasura GraphQL (RLS via JWT org claims)
  │                                       │
  │                                       └─► Primary Postgres DB
  │
  ├─► REST API routes (app/api/v1/) ──► apiAuthGuard (validates JWT)
  │     │
  │     ├─► getGraphQlServerSDK() (admin secret) ──► Hasura
  │     ├─► GetOPSDBContext() (Drizzle) ──► Postgres (secondary tables)
  │     ├─► calculateEmission() ──► Emission calculation engine
  │     ├─► saveEmissionDashboard() ──► KPI tables
  │     └─► emissionCalculationForBuyer() ──► PCF propagation
  │
  └─► window.parent.postMessage() ──► Parent SPA (approval confirmation,
                                        URL change notification, scroll events)
```

---

## Key Patterns

### API Route Guard Stack
Every route handler is wrapped in three layers (outermost first):
```typescript
export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(handler), {
    limitInterval: 1,      // minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
```

### Dual Database
- **Hasura GraphQL** (primary): All GHG transaction tables, KPI tables, activity master, emission factors, users. Accessed via Apollo on browser, `getGraphQlServerSDK()` with admin secret on server.
- **Drizzle ORM** (secondary): `Organizations`, `SupplierInvitations`, `EmailTemplates`, `GlobalConfigs`, `BuyerSupplierAddressMappings`. Schema in `utils/drizzle/schema.ts`, singleton via `GetOPSDBContext()`. [QA: Drizzle queries must manually filter by org_id — no automatic scoping]

### Excel Import Pipeline
For each activity type, the Excel upload route:
1. Validates presigned S3 URL
2. Validates user permissions for the location
3. Reads Excel from S3 URL via `readDataFromURL()`
4. Filters sheets by address ownership type and address type
5. Trims column names and trailing blank rows
6. Runs template validation (sheet names, required columns)
7. Runs data validation (lookup values, date range, baseline constraints)
8. On error: uploads error Excel to S3, records failed import history, returns `{ success: false }`
9. On success: saves to GHG tables, records import history, triggers emission calculation, propagates to buyer PCF

### Monthly Activity Summary
Raw SQL via `GetOPSDBContext()` only (Hasura GraphQL is not used for this module). Status NULL / `'pending'` / `'saved'` are all treated as Pending. Approval is OrganizationAdmin-only, enforced server-side.

### Approval Lock (RULE-008)
Before any DB write in bulk upload or form routes, `assertNoApprovalLock()` is called. This prevents writing to periods that have already been approved.

### Embedded Iframe Communication
Pages post messages to the parent SPA (`window.parent.postMessage`) for:
- `warp-approved-successfully` — after approval
- `data-log-approval-confirm-popup` — to open confirmation modal in parent
- `data-log-approval-confirmed` — parent sends back after user confirms
- `ai-verify-url-change` — update parent URL when navigating AI verify pages
- `AIExtractedDataValidationPopup` — show unsaved-changes confirmation
- `scrollToTop` — ask parent to scroll

### Environment Management
`APP_ENV` env var controls environment (`live`, `beta`, `demo`). Server env loaded from AWS Secrets Manager via `scripts/load-secrets.mjs` at startup. Client env from `utils/env/env.client.ts` (public vars only). All env access goes through `getServerEnv()` (Zod-validated) on the server.

### GraphQL Codegen
`.gql` files in `graphql/queries/`, `graphql/mutations/`, `graphql/subscriptions/` are compiled by `yarn codegen` into `*.generated.tsx` files (near-operation-file preset). Never edit generated files directly.
