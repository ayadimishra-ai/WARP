/**
 * Material Master Rule Engine
 *
 * Central orchestrator for Material Master validation rules.
 * Detects applicable scenarios and executes validation logic.
 *
 * SCENARIO PRIORITY:
 * 1. Scenario D (Type Update Blocked) - Highest priority, checked first
 * 2. Scenario E (UoM Category Change Blocked) - Activity data + existing UoM set + category change
 * 3. Scenario C (UoM Mismatch) - Activity data + UoM mismatch (within same category or ease of master data)
 * 4. Scenario B (Activity + UoM Match) - Activity data + UoM match or no UoM change
 * 5. Scenario A (No Activity) - Default case, no activity data
 */

import type {
  IMaterialActivityMapping,
  IValidationContext,
} from "~/lib/material-master/validation.interfaces";
import type {
  IScenarioRuleResult,
  MaterialMasterScenarioRule,
} from "./base-scenario-rule";
import { ScenarioActivityUoMMatchRule } from "./scenarios/scenario-activity-uom-match.rule";
import { ScenarioNoActivityRule } from "./scenarios/scenario-no-activity.rule";
import { ScenarioTypeUpdateBlockedRule } from "./scenarios/scenario-type-update-blocked.rule";
import { ScenarioUoMCategoryChangeBlockedRule } from "./scenarios/scenario-uom-category-change-blocked.rule";
import { ScenarioUoMMismatchRule } from "./scenarios/scenario-uom-mismatch.rule";

/**
 * Rule Engine for Material Master Validation
 */
export class MaterialMasterRuleEngine {
  private rules: MaterialMasterScenarioRule[];

  constructor() {
    // Register scenario rules in priority order
    this.rules = [
      new ScenarioTypeUpdateBlockedRule(), // D: Check Type update first
      new ScenarioUoMCategoryChangeBlockedRule(), // E: UoM category change blocked (activity data + existing UoM set)
      new ScenarioUoMMismatchRule(), // C: Check UoM mismatch
      new ScenarioActivityUoMMatchRule(), // B: Activity + UoM match
      new ScenarioNoActivityRule(), // A: Default case
    ];
  }

  /**
   * Detect which scenario rule applies to this material
   *
   * @param materialCode - Material code being validated
   * @param rowData - Incoming Excel row data
   * @param existingMaterial - Existing material record (if update)
   * @param activityMapping - Activity usage data
   * @returns Applicable scenario rule (guaranteed to find one - Scenario A is default)
   */
  detectScenario(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined
  ): MaterialMasterScenarioRule {
    // Try each rule in priority order
    for (const rule of this.rules) {
      if (
        rule.applies(materialCode, rowData, existingMaterial, activityMapping)
      ) {
        return rule;
      }
    }

    // Should never reach here (Scenario A is catch-all)
    throw new Error(
      `No applicable scenario found for material: ${materialCode}`
    );
  }

  /**
   * Execute validation for a single material row
   *
   * @param materialCode - Material code being validated
   * @param rowData - Incoming Excel row data (validated fields)
   * @param existingMaterial - Existing material record (if update)
   * @param activityMapping - Activity usage data
   * @param validationContext - Full validation context
   * @returns Validation result with errors and notifications
   */
  async validateMaterial(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined,
    validationContext: IValidationContext
  ): Promise<IScenarioRuleResult> {
    // Detect applicable scenario
    const rule = this.detectScenario(
      materialCode,
      rowData,
      existingMaterial,
      activityMapping
    );

    // Execute scenario-specific validation
    return await rule.validate(
      materialCode,
      rowData,
      existingMaterial,
      activityMapping,
      validationContext
    );
  }

  /**
   * Get allowed update fields for a material (for documentation/UI)
   *
   * @param materialCode - Material code being validated
   * @param rowData - Incoming Excel row data
   * @param existingMaterial - Existing material record (if update)
   * @param activityMapping - Activity usage data
   * @returns Array of field names that can be updated
   */
  getAllowedUpdates(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined
  ): string[] {
    const rule = this.detectScenario(
      materialCode,
      rowData,
      existingMaterial,
      activityMapping
    );
    return rule.getAllowedUpdates();
  }

  /**
   * Get blocked update fields for a material (for documentation/UI)
   *
   * @param materialCode - Material code being validated
   * @param rowData - Incoming Excel row data
   * @param existingMaterial - Existing material record (if update)
   * @param activityMapping - Activity usage data
   * @returns Array of field names that cannot be updated
   */
  getBlockedUpdates(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined
  ): string[] {
    const rule = this.detectScenario(
      materialCode,
      rowData,
      existingMaterial,
      activityMapping
    );
    return rule.getBlockedUpdates();
  }

  /**
   * Get scenario description for logging/debugging
   *
   * @param materialCode - Material code being validated
   * @param rowData - Incoming Excel row data
   * @param existingMaterial - Existing material record (if update)
   * @param activityMapping - Activity usage data
   * @returns Human-readable scenario description
   */
  getScenarioDescription(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined
  ): string {
    const rule = this.detectScenario(
      materialCode,
      rowData,
      existingMaterial,
      activityMapping
    );
    return rule.getDescription();
  }
}
