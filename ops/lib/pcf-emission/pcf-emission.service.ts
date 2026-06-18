import { UUID } from "crypto";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  ActivityMasterKey,
  MATERIAL_QUANTITY_PROCURED_UOM_KEY,
  TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
} from "~/shared/constants/input.constant";
import { GetOPSDBContext } from "~/utils/database/db-context";
import { months } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
import { ConvertUOMGeneralised } from "../data-conversion/uom-conversion.service";
import {
  convertMaterialWeightPerUnitToKg,
  convertQuantityToStandardUom,
} from "../material-conversion/material-conversion.service";
import {
  SQL_QUERY_Buyer_Material_Procurement_Quantities,
  SQL_QUERY_Buyer_Task_Requests_For_Time_Periods,
  SQL_QUERY_Buyers_For_Supplier,
  SQL_QUERY_Kpi_PCF_Material_Procurement,
  SQL_QUERY_Kpi_PCF_Supplier_Facility,
  SQL_QUERY_Kpi_PCF_Upstream,
  SQL_QUERY_Supplier_Task_Requests,
} from "./pcf-emission.queries";

/**
 * Build SQL tuple filter string from ChangedMaterialKey[] for selective recalculation
 * Returns undefined if no keys provided (= recalculate all)
 * Output format: (('supplier1','material1'), ('supplier2','material2'))
 */
function buildMaterialFilterSql(
  changedMaterialKeys?: ChangedMaterialKey[]
): string | undefined {
  if (!changedMaterialKeys || changedMaterialKeys?.length === 0) {
    return undefined;
  }
  const tuples = changedMaterialKeys?.map(
    (k) =>
      `('${sanitizeString.v4(k?.supplier_code).replace(/'/g, "''")}','${sanitizeString.v4(k?.buyer_material_code).replace(/'/g, "''")}')`
  );
  return `(${tuples?.join(",")})`;
}

/**
 * Fetch OrgMaterialMaster records filtered by org ID and a set of material codes.
 * Uses case-insensitive (_ilike) matching to prevent case mismatches.
 * Falls back to fetching all org materials when no codes are provided.
 */
async function fetchFilteredMaterialMaster(
  organizationId: string,
  materialCodes: string[]
) {
  const sdk = await getGraphQlServerSDK();

  const uniqueCodes = [...new Set(materialCodes.map((c) => c.trim()))].filter(
    Boolean
  );

  const materialCodeFilters = uniqueCodes.map((code) => ({
    code: { _ilike: code },
  }));

  const res = await sdk.getMaterialMasterByOrgIdAndCodes({
    where: {
      organization_id: { _eq: organizationId },
      _or: materialCodeFilters,
    },
  });
  return res?.OrgMaterialMaster || [];
}

/**
 * PCF Material Procurement Record from SQL Query
 */
interface KPIPCFMaterialProcurementRecord {
  organization_id: string;
  address_id: string;
  region_id: string | null;
  year: number;
  month: string;
  supplier_code: string;
  buyer_material_code: string;
  material_weight_per_unit: number | null;
  material_weight_per_unit_uom: string | null;
  kpi_emf_material_procurement: number;
}

/**
 * PCF Upstream Transportation Record from SQL Query
 */
interface KPIPCFUpstreamRecord {
  organization_id: string;
  address_id: string;
  region_id: string | null;
  year: number;
  month: string;
  supplier_code: string;
  buyer_material_code: string | null;
  buyer_material_procurement_quantity: number;
  buyer_material_procurement_uom: string | null;
  kpi_em_upstream: number;
}

/**
 * PCF Supplier Facility Record from SQL Query
 * address_id and region_id are BUYER's (PCF data is buyer's data)
 * Emission fields (Grid, Captive, Fuel, Waste) are from SUPPLIER's data
 * buyer_material_procurement_quantity and kpi_em_pcf_per_unit
 * are computed in service layer after UOM-converted quantity merge
 */
interface KPIPCFSupplierFacilityRecord {
  organization_id: string; // buyer's org ID
  address_id: string; // buyer's OrganizationAddress.id
  region_id: string | null; // buyer's region
  year: number;
  month: string;
  supplier_code: string; // OrgSupplierMaster.code (matches GHGMaterialProcurement.Supplier_Code)
  supplier_location_code: string | null; // supplier's OrganizationAddress → Addresses.code (individual location)
  supplier_org_address_id: string | null; // supplier's OrganizationAddress.id
  buyer_material_code: string | null;
  allocation_percentage: number | null;
  kpi_allocated_em_Grid_Power: number; // from supplier's data
  kpi_allocated_em_Captive_Power: number; // from supplier's data
  kpi_allocated_em_Fuel_Purchased: number; // from supplier's data
  kpi_allocated_em_Waste_Generation: number; // from supplier's data
}

/**
 * Buyer Material Procurement Quantity Record from SQL Query
 * Individual rows (no GROUP BY) with UOM for service-side conversion and aggregation
 */
/**
 * Buyer Material Procurement Quantity Record from SQL Query
 * Individual rows (no GROUP BY) with UOM for service-side conversion and aggregation
 */
interface BuyerMaterialProcurementQuantityRecord {
  organization_id: string;
  supplier_code: string;
  material_code: string;
  year: number;
  month: string;
  procurement_quantity: number;
  procurement_quantity_uom: string | null;
}

/**
 * Changed material key for selective recalculation (buyer-side optimization)
 * When provided, only the specified supplier+material combinations are recalculated
 * instead of all materials for the entire month/period
 */
interface ChangedMaterialKey {
  supplier_code: string;
  buyer_material_code: string;
}

/**
 * Return type for calculatePCFEmission function
 */
interface CalculatePCFEmissionResult {
  materialProcurement: {
    insert_KpiKPIProductCarbonFootprintMaterialProcurement: {
      returning: any[];
    };
    delete_KpiKPIProductCarbonFootprintMaterialProcurement: {
      returning: any[];
    };
  };
  upstream: {
    insert_KPIProductCarbonFootprintUpstream: {
      returning: any[];
    };
    delete_KPIProductCarbonFootprintUpstream: {
      returning: any[];
    };
  };
  supplierFacility: {
    insert_KPIProductCarbonFootprintSupplierFacility: {
      returning: any[];
    };
    delete_KPIProductCarbonFootprintSupplierFacility: {
      returning: any[];
    };
  };
}

/**
 * Process Material Procurement PCF calculation
 * Fetches, transforms, and persists Material Procurement emission data
 *
 * @param taskRequestIdForSql - Formatted SQL IN clause with task request IDs
 * @param organization_id - The organization ID (buyer)
 * @param user_id - Optional user ID for audit fields
 * @returns Material Procurement response with insert/delete results
 */
async function processMaterialProcurementPCF(
  taskRequestIdForSql: string,
  organization_id: string,
  user_id?: string,
  changedMaterialKeys?: ChangedMaterialKey[]
): Promise<any> {
  const dbContext = await GetOPSDBContext();
  const graphqlSDK = await getGraphQlServerSDK();
  const uomConversion = await ConvertUOMGeneralised(organization_id);

  const batchSize = 1000;
  const materialFilterSql = buildMaterialFilterSql(changedMaterialKeys);

  // Fetch Material Procurement Data
  const kpiPCFMaterialProcurement: KPIPCFMaterialProcurementRecord[] =
    (await dbContext.execute(
      SQL_QUERY_Kpi_PCF_Material_Procurement(
        taskRequestIdForSql,
        organization_id,
        materialFilterSql
      )
    )) || [];

  const materialProcurementResponse: any = {
    insert_KPIProductCarbonFootprintMaterialProcurement: {
      returning: [],
    },
    delete_KPIProductCarbonFootprintMaterialProcurement: {
      returning: [],
    },
  };

  if (kpiPCFMaterialProcurement.length === 0) {
    return materialProcurementResponse;
  }

  // Build delete condition based on unique combinations of year, month, and address_id
  const allMaterialProcurementWhere: Record<string, any>[] = [];
  const processedKeysMaterialProcurement = new Set<string>();

  kpiPCFMaterialProcurement.forEach(
    (record: KPIPCFMaterialProcurementRecord) => {
      const monthNumber: number =
        months.findIndex(
          (x) =>
            sanitizeString.v4(x) ===
            sanitizeString.v4(String(record?.month || ""))
        ) + 1;

      const key: string = changedMaterialKeys
        ? `${record?.year || 0}-${monthNumber}-${record?.address_id || ""}-${sanitizeString.v4(record?.supplier_code || "")}-${sanitizeString.v4(record?.buyer_material_code || "")}`
        : `${record?.year || 0}-${monthNumber}-${record?.address_id || ""}`;
      if (!processedKeysMaterialProcurement.has(key)) {
        processedKeysMaterialProcurement.add(key);
        const whereCondition: Record<string, any> = {
          year: { _eq: record?.year || 0 },
          month: { _eq: monthNumber },
          address_id: { _eq: record?.address_id },
        };
        if (changedMaterialKeys) {
          whereCondition.supplier_code = { _eq: record?.supplier_code || "" };
          whereCondition.buyer_material_code = {
            _eq: record?.buyer_material_code || "",
          };
        }
        allMaterialProcurementWhere.push({ _and: whereCondition });
      }
    }
  );

  // Transform SQL query results to GraphQL mutation input format
  // SQL query already groups by year/month/address/supplier/material
  const allMaterialProcurementData = kpiPCFMaterialProcurement?.map(
    (record) => {
      // Convert material weight per unit to KG
      const materialWeightResult = convertMaterialWeightPerUnitToKg(
        record?.material_weight_per_unit,
        record?.material_weight_per_unit_uom,
        uomConversion
      );

      // kpi_emf_material_procurement is already in KgCO2e/Kg — no conversion needed
      const kpiEmfMaterialProcurement =
        record?.kpi_emf_material_procurement ?? 0;

      // Formula => Material Emissions Per Unit (KgCO2e) = Material Weight Per Unit (KG) * Emission Factor (KgCO2e/Kg)
      const kpiEmPcfPerUnitMaterialProcurement =
        materialWeightResult?.value * kpiEmfMaterialProcurement;

      return {
        organization_id: record?.organization_id,
        address_id: record?.address_id,
        region_id: record?.region_id || null,
        year: record?.year || 0,
        month:
          months.findIndex(
            (x) =>
              sanitizeString.v4(x) ===
              sanitizeString.v4(String(record?.month || ""))
          ) + 1,
        supplier_code: record?.supplier_code || "",
        buyer_material_code: record?.buyer_material_code || "",
        material_weight_per_unit: materialWeightResult?.value,
        material_weight_per_unit_uom: materialWeightResult?.uom,
        kpi_emf_material_procurement: record?.kpi_emf_material_procurement ?? 0,
        kpi_em_pcf_per_unit: kpiEmPcfPerUnitMaterialProcurement,
        kpi_em_pcf_per_unit_uom: "kgCO2e/kg",
        created_by: user_id || null,
        updated_by: user_id || null,
      };
    }
  );

  // Process in batches
  for (let i = 0; i < allMaterialProcurementData.length; i += batchSize) {
    const whereBatch = allMaterialProcurementWhere.slice(i, i + batchSize);
    const batch = allMaterialProcurementData.slice(i, i + batchSize);

    const res =
      await graphqlSDK.insertKPIProductCarbonFootprintMaterialProcurement({
        kpiMaterialProcurementData: batch,
        deleteKpiMaterialProcurementData: { _or: whereBatch },
      });

    if (
      !!res &&
      !!res.insert_KPIProductCarbonFootprintMaterialProcurement &&
      !!res.insert_KPIProductCarbonFootprintMaterialProcurement.returning &&
      res.insert_KPIProductCarbonFootprintMaterialProcurement.returning.length >
        0
    ) {
      materialProcurementResponse.insert_KPIProductCarbonFootprintMaterialProcurement.returning.push(
        ...res.insert_KPIProductCarbonFootprintMaterialProcurement.returning
      );
    }
    if (
      !!res &&
      !!res.delete_KPIProductCarbonFootprintMaterialProcurement &&
      !!res.delete_KPIProductCarbonFootprintMaterialProcurement.returning &&
      res.delete_KPIProductCarbonFootprintMaterialProcurement.returning.length >
        0
    ) {
      materialProcurementResponse.delete_KPIProductCarbonFootprintMaterialProcurement.returning.push(
        ...res.delete_KPIProductCarbonFootprintMaterialProcurement.returning
      );
    }
  }

  return materialProcurementResponse;
}

/**
 * Process Upstream Transportation PCF calculation
 * Fetches, transforms, and persists Upstream Transportation emission data
 *
 * @param taskRequestIdForSql - Formatted SQL IN clause with task request IDs
 * @param organization_id - The organization ID (buyer)
 * @param user_id - Optional user ID for audit fields
 * @returns Upstream response with insert/delete results
 */
async function processUpstreamPCF(
  taskRequestIdForSql: string,
  organization_id: string,
  user_id?: string,
  changedMaterialKeys?: ChangedMaterialKey[]
): Promise<any> {
  const dbContext = await GetOPSDBContext();
  const graphqlSDK = await getGraphQlServerSDK();
  const uomConversion = await ConvertUOMGeneralised(organization_id);
  const batchSize = 1000;
  const materialFilterSql = buildMaterialFilterSql(changedMaterialKeys);

  // Fetch ActivityMaster data for UOM group classification
  const activityMasterResponse = await graphqlSDK.getActivityMasterDataByKey({
    master_key: [...ActivityMasterKey.transport_upstream],
  });
  const activityMasterData = activityMasterResponse?.ActivityMaster || [];

  // Fetch Upstream Transportation Data (individual rows, no GROUP BY)
  const kpiPCFUpstream: KPIPCFUpstreamRecord[] =
    (await dbContext.execute(
      SQL_QUERY_Kpi_PCF_Upstream(
        taskRequestIdForSql,
        organization_id,
        materialFilterSql
      )
    )) || [];

  // Fetch only required material master records based on upstream material codes
  const upstreamMaterialCodes = [
    ...new Set(
      kpiPCFUpstream
        .map((r: KPIPCFUpstreamRecord) => r.buyer_material_code)
        .filter(Boolean) as string[]
    ),
  ];
  const orgMaterialMasterData = await fetchFilteredMaterialMaster(
    organization_id,
    upstreamMaterialCodes
  );

  const upstreamResponse: any = {
    insert_KPIProductCarbonFootprintUpstream: {
      returning: [],
    },
    delete_KPIProductCarbonFootprintUpstream: {
      returning: [],
    },
  };

  if (kpiPCFUpstream.length === 0) {
    return upstreamResponse;
  }

  // Build delete condition based on unique combinations of year, month, and address_id
  const allUpstreamWhere: Record<string, any>[] = [];
  const processedKeysUpstream = new Set<string>();

  kpiPCFUpstream.forEach((record: KPIPCFUpstreamRecord) => {
    const monthNumber: number =
      months.findIndex(
        (x) =>
          sanitizeString.v4(x) ===
          sanitizeString.v4(String(record?.month || ""))
      ) + 1;

    const key: string = changedMaterialKeys
      ? `${record?.year || 0}-${monthNumber}-${record?.address_id || ""}-${sanitizeString.v4(record?.supplier_code || "")}-${sanitizeString.v4(record?.buyer_material_code || "")}`
      : `${record?.year || 0}-${monthNumber}-${record?.address_id || ""}`;
    if (!processedKeysUpstream.has(key)) {
      processedKeysUpstream.add(key);
      const whereCondition: Record<string, any> = {
        year: { _eq: record?.year || 0 },
        month: { _eq: monthNumber },
        address_id: { _eq: record?.address_id },
      };
      if (changedMaterialKeys) {
        whereCondition.supplier_code = { _eq: record?.supplier_code || "" };
        whereCondition.buyer_material_code = {
          _eq: record?.buyer_material_code ?? "",
        };
      }
      allUpstreamWhere.push({ _and: whereCondition });
    }
  });

  // Step 1: Convert each row's quantity to standard UOM and emission to KgCO2e
  // Then aggregate by key (org, address, region, year, month, supplier, material)
  // since after conversion, UOMs are standardized and quantities can be summed
  const aggregationMap = new Map<
    string,
    {
      organization_id: string;
      address_id: string;
      region_id: string | null;
      year: number;
      month: number;
      supplier_code: string;
      buyer_material_code: string | null;
      buyer_material_procurement_quantity: number;
      buyer_material_procurement_uom: string | null;
      buyer_material_procurement_quantity_converted: number;
      buyer_material_procurement_quantity_converted_uom: string | null;
      kpi_em_upstream: number;
    }
  >();

  kpiPCFUpstream.forEach((record) => {
    const monthNumber =
      months.findIndex(
        (x) =>
          sanitizeString.v4(x) ===
          sanitizeString.v4(String(record?.month || ""))
      ) + 1;

    // Convert quantity to standard UOM (mass→KG, volume→Litre, count→as-is)
    const convertedQuantity = convertQuantityToStandardUom(
      record?.buyer_material_procurement_quantity,
      record?.buyer_material_procurement_uom,
      uomConversion,
      activityMasterData,
      TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
      orgMaterialMasterData
    );

    // Convert kpi_em_upstream from tCO2e to KgCO2e (* 1000)
    const kpiEmUpstreamKgCo2e = (record?.kpi_em_upstream ?? 0) * 1000;

    // Aggregation key: org + address + region + year + month + supplier + material
    const aggKey = `${record?.organization_id}-${record?.address_id}-${record?.region_id || ""}-${record?.year || 0}-${monthNumber}-${sanitizeString.v4(record?.supplier_code || "")}-${sanitizeString.v4(record?.buyer_material_code ?? "")}`;

    const existing = aggregationMap.get(aggKey);
    if (existing) {
      // Sum up converted quantity and emissions
      existing.buyer_material_procurement_quantity_converted +=
        convertedQuantity?.value ?? 0;
      existing.kpi_em_upstream += kpiEmUpstreamKgCo2e;
      // Also sum original quantity for reference
      existing.buyer_material_procurement_quantity +=
        record?.buyer_material_procurement_quantity ?? 0;
    } else {
      aggregationMap.set(aggKey, {
        organization_id: record?.organization_id,
        address_id: record?.address_id,
        region_id: record?.region_id || null,
        year: record?.year || 0,
        month: monthNumber,
        supplier_code: record?.supplier_code || "",
        buyer_material_code: record?.buyer_material_code ?? null,
        buyer_material_procurement_quantity:
          record?.buyer_material_procurement_quantity ?? 0,
        buyer_material_procurement_uom:
          record?.buyer_material_procurement_uom ?? null,
        buyer_material_procurement_quantity_converted:
          convertedQuantity?.value ?? 0,
        buyer_material_procurement_quantity_converted_uom:
          convertedQuantity?.uom ?? null,
        kpi_em_upstream: kpiEmUpstreamKgCo2e,
      });
    }
  });

  // Step 2: Build final data with kpi_em_pcf_per_unit formula applied
  const allUpstreamData = Array.from(aggregationMap.values()).map((agg) => {
    // Formula: kpi_em_pcf_per_unit = kpi_em_upstream (KgCO2e) / converted_quantity
    const kpiEmPcfPerUnitUpstream =
      agg.kpi_em_upstream === 0 ||
      agg.buyer_material_procurement_quantity_converted === 0
        ? 0
        : agg.kpi_em_upstream /
          agg.buyer_material_procurement_quantity_converted;

    return {
      organization_id: agg.organization_id,
      address_id: agg.address_id,
      region_id: agg.region_id,
      year: agg.year,
      month: agg.month,
      supplier_code: agg.supplier_code,
      buyer_material_code: agg.buyer_material_code,
      buyer_material_procurement_quantity:
        agg.buyer_material_procurement_quantity_converted,
      buyer_material_procurement_uom:
        agg.buyer_material_procurement_quantity_converted_uom,
      kpi_em_upstream: agg.kpi_em_upstream,
      kpi_em_pcf_per_unit: kpiEmPcfPerUnitUpstream,
      kpi_em_pcf_per_unit_uom: "kgCO2e/kg",
      created_by: user_id || null,
      updated_by: user_id || null,
    };
  });

  // Process in batches
  for (let i = 0; i < allUpstreamData.length; i += batchSize) {
    const whereBatch = allUpstreamWhere.slice(i, i + batchSize);
    const batch = allUpstreamData.slice(i, i + batchSize);

    const res = await graphqlSDK.insertKPIProductCarbonFootprintUpstream({
      kpiUpstreamData: batch,
      deleteKpiUpstreamData: { _or: whereBatch },
    });

    if (
      !!res &&
      !!res.insert_KPIProductCarbonFootprintUpstream &&
      !!res.insert_KPIProductCarbonFootprintUpstream.returning &&
      res.insert_KPIProductCarbonFootprintUpstream.returning.length > 0
    ) {
      upstreamResponse.insert_KPIProductCarbonFootprintUpstream.returning.push(
        ...res.insert_KPIProductCarbonFootprintUpstream.returning
      );
    }
    if (
      !!res &&
      !!res.delete_KPIProductCarbonFootprintUpstream &&
      res.delete_KPIProductCarbonFootprintUpstream.affected_rows > 0
    ) {
      // Note: delete mutation doesn't return records, just affected_rows
      upstreamResponse.delete_KPIProductCarbonFootprintUpstream.returning = [];
    }
  }

  return upstreamResponse;
}

/**
 * Process Supplier Facility PCF calculation
 * Fetches, transforms, and persists Supplier Facility emission data
 *
 * @param taskRequestIdForSql - Formatted SQL IN clause with task request IDs
 * @param organization_id - The organization ID (buyer)
 * @param user_id - Optional user ID for audit fields
 * @returns Supplier Facility response with insert/delete results
 */
async function processSupplierFacilityPCF(
  taskRequestIdForSql: string,
  organization_id: string,
  user_id?: string,
  changedMaterialKeys?: ChangedMaterialKey[]
): Promise<any> {
  const dbContext = await GetOPSDBContext();
  const graphqlSDK = await getGraphQlServerSDK();
  const uomConversion = await ConvertUOMGeneralised(organization_id);
  const batchSize = 1000;
  const materialFilterSql = buildMaterialFilterSql(changedMaterialKeys);

  // Fetch ActivityMaster data for UOM group classification (material procurement UOM)
  const activityMasterResponse = await graphqlSDK.getActivityMasterDataByKey({
    master_key: [...ActivityMasterKey.material_procurement],
  });
  const activityMasterData = activityMasterResponse?.ActivityMaster || [];

  // Fetch Supplier Facility Data and Buyer Material Procurement Quantities in parallel
  // Both queries are filtered by changedMaterialKeys when provided
  const [supplierFacilityResult, buyerQuantitiesResult] =
    await Promise.allSettled([
      dbContext.execute(
        SQL_QUERY_Kpi_PCF_Supplier_Facility(
          taskRequestIdForSql,
          organization_id,
          materialFilterSql
        )
      ),
      dbContext.execute(
        SQL_QUERY_Buyer_Material_Procurement_Quantities(
          taskRequestIdForSql,
          organization_id,
          materialFilterSql
        )
      ),
    ]);

  const kpiPCFSupplierFacility: KPIPCFSupplierFacilityRecord[] =
    supplierFacilityResult.status === "fulfilled"
      ? ((supplierFacilityResult.value || []) as KPIPCFSupplierFacilityRecord[])
      : [];

  const buyerQuantitiesRaw: BuyerMaterialProcurementQuantityRecord[] =
    buyerQuantitiesResult.status === "fulfilled"
      ? ((buyerQuantitiesResult.value ||
          []) as BuyerMaterialProcurementQuantityRecord[])
      : [];

  if (supplierFacilityResult.status === "rejected") {
    console.error(
      "Supplier Facility query failed:",
      supplierFacilityResult.reason
    );
  }
  if (buyerQuantitiesResult.status === "rejected") {
    console.error(
      "Buyer Material Procurement Quantities query failed:",
      buyerQuantitiesResult.reason
    );
  }

  // Fetch only required material master records based on material codes from both datasets
  const supplierFacilityMaterialCodes = kpiPCFSupplierFacility
    .map((r: KPIPCFSupplierFacilityRecord) => r.buyer_material_code)
    .filter(Boolean) as string[];
  const buyerMaterialCodes = buyerQuantitiesRaw
    .map((r: BuyerMaterialProcurementQuantityRecord) => r.material_code)
    .filter(Boolean) as string[];

  const allMaterialCodes = [
    ...new Set([...supplierFacilityMaterialCodes, ...buyerMaterialCodes]),
  ];

  const orgMaterialMasterData = await fetchFilteredMaterialMaster(
    organization_id,
    allMaterialCodes
  );

  const supplierFacilityResponse: any = {
    insert_KPIProductCarbonFootprintSupplierFacility: {
      returning: [],
    },
    delete_KPIProductCarbonFootprintSupplierFacility: {
      returning: [],
    },
  };

  if (kpiPCFSupplierFacility.length === 0) {
    return supplierFacilityResponse;
  }

  // ============================================================
  // Step A: Convert buyer quantities to standard UOM and aggregate
  // Same pattern as processUpstreamPCF — convert then sum by key
  // ============================================================
  const buyerQtyMap = new Map<
    string,
    { quantity: number; uom: string | null }
  >();

  buyerQuantitiesRaw.forEach(
    (record: BuyerMaterialProcurementQuantityRecord) => {
      const monthNumber =
        months.findIndex(
          (x) =>
            sanitizeString.v4(x) ===
            sanitizeString.v4(String(record?.month || ""))
        ) + 1;

      // Convert quantity to standard UOM (mass→KG, volume→Litre, count→as-is)
      const convertedQuantity = convertQuantityToStandardUom(
        record?.procurement_quantity,
        record?.procurement_quantity_uom,
        uomConversion,
        activityMasterData,
        MATERIAL_QUANTITY_PROCURED_UOM_KEY,
        orgMaterialMasterData
      );

      // Key: supplier_code (OrgSupplierMaster.code) + material_code + year + month
      // All supplier locations under the same supplier master share this buyer procurement quantity
      const key = `${sanitizeString.v4(record?.supplier_code || "")}-${sanitizeString.v4(record?.material_code || "")}-${record?.year || 0}-${monthNumber}`;

      const existing = buyerQtyMap.get(key);
      if (existing) {
        existing.quantity += convertedQuantity.value;
      } else {
        buyerQtyMap.set(key, {
          quantity: convertedQuantity.value,
          uom: convertedQuantity.uom,
        });
      }
    }
  );

  // ============================================================
  // Step B: Build delete conditions
  // ============================================================
  const allSupplierFacilityWhere: Record<string, any>[] = [];
  const processedKeysSupplierFacility = new Set<string>();

  kpiPCFSupplierFacility.forEach((record: KPIPCFSupplierFacilityRecord) => {
    const monthNumber: number =
      months.findIndex(
        (x) =>
          sanitizeString.v4(x) ===
          sanitizeString.v4(String(record?.month || ""))
      ) + 1;

    const key: string = changedMaterialKeys
      ? `${record?.year || 0}-${monthNumber}-${record?.address_id}-${sanitizeString.v4(record?.supplier_code || "")}-${sanitizeString.v4(record?.buyer_material_code || "")}`
      : `${record?.year || 0}-${monthNumber}-${record?.address_id}`;
    if (!processedKeysSupplierFacility.has(key)) {
      processedKeysSupplierFacility.add(key);
      const whereCondition: Record<string, any> = {
        year: { _eq: record?.year || 0 },
        month: { _eq: monthNumber },
        address_id: { _eq: record?.address_id },
      };
      if (changedMaterialKeys) {
        whereCondition.supplier_code = { _eq: record?.supplier_code || "" };
        whereCondition.buyer_material_code = {
          _eq: record?.buyer_material_code || "",
        };
      }
      allSupplierFacilityWhere.push({ _and: whereCondition });
    }
  });

  // ============================================================
  // Step C: Merge supplier facility data with buyer quantities
  // and compute kpi_em_pcf_per_unit in service layer
  // Formula: (allocation% / 100) * (Grid + Captive + Fuel + Waste) / Quantity
  // ============================================================
  const allSupplierFacilityData = kpiPCFSupplierFacility.map(
    (record: KPIPCFSupplierFacilityRecord) => {
      const monthNumber =
        months.findIndex(
          (x) =>
            sanitizeString.v4(x) ===
            sanitizeString.v4(String(record?.month || ""))
        ) + 1;

      // Lookup converted buyer quantity using supplier_code (OrgSupplierMaster.code)
      // All supplier locations under the same supplier master share the same buyer procurement quantity
      const qtyKey = `${sanitizeString.v4(record?.supplier_code || "")}-${sanitizeString.v4(record?.buyer_material_code || "")}-${record?.year || 0}-${monthNumber}`;
      const buyerQty = buyerQtyMap.get(qtyKey);
      const procurementQuantity = buyerQty?.quantity ?? 0;
      const allocationPercentage = Number(record?.allocation_percentage) || 0;
      const emGridPower = Number(record?.kpi_allocated_em_Grid_Power) || 0;
      const emCaptivePower =
        Number(record?.kpi_allocated_em_Captive_Power) || 0;
      const emFuelPurchased =
        Number(record?.kpi_allocated_em_Fuel_Purchased) || 0;
      const emWasteGeneration =
        Number(record?.kpi_allocated_em_Waste_Generation) || 0;

      // Formula: (allocation% / 100) * (Grid + Captive + Fuel + Waste) / Quantity
      let kpiEmPcfPerUnit = 0;
      if (procurementQuantity !== 0 && allocationPercentage !== 0) {
        const totalEmissions =
          emGridPower + emCaptivePower + emFuelPurchased + emWasteGeneration;
        const allocationFactor = allocationPercentage / 100;
        kpiEmPcfPerUnit =
          (allocationFactor * totalEmissions) / procurementQuantity;
      }

      return {
        organization_id: record?.organization_id,
        address_id: record?.address_id,
        region_id: record?.region_id || null,
        year: record?.year || 0,
        month: monthNumber,
        supplier_code: record?.supplier_code || "",
        buyer_material_code: record?.buyer_material_code || "",
        supplier_organization_address_id:
          record?.supplier_org_address_id || null,
        buyer_material_procurement_quantity: procurementQuantity,
        buyer_material_procurement_uom: buyerQty?.uom || null,
        allocation_percentage: allocationPercentage,
        kpi_allocated_em_Grid_Power: emGridPower,
        kpi_allocated_em_Captive_Power: emCaptivePower,
        kpi_allocated_em_Fuel_Purchased: emFuelPurchased,
        kpi_allocated_em_Waste_Generation: emWasteGeneration,
        kpi_em_pcf_per_unit: kpiEmPcfPerUnit,
        kpi_em_pcf_per_unit_uom: "kgCO2e/kg",
        created_by: user_id || null,
        updated_by: user_id || null,
      };
    }
  );

  // Process in batches
  for (let i = 0; i < allSupplierFacilityData.length; i += batchSize) {
    const whereBatch = allSupplierFacilityWhere.slice(i, i + batchSize);
    const batch = allSupplierFacilityData.slice(i, i + batchSize);

    const res =
      await graphqlSDK.insertKPIProductCarbonFootprintSupplierFacility({
        kpiSupplierFacilityData: batch,
        deleteKpiSupplierFacilityData: { _or: whereBatch },
      });

    if (
      !!res &&
      !!res.insert_KPIProductCarbonFootprintSupplierFacility &&
      !!res.insert_KPIProductCarbonFootprintSupplierFacility.returning &&
      res.insert_KPIProductCarbonFootprintSupplierFacility.returning.length > 0
    ) {
      supplierFacilityResponse.insert_KPIProductCarbonFootprintSupplierFacility.returning.push(
        ...res.insert_KPIProductCarbonFootprintSupplierFacility.returning
      );
    }
    if (
      !!res &&
      !!res.delete_KPIProductCarbonFootprintSupplierFacility &&
      !!res.delete_KPIProductCarbonFootprintSupplierFacility.returning &&
      res.delete_KPIProductCarbonFootprintSupplierFacility.returning.length > 0
    ) {
      supplierFacilityResponse.delete_KPIProductCarbonFootprintSupplierFacility.returning.push(
        ...res.delete_KPIProductCarbonFootprintSupplierFacility.returning
      );
    }
  }

  return supplierFacilityResponse;
}

/**
 * Calculate Product Carbon Footprint (PCF) Emissions
 * Orchestrates all three PCF components: Material Procurement, Upstream Transportation, and Supplier Facility
 * Uses batching for better performance with large datasets
 *
 * @param organization_id - The organization ID (buyer)
 * @param taskRequestIds - Array of task request IDs to process
 * @param user_id - Optional user ID for audit fields
 * @returns Object containing materialProcurement, upstream, and supplierFacility data
 *
 */
export async function calculatePCFEmission(
  organization_id: string,
  taskRequestIds: string[],
  user_id?: string,
  changedMaterialKeys?: ChangedMaterialKey[]
): Promise<CalculatePCFEmissionResult | undefined> {
  try {
    // Format task request IDs for SQL IN clause
    const taskRequestIdForSql = "('" + taskRequestIds.join("','") + "')";

    // Process all three PCF components in parallel using allSettled for stability
    // allSettled ensures all promises complete even if some fail
    const [materialProcurementResult, upstreamResult, supplierFacilityResult] =
      await Promise.allSettled([
        processMaterialProcurementPCF(
          taskRequestIdForSql,
          organization_id,
          user_id,
          changedMaterialKeys
        ),
        processUpstreamPCF(
          taskRequestIdForSql,
          organization_id,
          user_id,
          changedMaterialKeys
        ),
        processSupplierFacilityPCF(
          taskRequestIdForSql,
          organization_id,
          user_id,
          changedMaterialKeys
        ),
      ]);

    // Extract values from settled promises, using default empty responses for failures
    const materialProcurement =
      materialProcurementResult.status === "fulfilled"
        ? materialProcurementResult.value
        : {
            insert_KPIProductCarbonFootprintMaterialProcurement: {
              returning: [],
            },
            delete_KPIProductCarbonFootprintMaterialProcurement: {
              returning: [],
            },
          };

    const upstream =
      upstreamResult.status === "fulfilled"
        ? upstreamResult.value
        : {
            insert_KPIProductCarbonFootprintUpstream: {
              returning: [],
            },
            delete_KPIProductCarbonFootprintUpstream: {
              returning: [],
            },
          };

    const supplierFacility =
      supplierFacilityResult.status === "fulfilled"
        ? supplierFacilityResult.value
        : {
            insert_KPIProductCarbonFootprintSupplierFacility: {
              returning: [],
            },
            delete_KPIProductCarbonFootprintSupplierFacility: {
              returning: [],
            },
          };

    // Log any failures
    if (materialProcurementResult.status === "rejected") {
      console.error(
        "Material Procurement PCF failed:",
        materialProcurementResult.reason
      );
    }
    if (upstreamResult.status === "rejected") {
      console.error("Upstream PCF failed:", upstreamResult.reason);
    }
    if (supplierFacilityResult.status === "rejected") {
      console.error(
        "Supplier Facility PCF failed:",
        supplierFacilityResult.reason
      );
    }

    // Return response objects with insert/delete details
    return {
      materialProcurement,
      upstream,
      supplierFacility,
    };
  } catch (error) {
    console.error("Error calculating PCF emission:", error);
    return undefined;
  }
}

/**
 * Calculate PCF Emissions for Buyers based on Supplier's Emission Data
 * This function is triggered when a supplier submits emission data (Grid Power, Captive Power, Fuel, Waste)
 * It finds all buyers who procure materials from this supplier and recalculates their PCF
 *
 * Flow:
 * 1. Get supplier's task request data (year, month)
 * 2. Find all buyers mapped to this supplier (via BuyerSupplierMappings)
 * 3. Get material mappings (SupplierMaterialMapping) to know which materials are supplied to which buyers
 * 4. For each buyer, find their task requests matching the same time period
 * 5. Recalculate Supplier Facility PCF for affected buyers
 *
 * @param supplier_organization_id - The supplier organization ID
 * @param supplier_task_request_ids - Array of supplier's task request IDs (when they submit emission data)
 * @param user_id - Optional user ID for audit fields
 * @returns Object containing updated PCF data for all affected buyers
 */
export async function calculatePCFEmissionFromSupplierData(
  supplier_organization_id: UUID,
  supplier_task_request_ids: UUID[],
  user_id?: UUID
): Promise<
  | {
      affectedBuyers: string[];
      results: CalculatePCFEmissionResult[];
    }
  | undefined
> {
  try {
    // Initialize database context and GraphQL SDK
    const dbContext = await GetOPSDBContext();

    // Step 1: Get supplier's task request data (year, month periods)
    const supplierTaskRequests: Array<{
      id: string;
      year: number;
      month: string;
      organization_address_id: string;
    }> = await dbContext.execute(
      SQL_QUERY_Supplier_Task_Requests(supplier_task_request_ids)
    );

    if (!supplierTaskRequests || supplierTaskRequests.length === 0) {
      console.log("No valid supplier task requests found");
      return undefined;
    }

    // Step 2: Find all buyers mapped to this supplier
    const buyers: Array<{
      buyer_organization_id: UUID;
      buyer_name: string;
    }> = await dbContext.execute(
      SQL_QUERY_Buyers_For_Supplier(supplier_organization_id)
    );

    if (!buyers || buyers.length === 0) {
      console.log("No buyers found for this supplier");
      return undefined;
    }

    console.log(
      `Found ${buyers.length} buyer(s) for supplier ${supplier_organization_id}`
    );

    // Step 3: For each buyer, find their task requests and recalculate PCF in parallel
    const buyerPromises = buyers?.map(async (buyer) => {
      // Build time period conditions from supplier's task requests
      const timePeriodConditions = supplierTaskRequests
        .map(
          (str) =>
            `(tr."year" = ${str?.year} AND LOWER(TRIM(tr."month")) = LOWER(TRIM('${str?.month}')))`
        )
        .join(" OR ");

      // Find buyer's task requests matching the same time periods
      const buyerTaskRequests: Array<{ id: string }> = await dbContext.execute(
        SQL_QUERY_Buyer_Task_Requests_For_Time_Periods(
          buyer?.buyer_organization_id,
          timePeriodConditions
        )
      );

      if (buyerTaskRequests && buyerTaskRequests.length > 0) {
        const buyerTaskRequestIds = buyerTaskRequests?.map((tr) => tr?.id);

        console.log(
          `Recalculating PCF for buyer ${buyer?.buyer_name} (${buyer?.buyer_organization_id}) with ${buyerTaskRequestIds.length} task request(s)`
        );

        // Recalculate PCF for this buyer
        const result = await calculatePCFEmission(
          buyer?.buyer_organization_id,
          buyerTaskRequestIds,
          user_id
        );

        return result
          ? { buyer_organization_id: buyer?.buyer_organization_id, result }
          : null;
      } else {
        console.log(
          `No matching task requests found for buyer ${buyer?.buyer_name} in the supplier's time periods`
        );
        return null;
      }
    });

    const settledResults = await Promise.allSettled(buyerPromises);

    const results: CalculatePCFEmissionResult[] = [];
    const affectedBuyers: string[] = [];

    settledResults.forEach((settled, index) => {
      if (settled.status === "fulfilled" && settled.value) {
        results.push(settled.value.result);
        affectedBuyers.push(settled.value.buyer_organization_id);
      } else if (settled.status === "rejected") {
        console.error(
          `PCF recalculation failed for buyer ${buyers[index]?.buyer_name} (${buyers[index]?.buyer_organization_id}):`,
          settled.reason
        );
      }
    });

    return {
      affectedBuyers,
      results,
    };
  } catch (error) {
    console.error("Error calculating PCF emission from supplier data:", error);
    return undefined;
  }
}
