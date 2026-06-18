import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  createErrorDataForExcel,
  TErrorExcelSheet,
  TExcelSheet,
  TTemplateErrorData,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  validateColumnNames,
  validateSheetName,
} from "@/modules/ghg/lib/excel/excel.validation";
import {
  MATERIAL_CODE,
  MATERIAL_MASTER,
  MATERIAL_NAME,
  MATERIAL_TYPE,
  MaterialMasterActivityConstant,
} from "@/modules/ghg/shared/constants/material-master-activity.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { checkMaterialActivityMapping } from "./material-activity-mapping.service";
import { IOrgMaterialMaster } from "./material-master-excel.service";
import {
  CONSTRAINTS,
  materialMasterFieldSchema,
  MaterialMasterRuleEngine,
} from "./rules";
import type {
  IMissingWeightNotification,
  IUoMMismatch,
  IValidationContext,
} from "./validation.interfaces";
import { mapDBRecordToExcelFormat } from "./validation.interfaces";

const { sheets: templateSheets } =
  MaterialMasterActivityConstant.excel_template;

// Re-export interfaces for backward compatibility
export type { IMaterialActivityMapping } from "./material-activity-mapping.service";
export type { IMissingWeightNotification, IUoMMismatch, IValidationContext };

export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
  let errorMessageData: TTemplateErrorData[] = [];

  // Validate sheets and column names
  templateSheets.forEach((templateSheet) => {
    // Validate sheet name
    const sheetValidations = validateSheetName(excelData, templateSheet.name);
    if (sheetValidations.length > 0) {
      errorMessageData.push({ ...sheetValidations[0] });
    }

    if (excelData?.[0]?.data?.length > 0) {
      if (sheetValidations.length == 0) {
        // Validate column names
        const templateColumnNames = templateSheet.columns.map((m) => m.name);
        const sheetData = excelData.find(
          (sheet) =>
            sanitizeString.v1(sheet.sheetName) ===
            sanitizeString.v1(templateSheet.name)
        );

        if (sheetData) {
          const columnsValidations = validateColumnNames(
            sheetData,
            templateColumnNames
          );
          if (columnsValidations.length > 0) {
            columnsValidations.forEach((validationItem) => {
              errorMessageData.push(validationItem);
            });
          } else {
            if (sheetData.data.length > CONSTRAINTS.MAX_ROWS) {
              errorMessageData.push({
                sheet: templateSheet.name,
                error_message: `Maximum ${CONSTRAINTS.MAX_ROWS.toLocaleString()} records can be uploaded at a time`,
              });
            }
          }
        }
      }
    } else {
      errorMessageData.push({
        sheet: templateSheet.name,
        error_message: `No data found in sheet '${templateSheet.name}'`,
      });
    }
  });

  return errorMessageData;
};

/**
 * Field-level validation schema has been moved to:
 * lib/material-master/rules/validators/field-validators.ts
 *
 * Import using: import { materialMasterFieldSchema } from "./rules";
 */

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
): Promise<{
  errors: TErrorExcelSheet[];
  context: IValidationContext;
}> => {
  const sdk = await getGraphQlServerSDK();

  // Fetch existing material codes for this organization
  const existingMaterials = await sdk.getMaterialMasterByOrganization({
    organization_id: organizationId,
  });

  // Create a map of existing materials
  const existingMaterialsMap = new Map<string, IOrgMaterialMaster>();
  existingMaterials?.OrgMaterialMaster?.forEach((m) => {
    const code = sanitizeString.v1(m?.code || "");
    if (code) {
      existingMaterialsMap.set(code, m as IOrgMaterialMaster);
    }
  });

  // Get material codes from Excel
  const excelMaterialCodes =
    excelData
      .find(
        (sheet) =>
          sanitizeString.v1(sheet.sheetName) ===
          sanitizeString.v1(MATERIAL_MASTER)
      )
      ?.data.map((row) => String(row[MATERIAL_CODE] || ""))
      .filter((code) => code) || [];

  // Check activity mappings for all materials
  const activityMappings = await checkMaterialActivityMapping(
    excelMaterialCodes,
    organizationId
  );

  // Fetch activity master data for UoM category resolution (used by Scenario C)
  const activityMasterDataResult = await sdk.getActivityMasterDataByKey({
    master_key: [
      "transport_upstream_Material_Quantity_Procured_UOM",
      "material_master_material_weight_uom",
      "capital_goods_quantity_procured_uom",
    ],
  });

  // Initialize validation context
  const validationContext: IValidationContext = {
    existingMaterials: existingMaterialsMap,
    activityMappings,
    uomMismatches: [],
    missingWeightNotifications: [],
    activityMasterData: activityMasterDataResult?.ActivityMaster ?? [],
    activityUomMasterKey: "transport_upstream_Material_Quantity_Procured_UOM",
  };

  // Initialize rule engine
  const ruleEngine = new MaterialMasterRuleEngine();

  const combinedErrors: TErrorExcelSheet[] = [];

  for (const sheet of excelData) {
    if (
      sanitizeString.v1(sheet.sheetName) === sanitizeString.v1(MATERIAL_MASTER)
    ) {
      const sheetAllErrorEntries: Record<string, any>[] = [];
      const schema = materialMasterFieldSchema();

      // Get template columns for this sheet
      const allColumns = templateSheets.find(
        (s) => sanitizeString.v1(s.name) === sanitizeString.v1(sheet.sheetName)
      )?.columns;

      // Collect all material codes for duplicate checking within file
      const allMaterialCodes = sheet.data.map((row) =>
        sanitizeString.v1(String(row[MATERIAL_CODE] || ""))
      );

      for (let i = 0; i < sheet.data.length; i++) {
        const row = sheet.data[i];
        const rowWithAllCodes = {
          ...row,
          __allRows: allMaterialCodes,
        };

        // Sanitized code for lookups (lowercase)
        const materialCode = sanitizeString.v1(
          String(row[MATERIAL_CODE] || "")
        );
        // Original code from Excel (preserves case for database queries)
        const originalMaterialCode = String(row[MATERIAL_CODE] || "").trim();

        const existingMaterial = existingMaterialsMap.get(materialCode);
        const activityMapping = activityMappings.get(materialCode);

        const errorEntries: TErrorExcelSheet[] = [];

        // Check for duplicate MaterialCode within file
        if (materialCode) {
          const occurrences = allMaterialCodes.filter(
            (code) => code === materialCode
          ).length;
          if (occurrences > 1) {
            errorEntries.push({
              column: MATERIAL_CODE,
              row: i + 2,
              errorMessage: `Duplicate Entry Detected: Material Code "${originalMaterialCode}" already exists in the file. Please use a unique code`,
            });
          }
        }

        try {
          // Field-level validation (Zod schema)
          const validatedRow = await schema.parseAsync(rowWithAllCodes);

          // Map DB record to Excel format for accurate field comparison
          const existingMaterialFormatted = existingMaterial
            ? mapDBRecordToExcelFormat(existingMaterial)
            : undefined;

          // Business rule validation (Rule Engine)
          const ruleResult = await ruleEngine.validateMaterial(
            materialCode,
            validatedRow,
            existingMaterialFormatted,
            activityMapping,
            validationContext
          );

          // Process errors from rule engine
          if (ruleResult.errors && ruleResult.errors.length > 0) {
            for (const error of ruleResult.errors) {
              errorEntries.push({
                column: error.fieldName,
                row: i + 2, // i+2 because Excel row 1 is header, data starts at row 2
                errorMessage: error.errorMessage,
              });
            }
          }

          // Process notifications from rule engine
          if (ruleResult.notifications) {
            if (ruleResult.notifications.uomMismatches) {
              // Map rule engine format to validation context format
              for (const mismatch of ruleResult.notifications.uomMismatches) {
                validationContext.uomMismatches.push({
                  materialCode: originalMaterialCode, // Use original case from Excel
                  materialName: String(row[MATERIAL_NAME] || ""),
                  oldUom: mismatch.oldUom,
                  newUom: mismatch.newUom,
                  affectedActivities: mismatch.affectedActivities,
                });
              }
            }
            if (ruleResult.notifications.missingWeights) {
              for (const code of ruleResult.notifications.missingWeights) {
                validationContext.missingWeightNotifications.push({
                  materialCode: originalMaterialCode, // Use original case from Excel
                  materialName: String(row[MATERIAL_NAME] || ""),
                  materialType: String(row[MATERIAL_TYPE] || ""),
                });
              }
            }
          }
        } catch (err) {
          // Field-level validation errors (Zod)
          if (err instanceof z.ZodError) {
            err.errors.forEach((zodError) => {
              errorEntries.push({
                column: String(zodError.path[0] || "Error"),
                row: i + 2, // i+2 because Excel row 1 is header, data starts at row 2
                errorMessage: zodError.message,
              });
            });
          }
        }

        if (errorEntries.length > 0 && allColumns) {
          const errorRow = createErrorDataForExcel(
            allColumns as any,
            errorEntries
          );
          sheetAllErrorEntries.push(errorRow[0]);
        }
      }

      if (sheetAllErrorEntries.length > 0) {
        combinedErrors.push({
          sheetName: sheet.sheetName,
          data: sheetAllErrorEntries,
        } as any);
      }
    }
  }

  return {
    errors: combinedErrors,
    context: validationContext,
  };
};
