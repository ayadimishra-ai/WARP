/**
 * Material Master Business Rules Configuration
 * 
 * Central registry for all business rules, scenarios, and constraints.
 * This file defines the "what" - individual rule files define the "how".
 */

import { ADDITIONAL_INFORMATION, MATERIAL_CLASSIFICATION, MATERIAL_CODE, MATERIAL_DESCRIPTION, MATERIAL_NAME, MATERIAL_TYPE, MATERIAL_WEIGHT, UOM_MATERIAL_WEIGHT } from "@/modules/ghg/shared/constants/material-master-activity.constant";

/**
 * Field categories for update permissions
 */
export const FIELD_CATEGORIES = {
  // Always immutable (cannot be changed after creation)
  IMMUTABLE: [MATERIAL_CODE],
  
  // Updatable only when no activity data exists (Scenario A)
  ACTIVITY_RESTRICTED: [MATERIAL_TYPE, MATERIAL_NAME],
  
  // Always updatable (even with activity data)
  ALWAYS_UPDATABLE: [
    MATERIAL_WEIGHT,
    UOM_MATERIAL_WEIGHT,
    MATERIAL_CLASSIFICATION,
    MATERIAL_DESCRIPTION,
    ADDITIONAL_INFORMATION
  ],
} as const;

/**
 * Material types that require weight notification when missing
 * 
 * BASE REQUIREMENT (DO NOT REMOVE):
 * - "Capital Goods": Explicitly required per requirements document for GHGCapital_Goods emission calculations
 * 
 * ADDITIONAL TYPES (Can be removed if requirements change):
 * - Other material types are included because they may be used in weight-based emission activities:
 *   - GHGMaterialProcurement (Raw material, Packaging material, Semi-Finished Goods)
 *   - GHGTransport_Upstream (all material types)
 * - To revert to base requirement only, remove all types except "Capital Goods"
 */
export const WEIGHT_REQUIRED_TYPES = [
  // Base requirement - DO NOT REMOVE
  "Capital Goods",
  
  // Additional types - can be removed if business requirements change
  "Raw material",
  "Packaging material", 
  "Semi-Finished Goods",
  "Finished Goods",
  "Waste",
] as const;

/**
 * Activity tables checked for material usage
 */
export const ACTIVITY_TABLES = {
  CAPITAL_GOODS: "GHGCapital_Goods",
  MATERIAL_PROCUREMENT: "GHGMaterialProcurement",
  UPSTREAM_TRANSPORT: "GHGTransport_Upstream",
  PRODUCT_SHARE: "GHGProductShareAttribution",
} as const;

/**
 * Validation constraints
 */
export const CONSTRAINTS = {
  MAX_ROWS: 10000,
  MAX_FIELD_LENGTH: {
    MATERIAL_NAME: 500,
    MATERIAL_CODE: 500,
    MATERIAL_CLASSIFICATION: 500,
    MATERIAL_DESCRIPTION: 4000,
    ADDITIONAL_INFORMATION: 4000,
  },
  MAX_DECIMAL_PLACES: {
    MATERIAL_WEIGHT: 4,
  },
} as const;

/**
 * Scenario definitions
 */
export const SCENARIOS = {
  // Scenario A: No activity data - full update freedom
  SCENARIO_A: {
    name: "Scenario A",
    description: "No activity data linked to material",
    allowedUpdates: [
      MATERIAL_WEIGHT,
      UOM_MATERIAL_WEIGHT,
      MATERIAL_CLASSIFICATION,
      MATERIAL_DESCRIPTION,
      ADDITIONAL_INFORMATION,
      MATERIAL_TYPE,
      MATERIAL_NAME,
    ],
    blockedUpdates: [MATERIAL_CODE],
    requiresNotification: false,
  },
  
  // Scenario B: Activity data exists, UoM matches - restricted updates
  SCENARIO_B: {
    name: "Scenario B",
    description: "Activity data exists, UoM matches",
    allowedUpdates: [
      MATERIAL_WEIGHT,
      UOM_MATERIAL_WEIGHT,
      MATERIAL_CLASSIFICATION,
      MATERIAL_DESCRIPTION,
      ADDITIONAL_INFORMATION,
    ],
    blockedUpdates: [MATERIAL_CODE, MATERIAL_TYPE, MATERIAL_NAME],
    requiresNotification: false,
  },
  
  // Scenario C: UoM mismatch - update allowed with notification
  SCENARIO_C: {
    name: "Scenario C",
    description: "Activity data exists, UoM differs (Master as source of truth)",
    allowedUpdates: [
      MATERIAL_WEIGHT,
      UOM_MATERIAL_WEIGHT,
      MATERIAL_CLASSIFICATION,
      MATERIAL_DESCRIPTION,
      ADDITIONAL_INFORMATION,
    ],
    blockedUpdates: [MATERIAL_CODE, MATERIAL_TYPE, MATERIAL_NAME],
    requiresNotification: true,
  },
  
  // Scenario D: Material Type update attempt - blocked with error
  SCENARIO_D: {
    name: "Scenario D",
    description: "Attempt to update Material Type when activity data exists",
    allowedUpdates: [
      MATERIAL_WEIGHT,
      UOM_MATERIAL_WEIGHT,
      MATERIAL_CLASSIFICATION,
      MATERIAL_DESCRIPTION,
      ADDITIONAL_INFORMATION,
    ],
    blockedUpdates: [MATERIAL_CODE, MATERIAL_TYPE, MATERIAL_NAME],
    requiresNotification: false,
  },

  // Scenario E: UoM Category Change blocked when activity data uploaded with existing UoM
  SCENARIO_E: {
    name: "Scenario E",
    description:
      "UoM category change blocked — activity data uploaded with existing UoM set",
    allowedUpdates: [
      MATERIAL_WEIGHT,
      MATERIAL_CLASSIFICATION,
      MATERIAL_DESCRIPTION,
      ADDITIONAL_INFORMATION,
    ],
    blockedUpdates: [MATERIAL_CODE, MATERIAL_TYPE, MATERIAL_NAME, UOM_MATERIAL_WEIGHT],
    requiresNotification: false,
  },
} as const;
