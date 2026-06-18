import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  ApiHitType,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
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
  TWaterWithdrawalActivitySheetColumnCodes,
  TWaterWithdrawalActivitySheetColumnNames,
  TWaterWithdrawalActivitySheetNames,
  WaterWithdrawalActivityConstant,
} from "@/modules/ghg/shared/constants/activity.constant";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";
import { months, validateMonthYear } from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
const { sheets: templateSheets } =
  WaterWithdrawalActivityConstant.excel_template;
let yearMonthError: TErrorExcelSheet[] = [];

export const waterWithdrawalData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Total Fresh Water Withdrawal": z
        .unknown()
        .refine((val) => val !== "", {
          message: "Total Fresh Water Withdrawal is required",
        })
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Entry: Please enter a valid numeric value for Total Fresh Water Withdrawal. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Total Fresh Water Withdrawal cannot be negative. Please enter a positive number."
        ),
      "UoM Freshwater": z.unknown().refine((val) => val !== "", {
        message: "UoM Freshwater is required",
      }),
      "Source of Fresh Water": z.unknown().refine((val) => val !== "", {
        message: "Source of Fresh Water is required",
      }),
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

const validateWaterWithdrawalDataSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  const seen = new Set(); // Set to track duplicates
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = waterWithdrawalData(baseMonth, baseYear).safeParse(
      item
    );
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      WaterWithdrawalActivityConstant.excel_template.sheets
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

const validateMasterWaterWithdrawalDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data

    const errorEntriesColumn1Data = validateActivityMasterDataByKey(
      ActivityMasterData,
      dataItem["UoM Freshwater"],
      index,
      "water_withdrawal_uom",
      "UoM Freshwater",
      ApiHitType.Excel
    );
    if (errorEntriesColumn1Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn1Data[0] });
    }

    const errorEntriesColumn2Data = validateActivityMasterDataByKey(
      ActivityMasterData,
      dataItem["Source of Fresh Water"],
      index,
      "water_withdrawal_Source",
      "Source of Fresh Water",
      ApiHitType.Excel
    );
    if (errorEntriesColumn2Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn2Data[0] });
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        WaterWithdrawalActivityConstant.excel_template.sheets.filter(
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
  TWaterWithdrawalActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Water Withdrawal": validateWaterWithdrawalDataSheet,
};

const validateMasterDataSheetMethods: Record<
  TWaterWithdrawalActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Water Withdrawal": validateMasterWaterWithdrawalDataSheet,
};

const waterWithdrawalDataValidate = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TWaterWithdrawalActivitySheetNames]: Record<
      TWaterWithdrawalActivitySheetColumnNames,
      any
    >[];
  } = { "Water Withdrawal": [] };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWaterWithdrawalActivitySheetNames;
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

const waterWithdrawalDataValidateByDB = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.water_withdrawal,
  });
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TWaterWithdrawalActivitySheetNames]: Record<
      TWaterWithdrawalActivitySheetColumnNames,
      any
    >[];
  } = { "Water Withdrawal": [] };

  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWaterWithdrawalActivitySheetNames;

    failedEntries[sheetName] = validateMasterDataSheetMethods[sheetName](
      sheet,
      activityMasterData?.ActivityMaster
    );

    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

export const validateWaterWithdrawalExcelTemplate = (
  excelData: TExcelSheet[]
) => {
  let errorMessageData: TTemplateErrorData[] = [];
  const sheets = WaterWithdrawalActivityConstant.excel_template.sheets;
  sheets.forEach((sheetObj) => {
    const sheetData = excelData.find(
      (sheet) =>
        sanitizeString.v2(sheet.sheetName) === sanitizeString.v2(sheetObj.name)
    );
    // validate sheets and column names
    let sheetswithOutData: number = excelData.filter(
      (errorItem) => errorItem.data.length > 0
    ).length;
    if (!!sheetData) {
      if (sheetswithOutData > 0) {
        templateSheets.forEach((templateSheet) => {
          //Validate sheet name
          const sheetValidations = validateSheetName(
            excelData,
            templateSheet.name
          );
          if (sheetValidations.length > 0) {
            errorMessageData.push({ ...sheetValidations[0] });
          }
          if (sheetValidations.length == 0) {
            // validate column names
            const templateColumnNames = templateSheet.columns.map(
              (m) => m.name
            );
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
                  error_message:
                    "Maximum 10,000 records can be uploaded at a time",
                });
              }
            }
          }
        });
      } else {
        errorMessageData.push({
          sheet: "Water withdrawal",
          error_message:
            "No data found in sheet " +
            `'${excelData.map((item) => item.sheetName)}'`,
        });
      }
    } else {
      const error_message = `Sheet '${sheetObj.name}' not found`;
      errorMessageData.push({ sheet: "", error_message });
    }
  });
  return errorMessageData;
};

// Validate each excel sheet cells based on column data type.
export const validateWaterWithdrawalExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] = await waterWithdrawalDataValidate(
    excelData,
    organizationId
  );

  const masterErrorEntries: TExcelSheet[] =
    await waterWithdrawalDataValidateByDB(excelData, organizationId);

  // duplicate validations
  const duplicaterEntries: TExcelSheet[] =
    await handleCheckDuplicates(excelData);
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
    [key in TWaterWithdrawalActivitySheetNames]: Record<
      TWaterWithdrawalActivitySheetColumnCodes,
      any
    >[];
  } = { "Water Withdrawal": [] };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWaterWithdrawalActivitySheetNames;
    failedEntries[sheetName] = validateduplicateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

const validateWaterWithdrawalduplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data

    if (
      !!dataItem["Source of Fresh Water"] &&
      !!dataItem["Year"] &&
      !!dataItem["Month"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "Source of Fresh Water",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["Source of Fresh Water"],
        sheet
      );
      if (errorEntriesColumn5Data.length > 0) {
        for (let i = 0; i < errorEntriesColumn5Data.length; i++) {
          errorEntries.push({ ...errorEntriesColumn5Data[i] });
        }
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        WaterWithdrawalActivityConstant.excel_template.sheets.filter(
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

const validateduplicateSheetMethods: Record<
  TWaterWithdrawalActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  "Water Withdrawal": validateWaterWithdrawalduplicateDataSheet,
};

export const validateduplidateDataByKey = (
  index: number,
  columnName: string,
  Year: string,
  month: string,
  source_of_fresh_water: string,
  sheet: TExcelSheet
) => {
  const errorEntries: TErrorExcelSheet[] = [];
  const duplicateEntries: Record<string, string>[] = [];
  /// checking either data of excel is correct according to master data or not
  let length: number = 0;
  let index1: number = 0;
  const seenEntries = new Set<string>();
  sheet.data.forEach((item: Record<string, string>) => {
    index1++;
    let columnObject: any = {};

    // Generate a unique key based on the relevant fields (adjust as needed)
    const uniqueKeyindex = `${Year}-${month}-${source_of_fresh_water}`; // Replace 'Column1' and 'Column2' with actual column names
    const uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${item["Source of Fresh Water"]}`;
    if (uniqueKeyrow === uniqueKeyindex) {
      // Check for duplicates
      if (seenEntries.has(uniqueKeyrow)) {
        columnObject["Row Number"] = index1;
        columnObject["Error"] = "Duplicate entry detected";
        duplicateEntries.push(columnObject);
      } else {
        seenEntries.add(uniqueKeyrow); // Mark the current entry as seen
      }
    }
  });
  length = duplicateEntries.length;
  if (length > 0) {
    errorEntries.push({
      column: columnName,
      row: index,
      errorMessage:
        "Duplicate Entry Detected: This record already exists. Please enter unique data.",
    });
    errorEntries.push({
      column: "Year",
      row: index,
      errorMessage:
        "Duplicate Entry Detected: This record already exists. Please enter unique data.",
    });
    errorEntries.push({
      column: "Month",
      row: index,
      errorMessage:
        "Duplicate Entry Detected: This record already exists. Please enter unique data.",
    });
  }
  return errorEntries;
};
// duplicate validations
