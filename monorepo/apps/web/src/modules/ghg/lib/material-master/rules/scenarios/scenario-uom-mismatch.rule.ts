/**
 * Scenario C: UoM Mismatch with Activity Data
 * 
 * APPLIES WHEN:
 * - Material has activity data
 * - User attempts to update UoM of Material Weight
 * - New UoM differs from UoM(s) used in activity tables
 * 
 * RULES:
 * - Update is ALLOWED only if UoM category change is compatible:
 *   - Mass → Any: Allowed
 *   - Count → Mass/Count: Allowed
 *   - Volume → Mass/Volume: Allowed
 *   - Count ↔ Volume: BLOCKED (hard error)
 * - NOTIFICATION generated to alert user about UoM change impact
 * - Notification includes: old UoM, new UoM, affected activity tables
 * - All always-updatable fields can still be updated
 * - Activity-restricted fields (Type, Name) remain blocked
 * 
 * EXAMPLES:
 * - Material with UoM "kg" in Capital Goods → User uploads UoM "ton" → ALLOWED (same group)
 * - Material with UoM "Kilogram/litre" → User uploads UoM "Kilogram/EA" → BLOCKED (Volume→Count)
 */

import type {
  IMaterialActivityMapping,
  IValidationContext,
} from "@/modules/ghg/lib/material-master/validation.interfaces";
import {
  UOM_MATERIAL_WEIGHT
} from "@/modules/ghg/shared/constants/material-master-activity.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import {
  MaterialMasterScenarioRule,
  type IScenarioRuleResult,
} from "../base-scenario-rule";
import {
  SCENARIOS
} from "../material-master-rules.config";
import {
  validateMaterialMasterUoMChange,
  getMaterialMasterUoMCategory,
} from "@/modules/ghg/lib/uom-category";

export class ScenarioUoMMismatchRule extends MaterialMasterScenarioRule {
  constructor() {
    super("SCENARIO_C");
  }

  /**
   * Scenario C applies when:
   * 1. Material has activity data
   * 2. UoM is being updated
   * 3. New UoM differs from activity UoM(s)
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

    // Check if UoM is being updated
    const isUoMUpdated = this.isFieldUpdated(
      UOM_MATERIAL_WEIGHT,
      rowData,
      existingMaterial
    );

    if (!isUoMUpdated) return false;

    // Check if new UoM differs from activity UoMs
    const newUoM = sanitizeString.v1(rowData[UOM_MATERIAL_WEIGHT] || "");
    const activityUoMs =
      activityMapping?.uomInActivity?.map((uom: string) =>
        sanitizeString.v1(uom || "")
      ) || [];

    // Scenario C: New UoM is DIFFERENT from activity UoMs
    return activityUoMs.length > 0 && !activityUoMs.includes(newUoM);
  }

  /**
   * Validate Scenario C: Generate UoM mismatch notification and enforce category change rules
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

    // Enforce activity-restricted field blocks
    const blockedFields = this.getBlockedUpdates();

    for (const fieldName of blockedFields) {
      if (this.isFieldUpdated(fieldName, rowData, existingMaterial)) {
        errors.push(
          this.createError(
            materialCode,
            fieldName,
            `${fieldName} cannot be updated when material is used in activity data`
          )
        );
      }
    }

    // Validate UoM category change compatibility
    const oldUoM = existingMaterial?.[UOM_MATERIAL_WEIGHT] || "";
    const newUoM = rowData[UOM_MATERIAL_WEIGHT] || "";

    // Determine categories from the UoM strings (Material Master format: "Kilogram/litre", "Tonne/EA")
    const oldCategory = getMaterialMasterUoMCategory(
      validationContext.activityMasterData ?? [],
      validationContext.activityUomMasterKey ?? "transport_upstream_Material_Quantity_Procured_UOM",
      oldUoM
    );
    const newCategory = getMaterialMasterUoMCategory(
      validationContext.activityMasterData ?? [],
      validationContext.activityUomMasterKey ?? "transport_upstream_Material_Quantity_Procured_UOM",
      newUoM
    );

    // Check if category change is allowed
    const categoryChangeResult = validateMaterialMasterUoMChange(
      oldCategory,
      newCategory
    );

    if (categoryChangeResult.status === "error") {
      errors.push(
        this.createError(
          materialCode,
          UOM_MATERIAL_WEIGHT,
          `Cannot update UoM category for material '${materialCode}' from '${oldCategory}' to '${newCategory}'. ${categoryChangeResult.reason} Please remove or correct the existing activity data first.`
        )
      );
    }

    // Track UoM mismatch for notification (only if no category block error)
    if (categoryChangeResult.status !== "error") {
      const materialName = rowData["MaterialName"] || existingMaterial?.["name"] || "";
      const affectedActivities = this.getAffectedActivities(activityMapping) || [];

      uomMismatches.push({
        materialCode,
        materialName,
        oldUom: oldUoM,
        newUom: newUoM,
        affectedActivities,
      });
    }

    return {
      errors,
      notifications:
        uomMismatches.length > 0 ? { uomMismatches } : undefined,
    };
  }

  /**
   * Only always-updatable fields allowed (UoM update is allowed)
   */
  getAllowedUpdates(): string[] {
    return [...SCENARIOS.SCENARIO_C.allowedUpdates];
  }

  /**
   * Activity-restricted fields blocked (Type, Name)
   */
  getBlockedUpdates(): string[] {
    return [...SCENARIOS.SCENARIO_C.blockedUpdates];
  }
}
