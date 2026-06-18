# Monthly Activity Summary API — Filter Combinations Reference

**Endpoint:** `POST /api/v1/monthly-activity-summary`  
**Auth required:** Yes (`x-sk-op-authorization` header)

---

## Part 1 — Two paths in one endpoint

The same endpoint serves two purposes, switched by `is_export`:

| `is_export` | Path | Required extra fields |
|---|---|---|
| `false` / omitted | Summary table data | `tab`, `pageIndex`, `pageSize` |
| `true` | Excel export download | `activityCode`, `activityName` |

All other filter fields (`year`, `yearType`, `locationIds`, `months`) are shared by both paths.

---

## Part 2 — Every filter field explained

### `year`

| Value | Meaning |
|---|---|
| A number, e.g. `2025` | The FY start year (or calendar year) to filter by |
| `"all"`, `""`, or omitted | Internally becomes `0` → server resolves to `currentDefaultYear()` (current FY start year) |

**FY start year rule:** For April-start FY, year `2025` means April 2025 → March 2026. January 2026 data belongs to year `2025` because it falls within that FY range.

---

### `yearType`

| Value | Meaning |
|---|---|
| `"financial"` (default) | Uses FY ranges. Apr–Dec in start year, Jan–Mar in start year+1 |
| `"calendar"` | Single calendar year. `tr.year = <year>` directly |

The org's FY start month is read from the DB (`FinancialYearMonth`). If `startMonth = 1`, the system treats it as calendar year regardless of `yearType`.

---

### `locationIds`

| Value | What the server does |
|---|---|
| `[]` or omitted | Uses **all** locations the user has access to (`session.mappings[].organization_address_id`) |
| `["uuid1", "uuid2"]` | **Intersected** with user's accessible locations — any IDs not in the user's access list are silently dropped |
| IDs outside user's access | Dropped silently. Never returns data for unauthorized locations |

---

### `months`

| Value | Meaning |
|---|---|
| `[]` or omitted | All months in the selected financial/calendar year |
| `["april", "may"]` | Only those specific months (lowercase full month names) |
| Invalid names | Silently dropped by `toSqlMonthList()` — only known month names accepted |

---

### `tab` (summary path only)

| Value | Row structure |
|---|---|
| `"activity_type"` (default) | One row per activity (e.g. "Waste Data", "Energy-Grid") across all effective locations |
| `"location_wise"` | One row per (location × activity) combination |

---

### `pageIndex` / `pageSize` (summary path only)

Standard pagination. Defaults: `pageIndex=0`, `pageSize=10`. `totalCount` is always returned so the client can calculate total pages.

---

## Part 3 — The security intersection

**Every request** goes through this before touching the DB:

```
effectiveLocationIds =
  locationIds.length > 0
    ? locationIds.filter(id => userAddressIds.includes(id))
    : userAddressIds
```

This means a user can never receive data for a location they aren't mapped to, regardless of what they send in the payload.

---

## Part 4 — Activity scoping by role

| Role | Activity source |
|---|---|
| **OrganizationAdmin** | All activities mapped to the org via `OrganizationActivityMapping` (expanded to leaf level) |
| **LocationExecutive** | Only the activities from `session.mappings[].activities` (parent codes expanded to leaf level) |

---

## Part 5 — All payload combinations with expected behaviour

### Combination 1 — Default / page load (no filters)

```json
{
  "tab": "activity_type",
  "pageIndex": 0,
  "pageSize": 10
}
```

**What happens:**
- `year` → resolves to current FY start year (e.g. `2025` if today is April 2026)
- `locationIds` → all user-accessible locations
- `months` → all 12 months in the FY

**Returns:** All activities for the current FY across all user locations, paginated 10 per page.

---

### Combination 2 — Specific year, all locations, all months

```json
{
  "year": 2024,
  "yearType": "financial",
  "tab": "activity_type",
  "pageIndex": 0,
  "pageSize": 20
}
```

**What happens:**
- FY 2024 = April 2024 → March 2025
- All user locations, all months

**Returns:** All activities' counts for FY2024 across all user locations.

---

### Combination 3 — Specific year + specific months

```json
{
  "year": 2025,
  "yearType": "financial",
  "months": ["april", "may", "june"],
  "tab": "activity_type",
  "pageIndex": 0,
  "pageSize": 20
}
```

**What happens:**
- FY 2025, but only April/May/June 2025 rows are counted
- All user locations

**Returns:** Activity counts for Q1 of FY2025.

---

### Combination 4 — Specific locations, all months

```json
{
  "year": 2025,
  "yearType": "financial",
  "locationIds": ["uuid-loc-1", "uuid-loc-2"],
  "tab": "activity_type",
  "pageIndex": 0,
  "pageSize": 20
}
```

**What happens:**
- Intersected with user access — if `uuid-loc-2` is not in user's mappings it is dropped
- Counts are scoped to only the effective locations

**Returns:** Activity counts for FY2025 filtered to the specified (and authorized) locations.

---

### Combination 5 — Location-wise tab

```json
{
  "year": 2025,
  "yearType": "financial",
  "tab": "location_wise",
  "pageIndex": 0,
  "pageSize": 50
}
```

**What happens:**
- One row per (location × activity) combination in the result
- `locationId` and `locationName` are included in each row

**Returns:** Breakdown of every activity at every location — e.g. "Waste Data at Mumbai Plant", "Energy-Grid at Delhi Plant".

---

### Combination 6 — Location-wise with specific location + month

```json
{
  "year": 2025,
  "yearType": "financial",
  "locationIds": ["uuid-loc-1"],
  "months": ["march"],
  "tab": "location_wise",
  "pageIndex": 0,
  "pageSize": 50
}
```

**Returns:** Per-activity counts for Location 1 for March only (within FY2025, so March 2026).

---

### Combination 7 — Calendar year org

```json
{
  "year": 2025,
  "yearType": "calendar",
  "tab": "activity_type",
  "pageIndex": 0,
  "pageSize": 20
}
```

**What happens:**
- SQL: `tr.year = 2025` — no FY range split
- Months January–December 2025 all map to year `2025`

**Returns:** Activity counts for calendar year 2025.

---

### Combination 8 — Export, single activity, all locations, all months

```json
{
  "is_export": true,
  "activityCode": "waste",
  "activityName": "Waste Data",
  "year": 2025,
  "yearType": "financial"
}
```

**What happens:**
- `locationIds` omitted → all user locations
- `months` omitted → all 12 months in FY2025
- Org-admin gets Location + Status columns; location-executive does not
- Returns a signed S3 URL for download

**Returns:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://s3.amazonaws.com/...",
    "fileName": "Waste_Data_2026-04-23_14-30-00.xlsx"
  }
}
```

---

### Combination 9 — Export, single activity, single location, specific months

```json
{
  "is_export": true,
  "activityCode": "energy_grid_power",
  "activityName": "Energy-Grid",
  "year": 2025,
  "yearType": "financial",
  "locationIds": ["uuid-loc-1"],
  "months": ["april", "may"]
}
```

**Returns:** Excel with only Energy-Grid data for Location 1 for April + May 2025. File name includes location name since only one location: `Energy_Grid_Mumbai_Plant_2026-04-23_14-30-00.xlsx`.

---

### Combination 10 — Location-executive calling export for unauthorized activity

```json
{
  "is_export": true,
  "activityCode": "capital_goods",
  "activityName": "Capital Goods",
  "year": 2025,
  "yearType": "financial"
}
```

**What happens:** Server checks `session.mappings[].activities`. If `capital_goods` or its parent `capitalgoods` is not in the user's allowed activities → HTTP 403.

**Returns:**
```json
{
  "success": false,
  "message": "You do not have permission to export this activity.",
  "statusCode": 403
}
```

---

## Part 6 — What "year = 0" means internally

`year = 0` is the server-internal sentinel for "not specified". The service resolves it:

```typescript
year: params.year || currentDefaultYear(startMonth, params.yearType)
```

`currentDefaultYear` logic:
- Today = April 23, 2026, FY start = April → returns `2026` (FY2026 = Apr 2026–Mar 2027)
- Today = January 15, 2026, FY start = April → returns `2025` (still in FY2025)
- Calendar year → always returns current calendar year (`2026`)

---

## Part 7 — Response shape (summary path)

```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 540,
      "pending": 420,
      "approved": 100,
      "rejected": 20
    },
    "rows": [
      {
        "activityCode": "waste",
        "activityName": "Waste Data",
        "totalRecords": 45,
        "pending": 30,
        "approved": 15,
        "rejected": 0
      }
    ],
    "totalCount": 23,
    "pageIndex": 0,
    "pageSize": 10
  }
}
```

For `tab = "location_wise"`, each row additionally has `locationId` and `locationName`. Activities with **zero uploaded records** still appear in `rows` with `totalRecords: 0` — so the table always shows all assigned activities even if no data exists yet.

---

## Part 8 — Empty / edge cases

| Scenario | Result |
|---|---|
| User has no location mappings (`session.mappings = []`) | Returns empty summary immediately (no DB query) |
| `locationIds` supplied but all are outside user's access | All dropped → treated as "no locations" → empty response |
| Valid year but no data exists for that year | All rows have `totalRecords: 0`, `summary.total: 0` |
| `months` contains only invalid names (e.g. `["xyz"]`) | Silently treated as all months (failsafe in `toSqlMonthList`) |
| Export requested for activity with no config in `export-config.ts` | HTTP 400: `"Export is not yet available for activity..."` |
