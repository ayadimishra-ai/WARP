import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  ApiHitType,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  TActivityMasterData,
  TErrorExcelSheet,
  validateActivityMasterDataByKey,
  validateActivityMasterDataGroupByKey,
  YearMonthSchema,
  type TExcelSheet,
  type TTemplateErrorData,
} from "~/lib/excel/excel.service";
import {
  validateColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import {
  TUseOfSoldProductsColumnNames,
  TUseOfSoldProductsSheetNames,
  UseOfSoldProductsConstant,
} from "~/shared/constants/activity.constant";
import {
  ActivityMasterKey,
  USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY,
  USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY,
  USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY,
  USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY,
} from "~/shared/constants/input.constant";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
let yearMonthError: TErrorExcelSheet[] = [];

const { sheets: templateSheets } = UseOfSoldProductsConstant.excel_template;

// Regex pattern for Product Code: alphanumeric with spaces, hyphens, dots, slashes, parentheses
const validProductCodeRegex = /^[a-zA-Z0-9\s&.\-/()]*$/;

// Regex pattern for Date field: DD/MM/YYYY format (zero-padded after normalization)
const validDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

// Regex pattern to accept D-M-YYYY, DD-M-YYYY, D-MM-YYYY, or DD-MM-YYYY before normalization (hyphen separator only)
const looseDateRegex = /^\d{1,2}-\d{1,2}-\d{4}$/;

// Regex pattern for numeric fields: validates positive numbers with any decimal places
const validNumericRegex = /^\d+(\.\d+)?$/;

/**
 * Date field schema: optional, but if provided must represent a date in DD-MM-YYYY format.
 *
 * Accepts:
 *   - Hyphen-separated text strings (DD-MM-YYYY, D-M-YYYY, DD-M-YYYY, D-MM-YYYY)
 *   - Excel serial date numbers (when the user's cell is formatted as a date in Excel,
 *     Excel auto-converts the typed value into an underlying serial number — we decode it)
 *   - JS Date objects (some Excel parsers return Date instances directly)
 *
 * Rejects (with a format error):
 *   - Slash-separated text strings (e.g. "1/4/2021") — wrong typed format
 *   - Garbage text (no digits)
 *   - Calendar-invalid dates (e.g. month > 12, day > daysInMonth, year out of range)
 *
 * After this schema validates the format, the parent sheet schema's `validateDateMatchesMonthYear`
 * superRefine cross-validates the date's month/year against the Month and Year columns and emits
 * a more specific mismatch error (with day/month swap detection to handle Excel's locale-dependent
 * auto-parsing of date-formatted cells).
 */
const dateFieldSchema = z
  .union([z.string(), z.number(), z.date()])
  .optional()
  .transform((val) => {
    if (val === null || val === undefined || val === "") return undefined;

    // Date object — Excel auto-converted a date-formatted cell. Decode to DD/MM/YYYY (internal).
    if (val instanceof Date) {
      if (isNaN(val.getTime())) return "INVALID_DATE_VALUE";
      const day = String(val.getDate()).padStart(2, "0");
      const month = String(val.getMonth() + 1).padStart(2, "0");
      const year = val.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Excel serial date number — decode to DD/MM/YYYY (internal).
    if (typeof val === "number") {
      if (!Number.isFinite(val) || val < 1) return "INVALID_DATE_VALUE";
      const excelEpoch = new Date(1899, 11, 30); // Excel's epoch (Lotus 1-2-3 leap year quirk)
      const jsDate = new Date(excelEpoch.getTime() + val * 86400000);
      if (isNaN(jsDate.getTime())) return "INVALID_DATE_VALUE";
      const day = String(jsDate.getDate()).padStart(2, "0");
      const month = String(jsDate.getMonth() + 1).padStart(2, "0");
      const year = jsDate.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // string
    const strVal = String(val).trim();
    if (strVal === "") return undefined;

    // Normalize D-M-YYYY, DD-M-YYYY, D-MM-YYYY, DD-MM-YYYY to DD/MM/YYYY (hyphen only)
    if (looseDateRegex.test(strVal)) {
      const parts = strVal.split("-");
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${day}/${month}/${year}`;
    }

    // Slash-separated dates are explicitly rejected — only hyphen (DD-MM-YYYY) is accepted
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(strVal)) return "INVALID_DATE";

    // No digits — clearly not a date (e.g. "asdsdfd")
    if (!/\d/.test(strVal)) return "INVALID_DATE_VALUE";

    return strVal;
  })
  .refine((val) => val !== "INVALID_DATE", {
    message: "Date must be in DD-MM-YYYY format",
  })
  .refine((val) => val !== "INVALID_DATE_VALUE", {
    message: "Please enter a valid date",
  })
  .refine(
    (val) => {
      if (val === undefined) return true;
      // Must match DD/MM/YYYY format (normalized form after transform)
      if (!validDateRegex.test(val)) return false;
      // Validate actual date values
      const [dd, mm, yyyy] = val.split("/").map(Number);
      if (mm < 1 || mm > 12) return false;
      if (dd < 1 || dd > 31) return false;
      const year = Number(yyyy);
      if (year < 1900 || year > 2099) return false;
      // Check the day is valid for the given month/year
      const daysInMonth = new Date(year, mm, 0).getDate();
      if (dd > daysInMonth) return false;
      return true;
    },
    {
      message: "Date must be in DD-MM-YYYY format",
    }
  );

/**
 * SuperRefine to cross-validate the Date column's month/year against the Month and Year columns.
 * Runs only after `dateFieldSchema` has accepted a calendar-valid date — so any issue this
 * function adds is necessarily a Month/Year mismatch (not a format error).
 *
 * Emits a single combined issue per row so the error display (which surfaces only the first
 * error per column) always shows the correct mismatch message.
 *
 * Handles the Excel day/month swap: when the user types "02-12-2026" meaning Dec 2, but the
 * cell is formatted as a date and Excel (US locale) interprets it as Feb 12 → serial number →
 * "12/02/2026" after decoding. When the decoded day ≤ 12 and the decoded day matches the
 * Month column, we treat it as a swapped representation of the user's intended D-M-YYYY input
 * and accept the row.
 */
const validateDateMatchesMonthYear = (
  data: { Date?: string; Month?: string; Year?: unknown },
  ctx: z.RefinementCtx
) => {
  if (!data.Date || data.Date === undefined) return;
  const parts = data.Date.split("/");
  if (parts.length !== 3) return; // format already validated by dateFieldSchema

  const dateDay = Number(parts[0]);
  const dateMonth = Number(parts[1]);
  const dateYear = Number(parts[2]);

  let expectedMonth = -1;
  if (data.Month) {
    const monthIndex = months.findIndex(
      (m) => sanitizeString.v1(m) === sanitizeString.v1(data.Month!)
    );
    if (monthIndex !== -1) {
      expectedMonth = monthIndex + 1;
    }
  }

  // Determine effective month: handle possible Excel day/month swap.
  // If dateMonth doesn't match but dateDay does (and dateDay ≤ 12),
  // the user likely intended D/M/YYYY but Excel swapped to M/D.
  let effectiveMonth = dateMonth;
  if (
    expectedMonth !== -1 &&
    dateMonth !== expectedMonth &&
    dateDay <= 12 &&
    dateDay === expectedMonth
  ) {
    effectiveMonth = dateDay;
  }

  let monthMismatch = false;
  let yearMismatch = false;

  if (expectedMonth !== -1 && effectiveMonth !== expectedMonth) {
    monthMismatch = true;
  }

  // Check year
  if (data.Year !== undefined && data.Year !== null) {
    const yearNum = Number(data.Year);
    if (!isNaN(yearNum) && dateYear !== yearNum) {
      yearMismatch = true;
    }
  }

  // Emit a single issue with the appropriate message
  if (monthMismatch && yearMismatch) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "The month and year in Date do not match the Month and Year columns",
      path: ["Date"],
    });
  } else if (monthMismatch) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "The month in Date does not match the Month column",
      path: ["Date"],
    });
  } else if (yearMismatch) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "The year in Date does not match the Year column",
      path: ["Date"],
    });
  }
};

//#region Shared field schemas
const lifetimeOfProductSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const strVal = String(val).trim();
    if (strVal === "") return undefined;
    const num = Number(strVal);
    if (isNaN(num) || num <= 0) return "INVALID";
    return strVal;
  })
  .refine((val) => val !== "INVALID", {
    message: "Lifetime of Product must be a positive number or left blank",
  });

const rationaleSchema = z.preprocess(
  (val) => {
    if (val === null || val === undefined) return undefined;
    const trimmed = String(val).trim();
    // Whitespace-only (spaces, newlines, tabs) is treated as not provided
    return trimmed === "" ? undefined : trimmed;
  },
  z
    .string({
      invalid_type_error: "Invalid Input: Numeric values are not allowed",
    })
    .optional()
    .refine(
      (val) => {
        if (val === undefined) return true;
        // Block pure numeric values (positive or negative, with or without decimals)
        if (/^-?\d+(\.\d+)?$/.test(val)) return false;
        return true;
      },
      {
        message: "Invalid Input: Numeric values are not allowed",
      }
    )
);

const workingDetailsSchema = (fieldName: string) =>
  z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return undefined;
      return typeof val !== "string" ? String(val) : val;
    },
    z
      .string()
      .max(5000, `${fieldName} must not exceed 5000 characters`)
      .optional()
  );

const numericFieldSchema = (fieldName: string) =>
  z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return "REQUIRED";
      const strVal = String(val).trim();
      if (strVal === "") return "REQUIRED";
      if (!validNumericRegex.test(strVal)) return "INVALID_FORMAT";
      const digitCount = strVal.replace(/\D/g, "").length;
      if (digitCount > 15) return "INVALID_FORMAT";
      const num = Number(strVal);
      if (isNaN(num)) return "INVALID_FORMAT";
      const decimalPlaces = (strVal.split(".")[1] || "").length;
      if (decimalPlaces > 4) return "EXCEEDS_DECIMAL";
      return num;
    })
    .refine((val) => val !== "REQUIRED", {
      message: `${fieldName} is required`,
    })
    .refine((val) => val !== "INVALID_FORMAT", {
      message: `Please enter a valid numeric value (max 15 digits, up to 4 decimal places)`,
    })
    .refine((val) => val !== "EXCEEDS_DECIMAL", {
      message:
        "Please ensure that values are entered with up to 4 decimal places only",
    })
    .refine(
      (val) => val === undefined || (typeof val === "number" && val >= 0),
      {
        message: "Value can not be less than 0",
      }
    );
//#endregion

//#region Sheet Schemas
// Fuel Sheet Schema
// Required: Year, Month, Type of Fuel Consumed, Product Code,
//           Quantity of Fuel Consumed (product lifetime), UoM of Fuel Consumed
// Optional: Date, Lifetime of Product, Rationale, Additional comments, Remarks
export const fuelSheetSchema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      Year: YearMonthSchema(baseYear).shape.Year.refine(
        (val) => val >= baseYear,
        {
          message: `Data can only be uploaded from the baseline year (${baseYear}) onwards`,
        }
      ),
      Date: dateFieldSchema,
      "Type of Fuel Consumed": z
        .string({
          invalid_type_error: "Invalid Input: Numeric values are not allowed",
        })
        .min(1, "Type of Fuel Consumed is required"),
      "Product Code": z.preprocess(
        (val) =>
          typeof val !== "string" ? String(val ?? "").trim() : val.trim(),
        z
          .string()
          .min(1, "Product Code is required")
          .refine((val) => validProductCodeRegex.test(val), {
            message: "Invalid Entry: Product Code contains invalid characters",
          })
      ),
      "Lifetime of Product": lifetimeOfProductSchema,
      Rationale: rationaleSchema,
      "Quantity of Fuel Consumed (product lifetime)": numericFieldSchema(
        "Quantity of Fuel Consumed (product lifetime)"
      ),
      "UoM of Fuel Consumed": z
        .string({
          required_error: "UoM of Fuel Consumed is required",
          invalid_type_error:
            "Invalid Input : Only alphabetic characters are allowed for UoM",
        })
        .min(1, { message: "UoM of Fuel Consumed is required" }),
      "Additional comments": z.preprocess(
        (val) => (typeof val !== "string" ? String(val ?? "") : val),
        z.string().optional()
      ),
      Remarks: z.preprocess(
        (val) => (typeof val !== "string" ? String(val ?? "") : val),
        z.string().optional()
      ),
      "Working details 1": workingDetailsSchema("Working details 1"),
      "Working details 2": workingDetailsSchema("Working details 2"),
      "Working details 3": workingDetailsSchema("Working details 3"),
      "Working details 4": workingDetailsSchema("Working details 4"),
      "Working details 5": workingDetailsSchema("Working details 5"),
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
        message:
          yearMonthError.length > 0
            ? yearMonthError[0].errorMessage
            : "Invalid",
        path: [yearMonthError?.[0]?.column || "Month"],
      })
    )
    .superRefine(validateDateMatchesMonthYear);
};

// Electricity Sheet Schema
// Required: Year, Month, Product Code, Region,
//           Units of Electricity consumed in kWh (product lifetime)
// Optional: Date, Lifetime of Product, Rationale, Additional comments, Remarks
export const electricitySheetSchema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      Year: YearMonthSchema(baseYear).shape.Year.refine(
        (val) => val >= baseYear,
        {
          message: `Data can only be uploaded from the baseline year (${baseYear}) onwards`,
        }
      ),
      Date: dateFieldSchema,
      "Product Code": z.preprocess(
        (val) =>
          typeof val !== "string" ? String(val ?? "").trim() : val.trim(),
        z
          .string()
          .min(1, "Product Code is required")
          .refine((val) => validProductCodeRegex.test(val), {
            message: "Invalid Entry: Product Code contains invalid characters",
          })
      ),
      "Lifetime of Product": lifetimeOfProductSchema,
      Rationale: rationaleSchema,
      Region: z.preprocess(
        (val) => (typeof val !== "string" ? String(val ?? "") : val),
        z.string().trim().min(1, "Region is required")
      ),
      "Units of Electricity consumed in kWh (product lifetime)":
        numericFieldSchema(
          "Units of Electricity consumed in kWh (product lifetime)"
        ),
      "Additional comments": z.preprocess(
        (val) => (typeof val !== "string" ? String(val ?? "") : val),
        z.string().optional()
      ),
      Remarks: z.preprocess(
        (val) => (typeof val !== "string" ? String(val ?? "") : val),
        z.string().optional()
      ),
      "Working details 1": workingDetailsSchema("Working details 1"),
      "Working details 2": workingDetailsSchema("Working details 2"),
      "Working details 3": workingDetailsSchema("Working details 3"),
      "Working details 4": workingDetailsSchema("Working details 4"),
      "Working details 5": workingDetailsSchema("Working details 5"),
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
        message:
          yearMonthError.length > 0
            ? yearMonthError[0].errorMessage
            : "Invalid",
        path: [yearMonthError?.[0]?.column || "Month"],
      })
    )
    .superRefine(validateDateMatchesMonthYear);
};

// Refrigerant Sheet Schema
// Required: Year, Month, Product Code, Refrigerant type used in sold product,
//           Quantity of Refrigerant consumed, UoM of Refrigerant consumed
// Optional: Date, Lifetime of Product, Rationale, Additional comments, Remarks
export const refrigerantSheetSchema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      Year: YearMonthSchema(baseYear).shape.Year.refine(
        (val) => val >= baseYear,
        {
          message: `Data can only be uploaded from the baseline year (${baseYear}) onwards`,
        }
      ),
      Date: dateFieldSchema,
      "Product Code": z.preprocess(
        (val) =>
          typeof val !== "string" ? String(val ?? "").trim() : val.trim(),
        z
          .string()
          .min(1, "Product Code is required")
          .refine((val) => validProductCodeRegex.test(val), {
            message: "Invalid Entry: Product Code contains invalid characters",
          })
      ),
      "Lifetime of Product": lifetimeOfProductSchema,
      Rationale: rationaleSchema,
      "Refrigerant type used in sold product": z
        .string({
          invalid_type_error: "Invalid Input: Numeric values are not allowed",
        })
        .min(1, "Refrigerant type used in sold product is required"),
      "Quantity of Refrigerant consumed": numericFieldSchema(
        "Quantity of Refrigerant consumed"
      ),
      "UoM of Refrigerant consumed": z
        .string({
          required_error: "UoM of Refrigerant consumed is required",
          invalid_type_error:
            "Invalid Input : Only alphabetic characters are allowed for UoM",
        })
        .min(1, { message: "UoM of Refrigerant consumed is required" }),
      "Additional comments": z.preprocess(
        (val) => (typeof val !== "string" ? String(val ?? "") : val),
        z.string().optional()
      ),
      Remarks: z.preprocess(
        (val) => (typeof val !== "string" ? String(val ?? "") : val),
        z.string().optional()
      ),
      "Working details 1": workingDetailsSchema("Working details 1"),
      "Working details 2": workingDetailsSchema("Working details 2"),
      "Working details 3": workingDetailsSchema("Working details 3"),
      "Working details 4": workingDetailsSchema("Working details 4"),
      "Working details 5": workingDetailsSchema("Working details 5"),
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
        message:
          yearMonthError.length > 0
            ? yearMonthError[0].errorMessage
            : "Invalid",
        path: [yearMonthError?.[0]?.column || "Month"],
      })
    )
    .superRefine(validateDateMatchesMonthYear);
};
//#endregion

//#region Template Validation
export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
  let errorMessageData: TTemplateErrorData[] = [];

  const sheetsWithData = excelData.filter(
    (errorItem) => errorItem.data.length > 0
  ).length;

  if (sheetsWithData === 0) {
    errorMessageData.push({
      sheet: "Use of Sold Products",
      error_message:
        "No data found in sheet " +
        `'${excelData.map((item) => item.sheetName)}'`,
    });
    return errorMessageData;
  }

  templateSheets.forEach((templateSheet) => {
    const sheetData = excelData.find(
      (sheet) =>
        sanitizeString.v4(sheet.sheetName) ===
        sanitizeString.v4(templateSheet.name)
    );

    if (!sheetData) {
      const error_message = `Sheet '${templateSheet.name}' not found`;
      errorMessageData.push({ sheet: "", error_message });
      return;
    }

    // Only validate columns for sheets that have data
    if (sheetData.data.length > 0) {
      const sheetValidations = validateSheetName(excelData, templateSheet.name);
      if (sheetValidations.length > 0) {
        errorMessageData.push({ ...sheetValidations[0] });
        return;
      }

      const templateColumnNames = templateSheet.columns.map((m) => m.name);
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

  return errorMessageData;
};
//#endregion

//#region Zod Validation per sheet
const validateFuelSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    const columnObject: any = {};
    const safeparseData = fuelSheetSchema(baseMonth, baseYear).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      const sheetConfig = templateSheets.find(
        (s) => sanitizeString.v4(s.name) === sanitizeString.v4(sheet.sheetName)
      );
      sheetConfig?.columns.forEach((columnItem) => {
        safeparseData.error.issues.forEach((issueItem) => {
          if (columnObject[columnItem.name]) return;
          if (columnItem.name === issueItem.path[0]) {
            columnObject[columnItem.name] = issueItem.message;
          } else {
            columnObject[columnItem.name] = "";
          }
        });
      });
      errorEntries.push(columnObject);
    }
  });
  return errorEntries;
};

const validateElectricitySheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    const columnObject: any = {};
    const safeparseData = electricitySheetSchema(baseMonth, baseYear).safeParse(
      item
    );
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      const sheetConfig = templateSheets.find(
        (s) => sanitizeString.v4(s.name) === sanitizeString.v4(sheet.sheetName)
      );
      sheetConfig?.columns.forEach((columnItem) => {
        safeparseData.error.issues.forEach((issueItem) => {
          if (columnObject[columnItem.name]) return;
          if (columnItem.name === issueItem.path[0]) {
            columnObject[columnItem.name] = issueItem.message;
          } else {
            columnObject[columnItem.name] = "";
          }
        });
      });
      errorEntries.push(columnObject);
    }
  });
  return errorEntries;
};

const validateRefrigerantSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    const columnObject: any = {};
    const safeparseData = refrigerantSheetSchema(baseMonth, baseYear).safeParse(
      item
    );
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      const sheetConfig = templateSheets.find(
        (s) => sanitizeString.v4(s.name) === sanitizeString.v4(sheet.sheetName)
      );
      sheetConfig?.columns.forEach((columnItem) => {
        safeparseData.error.issues.forEach((issueItem) => {
          if (columnObject[columnItem.name]) return;
          if (columnItem.name === issueItem.path[0]) {
            columnObject[columnItem.name] = issueItem.message;
          } else {
            columnObject[columnItem.name] = "";
          }
        });
      });
      errorEntries.push(columnObject);
    }
  });
  return errorEntries;
};

const validateSheetMethods: Record<
  TUseOfSoldProductsSheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, string>[]
> = {
  Fuel: validateFuelSheet,
  Electricity: validateElectricitySheet,
  Refrigerant: validateRefrigerantSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: string
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TUseOfSoldProductsSheetNames]: Record<
      TUseOfSoldProductsColumnNames,
      any
    >[];
  } = { Fuel: [], Electricity: [], Refrigerant: [] };

  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({ organizationId });

  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TUseOfSoldProductsSheetNames;
    if (validateSheetMethods[sheetName] && sheet.data.length > 0) {
      failedEntries[sheetName] = validateSheetMethods[sheetName](
        sheet,
        orgData.Organization[0].FinancialYearMonth,
        orgData.Organization[0].Baselineyear
      );
      excelSheetData.push({
        sheetName: sheetName,
        data: failedEntries[sheetName],
      });
    }
  });

  return excelSheetData;
};
//#endregion

//#region Master Data Validation
/**
 * Returns true if every row in the given UoM master_key has a `group` array
 * (not null/undefined). The group helper (`validateActivityMasterDataGroupByKey`)
 * iterates every row and calls `.filter` on `group`; a single row with null
 * group throws "Cannot read properties of undefined (reading 'filter')". If
 * the DB isn't fully populated, fall back to flat `validateActivityMasterDataByKey`
 * so the upload doesn't 500.
 */
const isGroupPopulated = (
  activityMasterData: TActivityMasterData[],
  uomKey: string
): boolean => {
  const rows = activityMasterData.find(
    (m) => m.master_key === uomKey
  )?.master_data;
  if (!rows || rows.length === 0) return false;
  return rows.every((row) => Array.isArray(row.group));
};

/**
 * Returns true only when at least one UoM row's group[] contains a v1-match for
 * the resolved parentValue of the given parentLabel. Fuel/refrigerant type names
 * that contain special characters like `<`, `>`, `(`, `)` can cause the value
 * field in ActivityMaster to diverge from what the UoM group[] stores, producing
 * an empty dataArray inside validateActivityMasterDataGroupByKey and a malformed
 * "Invalid value : Data should be " error for valid combinations. When this check
 * returns false, the caller falls back to flat validateActivityMasterDataByKey.
 */
const canGroupMatchParent = (
  activityMasterData: TActivityMasterData[],
  parentLabel: string,
  uomKey: string,
  parentKey: string
): boolean => {
  const parentMasterData =
    activityMasterData.find((m) => m.master_key === parentKey)?.master_data ??
    [];

  const parentRow = parentMasterData.find(
    (item) => sanitizeString.v4(item.label) === sanitizeString.v4(parentLabel)
  );
  if (!parentRow) return false;

  const parentValue = parentRow.value;

  const uomRows =
    activityMasterData.find((m) => m.master_key === uomKey)?.master_data ?? [];

  return uomRows.some(
    (row) =>
      Array.isArray(row.group) &&
      row.group.some(
        (g) => sanitizeString.v4(String(g)) === sanitizeString.v4(parentValue)
      )
  );
};

const validateFuelSheetMasterData = (
  sheet: TExcelSheet,
  activityMasterData: TActivityMasterData[]
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index = 0;
  const allColumns = [
    ...(templateSheets.find(
      (s) => sanitizeString.v4(s.name) === sanitizeString.v4(sheet.sheetName)
    )?.columns ?? []),
  ];

  sheet.data.forEach((dataItem: Record<string, string>) => {
    const errorEntries: TErrorExcelSheet[] = [];
    index++;

    // Validate "Type of Fuel Consumed" against master key.
    // If parent is valid, cross-validate "UoM of Fuel Consumed" against the
    // fuel type's allowed UoMs (group). This ensures e.g. "Acetylene" only
    // accepts its permitted UoMs (not arbitrary ones like "Litre").
    if (!!dataItem["Type of Fuel Consumed"]) {
      const fuelTypeErrors = validateActivityMasterDataByKey(
        activityMasterData,
        dataItem["Type of Fuel Consumed"],
        index,
        USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY,
        "Type of Fuel Consumed",
        ApiHitType.Excel
      );
      if (fuelTypeErrors.length > 0) {
        errorEntries.push({ ...fuelTypeErrors[0] });
      } else {
        const useGroup =
          isGroupPopulated(
            activityMasterData,
            USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY
          ) &&
          canGroupMatchParent(
            activityMasterData,
            dataItem["Type of Fuel Consumed"],
            USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY,
            USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY
          );
        const fuelUomErrors = useGroup
          ? validateActivityMasterDataGroupByKey(
              activityMasterData,
              dataItem["Type of Fuel Consumed"],
              dataItem["UoM of Fuel Consumed"],
              index,
              USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY,
              "UoM of Fuel Consumed",
              ApiHitType.Excel,
              USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY
            )
          : validateActivityMasterDataByKey(
              activityMasterData,
              dataItem["UoM of Fuel Consumed"],
              index,
              USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY,
              "UoM of Fuel Consumed",
              ApiHitType.Excel
            );
        if (fuelUomErrors.length > 0) {
          errorEntries.push({ ...fuelUomErrors[0] });
        }
      }
    }

    // Validate "Rationale" against master key (only if value is provided)
    // if (dataItem["Rationale"] && String(dataItem["Rationale"]).trim() !== "") {
    //   const rationaleErrors = validateActivityMasterDataByKey(
    //     activityMasterData,
    //     dataItem["Rationale"],
    //     index,
    //     USE_OF_SOLD_PRODUCTS_RATIONALE_KEY,
    //     "Rationale",
    //     ApiHitType.Excel
    //   );
    //   if (rationaleErrors.length > 0) {
    //     errorEntries.push({ ...rationaleErrors[0] });
    //   }
    // }

    if (errorEntries.length > 0) {
      const errorRow = createErrorDataForExcel(allColumns, errorEntries);
      sheetAllErrorEntries.push(errorRow[0]);
    }
  });
  return sheetAllErrorEntries;
};

const validateElectricitySheetMasterData = (
  sheet: TExcelSheet,
  activityMasterData: TActivityMasterData[]
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index = 0;
  const allColumns = [
    ...(templateSheets.find(
      (s) => sanitizeString.v4(s.name) === sanitizeString.v4(sheet.sheetName)
    )?.columns ?? []),
  ];

  sheet.data.forEach((dataItem: Record<string, string>) => {
    const errorEntries: TErrorExcelSheet[] = [];
    index++;

    // Validate "Rationale" against master key (only if value is provided)
    // if (dataItem["Rationale"] && String(dataItem["Rationale"]).trim() !== "") {
    //   const rationaleErrors = validateActivityMasterDataByKey(
    //     activityMasterData,
    //     dataItem["Rationale"],
    //     index,
    //     USE_OF_SOLD_PRODUCTS_RATIONALE_KEY,
    //     "Rationale",
    //     ApiHitType.Excel
    //   );
    //   if (rationaleErrors.length > 0) {
    //     errorEntries.push({ ...rationaleErrors[0] });
    //   }
    // }

    if (errorEntries.length > 0) {
      const errorRow = createErrorDataForExcel(allColumns, errorEntries);
      sheetAllErrorEntries.push(errorRow[0]);
    }
  });
  return sheetAllErrorEntries;
};

const validateRefrigerantSheetMasterData = (
  sheet: TExcelSheet,
  activityMasterData: TActivityMasterData[]
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index = 0;
  const allColumns = [
    ...(templateSheets.find(
      (s) => sanitizeString.v4(s.name) === sanitizeString.v4(sheet.sheetName)
    )?.columns ?? []),
  ];

  sheet.data.forEach((dataItem: Record<string, string>) => {
    const errorEntries: TErrorExcelSheet[] = [];
    index++;

    // Validate "Rationale" against master key (only if value is provided)
    // if (dataItem["Rationale"] && String(dataItem["Rationale"]).trim() !== "") {
    //   const rationaleErrors = validateActivityMasterDataByKey(
    //     activityMasterData,
    //     dataItem["Rationale"],
    //     index,
    //     USE_OF_SOLD_PRODUCTS_RATIONALE_KEY,
    //     "Rationale",
    //     ApiHitType.Excel
    //   );
    //   if (rationaleErrors.length > 0) {
    //     errorEntries.push({ ...rationaleErrors[0] });
    //   }
    // }

    // Validate "Refrigerant type used in sold product" against master key.
    // If parent is valid, cross-validate "UoM of Refrigerant consumed"
    // against the refrigerant type's allowed UoMs (group).
    if (!!dataItem["Refrigerant type used in sold product"]) {
      const refrigerantTypeErrors = validateActivityMasterDataByKey(
        activityMasterData,
        dataItem["Refrigerant type used in sold product"],
        index,
        USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY,
        "Refrigerant type used in sold product",
        ApiHitType.Excel
      );
      if (refrigerantTypeErrors.length > 0) {
        errorEntries.push({ ...refrigerantTypeErrors[0] });
      } else {
        const useGroup =
          isGroupPopulated(
            activityMasterData,
            USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY
          ) &&
          canGroupMatchParent(
            activityMasterData,
            dataItem["Refrigerant type used in sold product"],
            USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY,
            USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY
          );
        const refrigerantUomErrors = useGroup
          ? validateActivityMasterDataGroupByKey(
              activityMasterData,
              dataItem["Refrigerant type used in sold product"],
              dataItem["UoM of Refrigerant consumed"],
              index,
              USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY,
              "UoM of Refrigerant consumed",
              ApiHitType.Excel,
              USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY
            )
          : validateActivityMasterDataByKey(
              activityMasterData,
              dataItem["UoM of Refrigerant consumed"],
              index,
              USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY,
              "UoM of Refrigerant consumed",
              ApiHitType.Excel
            );
        if (refrigerantUomErrors.length > 0) {
          errorEntries.push({ ...refrigerantUomErrors[0] });
        }
      }
    }

    if (errorEntries.length > 0) {
      const errorRow = createErrorDataForExcel(allColumns, errorEntries);
      sheetAllErrorEntries.push(errorRow[0]);
    }
  });
  return sheetAllErrorEntries;
};

const validateSheetMasterDataMethods: Record<
  TUseOfSoldProductsSheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, string>[]
> = {
  Fuel: validateFuelSheetMasterData,
  Electricity: validateElectricitySheetMasterData,
  Refrigerant: validateRefrigerantSheetMasterData,
};

const validateDataByDb = async (
  excelData: TExcelSheet[],
  organizationId: string
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TUseOfSoldProductsSheetNames]: Record<string, string>[];
  } = { Fuel: [], Electricity: [], Refrigerant: [] };

  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.use_of_sold_products,
  });

  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TUseOfSoldProductsSheetNames;
    if (validateSheetMasterDataMethods[sheetName] && sheet.data.length > 0) {
      failedEntries[sheetName] = validateSheetMasterDataMethods[sheetName](
        sheet,
        activityMasterData?.ActivityMaster
      );
      excelSheetData.push({
        sheetName: sheetName,
        data: failedEntries[sheetName],
      });
    }
  });

  return excelSheetData;
};
//#endregion

//#region Duplicate Detection

/**
 * Get columns A through I for a given sheet to build full-row duplicate keys.
 */
const getColumnsAtoI = (sheetName: string): string[] => {
  if (sheetName === "Fuel")
    return [
      "Year",
      "Month",
      "Date",
      "Type of Fuel Consumed",
      "Product Code",
      "Lifetime of Product",
      "Rationale",
      "Quantity of Fuel Consumed (product lifetime)",
      "UoM of Fuel Consumed",
    ];
  if (sheetName === "Electricity")
    return [
      "Year",
      "Month",
      "Date",
      "Product Code",
      "Lifetime of Product",
      "Rationale",
      "Region",
      "Units of Electricity consumed in kWh (product lifetime)",
    ];
  if (sheetName === "Refrigerant")
    return [
      "Year",
      "Month",
      "Date",
      "Product Code",
      "Lifetime of Product",
      "Rationale",
      "Refrigerant type used in sold product",
      "Quantity of Refrigerant consumed",
      "UoM of Refrigerant consumed",
    ];
  return [];
};

/**
 * Build a full-row key from columns A-I for duplicate comparison.
 */
const buildFullRowKey = (
  row: Record<string, string>,
  columns: string[]
): string => {
  return columns
    .map((col) =>
      String(row[col] ?? "")
        .trim()
        .toLowerCase()
    )
    .join("|");
};

/**
 * Emit a duplicate error only when every column A–I in the current row
 * matches some earlier row exactly. If any single column differs (e.g.
 * different Quantity), the rows are treated as distinct entries.
 */
const validateFullRowDuplicate = (
  sheet: TExcelSheet,
  columnsAtoI: string[]
): Record<string, string>[] => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    index++;
    const errorEntries: TErrorExcelSheet[] = [];

    const currentRowKey = buildFullRowKey(dataItem, columnsAtoI);
    for (let i = 0; i < index - 1; i++) {
      const priorRow = sheet.data[i] as Record<string, string>;
      if (buildFullRowKey(priorRow, columnsAtoI) === currentRowKey) {
        errorEntries.push({
          column: "Month",
          row: index,
          errorMessage:
            "Duplicate Entry Detected: This record already exists. Please enter unique data.",
        });
        break;
      }
    }

    if (errorEntries.length > 0) {
      const allcolumns = [
        ...(templateSheets.find(
          (s) =>
            sanitizeString.v4(s.name) === sanitizeString.v4(sheet.sheetName)
        )?.columns ?? []),
      ];
      const errorrow = createErrorDataForExcel(allcolumns, errorEntries);
      sheetAllErrorEntries.push(errorrow[0]);
    }
  });
  return sheetAllErrorEntries;
};

const validateFuelDuplicateDataSheet = (sheet: TExcelSheet) =>
  validateFullRowDuplicate(sheet, getColumnsAtoI("Fuel"));

const validateElectricityDuplicateDataSheet = (sheet: TExcelSheet) =>
  validateFullRowDuplicate(sheet, getColumnsAtoI("Electricity"));

const validateRefrigerantDuplicateDataSheet = (sheet: TExcelSheet) =>
  validateFullRowDuplicate(sheet, getColumnsAtoI("Refrigerant"));

const validateduplicateSheetMethods: Record<
  TUseOfSoldProductsSheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  Fuel: validateFuelDuplicateDataSheet,
  Electricity: validateElectricityDuplicateDataSheet,
  Refrigerant: validateRefrigerantDuplicateDataSheet,
};

const handleCheckDuplicates = async (excelData: TExcelSheet[]) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TUseOfSoldProductsSheetNames]: Record<
      TUseOfSoldProductsColumnNames,
      any
    >[];
  } = { Fuel: [], Electricity: [], Refrigerant: [] };

  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TUseOfSoldProductsSheetNames;
    if (validateduplicateSheetMethods[sheetName] && sheet.data.length > 0) {
      failedEntries[sheetName] =
        validateduplicateSheetMethods[sheetName](sheet);
      excelSheetData.push({
        sheetName: sheetName,
        data: failedEntries[sheetName],
      });
    }
  });

  return excelSheetData;
};
//#endregion

//#region Data Validation
export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  userSession: TUserSession,
  org_address_id: UUID,
  isFromForm: boolean = false
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];

  const dynamicTemplateSheets = JSON.parse(JSON.stringify(templateSheets));

  // Step 1: Zod schema validation (types, required fields, date ranges)
  const zodErrorEntries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    userSession.organizationId
  );
  allError = combineAllErrorSheets(zodErrorEntries, allError);

  // Step 2: Master data validation (values must exist in ActivityMaster DB)
  const masterErrorEntries: TExcelSheet[] = await validateDataByDb(
    excelData,
    userSession.organizationId
  );
  allError = combineAllErrorSheets(masterErrorEntries, allError);

  // Step 3: Duplicate record detection
  const duplicateEntries: TExcelSheet[] =
    await handleCheckDuplicates(excelData);
  allError = combineAllErrorSheets(duplicateEntries, allError);

  finalError = combineAllTypeErrorInRow(allError, dynamicTemplateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};
//#endregion
