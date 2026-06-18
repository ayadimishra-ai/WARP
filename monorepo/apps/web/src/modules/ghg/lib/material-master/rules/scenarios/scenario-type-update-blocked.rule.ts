/**
 * Scenario D: Material Type Update Handler
 *
 * APPLIES WHEN:
 * - Material has activity data
 * - User attempts to update Material Type
 *
 * RULES (per business requirements):
 * ┌──────────────────────────────────────────┬──────────────────────────────────────────────────────┬─────────┐
 * │ Current State                            │ Requested Change                                     │ Allowed │
 * ├──────────────────────────────────────────┼──────────────────────────────────────────────────────┼─────────┤
 * │ Activity in Upstream/MP ONLY             │ Non-CG type → another Non-CG type                    │ YES     │
 * │ Activity in Upstream/MP ONLY             │ Any type → Capital Goods                             │ NO      │
 * │ Activity in Capital Goods ONLY           │ Capital Goods → any other type                       │ NO      │
 * │ Activity in Capital Goods ONLY           │ Capital Goods → Capital Goods (no change)            │ N/A*    │
 * │ No CG activity data                      │ Any type → Capital Goods (with Upstream/MP activity) │ NO      │
 * └──────────────────────────────────────────┴──────────────────────────────────────────────────────┴─────────┘
 * * "No change" never reaches this rule because `isFieldUpdated` returns false.
 *
 * PRIORITY:
 * - Scenario D is checked BEFORE Scenarios B/C
 * - Type update handling trumps UoM mismatch handling
 */

import type {
    IMaterialActivityMapping,
    IValidationContext,
} from "@/modules/ghg/lib/material-master/validation.interfaces";
import {
    MATERIAL_CODE,
    MATERIAL_NAME,
    MATERIAL_TYPE,
} from "@/modules/ghg/shared/constants/material-master-activity.constant";
import {
    MaterialMasterScenarioRule,
    type IScenarioRuleResult,
} from "../base-scenario-rule";
import {
    SCENARIOS
} from "../material-master-rules.config";

const CAPITAL_GOODS_TYPE = "capital goods";

export class ScenarioTypeUpdateBlockedRule extends MaterialMasterScenarioRule {
  constructor() {
    super("SCENARIO_D");
  }

  /**
   * Scenario D applies when:
   * 1. Material has activity data
   * 2. Material Type is being updated
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

    // Check if Material Type is being updated
    return this.isFieldUpdated(MATERIAL_TYPE, rowData, existingMaterial);
  }

  /**
   * Validate Scenario D: Conditionally allow or block Material Type update.
   *
   * Decision matrix:
   * - Activity in Capital Goods + changing FROM CG → BLOCK
   * - Activity in Upstream/MP + changing TO CG → BLOCK
   * - Activity in Upstream/MP ONLY + changing between non-CG types → ALLOW
   */
  async validate(
    materialCode: string,
    rowData: Record<string, any>,
    existingMaterial: Record<string, any> | undefined,
    activityMapping: IMaterialActivityMapping | undefined,
    validationContext: IValidationContext
  ): Promise<IScenarioRuleResult> {
    const errors: any[] = [];

    const newType = String(rowData[MATERIAL_TYPE] || "").trim();
    const newTypeLower = newType.toLowerCase();
    const existingType = String(existingMaterial?.[MATERIAL_TYPE] || "").trim();
    const existingTypeLower = existingType.toLowerCase();

    const hasCapitalGoodsActivity = !!activityMapping?.usedIn?.capitalGoods;
    const hasUpstreamOrMPActivity =
      !!activityMapping?.usedIn?.upstreamTransport ||
      !!activityMapping?.usedIn?.materialProcurement;

    // --- Decision logic ---

    if (hasCapitalGoodsActivity && newTypeLower !== CAPITAL_GOODS_TYPE) {
      // Activity in Capital Goods + changing FROM Capital Goods → BLOCK
      errors.push(
        this.createError(
          materialCode,
          MATERIAL_TYPE,
          `Material Type cannot be changed from Capital Goods because this material has activity data in Capital Goods. Capital Goods activity data requires Material Type = 'Capital Goods' for emission factor lookup.`
        )
      );
    } else if (hasUpstreamOrMPActivity && newTypeLower === CAPITAL_GOODS_TYPE) {
      // Activity in Upstream/MP + changing TO Capital Goods → BLOCK
      errors.push(
        this.createError(
          materialCode,
          MATERIAL_TYPE,
          // `Material Type cannot be changed to Capital Goods because this material has activity data in Upstream / Material Procurement. The same material code cannot exist in both Capital Goods and Upstream / Material Procurement.`
          // `Material ${materialCode} was created via activity upload in Upstream/Material Procurement. Material type cannot be changed to Capital Goods.`
          `Material code ${materialCode} is already tagged as ${existingType}. The same material code cannot be used under a different material type.`
        )
      );
    } else if (
      hasUpstreamOrMPActivity &&
      !hasCapitalGoodsActivity &&
      newTypeLower !== CAPITAL_GOODS_TYPE
    ) {
      // Activity in Upstream/MP ONLY + changing between non-CG types → ALLOW
      // No error — type change is permitted as both types use the same templates.
      // Fall through with no errors.
    }

    // If no errors were produced, the type change is allowed — return early
    if (errors.length === 0) {
      return { errors, notifications: undefined };
    }

    // --- Additional field checks (only when type change is blocked) ---

    // Also check Material Name (always blocked with activity data)
    if (this.isFieldUpdated(MATERIAL_NAME, rowData, existingMaterial)) {
      errors.push(
        this.createError(
          materialCode,
          MATERIAL_NAME,
          `${MATERIAL_NAME} cannot be updated when material is used in activity data`
        )
      );
    }

    // Also check Material Code (immutable in all scenarios)
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
      notifications: undefined,
    };
  }

  /**
   * Only always-updatable fields allowed (Type is explicitly blocked)
   */
  getAllowedUpdates(): string[] {
    return [...SCENARIOS.SCENARIO_D.allowedUpdates];
  }

  /**
   * Immutable + Activity-restricted fields blocked (includes Type)
   */
  getBlockedUpdates(): string[] {
    return [...SCENARIOS.SCENARIO_D.blockedUpdates];
  }
}
