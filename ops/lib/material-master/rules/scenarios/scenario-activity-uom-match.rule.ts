/**
 * Scenario B: Activity Data with UoM Match
 * 
 * APPLIES WHEN:
 * - Material has activity data in GHG activity tables
 * - If UoM is being updated: New UoM MATCHES UoM(s) in activity tables
 * - OR: UoM is NOT being updated at all
 * 
 * RULES:
 * - Material Type: BLOCKED (cannot update)
 * - Material Name: BLOCKED (cannot update)
 * - Always-updatable fields: ALLOWED (Weight, UoM, Classification, Description, Additional Info)
 * - Material Code: BLOCKED (immutable in all scenarios)
 * 
 * EXAMPLES:
 * - Material with UoM "kg" in activity → User uploads UoM "kg" (match)
 * - Material in activity → User only updates Weight/Description (no UoM change)
 */

import type {
    IMaterialActivityMapping,
    IValidationContext,
} from "~/lib/material-master/validation.interfaces";
import {
    MATERIAL_CODE,
    UOM_MATERIAL_WEIGHT
} from "~/shared/constants/material-master-activity.constant";
import { sanitizeString } from "~/utils/sanitize.util";
import {
    MaterialMasterScenarioRule,
    type IScenarioRuleResult,
} from "../base-scenario-rule";
import {
    SCENARIOS
} from "../material-master-rules.config";

export class ScenarioActivityUoMMatchRule extends MaterialMasterScenarioRule {
  constructor() {
    super("SCENARIO_B");
  }

  /**
   * Scenario B applies when:
   * 1. Material has activity data
   * 2. UoM is NOT being updated OR new UoM MATCHES activity UoM(s)
   */
  applies(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined
  ): boolean {
    // Must have activity data
    if (!this.hasActivityData(activityMapping)) return false;

    // Must be an update operation
    if (!existingMaterial) return false;

    // Check if UoM is being updated
    const isUoMUpdated = this.isFieldUpdated(
      UOM_MATERIAL_WEIGHT,
      rowData,
      existingMaterial
    );

    // Case 1: UoM NOT being updated → Scenario B
    if (!isUoMUpdated) return true;

    // Case 2: UoM IS being updated → Check if it matches activity UoMs
    const newUoM = sanitizeString.v1(rowData[UOM_MATERIAL_WEIGHT] || "");
    const activityUoMs =
      activityMapping?.uomInActivity?.map((uom: string) =>
        sanitizeString.v1(uom || "")
      ) || [];

    // Scenario B: New UoM MATCHES at least one activity UoM
    return activityUoMs.length > 0 && activityUoMs.includes(newUoM);
  }

  /**
   * Validate Scenario B: Block activity-restricted fields
   */
  async validate(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined,
    validationContext: IValidationContext
  ): Promise<IScenarioRuleResult> {
    const errors: any[] = [];

    // Enforce blocks on Material Type and Material Name
    const blockedFields = this.getBlockedUpdates();

    for (const fieldName of blockedFields) {
      if (this.isFieldUpdated(fieldName, rowData, existingMaterial)) {
        const errorMessage =
          fieldName === MATERIAL_CODE
            ? `${fieldName} cannot be updated (immutable field)`
            : `${fieldName} cannot be updated when material is used in activity data`;

        errors.push(this.createError(materialCode, fieldName, errorMessage));
      }
    }

    return {
      errors,
      notifications: undefined, // No notifications for Scenario B
    };
  }

  /**
   * Only always-updatable fields allowed
   */
  getAllowedUpdates(): string[] {
    return [...SCENARIOS.SCENARIO_B.allowedUpdates];
  }

  /**
   * Immutable + Activity-restricted fields blocked
   */
  getBlockedUpdates(): string[] {
    return [...SCENARIOS.SCENARIO_B.blockedUpdates];
  }
}
