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

## QA Status Legend

- ✅ QA'd — clean or fixed
- 🔧 QA'd — bugs fixed (see CHANGELOG.md)
- ⚠️ QA'd — accepted-risk finding, not fixed

---

## Auth Routes

### `POST /api/v1/auth/access-token` ✅
No auth guard (public — this IS the auth endpoint).

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

### `POST /api/v1/auth/refresh-token` 🔧
Auth: none (public stub). Fixed: handler was not returning the `NextResponse.json(...)` result — always returned `undefined`. Added `return`.

---

### `POST /api/v1/auth/revoke-token` 🔧
Auth: none (public stub). Fixed: same missing `return` as refresh-token.

---

## Activity Routes

### `GET /api/v1/activity` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min progressive delay. Fixed: removed inner try/catch that swallowed errors and called `console.error`.

**Response:**
```json
{ "success": true, "data": [ /* Activity[] from Hasura */ ] }
```

---

### `GET /api/v1/activity-form/mode` 🔧
Auth: `apiAuthGuard`. Fixed: added missing rate limiting (`withEmailOrIpRateLimitWithProgressiveDelay`).

---

## Monthly Activity Summary Routes

### `POST /api/v1/monthly-activity-summary` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min progressive delay.

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

**Downstream:** `getSummaryData()` or `exportActivityData()` in `lib/monthly-activity-summary/service.ts`.

---

### `POST /api/v1/monthly-activity-summary/approve` ✅
Auth: `apiAuthGuard`. Rate limit: 30/min progressive delay. OrganizationAdmin only (HTTP 403 for other roles).

---

### `GET /api/v1/monthly-activity-summary/filters` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min progressive delay.

---

## Monthly Activity Data

### `POST /api/v1/monthly-activity-data` 🔧
Auth: `apiAuthGuard`. **CRITICAL FIX:** SQL injection — `organizationId` from request body was interpolated directly into raw SQL without UUID validation. Fixed by adding Zod `.uuid()` validation before interpolation.

---

## AI File Processing

### `POST /api/v1/ai-monthly-activity-data` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min progressive delay.

### `POST /api/v1/ai-file-processing-webhook` 🔧
Auth: **Affinda webhook — HMAC-SHA256 signature** (not user JWT).
**CRITICAL FIX:** No authentication existed on actual event payloads — any caller could trigger AI file processing. Added HMAC-SHA256 signature verification using `AFFINDA_WEBHOOK_SIGNATURE_KEY` and `timingSafeEqual`.

---

## Emission / Calculation Routes

### `POST /api/v1/webhook/internal/calculate-emission` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min progressive delay.

### `POST /api/v1/distance-matrix-calculation` 🔧
Auth: **CRON secret** (not user JWT). **CRITICAL FIX:** Hardcoded secret `"EzqUt3IXQxidMdRA"` in `input.constant.ts`; string `==` comparison (timing attack); no `apiExceptionGuard`. Fixed: use `env.CRON_SECRET` via `timingSafeEqual`; wrapped in `apiExceptionGuard`.

### `POST /api/v1/update-business-travel-data` 🔧
Auth: **CRON secret** (not user JWT). Same CRITICAL fix as `distance-matrix-calculation`.

---

## Email Route

### `POST /api/v1/email` 🔧
Auth: `apiAuthGuard`. Rate limit: 60/min progressive delay. Fixed: removed `console.log("success")` / `console.log("fail")` — these leaked email send outcome to server logs.

---

## Emission Factor

### `POST /api/v1/emission-factor/get-emission-factor` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min progressive delay.

---

## ESG Data Import Routes (all ✅)

All ESG routes follow the standard guard pattern:

- `POST /api/v1/esg-data-import/transaction/csr/excel`
- `POST /api/v1/esg-data-import/transaction/governance-and-board-composition/excel`
- `POST /api/v1/esg-data-import/transaction/grievances/excel`
- `POST /api/v1/esg-data-import/transaction/health-and-safety/excel`
- `POST /api/v1/esg-data-import/transaction/human-resources/excel`

Auth: `apiAuthGuard`. Rate limit: 60/min.

---

## GHG Data Import Routes (all ✅ unless noted)

All GHG routes use `apiExceptionGuard(apiAuthGuard(...))` at minimum:

- `POST /api/v1/ghg-data-import/transaction/buyer-share/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/capital-goods/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/clickhouse` ✅
- `POST /api/v1/ghg-data-import/transaction/energy-captive-power/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/energy-fuel-purchased/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/energy-grid-power/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/fugitive/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/general/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/material-procurement/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/product-share-allocation/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/product-share-allocation/template` ✅
- `POST /api/v1/ghg-data-import/transaction/production/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/production` ✅
- `POST /api/v1/ghg-data-import/transaction/transport-business-travel/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/transport-downstream/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/transport-downstream` ✅
- `POST /api/v1/ghg-data-import/transaction/transport-employee-travel/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/transport-upstream/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/transport-upstream` ✅
- `POST /api/v1/ghg-data-import/transaction/use-of-sold-products/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/waste/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/wastewater-generation/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/wastewater-treatment/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/water-consumption/excel` ✅
- `POST /api/v1/ghg-data-import/transaction/water-withdrawal/excel` ✅

---

## File System Routes

### `POST /api/v1/file-system/get-s3-upload-url/activity-excel-import` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `POST /api/v1/file-system/get-s3-upload-url/master-data-excel-import` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `POST /api/v1/file-system/get-s3-upload-url/material-master-import` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `POST /api/v1/file-system/get-s3-upload-url/supplier-master-import` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

---

## Internal Routes

### `POST /api/v1/internal/generate-link/set-new-password` 🔧
Auth: **SK_SERVICES_AUTH_TOKEN** (service-to-service, not user JWT). Fixed: changed `!== ` string comparison to `timingSafeEqual` to prevent timing attacks.

### `POST /api/v1/internal/kpi-calculation` 🔧
Auth: `apiAuthGuard`. Previously fixed: no auth guard existed.

---

## Master Data Routes

### `GET /api/v1/master-data/activity/[code]/download-template` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET /api/v1/master-data/activity/supplier-master/download-template` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET|POST /api/v1/master-data/materials/excel` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET /api/v1/master-data/materials/listing` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET /api/v1/master-data/org-master-data/city` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET /api/v1/master-data/org-master-data/country` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET /api/v1/master-data/org-master-data/state` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET|POST|PUT /api/v1/master-data/org-supplier-location-master/excel` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET /api/v1/master-data/org-supplier-location-master/listing` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min. OrganizationAdmin only.

### `GET /api/v1/master-data/org-supplier-location-master/template` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min. OrganizationAdmin only.

### `POST /api/v1/master-data/org-supplier-master-enterprise-setup/excel` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `POST /api/v1/master-data/org-supplier-master-enterprise-setup/export` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET /api/v1/master-data/org-supplier-master-enterprise-setup/listing` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET|PUT /api/v1/master-data/organization-details/form` ✅ ⚠️
Auth: `apiAuthGuard`. Rate limit: 60/min. Note: role check returns HTTP 200 with `status: 403` in body instead of actual HTTP 403 — accepted risk.

### `GET /api/v1/master-data/organization-locations/excel` ✅ (empty stub)

### `GET|POST|PUT /api/v1/master-data/organization-locations/form` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET /api/v1/master-data/organization-locations/listing` 🔧
Auth: `apiAuthGuard`. Rate limit: 60/min. Fixed: `organizationId` was read from client-supplied header instead of JWT session.

### `GET /api/v1/master-data/supplier-material-mapping/counts` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min. OrganizationAdmin only.

### `POST /api/v1/master-data/supplier-material-mapping/excel` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET|POST|PUT|DELETE /api/v1/master-data/supplier-material-mapping/form` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min. OrganizationAdmin only.

### `GET /api/v1/master-data/supplier-material-mapping/listing` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET /api/v1/master-data/supplier-material-mapping/template` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

### `GET|POST|PUT /api/v1/master-data/users/form` 🔧
Auth: `apiAuthGuard`. Rate limit: 60/min. Fixed: POST and PUT handlers read `organization_id`/`userId` from client-supplied headers instead of JWT session — privilege escalation risk. Changed to use session values.

### `GET /api/v1/master-data/users/listing` 🔧
Auth: `apiAuthGuard`. Rate limit: 60/min. Fixed: `organization_id` and `userId` read from client-supplied headers. Changed to use session values.

### `GET|POST /api/v1/master-data/users/user-activity-permission` 🔧
Auth: `apiAuthGuard`. Rate limit: 60/min. Fixed: POST handler ignored session, read `organization_id`/`sessionUserId` from client-supplied headers. Changed to use session values.

---

## Net Zero Target Year

### `POST /api/v1/net-zero-target-year/form` 🔧
Auth: `apiAuthGuard`. Fixed: missing rate limiting; 403 returned as HTTP 200 with status field in body — changed to throw `CustomError({ statusCode: 403 })`.

### `POST /api/v1/net-zero-target-year` 🔧
Auth: `apiAuthGuard`. Fixed: missing rate limiting.

---

## Organization Routes

### `GET /api/v1/organization-address` 🔧
Auth: `apiAuthGuard`. Rate limit: 60/min. Fixed: removed inner try/catch that swallowed errors and called `console.error`.

### `POST /api/v1/org-buyer-supplier-mapping` 🔧
Auth: `apiAuthGuard`. Rate limit: 60/min. Fixed: hardcoded buyer org UUID `"cb3a1243-c11b-4eb5-ae3d-061ff9178b6b"` (Daimler) replaced with validated `buyerOrgId` from request body (Zod UUID validation). Added missing rate limiting.

### `POST /api/v1/org-buyersuppliermethod-data` ✅
Auth: `apiAuthGuard`. Rate limit: 60/min.

---

## Platform Sync Routes (Internal Service-to-Service)

All four routes previously had **no authentication** and echoed `req.body` (which is a `ReadableStream`, not parsed data). Fixed by adding `SK_SERVICES_AUTH_TOKEN` verification via `timingSafeEqual` and wrapping in `apiExceptionGuard`.

### `POST /api/v1/platform-sync/organization/remove` 🔧
Auth: **SK_SERVICES_AUTH_TOKEN** (service-to-service). Previously: no auth, stub only.

### `POST /api/v1/platform-sync/organization/upsert` 🔧
Auth: **SK_SERVICES_AUTH_TOKEN** (service-to-service). Previously: no auth, stub only.

### `POST /api/v1/platform-sync/users/remove` 🔧
Auth: **SK_SERVICES_AUTH_TOKEN** (service-to-service). Previously: no auth, stub only.

### `POST /api/v1/platform-sync/users/upsert` 🔧
Auth: **SK_SERVICES_AUTH_TOKEN** (service-to-service). Previously: no auth, stub only.

---

## Sample/Test Routes

### `GET|POST /api/v1/sample-route` 🔧
**CRITICAL FIX:** Was publicly accessible with no auth; contained SQL injection (raw string interpolation of user-supplied `organizationId`); no `apiExceptionGuard`. Replaced with a safe stub — `apiAuthGuard`, `apiExceptionGuard`, and rate limiting added; raw SQL and hardcoded org UUID removed.

### `GET /api/v1/test` 🔧
Auth: `apiAuthGuard` (previously fixed). Rate limit: 60/min.

---

## Users Routes

### `POST /api/v1/users/activity-permissions` 🔧
Auth: `apiAuthGuard`. Rate limit: 60/min. Fixed: handler ignored JWT session and read `organizationId`/`userId` from request body (cross-tenant access risk); inner try/catch swallowed errors bypassing `apiExceptionGuard`; missing `TUserSession` import. All fixed.

### `POST /api/v1/users/buyer-supplier-role` 🔧
Auth: `apiAuthGuard`. Rate limit: 60/min. Fixed: handler ignored JWT session and read `organizationId` from request body; inner try/catch with `console.error` swallowed errors; missing `TUserSession` import. All fixed.

---

## Webhook Routes

### `POST /api/v1/webhook/data-flow` 🔧
Auth: **DATA_FLOW_WEBHOOK_SECRET** (previously fixed). Uses `timingSafeEqual`.

### `POST /api/v1/webhooks/reminders/upload-pending-first` 🔧
Auth: **CRON_SECRET** (previously fixed). Uses `timingSafeEqual`.

### `POST /api/v1/webhooks/reminders/upload-pending-tenth` 🔧
Auth: **CRON_SECRET** (previously fixed). Uses `timingSafeEqual`.

---

## Library / Utility Files

### `ops/lib/guards/api-exception-guard.ts` 🔧
**HIGH:** Full error object (including `query`, `parameters`, `driverError`, DB schema/table/column/constraint fields) was spread into the API response. Fixed: explicit deletion of all DB-internal and sensitive fields before responding.

### `ops/lib/guards/api-user-auth-guard.ts` ✅
Clean. Validates JWT via `getUserSession()` which calls `jwt.verify()` with the HASURA_JWT_SECRET. Returns 401 on any failure.

### `ops/lib/rate-limiter/progressive-delay-rate-limit.ts` ✅
Clean. In-memory store (resets on server restart — acceptable for serverless/edge). Per-endpoint composite key prevents global rate sharing. Serial queue prevents race conditions.

### `ops/lib/auth/auth.client.ts` ✅ ⚠️
`decodeToken()` uses `jwt.decode()` (no signature verification) — intentional for client-side claim reading. Server-side auth in `auth.server.ts` uses `jwt.verify()`. `getOrgIdFromAccessToken` is a duplicate of `getUserOrganizationId` — dead code but not harmful.

### `ops/utils/drizzle/schema.ts` ⚠️
`SupplierInvitations.id` defined with `.defaultRandom()` but no `.primaryKey()` — should be a PK. Requires DB migration; out of QA scope.

### `ops/utils/file-storage/server.service.ts` 🔧
`console.log(fileMetadata)` logged S3 object metadata (may contain org IDs, user emails) to server stdout. Removed.
