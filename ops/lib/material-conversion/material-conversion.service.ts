import { GetOrgMaterialMasterByCodesInsensitiveQuery } from "~/graphql/shared/types";
import { sanitize_compare_str_v4 } from "~/utils/comapre.util";
import { sanitizeString } from "~/utils/sanitize.util";
import {
  getDefaultData,
  TActivityMasterData,
  TActivityMasterDataArray,
} from "../excel/excel.service";

// Type alias for OrgMaterialMaster from GraphQL query
type TOrgMaterialMaster =
  GetOrgMaterialMasterByCodesInsensitiveQuery["OrgMaterialMaster"][number];

// Activity codes mapping
const ACTIVITY_CODES = {
  MATERIAL_PROCUREMENT: "material_procurement",
  UPSTREAM: "upstream",
  CAPITAL_GOODS: "capital_goods",
} as const;

type ActivityCodeType = (typeof ACTIVITY_CODES)[keyof typeof ACTIVITY_CODES];

/**
 * Gets the UOM group (mass, volume, or count) for a given UOM value
 * Searches through activity master data to find the group classification
 *
 * @param activityMasterData - Array of activity master records containing UOM definitions
 * @param activityMasterKey - The master key to search for (e.g., "capital_goods_quantity_procured_uom")
 * @param uomValue - The UOM value to find the group for (e.g., "kilogram", "litre")
 * @returns The group string (e.g., "mass", "volume", "count") or null if not found
 *
 * @example
 * const group = getUomGroup(activityMasterData, "capital_goods_quantity_procured_uom", "kilogram");
 * // Returns: "mass"
 */
export const getUomGroup = (
  activityMasterData: TActivityMasterData[],
  activityMasterKey: string,
  uomValue: string
): string | null => {
  if (!activityMasterData || !uomValue) {
    return null;
  }

  // Find the master record matching the key
  const masterRecord = activityMasterData.find(
    (activityMaster) => activityMaster?.master_key === activityMasterKey
  );

  if (!masterRecord?.master_data) {
    return null;
  }

  // Find the UOM record and return its group
  const uomRecord = masterRecord?.master_data?.find((item) =>
    sanitize_compare_str_v4(String(item?.value), String(uomValue))
  );

  // Return the first group if found, otherwise null
  return uomRecord?.group?.[0] || null;
};

export const materialWeightUomConversion = ({
  materialCode,
  activityMasterData,
  quantityProcured,
  quantityProcuredUom,
  uomConversion,
  orgMaterialMaster,
  materialMasterWeightUomKey,
  activityUomMasterKey,
}: {
  materialCode: string;
  activityMasterData: TActivityMasterData[];
  quantityProcured: number;
  quantityProcuredUom: string;
  uomConversion: (
    value: number,
    fromUom: string,
    toUom: string,
    context: string
  ) => number | null;
  orgMaterialMaster: TOrgMaterialMaster[];
  materialMasterWeightUomKey: string;
  activityUomMasterKey: string;
}) => {
  try {
    let kpi_material_weight_kg = 0;

    // defaultUoM is Kilogram for mass group in capital goods quantity procured uom
    const defaultUoM = getDefaultData({
      masterKey: activityUomMasterKey,
      activityMasterData: activityMasterData || [],
      valueForDefaultValue: "mass",
    });

    // Check that if Quantity_Procured_uom is mass, volume or count
    const uomGroup = getUomGroup(
      activityMasterData || [],
      activityUomMasterKey,
      quantityProcuredUom
    );

    // If uomGroup is "mass", Direly convert Quantity Procured to weight using uom conversion factor
    if (uomGroup === "mass") {
      // If defaultUoM and Quantity_Procured_uom are same, then no need to convert and directly assign Quantity_Procured value to quantityProcuredTotalWeightKG
      if (sanitize_compare_str_v4(defaultUoM, String(quantityProcuredUom))) {
        kpi_material_weight_kg = quantityProcured;
      } else {
        // Convert Quantity Procured to weight in KG using uom conversion factor
        const valueInKG = uomConversion(
          quantityProcured,
          quantityProcuredUom,
          defaultUoM,
          ""
        );
        kpi_material_weight_kg = valueInKG ?? 0;
      }
    } else if (uomGroup === "volume") {
      let quantityProcuredLitre: number = 0;

      // defaultUoM is Litre for volume group in capital goods quantity procured uom
      const defaultUoM = getDefaultData({
        masterKey: activityUomMasterKey,
        activityMasterData: activityMasterData || [],
        valueForDefaultValue: "volume",
      });

      // defaultUoMMass is Kilogram for mass group in capital goods quantity procured uom, which will be used to convert material weight per unit to kilogram if it is not in kilogram
      const defaultUoMMass = getDefaultData({
        masterKey: activityUomMasterKey,
        activityMasterData: activityMasterData || [],
        valueForDefaultValue: "mass",
      });

      // If uomGroup is "volume", Convert Quantity Procured to weight using material weight per unit from org material master data and uom conversion factor

      // conversionDetails
      const conversionDetails = {
        isConversionPossible: false,
        numeratorUom: "",
        denominatorUom: "",
        reason: "",
        materialUom: "",
      };

      const material = orgMaterialMaster?.find((m) =>
        sanitize_compare_str_v4(String(m?.code), String(materialCode))
      );

      const materialMasterUOM = activityMasterData?.filter(
        (activityMaster) =>
          activityMaster?.master_key === materialMasterWeightUomKey
      );

      if (material && materialMasterUOM?.length) {
        const currentMaterialUom = materialMasterUOM?.[0]?.master_data?.filter(
          (item: TActivityMasterDataArray) =>
            sanitize_compare_str_v4(
              String(item?.value),
              String(material?.UoM_Material_Weight)
            )
        );

        if (currentMaterialUom?.length) {
          currentMaterialUom.forEach((uom: TActivityMasterDataArray) => {
            // We have to check that uom group is allowed to convert volume to mass, i.e Kilogram/litre, Tonne/litre, Gram/litre,
            if (
              uom?.group?.includes("mass") &&
              uom?.group?.includes(uomGroup)
            ) {
              const numeratorUom = uom?.value?.split("/")?.[0] ?? ""; // i.e kilogram, tonne, gram
              const denominatorUom = uom?.value?.split("/")?.[1] ?? ""; // i.e litre
              conversionDetails.isConversionPossible = true;
              conversionDetails.materialUom = uom?.value; // i.e kilogram/litre
              conversionDetails.numeratorUom = numeratorUom; // i.e kilogram
              conversionDetails.denominatorUom = denominatorUom; // i.e litre
            }
          });
        }
      }

      if (!sanitize_compare_str_v4(defaultUoM, String(quantityProcuredUom))) {
        // Convert Quantity_Procured to litre if defaultUoM is not same as Quantity_Procured_uom
        quantityProcuredLitre = uomConversion(
          quantityProcured,
          quantityProcuredUom ?? "",
          defaultUoM,
          ""
        ) as number;
      } else {
        quantityProcuredLitre = quantityProcured;
      }

      if (conversionDetails?.isConversionPossible) {
        const materialWeightPerUnit: number =
          material?.Material_Weight_Per_Unit ?? 0;

        if (
          !sanitize_compare_str_v4(
            conversionDetails?.numeratorUom,
            defaultUoMMass
          )
        ) {
          // Convert to Kilogram/Litre if numeratorUom is not kilogram
          const valueInKGPerLitre = uomConversion(
            materialWeightPerUnit,
            conversionDetails?.numeratorUom ?? "",
            defaultUoMMass,
            ""
          );

          kpi_material_weight_kg =
            Number(valueInKGPerLitre) * Number(quantityProcuredLitre);
        } else {
          kpi_material_weight_kg =
            Number(materialWeightPerUnit) * Number(quantityProcuredLitre);
        }
      }
    } else if (uomGroup === "count") {
      // defaultUoM is Kilogram for mass group in capital goods quantity procured uom
      const defaultUoM = getDefaultData({
        masterKey: activityUomMasterKey,
        activityMasterData: activityMasterData || [],
        valueForDefaultValue: "mass",
      });
      // If uomGroup is "count", Convert Quantity Procured to weight using material weight per unit from org material master data and uom conversion factor

      // conversionDetails
      const conversionDetails = {
        isConversionPossible: false,
        numeratorUom: "",
        denominatorUom: "",
        reason: "",
        materialUom: "",
      };

      const material = orgMaterialMaster?.find((m) =>
        sanitize_compare_str_v4(String(m?.code), String(materialCode))
      );

      const materialMasterUOM = activityMasterData?.filter(
        (activityMaster) =>
          activityMaster?.master_key === materialMasterWeightUomKey
      );

      if (material && materialMasterUOM?.length) {
        const currentMaterialUom = materialMasterUOM?.[0]?.master_data?.filter(
          (item: TActivityMasterDataArray) =>
            sanitize_compare_str_v4(
              String(item?.value),
              String(material?.UoM_Material_Weight)
            )
        );

        if (currentMaterialUom?.length) {
          currentMaterialUom.forEach((uom: TActivityMasterDataArray) => {
            // We have to check that uom group is allowed to convert count to mass, i.e Kilogram/ea, Tonne/ea, Gram/ea,
            if (
              uom?.group?.includes("mass") &&
              uom?.group?.includes(uomGroup)
            ) {
              const numeratorUom = uom?.value?.split("/")?.[0] ?? ""; // i.e kilogram, tonne, gram
              const denominatorUom = uom?.value?.split("/")?.[1] ?? ""; // i.e nos, ea
              conversionDetails.isConversionPossible = true;
              conversionDetails.materialUom = uom?.value; // i.e kilogram/ea
              conversionDetails.numeratorUom = numeratorUom; // i.e kilogram
              conversionDetails.denominatorUom = denominatorUom; // i.e ea
            }
          });
        }
      }

      if (conversionDetails?.isConversionPossible) {
        const materialWeightPerUnit: number =
          material?.Material_Weight_Per_Unit ?? 0;

        if (
          !sanitize_compare_str_v4(conversionDetails?.numeratorUom, defaultUoM)
        ) {
          // Convert to Kilogram/Unit if numeratorUom is not kilogram
          const valueInKGPerUnit = uomConversion(
            materialWeightPerUnit,
            conversionDetails?.numeratorUom ?? "",
            defaultUoM,
            ""
          );

          kpi_material_weight_kg =
            Number(valueInKGPerUnit) * Number(quantityProcured);
        } else {
          kpi_material_weight_kg =
            Number(materialWeightPerUnit) * Number(quantityProcured);
        }
      }
    }
    return kpi_material_weight_kg;
  } catch (error) {
    return 0;
  }
};

// Implement a function that convert material weight per unit to kilogram for OrgMaterialMaster records
// Where material weight per unit uom is not in kilogram and return the converted value in kilogram

/**
 * Converts Material_Weight_Per_Unit to Kilogram
 * Handles UoM formats like "Tonne/Litre", "Gram/Nos", "Milligram/EA", etc.
 * Extracts the numerator UOM (mass part) and converts it to Kilogram
 *
 * @param materialWeightPerUnit - The material weight per unit value
 * @param uomMaterialWeight - The UOM string (e.g., "Tonne/Litre", "Gram/Nos", "Kilogram/EA")
 * @param uomConversion - UOM conversion function (from ConvertUOMGeneralised)
 * @returns Object with `value` (weight in Kilogram) and `uom` (converted UOM string e.g. "Kilogram/Litre").
 *          Returns { value: 1, uom: null } if weight is null/undefined/0 (default weight)
 *
 * @example
 * // uomMaterialWeight = "Tonne/Litre", materialWeightPerUnit = 2
 * // Converts 2 Tonne → 2000 Kilogram, returns { value: 2000, uom: "Kilogram/Litre" }
 *
 * // uomMaterialWeight = "Kilogram/Nos", materialWeightPerUnit = 5
 * // Already in Kilogram, returns { value: 5, uom: "Kilogram/Nos" }
 *
 * // materialWeightPerUnit = 0 or null
 * // Returns { value: 1, uom: null } (default weight)
 */
export const convertMaterialWeightPerUnitToKg = (
  materialWeightPerUnit: number | null | undefined,
  uomMaterialWeight: string | null | undefined,
  uomConversion: (
    value: number,
    fromUom: string,
    toUom: string,
    context: string
  ) => number | null
): { value: number; uom: string | null } => {
  try {
    // If Material_Weight_Per_Unit is null, undefined or 0, return default weight of 1
    const uom = sanitizeString.v4(String(uomMaterialWeight));
    if (!materialWeightPerUnit || materialWeightPerUnit === 0 || !uom) {
      return { value: 1, uom: null };
    }

    // Extract numerator UOM (mass part) and denominator from format like "Tonne/Litre", "Gram/Nos"
    const parts = uom.split("/");
    const numeratorUom = parts?.[0]?.trim() ?? "";
    const denominatorUom = parts?.[1]?.trim() ?? "";

    if (!numeratorUom) {
      return { value: materialWeightPerUnit, uom: uomMaterialWeight ?? null };
    }

    // Build the converted UOM string: Kilogram/original-denominator
    const convertedUom = denominatorUom
      ? `Kilogram/${denominatorUom}`
      : "Kilogram";

    // If numerator is already Kilogram, no conversion needed
    if (sanitize_compare_str_v4(numeratorUom, "Kilogram")) {
      return { value: materialWeightPerUnit, uom: convertedUom };
    }

    // Convert the numerator UOM to Kilogram
    const convertedValue = uomConversion(
      materialWeightPerUnit,
      numeratorUom,
      "Kilogram",
      ""
    );

    return {
      value: convertedValue ?? materialWeightPerUnit,
      uom: convertedUom,
    };
  } catch (error) {
    return { value: 1, uom: null };
  }
};

/**
 * Converts a procurement quantity to a standard UOM based on its group:
 * - mass → Kilogram (default mass UOM from ActivityMaster)
 * - volume → Litre (default volume UOM from ActivityMaster)
 * - count → as-is (EA, Nos are equivalent, no conversion needed)
 *
 * Uses getUomGroup and getDefaultData from ActivityMaster to determine
 * the UOM group and default conversion targets dynamically from the DB.
 *
 * @param quantity - The quantity value to convert
 * @param quantityUom - The current UOM of the quantity (e.g., "Tonne", "Kilogram", "Litre", "EA")
 * @param uomConversion - UOM conversion function (from ConvertUOMGeneralised)
 * @param activityMasterData - Activity master data array for UOM group lookup
 * @param activityUomMasterKey - The master key for UOM group classification (e.g., "transport_upstream_Material_Quantity_Procured_UOM")
 * @returns Object with `value` (converted quantity) and `uom` (standardized UOM string)
 *
 * @example
 * // quantityUom = "Tonne", quantity = 5, mass group
 * // Converts 5 Tonne → 5000 Kilogram, returns { value: 5000, uom: "Kilogram" }
 *
 * // quantityUom = "Kilolitre", quantity = 2, volume group
 * // Converts 2 Kilolitre → 2000 Litre, returns { value: 2000, uom: "Litre" }
 *
 * // quantityUom = "EA", quantity = 100, count group
 * // No conversion, returns { value: 100, uom: "EA" }
 *
 * // quantityUom = null or quantity = 0
 * // Returns { value: 0, uom: null }
 */
export const convertQuantityToStandardUom = (
  quantity: number | null | undefined,
  quantityUom: string | null | undefined,
  uomConversion: (
    value: number,
    fromUom: string,
    toUom: string,
    context: string
  ) => number | null,
  activityMasterData: TActivityMasterData[],
  activityUomMasterKey: string,
  materialMasterData: TOrgMaterialMaster[]
): { value: number; uom: string | null } => {
  try {
    const uom = String(quantityUom ?? "").trim();

    // If quantity is null/undefined/0 or no UOM, return 0
    if (!quantity || !uom) {
      return { value: 0, uom: null };
    }

    // Use getUomGroup to determine UOM group from ActivityMaster data
    const uomGroup = getUomGroup(activityMasterData, activityUomMasterKey, uom);

    if (uomGroup === "mass") {
      // Get default mass UOM (Kilogram) from ActivityMaster
      const defaultMassUom = getDefaultData({
        masterKey: activityUomMasterKey,
        activityMasterData: activityMasterData,
        valueForDefaultValue: "mass",
      });

      // If already in default UOM, no conversion needed
      if (sanitize_compare_str_v4(uom, defaultMassUom)) {
        return { value: quantity, uom: defaultMassUom };
      }

      // Convert to default mass UOM (Kilogram)
      const converted = uomConversion(quantity, uom, defaultMassUom, "");
      return { value: converted ?? quantity, uom: defaultMassUom };
    }

    if (uomGroup === "volume") {
      // Get default volume UOM (Litre) from ActivityMaster
      const defaultVolumeUom = getDefaultData({
        masterKey: activityUomMasterKey,
        activityMasterData: activityMasterData,
        valueForDefaultValue: "volume",
      });

      // If already in default UOM, no conversion needed
      if (sanitize_compare_str_v4(uom, defaultVolumeUom)) {
        return { value: quantity, uom: defaultVolumeUom };
      }

      // Convert to default volume UOM (Litre)
      const converted = uomConversion(quantity, uom, defaultVolumeUom, "");
      return { value: converted ?? quantity, uom: defaultVolumeUom };
    }

    if (uomGroup === "count") {
      const qtyUOMCount = materialMasterData.filter(
        (item) => item?.UoM_Material_Weight === uom
      )?.[0]?.UoM_Material_Weight;
      if (qtyUOMCount && sanitize_compare_str_v4(uom, String(qtyUOMCount))) {
        const qtyUOM = qtyUOMCount.split("/")[1];
        return { value: quantity, uom: String(qtyUOM) };
      } else {
        // Count-based: no conversion needed, keep as-is with original UOM
        return { value: quantity, uom: quantityUom ?? null };
      }
    }

    // Unknown UOM group — return as-is
    return { value: quantity, uom: quantityUom ?? null };
  } catch (error) {
    return { value: 0, uom: null };
  }
};
