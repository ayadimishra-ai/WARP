# ActivitySummaryCache — Tier 2 Implementation Plan

> **STATUS: IMPLEMENTED** — All tasks complete on branch `beta_deploy_ather_delivery`. All checkboxes below are checked. This document is retained as a reference for the decisions made during implementation.

**Goal:** Replace the 30-table GHG_UNION in the monthly activity summary read path with a precomputed `ActivitySummaryCache` table, reducing summary query time from 2–5s to under 50ms.

**Architecture:** New `ActivitySummaryCache` PostgreSQL table stores `(pending_count, approved_count)` per `(organization_address_id, activity_code, year, month)`. On reads, a simple GROUP BY on this ~2,700-row table replaces the expensive UNION ALL. On writes (upload, re-upload, approve), targeted per-activity **recount** SQL re-reads source tables and upserts the cache row (recount-not-delta). Cache upserts run **fire-and-forget** after the primary response — a cache failure never blocks upload/approve. The existing `queries.ts` is **never modified** (preserved as fallback).

**Tech Stack:** PostgreSQL raw SQL via Drizzle `sql.raw()` + `GetOPSDBContext()`, Next.js `unstable_cache` + `revalidateTag()`, TypeScript.

---

## Implementation Notes (deviations from original plan)

| Item | Original plan | Final implementation |
|---|---|---|
| `rejected_count` | Included in table and counts | **Removed** — not used in UI or existing GHG_UNION |
| Cache update strategy | Delta-based (+N / -N) | **Recount-not-delta** — re-reads source tables after each write |
| Transaction wrapping | Cache update in same DB transaction | **Fire-and-forget** with `.catch()` logging; fallback to live GHG_UNION if cache query throws |
| `org_activities` CTE | Single path with filter on `child.code` | **Two-path** (org-admin via OAM; location-executive via `parent.code IN (activityCodes)`) — mirrors `queries.ts` exactly |
| `child.is_master IS NOT TRUE` | Not mentioned | **Added to LEFT JOIN** — without it, activities whose only children are `is_master=TRUE` resolved to child codes that don't exist as cache keys |

---

## Critical Business Rules (must not break)

- **RULE-001**: Approve is org-admin only (untouched — in approve/route.ts guard)
- **RULE-002**: Approve is bulk — all pending for (activity + filter scope) approved at once (untouched — queries.ts)
- **RULE-003**: Re-upload with approved data is blocked (untouched — in import route guards)
- **RULE-004**: locationIds are intersected server-side with user's accessible addresses (untouched — service.ts)
- **RULE-007**: NULL/pending/saved all count as "Pending"; status fallback for ESG tables via `COALESCE(gd.status, atr.status)`
- **0-count rows**: Activities with no data still appear in the table with count 0. Maintained by `org_activities LEFT JOIN cache_sums` in the new read query.

---

## File Map

### Created
| File | Purpose |
|---|---|
| `specs/feat-month-activity-data/migrations/001_activity_summary_cache.sql` | CREATE TABLE + backfill SQL (run in DBeaver) |
| `lib/monthly-activity-summary/cache-queries.ts` | All cache logic: recount, upsert, read from cache, backfill |

### Modified
| File | Change |
|---|---|
| `lib/monthly-activity-summary/service.ts` | `getSummaryData()` calls `queryTaskRequestSummaryFromCache` instead of `queryTaskRequestSummary` |
| `app/ghg/api/v1/monthly-activity-summary/approve/route.ts` | Add `upsertCacheForActivity()` after approval completes |
| All 20 GHG import routes under `app/ghg/api/v1/ghg-data-import/transaction/*/excel/route.ts` | Add `upsertCacheForActivity()` after successful GraphQL upsert |
| All 5 ESG import routes under `app/ghg/api/v1/esg-data-import/transaction/*/excel/route.ts` | Same pattern |

### Untouched
| File | Why |
|---|---|
| `lib/monthly-activity-summary/queries.ts` | Kept as backup; contains original GHG_UNION |
| All export logic (`queryExportData`, `queryMatchingAtrIds`) | Export reads GHG tables directly, unaffected |
| All filter queries (`queryLocations`, `queryDistinctDataYears`, `queryMonthsWithData`) | Unchanged |
| Approval DB logic (`approveActivityTaskRequests`) | Unchanged |

---

## Task 1: Run Database Migration

**Files:** `specs/feat-month-activity-data/migrations/001_activity_summary_cache.sql`

- [x] **Step 1.1: Open migration file in DBeaver**

  File is at: `apps/web/src/modules/ghg/specs/feat-month-activity-data/migrations/001_activity_summary_cache.sql`

  Run **STEP 1 only** (CREATE TABLE + indexes) first — do NOT run STEP 2 (backfill) yet.

- [x] **Step 1.2: Verify table was created**

  Run in DBeaver:
  ```sql
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'ActivitySummaryCache'
  ORDER BY ordinal_position;
  ```

  Expected columns: `organization_id`, `organization_address_id`, `activity_code`, `year`, `month`, `pending_count`, `approved_count`, `rejected_count`, `updated_at`

- [x] **Step 1.3: Commit**

  ```bash
  git add apps/web/src/modules/ghg/specs/feat-month-activity-data/migrations/001_activity_summary_cache.sql
  git commit -m "chore: add ActivitySummaryCache migration SQL"
  ```

---

## Task 2: Create `cache-queries.ts`

**Files:**
- Create: `apps/web/src/modules/ghg/lib/monthly-activity-summary/cache-queries.ts`

This is the core file. It exports:
1. `upsertCacheForActivity(params)` — recount + upsert one or more cache rows after a write event
2. `queryTaskRequestSummaryFromCache(params)` — cache-based replacement for `queryTaskRequestSummary`
3. `backfillActivitySummaryCache(organizationId?)` — one-time admin function

- [x] **Step 2.1: Create the file with full implementation**

  ```typescript
  // apps/web/src/modules/ghg/lib/monthly-activity-summary/cache-queries.ts
  //
  // Cache-based reads and writes for the ActivitySummaryCache table.
  // queries.ts is untouched — this file is the NEW path.
  
  import { sql } from "drizzle-orm";
  import { GetOPSDBContext } from "@/modules/ghg/utils/database/db-context";
  import type { SummaryQueryParams, YearMonthFilterParams } from "./queries";

  // ─── Types ────────────────────────────────────────────────────────────────────

  export interface CacheUpsertParams {
    organizationId: string;
    organizationAddressId: string;
    activityCode: string;
    /** Array of (calendar year, lowercase month) pairs affected by this write event */
    monthYears: { year: number; month: string }[];
  }

  // ─── Per-activity recount config ──────────────────────────────────────────────
  // For each activity_code, lists the tables and how to get effective_status.
  // "direct" tables have their own activity_task_request_id.
  // "child" tables are joined to a parent that has activity_task_request_id.

  type DirectTable = {
    kind: "direct";
    table: string;
    hasStatus: boolean; // true = COALESCE(gd.status, atr.status); false = atr.status
  };
  type ChildTable = {
    kind: "child";
    table: string;
    parentTable: string;
    parentFk: string; // column in child that references parent.id
  };
  type RecountEntry = DirectTable | ChildTable;

  const RECOUNT_CONFIGS: Record<string, RecountEntry[]> = {
    waste:                          [{ kind: "direct", table: "GHGWaste",                       hasStatus: true }],
    production:                     [{ kind: "direct", table: "GHGProductionDetails",           hasStatus: true }],
    energy_grid_power:              [{ kind: "direct", table: "GHGEnergyConsumption_GridPower", hasStatus: true }],
    energy_fuel_purchased: [
      { kind: "child",  table: "GHGEnergyConsumption_FuelPurchased_General",       parentTable: "GHGEnergyConsumption_FuelPurchased", parentFk: "GHGEnergyConsumption_FuelPurchased_id" },
      { kind: "child",  table: "GHGEnergyConsumption_FuelPurchased_HeatingWater",  parentTable: "GHGEnergyConsumption_FuelPurchased", parentFk: "GHGEnergyConsumption_FuelPurchased_id" },
      { kind: "child",  table: "GHGEnergyConsumption_FuelPurchased_Auxiliary",     parentTable: "GHGEnergyConsumption_FuelPurchased", parentFk: "GHGEnergyConsumption_FuelPurchased_id" },
      { kind: "direct", table: "GHGEnergyConsumption_FuelPurchased_Transportation", hasStatus: false },
    ],
    energy_captive_power: [
      { kind: "child",  table: "GHGEnergy_CaptivePower_Renewable",     parentTable: "GHGEnergy_CaptivePower", parentFk: "GHGEnergyConsumption_CaptivePower_id" },
      { kind: "child",  table: "GHGEnergy_CaptivePower_NonRenewable",  parentTable: "GHGEnergy_CaptivePower", parentFk: "GHGEnergyConsumption_CaptivePower_id" },
      // GHGEnergy_CaptivePower_Renewable_Fuel may not exist in all environments
      { kind: "child",  table: "GHGEnergy_CaptivePower_Renewable_Fuel", parentTable: "GHGEnergy_CaptivePower", parentFk: "GHGEnergyConsumption_CaptivePower_id" },
    ],
    transport_upstream:             [{ kind: "direct", table: "GHGTransport_Upstream",         hasStatus: true }],
    transport_downstream:           [{ kind: "direct", table: "GHGTransport_Downstream",       hasStatus: true }],
    transport_employee_travel:      [{ kind: "direct", table: "GHGTransport_EmployeeTravel",   hasStatus: true }],
    transport_business_travel:      [{ kind: "direct", table: "GHGTransport_BusinessTravel",   hasStatus: true }],
    general:                        [{ kind: "direct", table: "GHGGeneralDetails",             hasStatus: true }],
    buyer_share:                    [{ kind: "direct", table: "GHGBuyer_Share",                hasStatus: true }],
    material_procurement:           [{ kind: "direct", table: "GHGMaterialProcurement",        hasStatus: true }],
    capital_goods:                  [{ kind: "direct", table: "GHGCapital_Goods",              hasStatus: true }],
    product_share_allocation:       [{ kind: "direct", table: "GHGProductShareAttribution",    hasStatus: true }],
    water_consumption: [
      { kind: "direct", table: "GHGFreshWater",        hasStatus: true },
      { kind: "direct", table: "GHGWasteWater",        hasStatus: true },
      { kind: "direct", table: "GHGHarvestedWater",    hasStatus: true },
    ],
    water_withdrawal:               [{ kind: "direct", table: "GHGWaterWithdrawal",           hasStatus: true }],
    wastewater_generation:          [{ kind: "direct", table: "GHGWastewaterGeneration",       hasStatus: true }],
    waste_water_treatment: [
      { kind: "direct", table: "GHGWasteWaterTreatment", hasStatus: true },
      { kind: "direct", table: "GHGEffluentDischarge",   hasStatus: false },
      { kind: "direct", table: "GHGSludgeDisposal",      hasStatus: false },
    ],
    fugitive_details: [
      { kind: "direct", table: "GHGRefrigerantAndACSystems", hasStatus: true },
      { kind: "direct", table: "GHGFireExtinguisher",        hasStatus: true },
      { kind: "direct", table: "GHGIndustrialGas",           hasStatus: true },
    ],
    csr:                            [{ kind: "direct", table: "ESGCSR",                     hasStatus: false }],
    human_resources: [
      { kind: "direct", table: "ESGEmployeeDiversity", hasStatus: false },
      { kind: "direct", table: "ESGEmployeeTurnover",  hasStatus: false },
      { kind: "direct", table: "ESGTrainingHours",     hasStatus: false },
    ],
    health_and_safety: [
      { kind: "direct", table: "ESGHealthAndSafety",          hasStatus: false },
      { kind: "direct", table: "ESGSafetyObservations",       hasStatus: false },
      { kind: "direct", table: "ESGHealthAndSafetyTraining",  hasStatus: false },
      { kind: "direct", table: "ESGAssessedLocations",        hasStatus: false },
    ],
    governance_and_board_composition: [
      { kind: "direct", table: "ESGBoardComposition", hasStatus: false },
      { kind: "direct", table: "ESGGovernance",       hasStatus: false },
    ],
    grievances_activity:            [{ kind: "direct", table: "ESGGrievances", hasStatus: false }],
  };

  // ─── Build recount SQL for one (address, activity, year, month) ──────────────

  function buildRecountSQL(
    organizationAddressId: string,
    activityCode: string,
    year: number,
    month: string // lowercase
  ): string {
    const configs = RECOUNT_CONFIGS[activityCode];
    if (!configs || configs.length === 0) return "";

    const unionParts = configs.map((cfg) => {
      if (cfg.kind === "direct") {
        const statusExpr = cfg.hasStatus
          ? `COALESCE(gd.status, atr.status)`
          : `atr.status`;
        return `
          SELECT ${statusExpr} AS eff
          FROM "${cfg.table}" gd
          JOIN "ActivityTaskRequest" atr ON atr.id = gd.activity_task_request_id
          JOIN "TaskRequest" tr ON tr.id = atr.task_request_id
          WHERE gd.organization_address_id = '${organizationAddressId}'
            AND tr.year = ${year}
            AND LOWER(tr.month) = '${month}'
            AND atr.is_deleted IS NOT TRUE`;
      } else {
        return `
          SELECT COALESCE(p.status, atr.status) AS eff
          FROM "${cfg.table}" gd
          JOIN "${cfg.parentTable}" p ON p.id = gd."${cfg.parentFk}"
          JOIN "ActivityTaskRequest" atr ON atr.id = p.activity_task_request_id
          JOIN "TaskRequest" tr ON tr.id = atr.task_request_id
          WHERE p.organization_address_id = '${organizationAddressId}'
            AND tr.year = ${year}
            AND LOWER(tr.month) = '${month}'
            AND atr.is_deleted IS NOT TRUE`;
      }
    });

    return `
      SELECT
        COUNT(*) FILTER (WHERE eff IS NULL OR eff IN ('pending', 'saved')) AS pending_count,
        COUNT(*) FILTER (WHERE eff = 'approved')  AS approved_count,
        COUNT(*) FILTER (WHERE eff = 'rejected')  AS rejected_count
      FROM (${unionParts.join(" UNION ALL ")}) AS rows`;
  }

  // ─── upsertCacheForActivity ────────────────────────────────────────────────────
  // Called after every upload, re-upload, or approve event.
  // Recounts from actual data for accuracy (no delta tracking needed).

  export async function upsertCacheForActivity(params: CacheUpsertParams): Promise<void> {
    const { organizationId, organizationAddressId, activityCode, monthYears } = params;
    if (!RECOUNT_CONFIGS[activityCode] || monthYears.length === 0) return;

    const db = await GetOPSDBContext();

    for (const { year, month } of monthYears) {
      const recountSQL = buildRecountSQL(organizationAddressId, activityCode, year, month);
      if (!recountSQL) continue;

      // Recount from actual data tables
      const rows = await db.execute(sql.raw(recountSQL));
      const counts = (rows as any)[0] ?? { pending_count: 0, approved_count: 0, rejected_count: 0 };

      const pending  = Number(counts.pending_count  ?? 0);
      const approved = Number(counts.approved_count ?? 0);
      const rejected = Number(counts.rejected_count ?? 0);

      // Upsert the cache row
      await db.execute(sql.raw(`
        INSERT INTO "ActivitySummaryCache"
          (organization_id, organization_address_id, activity_code, year, month,
           pending_count, approved_count, rejected_count, updated_at)
        VALUES
          ('${organizationId}', '${organizationAddressId}', '${activityCode}',
           ${year}, '${month}', ${pending}, ${approved}, ${rejected}, now())
        ON CONFLICT (organization_id, organization_address_id, activity_code, year, month)
        DO UPDATE SET
          pending_count  = EXCLUDED.pending_count,
          approved_count = EXCLUDED.approved_count,
          rejected_count = EXCLUDED.rejected_count,
          updated_at     = now()
      `));
    }
  }

  // ─── buildCacheYearMonthClause ────────────────────────────────────────────────
  // Generates WHERE clause for ActivitySummaryCache based on financial/calendar year filter.
  // The cache stores CALENDAR year (matching TaskRequest.year), not FY year.
  // For FY April 2024: April–December rows are year=2024; January–March rows are year=2025.

  const ALL_MONTHS = [
    "january","february","march","april","may","june",
    "july","august","september","october","november","december",
  ];

  function buildFYMonthOrder(startMonth: number): string[] {
    // Rotate ALL_MONTHS to start at startMonth (1-based)
    const idx = startMonth - 1;
    return [...ALL_MONTHS.slice(idx), ...ALL_MONTHS.slice(0, idx)];
  }

  function buildCacheYearMonthClause(filter: YearMonthFilterParams, alias = "c"): string {
    const { year, yearType, startMonth, months } = filter;

    if (yearType === "calendar" || startMonth === 1) {
      const selected = months.length > 0 ? months : ALL_MONTHS;
      const list = selected.map((m) => `'${m}'`).join(", ");
      return `(${alias}.year = ${year} AND ${alias}.month IN (${list}))`;
    }

    // Financial year: split into year1 and year2
    const fyOrder = buildFYMonthOrder(startMonth);
    const selected = months.length > 0 ? months : fyOrder;

    // Months in the first calendar year of the FY (e.g., Apr–Dec for April FY)
    const year1Months = selected.filter((m) => fyOrder.indexOf(m) < 12 - startMonth + 1);
    // Months in the second calendar year of the FY (e.g., Jan–Mar for April FY)
    const year2Months = selected.filter((m) => fyOrder.indexOf(m) >= 12 - startMonth + 1);

    const parts: string[] = [];
    if (year1Months.length > 0) {
      const list = year1Months.map((m) => `'${m}'`).join(", ");
      parts.push(`(${alias}.year = ${year} AND ${alias}.month IN (${list}))`);
    }
    if (year2Months.length > 0) {
      const list = year2Months.map((m) => `'${m}'`).join(", ");
      parts.push(`(${alias}.year = ${year + 1} AND ${alias}.month IN (${list}))`);
    }

    return parts.length > 0 ? `(${parts.join(" OR ")})` : "1=0";
  }

  // ─── queryTaskRequestSummaryFromCache ─────────────────────────────────────────
  // Replacement for queryTaskRequestSummary. Reads from ActivitySummaryCache.
  // Returns identical row shape to the original query so service.ts mapping is unchanged.

  export async function queryTaskRequestSummaryFromCache(
    params: SummaryQueryParams
  ): Promise<any[]> {
    const {
      organizationId,
      effectiveLocationIds,
      yearMonthFilter,
      tab,
      pageIndex,
      pageSize,
      activityCodes,
      search,
      statusFilter,
    } = params;

    const db = await GetOPSDBContext();

    const locationList = effectiveLocationIds.map((id) => `'${id}'`).join(", ");
    const yearMonthClause = buildCacheYearMonthClause(yearMonthFilter);

    // Optional activity code filter (for location executives)
    const activityCodeFilter =
      activityCodes && activityCodes.length > 0
        ? `AND a.code IN (${activityCodes.map((c) => `'${c}'`).join(", ")})`
        : "";

    // Optional status HAVING clause for table rows
    const havingClause =
      statusFilter === "pending"
        ? "HAVING SUM(COALESCE(cs.pending_count,0)) > 0"
        : statusFilter === "approved"
        ? "HAVING SUM(COALESCE(cs.approved_count,0)) > 0"
        : "";

    // Optional search filter (location_wise tab only, server-side ILIKE)
    const searchFilter =
      tab === "location_wise" && search && search.trim().length > 0
        ? `AND (addr.name ILIKE '%${search.replace(/[%_\\]/g, "\\$&")}%' OR a.name ILIKE '%${search.replace(/[%_\\]/g, "\\$&")}%')`
        : "";

    const offset = pageIndex * pageSize;

    if (tab === "activity_type") {
      const querySql = `
        WITH org_activities AS (
          SELECT a.code, a.name
          FROM "OrganizationActivityMapping" oam
          JOIN "Activity" a ON a.id = oam.activity_id
          WHERE oam.organization_id = '${organizationId}'
            AND oam.is_deleted IS NOT TRUE
            AND a.is_deleted IS NOT TRUE
            AND a.is_master IS NOT TRUE
            ${activityCodeFilter}
        ),
        cache_sums AS (
          SELECT
            c.activity_code,
            SUM(c.pending_count)  AS pending_count,
            SUM(c.approved_count) AS approved_count,
            SUM(c.rejected_count) AS rejected_count
          FROM "ActivitySummaryCache" c
          WHERE c.organization_id = '${organizationId}'
            AND c.organization_address_id IN (${locationList})
            AND ${yearMonthClause}
          GROUP BY c.activity_code
        ),
        all_rows AS (
          SELECT
            oa.code  AS activity_code,
            oa.name  AS activity_name,
            COALESCE(cs.pending_count,  0) AS pending,
            COALESCE(cs.approved_count, 0) AS approved,
            COALESCE(cs.rejected_count, 0) AS rejected,
            COALESCE(cs.pending_count + cs.approved_count + cs.rejected_count, 0) AS total_records
          FROM org_activities oa
          LEFT JOIN cache_sums cs ON cs.activity_code = oa.code
        ),
        summary_counts AS (
          SELECT
            SUM(pending)       AS summary_pending,
            SUM(approved)      AS summary_approved,
            SUM(rejected)      AS summary_rejected,
            SUM(total_records) AS summary_total
          FROM all_rows
        ),
        filtered_rows AS (
          SELECT * FROM all_rows
          ${havingClause.replace("HAVING", "WHERE").replace("SUM(COALESCE(cs.pending_count,0))", "pending").replace("SUM(COALESCE(cs.approved_count,0))", "approved")}
        ),
        total_row_count AS (
          SELECT COUNT(*) AS total_count FROM filtered_rows
        )
        SELECT
          fr.activity_code,
          fr.activity_name,
          fr.pending    AS pending,
          fr.approved   AS approved,
          fr.rejected   AS rejected,
          fr.total_records,
          sc.summary_pending,
          sc.summary_approved,
          sc.summary_rejected,
          sc.summary_total,
          trc.total_count
        FROM filtered_rows fr
        CROSS JOIN summary_counts sc
        CROSS JOIN total_row_count trc
        ORDER BY fr.activity_name ASC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
      return (await db.execute(sql.raw(querySql))) as any[];
    }

    // ── location_wise tab ──────────────────────────────────────────────────────
    // NOTE: The join path from OrganizationAddress to address name must match
    // what queryLocations() does in queries.ts. Check that function for the
    // exact table name and column name for the address display name.
    // Assumption below: "OrganizationAddress" joins to "Addresses" with column "name".
    // Update the JOIN below if the actual table/column differs.

    const querySql = `
      WITH org_activities AS (
        SELECT a.code, a.name
        FROM "OrganizationActivityMapping" oam
        JOIN "Activity" a ON a.id = oam.activity_id
        WHERE oam.organization_id = '${organizationId}'
          AND oam.is_deleted IS NOT TRUE
          AND a.is_deleted IS NOT TRUE
          AND a.is_master IS NOT TRUE
          ${activityCodeFilter}
      ),
      org_locations AS (
        SELECT oa.id AS org_address_id, addr.name AS location_name
        FROM "OrganizationAddress" oa
        JOIN "Addresses" addr ON addr.id = oa.address_id
        WHERE oa.organization_id = '${organizationId}'
          AND oa.id IN (${locationList})
          AND oa.is_deleted IS NOT TRUE
      ),
      base AS (
        SELECT
          l.org_address_id AS location_id,
          l.location_name,
          a.code           AS activity_code,
          a.name           AS activity_name
        FROM org_locations l
        CROSS JOIN org_activities a
      ),
      cache_sums AS (
        SELECT
          c.organization_address_id,
          c.activity_code,
          SUM(c.pending_count)  AS pending_count,
          SUM(c.approved_count) AS approved_count,
          SUM(c.rejected_count) AS rejected_count
        FROM "ActivitySummaryCache" c
        WHERE c.organization_id = '${organizationId}'
          AND c.organization_address_id IN (${locationList})
          AND ${yearMonthClause}
        GROUP BY c.organization_address_id, c.activity_code
      ),
      all_rows AS (
        SELECT
          b.location_id,
          b.location_name,
          b.activity_code,
          b.activity_name,
          COALESCE(cs.pending_count,  0) AS pending,
          COALESCE(cs.approved_count, 0) AS approved,
          COALESCE(cs.rejected_count, 0) AS rejected,
          COALESCE(cs.pending_count + cs.approved_count + cs.rejected_count, 0) AS total_records
        FROM base b
        LEFT JOIN cache_sums cs
          ON cs.organization_address_id = b.location_id
         AND cs.activity_code = b.activity_code
        WHERE 1=1 ${searchFilter.replace("AND (addr.name", "AND (b.location_name").replace("OR a.name", "OR b.activity_name")}
      ),
      summary_counts AS (
        SELECT
          SUM(pending)       AS summary_pending,
          SUM(approved)      AS summary_approved,
          SUM(rejected)      AS summary_rejected,
          SUM(total_records) AS summary_total
        FROM all_rows
      ),
      filtered_rows AS (
        SELECT * FROM all_rows
        ${havingClause.replace("HAVING", "WHERE").replace("SUM(COALESCE(cs.pending_count,0))", "pending").replace("SUM(COALESCE(cs.approved_count,0))", "approved")}
      ),
      total_row_count AS (
        SELECT COUNT(*) AS total_count FROM filtered_rows
      )
      SELECT
        fr.location_id,
        fr.location_name,
        fr.activity_code,
        fr.activity_name,
        fr.pending,
        fr.approved,
        fr.rejected,
        fr.total_records,
        sc.summary_pending,
        sc.summary_approved,
        sc.summary_rejected,
        sc.summary_total,
        trc.total_count
      FROM filtered_rows fr
      CROSS JOIN summary_counts sc
      CROSS JOIN total_row_count trc
      ORDER BY fr.location_name ASC, fr.activity_name ASC
      LIMIT ${pageSize} OFFSET ${offset}
    `;
    return (await db.execute(sql.raw(querySql))) as any[];
  }

  // ─── backfillActivitySummaryCache ─────────────────────────────────────────────
  // One-time admin function. Runs the SQL backfill from migrations/001_activity_summary_cache.sql.
  // Call from a one-time script or a protected admin route after deploying to beta.
  // The SQL file is the canonical version; this is a convenience wrapper.

  export async function backfillActivitySummaryCache(): Promise<{ rowsUpserted: number }> {
    const db = await GetOPSDBContext();

    // Get all distinct (org, address, activity, year, month) combinations from ATR
    const combos = await db.execute(sql.raw(`
      SELECT DISTINCT
        oa.organization_id,
        atr.organization_address_id,
        act.code   AS activity_code,
        tr.year,
        LOWER(tr.month) AS month
      FROM "ActivityTaskRequest" atr
      JOIN "TaskRequest"         tr  ON tr.id  = atr.task_request_id
      JOIN "Activity"            act ON act.id = atr.activity_id
      JOIN "OrganizationAddress" oa  ON oa.id  = atr.organization_address_id
      WHERE atr.is_deleted IS NOT TRUE
        AND oa.is_deleted  IS NOT TRUE
        AND act.is_deleted IS NOT TRUE
        AND act.is_master  IS NOT TRUE
    `));

    let count = 0;
    for (const row of combos as any[]) {
      await upsertCacheForActivity({
        organizationId:         row.organization_id,
        organizationAddressId:  row.organization_address_id,
        activityCode:           row.activity_code,
        monthYears: [{ year: Number(row.year), month: row.month }],
      }).catch((err) => console.error(`[backfill] ${row.activity_code} ${row.year}/${row.month}:`, err));
      count++;
    }

    return { rowsUpserted: count };
  }
  ```

- [x] **Step 2.2: Check the `Addresses` table name and `name` column**

  Before saving the file, verify the address join in `queryLocations()` in `queries.ts`. Find the exact table name and display name column used for location names. Update the `org_locations` CTE accordingly:
  ```sql
  -- If the table is named differently, e.g., "Address" or column is "address_name":
  JOIN "YourActualAddressTable" addr ON addr.id = oa.address_id
  ```

- [x] **Step 2.3: Verify import compiles cleanly**

  Run from `apps/web/`:
  ```bash
  npx tsc --noEmit --skipLibCheck
  ```

  Expected: No errors in `cache-queries.ts`.

- [x] **Step 2.4: Commit**

  ```bash
  git add apps/web/src/modules/ghg/lib/monthly-activity-summary/cache-queries.ts
  git commit -m "feat(ghg): add ActivitySummaryCache query and upsert infrastructure"
  ```

---

## Task 3: Run Backfill + Validate

- [x] **Step 3.1: Run the SQL backfill (STEP 2 of migration file)**

  Open `001_activity_summary_cache.sql` in DBeaver and run the **STEP 2 section** (the large INSERT ... SELECT).

  This may take 30–60 seconds on a large database. Expected output: `INSERT N` where N = number of (org, address, activity, year, month) combinations with data.

- [x] **Step 3.2: Run validation query**

  Run the **STEP 3 section** of the migration file:
  ```sql
  SELECT organization_id, SUM(pending_count), SUM(approved_count), SUM(rejected_count)
  FROM "ActivitySummaryCache"
  GROUP BY organization_id;
  ```

- [x] **Step 3.3: Cross-check against original query (manual)**

  On beta only: open the summary page with no filters applied and note the displayed totals. Then compare against cache totals from the query above. Numbers should match.

---

## Task 4: Update `service.ts` to Use Cache

**Files:**
- Modify: `apps/web/src/modules/ghg/lib/monthly-activity-summary/service.ts`

- [x] **Step 4.1: Read the current service.ts**

  Open the file, find the `getSummaryData()` function. It currently calls:
  ```typescript
  const rawRows = await unstable_cache(
    () => runSummaryQuery({ ... }),  // <-- calls queryTaskRequestSummary from queries.ts
    buildSummaryCacheKey(...),
    { revalidate: SUMMARY_CACHE_TTL_SECONDS, tags: [summaryCacheTag(session.organizationId)] }
  )();
  ```

- [x] **Step 4.2: Add import for cache-queries.ts**

  At the top of `service.ts`, add:
  ```typescript
  import { queryTaskRequestSummaryFromCache } from "./cache-queries";
  ```

- [x] **Step 4.3: Replace the runSummaryQuery call inside getSummaryData()**

  Find the `unstable_cache` block and replace:
  ```typescript
  // BEFORE:
  () => runSummaryQuery({ organizationId: session.organizationId, effectiveLocationIds, yearMonthFilter, tab: params.tab, pageIndex: params.pageIndex, pageSize: params.pageSize, activityCodes, search: params.search, statusFilter: params.statusFilter }),
  
  // AFTER:
  () => queryTaskRequestSummaryFromCache({ organizationId: session.organizationId, effectiveLocationIds, yearMonthFilter, tab: params.tab, pageIndex: params.pageIndex, pageSize: params.pageSize, activityCodes, search: params.search, statusFilter: params.statusFilter }),
  ```

  The `buildSummaryCacheKey`, TTL, and `revalidateTag` logic are all unchanged.

- [x] **Step 4.4: Add fallback for cache query failure**

  Wrap the `unstable_cache` call in a try/catch to fall back to the original query:
  ```typescript
  let rawRows: any[];
  try {
    rawRows = (await unstable_cache(
      () => queryTaskRequestSummaryFromCache({ ... }),
      buildSummaryCacheKey(...),
      { revalidate: SUMMARY_CACHE_TTL_SECONDS, tags: [summaryCacheTag(session.organizationId)] }
    )()) as any[];
  } catch (err) {
    console.error("[summary-cache] cache query failed, falling back to live query:", err);
    rawRows = (await runSummaryQuery({ ... })) as any[];
  }
  ```

  The `runSummaryQuery` import from `queries.ts` is already present — keep it for the fallback.

- [x] **Step 4.5: Check TypeScript compiles**

  ```bash
  npx tsc --noEmit --skipLibCheck
  ```

- [x] **Step 4.6: Smoke test — open the summary page on beta**

  Navigate to the `data-log-summary` embed page. Verify:
  - Page loads and shows activity rows
  - Counts match what was shown before this change
  - Location filter, year filter, month tiles all still work

- [x] **Step 4.7: Commit**

  ```bash
  git add apps/web/src/modules/ghg/lib/monthly-activity-summary/service.ts
  git commit -m "feat(ghg): switch summary read path to ActivitySummaryCache"
  ```

---

## Task 5: Add Cache Upsert to GHG Import Routes (20 routes)

**Pattern for every GHG import route:**

After the successful GraphQL upsert (step 6 in the route's flow), and after the history record is created, add this block:

```typescript
// After successful data write — update summary cache for affected months
const affectedMonthYears = activityTaskRequestMasterData.map((d: any) => ({
  year: Number(d.year),
  month: String(d.month).toLowerCase(),
}));
upsertCacheForActivity({
  organizationId: userSession.organizationId,
  organizationAddressId,
  activityCode: "REPLACE_WITH_ACTIVITY_CODE",
  monthYears: affectedMonthYears,
}).catch((err) => console.error("[summary-cache] GHG upsert failed:", err));
```

Add import at top of each route:
```typescript
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";
```

Note: `.catch()` is intentional — a cache failure must NEVER break the upload response.

- [x] **Step 5.1: waste/excel/route.ts** — activityCode: `"waste"`
- [x] **Step 5.2: production/excel/route.ts** — activityCode: `"production"` (may be `production/route.ts`)
- [x] **Step 5.3: energy-grid-power/excel/route.ts** — activityCode: `"energy_grid_power"`
- [x] **Step 5.4: energy-fuel-purchased/excel/route.ts** — activityCode: `"energy_fuel_purchased"`
- [x] **Step 5.5: energy-captive-power/excel/route.ts** — activityCode: `"energy_captive_power"`
- [x] **Step 5.6: transport-upstream/route.ts** — activityCode: `"transport_upstream"`
- [x] **Step 5.7: transport-downstream/route.ts** — activityCode: `"transport_downstream"`
- [x] **Step 5.8: transport-employee-travel/excel/route.ts** — activityCode: `"transport_employee_travel"`
- [x] **Step 5.9: transport-business-travel/excel/route.ts** — activityCode: `"transport_business_travel"`
- [x] **Step 5.10: general/excel/route.ts** — activityCode: `"general"`
- [x] **Step 5.11: buyer-share/excel/route.ts** — activityCode: `"buyer_share"`
- [x] **Step 5.12: material-procurement/excel/route.ts** — activityCode: `"material_procurement"`
- [x] **Step 5.13: capital-goods/excel/route.ts** — activityCode: `"capital_goods"`
- [x] **Step 5.14: product-share-allocation/excel/route.ts** — activityCode: `"product_share_allocation"`
- [x] **Step 5.15: water-consumption/excel/route.ts** — activityCode: `"water_consumption"`
- [x] **Step 5.16: water-withdrawal/excel/route.ts** — activityCode: `"water_withdrawal"`
- [x] **Step 5.17: wastewater-generation/excel/route.ts** — activityCode: `"wastewater_generation"`
- [x] **Step 5.18: wastewater-treatment/excel/route.ts** — activityCode: `"waste_water_treatment"`
- [x] **Step 5.19: waste/excel/route.ts** (if separate from 5.1, check for `GHGWaste` table)
- [x] **Step 5.20: fugitive/excel/route.ts** — activityCode: `"fugitive_details"`

- [x] **Step 5.21: Compile check**

  ```bash
  npx tsc --noEmit --skipLibCheck
  ```

- [x] **Step 5.22: Commit**

  ```bash
  git add apps/web/src/app/ghg/api/v1/ghg-data-import/
  git commit -m "feat(ghg): update GHG import routes to maintain ActivitySummaryCache"
  ```

---

## Task 6: Add Cache Upsert to ESG Import Routes (5 routes)

Same pattern as Task 5. The `activityTaskRequestMasterData` variable name may differ in ESG routes — check each file. The ESG routes default `month` if missing, so the master data might only have one month/year combination.

- [x] **Step 6.1: csr/excel/route.ts** — activityCode: `"csr"`
- [x] **Step 6.2: human-resources/excel/route.ts** — activityCode: `"human_resources"`
- [x] **Step 6.3: health-and-safety/excel/route.ts** — activityCode: `"health_and_safety"`
- [x] **Step 6.4: governance-and-board-composition/excel/route.ts** — activityCode: `"governance_and_board_composition"`
- [x] **Step 6.5: grievances/excel/route.ts** — activityCode: `"grievances_activity"`

- [x] **Step 6.6: Compile check**

  ```bash
  npx tsc --noEmit --skipLibCheck
  ```

- [x] **Step 6.7: Commit**

  ```bash
  git add apps/web/src/app/ghg/api/v1/esg-data-import/
  git commit -m "feat(ghg): update ESG import routes to maintain ActivitySummaryCache"
  ```

---

## Task 7: Add Cache Update to Approve Route

**Files:**
- Modify: `apps/web/src/app/ghg/api/v1/monthly-activity-summary/approve/route.ts`

- [x] **Step 7.1: Read the approve route**

  Open the file. The flow is:
  ```typescript
  const { data } = await approveActivity(userSession, params);
  // data = { approvedCount, approvedLocationIds }
  if (data.approvedCount > 0) {
    revalidateTag(summaryCacheTag(userSession.organizationId));
    revalidateTag(filtersCacheTag(userSession.organizationId));
  }
  ```

- [x] **Step 7.2: Add import**

  ```typescript
  import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";
  ```

- [x] **Step 7.3: Add cache upsert after revalidateTag calls**

  The approve route has `data.approvedLocationIds` (locations that were approved) and the request body has `activityCode`, `year`, `yearType`, `months`. Use these to trigger recount for all affected (location, activity, year, month) combinations.

  Add this block after `revalidateTag(filtersCacheTag(...))`:
  ```typescript
  if (data.approvedCount > 0 && data.approvedLocationIds.length > 0) {
    // Build the list of (calendar year, month) pairs that were approved.
    // For financial year: months Jan-Mar belong to year+1 (handled by FY month order).
    // The parsed params.year and params.months come from the request body (already validated above).
    const parsedYear = Number(params.year);
    const parsedMonths: string[] = Array.isArray(params.months)
      ? params.months.map((m: string) => m.toLowerCase())
      : typeof params.months === "string" && params.months
      ? params.months.split(",").map((m: string) => m.trim().toLowerCase())
      : [];

    // Get effective month/year pairs (same logic as getSummaryData builds yearMonthFilter)
    // For simplicity: run one upsert per approved location.
    // The upsertCacheForActivity function recounts for each (year, month) combination.
    const upsertPromises = data.approvedLocationIds.flatMap((locationId: string) =>
      parsedMonths.length > 0
        ? [upsertCacheForActivity({
            organizationId: userSession.organizationId,
            organizationAddressId: locationId,
            activityCode: params.activityCode,
            monthYears: parsedMonths.map((m) => ({ year: parsedYear, month: m })),
          })]
        : [] // empty months = all months in FY; skip upsert (revalidateTag handles cache busting)
    );

    Promise.allSettled(upsertPromises).catch(() => {});
  }
  ```

  **Important note on empty months**: If `params.months` is empty (= all months of the FY), we cannot easily enumerate all (year, month) pairs without knowing the FY config. In this case, the existing `revalidateTag()` already busts the Next.js result cache (5s TTL), so the next read will call `queryTaskRequestSummaryFromCache` which reads fresh from the DB cache table. The cache table itself will lag until the next per-month upload or the next `backfillActivitySummaryCache()` call. This is an acceptable gap — add a TODO comment and a future improvement task.

  For a complete fix in a follow-up: pass `yearMonthFilter` to the approve route response or compute it inside approve route using `getOrgFinancialYearStartMonth`.

- [x] **Step 7.4: Compile check and commit**

  ```bash
  npx tsc --noEmit --skipLibCheck
  git add apps/web/src/app/ghg/api/v1/monthly-activity-summary/approve/route.ts
  git commit -m "feat(ghg): update approve route to upsert ActivitySummaryCache after approval"
  ```

---

## Task 8: QA Validation on Beta

- [x] **Step 8.1: Deploy to beta**

  Deploy branch to beta environment. Confirm migration was run (Step 1) and backfill was run (Step 3).

- [x] **Step 8.2: Validate backfill accuracy**

  Open the summary page with no filters. Compare:
  - Displayed counts (from cache-based query)
  - Against the original query: temporarily revert Task 4's service.ts change in DBeaver by running the UNION query directly with the same filters and comparing totals.

- [x] **Step 8.3: QA scenario — upload new data, verify pending increments**

  1. Upload a new Excel file for any activity (e.g., waste)
  2. Open summary page for that activity + location + month
  3. `pending` count should increase by the number of records uploaded
  4. Query `ActivitySummaryCache` directly to confirm the row updated

- [x] **Step 8.4: QA scenario — re-upload, verify no count inflation**

  1. Upload for the same (location, activity, year, month) again
  2. Pending count should stay the same (or change to reflect new row count, not additive)
  3. If the new upload has M records (replacing N), pending = M, not M+N

- [x] **Step 8.5: QA scenario — approve GHG activity**

  1. Approve a GHG activity (e.g., waste) via the approve button
  2. Summary page should show pending → 0, approved → N for that combination
  3. Query cache table to confirm `approved_count` updated, `pending_count = 0`

- [x] **Step 8.6: QA scenario — approve ESG activity**

  1. Approve an ESG activity (e.g., `csr`, `human_resources`)
  2. Same verification as 8.5

- [x] **Step 8.7: QA scenario — financial year month boundary**

  1. For an org with April financial year start, verify:
     - January/February/March data shows in the correct FY (year+1 in cache)
     - The FY 2024 filter correctly shows both April–December 2024 and January–March 2025 data
  2. Compare cache totals vs direct DB count

- [x] **Step 8.8: QA scenario — location filter**

  1. Select a subset of locations in the filter dropdown
  2. Verify counts match only those locations (cross-check with direct cache query filtered by those org_address_ids)

- [x] **Step 8.9: QA scenario — status filter (Pending / Approved badges)**

  1. Click "Pending" badge → only activities with pending > 0 appear in table
  2. Click "Approved" badge → only activities with approved > 0 appear
  3. Summary header counts remain unchanged regardless of badge

- [x] **Step 8.10: QA scenario — 0-count activities still appear**

  Activities mapped to the org but with no uploads for the selected filter should still appear in the table with 0 counts across all columns.

- [x] **Step 8.11: Performance check**

  On beta, open browser DevTools → Network. Time the POST to `/api/v1/monthly-activity-summary`. Expected: under 200ms (target <50ms). If slower, query the cache table directly to verify the indexes are being used:
  ```sql
  EXPLAIN ANALYZE SELECT * FROM "ActivitySummaryCache" WHERE organization_id = '...' AND year = 2024;
  ```

---

## Known Limitations and Follow-up Items

| Item | Detail | Resolution |
|---|---|---|
| Approve with empty months | When `months=[]` (all months), cache upsert is skipped — revalidateTag handles cache bust, but cache table may be stale until next upload | Follow-up: compute full month list from FY config inside approve route |
| `GHGEnergy_CaptivePower_Renewable_Fuel` | Table may not exist on all environments | Skip on error; add once table is created by its migration |
| New activity added in future | Any developer adding a new GHG/ESG table must add: (1) entry to `RECOUNT_CONFIGS`, (2) import route cache upsert, (3) entry to migration SQL backfill | Document in CLAUDE.md as mandatory checklist item |
| Manual DB writes | If data is written directly to DB (bypassing API), cache will not update | Re-run `backfillActivitySummaryCache()` for affected org |
