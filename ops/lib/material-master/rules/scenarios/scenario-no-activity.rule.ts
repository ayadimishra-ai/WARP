/**
 * Scenario A: No Activity Data
 * 
 * APPLIES WHEN:
 * - Material has NO activity data in any GHG activity tables
 * 
 * RULES:
 * - All fields updatable EXCEPT Material Code (immutable)
 * - No restrictions on Material Type or Material Name updates
 * - No notifications required
 * 
 * EXAMPLES:
 * - New material being inserted for first time
 * - Existing material never used in any activity
 */

import type {
  IMaterialActivityMapping,
  IValidationContext,
} from "~/lib/material-master/validation.interfaces";
import {
  MATERIAL_CODE,
  MATERIAL_TYPE,
} from "~/shared/constants/material-master-activity.constant";
import {
  MaterialMasterScenarioRule,
  type IScenarioRuleResult,
} from "../base-scenario-rule";
import {
  WEIGHT_REQUIRED_TYPES
} from "../material-master-rules.config";

export class ScenarioNoActivityRule extends MaterialMasterScenarioRule {
  constructor() {
    super("SCENARIO_A");
  }

  /**
   * Scenario A applies when material has NO activity data
   */
  applies(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined
  ): boolean {
    // Applies when there is NO activity data
    return !this.hasActivityData(activityMapping);
  }

  /**
   * Validate Scenario A: Check insert-specific constraints
   */
  async validate(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined,
    validationContext: IValidationContext
  ): Promise<IScenarioRuleResult> {
    const errors: any[] = [];
    const missingWeights: string[] = [];

    // For INSERT operations: Check if weight-required material types without weight
    if (!existingMaterial) {
      const materialType = rowData[MATERIAL_TYPE];
      const materialWeight = rowData["Material Weight"];

      // If it's a weight-required type and no weight provided, add to notification
      if (
        WEIGHT_REQUIRED_TYPES.includes(materialType) &&
        (!materialWeight || materialWeight === "")
      ) {
        missingWeights.push(materialCode);
      }
    }

    // For UPDATE operations: Material Code is immutable (enforced by FIELD_CATEGORIES)
    if (existingMaterial) {
      const isCodeUpdated = this.isFieldUpdated(
        MATERIAL_CODE,
        rowData,
        existingMaterial
      );

      if (isCodeUpdated) {
        errors.push(
          this.createError(
            materialCode,
            MATERIAL_CODE,
            "Material Code cannot be updated (immutable field)"
          )
        );
      }
    }

    return {
      errors,
      notifications:
        missingWeights.length > 0 ? { missingWeights } : undefined,
    };
  }

  /**
   * All fields updatable except Material Code
   */
  getAllowedUpdates(): string[] {
    // All fields except immutable ones
    return [
      "Material Name",
      "Material Type",
      "Material Weight",
      "UoM of Material Weight",
      "Material Classification",
      "Material Description",
      "Additional Information",
    ];
  }

  /**
   * Only Material Code is blocked (immutable)
   */
  getBlockedUpdates(): string[] {
    return [MATERIAL_CODE];
  }
}
