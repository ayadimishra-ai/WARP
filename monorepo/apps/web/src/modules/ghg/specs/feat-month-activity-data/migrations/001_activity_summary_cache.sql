-- ============================================================
-- Migration: 001_activity_summary_cache.sql
-- Purpose: Create ActivitySummaryCache precomputed summary table
-- Run: Manually in DBeaver against the target database
-- ============================================================

-- STEP 1: Create the cache table
-- ============================================================

CREATE TABLE IF NOT EXISTS "ActivitySummaryCache" (
  organization_id         uuid        NOT NULL,
  organization_address_id uuid        NOT NULL,
  activity_code           text        NOT NULL,
  year                    integer     NOT NULL,
  month                   text        NOT NULL,  -- lowercase full name: 'january', 'april', etc.
  pending_count           integer     NOT NULL DEFAULT 0,
  approved_count          integer     NOT NULL DEFAULT 0,
  updated_at              timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, organization_address_id, activity_code, year, month)
);

-- Composite index for the most common read pattern: org + multiple locations + year/month range
CREATE INDEX IF NOT EXISTS idx_asc_org_addr_year_month
  ON "ActivitySummaryCache" (organization_id, organization_address_id, year, month);

-- Index for org-level aggregation (activity_type tab)
CREATE INDEX IF NOT EXISTS idx_asc_org_code_year_month
  ON "ActivitySummaryCache" (organization_id, activity_code, year, month);

COMMENT ON TABLE "ActivitySummaryCache" IS
  'Precomputed pending/approved record counts per (org, location, activity, year, month). '
  'Maintained synchronously on upload and approve. Read by queryTaskRequestSummaryFromCache. '
  'If counts drift, re-run backfillActivitySummaryCache() for the affected org.';

-- ============================================================
-- STEP 2: One-time backfill
-- Run AFTER Step 1. Populates cache from all existing data.
-- Safe to re-run (uses ON CONFLICT DO UPDATE).
--
-- IMPORTANT: This all_data CTE mirrors GHG_UNION in queries.ts exactly.
-- Three rules carried from GHG_UNION:
--   1. Direct tables (have own status column): use gd.status
--   2. Child tables via parent join: use p.status (the parent's own status)
--   3. Tables with no status column (Transportation, Effluent, Sludge, all ESG): use NULL::text
--      → COALESCE(NULL, atr.status) in enriched CTE resolves to atr.status
--
-- energy_fuel_purchased and energy_captive_power: counted from CHILD rows only,
-- NOT from the parent table directly — same as GHG_UNION. Including the parent
-- directly would double-count because each parent row maps to N child rows.
--
-- CRITICAL: year/month is resolved via gd.task_request_id (the GHG row's own FK),
-- NOT via atr.task_request_id. Older ATR records may have NULL task_request_id,
-- which would cause INNER JOIN failures and silently drop rows from the backfill.
-- This matches how GHG_UNION in queries.ts resolves year/month.
-- ============================================================

INSERT INTO "ActivitySummaryCache" (
  organization_id, organization_address_id, activity_code,
  year, month, pending_count, approved_count, updated_at
)
WITH all_data AS (
  -- Columns: ac, status, organization_address_id, activity_task_request_id, tr_id
  -- tr_id = the GHG/ESG row's own task_request_id FK (used to resolve year/month)

  -- ── Waste ─────────────────────────────────────────────────────────────────
  SELECT 'waste'                      AS ac, gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGWaste"                          gd
  UNION ALL
  -- ── Production ────────────────────────────────────────────────────────────
  SELECT 'production',                       gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGProductionDetails"               gd
  UNION ALL
  -- ── Energy — Grid Power ────────────────────────────────────────────────────
  SELECT 'energy_grid_power',                gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGEnergyConsumption_GridPower"      gd
  UNION ALL
  -- ── Energy — Fuel Purchased (child rows only — no parent row) ─────────────
  SELECT 'energy_fuel_purchased',            p.status,    p.organization_address_id,  p.activity_task_request_id, p.task_request_id AS tr_id
    FROM "GHGEnergyConsumption_FuelPurchased_General"       c
    JOIN "GHGEnergyConsumption_FuelPurchased" p ON p.id = c."GHGEnergyConsumption_FuelPurchased_id"
  UNION ALL
  SELECT 'energy_fuel_purchased',            p.status,    p.organization_address_id,  p.activity_task_request_id, p.task_request_id AS tr_id
    FROM "GHGEnergyConsumption_FuelPurchased_HeatingWater"  c
    JOIN "GHGEnergyConsumption_FuelPurchased" p ON p.id = c."GHGEnergyConsumption_FuelPurchased_id"
  UNION ALL
  SELECT 'energy_fuel_purchased',            p.status,    p.organization_address_id,  p.activity_task_request_id, p.task_request_id AS tr_id
    FROM "GHGEnergyConsumption_FuelPurchased_Auxiliary"     c
    JOIN "GHGEnergyConsumption_FuelPurchased" p ON p.id = c."GHGEnergyConsumption_FuelPurchased_id"
  UNION ALL
  SELECT 'energy_fuel_purchased',            NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id
    FROM "GHGEnergyConsumption_FuelPurchased_Transportation" gd
  UNION ALL
  -- ── Energy — Captive Power (child rows only — no parent row) ──────────────
  SELECT 'energy_captive_power',             p.status,    p.organization_address_id,  p.activity_task_request_id, p.task_request_id AS tr_id
    FROM "GHGEnergy_CaptivePower_Renewable"    c
    JOIN "GHGEnergy_CaptivePower" p ON p.id = c."GHGEnergyConsumption_CaptivePower_id"
  UNION ALL
  SELECT 'energy_captive_power',             p.status,    p.organization_address_id,  p.activity_task_request_id, p.task_request_id AS tr_id
    FROM "GHGEnergy_CaptivePower_NonRenewable" c
    JOIN "GHGEnergy_CaptivePower" p ON p.id = c."GHGEnergyConsumption_CaptivePower_id"
  UNION ALL
  -- NOTE: GHGEnergy_CaptivePower_Renewable_Fuel may not exist in all environments; skip if needed
  SELECT 'energy_captive_power',             p.status,    p.organization_address_id,  p.activity_task_request_id, p.task_request_id AS tr_id
    FROM "GHGEnergy_CaptivePower_Renewable_Fuel" c
    JOIN "GHGEnergy_CaptivePower" p ON p.id = c."GHGEnergyConsumption_CaptivePower_id"
  UNION ALL
  -- ── Transport ─────────────────────────────────────────────────────────────
  SELECT 'transport_upstream',               gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGTransport_Upstream"               gd
  UNION ALL
  SELECT 'transport_downstream',             gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGTransport_Downstream"             gd
  UNION ALL
  SELECT 'transport_employee_travel',        gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGTransport_EmployeeTravel"         gd
  UNION ALL
  SELECT 'transport_business_travel',        gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGTransport_BusinessTravel"         gd
  UNION ALL
  -- ── General / Buyer / Material / Capital / Product ────────────────────────
  SELECT 'general',                          gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGGeneralDetails"                   gd
  UNION ALL
  SELECT 'buyer_share',                      gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGBuyer_Share"                      gd
  UNION ALL
  SELECT 'material_procurement',             gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGMaterialProcurement"              gd
  UNION ALL
  SELECT 'capital_goods',                    gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGCapital_Goods"                    gd
  UNION ALL
  SELECT 'product_share_allocation',         gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGProductShareAttribution"          gd
  UNION ALL
  -- ── Water ─────────────────────────────────────────────────────────────────
  SELECT 'water_consumption',                gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGFreshWater"                       gd
  UNION ALL
  SELECT 'water_consumption',                gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGWasteWater"                       gd
  UNION ALL
  SELECT 'water_consumption',                gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGHarvestedWater"                   gd
  UNION ALL
  SELECT 'water_withdrawal',                 gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGWaterWithdrawal"                  gd
  UNION ALL
  SELECT 'wastewater_generation',            gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGWastewaterGeneration"             gd
  UNION ALL
  -- ── Waste Water Treatment ─────────────────────────────────────────────────
  SELECT 'waste_water_treatment',            gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGWasteWaterTreatment"              gd
  UNION ALL
  SELECT 'waste_water_treatment',            NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGEffluentDischarge"                gd
  UNION ALL
  SELECT 'waste_water_treatment',            NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGSludgeDisposal"                   gd
  UNION ALL
  -- ── Fugitive ──────────────────────────────────────────────────────────────
  SELECT 'fugitive_details',                 gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGRefrigerantAndACSystems"          gd
  UNION ALL
  SELECT 'fugitive_details',                 gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGFireExtinguisher"                 gd
  UNION ALL
  SELECT 'fugitive_details',                 gd.status,   gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "GHGIndustrialGas"                    gd
  UNION ALL
  -- ── ESG tables (no status column — effective status comes from ATR) ───────
  SELECT 'csr',                              NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGCSR"                              gd
  UNION ALL
  SELECT 'human_resources',                  NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGEmployeeDiversity"                gd
  UNION ALL
  SELECT 'human_resources',                  NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGEmployeeTurnover"                 gd
  UNION ALL
  SELECT 'human_resources',                  NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGTrainingHours"                    gd
  UNION ALL
  SELECT 'health_and_safety',                NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGHealthAndSafety"                  gd
  UNION ALL
  SELECT 'health_and_safety',                NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGSafetyObservations"               gd
  UNION ALL
  SELECT 'health_and_safety',                NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGHealthAndSafetyTraining"          gd
  UNION ALL
  SELECT 'health_and_safety',                NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGAssessedLocations"                gd
  UNION ALL
  SELECT 'governance_and_board_composition', NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGBoardComposition"                 gd
  UNION ALL
  SELECT 'governance_and_board_composition', NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGGovernance"                       gd
  UNION ALL
  SELECT 'grievances_activity',              NULL::text,  gd.organization_address_id, gd.activity_task_request_id, gd.task_request_id AS tr_id FROM "ESGGrievances"                       gd
),
enriched AS (
  SELECT
    oa.organization_id,
    d.organization_address_id,
    d.ac           AS activity_code,
    tr.year,
    LOWER(tr.month) AS month,
    COALESCE(d.status, atr.status) AS effective_status
  FROM all_data d
  JOIN "ActivityTaskRequest" atr ON atr.id = d.activity_task_request_id
  JOIN "TaskRequest"         tr  ON tr.id  = d.tr_id
  JOIN "OrganizationAddress" oa  ON oa.id  = d.organization_address_id
  WHERE atr.is_deleted IS NOT TRUE
    AND oa.is_deleted  IS NOT TRUE
)
SELECT
  organization_id,
  organization_address_id,
  activity_code,
  year,
  month,
  COUNT(*) FILTER (WHERE effective_status IS NULL OR effective_status IN ('pending', 'saved')) AS pending_count,
  COUNT(*) FILTER (WHERE effective_status = 'approved')  AS approved_count,
  now() AS updated_at
FROM enriched
GROUP BY organization_id, organization_address_id, activity_code, year, month
ON CONFLICT (organization_id, organization_address_id, activity_code, year, month)
DO UPDATE SET
  pending_count  = EXCLUDED.pending_count,
  approved_count = EXCLUDED.approved_count,
  updated_at     = now();

-- ============================================================
-- STEP 3: Validation query
-- Run after backfill. Compare cache totals vs live UNION query.
-- Expected: all rows match. Any mismatch = data worth investigating.
-- ============================================================

-- Quick sanity: total counts per org from cache
SELECT
  organization_id,
  SUM(pending_count)  AS total_pending,
  SUM(approved_count) AS total_approved,
  SUM(pending_count + approved_count) AS grand_total
FROM "ActivitySummaryCache"
GROUP BY organization_id
ORDER BY organization_id;
