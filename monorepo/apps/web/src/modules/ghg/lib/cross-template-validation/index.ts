/**
 * Cross-Template Validation Module
 *
 * Enforces material code ownership rules across templates.
 */

export {
  TEMPLATE_GROUPS,
  type TemplateGroup,
  getTemplateGroup,
  validateCrossTemplate,
  fetchExistingTemplateGroups,
  fetchMaterialProcurementUsage,
  validateCrossTemplateForBatch,
  type ICrossTemplateValidationResult,
  checkConflictsForCapitalGoods,
  checkConflictsForUpstreamOrMaterialProcurement,
  type ICrossTemplateConflict,
} from "./cross-template-validation.service";
