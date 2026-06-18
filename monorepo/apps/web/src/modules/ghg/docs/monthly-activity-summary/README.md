# All Monthly Activity Summary

**Route:** `/:organizationId/embed/v1/:accessToken/data-log-summary`

Provides an aggregated view of all `ActivityTaskRequest` records across locations and time periods — showing approval workflow status (Pending / Approved / Rejected) per activity type or per location. Organisation Admins can bulk-approve data directly from this page.

---

## API Endpoints

### `GET /api/v1/monthly-activity-summary/filters`
Called once on page mount. Returns all data needed to populate filter controls.

**Response:**
```json
{
  "locations":               [{ "id": "uuid", "name": "Mumbai" }],
  "years":                   [{ "value": "2025", "label": "April 2025 to March 2026" }],
  "financialYearStartMonth": 4,
  "yearType":                "financial" | "calendar",
  "defaultYear":             2025,
  "defaultMonth":            "april" | null
}
```

- `locations` — scoped to the authenticated user's `session.mappings` (only org addresses the user has access to).
- `years` — built from `Organization.Baselineyear` → current FY, newest first.
- `defaultYear` — **FY start year** of the latest year that has real `ActivityTaskRequest` data. Falls back to current FY start year if no data exists. This is NOT `MAX(tr.year)` — see [Year Logic](#year-logic).
- `defaultMonth` — lowercase full name (e.g. `"april"`) of the most recent month that has data within `defaultYear`. `null` when no records exist. Optional in the response: if omitted, the UI reverts to no month pre-selection without breaking anything.

---

### `GET /api/v1/monthly-activity-summary`
Called on every filter/tab/page change.

**Query params:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `tab` | `activity_type` \| `location_wise` | `activity_type` | Determines grouping |
| `yearType` | `financial` \| `calendar` | `financial` | From org setting |
| `year` | number \| `"all"` | current FY start year | FY start year (e.g. `2025` = Apr 2025–Mar 2026); `"all"` or `""` → service falls back to `currentDefaultYear` |
| `months` | comma-sep lowercase names | *(empty = all 12)* | e.g. `april,may` |
| `locationIds` | comma-sep UUIDs | *(empty = all user locations)* | Multi-select filter |
| `pageIndex` | number | `0` | Location Wise tab only |
| `pageSize` | `10` \| `25` \| `50` | `10` | Location Wise tab only |

**Rate limit:** 60 req/min per IP/email with progressive delay.

---

### `POST /api/v1/monthly-activity-summary/approve`
Bulk-approves all pending `ActivityTaskRequest` records for a specific activity within the active filter scope.

**Auth:** OrganizationAdmin only — returns HTTP 403 for all other roles (RULE-001).

**Rate limit:** 30 req/min (lower than read endpoints — write operation).

**Request body:**
```json
{
  "activityCode": "FUEL_CONSUMPTION",
  "year":         2025,
  "yearType":     "financial",
  "locationIds":  ["uuid1", "uuid2"],
  "months":       ["april", "may"]
}
```

- `locationIds` — array or comma-separated string. Empty array = all user-accessible locations.
- `months` — array or comma-separated string. Empty = all 12 months of the FY/CY.

**Response:**
```json
{ "success": true, "data": { "approvedCount": 42 } }
```

- `approvedCount` — number of rows updated to `'approved'`. Returns `0` if no pending records matched (no-op — not an error).

---

## Filters

### Location (Multi-select)
- Lists only addresses the user has access to (from `session.mappings`).
- Empty selection = all user-accessible locations included.
- Selection is intersected with `session.mappings` server-side — users cannot query locations they don't have access to.

### Year (Single-select)
- Options built from `Organization.Baselineyear` to current FY, newest first.
- Label format depends on org setting:
  - Financial year (e.g. April start): `"April 2025 to March 2026"`
  - Calendar year: `"2025"`
- Default = latest year that has data in the DB (`defaultYear` from filters response).

### Month Tiles (Multi-select)
- Tiles shown in financial year order (e.g. Apr → Mar for April-start FY).
- Empty selection = **all 12 months** of the selected year included.
- Selecting specific tiles restricts data to those months within the selected FY.
- Default = the latest month with data in the default year (`defaultMonth` from filters response); no tile selected if `defaultMonth` is null.

### Reset to Default
- Clears location and month selections.
- Resets year to `defaultYear` (latest year with data).

---

## Tabs

### Activity Type Summary
- One row per activity type across all selected locations.
- No pagination — bounded by total number of activity types (~12–20).
- A **Totals row** is appended at the bottom showing the overall summary counts.
- OrganizationAdmin sees an **Approve** button per row (disabled when pending = 0).

### Location Wise Activity Summary
- One row per (location × activity type) combination.
- **Paginated** — page sizes 10 / 25 / 50.
- Pagination shows row range and total count.
- Location name shown on every row.

---

## Status Columns

Derived from `ActivityTaskRequest.status`:

| Column | Condition |
|---|---|
| **Pending** | `status IS NULL` OR `status = 'pending'` OR `status = 'saved'` |
| **Approved** | `status = 'approved'` |
| **Rejected** | `status = 'rejected'` |

**RULE-007:** Migration `0001_activity_task_request_status.sql` backfilled all NULL/pending rows to `'saved'` and set `DEFAULT 'saved'` on the column. For all display and business logic purposes, NULL, `'pending'`, and `'saved'` are equivalent to **Pending**. All three are targeted by approve queries and counted in `STATUS_COUNTS`.

`ActivityTaskRequest` records are created with `status = 'saved'` (or NULL for legacy rows) when a user first opens a task request. Status is updated via the approval workflow.

---

## Year Logic

### Financial Year Filter
For a financial year starting in month `M` (e.g. April = 4), year `Y` covers:
```
(tr.year = Y   AND LOWER(tr.month) IN (month_M ... december))
OR
(tr.year = Y+1 AND LOWER(tr.month) IN (january ... month_M-1))
```
Example — FY 2025 (April start):
- Apr–Dec 2025 → `tr.year = 2025`
- Jan–Mar 2026 → `tr.year = 2026`

### Calendar Year Filter
```sql
tr.year = Y
```

### `defaultYear` Calculation
`MAX(tr.year)` is **wrong** for financial years. Example: FY 2024-25 has records at `tr.year=2025` (Jan–Mar 2025). `MAX(tr.year) = 2025` but the FY start year is `2024`.

Correct formula per record:
```
FY start year = tr.year - 1   if LOWER(tr.month) < financial year start month
FY start year = tr.year       otherwise
```
`defaultYear = MAX(FY start year)` across all records.

---

## Business Rules

| Rule | Summary |
|---|---|
| **RULE-001** | Only `OrganizationAdmin` may approve. Enforced server-side (HTTP 403) + UI hides button for other roles. |
| **RULE-002** | Approve is a **bulk** operation — approves ALL pending records matching the active (activity, year, months, locations) filter combination. |
| **RULE-003** | Approval scope is strictly bounded by active filters — no cross-contamination of other year/month/location/activity. |
| **RULE-004** | `locationIds` from the client are **always intersected** with `session.mappings` server-side — privilege escalation impossible. |
| **RULE-005** | Approve button is **disabled** when `pending === 0`. Server-side is a no-op (returns `approvedCount: 0`) if there are no pending records. |
| **RULE-006** | V1 status flow is **one-way: Pending → Approved only**. No Reject option. No Unlock/Revert. Unlocks require a support ticket. |
| **RULE-007** | NULL / `'pending'` / `'saved'` are all treated as Pending (see [Status Columns](#status-columns)). |
| **RULE-008** | **Approval lock on upload** — once data is approved, Location Executives are blocked from re-uploading for the same (month, year, location, activity) via Excel bulk upload. Returns HTTP 422 with a human-readable message. Enforced in `assertNoApprovalLock()` called from `excel.service.ts`. |
| **RULE-009** | Approval is tracked via `ActivityTaskRequest.updated_by` (approving user's UUID) + `updated_at` (timestamp). No dedicated approval log table in V1. |
| **RULE-010** | Page re-fetches data on mount — no stale optimistic state. Browser back button always shows current approved state. |

---

## Approval Lock (RULE-008)

**How it works:**

1. Location Executive uploads an Excel file for a given (month, year, location, activity).
2. All 19 GHG upload routes flow through `getTaskRequestActvityTaskRequestId()` in `lib/excel/excel.service.ts`.
3. That function calls `assertNoApprovalLock(organizationAddressId, activityCode, monthYearPairs)` from `lib/bulk-upload/bulk-upload-approval.validation.ts`.
4. If **any** month/year pair in the upload is already approved, a HTTP 422 is thrown with the locked months listed.
5. No partial uploads — the **entire batch** is rejected if even one month is locked.

**Error message format:**
```
Data for the following month(s) has already been approved and cannot be modified: April 2025.
Please contact your Organisation Admin if changes are needed.
```

**To revert to pre-lock behaviour:** Remove the `assertNoApprovalLock()` call from `excel.service.ts`. No other files need to change.

**Future:** JSON API uploads and direct manual-data-entry routes do not yet enforce the lock. Extend if required.

---

## Security & Scoping

- Auth: `x-sk-op-authorization` JWT header → `apiAuthGuard` → `TUserSession`.
- All queries scope to `oa.organization_id = session.organizationId`.
- Location IDs supplied by the client are intersected with `session.mappings` server-side — no privilege escalation possible.
- UUID and month-name inputs are validated/allowlisted before interpolation into SQL.
- `activityCode` is validated against `^[a-zA-Z0-9_]+$` regex before SQL interpolation.

---

## Key Files

| File | Purpose |
|---|---|
| `app/[orgId]/embed/v1/[token]/data-log-summary/page.tsx` | UI — state, effects, MantineReactTable tables, pagination, approve action |
| `app/[orgId]/embed/v1/[token]/data-log-summary/MainFilterBlock.tsx` | Filter bar — location multi-select, year, month tiles, reset |
| `app/[orgId]/embed/v1/[token]/data-log-summary/MainFilterBlockUtils.ts` | Month badge helpers, year option builder |
| `app/[orgId]/embed/v1/[token]/data-log-summary/CheckboxMultiSelect.tsx` | Custom checkbox multi-select dropdown component used for location filter |
| `app/api/v1/monthly-activity-summary/route.ts` | Summary data endpoint (GET) |
| `app/api/v1/monthly-activity-summary/filters/route.ts` | Filters endpoint (GET) |
| `app/api/v1/monthly-activity-summary/approve/route.ts` | Approve endpoint (POST) — OrganizationAdmin only |
| `lib/monthly-activity-summary/service.ts` | Business logic — org data, location scoping, year defaults, approve orchestration |
| `lib/monthly-activity-summary/queries.ts` | Raw SQL via Drizzle — activity type CTE, location-wise CTE, latest year/month queries, bulk approve UPDATE |
| `lib/monthly-activity-summary/types.ts` | TypeScript interfaces (`SummaryParams`, `FiltersResponse`, `ApproveParams`, `ApproveResponse`, etc.) |
| `lib/monthly-activity-summary/business-rules.ts` | Authoritative business rule documentation (RULE-001 through RULE-010) |
| `lib/bulk-upload/bulk-upload-approval.validation.ts` | `assertNoApprovalLock()` — RULE-008 enforcement for Excel upload lock |

---

## Data Source

Primary table: `ActivityTaskRequest`

Join chain:
```
ActivityTaskRequest (atr)
  → TaskRequest       (tr)   — provides year, month
  → Activity          (act)  — provides activity code, name (code is UNIQUE)
  → OrganizationAddress (oa) — provides org scoping, is_deleted
  → Addresses         (addr) — provides location name (Location Wise tab only)
```

All queries exclude soft-deleted records:
- `atr.is_deleted IS NOT TRUE`
- `oa.is_deleted IS NOT TRUE`

---

## SQL Query Architecture

All queries use raw SQL via `GetOPSDBContext()` (Drizzle direct DB) — not Hasura GraphQL — because of multi-table CTEs with aggregate counts and cross-join pagination metadata that are difficult to express in GraphQL.

### CTE Pattern (Activity Type & Location Wise)
```
filtered_atr       — base filter (org, locations, year/month)
summary_counts     — overall totals CROSS JOINed to every output row
activity_summary   — per-activity group counts
total_row_count    — pagination total CROSS JOINed to every output row
```
Both the total row count and the overall summary are CROSS JOINed to each result row so a single round-trip returns data + pagination metadata + summary bar.

### Input Sanitisation
- UUIDs: validated against `UUID_REGEX` before interpolation.
- Month names: allowlisted against `ALL_MONTHS_LOWER` array.
- Activity codes: validated against `^[a-zA-Z0-9_]+$`.
- Year integers: parsed with `parseInt` and validated `> 1900 && < 2200`.

Do **not** pass user input directly into the SQL string. Always go through the sanitisation helpers (`toSqlUuidList`, `toSqlMonthList`, `buildYearMonthClause`).

---

## Common Mistakes to Avoid

| Mistake | Why it's wrong |
|---|---|
| Using `MAX(tr.year)` as the default year | Wrong for financial years — Jan–Mar rows have `tr.year = FY+1`. Use `queryLatestDataYear()` which computes FY start year correctly. |
| Skipping location intersection with `session.mappings` | Security violation — users could query locations they don't own. Always intersect. |
| Treating only NULL as Pending | Migration 0001 added `'saved'` as the default. NULL, `'pending'`, and `'saved'` are all Pending. |
| Adding per-route approval lock checks | RULE-008 is enforced centrally in `excel.service.ts` via `assertNoApprovalLock()`. One point of truth. |
| Editing `*.generated.tsx` files | Auto-generated by `yarn codegen` — changes will be overwritten. |
| Importing `*.server.ts` files in client components | Causes build errors. Keep server/client boundary clean. |
