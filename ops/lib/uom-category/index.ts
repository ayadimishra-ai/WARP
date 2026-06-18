/**
 * UoM Category Module
 *
 * Central export for UoM category validation framework.
 */

export {
  MATERIAL_MASTER_UOM_CHANGE_RULES,
  UOM_CATEGORIES,
  UOM_CATEGORY_COMPATIBILITY,
  type UoMCategory,
} from "./uom-category.constants";

export {
  getMaterialMasterUoMCategory,
  getUoMCategory,
  validateMaterialMasterUoMChange,
  validateUoMCategoryCompatibility,
  type UoMValidationResult,
} from "./uom-category.service";
