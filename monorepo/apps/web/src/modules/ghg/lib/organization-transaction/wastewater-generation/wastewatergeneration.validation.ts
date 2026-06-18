import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  ApiHitType,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  createErrorDataForExcelForMultiRowData,
  TActivityMasterData,
  TErrorExcelSheet,
  TExcelSheet,
  TTemplateErrorData,
  validateActivityMasterDataByKey,
  YearMonthSchema,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  validateColumnNames,
  validateSheetName,
} from "@/modules/ghg/lib/excel/excel.validation";
import {
  TWastewaterGenerationActivitySheetColumnNames,
  TWastewaterGenerationActivitySheetNames,
  WastewaterGenerationActivityConstant,
} from "@/modules/ghg/shared/constants/activity.constant";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";
import { months, validateMonthYear } from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } =
  WastewaterGenerationActivityConstant.excel_template;
export const wasteProducedData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Total Wastewater Generated from Domestic Use": z
        .unknown()
        .refine((val) => val !== "", {
          message: "Total Wastewater Generated from Domestic Use is required",
        })
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Total Wastewater Generated from Domestic Use"
        ) // Ensure it's a valid number
        .refine(
          (n) => n >= 0,
          "Total Wastewater Generated from Domestic Use must be zero or greater"
        ), // Ensure it's >= 0
      // .refine(
      //   (n) => {
      //     const precision = n.toString().split(".")[1]?.length ?? 0;
      //     return precision <= 2; // Allow up to 2 decimal places
      //   },
      //   {
      //     message:
      //       "Max precision is 2 decimal places",
      //   }
      //      ),
      "Total Wastewater Generated from Industrial Use": z
        .union([
          z
            .string()
            .regex(
              /^$/,
              "Invalid Total Wastewater Generated from Industrial Use"
            ), // For empty strings, reject with message
          z
            .string()
            .transform((value) => Number(value))
            .refine((n) => !isNaN(n), {
              message: "Invalid Total Wastewater Generated from Industrial Use",
            }),
          z.number(), // Allow non-negative numbers
        ])
        .transform((value) => {
          if (typeof value === "string" && value.trim() === "") {
            return 0; // Treat blank input as 0
          }
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Total Wastewater Generated from Industrial Use must be zero or greater",
        }),
      // .refine(
      //   (n) => {
      //     const precision = n.toString().split(".")[1]?.length ?? 0;
      //     return precision <= 2 && n >= 0; // Allow zero and positive values with max 2 decimals
      //   },
      //   {
      //     message:
      //       "Max precision is 2 decimal places",
      //   }
      // ),

      "UoM Wastewater": z
        .union([
          z.string().min(1, { message: "UoM Wastewater is required" }),
          z.number(), // Optional: If you want to allow number but with validation
        ])
        .refine((value) => typeof value === "string" && isNaN(Number(value)), {
          message: "Invalid input",
        }),
      "Point of Wastewater Disposal": z.string().optional().or(z.literal("")),
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

// Validate organization activity permission.
// Validate user AND location activity permission.

// Validate each excel sheet names based on activity.
// Validate each excel sheet column names based on activity.
export const validateWastewaterGenerationExcelTemplate = (
  excelData: TExcelSheet[]
) => {
  let errorMessageData: TTemplateErrorData[] = [];
  // validate sheets and column names
  let sheetswithOutData: number = excelData.filter(
    (errorItem) => errorItem.data.length > 0
  ).length;
  if (sheetswithOutData > 0) {
    templateSheets.forEach((templateSheet) => {
      //Validate sheet name
      const sheetValidations = validateSheetName(excelData, templateSheet.name);
      if (sheetValidations.length > 0) {
        errorMessageData.push({ ...sheetValidations[0] });
      }
      if (sheetValidations.length == 0) {
        // validate column names
        const templateColumnNames = templateSheet.columns.map((m) => m.name);
        const sheetData = excelData.filter(
          (sheetdata) =>
            sanitizeString.v1(sheetdata.sheetName) ==
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
    });
  } else {
    errorMessageData.push({
      sheet: "Wastewater Generation",
      error_message:
        "No data found in sheet " +
        `'${excelData.map((item) => item.sheetName)}'`,
    });
  }
  return errorMessageData;
};

const validateWastewaterGenerationDataSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = wasteProducedData(baseMonth, baseYear).safeParse(
      item
    );
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      WastewaterGenerationActivityConstant.excel_template.sheets
        .filter(
          (sheetitem) =>
            sanitizeString.v1(sheetitem.name) ==
            sanitizeString.v1(sheet.sheetName)
        )[0]
        .columns.forEach((columnItem) => {
          safeparseData.error.issues.forEach(
            (issueitem: Record<string, string>) => {
              if (!!columnObject[columnItem.name]) {
                return;
              }
              if (columnItem.name == issueitem.path[0]) {
                columnObject[columnItem.name] = issueitem.message;
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

const validateMastervalidateWastewaterGenerationExcelTemplateSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
  //  wasteMasterData: WasteMaster[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (!!dataItem["UoM Wastewater"]) {
      const errorEntriesColumn5Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM Wastewater"],
        index,
        "wastewater_uom",
        "UoM Wastewater",
        ApiHitType.Excel
      );
      if (errorEntriesColumn5Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn5Data[0] });
      }
      if (!!dataItem["Point of Wastewater Disposal"]) {
        const errorEntriesColumn4Data = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Point of Wastewater Disposal"],
          index,
          "point_of_wastewater_disposal",
          "Point of Wastewater Disposal",
          ApiHitType.Excel
        );
        if (errorEntriesColumn4Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn4Data[0] });
        }
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        WastewaterGenerationActivityConstant.excel_template.sheets.filter(
          (sheetitem) =>
            sanitizeString.v1(sheetitem.name) ==
            sanitizeString.v1(sheet.sheetName)
        )[0].columns;
      const errorrow = createErrorDataForExcel(allcolumns, errorEntries);
      sheetAllerrorEntries.push(errorrow[0]);
    }
  });
  return sheetAllerrorEntries;
};

const validateSheetMethods: Record<
  TWastewaterGenerationActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Wastewater Generation": validateWastewaterGenerationDataSheet,
};

const validateMasterDataSheetMethods: Record<
  TWastewaterGenerationActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
    //    wasteMasterData: WasteMaster[]
  ) => Record<string, any>[]
> = {
  "Wastewater Generation":
    validateMastervalidateWastewaterGenerationExcelTemplateSheet,
};

const WastewaterGenerationDataValidate = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TWastewaterGenerationActivitySheetNames]: Record<
      TWastewaterGenerationActivitySheetColumnNames,
      any
    >[];
  } = { "Wastewater Generation": [] };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWastewaterGenerationActivitySheetNames;
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

const WastewaterGenerationDataValidateByDB = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.wastewater_generation,
  });
  // Get Waste Master data
  //  const { WasteMaster: wasteMasterData } = await sdk.GetWasteMaster();
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TWastewaterGenerationActivitySheetNames]: Record<
      TWastewaterGenerationActivitySheetColumnNames,
      any
    >[];
  } = { "Wastewater Generation": [] };

  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWastewaterGenerationActivitySheetNames;
    failedEntries[sheetName] = validateMasterDataSheetMethods[sheetName](
      sheet,
      activityMasterData?.ActivityMaster
      // wasteMasterData as WasteMaster[]
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

// Validate each excel sheet cells based on column data type.
export const validateWastewaterGenerationExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] =
    await WastewaterGenerationDataValidate(excelData, organizationId);

  const masterErrorEntries: TExcelSheet[] =
    await WastewaterGenerationDataValidateByDB(excelData, organizationId);
  // duplicate validations
  const duplicaterEntries: TExcelSheet[] =
    await handleCheckDuplicates(excelData);
  // duplicate validations
  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  allError = combineAllErrorSheets(duplicaterEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};

// duplicate validations
const handleCheckDuplicates = async (excelData: TExcelSheet[]) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TWastewaterGenerationActivitySheetNames]: Record<
      TWastewaterGenerationActivitySheetColumnNames,
      any
    >[];
  } = { "Wastewater Generation": [] };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWastewaterGenerationActivitySheetNames;
    failedEntries[sheetName] = validateduplicateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};
const validateWastewaterGenerationduplicateDataSheet = (sheet: TExcelSheet) => {
  let sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  const dataAllKeys = sheet.data.map((item, index) => {
    return {
      row: index + 1,
      key: !!item["Point of Wastewater Disposal"]
        ? `${item["Year"]}-${item["Month"]}-${item["Point of Wastewater Disposal"]}`
        : `${item["Year"]}-${item["Month"]}`,
      PointOfDisposalIsNotBlank: !!item["Point of Wastewater Disposal"],
    };
  });
  const exceptrows: number[] = [];
  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    if (exceptrows.filter((items) => items == index + 1).length == 0) {
      /// Validation of Columns value from Master Data
      // Check that "Type of waste generated" must be exist in "WasteMaster" Table

      if (!!dataItem["Year"] && !!dataItem["Month"]) {
        const currentUniqueKey = !!dataItem["Point of Wastewater Disposal"]
          ? `${dataItem["Year"]}-${dataItem["Month"]}-${dataItem["Point of Wastewater Disposal"]}`
          : `${dataItem["Year"]}-${dataItem["Month"]}`;
        const duplicateData = dataAllKeys.filter(
          (items) => items.key == currentUniqueKey
        );
        if (duplicateData.length > 1) {
          duplicateData.forEach((dataItems) => {
            exceptrows.push(dataItems?.row);
            if (dataItems?.PointOfDisposalIsNotBlank) {
              errorEntries.push({
                column: "Point of Wastewater Disposal",
                row: dataItems?.row,
                errorMessage:
                  "Duplicate Entry Detected: This record already exists. Please enter unique data.",
              });
            }
            errorEntries.push({
              column: "Month",
              row: dataItems?.row,
              errorMessage:
                "Duplicate Entry Detected: This record already exists. Please enter unique data.",
            });
            errorEntries.push({
              column: "Year",
              row: dataItems?.row,
              errorMessage:
                "Duplicate Entry Detected: This record already exists. Please enter unique data.",
            });
          });
        }
      }

      if (errorEntries.length > 0) {
        let allcolumns: any =
          WastewaterGenerationActivityConstant.excel_template.sheets.filter(
            (sheetitem) =>
              sanitizeString.v1(sheetitem.name) ==
              sanitizeString.v1(sheet.sheetName)
          )[0].columns;
        const errorrow = createErrorDataForExcelForMultiRowData(
          allcolumns,
          errorEntries
        );
        sheetAllerrorEntries = [...sheetAllerrorEntries, ...errorrow];
      }
    }
    index++;
  });
  return sheetAllerrorEntries;
};

const validateduplicateSheetMethods: Record<
  TWastewaterGenerationActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  "Wastewater Generation": validateWastewaterGenerationduplicateDataSheet,
};
// duplicate validations
// After data tranformation, validate data fields as per GHG specification.
