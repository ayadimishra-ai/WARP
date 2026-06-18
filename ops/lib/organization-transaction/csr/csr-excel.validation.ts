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
  CSRActivityConstant,
  TCSRActivitySheetColumnNames,
  TCSRActivitySheetNames,
} from "~/shared/constants/activity.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import { months, validateYearWithoutMonth } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } = CSRActivityConstant.excel_template;
const noSpecialCharsRegex = /^[a-zA-Z0-9\s]+$/;

export const csrValidationSchema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Project Name": z
        .unknown()
        .refine((val) => sanitizeString.v2(String(val)) !== "", {
          message: "Project Name is required",
        })
        .refine(
          (val) => {
            if (typeof val === "string") return noSpecialCharsRegex.test(val);
            return false;
          },
          {
            message: "Project Name must be a string without special characters",
          }
        ),
      "Theme of the Project": z
        .unknown()
        .refine((val) => sanitizeString.v2(String(val)) !== "", {
          message: "Theme of the Project is required",
        }),
      // .refine(
      //   (val) => {
      //     if (typeof val === "string") return noSpecialCharsRegex.test(val);
      //     return false;
      //   },
      //   {
      //     message:
      //       "Theme of the Project must be a string without special characters",
      //   }
      // ),
      "Number of Beneficiaries/Impact Created": z
        .unknown()
        .optional()
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Invalid Number of Beneficiaries/Impact Created"
        ),
      "Target Beneficiary Group/Impact Category": z
        .unknown()
        .optional()
        .refine(
          (val) => {
            if (val === "") return true;
            if (typeof val === "number") return true;
            if (typeof val === "string") return noSpecialCharsRegex.test(val);
            return false;
          },
          {
            message:
              "Target Beneficiary Group/Impact Category must not contain special characters",
          }
        ),
      "Related SDGs": z.unknown().optional(),
      // .refine(
      //   (val) => {
      //     if (typeof val === "number") return true;
      //     if (typeof val === "string") return noSpecialCharsRegex.test(val);
      //     return false;
      //   },
      //   {
      //     message: "Related SDGs must not contain special characters",
      //   }
      // ),
      "Annual Spend on the Project": z
        .unknown()
        .optional()
        .transform(Number)
        .refine((q) => Number(q) >= 0, "Invalid Annual Spend on the Project"),
      "Target Specified (in terms of impact/beneficiaries)": z
        .unknown()
        .optional()
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Invalid Target Specified (in terms of impact/beneficiaries)"
        ),
      "Funds Earmarked for the Project for the year": z
        .unknown()
        .optional()
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Invalid Funds Earmarked for the Project for the year"
        ),
      Currency: z
        .unknown()
        .optional()
        .refine(
          (val) => {
            if (val === "") return true;

            if (typeof val === "string") return noSpecialCharsRegex.test(val);
            return false;
          },
          {
            message: "Currency must not contain special characters",
          }
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

//call zod validation methods from this method.
const validateCSRDataSheet = (
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

    safeparseData = csrValidationSchema(baseMonth, baseYear).safeParse(item);

    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      CSRActivityConstant.excel_template.sheets
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
  TCSRActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  CSR: validateCSRDataSheet,
};

const csrDataValidate = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TCSRActivitySheetNames]: Record<TCSRActivitySheetNames, any>[];
  } = {
    CSR: [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TCSRActivitySheetNames;
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

const validateCSRMasterData = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Theme of the Project"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Theme of the Project"],
        index,
        "csr_themes",
        "Theme of the Project",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }
    if (!!dataItem["Currency"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Currency"],
        index,
        "csr_currency_uom",
        "Currency",
        ApiHitType.Excel
      );

      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any = CSRActivityConstant.excel_template.sheets.filter(
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
    master_key: ActivityMasterKey.csr,
  });
  const failedEntries: {
    [key in TCSRActivitySheetNames]: Record<
      TCSRActivitySheetColumnNames,
      any
    >[];
  } = { CSR: [] };
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TCSRActivitySheetNames;
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
  TCSRActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  CSR: validateCSRMasterData,
};

//end region

//#region template validation
// Validate sheet name and column names here.
export const validateCSRExcelTemplate = (excelData: TExcelSheet[]) => {
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
      sheet: "",
      error_message:
        "Enter data in atleaset one of the sheets " +
        excelData.map((item) => item.sheetName),
    });
  }
  return errorMessageData;
};
//end region

//#region template data validation
//validate data of each sheet and each row here.
export const validateCSRExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] = await csrDataValidate(
    excelData,
    organizationId
  );

  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  if (zodErrorEnteries[0]?.data.length === 0) {
    // duplicate validations
    const duplicaterEntries: TExcelSheet[] =
      await handleCheckDuplicates(excelData);
    const masterErrorEntries: TExcelSheet[] = await validateDataByDb(
      excelData,
      organizationId
    );
    allError = combineAllErrorSheets(duplicaterEntries, allError);
    allError = combineAllErrorSheets(masterErrorEntries, allError);
  }
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};
//end region

//#region duplicate validations
const handleCheckDuplicates = async (excelData: TExcelSheet[]) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TCSRActivitySheetNames]: Record<TCSRActivitySheetNames, any>[];
  } = {
    CSR: [],
  };
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TCSRActivitySheetNames;
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

    if (
      !!dataItem["Project Name"] &&
      !!dataItem["Year"] &&
      !!dataItem["Theme of the Project"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "Project Name",
        dataItem["Year"],
        dataItem["Theme of the Project"],
        dataItem["Project Name"],
        sheet
      );
      if (errorEntriesColumn5Data.length > 0) {
        for (let i = 0; i < errorEntriesColumn5Data.length; i++) {
          errorEntries.push({ ...errorEntriesColumn5Data[i] });
        }
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any = CSRActivityConstant.excel_template.sheets.filter(
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
  TCSRActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  CSR: validateBoardCompositionDuplicateDataSheet,
};

export const validateduplidateDataByKey = (
  index: number,
  columnName: string,
  year: string,
  theme_of_the_project: string,
  project_name: string,
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
    const uniqueKeyindex = `${year}-${sanitizeString.v1(theme_of_the_project).toString()}-${sanitizeString.v1(project_name).toString()}`;
    let uniqueKeyrow = "";
    uniqueKeyrow = `${item["Year"]}-${sanitizeString.v1(item["Theme of the Project"]).toString()}-${sanitizeString.v1(item["Project Name"]).toString()}`;
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
      column: "Theme of the Project",
      row: index,
      errorMessage:
        "Duplicate Entry Detected: This record already exists. Please enter unique data.",
    });
  }
  return errorEntries;
};
//end region
