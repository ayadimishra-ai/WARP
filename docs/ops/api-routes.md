# OPs GHG Calculator — API Routes

All routes in `app/api/v1/` unless noted. Every route uses the guard stack:

```typescript
apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(handler), {
    limitInterval: 1,       // minutes
    maxRequestCount: 60,    // default; approve uses 30
    progressiveDelay: true,
  })
)
```

`apiAuthGuard` validates the JWT from `x-sk-op-authorization` header and injects a `TUserSession` (`{ organizationId, userId, userRole, mappings }`) into the handler.

---

## Auth Routes

### `POST /api/v1/auth/access-token`
No auth guard (public).

**Request body:**
```json
{ "organization_id": "uuid", "user_email": "string" }
```

**Response:**
```json
{ "access_token": "string (JWT)" }
```

**Downstream:** `getAccessToken()` in `lib/auth/auth.server.ts` — signs HS256 JWT with Hasura claims embedded.

Rate limit: 60/min, no progressive delay.

---

### `POST /api/v1/auth/refresh-token`
[QA: Stub — handler calls `NextResponse.json(...)` but does NOT return it. Always returns `undefined`. Not functional.]

---

### `POST /api/v1/auth/revoke-token`
[QA: Same stub issue as refresh-token. Not functional.]

---

## Activity Routes

### `GET /api/v1/activity`
Fetches all activities for the authenticated organisation.

**Response:**
```json
{ "success": true, "data": [ /* Activity[] from Hasura */ ] }
```

**Downstream:** `sdk.getActivities({ organizationId })` via Hasura GraphQL.

---

## Monthly Activity Summary Routes

### `POST /api/v1/monthly-activity-summary`
Dual-path route controlled by `is_export` flag.

**Request body (summary path):**
```json
{
  "is_export": false,
  "tab": "activity_type" | "location_wise",
  "year": number | "all",
  "yearType": "financial" | "calendar",
  "locationIds": string[],
  "months": string[],
  "pageIndex": number,
  "pageSize": number,
  "statusFilter": "pending" | "approved" | null,
  "search": "string (location_wise only)"
}
```

**Request body (export path):**
```json
{
  "is_export": true,
  "activityCode": "string (alphanumeric+underscore only)",
  "activityName": "string",
  "year": number,
  "yearType": "financial" | "calendar",
  "locationIds": string[],
  "months": string[],
  "statusFilter": "pending" | "approved" | null,
  "clientDateTime": "ISO datetime string"
}
```

**Response (summary):**
```json
{
  "success": true,
  "data": {
    "summary": { "total": 0, "pending": 0, "approved": 0, "rejected": 0 },
    "rows": [ /* TActivityRow[] or TLocationRow[] */ ],
    "totalCount": number
  }
}
```

**Response (export):**
```json
{ "success": true, "data": { "downloadUrl": "string (S3 presigned)" } }
```

**Downstream:** `getSummaryData()` or `exportActivityData()` in `lib/monthly-activity-summary/service.ts`. Uses raw SQL via `GetOPSDBContext()`. Results cached with Next.js `unstable_cache`.

Rate limit: 60/min, progressive delay.

---

### `POST /api/v1/monthly-activity-summary/approve`
OrganizationAdmin only (HTTP 403 for other roles).

**Request body:**
```json
{
  "activityCode": "string",
  "year": number,
  "yearType": "financial" | "calendar",
  "locationIds": string[],
  "months": string[]
}
```

**Response:**
```json
{ "success": true, "data": { "approvedCount": number, "approvedLocationIds": string[] } }
```

**Downstream:** `approveActivity()` in `lib/monthly-activity-summary/service.ts`. On success:
- Calls `revalidateTag()` to bust summary and filters cache
- Fires `notifyLocationExecutivesOnApproval()` email via `after()` (post-response)

Rate limit: 30/min, progressive delay.

---

### `GET /api/v1/monthly-activity-summary/filters`
Returns filter metadata for the data-log-summary UI.

**Query params:** `year` (optional), `locationIds` (comma-separated, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "locations": [{ "id": "uuid", "name": "string" }],
    "years": [{ "value": "string", "label": "string" }],
    "financialYearStartMonth": number,
    "yearType": "financial" | "calendar",
    "defaultYear": number,
    "defaultMonth": "string | null",
    "monthsWithData": ["string"]
  }
}
```

**Downstream:** `getFilters()` in `lib/monthly-activity-summary/service.ts`.

---

## Excel Import Routes (GHG Transactions)

All follow the same pipeline. Example: `POST /api/v1/ghg-data-import/transaction/energy-fuel-purchased/excel`

**Request body:**
```json
{ "fileUrl": "string (S3 URL)", "organizationAddressId": "uuid" }
```

**Response (success):**
```json
{ "success": true, "data": { /* DataImportHistory record */ } }
```

**Response (failure — template or data validation error):**
```json
{ "success": false, "data": { "file_url": "string (error Excel S3 URL)" } }
```

**Downstream pipeline:**
1. `validateUserActivityAndOrganizationAddressPermissions()` — checks user has permission for this location and activity
2. `sdk.getAddressDetail()` — fetch location ownership type and address type
3. `readDataFromURL(fileUrl)` — read Excel from S3
4. Filter sheets by address type, trim columns and trailing blank rows
5. `validateExcelTemplate()` — check sheet names and required columns
6. `validateExcelTemplateData()` — check lookup values, date ranges, baseline constraints; checks approval lock
7. If validation passes: `saveFuelPurchasedSheetEntries()` (or equivalent per activity)
8. `insertNewDataImportHistory()` — record import event
9. `calculateEmission()` — run emission calculation engine
10. `saveEmissionDashboard()` — write to KPI tables
11. `emissionCalculationForBuyer()` — propagate to buyer organisations
12. `calculatePCFEmissionFromSupplierData()` — PCF calculation

Activities covered by Excel import routes:
- `energy-fuel-purchased` (general, heating-water, auxiliary, transportation sub-types)
- `energy-grid-power`
- `energy-captive-power`
- `transport-upstream`
- `transport-downstream`
- `transport-employee-travel`
- `transport-business-travel`
- `waste`
- `water-withdrawal`
- `water-consumption`
- `wastewater-generation`
- `wastewater-treatment`
- `fugitive`
- `general`
- `production`
- `material-procurement`
- `capital-goods`
- `use-of-sold-products`
- `buyer-share`
- `product-share-allocation`

---

## Master Data Routes

### `GET /api/v1/master-data/organization-locations/form`
Header: `address_id: uuid`

Returns location detail for editing.

**Downstream:** `GetAddressDetail(addressId, organizationId)`

### `POST /api/v1/master-data/organization-locations/form`
**Request body:** Location form fields (name, code, city, state, country, ownership_type, type, etc.)

Validates org activities to determine if WWTP is enabled, then inserts via `SaveAddressDetail()`.

**Response:** `{ "success": true, "data": [Address] }`

### `PUT /api/v1/master-data/organization-locations/form`
Updates existing location via `UpdateAddressDetail()`.

---

### `POST /api/v1/master-data/users/form`
Creates a user. Multi-step:
1. Schema + data validation
2. Checks SPA API `GetUserDetailsByEmailId` — if "New User", creates in Hasura then calls SPA `CreateUser`
3. If "OP Permissions Updated", inserts with `isRegistered: true`
4. Sends `Welcome_Email` template to new OrganizationAdmin users

**Request body:** Array of user objects `[{ name, email, mobile, role, ... }]`

[QA: Email is encrypted with `choosemethod(email, "encrypt")` before sending to SPA but stored as plaintext in Hasura. Inconsistency risk.]

### `PUT /api/v1/master-data/users/form`
Updates existing user. Calls SPA `CreateUser` with `process: "UPDATE"`. Sends welcome email for role changes.

[QA: PUT handler does NOT use `apiAuthGuard` — session extracted manually from headers. Auth inconsistency.]

---

## Webhook Routes

### `POST /api/v1/webhook/data-flow`
[QA: Uses a hardcoded static token `sk-op-test-token-123456` in the `x-sk-op-authorization` header. Not suitable for production.]

**Request body:**
```json
{
  "organization_id": "uuid",
  "period_from": { "year": number, "month": number },
  "period_to": { "year": number, "month": number },
  "data_keys": ["EM_SCOPE1" | "EM_SCOPE2" | "EM_SCOPE3" | "HR_EMPLOYEE_TURNOVER" | "GRIEVANCES" | "GOVERNANCE_BOARD_COPMPOSITION" | "HEALTH_AND_SAFETY" | "RENEWABLE_ELECTRICITY_CONSUMPTION"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "EM_SCOPE1": [],
    "EM_SCOPE2": [],
    /* ... other requested keys ... */
  }
}
```

**Downstream:** `getDataFlowResult()` dispatches to Hasura GraphQL SDK queries per `data_key`:
- `EM_SCOPE1/2/3` → `getESGScopeXEmission()`
- `GRIEVANCES` → `getESGGrievancesByPeriod()`
- `GOVERNANCE_BOARD_COPMPOSITION` → `getESGBoardCompositionByPeriod()` [QA: typo "COPMPOSITION"]
- `HEALTH_AND_SAFETY` → `getESGHealthAndSafetyByPeriod()`
- `HR_EMPLOYEE_TURNOVER` → `getESGEmployeeTurnoverByPeriod()`
- `RENEWABLE_ELECTRICITY_CONSUMPTION` → `getESGRenewableElectricityConsumption()`

---

## S3 Upload URL Routes

### `POST /api/v1/file-system/get-s3-upload-url/activity-excel-import`
Returns a presigned S3 PUT URL for Excel activity data uploads.

**Response:** `{ "success": true, "data": { "uploadUrl": "string", "fileUrl": "string" } }`

---

## Admin Routes

### `GET /admin/api/emission-factor`
Lists emission factors. Super-admin only via `api-super-admin.guard.ts`.

### `POST /admin/api/emission-factor`
Creates or updates an emission factor.

### `GET /admin/api/uom-conversion`
Lists UOM conversion factors.

### `POST /admin/api/uom-conversion`
Creates or updates a UOM conversion.

---

## Embed Form Routes (Data Import Forms)

Routes under `app/[organizationId]/embed/v1/[accessToken]/data-import/forms/` handle per-entry CRUD for manual data entry. Each route:

- Validates the JWT from the URL `accessToken` parameter
- Checks approval lock via `assertNoApprovalLock()` before writes
- Calls `getTaskRequestActvityTaskRequestId()` for INSERT (includes lock check)
- For UPDATE/DELETE: fetches DB record first, then checks lock using DB values (not client input)

Example: `POST/PUT/DELETE /[orgId]/embed/v1/[token]/data-import/forms/energy-fuel-consumption/general-purpose`

**Request:** Energy consumption entry fields (month, year, fuel_type, quantity, uom, etc.)
**Response:** `{ "success": true, "data": { /* saved record */ } }`
