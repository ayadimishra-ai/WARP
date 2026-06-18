import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
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
} from "~/lib/excel/excel.service";
import {
  validateColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import {
  GrievancesActivityConstant,
  TGrievancesActivitySheetColumnNames,
  TGrievancesActivitySheetNames,
} from "~/shared/constants/activity.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import { errmsg_excel_template_sheet_no_data } from "~/shared/error/messages";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } = GrievancesActivityConstant.excel_template;
const noSpecialCharsRegex = /^[a-zA-Z0-9\s().,'"/-]+$/;
const noNegativeCharRegex = /^(?!-)[a-zA-Z0-9\s().,'"/&-]+$/;

export const grievancesValidationSchema = (
  baseMonth: string,
  baseYear: number
) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Grievance Category": z
        .any()
        .optional()
        .refine(
          (val) =>
            val === undefined || val === "" || noNegativeCharRegex.test(val),
          {
            message:
              "Invalid input: Please enter only alphanumeric characters. Allowed symbols are ( ) . , / - &'",
          }
        ),
      "Stakeholder Category": z
        .any()
        .optional()
        .refine(
          (val) => {
            // Allow undefined
            if (val === undefined) return true;
            // Allow blank
            if (val === "") return true;
            // Reject numbers explicitly
            if (typeof val === "number") return false;
            // If string, test regex
            return noSpecialCharsRegex.test(val);
          },
          {
            message: "Invalid Stakeholder Category",
          }
        ),
      "Total Number of Complaints": z
        .union([
          z.literal("").transform(() => undefined),
          z
            .union([z.string(), z.number()])
            .refine(
              (val) => {
                const strVal = String(val);
                return /^-?\d*\.?\d*$/.test(strVal);
              },
              {
                message:
                  "Invalid Input: Please enter a valid numeric value for Total Number of Complaints. Text or special characters are not allowed.",
              }
            )
            .refine(
              (val) => {
                const strVal = String(val);
                return !strVal.includes(".") || /^-?\d+$/.test(strVal);
              },
              {
                message:
                  "Invalid Input: The value for Total Number of Complaints cannot be a decimal. Please enter a whole number.",
              }
            )
            .transform((val) => Number(val))
            .refine(
              (n) => n >= 0,
              "Invalid Input: The value for Total Number of Complaints must be a positive number greater than equal to zero."
            ),
        ])
        .optional(),

      "New Complaints (Reporting period)": z
        .unknown()
        .refine((q) => !(String(q).trim() === ""), {
          message: "New Complaints (Reporting period) is required",
        })
        .refine(
          (val) => {
            const strVal = String(val);
            return /^-?\d*\.?\d*$/.test(strVal);
          },
          {
            message:
              "Invalid Input: Please enter a valid numeric value for New Complaints (Reporting period). Text or special characters are not allowed.",
          }
        )
        .refine(
          (val) => {
            const strVal = String(val);
            return !strVal.includes(".") || /^-?\d+$/.test(strVal);
          },
          {
            message:
              "Invalid Input: The value for New Complaints (Reporting period) cannot be a decimal. Please enter a whole number.",
          }
        )
        .transform((val) => Number(val))
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for New Complaints (Reporting period) must be a positive number greater than equal to zero."
        ),

      "Complaints Resolved (Reporting period)": z
        .unknown()
        .refine((q) => !(String(q).trim() === ""), {
          message: "Complaints Resolved (Reporting period) is required",
        })
        .refine(
          (val) => {
            const strVal = String(val);
            return /^-?\d*\.?\d*$/.test(strVal);
          },
          {
            message:
              "Invalid Input: Please enter a valid numeric value for Complaints Resolved (Reporting period). Text or special characters are not allowed.",
          }
        )
        .refine(
          (val) => {
            const strVal = String(val);
            return !strVal.includes(".") || /^-?\d+$/.test(strVal);
          },
          {
            message:
              "Invalid Input: The value for Complaints Resolved (Reporting period) cannot be a decimal. Please enter a whole number.",
          }
        )
        .transform((val) => Number(val))
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Complaints Resolved (Reporting period) must be a positive number greater than equal to zero."
        ),
    })
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (month) =>
            sanitizeString.v1(month) ==
            sanitizeString.v1(Month?.toString() || "")
        );
        if (fullNameMonth.length > 0) {
          yearMonthError = validateMonthYear(
            Month?.toString() || "",
            Number(Year),
            baseMonth,
            baseYear
          );
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

//call zod validation methods from this method.
const validateGrievancesDataSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any;

    safeparseData = grievancesValidationSchema(baseMonth, baseYear).safeParse(
      item
    );

    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      GrievancesActivityConstant.excel_template.sheets
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

const validateSheetMethods: Record<
  TGrievancesActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  Grievances: validateGrievancesDataSheet,
};

const GrievancesDataValidate = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TGrievancesActivitySheetNames]: Record<
      TGrievancesActivitySheetNames,
      any
    >[];
  } = {
    Grievances: [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TGrievancesActivitySheetNames;
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

//#region Master data validation

const validateGrievancesMasterData = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Stakeholder Category"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Stakeholder Category"],
        index,
        "Grievances_Stakeholder_Category",
        "Stakeholder Category",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        GrievancesActivityConstant.excel_template.sheets.filter(
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
const validateDataByDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.grievances,
  });
  const failedEntries: {
    [key in TGrievancesActivitySheetNames]: Record<
      TGrievancesActivitySheetColumnNames,
      any
    >[];
  } = { Grievances: [] };
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TGrievancesActivitySheetNames;
    failedEntries[sheetName] = validateSheetMasterDataMethods[sheetName](
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
const validateSheetMasterDataMethods: Record<
  TGrievancesActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  Grievances: validateGrievancesMasterData,
};

//end region

//#region template validation
// Validate sheet name and column names here.
export const validateGrievancesExcelTemplate = (excelData: TExcelSheet[]) => {
  let errorMessageData: TTemplateErrorData[] = [];
  //check for blanks sheets
  let sheetswithOutData: number = excelData.filter(
    (errorItem) => errorItem.data.length > 0
  ).length;
  const totalData = excelData?.reduce(
    (acc: any, record: any) => acc + record.data.length,
    0
  );

  if (sheetswithOutData > 0) {
    if (totalData > 10000) {
      errorMessageData.push({
        sheet: templateSheets.map((items) => items.name).join(", "),
        error_message: "Maximum 10,000 records can be uploaded at a time",
      });
    } else {
      // validate sheets and column names
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
          }
        }
      });
    }
  } else {
    errorMessageData.push({
      sheet: templateSheets.map((items) => items.name).join(", "),
      error_message: errmsg_excel_template_sheet_no_data(
        excelData.map((item) => item.sheetName)[0]
      ),
    });
  }
  return errorMessageData;
};
//end region

//#region template data validation
//validate data of each sheet and each row here.
export const validateGrievancesExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] = await GrievancesDataValidate(
    excelData,
    organizationId
  );
  const masterErrorEntries: TExcelSheet[] = await validateDataByDb(
    excelData,
    organizationId
  );
  // duplicate validations
  const duplicaterEntries: TExcelSheet[] =
    await handleCheckDuplicates(excelData);
  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  allError = combineAllErrorSheets(duplicaterEntries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};
//end region

//#region duplicate validations
const handleCheckDuplicates = async (excelData: TExcelSheet[]) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TGrievancesActivitySheetNames]: Record<
      TGrievancesActivitySheetNames,
      any
    >[];
  } = {
    Grievances: [],
  };
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TGrievancesActivitySheetNames;
    failedEntries[sheetName] = validateduplicateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};
const validateBoardCompositionDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table
    if (!!dataItem["Year"] && !!dataItem["Month"]) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        dataItem["Year"],
        dataItem["Month"],
        dataItem["Grievance Category"],
        dataItem["Stakeholder Category"],
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
        GrievancesActivityConstant.excel_template.sheets.filter(
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
  TGrievancesActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  Grievances: validateBoardCompositionDuplicateDataSheet,
};

export const validateduplidateDataByKey = (
  index: number,
  year: string,
  month: string,
  Griviencecategory: string,
  stakeholdercategory: string,
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
    const uniqueKeyindex = `${year}-${month}-${sanitizeString.v1(Griviencecategory.toString())}-${sanitizeString.v1(stakeholdercategory.toString())}`;
    let uniqueKeyrow = "";
    uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${sanitizeString.v1(item["Grievance Category"].toString())}-${sanitizeString.v1(item["Stakeholder Category"].toString())}`;
    if (uniqueKeyrow === uniqueKeyindex) {
      // Check for duplicates
      if (seenEntries.has(uniqueKeyrow)) {
        columnObject["Row Number"] = index1;
        columnObject["Error"] = "Duplicate Entry Detected";
        duplicateEntries.push(columnObject);
      } else {
        seenEntries.add(uniqueKeyrow);
      }
    }
  });
  length = duplicateEntries.length;
  if (length > 0) {
    errorEntries.push({
      column: "Month",
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
    if (stakeholdercategory !== "") {
      errorEntries.push({
        column: "Stakeholder Category",
        row: index,
        errorMessage:
          "Duplicate Entry Detected: This record already exists. Please enter unique data.",
      });
    }
    if (Griviencecategory !== "") {
      errorEntries.push({
        column: "Grievance Category",
        row: index,
        errorMessage:
          "Duplicate Entry Detected: This record already exists. Please enter unique data.",
      });
    }
  }
  return errorEntries;
};
//end region
