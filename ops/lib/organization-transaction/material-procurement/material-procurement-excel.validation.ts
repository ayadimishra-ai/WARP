import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import { GetDistinctUoMsMaterialProcurementByMaterialCodesQuery } from "~/graphql/shared/types";
import {
  checkConflictsForUpstreamOrMaterialProcurement,
  validateCrossTemplateForBatch,
} from "~/lib/cross-template-validation";
import {
  ApiHitType,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  TActivityMasterData,
  TActivityMasterDataArray,
  TErrorExcelSheet,
  TExcelSheet,
  TTemplateErrorData,
  validateActivityMasterDataByKey,
  YearMonthSchema,
} from "~/lib/excel/excel.service";
import {
  validateColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import { getUomGroup } from "~/lib/material-conversion/material-conversion.service";
import {
  getMaterialMasterUoMCategory,
  getUoMCategory,
  validateUoMCategoryCompatibility,
} from "~/lib/uom-category";
import type { IUoMValidationWarning } from "~/lib/uom-category/uom-validation-warning.types";
import {
  MaterialProcurementActivityConstant,
  TMaterialProcurementActivitySheetColumnNames,
  TMaterialProcurementActivitySheetNames,
} from "~/shared/constants/activity.constant";
import {
  ActivityMasterKey,
  MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
  MATERIAL_QUANTITY_PROCURED_UOM_KEY,
  TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
} from "~/shared/constants/input.constant";
import { sanitize_compare_str_v4 } from "~/utils/comapre.util";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

const { sheets: templateSheets } =
  MaterialProcurementActivityConstant.excel_template;

let yearMonthError: TErrorExcelSheet[] = [];
interface MaterialMaster {
  code: string;
  type: string;
}

export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
  let errorMessageData: TTemplateErrorData[] = [];
  // validate sheets and column names
  templateSheets.forEach((templateSheet) => {
    //Validate sheet name
    const sheetValidations = validateSheetName(excelData, templateSheet.name);
    if (sheetValidations.length > 0) {
      errorMessageData.push({ ...sheetValidations[0] });
    }
    if (excelData?.[0]?.data?.length > 0) {
      if (sheetValidations.length == 0) {
        // validate column names
        const templateColumnNames = templateSheet.columns.map((m) => m.name);
        const sheetData = excelData.filter(
          (sheetData) =>
            sanitizeString.v1(sheetData.sheetName) ==
            sanitizeString.v1(templateSheet.name)
        )[0];
        const columnsValidations = validateColumnNames(
          sheetData,
          templateColumnNames
        );
        if (columnsValidations.length > 0) {
          columnsValidations.forEach((validationItem) => {
            errorMessageData.push(validationItem);
          });
        } else {
          if (sheetData.data.length > 10000) {
            errorMessageData.push({
              sheet: templateSheet.name,
              error_message: "Maximum 10,000 records can be uploaded at a time",
            });
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

const materialProcurementSchema = (baseMonth: string, baseYear: number) => {
  const materialCodeSchema = z.preprocess(
    (val) => {
      if (typeof val !== "string") return String(val);
      return val;
    },
    z
      .string()
      .min(1, "Material Code is required")
      .refine((val) => val.trim().length > 0, {
        message: "Material Code is required",
      })
  );

  const supplierCodeSchema = z.preprocess(
    (val) => {
      if (typeof val !== "string") return String(val);
      return val;
    },
    z
      .string()
      .min(1, "Supplier Code is required")
      .refine((val) => val.trim().length > 0, {
        message: "Supplier Code is required",
      })
  );

  return YearMonthSchema(baseYear)
    .extend({
      "Material Code": materialCodeSchema,
      "Supplier Code": supplierCodeSchema,
      "Material Quantity Procured": z
        .number({
          required_error: "Material Quantity Procured is required",
          invalid_type_error: "Material Quantity Procured is invalid",
        })
        .refine(
          (n) => {
            const value = Number(n);
            return value >= 0;
          },
          {
            message: "Material Quantity Procured should not be negative",
          }
        )
        .refine(
          (n) => {
            const value = Number(n);
            return value > 0;
          },
          {
            message: "Material Quantity Procured should not be zero (0)",
          }
        ),
      // .refine(
      //   (n) => {
      //     const precision = n.toString().split(".")[1]?.length ?? 0;
      //     return precision <= 2;
      //   },
      //   {
      //     message: "Max precision is 2 decimal places",
      //   }
      // ),
      "Material Quantity Procured UOM": z
        .string({
          required_error: "Material Quantity Procured UoM is required",
          invalid_type_error: "Material Quantity Procured UoM is invalid",
        })
        .min(1, { message: "Material Quantity Procured UoM is required" }),
    })
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (month) =>
            sanitizeString.v1(month) == sanitizeString.v1(String(Month ?? ""))
        );
        if (fullNameMonth.length > 0) {
          yearMonthError = validateMonthYear(Month, Year, baseMonth, baseYear);
          return yearMonthError.length == 0;
        }
        return true;
      },
      ({ Month }) => ({
        message: yearMonthError[0].errorMessage,
        path: Object.keys({ Month }),
      })
    );
};

const validateMaterialProcurementSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeParseData: any = materialProcurementSchema(
      baseMonth,
      baseYear
    ).safeParse(item);
    if (!safeParseData.success) {
      columnObject["Row Number"] = index;
      MaterialProcurementActivityConstant.excel_template.sheets
        .filter(
          (sheetItem) =>
            sanitizeString.v1(sheetItem.name) ==
            sanitizeString.v1(sheet.sheetName)
        )[0]
        .columns.forEach((columnItem) => {
          safeParseData.error.issues.forEach(
            (issueItem: Record<string, string>) => {
              if (!!columnObject[columnItem.name]) {
                return;
              }
              if (columnItem.name == issueItem.path[0]) {
                columnObject[columnItem.name] = issueItem.message;
              } else {
                columnObject[columnItem.name] = "";
              }
            }
          );
        });
      errorEntries.push(columnObject);
    }
  });
  return errorEntries;
};

const validateSheetMethods: Record<
  TMaterialProcurementActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Material Procurement": validateMaterialProcurementSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TMaterialProcurementActivitySheetNames]: Record<
      TMaterialProcurementActivitySheetColumnNames,
      any
    >[];
  } = { "Material Procurement": [] };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TMaterialProcurementActivitySheetNames;
    failedEntries[sheetName] = validateSheetMethods[sheetName](
      sheet,
      orgData.Organization[0].FinancialYearMonth,
      orgData.Organization[0].Baselineyear
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });
  return excelSheetData;
};

const validateMaterialProcurementDataSheet = async (
  sheet: TExcelSheet,
  activityMasterData: TActivityMasterData[],
  organizationId: UUID
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  // Extract all unique material codes from the sheet for cross-template validation
  const allMaterialCodes = [
    ...new Set(
      sheet.data
        .map((item: Record<string, string>) => item["Material Code"])
        .filter((code) => code !== null && code !== undefined)
        .map((code) => String(code).trim())
        .filter((code) => code.length > 0)
    ),
  ];

  // Check for cross-template conflicts against Capital Goods activity data
  const conflicts = await checkConflictsForUpstreamOrMaterialProcurement(
    allMaterialCodes,
    organizationId
  );

  sheet.data.forEach((dataItem: Record<string, string>) => {
    const errorEntries: TErrorExcelSheet[] = [];
    index++;

    // Check if current material code has activity data in Capital Goods
    const materialCode = sanitizeString.v4(
      String(dataItem["Material Code"] ?? "")
    );
    const conflict = conflicts.get(materialCode);

    if (conflict) {
      errorEntries.push({
        column: "Material Code",
        row: index,
        errorMessage: `Material Code '${dataItem["Material Code"]}' is defined as ${conflict.conflictingTemplate} in Material Master or already has activity data in ${conflict.conflictingTemplate}. The same material code cannot exist in Upstream / Material Procurement.`,
      });
    }

    // Validation of Columns value from Master Data
    const errorEntriesColumn1Data = validateActivityMasterDataByKey(
      activityMasterData,
      dataItem["Material Quantity Procured UOM"],
      index,
      ActivityMasterKey.material_procurement[0],
      "Material Quantity Procured UOM",
      ApiHitType.Excel
    );
    if (errorEntriesColumn1Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn1Data[0] });
    }
    if (errorEntries.length > 0) {
      let allColumns: any =
        MaterialProcurementActivityConstant.excel_template.sheets.filter(
          (sheetItem) =>
            sanitizeString.v1(sheetItem.name) ==
            sanitizeString.v1(sheet.sheetName)
        )[0].columns;
      const errorRow = createErrorDataForExcel(allColumns, errorEntries);
      sheetAllErrorEntries.push(errorRow[0]);
    }
  });
  return sheetAllErrorEntries;
};

const validateSheetMasterDataMethods: Record<
  TMaterialProcurementActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[],
    organizationId: UUID
  ) => Promise<Record<string, any>[]>
> = {
  "Material Procurement": validateMaterialProcurementDataSheet,
};

const validateDataByDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.material_procurement,
  });

  // Extract unique material codes for cross-template validation
  const uniqueMaterialCodes = Array.from(
    new Set(
      excelData
        .filter(
          (sheet) =>
            sanitizeString.v4(sheet.sheetName) ===
            sanitizeString.v4("Material Procurement")
        )
        .flatMap((sheet) =>
          sheet.data
            .map((item: Record<string, string>) => item["Material Code"])
            .filter((code) => code !== null && code !== undefined)
            .map((code) => String(code).trim().toLowerCase())
            .filter((code) => code.length > 0)
        )
    )
  );

  // Cross-template validation: Check if any material codes have conflicting template usage
  const crossTemplateErrors = await validateCrossTemplateForBatch(
    uniqueMaterialCodes,
    "material_procurement",
    organizationId
  );

  const failedEntries: {
    [key in TMaterialProcurementActivitySheetNames]: Record<
      TMaterialProcurementActivitySheetColumnNames,
      any
    >[];
  } = { "Material Procurement": [] };
  for (const sheet of excelData) {
    const sheetName =
      sheet.sheetName.trim() as TMaterialProcurementActivitySheetNames;
    const masterDataErrors = await validateSheetMasterDataMethods[sheetName](
      sheet,
      activityMasterData?.ActivityMaster,
      organizationId
    );

    // Apply cross-template errors as additional row-level errors
    if (crossTemplateErrors.size > 0) {
      let rowIndex = 0;
      sheet.data.forEach((dataItem: Record<string, string>) => {
        rowIndex++;
        const materialCode = String(dataItem["Material Code"] || "")
          .trim()
          .toLowerCase();
        const crossTemplateResult = crossTemplateErrors.get(materialCode);

        if (crossTemplateResult?.status === "error") {
          const errorEntry: TErrorExcelSheet = {
            column: "Material Code",
            row: rowIndex,
            errorMessage: crossTemplateResult.reason!,
          };
          const allColumns: any =
            MaterialProcurementActivityConstant.excel_template.sheets.filter(
              (sheetItem) =>
                sanitizeString.v1(sheetItem.name) ===
                sanitizeString.v1(sheet.sheetName)
            )[0].columns;
          const errorRow = createErrorDataForExcel(allColumns, [errorEntry]);
          masterDataErrors.push(errorRow[0]);
        }
      });
    }

    failedEntries[sheetName] = masterDataErrors;
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  }
  return excelSheetData;
};

const validateUOMConsistencyByUoMGroup = (
  distinctUOMsData: GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
  materialCode: string,
  materialUom: string,
  columnName: string,
  index: number,
  activityMasterData: TActivityMasterData[]
): { errors: TErrorExcelSheet[]; warnings: IUoMValidationWarning[] } => {
  const errorEntries: TErrorExcelSheet[] = [];
  const warningEntries: IUoMValidationWarning[] = [];

  const existingUpstreamTransportUOMs = new Set<string>();
  distinctUOMsData?.GHGTransport_Upstream?.map((item) => {
    if (
      item?.Material_Quantity_Procured_uom &&
      sanitize_compare_str_v4(String(item?.Material_Code), String(materialCode))
    ) {
      existingUpstreamTransportUOMs.add(
        String(item?.Material_Quantity_Procured_uom)
      );
    }
  });

  const existingMaterialProcurementUOMs = new Set<string>();
  distinctUOMsData?.GHGMaterialProcurement?.map((item) => {
    if (
      item?.Material_Quantity_Procured_uom &&
      sanitize_compare_str_v4(String(item?.Material_Code), String(materialCode))
    ) {
      existingMaterialProcurementUOMs.add(
        String(item?.Material_Quantity_Procured_uom)
      );
    }
  });

  const existingMaterialMasterUOMs = new Set<string>();
  distinctUOMsData?.OrgMaterialMaster?.map((item) => {
    if (
      item?.Material_Code &&
      sanitize_compare_str_v4(
        String(item?.Material_Code),
        String(materialCode)
      ) &&
      item?.Material_Weight_Per_Unit !== 0 &&
      item?.Material_Quantity_Procured_uom
    ) {
      existingMaterialMasterUOMs.add(
        String(item?.Material_Quantity_Procured_uom)
      );
    }
  });

  // Get upload UoM category
  const currentMaterialUomCategory = getUoMCategory(
    activityMasterData,
    TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
    String(materialUom)
  );

  const currentMaterialUomGroup =
    getUomGroup(
      activityMasterData,
      TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
      String(materialUom)
    ) ?? "";

  // Check upstream transport UoM consistency with category compatibility
  for (const uom of existingUpstreamTransportUOMs) {
    const existingGroup = getUomGroup(
      activityMasterData,
      TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
      String(uom)
    );

    if (existingGroup && existingGroup !== currentMaterialUomGroup) {
      const existingCategory = getUoMCategory(
        activityMasterData,
        TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
        String(uom)
      );

      const compatResult = validateUoMCategoryCompatibility(
        currentMaterialUomCategory,
        existingCategory
      );

      if (compatResult.status === "error") {
        errorEntries.push({
          column: columnName,
          row: index,
          errorMessage: `UOM '${materialUom}' (${currentMaterialUomCategory}) is incompatible with existing upstream transport UOM '${uom}' (${existingCategory}). ${compatResult.reason}`,
        });
      } else if (compatResult.status === "warning") {
        warningEntries.push({
          row: index,
          column: columnName,
          uploadedUoM: materialUom,
          masterUoM: uom,
          uploadCategory: currentMaterialUomCategory ?? "unknown",
          masterCategory: existingCategory ?? "unknown",
          reason: compatResult.reason,
        });
      }
      break;
    }
  }

  // Check material master UoM consistency with category compatibility
  for (const uom of existingMaterialMasterUOMs) {
    let existingDenominatorGroup: string | null = "";

    const materialMasterUOM = activityMasterData?.filter(
      (activityMaster) =>
        activityMaster?.master_key === MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY
    );

    const currentMaterialUom = materialMasterUOM?.[0]?.master_data?.filter(
      (item: TActivityMasterDataArray) =>
        sanitize_compare_str_v4(String(item?.value), String(uom))
    );

    if (materialMasterUOM?.length) {
      if (currentMaterialUom?.length) {
        currentMaterialUom.forEach((uomItem: TActivityMasterDataArray) => {
          const denominatorUom = uomItem?.value?.split("/")?.[1] ?? "";
          existingDenominatorGroup = getUomGroup(
            activityMasterData,
            MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            String(denominatorUom)
          );
        });
      }
    }

    if (
      existingDenominatorGroup &&
      existingDenominatorGroup !== currentMaterialUomGroup
    ) {
      const existingCategory = existingDenominatorGroup as
        | import("~/lib/uom-category").UoMCategory
        | null;

      const compatResult = validateUoMCategoryCompatibility(
        currentMaterialUomCategory,
        existingCategory
      );

      if (compatResult.status === "error") {
        errorEntries.push({
          column: columnName,
          row: index,
          // errorMessage: `UOM '${materialUom}' (${currentMaterialUomCategory}) is incompatible with material master UOM '${uom}' (${existingCategory}). ${compatResult.reason}`,
          errorMessage: `UOM '${materialUom}' (${currentMaterialUomCategory}-based) is incompatible with master UOM '${uom}' (${existingCategory}-based) for '${materialCode}'. Volume and count-based UoMs cannot coexist.`,
        });
      } else if (compatResult.status === "warning") {
        warningEntries.push({
          row: index,
          column: columnName,
          uploadedUoM: materialUom,
          masterUoM: uom,
          uploadCategory: currentMaterialUomCategory ?? "unknown",
          masterCategory: existingCategory ?? "unknown",
          reason: compatResult.reason,
        });
      }
      break;
    }
  }

  return { errors: errorEntries, warnings: warningEntries };
};

const validateMaterialProcurementUOMConsistencyDataSheet = async (
  sheet: TExcelSheet,
  organizationId: UUID
): Promise<{
  errors: Record<string, string>[];
  warnings: IUoMValidationWarning[];
}> => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  const sheetAllWarningEntries: IUoMValidationWarning[] = [];
  let index: number = 0;

  const sdk = await getGraphQlServerSDK();

  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: [
      ...ActivityMasterKey.transport_upstream,
      ...ActivityMasterKey.material_procurement,
      ...ActivityMasterKey.material_master,
    ],
  });

  const materialCodes = [
    ...new Set(
      sheet?.data
        .map((item) => item["Material Code"])
        .filter(Boolean)
        .map((code) => String(code))
    ),
  ];

  // Helpers to build _ilike filters with safe wildcard handling
  const escapeLike = (s: string) => s.replace(/[%_\\]/g, (m) => "\\" + m);

  // If caller already includes %/_ in a code, treat it as a pattern.
  // Otherwise do a contains search: %value%
  const toIlikePattern = (s: string) => {
    if (s.includes("%") || s.includes("_")) return s; // user-supplied pattern
    return `%${escapeLike(s)}%`;
  };

  const buildIlikeOr = (values: string[], column: string) =>
    values.map((v) => ({
      [column]: { _ilike: toIlikePattern(v) },
    }));

  // Build per-table _or filters
  const mpOr = buildIlikeOr(materialCodes, "Material_Code"); // GHGMaterialProcurement
  const tuOr = buildIlikeOr(materialCodes, "Material_ID"); // GHGTransport_Upstream
  const cgOr = buildIlikeOr(materialCodes, "Material_Code"); // GHGCapital_Goods
  const mmOr = buildIlikeOr(materialCodes, "code"); // OrgMaterialMaster

  // Get distinct UOMs from existing data for the specific material patterns
  const distinctUOMsData =
    await sdk.getDistinctUOMsMaterialProcurementByMaterialCodes({
      organizationId: organizationId,
      mpOr,
      tuOr,
      cgOr,
      mmOr,
    });

  sheet.data.forEach((dataItem: Record<string, string>) => {
    const errorEntries: TErrorExcelSheet[] = [];
    index++;

    // Validation of Columns value from Master Data - now returns both errors and warnings
    const validationResult = validateUOMConsistencyByUoMGroup(
      distinctUOMsData as GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
      String(dataItem["Material Code"]),
      String(dataItem["Material Quantity Procured UOM"]),
      "Material Quantity Procured UOM",
      index,
      activityMasterData?.ActivityMaster || []
    );

    // Collect hard errors
    if (validationResult.errors.length > 0) {
      errorEntries.push({ ...validationResult.errors[0] });
    }

    // Collect warnings (these rows are accepted but flagged)
    if (validationResult.warnings.length > 0) {
      sheetAllWarningEntries.push(...validationResult.warnings);
    }

    // Within-file UoM category compatibility check:
    // If material has weight in Material Master: Volume + Count not allowed (Mass + anything is OK)
    // If material does NOT have weight in Material Master: All UOMs must belong to the same group
    if (
      !!dataItem["Material Code"] &&
      String(dataItem["Material Code"]).trim() !== ""
    ) {
      const materialKey = sanitizeString.v4(
        String(dataItem["Material Code"] || "")
      );

      const currentUoMCategory = getUoMCategory(
        activityMasterData?.ActivityMaster || [],
        MATERIAL_QUANTITY_PROCURED_UOM_KEY,
        String(dataItem["Material Quantity Procured UOM"] || "")
      );

      const currentUoMGroup = getUomGroup(
        activityMasterData?.ActivityMaster || [],
        MATERIAL_QUANTITY_PROCURED_UOM_KEY,
        String(dataItem["Material Quantity Procured UOM"] || "")
      );

      // Check if this material has weight configured in Material Master
      const materialHasWeight = distinctUOMsData?.OrgMaterialMaster?.some(
        (item) =>
          item?.Material_Code &&
          sanitize_compare_str_v4(String(item?.Material_Code), materialKey) &&
          item?.Material_Weight_Per_Unit !== 0 &&
          item?.Material_Weight_Per_Unit !== null &&
          !!item?.Material_Quantity_Procured_uom
      );

      if (materialHasWeight) {
        // Material has weight: Validate upload UoM against the material master's UoM category
        const matchingMaster = distinctUOMsData?.OrgMaterialMaster?.find(
          (item) =>
            item?.Material_Code &&
            sanitize_compare_str_v4(String(item?.Material_Code), materialKey)
        );
        const masterUoMValue =
          matchingMaster?.Material_Quantity_Procured_uom || "";
        const masterUoMCategory = getMaterialMasterUoMCategory(
          activityMasterData?.ActivityMaster || [],
          MATERIAL_QUANTITY_PROCURED_UOM_KEY,
          masterUoMValue
        );

        const compatResult = validateUoMCategoryCompatibility(
          currentUoMCategory,
          masterUoMCategory
        );

        if (compatResult.status === "error" && currentUoMGroup) {
          errorEntries.push({
            column: "Material Quantity Procured UOM",
            row: index,
            errorMessage: `UoM '${dataItem["Material Quantity Procured UOM"]}' (${currentUoMGroup}-based) is incompatible with master UoM '${masterUoMValue}' (${masterUoMCategory}-based) for material '${dataItem["Material Code"]}'. Volume and count-based UoMs cannot coexist. Upload blocked.`,
          });
        }
      } else {
        // Material does NOT have weight: Strict same-group enforcement
        const isDifferentUoMGroupForSameMaterial = sheet?.data?.some(
          (item, itemIndex) => {
            if (itemIndex >= sheet?.data?.indexOf(dataItem)) return false;

            const itemMaterialKey = sanitizeString.v4(
              String(item["Material Code"] || "")
            );
            if (itemMaterialKey !== materialKey) return false;

            const itemUoMGroup = getUomGroup(
              activityMasterData?.ActivityMaster || [],
              MATERIAL_QUANTITY_PROCURED_UOM_KEY,
              String(item["Material Quantity Procured UOM"] || "")
            );

            return itemUoMGroup !== currentUoMGroup;
          }
        );

        if (isDifferentUoMGroupForSameMaterial && currentUoMGroup) {
          errorEntries.push({
            column: "Material Quantity Procured UOM",
            row: index,
            errorMessage: `Material Quantity Procured UOM '${dataItem["Material Quantity Procured UOM"]}' belongs to '${currentUoMGroup}' group. All Material Quantity Procured UOMs for the same Material Code must belong to the same group.`,
          });
        }
      }
    }

    if (errorEntries.length > 0) {
      let allColumns: any =
        MaterialProcurementActivityConstant.excel_template.sheets.filter(
          (sheetItem) =>
            sanitize_compare_str_v4(sheetItem.name, sheet.sheetName)
        )[0].columns;
      const errorRow = createErrorDataForExcel(allColumns, errorEntries);
      sheetAllErrorEntries.push(errorRow[0]);
    }
  });
  return { errors: sheetAllErrorEntries, warnings: sheetAllWarningEntries };
};

const validateSheetUOMConsistencyMethods: Record<
  TMaterialProcurementActivitySheetNames,
  (
    sheet: TExcelSheet,
    organizationId: UUID
  ) => Promise<{
    errors: Record<string, any>[];
    warnings: IUoMValidationWarning[];
  }>
> = {
  "Material Procurement": validateMaterialProcurementUOMConsistencyDataSheet,
};

const validateUOMConsistency = async (
  excelData: TExcelSheet[],
  organizationId: UUID
): Promise<{
  errorSheets: TExcelSheet[];
  warnings: IUoMValidationWarning[];
}> => {
  const excelSheetData: TExcelSheet[] = [];
  const allWarnings: IUoMValidationWarning[] = [];
  const failedEntries: {
    [key in TMaterialProcurementActivitySheetNames]: Record<
      TMaterialProcurementActivitySheetColumnNames,
      any
    >[];
  } = { "Material Procurement": [] };

  for (const sheet of excelData) {
    const sheetName =
      sheet.sheetName.trim() as TMaterialProcurementActivitySheetNames;

    // Call our UOM consistency check method - now returns errors and warnings
    const result = await validateSheetUOMConsistencyMethods[sheetName](
      sheet,
      organizationId
    );

    failedEntries[sheetName] = result.errors;
    allWarnings.push(...result.warnings);

    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  }

  return { errorSheets: excelSheetData, warnings: allWarnings };
};

/**
 * Cross-Template Material Code Hard Validation (Enhancement 3)
 *
 * Checks if any material codes being uploaded to Material Procurement already have
 * activity data in Capital Goods. If conflict is found, returns a HARD ERROR.
 */
const validateCrossTemplateConflict = async (
  excelData: TExcelSheet[],
  organizationId: UUID
): Promise<TExcelSheet[]> => {
  const excelSheetData: TExcelSheet[] = [];

  // Extract unique material codes from Material Procurement sheets
  const uniqueMaterialCodes = Array.from(
    new Set(
      excelData.flatMap((sheet) =>
        sheet.data
          .map((item: Record<string, string>) => item["Material Code"])
          .filter((code) => code !== null && code !== undefined)
          .map((code) => String(code).trim())
          .filter((code) => code.length > 0)
      )
    )
  );

  if (uniqueMaterialCodes.length === 0) return excelSheetData;

  // Check for cross-template conflicts
  const conflicts = await checkConflictsForUpstreamOrMaterialProcurement(
    uniqueMaterialCodes,
    organizationId
  );

  if (conflicts.size === 0) return excelSheetData;

  // Generate error entries for conflicting rows
  for (const sheet of excelData) {
    const sheetName =
      sheet.sheetName.trim() as TMaterialProcurementActivitySheetNames;
    const sheetAllErrorEntries: Record<string, string>[] = [];
    let index = 0;

    for (const dataItem of sheet.data) {
      index++;
      const materialCode = sanitizeString.v4(
        String(dataItem["Material Code"] || "")
      );
      const conflict = conflicts.get(materialCode);

      if (conflict) {
        const errorEntries: TErrorExcelSheet[] = [
          {
            column: "Material Code",
            row: index,
            errorMessage: `Material Code '${dataItem["Material Code"]}' already has activity data in ${conflict.conflictingTemplate}. The same material code cannot exist in Upstream / Material Procurement.`,
          },
        ];

        const allColumns: any =
          MaterialProcurementActivityConstant.excel_template.sheets.filter(
            (sheetItem) =>
              sanitizeString.v1(sheetItem.name) ===
              sanitizeString.v1(sheet.sheetName)
          )[0].columns;
        const errorRow = createErrorDataForExcel(allColumns, errorEntries);
        sheetAllErrorEntries.push(errorRow[0]);
      }
    }

    excelSheetData.push({
      sheetName: sheetName,
      data: sheetAllErrorEntries,
    });
  }

  return excelSheetData;
};

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];

  const zodErrorEntries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    organizationId
  );
  const masterErrorEntries: TExcelSheet[] = await validateDataByDb(
    excelData,
    organizationId
  );

  const uomConsistencyResult = await validateUOMConsistency(
    excelData,
    organizationId
  );

  const crossTemplateErrorEntries: TExcelSheet[] =
    await validateCrossTemplateConflict(excelData, organizationId);

  allError = combineAllErrorSheets(zodErrorEntries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  allError = combineAllErrorSheets(uomConsistencyResult.errorSheets, allError);
  // allError = combineAllErrorSheets(uomConsistencyErrorEntries, allError);
  allError = combineAllErrorSheets(crossTemplateErrorEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};
