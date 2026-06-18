/**
 * Scenario E: Master UoM Category Change — Blocked
 *
 * APPLIES WHEN:
 * - Material has activity data uploaded
 * - Existing Material Master UoM is already set (non-null, non-empty)
 * - User attempts to update UoM of Material Weight
 * - New UoM is in a DIFFERENT category from the existing UoM
 *
 * EXCEPTION:
 * - If Material Master was generated via "ease of master data" (weight = 0/null, UoM = null/empty),
 *   this scenario does NOT apply. The update falls through to Scenario C for standard handling.
 *
 * RULES:
 * - UoM category change: REJECTED (hard error)
 * - Error message: 'Cannot change UoM category for {code} from {oldCategory} to {newCategory}.
 *   Existing activity data uploaded with {oldCategory} UoM.'
 * - Other always-updatable fields (except UoM) can still be updated
 * - Activity-restricted fields (Type, Name) remain blocked
 *
 * PRIORITY:
 * - Checked AFTER Scenario D (Type update blocked) but BEFORE Scenario C (UoM mismatch)
 *
 * EXAMPLES:
 * - M004 has volume-based activity (Liter) → User uploads UoM "EA" (count) → BLOCKED
 * - M004 has mass-based activity (kg) → User uploads UoM "Liter" (volume) → BLOCKED
 * - M004 auto-generated with UoM=null → User uploads UoM "EA" → NOT BLOCKED (falls to Scenario C)
 */

import type {
  IMaterialActivityMapping,
  IValidationContext,
} from "@/modules/ghg/lib/material-master/validation.interfaces";
import {
  MATERIAL_CODE,
  MATERIAL_NAME,
  MATERIAL_TYPE,
  UOM_MATERIAL_WEIGHT,
} from "@/modules/ghg/shared/constants/material-master-activity.constant";
import {
  MaterialMasterScenarioRule,
  type IScenarioRuleResult,
} from "../base-scenario-rule";
import { SCENARIOS } from "../material-master-rules.config";
import {
  getMaterialMasterUoMCategory,
} from "@/modules/ghg/lib/uom-category";

export class ScenarioUoMCategoryChangeBlockedRule extends MaterialMasterScenarioRule {
  constructor() {
    super("SCENARIO_E");
  }

  /**
   * Scenario E applies when:
   * 1. Material has activity data
   * 2. Existing material UoM is already set (non-null, non-empty)
   * 3. UoM is being updated
   *
   * Does NOT apply when:
   * - Existing UoM is null/empty (ease of master data auto-generation)
   * - Weight is 0/null AND UoM is null/empty (ease of master data)
   */
  applies(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined
  ): boolean {
    // Must have activity data
    if (!this.hasActivityData(activityMapping)) return false;

    // Must be an update operation (not insert)
    if (!existingMaterial) return false;

    // Check if existing material UoM is set (non-null, non-empty)
    const existingUoM = existingMaterial[UOM_MATERIAL_WEIGHT];
    if (!existingUoM || String(existingUoM).trim() === "") return false;

    // Check if UoM is being updated
    const isUoMUpdated = this.isFieldUpdated(
      UOM_MATERIAL_WEIGHT,
      rowData,
      existingMaterial
    );
    if (!isUoMUpdated) return false;

    // This scenario applies — validate() will determine if category actually changed
    return true;
  }

  /**
   * Validate Scenario E: Block UoM category change with detailed error.
   * If categories are the same (within-category change), allow with UoM mismatch notification.
   */
  async validate(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined,
    validationContext: IValidationContext
  ): Promise<IScenarioRuleResult> {
    const errors: any[] = [];
    const uomMismatches: any[] = [];

    const oldUoM = existingMaterial?.[UOM_MATERIAL_WEIGHT] || "";
    const newUoM = rowData[UOM_MATERIAL_WEIGHT] || "";

    // Determine categories using multiple master keys for better resolution
    const masterKeys = [
      validationContext.activityUomMasterKey ?? "transport_upstream_Material_Quantity_Procured_UOM",
      "material_master_material_weight_uom",
      "capital_goods_quantity_procured_uom",
    ];

    let oldCategory = this.resolveCategory(
      validationContext.activityMasterData ?? [],
      masterKeys,
      oldUoM
    );
    let newCategory = this.resolveCategory(
      validationContext.activityMasterData ?? [],
      masterKeys,
      newUoM
    );

    // If categories differ, block the change
    if (oldCategory && newCategory && oldCategory !== newCategory) {
      errors.push(
        this.createError(
          materialCode,
          UOM_MATERIAL_WEIGHT,
          // `Cannot change UoM category for ${materialCode} from ${oldCategory}-based to ${newCategory}-based. Existing activity data uploaded with ${oldCategory}-based UoM.`
          `Cannot update UoM category for material ${materialCode} from ${oldCategory}-based to ${newCategory}-based. Existing activity data is uploaded in ${oldCategory}-based UoM which is incompatible. Please remove or correct the existing activity data first.`
        )
      );
    } else if (!oldCategory || !newCategory) {
      // If we cannot determine categories but the UoM values differ and activity data exists,
      // block as a safety measure
      errors.push(
        this.createError(
          materialCode,
          UOM_MATERIAL_WEIGHT,
          `Cannot change UoM for ${materialCode}. Existing activity data has been uploaded with UoM '${oldUoM}'. Please remove or correct the existing activity data first.`
        )
      );
    } else {
      // Same category (e.g., kg → ton) — allowed with UoM mismatch notification
      const materialName =
        rowData["MaterialName"] || existingMaterial?.["name"] || "";
      const affectedActivities =
        this.getAffectedActivities(activityMapping) || [];

      uomMismatches.push({
        materialCode,
        materialName,
        oldUom: oldUoM,
        newUom: newUoM,
        affectedActivities,
      });
    }

    // Also enforce activity-restricted field blocks
    if (this.isFieldUpdated(MATERIAL_TYPE, rowData, existingMaterial)) {
      errors.push(
        this.createError(
          materialCode,
          MATERIAL_TYPE,
          `${MATERIAL_TYPE} cannot be updated when material is used in activity data`
        )
      );
    }

    if (this.isFieldUpdated(MATERIAL_NAME, rowData, existingMaterial)) {
      errors.push(
        this.createError(
          materialCode,
          MATERIAL_NAME,
          `${MATERIAL_NAME} cannot be updated when material is used in activity data`
        )
      );
    }

    if (this.isFieldUpdated(MATERIAL_CODE, rowData, existingMaterial)) {
      errors.push(
        this.createError(
          materialCode,
          MATERIAL_CODE,
          `${MATERIAL_CODE} cannot be updated (immutable field)`
        )
      );
    }

    return {
      errors,
      notifications:
        uomMismatches.length > 0 ? { uomMismatches } : undefined,
    };
  }

  /**
   * Resolve UoM category by trying multiple master keys
   */
  private resolveCategory(
    activityMasterData: any[],
    masterKeys: string[],
    uomValue: string
  ): import("@/modules/ghg/lib/uom-category").UoMCategory | null {
    for (const key of masterKeys) {
      const category = getMaterialMasterUoMCategory(
        activityMasterData,
        key,
        uomValue
      );
      if (category) return category;
    }
    return null;
  }

  /**
   * UoM is blocked in this scenario; other always-updatable fields allowed
   */
  getAllowedUpdates(): string[] {
    return [...SCENARIOS.SCENARIO_E.allowedUpdates];
  }

  /**
   * UoM, Type, Name, Code are all blocked
   */
  getBlockedUpdates(): string[] {
    return [...SCENARIOS.SCENARIO_E.blockedUpdates];
  }
}
