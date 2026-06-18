import { UUID } from "crypto";
import { toNumber } from "lodash";
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
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "@/modules/ghg/lib/excel/excel.validation";
import {
  GovernanceAndBoardCompositionActivityConstant,
  TGovernanceAndBoardCompositionActivitySheetNames,
} from "@/modules/ghg/shared/constants/activity.constant";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";
import { months, validateYearWithoutMonth } from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } =
  GovernanceAndBoardCompositionActivityConstant.excel_template;
const noSpecialCharsRegex = /^[a-zA-Z0-9\s().,'"/\-&]+$/;

export const boardCompositionData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Director Category": z
        .string()
        .min(1, { message: "Director Category is required" }),

      "Number of Male Directors": z
        .unknown()
        .refine((q) => !isNaN(Number(q)), "Invalid Input")
        .refine(
          (q) => !(String(q).trim() === ""),
          "Number of Male Directors is required"
        )
        .transform((val) => Number(val))
        .refine((n) => n >= 0, "Invalid Number of Number of Male Directors")
        .refine(
          (n) => Number.isInteger(n),
          "Invalid Input: decimal value is not allowed"
        ),
      "Number of Female Directors": z
        .unknown()
        .refine((q) => !isNaN(Number(q)), "Invalid Input")
        .refine(
          (q) => !(String(q).trim() === ""),
          "Number of Female Directors is required"
        )
        .transform((val) => Number(val))
        .refine((n) => n >= 0, "Invalid Number of Number of Female Directors")
        .refine(
          (n) => Number.isInteger(n),
          "Invalid Input: decimal value is not allowed"
        ),
      "Number of Other Gender Directors": z
        .unknown()
        .refine(
          (q) => toNumber(q) >= 0,
          "Invalid Number of Other Gender Directors"
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          "Invalid Input: decimal value is not allowed"
        ),
      "Number of Minority Group Directors": z
        .unknown()
        .refine(
          (q) => toNumber(q) >= 0,
          "Invalid Number of Minority Group Directors"
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          "Invalid Input: decimal value is not allowed"
        )
        .transform(toNumber)
        .optional()
        .or(z.literal("")),
      "Number of Directors Under 30 years old": z
        .unknown()
        .optional()
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Invalid Number of Directors Under 30 years old"
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          "Invalid Input: decimal value is not allowed"
        ),
      "Number of Directors from 30 to 50 years old": z
        .unknown()
        .optional()
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Invalid Number of Directors from 30 to 50 years old"
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          "Invalid Input: decimal value is not allowed"
        ),
      "Number of Directors Above 50 years old": z
        .unknown()
        .optional()
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Invalid Number of Directors Above 50 years old"
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          "Invalid Input: decimal value is not allowed"
        ),
      "Is the Board Chair Independent": z.string().optional(),
    })
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (month) =>
            sanitizeString.v1(month) ==
            sanitizeString.v1(Month?.toString() || "")
        );
        if (fullNameMonth.length > 0) {
          yearMonthError = validateYearWithoutMonth(
            Month?.toString() || "",
            Number(Year),
            baseMonth,
            baseYear
          );
          return yearMonthError.length == 0;
        }
        return true;
      },
      ({ Year }) => ({
        message: yearMonthError[0].errorMessage,
        path: Object.keys({ Year }),
      })
    );
};
export const governanceData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Compliance Issues": z
        .string()
        .optional()
        .transform((val) => val || ""),
      "Stakeholder Category": z
        .any()
        .optional()
        .refine(
          (val) =>
            val === undefined || val === "" || noSpecialCharsRegex.test(val),
          {
            message: "Invalid Stakeholder Category",
          }
        ),

      "Total Number of Issues": z
        .unknown()
        .optional()
        .refine((val) => val === "" || /^\d+$/.test(String(val)), {
          message: "Total Number of Issues must contain only Numbers",
        })
        .transform((val) => (val === "" ? null : Number(val)))
        .refine(
          (q) => q === null || (Number(q) >= 0 && !isNaN(Number(q))),
          "Total Number of Issues must be a non-negative number or empty"
        )
        .refine(
          (q) => q === null || Number.isInteger(Number(q)),
          "Invalid Input: decimal value is not allowed"
        ),

      "New Issues (Reporting period)": z
        .unknown()
        .refine((q) => !(String(q).trim() === ""), {
          message: "New Issues (Reporting period) is required",
        })
        .refine((val) => /^\d+$/.test(String(val)), {
          message: "New Issues must contain only Numbers",
        })
        .transform((val) => Number(val))
        .refine((n) => n >= 0, "New Issues must be a non-negative number")
        .refine(
          (n) => Number.isInteger(n),
          "Invalid Input: decimal value is not allowed"
        ),

      "Issues Resolved (Reporting period)": z
        .unknown()
        .refine((q) => !(String(q).trim() === ""), {
          message: "Issues Resolved (Reporting period) is required",
        })
        .refine((val) => /^\d+$/.test(String(val)), {
          message: "Issues Resolved must contain only Numbers",
        })
        .transform((val) => Number(val))
        .refine((n) => n >= 0, "Issues Resolved must be a non-negative number")
        .refine(
          (n) => Number.isInteger(n),
          "Invalid Input: decimal value is not allowed"
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
          yearMonthError = validateYearWithoutMonth(
            Month?.toString() || "",
            Number(Year),
            baseMonth,
            baseYear
          );
          return yearMonthError.length == 0;
        }
        return true;
      },
      ({ Year }) => ({
        message: yearMonthError[0].errorMessage,
        path: Object.keys({ Year }),
      })
    );
};

export const validateGovernanceAndBoardCompositionExcelTemplate = (
  excelData: TExcelSheet[]
) => {
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
          const columnsValidations = validateMultipleSheetColumnNames(
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
      sheet: "",
      error_message:
        "Enter data in atleaset one of the sheets " +
        excelData.map((item) => item.sheetName),
    });
  }
  return errorMessageData;
};

//call zod validation methods from this method.
const validateGovernanceAndBoardCompositionDataSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number,
  sheetName: string
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any;
    if (sheetName === "Board Composition") {
      safeparseData = boardCompositionData(baseMonth, baseYear).safeParse(item);
    } else if (sheetName === "Governance") {
      safeparseData = governanceData(baseMonth, baseYear).safeParse(item);
    }
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      GovernanceAndBoardCompositionActivityConstant.excel_template.sheets
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
  TGovernanceAndBoardCompositionActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number,
    sheetName: string
  ) => Record<string, any>[]
> = {
  "Board Composition": validateGovernanceAndBoardCompositionDataSheet,
  Governance: validateGovernanceAndBoardCompositionDataSheet,
};

const governanceAndBoardCompositionDataValidate = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TGovernanceAndBoardCompositionActivitySheetNames]: Record<
      TGovernanceAndBoardCompositionActivitySheetNames,
      any
    >[];
  } = {
    "Board Composition": [],
    Governance: [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TGovernanceAndBoardCompositionActivitySheetNames;
    failedEntries[sheetName] = validateSheetMethods[sheetName](
      sheet,
      orgData.Organization[0].FinancialYearMonth,
      orgData.Organization[0].Baselineyear,
      sheetName
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

//#region Master data validation

const validateBoardCompositionDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Director Category"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Director Category"],
        index,
        "Board_Composition_and_Governance_Director_Category",
        "Director Category",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        GovernanceAndBoardCompositionActivityConstant.excel_template.sheets.filter(
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

const validateGovernanceDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Compliance Issues"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Compliance Issues"],
        index,
        "Board_Composition_and_Governance_Compliance_Issues",
        "Compliance Issues",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        GovernanceAndBoardCompositionActivityConstant.excel_template.sheets.filter(
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

const validateSheetMasterDataMethods: Record<
  TGovernanceAndBoardCompositionActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Board Composition": validateBoardCompositionDataSheet,
  Governance: validateGovernanceDataSheet,
};

const validateDatabyDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();

  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.governance_and_board_composition,
  });
  const failedEntries: {
    [key in TGovernanceAndBoardCompositionActivitySheetNames]: Record<
      string,
      any
    >[];
  } = {
    "Board Composition": [],
    Governance: [],
  };

  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TGovernanceAndBoardCompositionActivitySheetNames;
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

//end region

//main method called from route
// Validate each excel sheet cells based on column data type.
export const validateGovernanceAndBoardCompositionExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] =
    await governanceAndBoardCompositionDataValidate(excelData, organizationId);

  // Master data validation
  const masterErrorEntries: TExcelSheet[] = await validateDatabyDb(
    excelData,
    organizationId
  );

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
    [key in TGovernanceAndBoardCompositionActivitySheetNames]: Record<
      TGovernanceAndBoardCompositionActivitySheetNames,
      any
    >[];
  } = {
    "Board Composition": [],
    Governance: [],
  };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TGovernanceAndBoardCompositionActivitySheetNames;
    failedEntries[sheetName] = validateduplicateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};
const validateBoardCompositionDuplicateDataSheet = (sheet: TExcelSheet) => {
  let sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    const dataAllKeys = sheet.data.map((item, index) => {
      return {
        row: index + 1,
        key: `${item["Year"]}-${item["Director Category"]}`,
      };
    });
    const exceptrows: number[] = [];
    if (!!dataItem["Year"] && !!dataItem["Director Category"]) {
      const currentUniqueKey = `${dataItem["Year"]}-${dataItem["Director Category"]}`;
      const duplicateData = dataAllKeys.filter(
        (items) => items.key == currentUniqueKey
      );
      if (duplicateData.length > 1) {
        duplicateData.forEach((dataItems) => {
          exceptrows.push(dataItems?.row);
          errorEntries.push({
            column: "Year",
            row: dataItems?.row,
            errorMessage:
              "Duplicate Entry Detected: This record already exists. Please enter unique data.",
          });
          errorEntries.push({
            column: "Director Category",
            row: dataItems?.row,
            errorMessage:
              "Duplicate Entry Detected: This record already exists. Please enter unique data.",
          });
        });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        GovernanceAndBoardCompositionActivityConstant.excel_template.sheets.filter(
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
    index++;
  });
  return sheetAllerrorEntries;
};
const validateGovernanceDuplicateDataSheet = (sheet: TExcelSheet) => {
  let sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  const dataAllKeys = sheet.data.map((item, index) => {
    return {
      row: index + 1,
      key:
        !!item["Compliance Issues"] && !!item["Stakeholder Category"]
          ? `${item["Year"]}-${item["Compliance Issues"]}-${item["Stakeholder Category"]}`
          : !!item["Compliance Issues"] &&
              (item["Stakeholder Category"] == null ||
                item["Stakeholder Category"] == undefined ||
                item["Stakeholder Category"] == "")
            ? `${item["Year"]}-${item["Compliance Issues"]}`
            : !!item["Stakeholder Category"] &&
                (item["Compliance Issues"] == null ||
                  item["Compliance Issues"] == undefined ||
                  item["Compliance Issues"] == "")
              ? `${item["Year"]}-${item["Stakeholder Category"]}`
              : `${item["Year"]}`,
      isStakeHolderNotBlank: !!item["Stakeholder Category"],
      isComplianceIssueNotBlank: !!item["Compliance Issues"],
    };
  });
  const exceptrows: number[] = [];

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];

    const currentUniqueKey =
      !!dataItem["Compliance Issues"] && !!dataItem["Stakeholder Category"]
        ? `${dataItem["Year"]}-${dataItem["Compliance Issues"]}-${dataItem["Stakeholder Category"]}`
        : !!dataItem["Compliance Issues"] &&
            (dataItem["Stakeholder Category"] == null ||
              dataItem["Stakeholder Category"] == undefined ||
              dataItem["Stakeholder Category"] == "")
          ? `${dataItem["Year"]}-${dataItem["Compliance Issues"]}`
          : !!dataItem["Stakeholder Category"] &&
              (dataItem["Compliance Issues"] == null ||
                dataItem["Compliance Issues"] == undefined ||
                dataItem["Compliance Issues"] == "")
            ? `${dataItem["Year"]}-${dataItem["Stakeholder Category"]}`
            : `${dataItem["Year"]}`;
    const duplicateData = dataAllKeys.filter(
      (items) => items.key == currentUniqueKey
    );
    if (duplicateData.length > 1) {
      duplicateData.forEach((dataItems) => {
        exceptrows.push(dataItems?.row);
        if (dataItems?.isStakeHolderNotBlank) {
          errorEntries.push({
            column: "Stakeholder Category",
            row: dataItems?.row,
            errorMessage:
              "Duplicate Entry Detected: This record already exists. Please enter unique data.",
          });
        }
        if (dataItems?.isComplianceIssueNotBlank) {
          errorEntries.push({
            column: "Compliance Issues",
            row: dataItems?.row,
            errorMessage:
              "Duplicate Entry Detected: This record already exists. Please enter unique data.",
          });
        }
        errorEntries.push({
          column: "Year",
          row: dataItems?.row,
          errorMessage:
            "Duplicate Entry Detected: This record already exists. Please enter unique data.",
        });
      });
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        GovernanceAndBoardCompositionActivityConstant.excel_template.sheets.filter(
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
    index++;
  });
  return sheetAllerrorEntries;
};

const validateduplicateSheetMethods: Record<
  TGovernanceAndBoardCompositionActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  "Board Composition": validateBoardCompositionDuplicateDataSheet,
  Governance: validateGovernanceDuplicateDataSheet,
};
