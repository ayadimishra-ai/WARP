/**
 * Material Master Rules Module
 *
 * Central export point for all rule-based validation components.
 *
 * ARCHITECTURE:
 * - Rule Engine: Orchestrator that detects and executes scenario rules
 * - Scenario Rules: Strategy pattern implementations (A, B, C, D)
 * - Field Validators: Zod schemas for field-level validation
 * - Rules Config: Central registry of all business rules and constraints
 */

// Rule Engine
export { MaterialMasterRuleEngine } from "./material-master-rule-engine";

// Base Classes
export {
  MaterialMasterScenarioRule,
  type IScenarioRuleResult,
  type IScenarioValidationError,
} from "./base-scenario-rule";

// Scenario Rules
export { ScenarioActivityUoMMatchRule } from "./scenarios/scenario-activity-uom-match.rule";
export { ScenarioNoActivityRule } from "./scenarios/scenario-no-activity.rule";
export { ScenarioTypeUpdateBlockedRule } from "./scenarios/scenario-type-update-blocked.rule";
export { ScenarioUoMCategoryChangeBlockedRule } from "./scenarios/scenario-uom-category-change-blocked.rule";
export { ScenarioUoMMismatchRule } from "./scenarios/scenario-uom-mismatch.rule";

// Field Validators
export {
  additionalInformationSchema,
  materialClassificationSchema,
  materialCodeSchema,
  materialDescriptionSchema,
  materialMasterFieldSchema,
  materialNameSchema,
  materialTypeSchema,
  materialWeightSchema,
  uomMaterialWeightSchema,
} from "./validators/field-validators";

// Rules Configuration
export {
  ACTIVITY_TABLES,
  CONSTRAINTS,
  FIELD_CATEGORIES,
  SCENARIOS,
  WEIGHT_REQUIRED_TYPES,
} from "./material-master-rules.config";
