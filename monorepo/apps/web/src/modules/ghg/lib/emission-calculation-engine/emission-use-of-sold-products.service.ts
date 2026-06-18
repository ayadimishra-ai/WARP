import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgUseOfSoldProducts_Electricity_Updates,
  GhgUseOfSoldProducts_Fuel_Updates,
  GhgUseOfSoldProducts_Refrigerant_Updates,
} from "@/modules/ghg/graphql/shared/types";
import {
  emissionFactorUnits,
  USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY,
} from "@/modules/ghg/shared/constants/input.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { getdefaultfuelquality } from "../excel/excel.service";
import { ParentActivitiesType } from "../shared/constants/activity.constant";
import { initEmissionCalculation } from "./emission-factor.service";

export const calculateUseOfSoldProductsEmission = async (
  taskRequestIds: string[],
  organizationId: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();

    const emissionData = await sdk.getUseOfSoldProductsDataForEmission({
      taskRequestId: taskRequestIds,
    });

    const fuelRows = emissionData?.GHGUseOfSoldProducts_Fuel ?? [];
    const electricityRows =
      emissionData?.GHGUseOfSoldProducts_Electricity ?? [];
    const refrigerantRows =
      emissionData?.GHGUseOfSoldProducts_Refrigerant ?? [];

    const fuelUpdates = await calculateEmissionsScope3Category11FuelSheet(
      fuelRows,
      organizationId
    );

    const electricityUpdates =
      await calculateEmissionsScope3Category11ElectricitySheet(
        electricityRows,
        organizationId
      );

    const refrigerantUpdates = await calculateEmissionsScope3Category11RefrigerantSheet(
      refrigerantRows,
      organizationId
    );

    const batchSize = 2000;
    const maxBatches = Math.max(
      Math.ceil(fuelUpdates.length / batchSize),
      Math.ceil(electricityUpdates.length / batchSize),
      Math.ceil(refrigerantUpdates.length / batchSize),
      1
    );

    for (let batchIdx = 0; batchIdx < maxBatches; batchIdx++) {
      const fuelBatch = fuelUpdates.slice(
        batchIdx * batchSize,
        (batchIdx + 1) * batchSize
      );
      const electricityBatch = electricityUpdates.slice(
        batchIdx * batchSize,
        (batchIdx + 1) * batchSize
      );
      const refrigerantBatch = refrigerantUpdates.slice(
        batchIdx * batchSize,
        (batchIdx + 1) * batchSize
      );

      if (
        fuelBatch.length === 0 &&
        electricityBatch.length === 0 &&
        refrigerantBatch.length === 0
      ) {
        continue;
      }

      await sdk.updateUseOfSoldProductsEmission({
        fuelUpdates: fuelBatch,
        electricityUpdates: electricityBatch,
        refrigerantUpdates: refrigerantBatch,
      });
    }
  } catch (error) {
    console.error("Error calculating Use of Sold Products emission:", error);
    throw error;
  }
};

// EF: Energy → Sold Products → Fuel → Type of Fuel
// Formula: Quantity(T) × Quality(GJ/T) × EF(kgCO₂e/GJ)
const calculateEmissionsScope3Category11FuelSheet = async (
  fuelRows: Record<string, any>[],
  organizationId: string
): Promise<GhgUseOfSoldProducts_Fuel_Updates[]> => {
  if (fuelRows.length === 0) return [];

  const countryId = String(
    fuelRows[0]?.OrganizationAddress?.Address?.country_id ?? ""
  );
  if (!countryId) {
    console.log(
      "Use of Sold Products Fuel: No country_id found, skipping emission calculation."
    );
    return [];
  }

  const emissionFactorInit = await initEmissionCalculation(
    organizationId,
    countryId,
    [ParentActivitiesType.Energy]
  );

  const updates: GhgUseOfSoldProducts_Fuel_Updates[] = [];

  const fuelList = fuelRows
    .map((row) => sanitizeString.v4(row?.Type_of_Fuel_Consumed))
    .filter(Boolean) as string[];

  const fuelQuality =
    fuelList.length > 0
      ? await getdefaultfuelquality(fuelList, "" as UUID, [
          USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY,
        ])
      : [];

  for (let i = 0; i < fuelRows.length; i++) {
    const row = fuelRows[i];
    const fuelType = String(row.Type_of_Fuel_Consumed ?? "");

    const filters = [
      { field: "category", value: "Energy", additionalfilter: "" },
      { field: "activity", value: "Sold Products", additionalfilter: "" },
      { field: "sub_activity", value: "Fuel", additionalfilter: "" },
      { field: "type", value: fuelType, additionalfilter: "" },
      {
        field: "unitFilter",
        value: emissionFactorUnits.gj,
        additionalfilter: "",
      },
      {
        field: "yearMonth",
        value: { year: row.TaskRequest?.year, month: row.TaskRequest?.month },
        additionalfilter: "",
      },
      { field: "metadata", value: "yes", additionalfilter: "Default" },
    ];

    const emission = emissionFactorInit(
      "use_of_sold_products_fuel",
      filters,
      row.Quantity_of_Fuel_Consumed,
      String(row.UoM_of_Fuel_Consumed ?? ""),
      fuelType
    );

    const defaultFuelQuality = fuelQuality.filter(
      (item) =>
        sanitizeString.v4(item?.label || "") === sanitizeString.v4(fuelType)
    ) as Record<string, any>[];

    updates.push({
      where: { id: { _eq: row.id } },
      _set: {
        kpi_em_Scope3_Category11:
          defaultFuelQuality.length > 0
            ? (emission.emissionValue ?? 0) * defaultFuelQuality[0]?.value
            : 0,
        kpi_emf_Scope3_Category11: emission.emissionFactorValue,
      },
    });
  }

  return updates;
};

// EF: Energy → Grid → Non Renewable, geography = row-level Region (geographyOverride per Region)
// Formula: kWh × EF(kgCO₂e/kWh) / 1000
const calculateEmissionsScope3Category11ElectricitySheet = async (
  electricityRows: Record<string, any>[],
  organizationId: string
): Promise<GhgUseOfSoldProducts_Electricity_Updates[]> => {
  if (electricityRows.length === 0) return [];

  const uniqueRegions = [
    ...new Set(
      electricityRows.map((row) => String(row.Region ?? "")).filter(Boolean)
    ),
  ];

  if (uniqueRegions.length === 0) return [];

  const matchedGeographies =
    await getMatchedGeographiesByRegionsILike(uniqueRegions);

  // Combine matched geographies + original regions, deduplicate (case-sensitive)
  const mergedGeographies = [...matchedGeographies, ...uniqueRegions];
  const resolvedGeographies = [...new Set(mergedGeographies)];

  // Single initEmissionCalculation call — fetches EFs for all regions at once
  const emissionFactorInit = await initEmissionCalculation(
    organizationId,
    "",
    [ParentActivitiesType.Energy],
    resolvedGeographies // geographyOverride — bypasses country hierarchy
  );

  return electricityRows.map((row) => {
    const region = String(row.Region ?? "");
    const year = row.TaskRequest?.year;
    const month = row.TaskRequest?.month;
    const unitsOfElectricity = Number(
      row.Units_of_Electricity_consumed_in_kWh ?? 0
    );

    const filters = [
      { field: "category", value: "Energy", additionalfilter: "" },
      { field: "activity", value: "Grid", additionalfilter: "" },
      { field: "sub_activity", value: "Non Renewable", additionalfilter: "" },
      { field: "geography", value: region, additionalfilter: "" },
      {
        field: "yearMonth",
        value: { year, month },
        additionalfilter: "",
      },
      { field: "metadata", value: "yes", additionalfilter: "Default" },
    ];

    const emission = emissionFactorInit(
      "use_of_sold_products_electricity",
      filters,
      unitsOfElectricity,
      "",
      ""
    );

    return {
      where: { id: { _eq: row.id } },
      _set: {
        kpi_em_Scope3_Category11: emission.emissionValue,
        kpi_emf_Scope3_Category11: emission.emissionFactorValue,
      },
    } as GhgUseOfSoldProducts_Electricity_Updates;
  });
};

// EF: Fugitive → GWP 100 → Type of Refrigerant Used (GWP not divided by 1000)
// Formula: Quantity(T) × GWP
const calculateEmissionsScope3Category11RefrigerantSheet = async (
  refrigerantRows: Record<string, any>[],
  organizationId: string
): Promise<GhgUseOfSoldProducts_Refrigerant_Updates[]> => {
  if (refrigerantRows.length === 0) return [];

  const countryId = String(
    refrigerantRows[0]?.OrganizationAddress?.Address?.country_id ?? ""
  );
  if (!countryId) {
    console.log(
      "Use of Sold Products Refrigerant: No country_id found, skipping emission calculation."
    );
    return [];
  }

  const emissionFactorInit = await initEmissionCalculation(
    organizationId,
    countryId,
    [ParentActivitiesType.Fugitive]
  );

  const updates: GhgUseOfSoldProducts_Refrigerant_Updates[] = [];

  for (let i = 0; i < refrigerantRows.length; i++) {
    const row = refrigerantRows[i];

    const filters = [
      {
        field: "category",
        value: ParentActivitiesType.Fugitive,
        additionalfilter: "",
      },
      { field: "activity", value: "GWP 100", additionalfilter: "" },
      {
        field: "type",
        value: row.Refrigerant_type_used_in_sold_product,
        additionalfilter: "",
      },
      {
        field: "yearMonth",
        value: { year: row.TaskRequest?.year, month: row.TaskRequest?.month },
        additionalfilter: "",
      },
      { field: "metadata", value: "yes", additionalfilter: "Default" },
    ];

    const emission = emissionFactorInit(
      "use_of_sold_products_refrigerant",
      filters,
      row.Quantity_of_Refrigerant_consumed,
      String(row.UoM_of_Refrigerant_consumed ?? ""),
      ""
    );

    updates.push({
      where: { id: { _eq: row.id } },
      _set: {
        kpi_em_Scope3_Category11: emission.emissionValue,
        kpi_emf_Scope3_Category11: emission.emissionFactorValue,
      },
    });
  }

  return updates;
};

const getMatchedGeographiesByRegionsILike = async (
  uniqueRegions: string[]
): Promise<string[]> => {
  if (!uniqueRegions.length) return [];

  const normalizedRegions = uniqueRegions
    .map((region) => sanitizeString.v4(String(region ?? "")))
    .filter(Boolean);

  if (!normalizedRegions.length) return [];

  const sdk = await getGraphQlServerSDK();

  // Fetch only matching geographies using _ilike per region
  const where = {
    _or: normalizedRegions.map((region) => ({
      geography: { _ilike: `%${region}%` },
    })),
  };

  const data = await sdk.getEmissionGeographyByRegions({ where });

  return [
    ...new Set(
      (data?.EmissionFactorGeographyHierarchy ?? [])
        .map((item) => String(item?.geography ?? "").trim())
        .filter(Boolean)
    ),
  ];
};
