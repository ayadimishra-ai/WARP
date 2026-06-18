import { UUID } from "crypto";
import { sql } from "drizzle-orm";

export const SQL_QUERY_Kpi_PCF_Material_Procurement = (
  taskRequestIdForSql: string,
  organization_id: string,
  materialFilterSql?: string
) => {
  return sql.raw(`
    select 
  	o.id as organization_id, 
  	oa.id as address_id, 
  	r.id as region_id,
  	tr."year", 
  	tr."month", 
  	LOWER(TRIM(gp."Supplier_Code")) as supplier_code,
  	LOWER(TRIM(gp."Material_Code")) as buyer_material_code,
  	MAX(COALESCE(omm."Material_Weight_Per_Unit", 0)) as material_weight_per_unit,
    MAX(omm."UoM_Material_Weight") as material_weight_per_unit_uom,
  	MAX(gp."kpi_emf_EmissionBy_MaterialProcured") as kpi_emf_material_procurement
  from "TaskRequest" tr
  inner join "GHGMaterialProcurement" gp on gp.task_request_id = tr.id 
  inner join "OrgMaterialMaster" omm on LOWER(TRIM(omm.code)) = LOWER(TRIM(gp."Material_Code")) and omm.organization_id = '${organization_id}'
  inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
  inner join "Organization" o on oa.organization_id = o.id
  inner join "Addresses" a on a.id = oa.address_id
  inner join "Country" c on a.country_id = c.id
  left join "Region" r on r.code = c.region_code
  where tr.id in ${taskRequestIdForSql}
    and o.id = '${organization_id}'
    ${materialFilterSql ? `AND (LOWER(TRIM(gp."Supplier_Code")), LOWER(TRIM(gp."Material_Code"))) IN ${materialFilterSql}` : ""}
  group by 
  	o.id, 
  	oa.id,
    r.id,
  	tr."year", 
  	tr."month",
    LOWER(TRIM(gp."Supplier_Code")),
    LOWER(TRIM(gp."Material_Code"))
    `);
};

export const SQL_QUERY_Kpi_PCF_Upstream = (
  taskRequestIdForSql: string,
  organization_id: string,
  materialFilterSql?: string
) => {
  return sql.raw(`
    select 
  	o.id as organization_id, 
  	oa.id as address_id, 
  	r.id as region_id,
  	tr."year", 
  	tr."month", 
  	LOWER(TRIM(gu."Supplier_code")) as supplier_code,
  	LOWER(TRIM(gu."Material_ID")) as buyer_material_code,
  	COALESCE(gu."Material_Quantity_Procured", 0) as buyer_material_procurement_quantity,
  	gu."Material_Quantity_Procured_uom" as buyer_material_procurement_uom,
  	COALESCE(gu."kpi_em_EmissionBy_Transport", 0) as kpi_em_upstream
  from "TaskRequest" tr
  inner join "GHGTransport_Upstream" gu on gu.task_request_id = tr.id 
  inner join "OrganizationAddress" oa on oa.id = tr.organization_address_id
  inner join "Organization" o on oa.organization_id = o.id
  inner join "Addresses" a on a.id = oa.address_id
  inner join "Country" c on a.country_id = c.id
  left join "Region" r on r.code = c.region_code
  where tr.id in ${taskRequestIdForSql}
    and o.id = '${organization_id}'
    ${materialFilterSql ? `AND (LOWER(TRIM(gu."Supplier_code")), LOWER(TRIM(gu."Material_ID"))) IN ${materialFilterSql}` : ""}
    `);
};

/**
 * Query to get buyer's material procurement quantities with UOM
 * Returns individual rows (no GROUP BY) so UOM conversion can be done in service layer
 * before aggregation. Same pattern as upstream query.
 */
export const SQL_QUERY_Buyer_Material_Procurement_Quantities = (
  taskRequestIdForSql: string,
  organization_id: string,
  materialFilterSql?: string
) => {
  return sql.raw(`
    SELECT 
      oa.organization_id as organization_id,
      LOWER(TRIM(gmp."Supplier_Code")) as supplier_code,
      LOWER(TRIM(gmp."Material_Code")) as material_code,
      tr."year",
      tr."month",
      COALESCE(gmp."Material_Quantity_Procured", 0) as procurement_quantity,
      gmp."Material_Quantity_Procured_uom" as procurement_quantity_uom
    FROM "GHGMaterialProcurement" gmp
    INNER JOIN "TaskRequest" tr ON tr.id = gmp.task_request_id
    INNER JOIN "OrganizationAddress" oa ON oa.id = tr.organization_address_id
    WHERE tr.id IN ${taskRequestIdForSql}
      AND oa.organization_id = '${organization_id}'
      AND tr.is_deleted = false
      ${materialFilterSql ? `AND (LOWER(TRIM(gmp."Supplier_Code")), LOWER(TRIM(gmp."Material_Code"))) IN ${materialFilterSql}` : ""}
    `);
};

export const SQL_QUERY_Kpi_PCF_Supplier_Facility = (
  taskRequestIdForSql: string,
  organization_id: string,
  materialFilterSql?: string
) => {
  return sql.raw(`
    WITH 
    -- ============================================================
    -- STEP 1: Extract buyer's task request year/month periods
    -- Convert month name to numeric (1-12) for KPI table matching
    -- ============================================================
    buyer_periods AS (
      SELECT DISTINCT 
        tr."year", 
        tr."month",
        oa.id as buyer_oa_id,
        CASE LOWER(TRIM(tr."month"))
          WHEN 'january' THEN 1 WHEN 'february' THEN 2 WHEN 'march' THEN 3
          WHEN 'april' THEN 4 WHEN 'may' THEN 5 WHEN 'june' THEN 6
          WHEN 'july' THEN 7 WHEN 'august' THEN 8 WHEN 'september' THEN 9
          WHEN 'october' THEN 10 WHEN 'november' THEN 11 WHEN 'december' THEN 12
          ELSE 0
        END as month_num
      FROM "TaskRequest" tr
      INNER JOIN "OrganizationAddress" oa ON oa.id = tr.organization_address_id
      WHERE tr.id IN ${taskRequestIdForSql}
        AND oa.organization_id = '${organization_id}'
    ),

    -- ============================================================
    -- STEP 2: Get supplier-material mappings for this buyer
    -- SupplierMaterialMapping uses supplier_address_mapping_id
    -- to resolve supplier via SupplierAddressMapping
    -- supplier_organization_address_id = supplier's OrganizationAddress.id
    -- org_material_master_id for material via OrgMaterialMaster
    -- Filter by buyer's time periods falling within From/To range
    -- ============================================================
    valid_mappings AS (
      SELECT DISTINCT
        smm.supplier_address_mapping_id,
        smm.org_material_master_id,
        sam.supplier_organization_address_id as supplier_oa_id,
        supplier_oa.organization_id as supplier_org_id,
        LOWER(TRIM(osm.code)) as supplier_master_code,
        bp."year",
        bp."month",
        bp.month_num,
        bp.buyer_oa_id
      FROM "SupplierMaterialMapping" smm
      INNER JOIN "SupplierAddressMapping" sam ON sam.id = smm.supplier_address_mapping_id
      INNER JOIN "OrgSupplierMaster" osm ON osm.id = sam.org_supplier_master_id
      INNER JOIN "OrganizationAddress" supplier_oa ON supplier_oa.id = sam.supplier_organization_address_id
      INNER JOIN buyer_periods bp ON (
        (bp."year" > smm."From_Year" OR (bp."year" = smm."From_Year" AND bp.month_num >= 
          CASE LOWER(TRIM(smm."From_Month"))
            WHEN 'january' THEN 1 WHEN 'february' THEN 2 WHEN 'march' THEN 3
            WHEN 'april' THEN 4 WHEN 'may' THEN 5 WHEN 'june' THEN 6
            WHEN 'july' THEN 7 WHEN 'august' THEN 8 WHEN 'september' THEN 9
            WHEN 'october' THEN 10 WHEN 'november' THEN 11 WHEN 'december' THEN 12
            ELSE 0
          END))
        AND 
        (bp."year" < smm."To_Year" OR (bp."year" = smm."To_Year" AND bp.month_num <= 
          CASE LOWER(TRIM(smm."To_Month"))
            WHEN 'january' THEN 1 WHEN 'february' THEN 2 WHEN 'march' THEN 3
            WHEN 'april' THEN 4 WHEN 'may' THEN 5 WHEN 'june' THEN 6
            WHEN 'july' THEN 7 WHEN 'august' THEN 8 WHEN 'september' THEN 9
            WHEN 'october' THEN 10 WHEN 'november' THEN 11 WHEN 'december' THEN 12
            ELSE 0
          END))
      )
      WHERE smm.organization_id = '${organization_id}'
        AND smm.is_deleted = false
    ),

    -- ============================================================
    -- STEP 3: Validate suppliers via BuyerSupplierMappings
    -- Only officially mapped buyer-supplier relationships are allowed
    -- bsm.supplierOrgid = OrganizationAddress.organization_id (supplier's org)
    -- ============================================================
    validated_suppliers AS (
      SELECT DISTINCT
        vm.supplier_address_mapping_id,
        vm.supplier_oa_id
      FROM valid_mappings vm
      INNER JOIN "BuyerSupplierMappings" bsm 
        ON bsm."buyerOrgid" = '${organization_id}'
        AND bsm."supplierOrgid" = vm.supplier_org_id
    ),

    -- ============================================================
    -- STEP 4: Get supplier's OrganizationAddress details
    -- KPI tables use OrganizationAddress.id as address_id
    -- supplier_oa_id from SupplierAddressMapping.supplier_organization_address_id
    -- is already the supplier's OrganizationAddress.id
    -- Note: We only need supplier_oa_id here for KPI table lookups
    -- region_id will be resolved from BUYER's address in final SELECT
    -- ============================================================
    supplier_locations AS (
      SELECT DISTINCT
        vs.supplier_address_mapping_id,
        vs.supplier_oa_id,
        LOWER(TRIM(a.code)) as supplier_oa_location_code
      FROM validated_suppliers vs
      INNER JOIN "OrganizationAddress" oa ON oa.id = vs.supplier_oa_id
      INNER JOIN "Addresses" a ON a.id = oa.address_id 
        AND a.is_deleted = false
    ),

    -- ============================================================
    -- STEP 5a-5c: Pre-aggregate each KPI table by address/year/month
    -- This prevents cartesian products when multiple rows exist
    -- in any single KPI table for the same address/year/month
    -- Convert tCO2e to KgCO2e (* 1000)
    -- ============================================================
    agg_power AS (
      SELECT 
        kp.address_id,
        kp."year",
        kp."month",
        SUM(COALESCE(kp."kpi_em_TotalPowerPurchased", 0)) * 1000 as em_grid_power,
        SUM(COALESCE(kp."kpi_em_CaptivePower", 0)) * 1000 as em_captive_power
      FROM "KPIEmissionByPowerConsumption" kp
      INNER JOIN supplier_locations sl ON sl.supplier_oa_id = kp.address_id
      GROUP BY kp.address_id, kp."year", kp."month"
    ),

    agg_fuel AS (
      SELECT 
        kf.address_id,
        kf."year",
        kf."month",
        SUM(COALESCE(kf."kpi_em_TotalEmission_FuelConsumption", 0)) * 1000 as em_fuel_purchased
      FROM "KPIEmissionByFuelConsumption" kf
      INNER JOIN supplier_locations sl ON sl.supplier_oa_id = kf.address_id
      GROUP BY kf.address_id, kf."year", kf."month"
    ),

    agg_waste AS (
      SELECT 
        kw.address_id,
        kw."year",
        kw."month",
        SUM(COALESCE(kw."kpi_em_TotalEmission_WasteGeneration", 0)) * 1000 as em_waste_generation
      FROM "KPIEmissionByWasteGeneration" kw
      INNER JOIN supplier_locations sl ON sl.supplier_oa_id = kw.address_id
      GROUP BY kw.address_id, kw."year", kw."month"
    ),

    -- ============================================================
    -- STEP 5d: Combine supplier locations + material mappings
    -- with pre-aggregated KPI emissions (guaranteed 1 row each)
    -- ============================================================
    supplier_emissions AS (
      SELECT 
        sl.supplier_address_mapping_id,
        sl.supplier_oa_id,
        sl.supplier_oa_location_code,
        vm.org_material_master_id,
        vm.supplier_master_code,
        vm."year",
        vm."month",
        vm.month_num,
        vm.buyer_oa_id,
        COALESCE(ap.em_grid_power, 0) as em_grid_power,
        COALESCE(ap.em_captive_power, 0) as em_captive_power,
        COALESCE(af.em_fuel_purchased, 0) as em_fuel_purchased,
        COALESCE(aw.em_waste_generation, 0) as em_waste_generation
      FROM supplier_locations sl
      INNER JOIN valid_mappings vm 
        ON vm.supplier_address_mapping_id = sl.supplier_address_mapping_id
      LEFT JOIN agg_power ap
        ON ap.address_id = sl.supplier_oa_id
        AND ap."year" = vm."year"
        AND ap."month" = vm.month_num
      LEFT JOIN agg_fuel af
        ON af.address_id = sl.supplier_oa_id
        AND af."year" = vm."year"
        AND af."month" = vm.month_num
      LEFT JOIN agg_waste aw
        ON aw.address_id = sl.supplier_oa_id
        AND aw."year" = vm."year"
        AND aw."month" = vm.month_num
      WHERE (ap.address_id IS NOT NULL OR af.address_id IS NOT NULL OR aw.address_id IS NOT NULL)
    ),

    -- ============================================================
    -- STEP 6: Get allocation percentages from GHGProductShareAttribution
    -- Supplier's data, matched to buyer by Buyer_Name
    -- Scoped to validated supplier addresses only
    -- organization_address_id = supplier's OrganizationAddress.id
    -- Time period matched via TaskRequest year/month
    -- Pre-aggregate to avoid duplicates if multiple rows exist
    -- ============================================================
    allocation_data AS (
      SELECT 
        psa.organization_address_id,
        LOWER(TRIM(psa."Material_Code")) as "Material_Code",
        COALESCE(MAX(psa."SKU_Production_Percentage"), 0) as allocation_percentage,
        tr."year",
        tr."month"
      FROM "GHGProductShareAttribution" psa
      INNER JOIN "TaskRequest" tr ON tr.id = psa.task_request_id
      INNER JOIN supplier_locations sl ON sl.supplier_oa_id = psa.organization_address_id
      CROSS JOIN "Organization" o_buyer
      WHERE o_buyer.id = '${organization_id}'
        AND LOWER(TRIM(psa."Buyer_Name")) = LOWER(TRIM(o_buyer.name))
        AND psa.is_deleted = false
      GROUP BY 
        psa.organization_address_id,
        LOWER(TRIM(psa."Material_Code")),
        tr."year",
        tr."month"
    )

    -- ============================================================
    -- FINAL: Join everything and return supplier facility emissions
    -- organization_id = BUYER's org ID
    -- address_id = BUYER's OrganizationAddress ID (PCF data is buyer's data)
    -- region_id = BUYER's region (resolved from buyer's address)
    -- Emission fields (Grid, Captive, Fuel, Waste) = SUPPLIER's data
    -- supplier_code = OrgSupplierMaster.code (matches GHGMaterialProcurement.Supplier_Code)
    -- supplier_location_code = supplier's OrganizationAddress → Addresses.code (individual location)
    -- Resolve buyer_material_code from OrgMaterialMaster.code
    -- kpi_em_pcf_per_unit computed in service layer
    -- after merging with UOM-converted buyer quantities
    -- ============================================================
    SELECT 
      '${organization_id}'::uuid as organization_id,
      se.buyer_oa_id as address_id,
      buyer_r.id as region_id,
      se."year",
      se."month",
      se.supplier_address_mapping_id,
      se.org_material_master_id,
      se.supplier_master_code as supplier_code,
      se.supplier_oa_location_code as supplier_location_code,
      LOWER(TRIM(omm.code)) as buyer_material_code,
      COALESCE(ad.allocation_percentage, 0) as allocation_percentage,
      se.em_grid_power as "kpi_allocated_em_Grid_Power",
      se.em_captive_power as "kpi_allocated_em_Captive_Power",
      se.em_fuel_purchased as "kpi_allocated_em_Fuel_Purchased",
      se.em_waste_generation as "kpi_allocated_em_Waste_Generation",
      se.supplier_oa_id as supplier_org_address_id
    FROM supplier_emissions se
    INNER JOIN "OrganizationAddress" buyer_oa ON buyer_oa.id = se.buyer_oa_id
    INNER JOIN "Addresses" buyer_a ON buyer_a.id = buyer_oa.address_id
    INNER JOIN "Country" buyer_c ON buyer_c.id = buyer_a.country_id
    LEFT JOIN "Region" buyer_r ON buyer_r.code = buyer_c.region_code
    INNER JOIN "OrgMaterialMaster" omm ON omm.id = se.org_material_master_id
    LEFT JOIN allocation_data ad
      ON ad.organization_address_id = se.supplier_oa_id
      AND LOWER(TRIM(ad."Material_Code")) = LOWER(TRIM(omm.code))
      AND ad."year" = se."year"
      AND ad."month" = se."month"
    ${materialFilterSql ? `WHERE (se.supplier_master_code, LOWER(TRIM(omm.code))) IN ${materialFilterSql} OR (se.supplier_oa_location_code, LOWER(TRIM(omm.code))) IN ${materialFilterSql}` : ""}
    ORDER BY se."year", se."month", supplier_code, buyer_material_code
    `);
};

/**
 * Query to get supplier's task request data for reverse PCF calculation
 * Used when supplier submits emission data to find which time periods need buyer PCF updates
 */
export const SQL_QUERY_Supplier_Task_Requests = (
  supplier_task_request_ids: UUID[]
) => {
  const taskRequestIdForSql =
    "('" + supplier_task_request_ids.join("','") + "')";
  return sql.raw(`
    SELECT DISTINCT 
      tr.id,
      tr."year",
      tr."month",
      tr.organization_address_id
    FROM "TaskRequest" tr
    WHERE tr.id IN ${taskRequestIdForSql}
      AND tr.is_deleted = false
  `);
};

/**
 * Query to find all buyers mapped to a specific supplier
 * Used in reverse PCF calculation to determine which buyers are affected by supplier's emission updates
 */
export const SQL_QUERY_Buyers_For_Supplier = (
  supplier_organization_id: UUID
) => {
  return sql.raw(`
    SELECT DISTINCT
      bsm."buyerOrgid" as buyer_organization_id,
      o.name as buyer_name
    FROM "BuyerSupplierMappings" bsm
    INNER JOIN "Organization" o ON o.id = bsm."buyerOrgid"
    WHERE bsm."supplierOrgid" = '${supplier_organization_id}'
      AND o.is_deleted = false
  `);
};

/**
 * Query to find buyer's task requests for specific time periods
 * Used to match buyer's data with supplier's emission submission periods
 */
export const SQL_QUERY_Buyer_Task_Requests_For_Time_Periods = (
  buyer_organization_id: UUID,
  timePeriodConditions: string
) => {
  return sql.raw(`
    SELECT DISTINCT tr.id
    FROM "TaskRequest" tr
    INNER JOIN "OrganizationAddress" oa ON oa.id = tr.organization_address_id
    WHERE oa.organization_id = '${buyer_organization_id}'
      AND tr.is_deleted = false
      AND (${timePeriodConditions})
  `);
};

/**
 * Query to find unique task request IDs and supplier+material key pairs
 * from GHGMaterialProcurement, GHGTransport_Upstream, and GHGCapital_Goods
 * for a given set of material codes within an organization.
 * Used when Material Master is updated to identify which PCF calculations need reprocessing.
 */
export const SQL_QUERY_Task_Requests_And_Material_Keys_By_Material_Codes = (
  organization_id: string,
  materialCodesSql: string
) => {
  return sql.raw(`
    SELECT DISTINCT
      tr.id as task_request_id,
      LOWER(TRIM(gmp."Supplier_Code")) as supplier_code,
      LOWER(TRIM(gmp."Material_Code")) as material_code
    FROM "GHGMaterialProcurement" gmp
    INNER JOIN "TaskRequest" tr ON tr.id = gmp.task_request_id
    INNER JOIN "OrganizationAddress" oa ON oa.id = tr.organization_address_id
    WHERE oa.organization_id = '${organization_id}'
      AND tr.is_deleted = false
      AND LOWER(TRIM(gmp."Material_Code")) IN ${materialCodesSql}

    UNION

    SELECT DISTINCT
      tr.id as task_request_id,
      LOWER(TRIM(gu."Supplier_code")) as supplier_code,
      LOWER(TRIM(gu."Material_ID")) as material_code
    FROM "GHGTransport_Upstream" gu
    INNER JOIN "TaskRequest" tr ON tr.id = gu.task_request_id
    INNER JOIN "OrganizationAddress" oa ON oa.id = tr.organization_address_id
    WHERE oa.organization_id = '${organization_id}'
      AND tr.is_deleted = false
      AND LOWER(TRIM(gu."Material_ID")) IN ${materialCodesSql}

    UNION

    SELECT DISTINCT
      tr.id as task_request_id,
      LOWER(TRIM(gcg."Supplier_Code")) as supplier_code,
      LOWER(TRIM(gcg."Material_Code")) as material_code
    FROM "GHGCapital_Goods" gcg
    INNER JOIN "TaskRequest" tr ON tr.id = gcg.task_request_id
    INNER JOIN "OrganizationAddress" oa ON oa.id = tr.organization_address_id
    WHERE oa.organization_id = '${organization_id}'
      AND tr.is_deleted = false
      AND LOWER(TRIM(gcg."Material_Code")) IN ${materialCodesSql}
  `);
};
