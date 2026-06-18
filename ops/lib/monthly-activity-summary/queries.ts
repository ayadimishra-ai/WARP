import { sql } from "drizzle-orm";
import { GetOPSDBContext } from "~/utils/database/db-context";
import { ActivityExportConfig } from "./export-config";

// ─── Validation helpers ───────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALL_MONTHS_LOWER = [
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

/** Returns a SQL-safe IN-list string of validated UUIDs. */
export function toSqlUuidList(ids: string[]): string {
  const valid = ids.filter((id) => UUID_REGEX.test(id));
  if (valid.length === 0) return "''";
  return valid.map((id) => `'${id}'`).join(",");
}

/** Returns a SQL-safe IN-list string of validated month names (lower-case). */
function toSqlMonthList(months: string[]): string {
  const valid = months
    .map((m) => m.toLowerCase())
    .filter((m) => ALL_MONTHS_LOWER.includes(m));
  if (valid.length === 0)
    return ALL_MONTHS_LOWER.map((m) => `'${m}'`).join(",");
  return valid.map((m) => `'${m}'`).join(",");
}

const ACTIVITY_CODE_REGEX = /^[a-zA-Z0-9_]+$/;

/** Returns a SQL-safe IN-list string of validated activity codes. */
function toSqlActivityCodeList(codes: string[]): string {
  const valid = codes.filter((c) => ACTIVITY_CODE_REGEX.test(c));
  if (valid.length === 0) return "''";
  return valid.map((c) => `'${c}'`).join(",");
}

/**
 * Sanitizes a free-text search string for safe use in a PostgreSQL ILIKE pattern.
 *
 * - Limits length to 200 characters.
 * - Escapes ILIKE special characters (`\`, `%`, `_`) using `\` as the ESCAPE char.
 * - Doubles single quotes (`'` → `''`) for safe inline SQL string literal interpolation.
 *
 * Usage in SQL:  col ILIKE '%${sanitizeSearchPattern(v)}%' ESCAPE '\'
 */
function sanitizeSearchPattern(value: string): string {
  return value
    .trim()
    .substring(0, 200)
    .replace(/\\/g, "\\\\") // \ → \\ (escape char itself — must be first)
    .replace(/%/g, "\\%") // % → \%
    .replace(/_/g, "\\_") // _ → \_
    .replace(/'/g, "''"); // ' → '' (SQL string literal escaping)
}

// ─── Year/month filter builder ─────────────────────────────────────────────────

export interface YearMonthFilterParams {
  year: number; // FY start year (or calendar year)
  yearType: "financial" | "calendar";
  startMonth: number; // 1-based (1=Jan, 4=Apr)
  months: string[]; // additional month filter (lowercase), empty = all
}

/**
 * Builds the WHERE clause fragment for year + month filtering.
 *
 * Financial year example (startMonth=4, year=2025):
 *   Apr-Dec 2025  →  year=2025, month IN ('april',...,'december')
 *   Jan-Mar 2026  →  year=2026, month IN ('january','february','march')
 *
 * Calendar year: tr.year = <year>
 */
function buildYearMonthClause(f: YearMonthFilterParams): string {
  const startIdx = f.startMonth - 1; // convert to 0-based

  let yearExpr: string;
  if (f.yearType === "financial" && f.startMonth !== 1) {
    const startMonthsArr = ALL_MONTHS_LOWER.slice(startIdx); // Apr–Dec
    const endMonthsArr = ALL_MONTHS_LOWER.slice(0, startIdx); // Jan–Mar

    if (startMonthsArr.length === 0 || endMonthsArr.length === 0) {
      yearExpr = `tr.year = ${f.year}`;
    } else {
      const startPart = startMonthsArr.map((m) => `'${m}'`).join(",");
      const endPart = endMonthsArr.map((m) => `'${m}'`).join(",");
      yearExpr = `(
        (tr.year = ${f.year} AND LOWER(tr.month) IN (${startPart}))
        OR (tr.year = ${f.year + 1} AND LOWER(tr.month) IN (${endPart}))
      )`;
    }
  } else {
    yearExpr = `tr.year = ${f.year}`;
  }

  if (f.months.length > 0) {
    const monthList = toSqlMonthList(f.months);
    return `${yearExpr} AND LOWER(tr.month) IN (${monthList})`;
  }

  return yearExpr;
}

/**
 * Returns a SQL expression that maps tr.month (lowercase month name) to a
 * sortable integer for chronological ordering.
 *
 * Calendar year: Jan=1 ... Dec=12.
 * Financial year (startMonth != 1): rotated so the FY start month is 0 and
 * the prior month is 11 — e.g. for startMonth=4 (April): Apr=0, May=1, ...,
 * Mar=11, giving Apr→Mar order when sorted ascending.
 */
function buildMonthOrderExpr(f: YearMonthFilterParams): string {
  const monthNum = `CASE LOWER(tr.month)
    WHEN 'january'   THEN 1
    WHEN 'february'  THEN 2
    WHEN 'march'     THEN 3
    WHEN 'april'     THEN 4
    WHEN 'may'       THEN 5
    WHEN 'june'      THEN 6
    WHEN 'july'      THEN 7
    WHEN 'august'    THEN 8
    WHEN 'september' THEN 9
    WHEN 'october'   THEN 10
    WHEN 'november'  THEN 11
    WHEN 'december'  THEN 12
  END`;

  if (f.yearType === "financial" && f.startMonth !== 1) {
    return `((${monthNum} - ${f.startMonth} + 12) % 12)`;
  }
  return monthNum;
}

// ─── GHG row UNION — used exclusively by queryTaskRequestSummary ──────────────
// Selects one row per leaf data record so the COUNT in queryTaskRequestSummary
// matches exactly the number of rows the export produces for the same filters.
//
// Three table patterns:
//   1. Direct  — table owns task_request_id / organization_address_id / status.
//   2. Child   — table links to a parent via FK; parent owns the FK columns and
//                status, so we JOIN the parent to obtain them.
//   3. No status column (sub-tables, ESG) — use NULL::text; treated as 'pending'
//                per RULE-007 (NULL / 'pending' / 'saved' all = Pending).
//
// RULE: Every table listed in export-config.ts MUST have a matching branch here.
// Adding a new activity table to the export config requires a matching entry.

const GHG_UNION = `
  -- ── Waste ──────────────────────────────────────────────────────────────────
  SELECT 'waste'                     AS activity_code, status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGWaste"
  UNION ALL
  -- ── Production ─────────────────────────────────────────────────────────────
  SELECT 'production',               status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGProductionDetails"
  UNION ALL
  -- ── Energy — Grid Power (direct) ───────────────────────────────────────────
  SELECT 'energy_grid_power',        status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGEnergyConsumption_GridPower"
  UNION ALL
  -- ── Energy — Fuel Purchased (child sub-tables + one direct sub-table) ──────
  -- Previously counted from the parent GHGEnergyConsumption_FuelPurchased,
  -- which caused summary counts to differ from export rows (parent ≠ children).
  -- Now counted from the same leaf tables the export reads.
  SELECT 'energy_fuel_purchased',    p.status, p.organization_address_id, p.task_request_id, p.activity_task_request_id FROM "GHGEnergyConsumption_FuelPurchased_General"      c JOIN "GHGEnergyConsumption_FuelPurchased" p ON p.id = c."GHGEnergyConsumption_FuelPurchased_id"
  UNION ALL
  SELECT 'energy_fuel_purchased',    p.status, p.organization_address_id, p.task_request_id, p.activity_task_request_id FROM "GHGEnergyConsumption_FuelPurchased_HeatingWater"  c JOIN "GHGEnergyConsumption_FuelPurchased" p ON p.id = c."GHGEnergyConsumption_FuelPurchased_id"
  UNION ALL
  SELECT 'energy_fuel_purchased',    p.status, p.organization_address_id, p.task_request_id, p.activity_task_request_id FROM "GHGEnergyConsumption_FuelPurchased_Auxiliary"     c JOIN "GHGEnergyConsumption_FuelPurchased" p ON p.id = c."GHGEnergyConsumption_FuelPurchased_id"
  UNION ALL
  SELECT 'energy_fuel_purchased',    NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGEnergyConsumption_FuelPurchased_Transportation"
  UNION ALL
  -- ── Energy — Captive Power (child sub-tables) ───────────────────────────────
  SELECT 'energy_captive_power',     p.status, p.organization_address_id, p.task_request_id, p.activity_task_request_id FROM "GHGEnergy_CaptivePower_Renewable"       c JOIN "GHGEnergy_CaptivePower" p ON p.id = c."GHGEnergyConsumption_CaptivePower_id"
  UNION ALL
  SELECT 'energy_captive_power',     p.status, p.organization_address_id, p.task_request_id, p.activity_task_request_id FROM "GHGEnergy_CaptivePower_NonRenewable"    c JOIN "GHGEnergy_CaptivePower" p ON p.id = c."GHGEnergyConsumption_CaptivePower_id"
  UNION ALL
  SELECT 'energy_captive_power',     p.status, p.organization_address_id, p.task_request_id, p.activity_task_request_id FROM "GHGEnergy_CaptivePower_Renewable_Fuel" c JOIN "GHGEnergy_CaptivePower" p ON p.id = c."GHGEnergyConsumption_CaptivePower_id"
  UNION ALL
  -- ── Transport ───────────────────────────────────────────────────────────────
  SELECT 'transport_upstream',       status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGTransport_Upstream"
  UNION ALL
  SELECT 'transport_downstream',     status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGTransport_Downstream"
  UNION ALL
  SELECT 'transport_employee_travel', status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGTransport_EmployeeTravel"
  UNION ALL
  SELECT 'transport_business_travel', status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGTransport_BusinessTravel"
  UNION ALL
  -- ── General / Buyer / Material / Capital / Product ──────────────────────────
  SELECT 'general',                  status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGGeneralDetails"
  UNION ALL
  SELECT 'buyer_share',              status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGBuyer_Share"
  UNION ALL
  SELECT 'material_procurement',     status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGMaterialProcurement"
  UNION ALL
  SELECT 'capital_goods',            status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGCapital_Goods"
  UNION ALL
  SELECT 'product_share_allocation', status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGProductShareAttribution"
  UNION ALL
  -- ── Water ───────────────────────────────────────────────────────────────────
  SELECT 'water_consumption',        status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGFreshWater"
  UNION ALL
  SELECT 'water_consumption',        status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGWasteWater"
  UNION ALL
  SELECT 'water_consumption',        status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGHarvestedWater"
  UNION ALL
  SELECT 'water_withdrawal',         status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGWaterWithdrawal"
  UNION ALL
  SELECT 'wastewater_generation',    status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGWastewaterGeneration"
  UNION ALL
  SELECT 'waste_water_treatment',    status,       organization_address_id, task_request_id, activity_task_request_id FROM "GHGWasteWaterTreatment"
  UNION ALL
  SELECT 'waste_water_treatment',    NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGEffluentDischarge"
  UNION ALL
  SELECT 'waste_water_treatment',    NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGSludgeDisposal"
  UNION ALL
  -- ── Fugitive ────────────────────────────────────────────────────────────────
  SELECT 'fugitive_details',         status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGRefrigerantAndACSystems"
  UNION ALL
  SELECT 'fugitive_details',         status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGFireExtinguisher"
  UNION ALL
  SELECT 'fugitive_details',         status, organization_address_id, task_request_id, activity_task_request_id FROM "GHGIndustrialGas"
  UNION ALL
  -- ── ESG tables (no status column → NULL, treated as pending per RULE-007) ──
  SELECT 'csr',                      NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGCSR"
  UNION ALL
  SELECT 'human_resources',          NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGEmployeeDiversity"
  UNION ALL
  SELECT 'human_resources',          NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGEmployeeTurnover"
  UNION ALL
  SELECT 'human_resources',          NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGTrainingHours"
  UNION ALL
  SELECT 'health_and_safety',        NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGHealthAndSafety"
  UNION ALL
  SELECT 'health_and_safety',        NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGSafetyObservations"
  UNION ALL
  SELECT 'health_and_safety',        NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGHealthAndSafetyTraining"
  UNION ALL
  SELECT 'health_and_safety',        NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGAssessedLocations"
  UNION ALL
  SELECT 'governance_and_board_composition', NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGBoardComposition"
  UNION ALL
  SELECT 'governance_and_board_composition', NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGGovernance"
  UNION ALL
  SELECT 'grievances_activity',      NULL::text AS status, organization_address_id, task_request_id, activity_task_request_id FROM "ESGGrievances"
`;

// ─── GHG table list per activity_code (for targeted approval UPDATE) ──────────
// Used by approveActivityTaskRequests to propagate 'approved' to GHG rows.
// Only GHG tables that have a `status` column (added by the 21-04-2026 migration)
// are listed here — ESG tables are intentionally absent from this map because they
// do NOT have a `status` column and cannot be updated via the propagation step.

const GHG_TABLES_BY_ACTIVITY: Record<string, string[]> = {
  waste: ["GHGWaste"],
  production: ["GHGProductionDetails"],
  energy_fuel_purchased: ["GHGEnergyConsumption_FuelPurchased"],
  energy_grid_power: ["GHGEnergyConsumption_GridPower"],
  energy_captive_power: ["GHGEnergy_CaptivePower"],
  transport_upstream: ["GHGTransport_Upstream"],
  transport_downstream: ["GHGTransport_Downstream"],
  transport_employee_travel: ["GHGTransport_EmployeeTravel"],
  transport_business_travel: ["GHGTransport_BusinessTravel"],
  general: ["GHGGeneralDetails"],
  buyer_share: ["GHGBuyer_Share"],
  material_procurement: ["GHGMaterialProcurement"],
  capital_goods: ["GHGCapital_Goods"],
  product_share_allocation: ["GHGProductShareAttribution"],
  water_consumption: ["GHGFreshWater", "GHGWasteWater", "GHGHarvestedWater"],
  water_withdrawal: ["GHGWaterWithdrawal"],
  wastewater_generation: ["GHGWastewaterGeneration"],
  waste_water_treatment: ["GHGWasteWaterTreatment"],
  fugitive_details: [
    "GHGRefrigerantAndACSystems",
    "GHGFireExtinguisher",
    "GHGIndustrialGas",
  ],
};

// ─── All data tables per activity_code (for finding ATR IDs during approve) ────
//
// WHY THIS EXISTS SEPARATELY FROM GHG_TABLES_BY_ACTIVITY:
//   ATR rows are created by getTaskRequestActvityTaskRequestId() using the PARENT
//   activity code (e.g. 'transport'), not the leaf code ('transport_business_travel').
//   That means ActivityTaskRequest.activity_id → Activity.code = 'transport', not
//   'transport_business_travel'.
//
//   The old approve query tried to find ATR IDs via:
//     JOIN "Activity" act ON act.id = atr2.activity_id
//     WHERE act.code = 'transport_business_travel'
//   This always returned 0 rows because activity_id points to the parent.
//
//   The correct approach (mirroring the summary query) is to go:
//     data table → activity_task_request_id → ATR
//   which bypasses activity_id entirely and matches exactly what the summary counts.
//
//   ESG tables have activity_task_request_id but no status column, so they appear
//   here for ATR lookup but NOT in GHG_TABLES_BY_ACTIVITY (which is only used for
//   the status propagation UPDATE step).
const ALL_DATA_TABLES_BY_ACTIVITY: Record<string, string[]> = {
  ...GHG_TABLES_BY_ACTIVITY,
  // GHGEnergyConsumption_FuelPurchased_Transportation is a direct table in GHG_UNION
  // with its own activity_task_request_id (not a child of the parent FuelPurchased
  // table). It has no status column so it is absent from GHG_TABLES_BY_ACTIVITY.
  energy_fuel_purchased: [
    ...GHG_TABLES_BY_ACTIVITY.energy_fuel_purchased,
    "GHGEnergyConsumption_FuelPurchased_Transportation",
  ],
  // GHGEffluentDischarge and GHGSludgeDisposal are direct tables in GHG_UNION with
  // their own activity_task_request_id. Both use NULL::text AS status in GHG_UNION
  // so they are absent from GHG_TABLES_BY_ACTIVITY.
  waste_water_treatment: [
    ...GHG_TABLES_BY_ACTIVITY.waste_water_treatment,
    "GHGEffluentDischarge",
    "GHGSludgeDisposal",
  ],
  // ESG activities — have activity_task_request_id but no status column
  csr: ["ESGCSR"],
  human_resources: [
    "ESGEmployeeDiversity",
    "ESGEmployeeTurnover",
    "ESGTrainingHours",
  ],
  health_and_safety: [
    "ESGHealthAndSafety",
    "ESGSafetyObservations",
    "ESGHealthAndSafetyTraining",
    "ESGAssessedLocations",
  ],
  governance_and_board_composition: ["ESGBoardComposition", "ESGGovernance"],
  grievances_activity: ["ESGGrievances"],
};

// Tables that have a status column (added by the 21-04-2026 migration).
// Every table in GHG_TABLES_BY_ACTIVITY has the column; extra tables in
// ALL_DATA_TABLES_BY_ACTIVITY (ESG tables, sub-tables without status) do not.
// Used by buildDataTableUnion to emit NULL::text for tables that lack the column.
const GHG_TABLES_WITH_STATUS = new Set(
  (Object.values(GHG_TABLES_BY_ACTIVITY) as string[][]).flat()
);

// ─── Child tables linked through a parent GHG table ───────────────────────────
//
// Some activities store their user-visible rows in CHILD tables that have no
// activity_task_request_id of their own — they link to a parent GHG table via
// a foreign key. Example: captive power renewable/non-renewable rows live in
// child tables, while the activity_task_request_id sits on the parent row.
//
// These children are NOT in ALL_DATA_TABLES_BY_ACTIVITY (which assumes a direct
// activity_task_request_id) but they still need updated_at / updated_by refreshed
// on approve so the audit shown to the user reflects the approval.
const CHILD_TABLES_BY_PARENT: Record<
  string,
  { table: string; parentFkColumn: string }[]
> = {
  GHGEnergy_CaptivePower: [
    {
      table: "GHGEnergy_CaptivePower_Renewable",
      parentFkColumn: "GHGEnergyConsumption_CaptivePower_id",
    },
    {
      table: "GHGEnergy_CaptivePower_NonRenewable",
      parentFkColumn: "GHGEnergyConsumption_CaptivePower_id",
    },
  ],
  // Fuel Consumption (activity_code: energy_fuel_purchased) renders rows from
  // three child tables — General Purpose, Heating Water, and Auxiliary tabs —
  // all linked to the parent via GHGEnergyConsumption_FuelPurchased_id. The
  // parent's activity_task_request_id is updated by Step 2, but the user-visible
  // child rows were left stale until this map was extended.
  GHGEnergyConsumption_FuelPurchased: [
    {
      table: "GHGEnergyConsumption_FuelPurchased_General",
      parentFkColumn: "GHGEnergyConsumption_FuelPurchased_id",
    },
    {
      table: "GHGEnergyConsumption_FuelPurchased_HeatingWater",
      parentFkColumn: "GHGEnergyConsumption_FuelPurchased_id",
    },
    {
      table: "GHGEnergyConsumption_FuelPurchased_Auxiliary",
      parentFkColumn: "GHGEnergyConsumption_FuelPurchased_id",
    },
  ],
};

/**
 * Builds a UNION SELECT of (activity_task_request_id, organization_address_id,
 * task_request_id, ghg_status) from every data table associated with an activity.
 *
 * ghg_status is the GHG row's own status column where available, or NULL::text
 * for tables that don't have the column (ESG tables, sub-tables).  NULL is
 * treated as 'pending' (RULE-007), which is correct for those tables.
 *
 * Used in approveActivityTaskRequests to:
 *   a) find ATR IDs via the data-table path (same as the summary query), and
 *   b) filter by GHG row status instead of ATR status so that approving one
 *      sibling child-activity (e.g. transport_upstream) does not block approval
 *      of another sibling (e.g. transport_downstream) that shares the same ATR.
 */
function buildDataTableUnion(tables: string[]): string {
  return tables
    .map((t) => {
      const statusExpr = GHG_TABLES_WITH_STATUS.has(t)
        ? "status"
        : "NULL::text";
      return `SELECT activity_task_request_id, organization_address_id, task_request_id, ${statusExpr} AS ghg_status FROM "${t}"`;
    })
    .join("\n  UNION ALL\n  ");
}

/**
 * Builds the activity-specific GHG UNION that mirrors the relevant entries in
 * GHG_UNION for a given activity's export config.
 *
 * For "child" join-type sheets: SELECT from child table JOINed to parent
 * (same structure as GHG_UNION child entries — p.status, p.task_request_id, etc.)
 * For "direct" join-type sheets: SELECT directly from the data table.
 *
 * Multiple sheets that reference the same source table (e.g. transport_upstream
 * road/non-road split, or buyer_share with 8 method variants) are deduplicated
 * so the table is queried only once — matching how GHG_UNION handles them.
 *
 * Using this instead of buildDataTableUnion guarantees that queryMatchingAtrIds
 * uses the EXACT SAME join structure as ghg_filtered in the summary query, which
 * eliminates the summary-vs-export count discrepancy.
 */
function buildActivityGhgUnionFromConfig(config: ActivityExportConfig): string {
  const seen = new Set<string>();
  const branches: string[] = [];

  for (const sheet of config.sheets) {
    if (sheet.joinType === "child") {
      const key = `child:${sheet.ghgTable}:${sheet.parentTable}:${sheet.parentJoinColumn}`;
      if (seen.has(key)) continue;
      seen.add(key);
      branches.push(
        `SELECT p.activity_task_request_id, p.organization_address_id, p.task_request_id, p.status AS ghg_status` +
          ` FROM "${sheet.ghgTable}" c JOIN "${sheet.parentTable}" p ON p.id = c."${sheet.parentJoinColumn}"`
      );
    } else {
      const key = `direct:${sheet.ghgTable}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const statusExpr = GHG_TABLES_WITH_STATUS.has(sheet.ghgTable)
        ? "status"
        : "NULL::text";
      branches.push(
        `SELECT activity_task_request_id, organization_address_id, task_request_id, ${statusExpr} AS ghg_status` +
          ` FROM "${sheet.ghgTable}"`
      );
    }
  }

  if (branches.length === 0) return "";
  return branches.join("\n  UNION ALL\n  ");
}

// ─── Query params ──────────────────────────────────────────────────────────────

export interface BaseQueryParams {
  organizationId: string;
  effectiveLocationIds: string[];
  yearMonthFilter: YearMonthFilterParams;
}

// ─── Summary query ─────────────────────────────────────────────────────────────
//
// PURPOSE: Powers the dashboard table — shows every assigned activity with its
//   pending / approved / rejected record counts for the selected filters.
//
// WHY IT EXISTS SEPARATELY FROM queryExportData:
//   The table view needs aggregated COUNTS across ALL activities in one response.
//   To do that we UNION all 23 GHG tables (GHG_UNION) to get every row's
//   activity_code and status, then GROUP BY activity to produce the counts.
//   The result has no data columns — just (activityName, total, pending, approved,
//   rejected). You cannot use this query to produce an Excel export because the
//   actual field values (e.g. Types_of_Waste_Generated, PowerConsumed_through_Grid_Kwh)
//   are never selected.
//
//   queryExportData does the opposite: it queries ONE specific GHG table at a time,
//   selecting ALL its data columns. It cannot produce counts across all activities.
//
// SHARED LOGIC: Both queries use the same buildYearMonthClause() and toSqlUuidList()
//   helpers, and the same org/location intersection is applied before calling either
//   function — so what the table counts and what the export contains are consistent.

export interface SummaryQueryParams extends BaseQueryParams {
  tab: "activity_type" | "location_wise";
  pageIndex: number;
  pageSize: number;
  /**
   * When provided (location-executive), restricts org_activities to only these
   * activity codes instead of fetching all via OrganizationActivityMapping.
   * undefined = org-admin path (uses OrganizationActivityMapping).
   */
  activityCodes?: string[];
  /**
   * Free-text search applied only on the location_wise tab.
   * Filters on locationName OR activityName (case-insensitive ILIKE).
   * Absent or empty = no filter.
   */
  search?: string;
  /**
   * Optional status filter. When present, a HAVING clause is added to the
   * grouped CTE so only rows with at least one record in that status bucket
   * are returned. summary_counts is intentionally NOT filtered — the overall
   * badge totals at the top reflect the full selected dataset.
   * "pending"  → HAVING pending > 0
   * "approved" → HAVING approved > 0
   */
  statusFilter?: "pending" | "approved" | null;
}

/**
 * Returns one row per activity (activity_type tab) or per (location × activity)
 * (location_wise tab). Every activity assigned to the org via
 * OrganizationActivityMapping is always present — counts are 0 when no data has
 * been uploaded yet. Overall totals and pagination metadata are CROSS JOINed onto
 * every row so the client receives everything in a single round-trip.
 */
export async function queryTaskRequestSummary(params: SummaryQueryParams) {
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
  const yearMonthClause = buildYearMonthClause(yearMonthFilter);
  const offset = pageIndex * pageSize;

  // org_activities is shared by both tabs.
  // base differs per tab:
  //   activity_type  → one row per activity (org_activities directly)
  //   location_wise  → one row per (location × activity) via CROSS JOIN
  const baseCteDef =
    tab === "activity_type"
      ? `SELECT activity_code, activity_name FROM org_activities`
      : `
        SELECT
          oa.id        AS location_id,
          addr.name    AS location_name,
          oa_act.activity_code,
          oa_act.activity_name
        FROM "OrganizationAddress" oa
        JOIN "Addresses"   addr   ON addr.id  = oa.address_id
        CROSS JOIN org_activities oa_act
        WHERE oa.organization_id = '${organizationId}'
          AND oa.is_deleted IS NOT TRUE
          AND oa.id IN (${locationList})
      `;

  const baseSelectCols =
    tab === "activity_type"
      ? `b.activity_code, b.activity_name`
      : `b.location_id, b.location_name, b.activity_code, b.activity_name`;

  // For location_wise the LEFT JOIN must also match on location so counts stay
  // per-location rather than being summed across all locations.
  const leftJoinOn =
    tab === "activity_type"
      ? `gf.activity_code = b.activity_code`
      : `gf.activity_code = b.activity_code AND gf.location_id = b.location_id`;

  const groupBy =
    tab === "activity_type"
      ? `b.activity_code, b.activity_name`
      : `b.location_id, b.location_name, b.activity_code, b.activity_name`;

  const orderBy =
    tab === "activity_type"
      ? `g.activity_name`
      : `g.location_name, g.activity_name`;

  // Same ORDER BY used inside the page subquery — the subquery selects from
  // grouped/search_filtered directly (no `g` alias), so the column references
  // must be unqualified there.
  const innerOrderBy =
    tab === "activity_type" ? `activity_name` : `location_name, activity_name`;
  // COUNT(gf.activity_code) is used for total_records instead of COUNT(*) so
  // unmatched LEFT JOIN rows (no GHG data) produce 0, not 1.
  // The pending CASE must also guard on gf.activity_code IS NOT NULL to avoid
  // counting the LEFT JOIN null row (where gf.status IS NULL evaluates to TRUE).
  // org_activities CTE — two strategies, both expanded to LEAF (sub-activity) level:
  //
  //   OrganizationActivityMapping stores PARENT codes (e.g. 'energy', 'transport').
  //   The activity-permissions API expands each parent to its children
  //   (energy_captive_power, energy_grid_power, ...) producing ~23 rows.
  //   We must do the same here so that the summary row count matches exactly.
  //
  //   Expansion rule: if a parent has children in the Activity table
  //   (child.parent_code = parent.code), keep only the children.
  //   If a parent has NO children (waste, general, production...), keep itself.
  //   This mirrors what buildMainActivityData() in activity-permissions does.
  //
  //   1. org-admin  (activityCodes === undefined): start from OrganizationActivityMapping.
  //   2. location-executive (activityCodes provided): start from the allowed parent codes
  //      stored in session.mappings[].activities.
  const orgActivitiesCte =
    activityCodes === undefined
      ? `
      SELECT
        COALESCE(child.code, parent.code) AS activity_code,
        COALESCE(child.name, parent.name) AS activity_name
      FROM "OrganizationActivityMapping" oam
      JOIN "Activity" parent
        ON parent.id = oam.activity_id
        AND parent.is_master   IS NOT TRUE
        AND parent.is_deleted  IS NOT TRUE
      LEFT JOIN "Activity" child
        ON child.parent_code  = parent.code
        AND child.is_master   IS NOT TRUE
        AND child.is_deleted  IS NOT TRUE
      WHERE oam.organization_id = '${organizationId}'
        AND oam.is_deleted IS NOT TRUE
    `
      : `
      SELECT
        COALESCE(child.code, parent.code) AS activity_code,
        COALESCE(child.name, parent.name) AS activity_name
      FROM "Activity" parent
      LEFT JOIN "Activity" child
        ON child.parent_code  = parent.code
        AND child.is_master   IS NOT TRUE
        AND child.is_deleted  IS NOT TRUE
      WHERE parent.code IN (${toSqlActivityCodeList(activityCodes)})
        AND parent.is_master   IS NOT TRUE
        AND parent.is_deleted  IS NOT TRUE
    `;

  const query = `
    WITH
    org_activities AS (
      ${orgActivitiesCte}
    ),
    base AS (
      ${baseCteDef}
    ),
    ghg_rows AS (
      ${GHG_UNION}
    ),
    ghg_filtered AS (
      -- Mirrors the WHERE conditions of queryExportData exactly so summary counts
      -- match the export row count for the same filters.
      -- atr.is_deleted IS NOT TRUE excludes rows from re-uploaded (soft-deleted)
      -- submissions — without this the summary overcounts stale GHG rows.
      --
      -- COALESCE(gd.status, atr.status): some tables lack a status column (e.g.
      -- GHGEnergyConsumption_FuelPurchased_Transportation, GHGEffluentDischarge,
      -- GHGSludgeDisposal, and all ESG tables) and contribute NULL via GHG_UNION.
      -- For those rows we fall back to the ATR status so the summary reflects the
      -- actual approval state — matching what the export Status column already shows.
      -- Tables with their own status column are unaffected (COALESCE returns the
      -- non-NULL row status). There is no cross-sibling contamination risk: each
      -- NULL-status table shares the same activity ATR as its parent/siblings within
      -- the same activity code; no NULL-status table bridges two different activity ATRs.
      SELECT
        gd.organization_address_id AS location_id,
        act.code                   AS activity_code,
        COALESCE(gd.status, atr.status) AS status
      FROM ghg_rows gd
      JOIN "TaskRequest"         tr  ON tr.id  = gd.task_request_id
      JOIN "ActivityTaskRequest" atr ON atr.id = gd.activity_task_request_id
      JOIN "Activity"            act ON act.code = gd.activity_code
      JOIN "OrganizationAddress" oa  ON oa.id  = gd.organization_address_id
      WHERE
        oa.organization_id = '${organizationId}'
        AND oa.is_deleted  IS NOT TRUE
        AND atr.is_deleted IS NOT TRUE
        AND act.is_master  IS NOT TRUE
        AND gd.organization_address_id IN (${locationList})
        AND ${yearMonthClause}
    ),
    summary_counts AS (
      SELECT
        COUNT(*)::int                                                                              AS summary_total,
        COUNT(CASE WHEN status IS NULL OR status = 'pending' OR status = 'saved' THEN 1 END)::int AS summary_pending,
        COUNT(CASE WHEN status = 'approved'                                       THEN 1 END)::int AS summary_approved,
        COUNT(CASE WHEN status = 'rejected'                                       THEN 1 END)::int AS summary_rejected
      FROM ghg_filtered
    ),
    grouped AS (
      SELECT
        ${baseSelectCols},
        COUNT(gf.activity_code)::int AS total_records,
        COUNT(CASE WHEN gf.activity_code IS NOT NULL AND (gf.status IS NULL OR gf.status = 'pending' OR gf.status = 'saved') THEN 1 END)::int AS pending,
        COUNT(CASE WHEN gf.status = 'approved' THEN 1 END)::int AS approved,
        COUNT(CASE WHEN gf.status = 'rejected' THEN 1 END)::int AS rejected
      FROM base b
      LEFT JOIN ghg_filtered gf ON ${leftJoinOn}
      GROUP BY ${groupBy}
      ${statusFilter === "pending" ? "HAVING COUNT(CASE WHEN gf.activity_code IS NOT NULL AND (gf.status IS NULL OR gf.status = 'pending' OR gf.status = 'saved') THEN 1 END) > 0" : statusFilter === "approved" ? "HAVING COUNT(CASE WHEN gf.status = 'approved' THEN 1 END) > 0" : ""}
    ),
    ${((): string => {
      // Conditionally inject a search_filtered CTE on the location_wise tab.
      // Placed after grouped so it can reference location_name / activity_name.
      // summary_counts is intentionally NOT filtered — overall totals at the top of
      // the page reflect the full selected dataset regardless of search text.
      const hasSearch =
        tab === "location_wise" && search && search.trim().length > 0;
      if (!hasSearch) return "";
      const pattern = sanitizeSearchPattern(search!);
      return `search_filtered AS (
      SELECT * FROM grouped
      WHERE
        location_name ILIKE '%${pattern}%' ESCAPE '\\'
        OR activity_name  ILIKE '%${pattern}%' ESCAPE '\\'
    ),`;
    })()}
    total_row_count AS (
      SELECT COUNT(*)::int AS cnt FROM ${
        tab === "location_wise" && search && search.trim().length > 0
          ? "search_filtered"
          : "grouped"
      }
    )
    SELECT
      g.*,
      tc.cnt             AS total_count,
      s.summary_total,
      s.summary_pending,
      s.summary_approved,
      s.summary_rejected
    FROM summary_counts s
    CROSS JOIN total_row_count tc
    LEFT JOIN (
      SELECT * FROM ${
        tab === "location_wise" && search && search.trim().length > 0
          ? "search_filtered"
          : "grouped"
      }
      ORDER BY ${innerOrderBy}
      LIMIT ${pageSize} OFFSET ${offset}
    ) g ON TRUE
    ORDER BY ${orderBy}
  `;

  const db = await GetOPSDBContext();
  return db.execute(sql.raw(query));
}

// ─── Locations list ────────────────────────────────────────────────────────────

export async function queryLocations(
  organizationId: string,
  addressIds: string[]
) {
  if (addressIds.length === 0) return [];

  const idList = toSqlUuidList(addressIds);

  const query = `
    SELECT
      oa.id,
      addr.name
    FROM "OrganizationAddress" oa
    JOIN "Addresses" addr ON addr.id = oa.address_id
    WHERE
      oa.organization_id = '${organizationId}'
      AND oa.id IN (${idList})
      AND oa.is_deleted IS NOT TRUE
    ORDER BY addr.name
  `;

  const db = await GetOPSDBContext();
  return db.execute(sql.raw(query));
}

// ─── Latest data year ──────────────────────────────────────────────────────────

/**
 * Returns every distinct FY start year (or calendar year) that has at least one
 * ActivityTaskRequest row for this org + accessible locations.
 *
 * For a financial year starting in April (startMonth=4) the rows whose tr.month
 * falls in Jan/Feb/Mar belong to the *prior* FY start year, so we apply the same
 * CASE expression used in queryLatestDataYear to normalise them:
 *   January 2026 → FY start year 2025  (because FY2025 = Apr 2025–Mar 2026)
 *
 * Returns a sorted descending array of integer FY start years, e.g. [2025, 2023, 2022].
 * Years with NO data are simply absent — the caller must not interpolate gaps.
 */
export async function queryDistinctDataYears(
  organizationId: string,
  addressIds: string[],
  startMonth: number
): Promise<number[]> {
  if (addressIds.length === 0) return [];

  const idList = toSqlUuidList(addressIds);

  // Months that fall *before* the FY start belong to the previous FY start year.
  // e.g. startMonth=4 → preStartMonths = ['january','february','march']
  const preStartMonths = ALL_MONTHS_LOWER.slice(0, startMonth - 1);

  let fyStartYearExpr: string;
  if (preStartMonths.length === 0) {
    // Calendar year (startMonth=1): no adjustment needed
    fyStartYearExpr = "tr.year";
  } else {
    const preStartList = preStartMonths.map((m) => `'${m}'`).join(",");
    fyStartYearExpr = `CASE WHEN LOWER(tr.month) IN (${preStartList}) THEN tr.year - 1 ELSE tr.year END`;
  }

  const query = `
    SELECT DISTINCT (${fyStartYearExpr})::int AS fy_start_year
    FROM "ActivityTaskRequest" atr
    JOIN "TaskRequest"         tr  ON tr.id  = atr.task_request_id
    JOIN "Activity"            act ON act.id = atr.activity_id
    JOIN "OrganizationAddress" oa  ON oa.id  = atr.organization_address_id
    WHERE
      oa.organization_id = '${organizationId}'
      AND atr.is_deleted IS NOT TRUE
      AND act.is_master  IS NOT TRUE
      AND atr.organization_address_id IN (${idList})
      AND tr.year IS NOT NULL
    ORDER BY fy_start_year DESC
  `;

  const db = await GetOPSDBContext();
  const rows = (await db.execute(sql.raw(query))) as any[];
  return rows.map((r) => Number(r.fy_start_year)).filter((y) => !isNaN(y));
}

export async function queryLatestDataYear(
  organizationId: string,
  addressIds: string[],
  startMonth: number
): Promise<number | null> {
  if (addressIds.length === 0) return null;

  const idList = toSqlUuidList(addressIds);

  const preStartMonths = ALL_MONTHS_LOWER.slice(0, startMonth - 1);

  let fyStartYearExpr: string;
  if (preStartMonths.length === 0) {
    fyStartYearExpr = "tr.year";
  } else {
    const preStartList = preStartMonths.map((m) => `'${m}'`).join(",");
    fyStartYearExpr = `CASE WHEN LOWER(tr.month) IN (${preStartList}) THEN tr.year - 1 ELSE tr.year END`;
  }

  const query = `
    SELECT MAX(${fyStartYearExpr})::int AS latest_fy_start_year
    FROM "ActivityTaskRequest" atr
    JOIN "TaskRequest"         tr  ON tr.id  = atr.task_request_id
    JOIN "Activity"            act ON act.id = atr.activity_id
    JOIN "OrganizationAddress" oa  ON oa.id  = atr.organization_address_id
    WHERE
      oa.organization_id = '${organizationId}'
      AND atr.is_deleted IS NOT TRUE
      AND act.is_master  IS NOT TRUE
      AND atr.organization_address_id IN (${idList})
      AND tr.year IS NOT NULL
  `;

  const db = await GetOPSDBContext();
  const rows = (await db.execute(sql.raw(query))) as any[];
  const val = rows?.[0]?.latest_fy_start_year;
  return val != null ? Number(val) : null;
}

// ─── Months with data ─────────────────────────────────────────────────────────

/**
 * Returns the distinct lowercase month names that have at least one record
 * for the given org / locations / year filter.
 * Used to style month tiles in the filter bar (data-available vs no-data).
 */
export async function queryMonthsWithData(
  organizationId: string,
  addressIds: string[],
  yearMonthFilter: YearMonthFilterParams
): Promise<string[]> {
  if (addressIds.length === 0) return [];

  const locationList = toSqlUuidList(addressIds);
  const yearMonthClause = buildYearMonthClause({
    ...yearMonthFilter,
    months: [],
  });

  const query = `
    SELECT DISTINCT LOWER(tr.month) AS month
    FROM "ActivityTaskRequest" atr
    JOIN "TaskRequest"         tr  ON tr.id  = atr.task_request_id
    JOIN "Activity"            act ON act.id = atr.activity_id
    JOIN "OrganizationAddress" oa  ON oa.id  = atr.organization_address_id
    WHERE
      oa.organization_id = '${organizationId}'
      AND oa.is_deleted  IS NOT TRUE
      AND atr.is_deleted IS NOT TRUE
      AND act.is_master  IS NOT TRUE
      AND atr.organization_address_id IN (${locationList})
      AND ${yearMonthClause}
  `;

  const db = await GetOPSDBContext();
  const rows = (await db.execute(sql.raw(query))) as any[];
  return rows.map((r: any) => String(r.month));
}

// ─── Latest data month ────────────────────────────────────────────────────────

export async function queryLatestDataMonth(
  organizationId: string,
  addressIds: string[],
  yearMonthFilter: YearMonthFilterParams
): Promise<string | null> {
  if (addressIds.length === 0) return null;

  const locationList = toSqlUuidList(addressIds);
  const yearMonthClause = buildYearMonthClause(yearMonthFilter);

  const query = `
    SELECT
      LOWER(tr.month) AS month,
      tr.year,
      CASE LOWER(tr.month)
        WHEN 'january'   THEN 1  WHEN 'february'  THEN 2  WHEN 'march'     THEN 3
        WHEN 'april'     THEN 4  WHEN 'may'        THEN 5  WHEN 'june'      THEN 6
        WHEN 'july'      THEN 7  WHEN 'august'     THEN 8  WHEN 'september' THEN 9
        WHEN 'october'   THEN 10 WHEN 'november'   THEN 11 WHEN 'december'  THEN 12
      END AS month_num
    FROM "ActivityTaskRequest" atr
    JOIN "TaskRequest"         tr  ON tr.id  = atr.task_request_id
    JOIN "Activity"            act ON act.id = atr.activity_id
    JOIN "OrganizationAddress" oa  ON oa.id  = atr.organization_address_id
    WHERE
      oa.organization_id = '${organizationId}'
      AND oa.is_deleted  IS NOT TRUE
      AND atr.is_deleted IS NOT TRUE
      AND act.is_master  IS NOT TRUE
      AND atr.organization_address_id IN (${locationList})
      AND ${yearMonthClause}
    GROUP BY tr.year, tr.month, month_num
    ORDER BY tr.year DESC, month_num DESC
    LIMIT 1
  `;

  const db = await GetOPSDBContext();
  const rows = (await db.execute(sql.raw(query))) as any[];
  return rows?.[0]?.month ?? null;
}

// ─── Approve activity ──────────────────────────────────────────────────────────

export interface ApproveQueryParams {
  organizationId: string;
  effectiveLocationIds: string[];
  activityCode: string;
  yearMonthFilter: YearMonthFilterParams;
  approvingUserId: string;
}

/**
 * Bulk-updates ActivityTaskRequest.status → 'approved' for all pending records
 * that match the filter, then propagates 'approved' to every linked GHG data row.
 *
 * RULE-002, RULE-003, RULE-007 — see business-rules.ts
 *
 * ATR LOOKUP STRATEGY — why we go through the data tables:
 *   ActivityTaskRequest.activity_id stores the PARENT activity code
 *   (e.g. 'transport'), not the leaf code ('transport_business_travel'), because
 *   getTaskRequestActvityTaskRequestId() is called with parent_code by all upload
 *   routes.  Filtering by act.code = leafCode would always return 0 rows.
 *
 *   Instead we look up ATR IDs via the GHG/ESG data tables (same path as the
 *   summary query):
 *     data_table.activity_task_request_id → ActivityTaskRequest.id
 *   This is identical to how the summary counts pending records, so whatever the
 *   summary shows as "pending" is exactly what approve will update.
 */
export async function approveActivityTaskRequests(
  params: ApproveQueryParams
): Promise<{ approvedCount: number; approvedLocationIds: string[] }> {
  const {
    organizationId,
    effectiveLocationIds,
    activityCode,
    yearMonthFilter,
    approvingUserId,
  } = params;

  if (!/^[a-zA-Z0-9_]+$/.test(activityCode)) {
    throw new Error(`Invalid activityCode: ${activityCode}`);
  }
  if (!UUID_REGEX.test(approvingUserId)) {
    throw new Error("Invalid approvingUserId");
  }

  // Resolve which data tables hold records for this activity.
  // If the activity is not in the map (unknown code), there is nothing to approve.
  const dataTables = ALL_DATA_TABLES_BY_ACTIVITY[activityCode] ?? [];
  if (dataTables.length === 0)
    return { approvedCount: 0, approvedLocationIds: [] };

  const locationList = toSqlUuidList(effectiveLocationIds);
  const yearMonthClause = buildYearMonthClause(yearMonthFilter);

  // Step 1: Approve ATR rows, collect their IDs.
  //
  // The sub-SELECT finds ATR IDs by going through the data tables
  // (same path the summary query uses) so the approve scope is EXACTLY
  // what the table shows as pending — no more, no less.
  const dataUnion = buildDataTableUnion(dataTables);

  // RULE-007 / sibling-activity safety:
  // Filter on the GHG row's own status (src.ghg_status), NOT on atr2.status.
  //
  // ATRs are created at the parent-activity level (e.g. 'transport'), so a
  // single ATR is shared by all sibling child-activities (upstream, downstream,
  // employee_travel, business_travel).  If we filtered on atr2.status, approving
  // transport_upstream would set the shared ATR to 'approved', and the next
  // approve call for transport_downstream would find zero rows because
  // (atr2.status = 'approved') is excluded by the old filter.
  //
  // Using src.ghg_status instead means we find ATR IDs based on which individual
  // GHG rows for THIS specific activity are still pending — regardless of what
  // the shared ATR's status already is.
  const atrQuery = `
    UPDATE "ActivityTaskRequest" atr
    SET
      status     = 'approved',
      updated_at = now(),
      updated_by = '${approvingUserId}'
    WHERE atr.id IN (
      SELECT DISTINCT src.activity_task_request_id
      FROM (
        ${dataUnion}
      ) src
      JOIN "TaskRequest"         tr   ON tr.id   = src.task_request_id
      JOIN "ActivityTaskRequest" atr2 ON atr2.id = src.activity_task_request_id
      JOIN "OrganizationAddress" oa   ON oa.id   = src.organization_address_id
      WHERE
        oa.organization_id               = '${organizationId}'
        AND oa.is_deleted                IS NOT TRUE
        AND atr2.is_deleted              IS NOT TRUE
        AND src.organization_address_id  IN (${locationList})
        AND (src.ghg_status IS NULL OR src.ghg_status = 'pending' OR src.ghg_status = 'saved')
        AND ${yearMonthClause}
    )
    RETURNING atr.id, atr.organization_address_id
  `;

  const db = await GetOPSDBContext();
  const atrRows = (await db.execute(sql.raw(atrQuery))) as any[];
  const approvedAtrIds = atrRows.map((r) => String(r.id));
  const approvedLocationIds = [
    ...new Set(atrRows.map((r) => String(r.organization_address_id))),
  ];

  console.log(`Approved ATR IDs for activity ${activityCode}:`, approvedAtrIds);

  if (approvedAtrIds.length === 0)
    return { approvedCount: 0, approvedLocationIds: [] };

  // Step 2: Propagate 'approved' to all linked GHG rows for this activity.
  // Only GHG tables are updated here — ESG tables do not have a status column.
  //
  // The status guard (status IS NULL OR status IN ('pending','saved')) ensures
  // idempotency: if a GHG row was already 'approved' (e.g. from a prior call)
  // it is not touched again.  This also means that when the shared ATR was
  // already approved for a sibling activity, only the rows for THIS specific
  // activity (scoped by the table list) are updated — sibling rows in other
  // tables are never touched by this step.
  const idList = approvedAtrIds.map((id) => `'${id}'`).join(",");
  const ghgTables = GHG_TABLES_BY_ACTIVITY[activityCode] ?? [];
  if (ghgTables.length > 0) {
    for (const table of ghgTables) {
      const ghgRows = (await db.execute(
        sql.raw(`
          UPDATE "${table}"
          SET
            status     = 'approved',
            updated_at = now(),
            updated_by = '${approvingUserId}'
          WHERE activity_task_request_id IN (${idList})
            AND (status IS NULL OR status = 'pending' OR status = 'saved')
          RETURNING id
        `)
      )) as any[];
    }
  }

  // Step 3: Refresh updated_at / updated_by on data tables that don't have a
  // status column (ESG tables and GHG sub-tables like
  // GHGEnergyConsumption_FuelPurchased_Transportation, GHGEffluentDischarge,
  // GHGSludgeDisposal). These rows have activity_task_request_id but no status
  // to flip, so they were previously skipped — leaving their updated_at stale
  // after approve. We touch them here so the audit timestamp reflects the
  // approval action across every data row linked to the approved ATRs.
  const allDataTables = ALL_DATA_TABLES_BY_ACTIVITY[activityCode] ?? [];
  const noStatusTables = allDataTables.filter(
    (t) => !GHG_TABLES_WITH_STATUS.has(t)
  );
  for (const table of noStatusTables) {
    await db.execute(
      sql.raw(`
        UPDATE "${table}"
        SET
          updated_at = now(),
          updated_by = '${approvingUserId}'
        WHERE activity_task_request_id IN (${idList})
      `)
    );
  }

  // Step 4: Refresh updated_at / updated_by on CHILD tables whose ATR is reached
  // through a parent GHG table (e.g. GHGEnergy_CaptivePower_Renewable and
  // GHGEnergy_CaptivePower_NonRenewable, which carry no activity_task_request_id
  // of their own and link to the parent via GHGEnergyConsumption_CaptivePower_id).
  // These child rows are what the user sees on the data-upload-logs page, so
  // their audit timestamp must reflect the approval action.
  for (const [parentTable, children] of Object.entries(
    CHILD_TABLES_BY_PARENT
  )) {
    // Only process children of parents that are part of THIS activity, so we
    // don't accidentally touch unrelated children when other activities share
    // child-table maps in the future.
    if (!(GHG_TABLES_BY_ACTIVITY[activityCode] ?? []).includes(parentTable))
      continue;

    for (const child of children) {
      await db.execute(
        sql.raw(`
          UPDATE "${child.table}" AS c
          SET
            updated_at = now(),
            updated_by = '${approvingUserId}'
          FROM "${parentTable}" AS p
          WHERE c."${child.parentFkColumn}" = p.id
            AND p.activity_task_request_id IN (${idList})
        `)
      );
    }
  }

  return { approvedCount: approvedAtrIds.length, approvedLocationIds };
}

// ─── Export query ─────────────────────────────────────────────────────────────
//
// PURPOSE: Fetches raw data rows for a single Excel sheet within an export.
//   Called once per sheet defined in export-config.ts for the given activity.
//
// WHY IT EXISTS SEPARATELY FROM queryTaskRequestSummary:
//   Export needs ALL data columns for one specific activity (e.g. for Waste:
//   Types_of_Waste_Generated, Quantity_of_Waste, Disposal_Mechanism, ...).
//   Each activity stores its data in a different GHG table (or set of tables),
//   with a completely different column schema — there is no single query that
//   can SELECT all columns for all activities at once.
//
//   The summary query deliberately selects NO data columns — it only reads
//   status + activity_code across the UNION of all tables for counting.
//   Merging the two would mean either losing data columns (summary wins) or
//   running one heavy per-activity query per row just to count (export wins),
//   neither of which is acceptable.
//
// SHARED LOGIC: Same buildYearMonthClause() and toSqlUuidList() helpers as the
//   summary query. The WHERE conditions are identical — the same rows that are
//   counted in the table are the rows that appear in the export.

export interface ExportQueryParams extends BaseQueryParams {
  includeAdminColumns: boolean;
  /**
   * Pre-computed ATR IDs from queryMatchingAtrIds. When provided, only rows
   * whose ghg.activity_task_request_id is in this set are exported.
   * undefined = no status filter (export all records).
   * empty array = status filter active but no records matched (export nothing).
   */
  matchingAtrIds?: string[];
  /**
   * The original status filter that produced matchingAtrIds. When set,
   * queryExportData applies a row-level COALESCE(ghg.status, atr.status)
   * condition so that rows belonging to a shared ATR whose individual status
   * does not match the filter are excluded — preventing the export row count
   * from exceeding what the summary badge shows.
   */
  statusFilter?: "pending" | "approved";
}

/**
 * Returns the activity_task_request_id values whose effective status matches
 * the given filter.
 *
 * Uses buildActivityGhgUnionFromConfig to replicate the EXACT child-join
 * structure that GHG_UNION uses for each activity — e.g. for energy_captive_power
 * it queries child tables (Renewable, NonRenewable, Renewable_Fuel) JOINed to the
 * parent, rather than querying the parent table directly. This guarantees that the
 * set of ATR IDs returned here is IDENTICAL to what ghg_filtered counts in the
 * summary query, eliminating the summary-vs-export count discrepancy.
 */
export async function queryMatchingAtrIds(
  organizationId: string,
  effectiveLocationIds: string[],
  activityConfig: ActivityExportConfig,
  yearMonthFilter: YearMonthFilterParams,
  statusFilter: "pending" | "approved"
): Promise<string[]> {
  if (effectiveLocationIds.length === 0) return [];

  const dataUnion = buildActivityGhgUnionFromConfig(activityConfig);
  if (!dataUnion) return [];

  const locationList = toSqlUuidList(effectiveLocationIds);
  const yearMonthClause = buildYearMonthClause(yearMonthFilter);

  const statusCondition =
    statusFilter === "pending"
      ? "(COALESCE(src.ghg_status, atr.status) IS NULL OR COALESCE(src.ghg_status, atr.status) = 'pending' OR COALESCE(src.ghg_status, atr.status) = 'saved')"
      : "COALESCE(src.ghg_status, atr.status) = 'approved'";

  const query = `
    SELECT DISTINCT src.activity_task_request_id::text AS atr_id
    FROM (
      ${dataUnion}
    ) src
    JOIN "TaskRequest"         tr  ON tr.id  = src.task_request_id
    JOIN "ActivityTaskRequest" atr ON atr.id = src.activity_task_request_id
    JOIN "OrganizationAddress" oa  ON oa.id  = src.organization_address_id
    WHERE
      oa.organization_id              = '${organizationId}'
      AND oa.is_deleted               IS NOT TRUE
      AND atr.is_deleted              IS NOT TRUE
      AND src.organization_address_id IN (${locationList})
      AND ${yearMonthClause}
      AND ${statusCondition}
  `;

  const db = await GetOPSDBContext();
  const rows = (await db.execute(sql.raw(query))) as any[];
  return rows.map((r: any) => String(r.atr_id));
}

/** Fetches all data rows for a single export sheet (one GHG table per call). */
export async function queryExportData(
  params: ExportQueryParams,
  sheet: import("./export-config").ExportSheetConfig
) {
  const {
    organizationId,
    effectiveLocationIds,
    yearMonthFilter,
    includeAdminColumns,
    matchingAtrIds,
  } = params;

  const locationList = toSqlUuidList(effectiveLocationIds);
  const yearMonthClause = buildYearMonthClause(yearMonthFilter);
  const monthOrderExpr = buildMonthOrderExpr(yearMonthFilter);

  const isDirect = sheet.joinType === "direct";

  // ATR ID filter — narrows the result to ATRs identified by queryMatchingAtrIds.
  const atrFilterClause = (() => {
    if (!matchingAtrIds) return ""; // no status filter active
    if (matchingAtrIds.length === 0) return "AND FALSE"; // filter active, nothing matched
    return `AND ghg.activity_task_request_id IN (${toSqlUuidList(matchingAtrIds)})`;
  })();

  // Row-level status filter — mirrors the COALESCE(ghg_status, atr.status) logic
  // from queryMatchingAtrIds and ghg_filtered in the summary query.
  //
  // WHY THIS IS NEEDED:
  //   queryMatchingAtrIds returns DISTINCT ATR IDs that have at least one row
  //   matching the status filter. When an ATR has multiple data rows (e.g. grid
  //   power with several distribution company entries per submission), some of
  //   those rows may have a different GHG-row-level status. The ATR ID filter
  //   alone would include those mismatched rows, inflating the export count
  //   beyond what the summary badge shows.
  //   Applying the same COALESCE condition here ensures only rows whose own
  //   effective status matches the filter are exported.
  const ghgTableForStatus = isDirect ? sheet.ghgTable : sheet.parentTable!;
  const tableHasStatusCol = GHG_TABLES_WITH_STATUS.has(ghgTableForStatus);
  const effectiveStatusExpr = tableHasStatusCol
    ? `COALESCE(ghg.status, atr.status)`
    : `atr.status`;

  const ghgRowStatusFilterClause = (() => {
    if (!params.statusFilter) return "";
    if (params.statusFilter === "pending") {
      return `AND (${effectiveStatusExpr} IS NULL OR ${effectiveStatusExpr} IN ('pending', 'saved'))`;
    }
    if (params.statusFilter === "approved") {
      return `AND ${effectiveStatusExpr} = 'approved'`;
    }
    return "";
  })();

  const fromClause = isDirect
    ? `"${sheet.ghgTable}" ghg`
    : `"${sheet.ghgTable}" child
    JOIN "${sheet.parentTable}" ghg ON ghg.id = child."${sheet.parentJoinColumn}"`;

  const dataColumnsAdjusted = isDirect
    ? sheet.columns.map((col) => `ghg."${col.dbColumn}"`).join(",\n      ")
    : sheet.columns.map((col) => `child."${col.dbColumn}"`).join(",\n      ");

  const selectParts: string[] = [`tr.year AS "Year"`, `tr.month AS "Month"`];

  if (includeAdminColumns) {
    selectParts.unshift(`addr.name AS "Location"`);
  }

  selectParts.push(dataColumnsAdjusted);

  if (includeAdminColumns) {
    // Use COALESCE(ghg.status, atr.status) — the same effective status logic
    // used by the summary query and queryMatchingAtrIds, so the Status column
    // in the Excel matches what the summary table displays.
    const effectiveStatusForDisplay = tableHasStatusCol
      ? `COALESCE(ghg.status, atr.status)`
      : `atr.status`;
    selectParts.push(
      `CASE WHEN ${effectiveStatusForDisplay} IS NULL OR ${effectiveStatusForDisplay} = 'pending' OR ${effectiveStatusForDisplay} = 'saved' THEN 'Pending For Approval' WHEN ${effectiveStatusForDisplay} = 'approved' THEN 'Approved' WHEN ${effectiveStatusForDisplay} = 'rejected' THEN 'Rejected' ELSE ${effectiveStatusForDisplay} END AS "Status"`
    );
  }

  const rowFilterClause = sheet.rowFilter ? `AND ${sheet.rowFilter}` : "";

  const query = `
    SELECT
      ${selectParts.join(",\n      ")}
    FROM ${fromClause}
    JOIN "TaskRequest"         tr   ON tr.id   = ghg.task_request_id
    JOIN "ActivityTaskRequest" atr  ON atr.id  = ghg.activity_task_request_id
    JOIN "OrganizationAddress" oa   ON oa.id   = ghg.organization_address_id
    JOIN "Addresses"           addr ON addr.id = oa.address_id
    WHERE
      oa.organization_id = '${organizationId}'
      AND oa.is_deleted  IS NOT TRUE
      AND atr.is_deleted IS NOT TRUE
      AND ghg.organization_address_id IN (${locationList})
      AND ${yearMonthClause}
      ${atrFilterClause}
      ${ghgRowStatusFilterClause}
      ${rowFilterClause}
    ORDER BY tr.year ASC, ${monthOrderExpr}
  `;

  const db = await GetOPSDBContext();
  return db.execute(sql.raw(query));
}
