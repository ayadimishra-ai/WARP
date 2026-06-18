/**
 * Shared Validation Interfaces for Material Master
 *
 * These interfaces are used across validation, rules, and service modules.
 */

import {
  ADDITIONAL_INFORMATION,
  MATERIAL_CLASSIFICATION,
  MATERIAL_CODE,
  MATERIAL_DESCRIPTION,
  MATERIAL_NAME,
  MATERIAL_TYPE,
  MATERIAL_WEIGHT,
  UOM_MATERIAL_WEIGHT,
} from "~/shared/constants/material-master-activity.constant";
import type { IMaterialActivityMapping } from "./material-activity-mapping.service";
import type { IOrgMaterialMaster } from "./material-master-excel.service";

/**
 * Validation Context - Shared state across validation process
 * Contains cached data and accumulates notifications during validation
 */
export interface IValidationContext {
  existingMaterials: Map<string, IOrgMaterialMaster>;
  activityMappings: Map<string, IMaterialActivityMapping>;
  uomMismatches: IUoMMismatch[];
  missingWeightNotifications: IMissingWeightNotification[];
  /** Activity master data for UoM category resolution (optional, loaded when needed) */
  activityMasterData?: import("~//lib/excel/excel.service").TActivityMasterData[];
  /** Activity UoM master key for category lookup (e.g., "transport_upstream_Material_Quantity_Procured_UOM") */
  activityUomMasterKey?: string;
}

/**
 * UoM Mismatch Notification
 * Triggered when user updates UoM to value different from activity data
 */
export interface IUoMMismatch {
  materialCode: string;
  materialName: string;
  oldUom: string;
  newUom: string;
  affectedActivities: string[]; // Activity types where material is used
}

/**
 * Missing Weight Notification
 * Triggered when Capital Goods material created without weight
 */
export interface IMissingWeightNotification {
  materialCode: string;
  materialName: string;
  materialType: string;
}

/**
 * Emission Reset Summary
 * Tracks activity records affected by UoM mismatch and emission reset operation
 */
export interface IEmissionResetSummary {
  totalRecordsAffected: number;
  capitalGoods: number;
  materialProcurement: number;
  transportUpstream: number;
  materialCodes: string[];
}

/**
 * Map DB record to Excel column format
 *
 * Converts database field names to Excel column names for consistent comparison.
 * This ensures isFieldUpdated() comparisons work correctly.
 *
 * @param dbRecord - Database record from OrgMaterialMaster table
 * @returns Object with Excel column names as keys
 */
export function mapDBRecordToExcelFormat(
  dbRecord: IOrgMaterialMaster
): Record<string, any> {
  return {
    [MATERIAL_CODE]: dbRecord.code,
    [MATERIAL_NAME]: dbRecord.name,
    [MATERIAL_TYPE]: dbRecord.type,
    [MATERIAL_WEIGHT]: dbRecord.Material_Weight_Per_Unit,
    [UOM_MATERIAL_WEIGHT]: dbRecord.UoM_Material_Weight,
    [MATERIAL_CLASSIFICATION]: dbRecord.Material_Classification,
    [MATERIAL_DESCRIPTION]: dbRecord.Material_Description,
    [ADDITIONAL_INFORMATION]: dbRecord.Additional_Information,
  };
}

// Re-export for convenience
export type { IMaterialActivityMapping, IOrgMaterialMaster };
