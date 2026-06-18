/**
 * Base Scenario Rule Interface and Abstract Class
 *
 * Provides the template structure for all Material Master scenario rules.
 * Each scenario (A, B, C, D) extends this class and implements specific logic.
 */

import type {
  IMaterialActivityMapping,
  IValidationContext,
} from "~/lib/material-master/validation.interfaces";
import type { SCENARIOS } from "./material-master-rules.config";

/**
 * Represents a single validation error with field and message
 */
export interface IScenarioValidationError {
  materialCode: string;
  fieldName: string;
  errorMessage: string;
}

/**
 * Result of applying a scenario rule
 */
export interface IScenarioRuleResult {
  errors: IScenarioValidationError[];
  notifications?: {
    uomMismatches?: Array<{
      materialCode: string;
      oldUom: string;
      newUom: string;
      affectedActivities: string[];
    }>;
    missingWeights?: string[]; // Material codes missing weight for Capital Goods
  };
}

/**
 * Abstract Base Class for Scenario Rules
 *
 * Each scenario must implement:
 * - applies(): Determine if this scenario applies to the material
 * - validate(): Execute scenario-specific validation logic
 */
export abstract class MaterialMasterScenarioRule {
  protected scenarioKey: keyof typeof SCENARIOS;

  constructor(scenarioKey: keyof typeof SCENARIOS) {
    this.scenarioKey = scenarioKey;
  }

  /**
   * Determine if this scenario rule applies to the current material
   *
   * @param materialCode - Material code being validated
   * @param rowData - Incoming Excel row data
   * @param existingMaterial - Existing material record (if update)
   * @param activityMapping - Activity usage data
   * @returns true if scenario applies
   */
  abstract applies(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined
  ): boolean;

  /**
   * Execute scenario-specific validation logic
   *
   * @param materialCode - Material code being validated
   * @param rowData - Incoming Excel row data (validated fields only)
   * @param existingMaterial - Existing material record (if update)
   * @param activityMapping - Activity usage data
   * @param validationContext - Full validation context (for caching, lookups)
   * @returns Validation result with errors and notifications
   */
  abstract validate(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined,
    validationContext: IValidationContext
  ): Promise<IScenarioRuleResult>;

  /**
   * Get allowed update fields for this scenario
   *
   * @returns Array of field names that can be updated
   */
  abstract getAllowedUpdates(): string[];

  /**
   * Get blocked update fields for this scenario
   *
   * @returns Array of field names that cannot be updated
   */
  abstract getBlockedUpdates(): string[];

  /**
   * Get scenario description for documentation/logging
   *
   * @returns Human-readable description
   */
  getDescription(): string {
    // Access SCENARIOS config - will be imported dynamically
    const scenarios = require("./material-master-rules.config").SCENARIOS;
    return scenarios[this.scenarioKey]?.description || "Unknown scenario";
  }

  /**
   * Check if this scenario requires notifications
   *
   * @returns true if notifications should be triggered
   */
  requiresNotification(): boolean {
    const scenarios = require("./material-master-rules.config").SCENARIOS;
    return scenarios[this.scenarioKey]?.requiresNotification || false;
  }

  /**
   * Helper: Check if field is being updated
   */
  protected isFieldUpdated(
    fieldName: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined
  ): boolean {
    if (!existingMaterial) return false; // Insert scenario

    const oldValue = existingMaterial[fieldName];
    const newValue = rowData[fieldName];

    // Both undefined/null = no change
    if (
      (oldValue === undefined || oldValue === null) &&
      (newValue === undefined || newValue === null)
    ) {
      return false;
    }

    // Convert to strings for comparison (handle numeric/string types)
    // Use case-insensitive comparison to avoid false positives from case differences
    // (e.g., "Raw material" vs "raw material" should not be treated as an update)
    const oldStr = String(oldValue || "")
      .trim()
      .toLocaleLowerCase();
    const newStr = String(newValue || "")
      .trim()
      .toLocaleLowerCase();

    return oldStr !== newStr;
  }

  /**
   * Helper: Create error object
   */
  protected createError(
    materialCode: string,
    fieldName: string,
    errorMessage: string
  ): IScenarioValidationError {
    return {
      materialCode,
      fieldName,
      errorMessage,
    };
  }

  /**
   * Helper: Check if material has activity data
   */
  protected hasActivityData(
    activityMapping: IMaterialActivityMapping | undefined
  ): boolean {
    return !!activityMapping?.isUsedInActivity;
  }

  /**
   * Helper: Get affected activity names from activity mapping
   */
  protected getAffectedActivities(
    activityMapping: IMaterialActivityMapping | undefined
  ): string[] {
    if (!activityMapping) return [];

    const activities: string[] = [];
    if (activityMapping.usedIn?.capitalGoods) activities.push("Capital Goods");
    if (activityMapping.usedIn?.materialProcurement)
      activities.push("Material Procurement");
    if (activityMapping.usedIn?.upstreamTransport)
      activities.push("Upstream Transport");
    if (activityMapping.usedIn?.productShare)
      activities.push("Product Share Attribution");

    return activities;
  }
}
