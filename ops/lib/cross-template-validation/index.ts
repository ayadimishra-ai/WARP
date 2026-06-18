/**
 * Cross-Template Validation Module
 *
 * Enforces material code ownership rules across templates.
 */

export {
  checkConflictsForCapitalGoods,
  checkConflictsForUpstreamOrMaterialProcurement,
  fetchExistingTemplateGroups,
  fetchMaterialProcurementUsage,
  getTemplateGroup,
  TEMPLATE_GROUPS,
  validateCrossTemplate,
  validateCrossTemplateForBatch,
  type ICrossTemplateConflict,
  type ICrossTemplateValidationResult,
  type TemplateGroup,
} from "./cross-template-validation.service";
