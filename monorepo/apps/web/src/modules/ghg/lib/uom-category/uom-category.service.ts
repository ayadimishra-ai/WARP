/**
 * UoM Category Service
 *
 * Centralized service for UoM category resolution and compatibility checks.
 * Provides utilities used by bulk upload validation, material master updates,
 * and emission calculation modules.
 */

import { getUomGroup } from "@/modules/ghg/lib/material-conversion/material-conversion.service";
import { TActivityMasterData } from "@/modules/ghg/lib/excel/excel.service";
import {
  UOM_CATEGORIES,
  UOM_CATEGORY_COMPATIBILITY,
  MATERIAL_MASTER_UOM_CHANGE_RULES,
  type UoMCategory,
} from "./uom-category.constants";
import { sanitizeString } from "../../utils/sanitize.util";

export type { UoMCategory };

export { UOM_CATEGORIES, UOM_CATEGORY_COMPATIBILITY, MATERIAL_MASTER_UOM_CHANGE_RULES };

/**
 * Validation result types for UoM compatibility checks
 */
export type UoMValidationResult =
  | { status: "pass" }
  | { status: "warning"; reason: string }
  | { status: "error"; reason: string };

/**
 * Gets the UoM category for a given UoM value using activity master data.
 *
 * @param activityMasterData - Activity master data array
 * @param activityMasterKey - The master key for the UoM lookup
 * @param uomValue - The UoM value (e.g., "Kilogram", "Litre", "EA")
 * @returns The UoM category or null if not found
 */
export const getUoMCategory = (
  activityMasterData: TActivityMasterData[],
  activityMasterKey: string,
  uomValue: string
): UoMCategory | null => {
  const group = getUomGroup(activityMasterData, activityMasterKey, uomValue);
  if (!group) return null;

  // Normalize the group string to our category type
  const normalized = group.toLowerCase().trim();
  if (normalized === UOM_CATEGORIES.MASS) return UOM_CATEGORIES.MASS;
  if (normalized === UOM_CATEGORIES.COUNT) return UOM_CATEGORIES.COUNT;
  if (normalized === UOM_CATEGORIES.VOLUME) return UOM_CATEGORIES.VOLUME;

  return null;
};

/**
 * Checks if the uploaded UoM category is compatible with the master UoM category.
 *
 * Implements the following rules:
 * - Rule A: Mass always allowed (PASS)
 * - Rule B: Same category or compatible category (PASS)
 * - Rule C: Volume ↔ Count mismatch (HARD ERROR)
 * - Mismatch but allowed category: WARNING
 *
 * @param uploadCategory - UoM category from the uploaded file
 * @param masterCategory - UoM category from the material master
 * @returns UoMValidationResult indicating pass, warning, or error
 */
export const validateUoMCategoryCompatibility = (
  uploadCategory: UoMCategory | null,
  masterCategory: UoMCategory | null,
  masterDataCategory: UoMCategory | null
): UoMValidationResult => {
  // If either category is null (cannot determine), pass with no enforcement
  if (!uploadCategory || !masterCategory) {
    return { status: "pass" };
  }

  // Rule A: Mass-based upload UoM is always allowed
  if (uploadCategory === UOM_CATEGORIES.MASS) {
    return { status: "pass" };
  }

  // Rule B: Same category is always compatible
  if (uploadCategory === masterCategory) {
    return { status: "pass" };
  }

  // Rule B extension: If master category is Mass, all uploads are compatible
  if (masterCategory === UOM_CATEGORIES.MASS) {
    return {
      status: "warning",
      reason: `Upload UoM is '${uploadCategory}' but master UoM is '${masterCategory}'. Accepted with warning.`,
    };
  }

  // Rule C: Check incompatible cross-category (Volume ↔ Count)
  const compatible = UOM_CATEGORY_COMPATIBILITY[uploadCategory];
  if (
  masterDataCategory &&
  masterDataCategory !== "mass" &&
  sanitizeString.v4(uploadCategory) === sanitizeString.v4(masterDataCategory)
  ) {
    return {
      status: "pass",
    };
  }else {
    if (!compatible.includes(masterCategory)) {
      return {
        status: "error",
        reason: `UoM category '${uploadCategory}' is incompatible with master UoM category '${masterCategory}'. Volume and count-based UoMs cannot coexist.`,
      };
    }
  }

  // Mismatch but allowed category → Warning
  return {
    status: "warning",
    reason: `Upload UoM category '${uploadCategory}' differs from master UoM category '${masterCategory}'. Accepted with warning.`,
  };
};

/**
 * Validates whether a Material Master UoM category change is allowed.
 *
 * Rules:
 * - Mass → Any: Allowed
 * - Count → Mass/Count: Allowed
 * - Volume → Mass/Volume: Allowed
 * - Count ↔ Volume: Blocked
 *
 * @param currentCategory - Current UoM category on the material master
 * @param newCategory - Proposed new UoM category
 * @returns UoMValidationResult
 */
export const validateMaterialMasterUoMChange = (
  currentCategory: UoMCategory | null,
  newCategory: UoMCategory | null
): UoMValidationResult => {
  // If either is null, allow the change (cannot determine)
  if (!currentCategory || !newCategory) {
    return { status: "pass" };
  }

  // Same category is always allowed
  if (currentCategory === newCategory) {
    return { status: "pass" };
  }

  const allowedTargets = MATERIAL_MASTER_UOM_CHANGE_RULES[currentCategory];
  if (allowedTargets.includes(newCategory)) {
    return { status: "pass" };
  }

  return {
    status: "error",
    reason: `Cannot update UoM category from '${currentCategory}' to '${newCategory}'. Existing activity data uses '${currentCategory}' UoM which is incompatible with '${newCategory}'.`,
  };
};

/**
 * Determines the UoM category from a Material Master weight UoM string.
 *
 * Handles two formats:
 * 1. Compound format: "Kilogram/litre", "Tonne/EA", "Gram/Nos"
 *    → The denominator indicates the category: litre→volume, EA/Nos→count
 * 2. Simple format: "EA", "Litre", "Kilogram"
 *    → The value itself is looked up directly in activity master data
 *
 * @param activityMasterData - Activity master data
 * @param activityMasterKey - The master key for UoM lookup (typically the procurement UoM key)
 * @param materialWeightUom - The material weight UoM string (e.g., "Kilogram/litre" or "EA")
 * @returns The UoM category, or null if not found
 */
export const getMaterialMasterUoMCategory = (
  activityMasterData: TActivityMasterData[],
  activityMasterKey: string,
  materialWeightUom: string | null | undefined
): UoMCategory | null => {
  if (!materialWeightUom) return null;

  // Extract denominator from format "Numerator/Denominator" (e.g., "Kilogram/litre" → "litre")
  const parts = materialWeightUom.split("/");
  const denominator = parts?.[1]?.trim();

  if (!denominator) {
    // No slash — simple UoM value (e.g., "EA", "Litre", "Kilogram")
    // Look up the value directly in the activity master data
    const directCategory = getUoMCategory(
      activityMasterData,
      activityMasterKey,
      parts[0].trim()
    );
    return directCategory;
  }

  // Use the activity master data to determine the group of the denominator
  return getUoMCategory(activityMasterData, activityMasterKey, denominator);
};
