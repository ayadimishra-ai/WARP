/**
 * UoM Category Module
 *
 * Central export for UoM category validation framework.
 */

export {
  UOM_CATEGORIES,
  UOM_CATEGORY_COMPATIBILITY,
  MATERIAL_MASTER_UOM_CHANGE_RULES,
  type UoMCategory,
} from "./uom-category.constants";

export {
  getUoMCategory,
  validateUoMCategoryCompatibility,
  validateMaterialMasterUoMChange,
  getMaterialMasterUoMCategory,
  type UoMValidationResult,
} from "./uom-category.service";
