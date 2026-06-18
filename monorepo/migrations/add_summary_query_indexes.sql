-- =============================================================================
-- Migration: add_summary_query_indexes.sql
-- Purpose  : Add missing indexes to fix the monthly-activity-summary query
--            performance. Without these, every summary API call does full
--            sequential scans on 30+ GHG/ESG tables under concurrent load.
-- Safe     : All statements use CREATE INDEX IF NOT EXISTS — safe to re-run.
-- Order    : Core lookup tables first, then GHG/ESG data tables, then
--            child (FK-only) tables. Create indexes concurrently if running
--            on a live DB to avoid locking: replace CREATE INDEX with
--            CREATE INDEX CONCURRENTLY (must be run outside a transaction).
-- =============================================================================


-- =============================================================================
-- SECTION 1 — Core lookup tables
-- These are the JOIN targets in every query branch of ghg_filtered.
-- =============================================================================

-- ── ActivityTaskRequest ───────────────────────────────────────────────────────
-- Joined from GHG data tables via activity_task_request_id → atr.id (PK, fine).
-- Filtered on is_deleted; also the anchor table for queryDistinctDataYears and
-- queryLatestDataYear which start their scan from ATR outward.

CREATE INDEX IF NOT EXISTS idx_atr_org_addr_deleted
    ON "ActivityTaskRequest" (organization_address_id, is_deleted);

CREATE INDEX IF NOT EXISTS idx_atr_task_request_id
    ON "ActivityTaskRequest" (task_request_id);

CREATE INDEX IF NOT EXISTS idx_atr_activity_id
    ON "ActivityTaskRequest" (activity_id);


-- ── TaskRequest ───────────────────────────────────────────────────────────────
-- Filtered on year and LOWER(month). The functional index on LOWER(month) is
-- required because the WHERE clause uses LOWER(tr.month) IN (...), which a
-- plain index on the raw `month` column cannot satisfy.

CREATE INDEX IF NOT EXISTS idx_tr_year_month
    ON "TaskRequest" (year, LOWER(month));


-- ── Activity ──────────────────────────────────────────────────────────────────
-- Joined on act.code = gd.activity_code (literal string in GHG_UNION).
-- parent_code is used in the org_activities CTE LEFT JOIN for child expansion.

CREATE INDEX IF NOT EXISTS idx_act_code
    ON "Activity" (code);

CREATE INDEX IF NOT EXISTS idx_act_parent_code
    ON "Activity" (parent_code);

CREATE INDEX IF NOT EXISTS idx_act_master_deleted
    ON "Activity" (is_master, is_deleted);


-- ── OrganizationAddress ───────────────────────────────────────────────────────
-- Filtered on organization_id and is_deleted in the ghg_filtered CTE and the
-- base CTE for the location_wise tab.

CREATE INDEX IF NOT EXISTS idx_oa_org_id_deleted
    ON "OrganizationAddress" (organization_id, is_deleted);


-- ── OrganizationActivityMapping ───────────────────────────────────────────────
-- Scanned in the org_activities CTE (org-admin path) to list all assigned
-- activities for an organisation.

CREATE INDEX IF NOT EXISTS idx_oam_org_id_deleted
    ON "OrganizationActivityMapping" (organization_id, is_deleted);

CREATE INDEX IF NOT EXISTS idx_oam_activity_id
    ON "OrganizationActivityMapping" (activity_id);


-- =============================================================================
-- SECTION 2 — Direct GHG data tables
-- Each table that appears directly (without a parent JOIN) in GHG_UNION needs
-- three indexes: organization_address_id (row filter), activity_task_request_id
-- (approve + ATR join), task_request_id (TaskRequest join / year-month filter).
-- Existing task_request_id indexes are noted; those statements are skipped.
-- =============================================================================

-- ── GHGWaste ──────────────────────────────────────────────────────────────────
-- idx_ghg_waste_tr_id already exists (task_request_id).
CREATE INDEX IF NOT EXISTS idx_ghg_waste_atr_id
    ON "GHGWaste" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_waste_oa_id
    ON "GHGWaste" (organization_address_id);

-- ── GHGProductionDetails ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_prod_tr_id
    ON "GHGProductionDetails" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_prod_atr_id
    ON "GHGProductionDetails" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_prod_oa_id
    ON "GHGProductionDetails" (organization_address_id);

-- ── GHGEnergyConsumption_GridPower ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_egp_tr_id
    ON "GHGEnergyConsumption_GridPower" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_egp_atr_id
    ON "GHGEnergyConsumption_GridPower" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_egp_oa_id
    ON "GHGEnergyConsumption_GridPower" (organization_address_id);

-- ── GHGEnergyConsumption_FuelPurchased (parent — joined by child tables) ──────
-- The parent is the JOIN target for the three child sub-tables. Its id is PK
-- (already indexed for the ON clause); the remaining columns filter the rows
-- returned from the parent after the join.
CREATE INDEX IF NOT EXISTS idx_ghg_efp_tr_id
    ON "GHGEnergyConsumption_FuelPurchased" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_efp_atr_id
    ON "GHGEnergyConsumption_FuelPurchased" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_efp_oa_id
    ON "GHGEnergyConsumption_FuelPurchased" (organization_address_id);

-- ── GHGEnergyConsumption_FuelPurchased_Transportation (direct, no parent) ─────
CREATE INDEX IF NOT EXISTS idx_ghg_efptr_tr_id
    ON "GHGEnergyConsumption_FuelPurchased_Transportation" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_efptr_atr_id
    ON "GHGEnergyConsumption_FuelPurchased_Transportation" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_efptr_oa_id
    ON "GHGEnergyConsumption_FuelPurchased_Transportation" (organization_address_id);

-- ── GHGEnergy_CaptivePower (parent — joined by child tables) ──────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_ecp_tr_id
    ON "GHGEnergy_CaptivePower" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_ecp_atr_id
    ON "GHGEnergy_CaptivePower" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_ecp_oa_id
    ON "GHGEnergy_CaptivePower" (organization_address_id);

-- ── GHGTransport_Upstream ─────────────────────────────────────────────────────
-- idx_ghg_tr_up_tr_id already exists (task_request_id).
CREATE INDEX IF NOT EXISTS idx_ghg_tup_atr_id
    ON "GHGTransport_Upstream" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_tup_oa_id
    ON "GHGTransport_Upstream" (organization_address_id);

-- ── GHGTransport_Downstream ───────────────────────────────────────────────────
-- idx_ghg_tr_down_tr_id already exists (task_request_id).
CREATE INDEX IF NOT EXISTS idx_ghg_tds_atr_id
    ON "GHGTransport_Downstream" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_tds_oa_id
    ON "GHGTransport_Downstream" (organization_address_id);

-- ── GHGTransport_EmployeeTravel ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_tet_tr_id
    ON "GHGTransport_EmployeeTravel" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_tet_atr_id
    ON "GHGTransport_EmployeeTravel" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_tet_oa_id
    ON "GHGTransport_EmployeeTravel" (organization_address_id);

-- ── GHGTransport_BusinessTravel ───────────────────────────────────────────────
-- idx_ghg_tr_bus_tr_id already exists (task_request_id).
CREATE INDEX IF NOT EXISTS idx_ghg_tbt_atr_id
    ON "GHGTransport_BusinessTravel" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_tbt_oa_id
    ON "GHGTransport_BusinessTravel" (organization_address_id);

-- ── GHGGeneralDetails ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_gen_tr_id
    ON "GHGGeneralDetails" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_gen_atr_id
    ON "GHGGeneralDetails" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_gen_oa_id
    ON "GHGGeneralDetails" (organization_address_id);

-- ── GHGBuyer_Share ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_bs_tr_id
    ON "GHGBuyer_Share" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_bs_atr_id
    ON "GHGBuyer_Share" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_bs_oa_id
    ON "GHGBuyer_Share" (organization_address_id);

-- ── GHGMaterialProcurement ────────────────────────────────────────────────────
-- idx_ghg_mat_proc_tr_id already exists (task_request_id).
CREATE INDEX IF NOT EXISTS idx_ghg_mp_atr_id
    ON "GHGMaterialProcurement" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_mp_oa_id
    ON "GHGMaterialProcurement" (organization_address_id);

-- ── GHGCapital_Goods ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_cg_tr_id
    ON "GHGCapital_Goods" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_cg_atr_id
    ON "GHGCapital_Goods" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_cg_oa_id
    ON "GHGCapital_Goods" (organization_address_id);

-- ── GHGProductShareAttribution ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_psa_tr_id
    ON "GHGProductShareAttribution" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_psa_atr_id
    ON "GHGProductShareAttribution" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_psa_oa_id
    ON "GHGProductShareAttribution" (organization_address_id);

-- ── GHGFreshWater ─────────────────────────────────────────────────────────────
-- idx_ghg_fresh_w_tr_id already exists (task_request_id).
CREATE INDEX IF NOT EXISTS idx_ghg_fw_atr_id
    ON "GHGFreshWater" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_fw_oa_id
    ON "GHGFreshWater" (organization_address_id);

-- ── GHGWasteWater ─────────────────────────────────────────────────────────────
-- idx_ghg_waste_w_tr_id already exists (task_request_id).
CREATE INDEX IF NOT EXISTS idx_ghg_ww_atr_id
    ON "GHGWasteWater" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_ww_oa_id
    ON "GHGWasteWater" (organization_address_id);

-- ── GHGHarvestedWater ─────────────────────────────────────────────────────────
-- idx_ghg_harv_w_tr_id already exists (task_request_id).
CREATE INDEX IF NOT EXISTS idx_ghg_hw_atr_id
    ON "GHGHarvestedWater" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_hw_oa_id
    ON "GHGHarvestedWater" (organization_address_id);

-- ── GHGWaterWithdrawal ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_wwd_tr_id
    ON "GHGWaterWithdrawal" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_wwd_atr_id
    ON "GHGWaterWithdrawal" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_wwd_oa_id
    ON "GHGWaterWithdrawal" (organization_address_id);

-- ── GHGWastewaterGeneration ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_wwg_tr_id
    ON "GHGWastewaterGeneration" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_wwg_atr_id
    ON "GHGWastewaterGeneration" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_wwg_oa_id
    ON "GHGWastewaterGeneration" (organization_address_id);

-- ── GHGWasteWaterTreatment ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_wwt_tr_id
    ON "GHGWasteWaterTreatment" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_wwt_atr_id
    ON "GHGWasteWaterTreatment" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_wwt_oa_id
    ON "GHGWasteWaterTreatment" (organization_address_id);

-- ── GHGEffluentDischarge (no status column) ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_ed_tr_id
    ON "GHGEffluentDischarge" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_ed_atr_id
    ON "GHGEffluentDischarge" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_ed_oa_id
    ON "GHGEffluentDischarge" (organization_address_id);

-- ── GHGSludgeDisposal (no status column) ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_sld_tr_id
    ON "GHGSludgeDisposal" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_sld_atr_id
    ON "GHGSludgeDisposal" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_sld_oa_id
    ON "GHGSludgeDisposal" (organization_address_id);

-- ── GHGRefrigerantAndACSystems ────────────────────────────────────────────────
-- idx_ghg_ref_ac_tr_id already exists (task_request_id).
CREATE INDEX IF NOT EXISTS idx_ghg_rac_atr_id
    ON "GHGRefrigerantAndACSystems" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_rac_oa_id
    ON "GHGRefrigerantAndACSystems" (organization_address_id);

-- ── GHGFireExtinguisher ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_fe_tr_id
    ON "GHGFireExtinguisher" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_fe_atr_id
    ON "GHGFireExtinguisher" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_fe_oa_id
    ON "GHGFireExtinguisher" (organization_address_id);

-- ── GHGIndustrialGas ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_ig_tr_id
    ON "GHGIndustrialGas" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_ig_atr_id
    ON "GHGIndustrialGas" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_ghg_ig_oa_id
    ON "GHGIndustrialGas" (organization_address_id);


-- =============================================================================
-- SECTION 3 — ESG data tables (no status column, but same join columns)
-- =============================================================================

-- ── ESGCSR ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_csr_tr_id
    ON "ESGCSR" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_csr_atr_id
    ON "ESGCSR" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_csr_oa_id
    ON "ESGCSR" (organization_address_id);

-- ── ESGEmployeeDiversity ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_ed_tr_id
    ON "ESGEmployeeDiversity" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_ed_atr_id
    ON "ESGEmployeeDiversity" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_ed_oa_id
    ON "ESGEmployeeDiversity" (organization_address_id);

-- ── ESGEmployeeTurnover ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_et_tr_id
    ON "ESGEmployeeTurnover" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_et_atr_id
    ON "ESGEmployeeTurnover" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_et_oa_id
    ON "ESGEmployeeTurnover" (organization_address_id);

-- ── ESGTrainingHours ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_th_tr_id
    ON "ESGTrainingHours" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_th_atr_id
    ON "ESGTrainingHours" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_th_oa_id
    ON "ESGTrainingHours" (organization_address_id);

-- ── ESGHealthAndSafety ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_hs_tr_id
    ON "ESGHealthAndSafety" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_hs_atr_id
    ON "ESGHealthAndSafety" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_hs_oa_id
    ON "ESGHealthAndSafety" (organization_address_id);

-- ── ESGSafetyObservations ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_so_tr_id
    ON "ESGSafetyObservations" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_so_atr_id
    ON "ESGSafetyObservations" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_so_oa_id
    ON "ESGSafetyObservations" (organization_address_id);

-- ── ESGHealthAndSafetyTraining ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_hst_tr_id
    ON "ESGHealthAndSafetyTraining" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_hst_atr_id
    ON "ESGHealthAndSafetyTraining" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_hst_oa_id
    ON "ESGHealthAndSafetyTraining" (organization_address_id);

-- ── ESGAssessedLocations ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_al_tr_id
    ON "ESGAssessedLocations" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_al_atr_id
    ON "ESGAssessedLocations" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_al_oa_id
    ON "ESGAssessedLocations" (organization_address_id);

-- ── ESGBoardComposition ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_bc_tr_id
    ON "ESGBoardComposition" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_bc_atr_id
    ON "ESGBoardComposition" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_bc_oa_id
    ON "ESGBoardComposition" (organization_address_id);

-- ── ESGGovernance ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_gov_tr_id
    ON "ESGGovernance" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_gov_atr_id
    ON "ESGGovernance" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_gov_oa_id
    ON "ESGGovernance" (organization_address_id);

-- ── ESGGrievances ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_esg_gr_tr_id
    ON "ESGGrievances" (task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_gr_atr_id
    ON "ESGGrievances" (activity_task_request_id);
CREATE INDEX IF NOT EXISTS idx_esg_gr_oa_id
    ON "ESGGrievances" (organization_address_id);


-- =============================================================================
-- SECTION 4 — Child tables (FK index only)
-- These tables do NOT have task_request_id or organization_address_id —
-- those columns come from the parent via JOIN. Only the FK column needs
-- an index so the JOIN lookup is O(log n) instead of a full scan.
-- =============================================================================

-- ── GHGEnergyConsumption_FuelPurchased children ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ghg_efpg_fp_id
    ON "GHGEnergyConsumption_FuelPurchased_General" ("GHGEnergyConsumption_FuelPurchased_id");

CREATE INDEX IF NOT EXISTS idx_ghg_efphw_fp_id
    ON "GHGEnergyConsumption_FuelPurchased_HeatingWater" ("GHGEnergyConsumption_FuelPurchased_id");

CREATE INDEX IF NOT EXISTS idx_ghg_efpa_fp_id
    ON "GHGEnergyConsumption_FuelPurchased_Auxiliary" ("GHGEnergyConsumption_FuelPurchased_id");

-- ── GHGEnergy_CaptivePower children ──────────────────────────────────────────
-- Note: FK column is "GHGEnergyConsumption_CaptivePower_id" (not "GHGEnergy_...")
CREATE INDEX IF NOT EXISTS idx_ghg_ecpr_cp_id
    ON "GHGEnergy_CaptivePower_Renewable" ("GHGEnergyConsumption_CaptivePower_id");

CREATE INDEX IF NOT EXISTS idx_ghg_ecpnr_cp_id
    ON "GHGEnergy_CaptivePower_NonRenewable" ("GHGEnergyConsumption_CaptivePower_id");

-- NOTE: This table did not exist on demo at migration time (pending table migration).
-- Run this statement after the table is created.
CREATE INDEX IF NOT EXISTS idx_ghg_ecprf_cp_id
    ON "GHGEnergy_CaptivePower_Renewable_Fuel" ("GHGEnergyConsumption_CaptivePower_id");


-- =============================================================================
-- Summary: 87 indexes total
--   Section 1 (core tables)   :  9 new
--   Section 2 (GHG data)      : 57 new  (9 task_request_id already existed)
--   Section 3 (ESG data)      : 33 new
--   Section 4 (child FK)      :  6 new
-- All idempotent via IF NOT EXISTS.
-- =============================================================================
