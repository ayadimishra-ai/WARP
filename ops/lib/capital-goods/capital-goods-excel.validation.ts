import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery,
  OrgMaterialMaster,
} from "~/graphql/shared/types";
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
import {
  CAPITAL_GOODS,
  CapitalGoodsActivityConstant,
  TCapitalGoodsActivitySheetColumnNames,
  TCapitalGoodsActivitySheetNames,
} from "~/shared/constants/activity.constant";
import {
  ActivityMasterKey,
  CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY,
  MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
} from "~/shared/constants/input.constant";
import { sanitize_compare_str_v4 } from "~/utils/comapre.util";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
import {
  checkConflictsForCapitalGoods,
  validateCrossTemplateForBatch,
} from "../cross-template-validation/cross-template-validation.service";
import { getUomGroup } from "../material-conversion/material-conversion.service";
import {
  getMaterialMasterUoMCategory,
  getUoMCategory,
  validateUoMCategoryCompatibility,
} from "../uom-category/uom-category.service";
import type {
  IBulkUploadValidationResult,
  IUoMValidationWarning,
} from "../uom-category/uom-validation-warning.types";

const { sheets: templateSheets } = CapitalGoodsActivityConstant.excel_template;

let yearMonthError: TErrorExcelSheet[] = [];

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

const capitalGoodsSchema = (baseMonth: string, baseYear: number) => {
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
      "Quantity Procured": z
        .union([z.number(), z.string()])
        .refine(
          (val) => {
            if (typeof val === "string" && val.length === 0) {
              return false;
            }
            return true;
          },
          {
            message: "Quantity Procured is required.",
          }
        )
        .refine(
          (val) => {
            const stringVal = String(val).trim();

            // Only allow digits and decimal point (no negative numbers, letters, %, or other special characters)
            return /^\d*\.?\d+$/.test(stringVal);
          },
          {
            message: "Invalid Entry : Please enter a valid numeric value.",
          }
        )
        .refine(
          (val) => {
            const numberVal = typeof val === "string" ? Number(val) : val;
            return !isNaN(numberVal);
          },
          {
            message: "Invalid Entry : Please enter a valid numeric value.",
          }
        )
        .refine(
          (n) => {
            const value = Number(n);
            return value >= 0.01;
          },
          {
            message: "Quantity Procured must be at least 0.01",
          }
        )
        .refine(
          (n) => {
            const value = Number(n);
            return value <= 999999999.99;
          },
          {
            message: "Quantity Procured must not exceed 999,999,999.99",
          }
        )
        .refine(
          (n) => {
            const value = Number(n);
            const decimalPart = value.toString().split(".")[1];
            return !decimalPart || decimalPart.length <= 2;
          },
          {
            message: "Quantity Procured must have maximum 2 decimal places",
          }
        ),
      UOM: z
        .string({
          required_error: "UOM is required",
          invalid_type_error:
            "Invalid Input : Only alphabetic characters are allowed for UOM",
        })
        .min(1, { message: "UOM is required" }),
    })
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (month) => sanitizeString.v1(month) == sanitizeString.v1(Month)
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

const validateCapitalGoodsSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeParseData: any = capitalGoodsSchema(baseMonth, baseYear).safeParse(
      item
    );
    if (!safeParseData.success) {
      columnObject["Row Number"] = index;
      CapitalGoodsActivityConstant.excel_template.sheets
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
  TCapitalGoodsActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Capital Goods": validateCapitalGoodsSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TCapitalGoodsActivitySheetNames]: Record<
      TCapitalGoodsActivitySheetColumnNames,
      any
    >[];
  } = { "Capital Goods": [] };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TCapitalGoodsActivitySheetNames;
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

const validateCapitalGoodsDataSheet = (
  sheet: TExcelSheet,
  activityMasterData: TActivityMasterData[],
  existingMaterialMasters: OrgMaterialMaster[]
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((dataItem: Record<string, string>) => {
    const errorEntries: TErrorExcelSheet[] = [];
    index++;
    // Validation of Columns value from Master Data
    const errorEntriesColumn1Data = validateActivityMasterDataByKey(
      activityMasterData,
      dataItem["UOM"],
      index,
      ActivityMasterKey.capital_goods[0],
      "UOM",
      ApiHitType.Excel
    );
    if (errorEntriesColumn1Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn1Data[0] });
    }

    // Check that material code must be "Capital Goods" to OrgMaterialMaster Table from existingMaterialMasters
    const materialCodeLower = sanitizeString.v4(
      String(dataItem["Material Code"] || "")
    );
    const materialMasters =
      existingMaterialMasters?.filter(
        (master) =>
          master?.code && sanitizeString.v4(master?.code) === materialCodeLower
      ) || [];
    if (
      materialCodeLower.length > 0 &&
      materialMasters.length > 0 &&
      sanitizeString.v4(materialMasters?.[0]?.type) !==
        sanitizeString.v4(CAPITAL_GOODS)
    ) {
      errorEntries.push({
        column: "Material Code",
        row: index,
        errorMessage: `Material Code '${dataItem["Material Code"]}' is not defined as Capital Goods in Material Master. Only materials with Material Type = 'Capital Goods' can be used in this template.`,
      });
    }

    // Deffered, Duplicate are allowed
    // Duplicate records not allowed validation for same month, year, Material Code, Supplier Code, Quantity Procured and UoM
    // const currentRecordKey = `${dataItem["Year"]}-${dataItem["Month"]}-${sanitizeString.v4(
    //   String(dataItem["Material Code"] || "")
    // )}-${sanitizeString.v4(
    //   String(dataItem["Supplier Code"] || "")
    // )}-${dataItem["Quantity Procured"]}-${sanitizeString.v4(
    //   String(dataItem["UoM"] || "")
    // )}`;

    // const isDuplicate = sheet?.data?.some((item, itemIndex) => {
    //   if (itemIndex >= sheet?.data?.indexOf(dataItem)) return false; // Only check previous rows

    //   const itemKey = `${item["Year"]}-${item["Month"]}-${sanitizeString.v4(
    //     String(item["Material Code"] || "")
    //   )}-${sanitizeString.v4(
    //     String(item["Supplier Code"] || "")
    //   )}-${item["Quantity Procured"]}-${sanitizeString.v4(String(item["UoM"] || ""))}`;

    //   return itemKey === currentRecordKey;
    // });

    // if (isDuplicate) {
    //   errorEntries.push({
    //     column: "Quantity Procured",
    //     row: index,
    //     errorMessage: `Duplicate record found. Records with same Month, Year, Material Code, Supplier Code, Quantity Procured, and UoM are not allowed.`,
    //   });
    // }

    // Within-file UoM category compatibility check:
    // If material has weight in Material Master: Volume + Count not allowed (Mass + anything is OK)
    // If material does NOT have weight in Material Master: All UOMs must belong to the same group
    const yearMonthMaterialKey = `${sanitizeString.v4(String(dataItem["Material Code"] || ""))}`;
    const currentUoM = sanitizeString.v4(String(dataItem["UOM"] || ""));

    // Get UoM master data from the activity master data
    const uoMMasterArray =
      activityMasterData
        ?.filter(
          (master) =>
            sanitizeString.v4(String(master?.master_key || "")) ===
            sanitizeString.v4(CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY)
        )
        .flatMap((master) => master?.master_data || []) || [];

    // Find the UoM master data for the current row
    const currentUoMMaster = uoMMasterArray?.find(
      (master) => sanitizeString.v4(String(master?.value || "")) === currentUoM
    );
    const currentUoMGroup = currentUoMMaster?.group?.[0];

    // Check if this material has weight configured in Material Master
    const materialCodeLowerForWeight = sanitizeString.v4(
      String(dataItem["Material Code"] || "")
    );
    const materialHasWeight = existingMaterialMasters?.some(
      (master) =>
        master?.code &&
        sanitizeString.v4(master?.code) === materialCodeLowerForWeight &&
        master?.Material_Weight_Per_Unit !== 0 &&
        master?.Material_Weight_Per_Unit !== null &&
        !!master?.UoM_Material_Weight
    );

    if (materialHasWeight) {
      // Material has weight: Validate upload UoM against the material master's UoM category
      const currentUoMCategory = getUoMCategory(
        activityMasterData,
        CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY,
        String(dataItem["UOM"] || "")
      );

      // Get the material master's UoM value and derive its category
      const matchingMaster = existingMaterialMasters?.find(
        (master) =>
          master?.code &&
          sanitizeString.v4(master?.code) === materialCodeLowerForWeight
      );
      const masterUoMValue = matchingMaster?.UoM_Material_Weight || "";
      const masterUoMCategory = getMaterialMasterUoMCategory(
        activityMasterData,
        CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY,
        masterUoMValue
      );

      const compatResult = validateUoMCategoryCompatibility(
        currentUoMCategory,
        masterUoMCategory
      );

      if (compatResult.status === "error" && currentUoMGroup) {
        errorEntries.push({
          column: "UOM",
          row: index,
          errorMessage: `UoM '${dataItem["UOM"]}' (${currentUoMGroup}-based) is incompatible with master UoM '${masterUoMValue}' (${masterUoMCategory}-based) for material '${dataItem["Material Code"]}'. Volume and count-based UoMs cannot coexist. Upload blocked.`,
        });
      }
    } else {
      // Material does NOT have weight: Strict same-group enforcement
      const isDifferentUoMGroupForSameMaterial = sheet?.data?.some(
        (item, itemIndex) => {
          if (itemIndex >= sheet?.data?.indexOf(dataItem)) return false;

          const itemYearMonthMaterialKey = `${sanitizeString.v4(String(item["Material Code"] || ""))}`;
          if (itemYearMonthMaterialKey !== yearMonthMaterialKey) return false;

          const itemUoM = sanitizeString.v4(String(item["UOM"] || ""));
          const itemUoMMaster = uoMMasterArray?.find(
            (master) =>
              sanitizeString.v4(String(master?.value || "")) === itemUoM
          );
          const itemUoMGroup = itemUoMMaster?.group?.[0];

          return itemUoMGroup !== currentUoMGroup;
        }
      );

      if (isDifferentUoMGroupForSameMaterial && currentUoMGroup) {
        errorEntries.push({
          column: "UOM",
          row: index,
          errorMessage: `UOM '${dataItem["UOM"]}' belongs to '${currentUoMGroup}' group. All UOMs for the same Material Code must belong to the same group.`,
        });
      }
    }

    if (errorEntries.length > 0) {
      let allColumns: any =
        CapitalGoodsActivityConstant.excel_template.sheets.filter(
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
  TCapitalGoodsActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[],
    existingMaterialMasters: OrgMaterialMaster[]
  ) => Record<string, any>[]
> = {
  "Capital Goods": validateCapitalGoodsDataSheet,
};

const validateDataByDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.capital_goods,
  });

  // Extract unique material codes from Capital Goods sheet in lowercase, excluding blank/null/undefined
  const uniqueMaterialCodes = Array.from(
    new Set(
      excelData
        .filter(
          (sheet) =>
            sanitizeString.v4(sheet.sheetName) ===
            sanitizeString.v4("Capital Goods")
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

  // Build dynamic where condition for case-insensitive code matching
  const whereCondition = {
    _and: [
      {
        _or: uniqueMaterialCodes.map((code) => ({
          code: { _ilike: code },
        })),
      },
      {
        organization_id: { _eq: organizationId },
      },
      {
        is_deleted: { _eq: false },
      },
    ],
  };

  const existingMaterialMasters =
    await sdk.getOrgMaterialMasterByCodesInsensitive({
      where: whereCondition,
    });

  // Cross-template validation: Check if any material codes have conflicting template usage
  const crossTemplateErrors = await validateCrossTemplateForBatch(
    uniqueMaterialCodes,
    "capital_goods",
    organizationId as UUID
  );

  const failedEntries: {
    [key in TCapitalGoodsActivitySheetNames]: Record<
      TCapitalGoodsActivitySheetColumnNames,
      any
    >[];
  } = { "Capital Goods": [] };
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TCapitalGoodsActivitySheetNames;

    // Run master data validation
    const masterDataErrors = validateSheetMasterDataMethods[sheetName](
      sheet,
      activityMasterData?.ActivityMaster,
      (existingMaterialMasters?.OrgMaterialMaster as OrgMaterialMaster[]) || []
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
            CapitalGoodsActivityConstant.excel_template.sheets.filter(
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
  });
  return excelSheetData;
};

const validateUOMConsistencyByUoMGroup = (
  distinctUOMsData: GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery,
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
      sanitize_compare_str_v4(String(item?.Material_ID), String(materialCode))
    ) {
      existingUpstreamTransportUOMs.add(
        String(item?.Material_Quantity_Procured_uom)
      );
    }
  });

  const existingCapitalGoodsUOMs = new Set<string>();
  distinctUOMsData?.GHGCapital_Goods?.map((item) => {
    if (
      item?.Quantity_Procured_uom &&
      sanitize_compare_str_v4(String(item?.Material_Code), String(materialCode))
    ) {
      existingCapitalGoodsUOMs.add(String(item?.Quantity_Procured_uom));
    }
  });

  const existingMaterialMasterUOMs = new Set<string>();
  distinctUOMsData?.OrgMaterialMaster?.map((item) => {
    if (
      item?.code &&
      sanitize_compare_str_v4(String(item?.code), String(materialCode)) &&
      item?.Material_Weight_Per_Unit !== 0 &&
      item?.UoM_Material_Weight
    ) {
      existingMaterialMasterUOMs.add(String(item?.UoM_Material_Weight));
    }
  });

  // Get upload UoM category
  const currentMaterialUomCategory = getUoMCategory(
    activityMasterData,
    CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY,
    String(materialUom)
  );

  const currentMaterialUomGroup =
    getUomGroup(
      activityMasterData,
      CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY,
      String(materialUom)
    ) ?? "";

  // Check upstream transport UoM consistency with category compatibility
  for (const uom of existingUpstreamTransportUOMs) {
    const existingGroup = getUomGroup(
      activityMasterData,
      "transport_upstream_Material_Quantity_Procured_UOM",
      String(uom)
    );

    if (existingGroup && existingGroup !== currentMaterialUomGroup) {
      const existingCategory = getUoMCategory(
        activityMasterData,
        "transport_upstream_Material_Quantity_Procured_UOM",
        String(uom)
      );

      const compatResult = validateUoMCategoryCompatibility(
        currentMaterialUomCategory,
        existingCategory
      );

      if (compatResult.status === "error") {
        // Hard error: incompatible categories (e.g., Volume ↔ Count)
        errorEntries.push({
          column: columnName,
          row: index,
          errorMessage: `UOM '${materialUom}' (${currentMaterialUomCategory}) is incompatible with existing upstream transport UOM '${uom}' (${existingCategory}). ${compatResult.reason}`,
        });
      } else if (compatResult.status === "warning") {
        // Warning: accepted but flagged
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
      // If "pass" (mass-based), no error or warning needed
      break; // Only need to check one mismatch per source
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
            "transport_upstream_Material_Quantity_Procured_UOM",
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
        // Hard error: incompatible categories
        errorEntries.push({
          column: columnName,
          row: index,
          // errorMessage: `UOM '${materialUom}' (${currentMaterialUomCategory}) is incompatible with material master UOM '${uom}' (${existingCategory}). ${compatResult.reason}`,
          errorMessage: `UOM '${materialUom}' (${currentMaterialUomCategory}-based) is incompatible with master UOM '${uom}' (${existingCategory}-based) for '${materialCode}'. Volume and count-based UoMs cannot coexist.`,
        });
      } else if (compatResult.status === "warning") {
        // Warning: accepted but flagged
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

const validateCapitalGoodsUOMConsistencyDataSheet = async (
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
      ...ActivityMasterKey.capital_goods,
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

  // Get distinct UOMs from existing upstream data for the specific material codes
  const distinctUOMsData =
    await sdk.getDistinctUOMsUpstreamCapitalGoodsByMaterialCodes({
      whereUpstream: {
        _or: materialCodes.map((code) => ({
          Material_ID: { _ilike: code },
        })),
        Material_Quantity_Procured_uom: { _is_null: false },
        OrganizationAddress: {
          organization_id: { _eq: organizationId },
        },
      },
      whereCapitalGoods: {
        _or: materialCodes.map((code) => ({
          Material_Code: { _ilike: code },
        })),
        Quantity_Procured_uom: { _is_null: false },
        OrganizationAddress: {
          organization_id: { _eq: organizationId },
        },
      },
      whereMaterialMaster: {
        _and: [
          {
            _or: materialCodes.map((code) => ({
              code: { _ilike: code },
            })),
          },
          {
            organization_id: { _eq: organizationId },
          },
        ],
      },
    });

  sheet.data.forEach((dataItem: Record<string, string>) => {
    const errorEntries: TErrorExcelSheet[] = [];
    index++;

    // Validation of Columns value from Master Data - now returns both errors and warnings
    const validationResult = validateUOMConsistencyByUoMGroup(
      distinctUOMsData as GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery,
      String(dataItem["Material Code"]),
      String(dataItem["UOM"]),
      "UOM",
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

    if (errorEntries.length > 0) {
      let allColumns: any =
        CapitalGoodsActivityConstant.excel_template.sheets.filter((sheetItem) =>
          sanitize_compare_str_v4(sheetItem.name, sheet.sheetName)
        )[0].columns;
      const errorRow = createErrorDataForExcel(allColumns, errorEntries);
      sheetAllErrorEntries.push(errorRow[0]);
    }
  });
  return { errors: sheetAllErrorEntries, warnings: sheetAllWarningEntries };
};

const validateSheetUOMConsistencyMethods: Record<
  TCapitalGoodsActivitySheetNames,
  (
    sheet: TExcelSheet,
    organizationId: UUID
  ) => Promise<{
    errors: Record<string, any>[];
    warnings: IUoMValidationWarning[];
  }>
> = {
  "Capital Goods": validateCapitalGoodsUOMConsistencyDataSheet,
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
    [key in TCapitalGoodsActivitySheetNames]: Record<
      TCapitalGoodsActivitySheetColumnNames,
      any
    >[];
  } = { "Capital Goods": [] };

  for (const sheet of excelData) {
    const sheetName = sheet.sheetName.trim() as TCapitalGoodsActivitySheetNames;

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
 * Checks if any material codes being uploaded to Capital Goods already have
 * activity data in Upstream Transport or Material Procurement.
 * If conflict is found, returns a HARD ERROR for those rows.
 */
const validateCrossTemplateConflict = async (
  excelData: TExcelSheet[],
  organizationId: UUID
): Promise<TExcelSheet[]> => {
  const excelSheetData: TExcelSheet[] = [];

  // Extract unique material codes from Capital Goods sheet
  const uniqueMaterialCodes = Array.from(
    new Set(
      excelData
        .filter(
          (sheet) =>
            sanitizeString.v4(sheet.sheetName) ===
            sanitizeString.v4("Capital Goods")
        )
        .flatMap((sheet) =>
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
  const conflicts = await checkConflictsForCapitalGoods(
    uniqueMaterialCodes,
    organizationId
  );

  if (conflicts.size === 0) return excelSheetData;

  // Generate error entries for conflicting rows
  for (const sheet of excelData) {
    const sheetName = sheet.sheetName.trim() as TCapitalGoodsActivitySheetNames;
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
            errorMessage: `Material Code '${dataItem["Material Code"]}' is defined as Upstream / Material Procurement type in Material Master or already has activity data in Upstream / Material Procurement. The same material code cannot exist in Capital Goods.`,
          },
        ];

        const allColumns: any =
          CapitalGoodsActivityConstant.excel_template.sheets.filter(
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
): Promise<IBulkUploadValidationResult> => {
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

  return {
    errorSheets: finalError,
    warningEntries: uomConsistencyResult.warnings,
  };
};
