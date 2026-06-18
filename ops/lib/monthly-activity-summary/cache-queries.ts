// =============================================================================
// ActivitySummaryCache — two-path architecture
//
// WRITE PATH  (upsertCacheForActivity)
//   Called on every upload, re-upload, and approve.
//   Reads the actual GHG/ESG tables to recount pending/approved/rejected for
//   one specific (location × activity × year × month), then writes a single
//   row into ActivitySummaryCache. This is the only place GHG tables are hit.
//
// READ PATH   (queryTaskRequestSummaryFromCache)
//   Called on every page load of the Monthly Activity Summary.
//   Reads ONLY from ActivitySummaryCache (~2,700 rows) plus small metadata
//   tables (Activity, OrganizationActivityMapping, OrganizationAddress).
//   Zero GHG/ESG tables are touched — this is the whole point.
// =============================================================================

import { sql } from "drizzle-orm";
import { GetOPSDBContext } from "~/utils/database/db-context";
import { logger } from "../../utils/logger";
import type { SummaryQueryParams, YearMonthFilterParams } from "./queries";
import { toSqlUuidList } from "./queries";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CacheUpsertParams {
  organizationId: string;
  organizationAddressId: string;
  activityCode: string;
  monthYears: { year: number; month: string }[];
}

// ─── WRITE PATH ───────────────────────────────────────────────────────────────
//
// The three items below (RECOUNT_CONFIGS, buildRecountSQL, upsertCacheForActivity)
// are only ever called when data changes — upload, re-upload, or approve.
// They touch real GHG/ESG tables but run infrequently (once per write event).

// Maps each activity code to the GHG/ESG source tables that hold its data rows.
// "direct" tables have their own activity_task_request_id column.
// "child"  tables do not — they must join to a parent table to reach the ATR.
// Used by buildRecountSQL to know which tables to scan for a given activity.
type DirectConfig = { kind: "direct"; table: string; hasStatus: boolean };
type ChildConfig = {
  kind: "child";
  table: string;
  parentTable: string;
  parentFk: string;
};
type RecountConfig = DirectConfig | ChildConfig;

const RECOUNT_CONFIGS: Record<string, RecountConfig[]> = {
  waste: [{ kind: "direct", table: "GHGWaste", hasStatus: true }],
  production: [
    { kind: "direct", table: "GHGProductionDetails", hasStatus: true },
  ],
  energy_grid_power: [
    {
      kind: "direct",
      table: "GHGEnergyConsumption_GridPower",
      hasStatus: true,
    },
  ],
  energy_fuel_purchased: [
    {
      kind: "child",
      table: "GHGEnergyConsumption_FuelPurchased_General",
      parentTable: "GHGEnergyConsumption_FuelPurchased",
      parentFk: "GHGEnergyConsumption_FuelPurchased_id",
    },
    {
      kind: "child",
      table: "GHGEnergyConsumption_FuelPurchased_HeatingWater",
      parentTable: "GHGEnergyConsumption_FuelPurchased",
      parentFk: "GHGEnergyConsumption_FuelPurchased_id",
    },
    {
      kind: "child",
      table: "GHGEnergyConsumption_FuelPurchased_Auxiliary",
      parentTable: "GHGEnergyConsumption_FuelPurchased",
      parentFk: "GHGEnergyConsumption_FuelPurchased_id",
    },
    {
      kind: "direct",
      table: "GHGEnergyConsumption_FuelPurchased_Transportation",
      hasStatus: false,
    },
  ],
  energy_captive_power: [
    {
      kind: "child",
      table: "GHGEnergy_CaptivePower_Renewable",
      parentTable: "GHGEnergy_CaptivePower",
      parentFk: "GHGEnergyConsumption_CaptivePower_id",
    },
    {
      kind: "child",
      table: "GHGEnergy_CaptivePower_NonRenewable",
      parentTable: "GHGEnergy_CaptivePower",
      parentFk: "GHGEnergyConsumption_CaptivePower_id",
    },
    // GHGEnergy_CaptivePower_Renewable_Fuel may not exist in all environments
    {
      kind: "child",
      table: "GHGEnergy_CaptivePower_Renewable_Fuel",
      parentTable: "GHGEnergy_CaptivePower",
      parentFk: "GHGEnergyConsumption_CaptivePower_id",
    },
  ],
  transport_upstream: [
    { kind: "direct", table: "GHGTransport_Upstream", hasStatus: true },
  ],
  transport_downstream: [
    { kind: "direct", table: "GHGTransport_Downstream", hasStatus: true },
  ],
  transport_employee_travel: [
    { kind: "direct", table: "GHGTransport_EmployeeTravel", hasStatus: true },
  ],
  transport_business_travel: [
    { kind: "direct", table: "GHGTransport_BusinessTravel", hasStatus: true },
  ],
  general: [{ kind: "direct", table: "GHGGeneralDetails", hasStatus: true }],
  buyer_share: [{ kind: "direct", table: "GHGBuyer_Share", hasStatus: true }],
  material_procurement: [
    { kind: "direct", table: "GHGMaterialProcurement", hasStatus: true },
  ],
  capital_goods: [
    { kind: "direct", table: "GHGCapital_Goods", hasStatus: true },
  ],
  product_share_allocation: [
    { kind: "direct", table: "GHGProductShareAttribution", hasStatus: true },
  ],
  water_consumption: [
    { kind: "direct", table: "GHGFreshWater", hasStatus: true },
    { kind: "direct", table: "GHGWasteWater", hasStatus: true },
    { kind: "direct", table: "GHGHarvestedWater", hasStatus: true },
  ],
  water_withdrawal: [
    { kind: "direct", table: "GHGWaterWithdrawal", hasStatus: true },
  ],
  wastewater_generation: [
    { kind: "direct", table: "GHGWastewaterGeneration", hasStatus: true },
  ],
  waste_water_treatment: [
    { kind: "direct", table: "GHGWasteWaterTreatment", hasStatus: true },
    { kind: "direct", table: "GHGEffluentDischarge", hasStatus: false },
    { kind: "direct", table: "GHGSludgeDisposal", hasStatus: false },
  ],
  fugitive_details: [
    { kind: "direct", table: "GHGRefrigerantAndACSystems", hasStatus: true },
    { kind: "direct", table: "GHGFireExtinguisher", hasStatus: true },
    { kind: "direct", table: "GHGIndustrialGas", hasStatus: true },
  ],
  csr: [{ kind: "direct", table: "ESGCSR", hasStatus: false }],
  human_resources: [
    { kind: "direct", table: "ESGEmployeeDiversity", hasStatus: false },
    { kind: "direct", table: "ESGEmployeeTurnover", hasStatus: false },
    { kind: "direct", table: "ESGTrainingHours", hasStatus: false },
  ],
  health_and_safety: [
    { kind: "direct", table: "ESGHealthAndSafety", hasStatus: false },
    { kind: "direct", table: "ESGSafetyObservations", hasStatus: false },
    { kind: "direct", table: "ESGHealthAndSafetyTraining", hasStatus: false },
    { kind: "direct", table: "ESGAssessedLocations", hasStatus: false },
  ],
  governance_and_board_composition: [
    { kind: "direct", table: "ESGBoardComposition", hasStatus: false },
    { kind: "direct", table: "ESGGovernance", hasStatus: false },
  ],
  grievances_activity: [
    { kind: "direct", table: "ESGGrievances", hasStatus: false },
  ],
};

// Builds a SQL string that counts pending/approved/rejected rows from the actual
// GHG/ESG source tables for one specific (location × activity × year × month).
// Returns null if the activity code is not in RECOUNT_CONFIGS.
// Result is a single row: { pending_count, approved_count, rejected_count }.
// Called only by upsertCacheForActivity — never on the read path.
function buildRecountSQL(
  organizationAddressId: string,
  activityCode: string,
  year: number,
  month: string
): string | null {
  const configs = RECOUNT_CONFIGS[activityCode];
  if (!configs || configs.length === 0) return null;

  const branches: string[] = [];

  for (const cfg of configs) {
    if (cfg.kind === "direct") {
      const statusExpr = cfg.hasStatus
        ? "COALESCE(gd.status, atr.status)"
        : "atr.status";
      branches.push(`
        SELECT ${statusExpr} AS eff
        FROM "${cfg.table}" gd
        JOIN "ActivityTaskRequest" atr ON atr.id = gd.activity_task_request_id
        JOIN "TaskRequest" tr ON tr.id = gd.task_request_id
        WHERE gd.organization_address_id = '${organizationAddressId}'
          AND tr.year = ${year}
          AND LOWER(tr.month) = '${month}'
          AND atr.is_deleted IS NOT TRUE`);
    } else {
      branches.push(`
        SELECT COALESCE(p.status, atr.status) AS eff
        FROM "${cfg.table}" gd
        JOIN "${cfg.parentTable}" p ON p.id = gd."${cfg.parentFk}"
        JOIN "ActivityTaskRequest" atr ON atr.id = p.activity_task_request_id
        JOIN "TaskRequest" tr ON tr.id = p.task_request_id
        WHERE p.organization_address_id = '${organizationAddressId}'
          AND tr.year = ${year}
          AND LOWER(tr.month) = '${month}'
          AND atr.is_deleted IS NOT TRUE`);
    }
  }

  return `
    SELECT
      COUNT(*) FILTER (WHERE eff IS NULL OR eff IN ('pending', 'saved')) AS pending_count,
      COUNT(*) FILTER (WHERE eff = 'approved')  AS approved_count
    FROM (${branches.join("\n      UNION ALL")}) AS rows
  `;
}

// WRITE PATH entry point.
// For each (year, month) pair: re-reads the source GHG/ESG tables to get fresh
// counts, then inserts or updates a single row in ActivitySummaryCache.
// Called fire-and-forget after every upload, re-upload, and approve operation.
export async function upsertCacheForActivity(
  params: CacheUpsertParams
): Promise<void> {
  const { organizationId, organizationAddressId, activityCode, monthYears } =
    params;
  if (!RECOUNT_CONFIGS[activityCode] || monthYears.length === 0) return;
  const db = await GetOPSDBContext();
  for (const { year, month } of monthYears) {
    const recountSQL = buildRecountSQL(
      organizationAddressId,
      activityCode,
      year,
      month
    );
    if (!recountSQL) continue;
    const rows = await db.execute(sql.raw(recountSQL));
    const counts = (rows as any)[0] ?? { pending_count: 0, approved_count: 0 };
    const pending = Number(counts.pending_count ?? 0);
    const approved = Number(counts.approved_count ?? 0);
    // Upsert the precomputed counts into the cache table.
    // ON CONFLICT overwrites the counts so this is always safe to re-run.
    await db.execute(
      sql.raw(`
      INSERT INTO "ActivitySummaryCache"
        (organization_id, organization_address_id, activity_code, year, month,
         pending_count, approved_count, updated_at)
      VALUES
        ('${organizationId}', '${organizationAddressId}', '${activityCode}',
         ${year}, '${month}', ${pending}, ${approved}, now())
      ON CONFLICT (organization_id, organization_address_id, activity_code, year, month)
      DO UPDATE SET
        pending_count  = EXCLUDED.pending_count,
        approved_count = EXCLUDED.approved_count,
        updated_at     = now()
    `)
    );
  }
  logger.info(
    `[Cache Upsert] ${activityCode} @ ${organizationAddressId}: ${monthYears.length} month-year pairs processed.`
  );
}

// ─── READ PATH helpers ────────────────────────────────────────────────────────

const ALL_MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

// Maps FY month names to their correct calendar { year, month } pairs.
// When months is empty, expands to all 12 months of the FY.
//
// For an April FY (startMonth=4), FY year 2026:
//   Apr–Dec → calendar year 2026 (monthIndex >= startMonth-1)
//   Jan–Mar → calendar year 2027 (monthIndex <  startMonth-1)
// For a calendar year (startMonth=1): all months stay in fyYear.
export function expandToCalendarMonthYears(
  fyYear: number,
  startMonth: number,
  months: string[]
): { year: number; month: string }[] {
  const targets = months.length > 0 ? months : ALL_MONTHS;
  return targets.map((m) => {
    const idx = ALL_MONTHS.indexOf(m.toLowerCase());
    const calYear =
      startMonth === 1 || idx < 0 || idx >= startMonth - 1
        ? fyYear
        : fyYear + 1;
    return { year: calYear, month: m.toLowerCase() };
  });
}

function buildFYMonthOrder(startMonth: number): string[] {
  const idx = startMonth - 1;
  return [...ALL_MONTHS.slice(idx), ...ALL_MONTHS.slice(0, idx)];
}

// Translates a financial-year filter into a SQL WHERE clause for the
// ActivitySummaryCache table's (year, month) columns.
//
// The complexity here is because a financial year spans two calendar years in
// the DB. For an April FY start and FY 2024:
//   - April–December belong to year=2024
//   - January–March belong to year=2025
// So the clause becomes:
//   (year=2024 AND month IN ('april',...,'december'))
//   OR (year=2025 AND month IN ('january','february','march'))
function buildCacheYearMonthClause(
  filter: YearMonthFilterParams,
  alias = "c"
): string {
  const { year, yearType, startMonth, months } = filter;
  if (yearType === "calendar" || startMonth === 1) {
    const selected = months.length > 0 ? months : ALL_MONTHS;
    const list = selected.map((m) => `'${m}'`).join(", ");
    return `(${alias}.year = ${year} AND ${alias}.month IN (${list}))`;
  }
  const fyOrder = buildFYMonthOrder(startMonth);
  const selected = months.length > 0 ? months : fyOrder;
  const splitIdx = 12 - startMonth + 1; // number of months that fall in calendar year N
  const year1Months = selected.filter((m) => fyOrder.indexOf(m) < splitIdx);
  const year2Months = selected.filter((m) => fyOrder.indexOf(m) >= splitIdx);
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

// ─── READ PATH ────────────────────────────────────────────────────────────────

// READ PATH entry point — replaces the 30-table GHG UNION ALL in queries.ts.
//
// Tables touched (all small, no GHG data tables):
//   - "Activity" + "OrganizationActivityMapping" — resolves which activity codes
//     belong to this org and expands parent codes to leaf codes (~50 rows each)
//   - "OrganizationAddress" + "Addresses" — resolves location names (location_wise tab only)
//   - "ActivitySummaryCache" — the precomputed table; holds pending/approved/rejected
//     counts per (location × activity × year × month), ~2,700 rows for a typical org
//
// The CTEs handle pagination, search filtering (location_wise tab), and status
// filtering (Pending / Approved buttons). All actual counts come from
// ActivitySummaryCache — no GHG or ESG tables are read here.
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

  const locationList = toSqlUuidList(effectiveLocationIds);

  const yearMonthClause = buildCacheYearMonthClause(yearMonthFilter);
  const offset = pageIndex * pageSize;

  // org_activities CTE — two strategies matching queries.ts exactly:
  //
  //   org-admin  (activityCodes === undefined):
  //     Start from OrganizationActivityMapping, expand parents to leaf children.
  //
  //   location-executive (activityCodes provided):
  //     Start from parent.code IN (activityCodes), expand to leaf children.
  //     This matches buildMainActivityData() in activity-permissions: the session
  //     stores PARENT codes, not leaf codes. Filtering on child.code would incorrectly
  //     drop parent activities whose children are NOT directly in the allowed list.
  //
  // In both cases: child.is_master IS NOT TRUE mirrors queries.ts so that
  // intermediate "master" activities are excluded and parent codes resolve
  // to their non-master leaf codes (which is what ActivitySummaryCache is keyed on).

  // Sanitised activity code list for safe SQL interpolation (location-executive path).
  const validCodes = (activityCodes ?? []).filter((c) =>
    /^[a-zA-Z0-9_]+$/.test(c)
  );
  const safeActivityCodeList =
    validCodes.length > 0 ? validCodes.map((c) => `'${c}'`).join(", ") : "''";

  // org_activities SQL differs by role so both tabs share the same CTE body.
  const orgActivitiesCte =
    activityCodes === undefined
      ? `
        SELECT DISTINCT
          COALESCE(child.code, parent.code) AS code,
          COALESCE(child.name, parent.name) AS name
        FROM "Activity" parent
        JOIN "OrganizationActivityMapping" oam
          ON oam.activity_id    = parent.id
         AND oam.organization_id = '${organizationId}'
         AND oam.is_deleted      IS NOT TRUE
        LEFT JOIN "Activity" child
          ON child.parent_code  = parent.code
         AND child.is_master    IS NOT TRUE
         AND child.is_deleted   IS NOT TRUE
        WHERE parent.is_deleted IS NOT TRUE
          AND parent.is_master  IS NOT TRUE
      `
      : validCodes.length > 0
        ? `
        SELECT DISTINCT
          COALESCE(child.code, parent.code) AS code,
          COALESCE(child.name, parent.name) AS name
        FROM "Activity" parent
        LEFT JOIN "Activity" child
          ON child.parent_code  = parent.code
         AND child.is_master    IS NOT TRUE
         AND child.is_deleted   IS NOT TRUE
        WHERE parent.code     IN (${safeActivityCodeList})
          AND parent.is_master  IS NOT TRUE
          AND parent.is_deleted IS NOT TRUE
      `
        : `SELECT NULL::text AS code, NULL::text AS name WHERE 1=0`; // all codes invalid → no rows

  // Escape user-supplied search text before interpolating into ILIKE.
  const safeSearch = (search ?? "").slice(0, 200);
  const escapedSearch = safeSearch
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/'/g, "''");
  const hasSearch = tab === "location_wise" && safeSearch.trim().length > 0;
  const searchClause = hasSearch
    ? `WHERE (b.location_name ILIKE '%${escapedSearch}%' ESCAPE '\\\\' OR b.activity_name ILIKE '%${escapedSearch}%' ESCAPE '\\\\')`
    : "";

  // Translates the status button selection (Total / Pending / Approved) into a
  // WHERE clause applied after summary totals are already computed, so that the
  // header badge counts are never affected by the status filter.
  const statusWhereClause =
    statusFilter === "pending"
      ? "WHERE pending > 0"
      : statusFilter === "approved"
        ? "WHERE approved > 0"
        : "";

  let query: string;

  if (tab === "activity_type") {
    // Activity Type tab: one row per activity, counts summed across all selected locations.
    //
    // CTE flow:
    //   org_activities  — leaf activity codes for this org (expands parent → child via Activity table)
    //   cache_sums      — reads ActivitySummaryCache, groups by activity_code (sums across locations)
    //   all_rows        — LEFT JOIN so activities with zero data still appear with count 0
    //   summary_counts  — header badge totals (computed before status filter, never shrinks)
    //   filtered_rows   — applies status filter (Pending / Approved button)
    //   total_row_count — pagination total after status filter
    query = `
      WITH org_activities AS (${orgActivitiesCte}),
      cache_sums AS (
        SELECT
          c.activity_code,
          SUM(c.pending_count)  AS pending_count,
          SUM(c.approved_count) AS approved_count
        FROM "ActivitySummaryCache" c
        WHERE c.organization_id = '${organizationId}'
          AND c.organization_address_id IN (${locationList})
          AND ${yearMonthClause}
        GROUP BY c.activity_code
      ),
      all_rows AS (
        SELECT
          oa.code AS activity_code,
          oa.name AS activity_name,
          COALESCE(cs.pending_count, 0)  AS pending,
          COALESCE(cs.approved_count, 0) AS approved,
          0                              AS rejected,
          COALESCE(cs.pending_count + cs.approved_count, 0) AS total_records
        FROM org_activities oa
        LEFT JOIN cache_sums cs ON cs.activity_code = oa.code
      ),
      summary_counts AS (
        SELECT
          SUM(pending)       AS summary_pending,
          SUM(approved)      AS summary_approved,
          0                  AS summary_rejected,
          SUM(total_records) AS summary_total
        FROM all_rows
      ),
      filtered_rows AS (
        SELECT * FROM all_rows
        ${statusWhereClause}
      ),
      total_row_count AS (SELECT COUNT(*) AS total_count FROM filtered_rows)
      SELECT
        fr.activity_code, fr.activity_name,
        fr.pending, fr.approved, fr.rejected, fr.total_records,
        sc.summary_pending, sc.summary_approved, sc.summary_rejected, sc.summary_total,
        trc.total_count
      FROM summary_counts sc
      CROSS JOIN total_row_count trc
      LEFT JOIN (
        SELECT * FROM filtered_rows
        ORDER BY activity_name ASC
        LIMIT ${pageSize} OFFSET ${offset}
      ) fr ON TRUE
      ORDER BY fr.activity_name ASC
    `;
  } else {
    // Location Wise tab: one row per (location × activity), counts per cell.
    //
    // CTE flow:
    //   org_activities  — same as above
    //   org_locations   — location names from OrganizationAddress + Addresses
    //   base            — CROSS JOIN of all locations × all activities (ensures
    //                     every cell appears even when count is 0)
    //   cache_sums      — reads ActivitySummaryCache, grouped by (location, activity)
    //   all_rows        — LEFT JOIN base with cache_sums for counts
    //   summary_counts  — header badge totals (computed before search/status filter)
    //   search_filtered — applies text search AFTER summary_counts so badge totals
    //                     are not affected by what the user types in the search box
    //   filtered_rows   — applies status filter after search
    //   total_row_count — pagination total
    query = `
      WITH org_activities AS (${orgActivitiesCte}),
      org_locations AS (
        SELECT oa.id AS org_address_id, addr.name AS location_name
        FROM "OrganizationAddress" oa
        JOIN "Addresses" addr ON addr.id = oa.address_id
        WHERE oa.organization_id = '${organizationId}'
          AND oa.id IN (${locationList})
          AND oa.is_deleted IS NOT TRUE
      ),
      base AS (
        SELECT l.org_address_id AS location_id, l.location_name, a.code AS activity_code, a.name AS activity_name
        FROM org_locations l
        CROSS JOIN org_activities a
      ),
      cache_sums AS (
        SELECT
          c.organization_address_id,
          c.activity_code,
          SUM(c.pending_count)  AS pending_count,
          SUM(c.approved_count) AS approved_count
        FROM "ActivitySummaryCache" c
        WHERE c.organization_id = '${organizationId}'
          AND c.organization_address_id IN (${locationList})
          AND ${yearMonthClause}
        GROUP BY c.organization_address_id, c.activity_code
      ),
      all_rows AS (
        SELECT
          b.location_id, b.location_name, b.activity_code, b.activity_name,
          COALESCE(cs.pending_count, 0)  AS pending,
          COALESCE(cs.approved_count, 0) AS approved,
          0                              AS rejected,
          COALESCE(cs.pending_count + cs.approved_count, 0) AS total_records
        FROM base b
        LEFT JOIN cache_sums cs
          ON cs.organization_address_id = b.location_id
         AND cs.activity_code = b.activity_code
      ),
      summary_counts AS (
        SELECT
          SUM(pending)       AS summary_pending,
          SUM(approved)      AS summary_approved,
          0                  AS summary_rejected,
          SUM(total_records) AS summary_total
        FROM all_rows
      ),
      search_filtered AS (
        SELECT * FROM all_rows
        ${searchClause}
      ),
      filtered_rows AS (
        SELECT * FROM search_filtered
        ${statusWhereClause}
      ),
      total_row_count AS (SELECT COUNT(*) AS total_count FROM filtered_rows)
      SELECT
        fr.location_id, fr.location_name, fr.activity_code, fr.activity_name,
        fr.pending, fr.approved, fr.rejected, fr.total_records,
        sc.summary_pending, sc.summary_approved, sc.summary_rejected, sc.summary_total,
        trc.total_count
      FROM summary_counts sc
      CROSS JOIN total_row_count trc
      LEFT JOIN (
        SELECT * FROM filtered_rows
        ORDER BY location_name ASC, activity_name ASC
        LIMIT ${pageSize} OFFSET ${offset}
      ) fr ON TRUE
      ORDER BY fr.location_name ASC, fr.activity_name ASC
    `;
  }

  const db = await GetOPSDBContext();
  return db.execute(sql.raw(query)) as Promise<any[]>;
}

// ─── One-time backfill utility ────────────────────────────────────────────────

// Populates ActivitySummaryCache from scratch by finding every distinct
// (org × location × activity × year × month) combination that exists in
// ActivityTaskRequest, then calling upsertCacheForActivity for each one.
// Safe to re-run — upsertCacheForActivity uses ON CONFLICT DO UPDATE.
// Normally run once via the migration SQL; this function is a TypeScript
// fallback in case you need to trigger it programmatically.
export async function backfillActivitySummaryCache(): Promise<{
  rowsUpserted: number;
}> {
  const db = await GetOPSDBContext();
  const combos = await db.execute(
    sql.raw(`
    SELECT DISTINCT
      oa.organization_id,
      atr.organization_address_id,
      act.code        AS activity_code,
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
  `)
  );
  let count = 0;
  for (const row of combos as any[]) {
    await upsertCacheForActivity({
      organizationId: row.organization_id,
      organizationAddressId: row.organization_address_id,
      activityCode: row.activity_code,
      monthYears: [{ year: Number(row.year), month: row.month }],
    }).catch((err) =>
      console.error(
        `[backfill] ${row.activity_code} ${row.year}/${row.month}:`,
        err
      )
    );
    count++;
  }
  return { rowsUpserted: count };
}
