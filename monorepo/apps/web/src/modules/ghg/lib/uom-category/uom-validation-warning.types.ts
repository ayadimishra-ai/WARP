/**
 * UoM Validation Warning Types
 *
 * Shared types for UoM validation warnings across bulk upload templates.
 * These types support the enhanced validation behavior where UoM mismatches
 * can be warnings (accepted with flag) instead of hard errors.
 */

/**
 * Represents a warning generated during UoM validation.
 * Warnings indicate rows that are accepted but flagged for user review.
 */
export interface IUoMValidationWarning {
  row: number;
  column: string;
  uploadedUoM: string;
  masterUoM: string;
  uploadCategory: string;
  masterCategory: string;
  reason: string;
}

/**
 * Extended validation result that includes both errors and warnings.
 * Used by the bulk upload validation engine to provide partial acceptance.
 */
export interface IExtendedValidationResult {
  /** Rows with hard errors that must be rejected */
  errors: Record<string, string>[];
  /** Rows with warnings that are accepted but flagged */
  warnings: IUoMValidationWarning[];
}

/**
 * Result structure for the enhanced validateExcelTemplateData function.
 * Provides separate lists of errors and warnings for UI display.
 */
export interface IBulkUploadValidationResult {
  /** Error sheets for rejected rows (existing behavior) */
  errorSheets: import("@/modules/ghg/lib/excel/excel.service").TExcelSheet[];
  /** Warning entries for rows accepted with flags */
  warningEntries: IUoMValidationWarning[];
}
