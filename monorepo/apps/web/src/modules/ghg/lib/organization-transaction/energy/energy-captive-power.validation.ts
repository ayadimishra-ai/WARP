import { UUID } from "crypto";
import _ from "lodash";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  ApiHitType,
  TActivityMasterData,
  TErrorExcelSheet,
  TTemplateErrorData,
  YearMonthSchema,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  validateActivityMasterDataByKey,
  validateActivityMasterDataGroupByKey,
  type TExcelSheet,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "@/modules/ghg/lib/excel/excel.validation";
import {
  CaptiveActivityConstant,
  TCaptiveActivitySheetColumnNames,
  TCaptivelActivitySheetNames,
} from "@/modules/ghg/shared/constants/activity.constant";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";
import {
  toNumber,
  toNumberWith0Acceptance,
} from "@/modules/ghg/utils/data-transformer.util";
import { months, validateMonthYear } from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

// Helper function to validate alphabetical characters only for UoM fields
const validateAlphabeticalOnly = (value: string) => {
  const regex = /^[a-zA-Z\s]+$/;
  return regex.test(value.trim());
};

let yearMonthError: TErrorExcelSheet[] = [];

const { sheets: templateSheets } = CaptiveActivityConstant.excel_template;
export const renewablecaptivepower = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Type of Technology Used": z
        .string()
        .min(1, { message: "Type of Technology Used is required" }),
      "Installation Year": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Installation Year is invalid")
        .refine(
          (q) => toNumber(q) > 0,
          (val) => ({
            message: !val
              ? `Installation Year is required`
              : "Installation Year must contain only numeric values. Alphabetical, special characters and negative values are not allowed.",
          })
        )
        .refine(
          (val) => {
            const numVal = Number(val);
            // Reject decimal values
            if (!Number.isInteger(numVal)) {
              return false;
            }
            // Reject values with leading zeros when entered as a string
            if (typeof val === "string" && /^0\d+/.test(val)) {
              return false;
            }
            return !isNaN(numVal) && numVal >= 100;
          },
          {
            message: "Installation Year is invalid",
          }
        )
        .refine(
          (val) => {
            const numVal = Number(val);
            return !isNaN(numVal) && numVal >= 1900;
          },
          {
            message: "Installation Year is invalid",
          }
        )
        .transform(toNumber)
        .refine((q) => q <= 2099, {
          message: "Installation Year is invalid",
        }),
      "Unit of Energy Generated (in Kwh)": z
        .unknown()
        .refine(
          (q) => {
            return toNumberWith0Acceptance(q) >= 0;
          },
          (val) => ({
            message: !val
              ? `Unit of Energy Generated (in Kwh) is required`
              : "Unit of Energy Generated (in Kwh) must contain only numeric values. Alphabetical, special characters and negative values are not allowed.",
          })
        )
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 4 decimal places
          if (!/^\d+(\.\d{1,4})?$/.test(strVal)) {
            return "INVALID_FORMAT";
          }
          // Check digit limit: max 15 digits (decimal point not counted)
          const digitCount = strVal.replace(/\D/g, "").length; // Count only digits
          if (digitCount > 15) {
            return "INVALID_FORMAT";
          }
          const num = Number(strVal);
          return isNaN(num) ? "INVALID_FORMAT" : num;
        })
        .refine((val) => val !== "INVALID_FORMAT", {
          message:
            "Please enter a valid numeric value for unit of energy generated",
        })
        .refine((val) => val === undefined || val >= 0, {
          message:
            "Please enter a valid numeric value for unit of energy generated",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 4)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 4;
          },
          {
            message:
              "Please enter a valid numeric value for unit of energy generated",
          }
        ),
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
export const nonrenewablecaptivepower = (
  baseMonth: string,
  baseYear: number
) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Type of Fuel Used": z
        .string({
          invalid_type_error:
            "Type of Fuel Used must contain only alphabetical characters and spaces. Numbers and special characters are not allowed.",
        })
        .min(1, { message: "Type of Fuel Used is required" }),
      "Quantity of fuel consumed": z
        .unknown()
        .refine(
          (q) => {
            return toNumberWith0Acceptance(q) >= 0;
          },
          (val) => ({
            message: !val
              ? `Quantity of fuel consumed is required`
              : "Please enter a valid numeric value for fuel quantity",
          })
        )
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 4 decimal places
          if (!/^\d+(\.\d{1,4})?$/.test(strVal)) {
            return "INVALID_FORMAT";
          }
          // Check digit limit: max 15 digits (decimal point not counted)
          const digitCount = strVal.replace(/\D/g, "").length; // Count only digits
          if (digitCount > 15) {
            return "INVALID_FORMAT";
          }
          const num = Number(strVal);
          return isNaN(num) ? "INVALID_FORMAT" : num;
        })
        .refine((val) => val !== "INVALID_FORMAT", {
          message: "Please enter a valid numeric value for fuel quantity",
        })
        .refine((val) => val === undefined || val >= 0, {
          message: "Please enter a valid numeric value for fuel quantity",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 4)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 4;
          },
          {
            message: "Please enter a valid numeric value for fuel quantity",
          }
        ),
      "UoM for the Quantity of Fuel consumed": z
        .string({
          invalid_type_error:
            "UoM for the Quantity of Fuel consumed must contain only alphabetical characters and spaces. Numbers and special characters are not allowed.",
        })
        .min(1, {
          message: "UoM for the Quantity of Fuel consumed is required",
        })
        .refine((val) => validateAlphabeticalOnly(val), {
          message:
            "UoM for the Quantity of Fuel consumed must contain only alphabetical characters and spaces. Numbers and special characters are not allowed.",
        }),
      "Quality of fuel": z
        .unknown()
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 4 decimal places
          if (!/^\d+(\.\d{1,4})?$/.test(strVal)) {
            return "INVALID_FORMAT";
          }
          // Check digit limit: max 15 digits (decimal point not counted)
          const digitCount = strVal.replace(/\D/g, "").length; // Count only digits
          if (digitCount > 15) {
            return "INVALID_FORMAT";
          }
          const num = Number(strVal);
          return isNaN(num) ? "INVALID_FORMAT" : num;
        })
        .refine((val) => val !== "INVALID_FORMAT", {
          message: "Please enter valid fuel quality details",
        })
        .refine((val) => val === undefined || val > 0, {
          message: "Please enter valid fuel quality details",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 4)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 4;
          },
          {
            message: "Please enter valid fuel quality details",
          }
        )
        .optional(),
      "Unit of Energy Generated (in Kwh)": z
        .unknown()
        .refine(
          (q) => {
            return toNumberWith0Acceptance(q) >= 0;
          },
          (val) => ({
            message: !val
              ? `Unit of Energy Generated (in Kwh) is required`
              : "Please enter a valid numeric value for energy generated",
          })
        )
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 4 decimal places
          if (!/^\d+(\.\d{1,4})?$/.test(strVal)) {
            return "INVALID_FORMAT";
          }
          // Check digit limit: max 15 digits (decimal point not counted)
          const digitCount = strVal.replace(/\D/g, "").length; // Count only digits
          if (digitCount > 15) {
            return "INVALID_FORMAT";
          }
          const num = Number(strVal);
          return isNaN(num) ? "INVALID_FORMAT" : num;
        })
        .refine((val) => val !== "INVALID_FORMAT", {
          message: "Please enter a valid numeric value for energy generated",
        })
        .refine((val) => val === undefined || val >= 0, {
          message: "Please enter a valid numeric value for energy generated",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 4)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 4;
          },
          {
            message: "Please enter a valid numeric value for energy generated",
          }
        ),
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

const renewablefuelcaptivepower = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Type of Fuel Used": z
        .string({
          invalid_type_error:
            "Type of Fuel Used must contain only alphabetical characters and spaces. Numbers and special characters are not allowed.",
        })
        .min(1, { message: "Type of Fuel Used is required" }),
      "Quantity of fuel consumed": z
        .unknown()
        .refine(
          (q) => {
            return toNumberWith0Acceptance(q) >= 0;
          },
          (val) => ({
            message: !val
              ? `Quantity of fuel consumed is required`
              : "Please enter a valid numeric value for fuel quantity",
          })
        )
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 2 decimal places
          if (!/^\d+(\.\d{1,2})?$/.test(strVal)) {
            return "INVALID_FORMAT";
          }
          // Check digit limit: max 15 digits (decimal point not counted)
          const digitCount = strVal.replace(/\D/g, "").length; // Count only digits
          if (digitCount > 15) {
            return "INVALID_FORMAT";
          }
          const num = Number(strVal);
          return isNaN(num) ? "INVALID_FORMAT" : num;
        })
        .refine((val) => val !== "INVALID_FORMAT", {
          message: "Please enter a valid numeric value for fuel quantity",
        })
        .refine((val) => val === undefined || val >= 0, {
          message: "Please enter a valid numeric value for fuel quantity",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 2)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 2;
          },
          {
            message: "Please enter a valid numeric value for fuel quantity",
          }
        ),
      "UoM for the Quantity of Fuel consumed": z
        .string({
          invalid_type_error:
            "UoM for the Quantity of Fuel consumed must contain only alphabetical characters and spaces. Numbers and special characters are not allowed.",
        })
        .min(1, {
          message: "UoM for the Quantity of Fuel consumed is required",
        })
        .refine((val) => validateAlphabeticalOnly(val), {
          message:
            "UoM for the Quantity of Fuel consumed must contain only alphabetical characters and spaces. Numbers and special characters are not allowed.",
        }),
      "Quality of fuel": z
        .unknown()
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 2 decimal places
          if (!/^\d+(\.\d{1,2})?$/.test(strVal)) {
            return "INVALID_FORMAT";
          }
          // Check digit limit: max 15 digits (decimal point not counted)
          const digitCount = strVal.replace(/\D/g, "").length; // Count only digits
          if (digitCount > 15) {
            return "INVALID_FORMAT";
          }
          const num = Number(strVal);
          return isNaN(num) ? "INVALID_FORMAT" : num;
        })
        .refine((val) => val !== "INVALID_FORMAT", {
          message: "Please enter valid fuel quality details",
        })
        .refine((val) => val === undefined || val > 0, {
          message: "Please enter valid fuel quality details",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 2)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 2;
          },
          {
            message: "Please enter valid fuel quality details",
          }
        )
        .optional(),
      "Unit of Energy Generated (in Kwh)": z
        .unknown()
        .refine(
          (q) => {
            return toNumberWith0Acceptance(q) >= 0;
          },
          (val) => ({
            message: !val
              ? `Unit of Energy Generated (in Kwh) is required`
              : "Please enter a valid numeric value for energy generated",
          })
        )
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 2 decimal places
          if (!/^\d+(\.\d{1,2})?$/.test(strVal)) {
            return "INVALID_FORMAT";
          }
          // Check digit limit: max 15 digits (decimal point not counted)
          const digitCount = strVal.replace(/\D/g, "").length; // Count only digits
          if (digitCount > 15) {
            return "INVALID_FORMAT";
          }
          const num = Number(strVal);
          return isNaN(num) ? "INVALID_FORMAT" : num;
        })
        .refine((val) => val !== "INVALID_FORMAT", {
          message: "Please enter a valid numeric value for energy generated",
        })
        .refine((val) => val === undefined || val >= 0, {
          message: "Please enter a valid numeric value for energy generated",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 2)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 2;
          },
          {
            message: "Please enter a valid numeric value for energy generated",
          }
        ),
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

export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
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

//#region Zod Validation
const validateRenewableSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = renewablecaptivepower(
      baseMonth,
      baseYear
    ).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      CaptiveActivityConstant.excel_template.sheets
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

const validateNonRenewableFuelSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = nonrenewablecaptivepower(
      baseMonth,
      baseYear
    ).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      CaptiveActivityConstant.excel_template.sheets
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

const validateRenewableFuelSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = renewablefuelcaptivepower(
      baseMonth,
      baseYear
    ).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      CaptiveActivityConstant.excel_template.sheets
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
  TCaptivelActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Non Renewable Captive Power": validateNonRenewableFuelSheet,
  "Renewable Captive Power": validateRenewableSheet,
  // "Renewable Fuel Captive Power": validateRenewableFuelSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TCaptivelActivitySheetNames]: Record<
      TCaptiveActivitySheetColumnNames,
      any
    >[];
  } = {
    "Non Renewable Captive Power": [],
    "Renewable Captive Power": [],
    // "Renewable Fuel Captive Power": [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TCaptivelActivitySheetNames;
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
//#endregion

//#region Master Data Validation
const validateRenewableDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Type of Technology Used"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Type of Technology Used"],
        index,
        "Energy_CaptivePower_Type_of_Technology_Used",
        "Type of Technology Used",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }
    if (parseInt(dataItem["Installation Year"]) > parseInt(dataItem.Year)) {
      errorEntries.push({
        column: "Installation Year",
        row: index,
        errorMessage: "Installation Year cannot be greater than Upload Year",
      });
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        CaptiveActivityConstant.excel_template.sheets.filter(
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

const validateNonRenewableFuelDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Type of Fuel Used"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Type of Fuel Used"],
        index,
        "Energy_CaptivePower_NonRenewable_FuelType",
        "Type of Fuel Used",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      } else {
        if (!!dataItem["UoM for the Quantity of Fuel consumed"]) {
          const uomForTheQuantityOfFuelConsumed =
            dataItem["UoM for the Quantity of Fuel consumed"];
          const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
            ActivityMasterData,
            dataItem["Type of Fuel Used"],
            typeof uomForTheQuantityOfFuelConsumed !== "string"
              ? String(uomForTheQuantityOfFuelConsumed)
              : uomForTheQuantityOfFuelConsumed,
            index,
            "Energy_CaptivePower_NonRenewable_FuelType_UOM",
            "UoM for the Quantity of Fuel consumed",
            ApiHitType.Excel,
            "Energy_CaptivePower_NonRenewable_FuelType"
          );
          if (errorEntriesColumn2Data.length > 0) {
            errorEntries.push({ ...errorEntriesColumn2Data[0] });
          }
        }
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        CaptiveActivityConstant.excel_template.sheets.filter(
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

const validateRenewableFuelDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Type of Fuel Used"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Type of Fuel Used"],
        index,
        "Energy_CaptivePower_Renewable_FuelType",
        "Type of Fuel Used",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      } else {
        if (!!dataItem["UoM for the Quantity of Fuel consumed"]) {
          const uomForTheQuantityOfFuelConsumed =
            dataItem["UoM for the Quantity of Fuel consumed"];
          const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
            ActivityMasterData,
            dataItem["Type of Fuel Used"],
            typeof uomForTheQuantityOfFuelConsumed !== "string"
              ? String(uomForTheQuantityOfFuelConsumed)
              : uomForTheQuantityOfFuelConsumed,
            index,
            "Energy_CaptivePower_Renewable_FuelType_UOM",
            "UoM for the Quantity of Fuel consumed",
            ApiHitType.Excel,
            "Energy_CaptivePower_Renewable_FuelType"
          );
          if (errorEntriesColumn2Data.length > 0) {
            errorEntries.push({ ...errorEntriesColumn2Data[0] });
          }
        }
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        CaptiveActivityConstant.excel_template.sheets.filter(
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
  TCaptivelActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Renewable Captive Power": validateRenewableDataSheet,
  "Non Renewable Captive Power": validateNonRenewableFuelDataSheet,
  // "Renewable Fuel Captive Power": validateRenewableFuelDataSheet,
};

const validateDatabyDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.energy_captive_power,
  });
  const failedEntries: {
    [key in TCaptivelActivitySheetNames]: Record<
      TCaptiveActivitySheetColumnNames,
      any
    >[];
  } = {
    "Non Renewable Captive Power": [],
    "Renewable Captive Power": [],
    // "Renewable Fuel Captive Power": [],
  };
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TCaptivelActivitySheetNames;
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
//#endregion

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID,
  org_address_id: UUID,
  isFromForm: boolean = false
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];

  // Create dynamic template sheets - add location column for manual forms
  let dynamicTemplateSheets = JSON.parse(JSON.stringify(templateSheets)); // Deep clone
  if (isFromForm) {
    // Add location column to template for manual form error processing
    dynamicTemplateSheets.forEach((sheet: any) => {
      sheet.columns.push({
        name: "location",
        code: "location",
      });
    });
  }

  const zodErrorEnteries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    organizationId
  );
  const masterErrorEntries: TExcelSheet[] = await validateDatabyDb(
    excelData,
    organizationId
  );
  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);

  // Validate for duplicate entries (works for both Excel bulk upload and form)
  // This validation runs only if Zod validation passes for Renewable Captive Power sheet
  const renewableSheetZodErrors = zodErrorEnteries.find(
    (sheet) =>
      sanitizeString.v1(sheet.sheetName) ===
      sanitizeString.v1("Renewable Captive Power")
  );
  if (renewableSheetZodErrors && renewableSheetZodErrors.data.length === 0) {
    const duplicateEntries: TExcelSheet[] = await validateDataForDuplicates(
      excelData,
      org_address_id,
      isFromForm,
      "Renewable Captive Power"
    );
    allError = combineAllErrorSheets(duplicateEntries, allError);
  }
  // This validation runs only if Zod validation passes for Non-Renewable Fuel Captive Power sheet
  const nonRenewableSheetZodErrors = zodErrorEnteries.find(
    (sheet) =>
      sanitizeString.v1(sheet.sheetName) ===
      sanitizeString.v1("Non Renewable Captive Power")
  );
  if (
    nonRenewableSheetZodErrors &&
    nonRenewableSheetZodErrors.data.length === 0
  ) {
    const duplicateEntries: TExcelSheet[] = await validateDataForDuplicates(
      excelData,
      org_address_id,
      isFromForm,
      "Non Renewable Captive Power"
    );
    allError = combineAllErrorSheets(duplicateEntries, allError);
  }

  finalError = combineAllTypeErrorInRow(allError, dynamicTemplateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};

// Duplicate Row Validation for Renewable Captive Power and Non-Renewable Fuel Captive Power
const validateDataForDuplicates = async (
  excelData: TExcelSheet[],
  org_address_id: UUID,
  isFromForm: boolean = false,
  sheetName: TCaptivelActivitySheetNames
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();

  // Get the sheet data (Renewable or Non-Renewable Captive Power)
  const targetSheet = excelData.find(
    (sheet) =>
      sanitizeString.v1(sheet.sheetName) === sanitizeString.v1(sheetName)
  );

  if (!targetSheet || targetSheet.data.length === 0) {
    return excelSheetData;
  }

  // For Excel uploads: Only check for duplicates within the Excel file itself (not against DB)
  // Because Excel upload will override/upsert existing data in DB
  // For Form submissions: Check against both within-data and existing DB records
  let allExistingCaptivePowerRecords: any[] = [];

  if (isFromForm) {
    // Collect all unique month/year combinations from the excel data
    const monthYearSet: any[] = [];
    targetSheet.data.forEach((dataItem: Record<string, string>) => {
      const month = dataItem["Month"];
      const year = dataItem["Year"];
      if (month && year) {
        monthYearSet.push({ month, year });
      }
    });

    // Get unique combinations
    const uniqueMonthYearSet = _.uniqWith(monthYearSet, _.isEqual);

    // Fetch existing data for all month/year combinations based on sheet type
    const existingDataPromises = uniqueMonthYearSet.map(({ month, year }) => {
      if (sheetName === "Renewable Captive Power") {
        return sdk.getCaptivePowerRenewableByYearMonthOrgAddressId({
          orgAddressId: org_address_id,
          month: month,
          year: Number(year),
        });
      }
       else if (sheetName === "Non Renewable Captive Power") {
        return sdk.getCaptivePowerNonRenewableFuelByYearMonthOrgAddressId({
          orgAddressId: org_address_id,
          month: month,
          year: Number(year),
        });
      }
      return Promise.resolve({
        GHGEnergy_CaptivePower_Renewable: [],
        GHGEnergy_CaptivePower_NonRenewableFuel: [],
      });
    });

    const existingDataResults = await Promise.all(existingDataPromises);

    // Flatten all existing records based on sheet type
    if (sheetName === "Renewable Captive Power") {
      allExistingCaptivePowerRecords = existingDataResults.flatMap(
        (result: any) => result.GHGEnergy_CaptivePower_Renewable || []
      );
    } 
    else if (sheetName === "Non Renewable Captive Power") {
      allExistingCaptivePowerRecords = existingDataResults.flatMap(
        (result: any) => result.GHGEnergy_CaptivePower_NonRenewable || []
      );
    }
  }

  const failedEntries: {
    [key in TCaptivelActivitySheetNames]: Record<
      TCaptiveActivitySheetColumnNames,
      any
    >[];
  } = {
    "Non Renewable Captive Power": [],
    "Renewable Captive Power": [],
    // "Renewable Fuel Captive Power": [],
  };

  // Only process the target sheet type for duplicates
  if (sheetName === "Renewable Captive Power") {
    failedEntries["Renewable Captive Power"] =
      validateDuplicateRenewableCaptivePowerSheet(
        targetSheet,
        allExistingCaptivePowerRecords,
        isFromForm
      );
    excelSheetData.push({
      sheetName: "Renewable Captive Power",
      data: failedEntries["Renewable Captive Power"],
    });
  } 
  else if (sheetName === "Non Renewable Captive Power") {
    failedEntries["Non Renewable Captive Power"] =
      validateDuplicateNonRenewableFuelCaptivePowerSheet(
        targetSheet,
        allExistingCaptivePowerRecords,
        isFromForm
      );
    excelSheetData.push({
      sheetName: "Non Renewable Captive Power",
      data: failedEntries["Non Renewable Captive Power"],
    });
  }

  return excelSheetData;
};

const validateDuplicateRenewableCaptivePowerSheet = (
  sheet: TExcelSheet,
  existingCaptivePowerRenewableRecords: any[],
  isFromForm: boolean
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  // Helper function to normalize values for comparison
  const normalizeValue = (val: any): any => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "string") {
      const trimmed = val.trim();
      // Try to convert to number if it's a numeric string
      const num = Number(trimmed);
      if (!isNaN(num) && trimmed !== "") return num;
      return trimmed.toLowerCase(); // Make string comparison case-insensitive
    }
    if (typeof val === "number") return val;
    return val;
  };

  // Helper to check if two values match (both null or both equal)
  const valuesMatch = (val1: any, val2: any): boolean => {
    const norm1 = normalizeValue(val1);
    const norm2 = normalizeValue(val2);

    // Both are null/empty
    if (norm1 === null && norm2 === null) return true;

    // One is null, other is not - BUT treat 0 and null as equivalent for numeric fields
    if (norm1 === null && norm2 === 0) return true;
    if (norm1 === 0 && norm2 === null) return true;

    // One is null (not 0), other is not
    if (norm1 === null || norm2 === null) return false;

    // Both have values - compare them
    return norm1 === norm2;
  };

  // Helper function to check if two data items match for Renewable Captive Power
  const checkIfRecordsMatch = (
    item1: Record<string, any>,
    item2: Record<string, any>
  ): boolean => {
    return (
      valuesMatch(
        item1["Type of Technology Used"],
        item2["Type of Technology Used"]
      ) &&
      valuesMatch(item1["Installation Year"], item2["Installation Year"]) &&
      valuesMatch(
        item1["Unit of Energy Generated (in Kwh)"],
        item2["Unit of Energy Generated (in Kwh)"]
      )
    );
  };

  sheet.data.forEach(
    (dataItem: Record<string, string>, currentIndex: number) => {
      let errorEntries: TErrorExcelSheet[] = [];
      index++;

      // Skip validation if essential fields are missing
      if (!dataItem["Month"] || !dataItem["Year"]) {
        return;
      }

      // Get the ID if this is an edit operation (from form)
      const currentRecordId = (dataItem as any).id || (dataItem as any).row_id;

      // 1. Check for duplicates within the sheet data itself (for bulk uploads with multiple rows)
      const duplicateInSheet = sheet.data.some(
        (otherItem: Record<string, string>, otherIndex: number) => {
          // Skip comparing with itself
          if (currentIndex === otherIndex) return false;

          // Only check if both items have the same month and year (case-insensitive for month)
          const monthMatch =
            (otherItem["Month"] || "").trim().toLowerCase() ===
            (dataItem["Month"] || "").trim().toLowerCase();
          const yearMatch = otherItem["Year"] === dataItem["Year"];

          if (!monthMatch || !yearMatch) {
            return false;
          }

          return checkIfRecordsMatch(dataItem, otherItem);
        }
      );

      if (duplicateInSheet) {
        Object.keys(dataItem).forEach((key) => {
          errorEntries.push({
            column: key,
            row: index,
            errorMessage:
              "Duplicate Entry, Multiple identical records found in the uploaded data for the same period.",
          });
        });
        if (isFromForm) {
          errorEntries.push({
            column: "location",
            row: index,
            errorMessage:
              "Duplicate Entry, Multiple identical records found in the uploaded data for the same period.",
          });
        }
      }

      // 2. Check against existing database records (only if no duplicate found in sheet)
      // For form submissions: check against DB but exclude the current record being edited
      // For Excel uploads: skip DB check since Excel will upsert/override existing data
      if (!duplicateInSheet && isFromForm) {
        // NOTE: All existingCaptivePowerRenewableRecords are already filtered by month/year/orgAddress
        // in the GraphQL query, so we don't need to filter again by month/year.
        // We just need to exclude the current record being edited and compare field values.

        const recordsToCheck = existingCaptivePowerRenewableRecords.filter(
          (record) => {
            // Exclude the current record being edited
            if (currentRecordId && record.id === currentRecordId) {
              return false;
            }
            return true;
          }
        );

        // Check if any existing record matches all field values
        const isDuplicateInDB = recordsToCheck.some((existingRecord) => {
          // Compare all data fields using the valuesMatch helper
          const technologyMatch = valuesMatch(
            existingRecord.Type_of_Technology_Used,
            dataItem["Type of Technology Used"]
          );
          const installationYearMatch = valuesMatch(
            existingRecord.Year_of_installation,
            dataItem["Installation Year"]
          );
          const energyGeneratedMatch = valuesMatch(
            existingRecord.Unit_of_Energy_Generated_in_Kwh,
            dataItem["Unit of Energy Generated (in Kwh)"]
          );

          const fieldsMatch =
            technologyMatch && installationYearMatch && energyGeneratedMatch;

          return fieldsMatch;
        });

        if (isDuplicateInDB) {
          Object.keys(dataItem).forEach((key) => {
            errorEntries.push({
              column: key,
              row: index,
              errorMessage:
                "Duplicate Entry, Multiple identical records found in the uploaded data for the same period.",
            });
          });
          errorEntries.push({
            column: "location",
            row: index,
            errorMessage:
              "Duplicate Entry, Multiple identical records found in the uploaded data for the same period.",
          });
        }
      }

      if (errorEntries.length > 0) {
        const allColumns = CaptiveActivityConstant.excel_template.sheets
          .filter(
            (sheetItem) =>
              sanitizeString.v1(sheetItem.name) ===
              sanitizeString.v1(sheet.sheetName)
          )[0]
          .columns.map((col) => ({
            name: col.name as string,
            code: col.code as string,
          }));

        if (isFromForm) {
          allColumns.push({ name: "location", code: "location" });
        }

        const errorRow = createErrorDataForExcel(allColumns, errorEntries);
        sheetAllErrorEntries.push(errorRow[0]);
      }
    }
  );

  return sheetAllErrorEntries;
};

const validateDuplicateNonRenewableFuelCaptivePowerSheet = (
  sheet: TExcelSheet,
  existingNonRenewableFuelRecords: any[],
  isFromForm: boolean
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  // Helper function to normalize values for comparison
  const normalizeValue = (val: any): any => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "string") {
      const trimmed = val.trim();
      // Try to convert to number if it's a numeric string
      const num = Number(trimmed);
      if (!isNaN(num) && trimmed !== "") return num;
      return trimmed.toLowerCase(); // Make string comparison case-insensitive
    }
    if (typeof val === "number") return val;
    return val;
  };

  // Helper to check if two values match (both null or both equal)
  const valuesMatch = (val1: any, val2: any): boolean => {
    const norm1 = normalizeValue(val1);
    const norm2 = normalizeValue(val2);

    // Both are null/empty
    if (norm1 === null && norm2 === null) return true;

    // One is null, other is not - BUT treat 0 and null as equivalent for numeric fields
    if (norm1 === null && norm2 === 0) return true;
    if (norm1 === 0 && norm2 === null) return true;

    // One is null (not 0), other is not
    if (norm1 === null || norm2 === null) return false;

    // Both have values - compare them
    return norm1 === norm2;
  };

  // Helper function to check if two data items match for Non-Renewable Fuel Captive Power
  const checkIfRecordsMatch = (
    item1: Record<string, any>,
    item2: Record<string, any>
  ): boolean => {
    return (
      valuesMatch(item1["Type of Fuel Used"], item2["Type of Fuel Used"]) &&
      valuesMatch(
        item1["Quantity of fuel consumed"],
        item2["Quantity of fuel consumed"]
      ) &&
      valuesMatch(
        item1["UoM for the Quantity of Fuel consumed"],
        item2["UoM for the Quantity of Fuel consumed"]
      ) &&
      valuesMatch(item1["Quality of fuel"], item2["Quality of fuel"]) &&
      valuesMatch(
        item1["Unit of Energy Generated (in Kwh)"],
        item2["Unit of Energy Generated (in Kwh)"]
      )
    );
  };

  sheet.data.forEach(
    (dataItem: Record<string, string>, currentIndex: number) => {
      let errorEntries: TErrorExcelSheet[] = [];
      index++;

      // Skip validation if essential fields are missing
      if (!dataItem["Month"] || !dataItem["Year"]) {
        return;
      }

      // Get the ID if this is an edit operation (from form)
      const currentRecordId = (dataItem as any).id || (dataItem as any).row_id;

      // 1. Check for duplicates within the sheet data itself (for bulk uploads with multiple rows)
      const duplicateInSheet = sheet.data.some(
        (otherItem: Record<string, string>, otherIndex: number) => {
          // Skip comparing with itself
          if (currentIndex === otherIndex) return false;

          // Only check if both items have the same month and year (case-insensitive for month)
          const monthMatch =
            (otherItem["Month"] || "").trim().toLowerCase() ===
            (dataItem["Month"] || "").trim().toLowerCase();
          const yearMatch = otherItem["Year"] === dataItem["Year"];

          if (!monthMatch || !yearMatch) {
            return false;
          }

          return checkIfRecordsMatch(dataItem, otherItem);
        }
      );

      // Build allColumns first - needed for error processing
      let allColumns = CaptiveActivityConstant.excel_template.sheets
        .filter(
          (sheetItem) =>
            sanitizeString.v1(sheetItem.name) ===
            sanitizeString.v1("Non Renewable Captive Power")
        )[0]
        .columns.map((col) => ({
          name: col.name as string,
          code: col.code as string,
        }));

      // Add location column for form submissions BEFORE creating error entries
      if (isFromForm) {
        allColumns = [...allColumns, { name: "location", code: "location" }];
      }

      if (duplicateInSheet) {
        // Add errors for all columns including location
        allColumns.forEach((col) => {
          errorEntries.push({
            column: col.name,
            row: index,
            errorMessage:
              "Duplicate Entry, Multiple identical records found in the uploaded data for the same period.",
          });
        });
      }

      // 2. Check against existing database records (only if no duplicate found in sheet)
      // For form submissions: check against DB but exclude the current record being edited
      // For Excel uploads: skip DB check since Excel will upsert/override existing data
      if (!duplicateInSheet && isFromForm) {
        const recordsToCheck = existingNonRenewableFuelRecords.filter(
          (record) => {
            // Exclude the current record being edited (use String() for type-safe comparison)
            if (
              currentRecordId &&
              String(record.id) === String(currentRecordId)
            ) {
              return false;
            }
            return true;
          }
        );

        const isDuplicateInDB = recordsToCheck.some((existingRecord) => {
          const fuelTypeMatch = valuesMatch(
            existingRecord.Type_of_Fuel_Used,
            dataItem["Type of Fuel Used"]
          );
          const quantityMatch = valuesMatch(
            existingRecord.Quantity_of_fuel_consumed,
            dataItem["Quantity of fuel consumed"]
          );
          const uomMatch = valuesMatch(
            existingRecord.Quantity_of_fuel_consumed_uom,
            dataItem["UoM for the Quantity of Fuel consumed"]
          );
          const qualityMatch = valuesMatch(
            existingRecord.Quality_of_fuel,
            dataItem["Quality of fuel"]
          );
          const energyGeneratedMatch = valuesMatch(
            existingRecord.Unit_of_Energy_Generated_in_Kwh,
            dataItem["Unit of Energy Generated (in Kwh)"]
          );

          return (
            fuelTypeMatch &&
            quantityMatch &&
            uomMatch &&
            qualityMatch &&
            energyGeneratedMatch
          );
        });

        if (isDuplicateInDB) {
          // Add errors for all columns including location
          allColumns.forEach((col) => {
            errorEntries.push({
              column: col.name,
              row: index,
              errorMessage:
                "Duplicate Entry, Multiple identical records found in the uploaded data for the same period.",
            });
          });
        }
      }

      if (errorEntries.length > 0) {
        const errorRow = createErrorDataForExcel(allColumns, errorEntries);
        sheetAllErrorEntries.push(errorRow[0]);
      }
    }
  );

  return sheetAllErrorEntries;
};
