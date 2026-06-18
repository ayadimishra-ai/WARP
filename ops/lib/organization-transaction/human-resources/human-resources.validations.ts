import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
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
  type TExcelSheet,
} from "~/lib/excel/excel.service";
import {
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import {
  HumanResourcesActivityConstant,
  THumanResourcesActivitySheetColumnNames,
  THumanResourcesActivitySheetNames,
} from "~/shared/constants/activity.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import { toNumber } from "~/utils/data-transformer.util";
import {
  months,
  validateMonthYear,
  validateYearWithoutMonth,
} from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } =
  HumanResourcesActivityConstant.excel_template;

const employeediversity = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Employment Type": z
        .preprocess(
          (val) =>
            typeof val === "string" || typeof val === "number"
              ? String(val)
              : val,
          z.string()
        )
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val === "" || /^[a-zA-Z\s/]+$/.test(val), {
          message: "Invalid Input",
        })
        .optional(),
      "Employee Category": z
        .preprocess(
          (val) =>
            typeof val === "string" || typeof val === "number"
              ? String(val)
              : val,
          z.string()
        )
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: "Employee Category is required",
        })
        .refine((val) => /^[a-zA-Z\s/]+$/.test(val), {
          message: "Invalid Input",
        }),
      "Male Employees": z
        .unknown()
        .refine((q) => !(String(q).trim() === ""), "Male Employees is required")
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Male Employees. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Male Employees cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Male Employees cannot be a decimal. Please enter a whole number."
        ),
      "Female Employees": z
        .unknown()
        .refine(
          (q) => !(String(q).trim() === ""),
          "Female Employees is required"
        )
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Female Employees. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Female Employees cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Female Employees cannot be a decimal. Please enter a whole number."
        ),
      "Other Gender Employees": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Other Gender Employees. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Other Gender Employees cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Other Gender Employees cannot be a decimal. Please enter a whole number."
        )
        .optional()
        .or(z.literal("")),
      "Minority Group Employees": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Minority Group Employees. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Minority Group Employees cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Minority Group Employees cannot be a decimal. Please enter a whole number."
        )
        .optional()
        .or(z.literal("")),
      "Male Employees with Disabilities": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Male Employees with Disabilities. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Male Employees with Disabilities cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Male Employees with Disabilities cannot be a decimal. Please enter a whole number."
        )
        .optional()
        .or(z.literal("")),
      "Female Employees with Disabilities": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Female Employees with Disabilities. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Female Employees with Disabilities cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Female Employees with Disabilities cannot be a decimal. Please enter a whole number."
        )
        .optional()
        .or(z.literal("")),
      "Other Gender Employees with Disabilities": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Other Gender Employees with Disabilities. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Other Gender Employees with Disabilities cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Other Gender Employees with Disabilities cannot be a decimal. Please enter a whole number."
        )
        .optional()
        .or(z.literal("")),
      "Under 30 years old": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Under 30 years old. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Under 30 years old cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Under 30 years old cannot be a decimal. Please enter a whole number."
        )
        .optional()
        .or(z.literal("")),
      "30 to 50 years old": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for 30 to 50 years old. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for 30 to 50 years old cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for 30 to 50 years old cannot be a decimal. Please enter a whole number."
        )
        .optional()
        .or(z.literal("")),
      "Above 50 years old": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Above 50 years old. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Above 50 years old cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Above 50 years old cannot be a decimal. Please enter a whole number."
        )
        .optional()
        .or(z.literal("")),
      "Average basic salary (Male)": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Average basic salary (Male). Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Average basic salary (Male) cannot be negative. Please enter a positive number."
        )
        .optional()
        .or(z.literal("")),
      "Average basic salary (Female)": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Average basic salary (Female). Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Average basic salary (Female) cannot be negative. Please enter a positive number."
        )
        .optional()
        .or(z.literal("")),
      "Average Remuneration (Male)": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Average Remuneration (Male). Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Average Remuneration (Male) cannot be negative. Please enter a positive number."
        )
        .optional()
        .or(z.literal("")),
      "Average Remuneration (Female)": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Average Remuneration (Female). Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Average Remuneration (Female) cannot be negative. Please enter a positive number."
        )
        .optional()
        .or(z.literal("")),
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
const employeeturnover = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Employment Type": z
        .preprocess(
          (val) =>
            typeof val === "string" || typeof val === "number"
              ? String(val)
              : val,
          z.string()
        )
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val === "" || /^[a-zA-Z\s/]+$/.test(val), {
          message: "Invalid Input",
        })
        .optional(),
      "Employee Category": z
        .preprocess(
          (val) =>
            typeof val === "string" || typeof val === "number"
              ? String(val)
              : val,
          z.string()
        )
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: "Employee Category is required",
        })
        .refine((val) => /^[a-zA-Z\s/]+$/.test(val), {
          message: "Invalid Input",
        }),
      "Total Employees (Start of Period)": z
        .unknown()
        .refine(
          (q) => !(String(q).trim() === ""),
          "Total Employees (Start of Period) is required"
        )
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Total Employees (Start of Period). Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Total Employees (Start of Period) cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Total Employees (Start of Period) cannot be a decimal. Please enter a whole number."
        ),
      "New Hires (During the period)": z
        .unknown()
        .refine(
          (q) => !(String(q).trim() === ""),
          "New Hires (During the period) is required"
        )
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for New Hires (During the period). Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for New Hires (During the period) cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for New Hires (During the period) cannot be a decimal. Please enter a whole number."
        ),
      "Exits (During the Period)": z
        .unknown()
        .refine(
          (q) => !(String(q).trim() === ""),
          "Exits (During the Period) is required"
        )
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Exits (During the Period). Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Exits (During the Period) cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Exits (During the Period) cannot be a decimal. Please enter a whole number."
        ),
      "Number of Voluntary Exits": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Number of Voluntary Exits. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Number of Voluntary Exits cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Number of Voluntary Exits cannot be a decimal. Please enter a whole number."
        )
        .optional()
        .or(z.literal("")),
      "Number of Non Voluntary Exits": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Number of Non Voluntary Exits. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Number of Non Voluntary Exits cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Number of Non Voluntary Exits cannot be a decimal. Please enter a whole number."
        )
        .optional()
        .or(z.literal("")),
      "Average Tenure of Exiting Employees": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Average Tenure of Exiting Employees. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Average Tenure of Exiting Employees cannot be negative. Please enter a positive number."
        )
        .optional()
        .or(z.literal("")),
    })
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (month) => sanitizeString.v1(month) == sanitizeString.v1(Month)
        );
        if (fullNameMonth.length > 0) {
          yearMonthError = validateYearWithoutMonth(
            Month,
            Year,
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
const traininghours = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Employment Type": z
        .preprocess(
          (val) =>
            typeof val === "string" || typeof val === "number"
              ? String(val)
              : val,
          z.string()
        )
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val === "" || /^[a-zA-Z\s/]+$/.test(val), {
          message: "Invalid Input",
        })
        .optional(),
      "Employee Category": z
        .preprocess(
          (val) =>
            typeof val === "string" || typeof val === "number"
              ? String(val)
              : val,
          z.string()
        )
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val === "" || /^[a-zA-Z\s/]+$/.test(val), {
          message: "Invalid Input",
        })
        .optional(),
      "Total Employees": z
        .unknown()
        .refine(
          (q) => !(String(q).trim() === ""),
          "Total Employees is required"
        )
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Total Employees. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Total Employees cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Total Employees cannot be a decimal. Please enter a whole number."
        ),
      "Number of Employees Trained": z
        .unknown()
        .refine(
          (q) => !(String(q).trim() === ""),
          "Number of Employees Trained is required"
        )
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Number of Employees Trained. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Number of Employees Trained cannot be negative. Please enter a positive number."
        )
        .refine(
          (q) => Number.isInteger(toNumber(q)),
          "Invalid Input: The value for Number of Employees Trained cannot be a decimal. Please enter a whole number."
        ),
      "Total Training Hours": z
        .unknown()
        .refine(
          (q) => !(String(q).trim() === ""),
          "Total Training Hours is required"
        )
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Total Training Hours. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Total Training Hours cannot be negative. Please enter a positive number."
        ),
      "Training Type": z
        .preprocess(
          (val) =>
            typeof val === "string" || typeof val === "number"
              ? String(val)
              : val,
          z.string()
        )
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine(
          (val) =>
            val === "" ||
            (/^[a-zA-Z0-9\s().,'&/-]+$/.test(val) &&
              !/^-\d+(\.\d+)?$/.test(val)),
          {
            message:
              "Invalid input: Please enter only alphanumeric characters. Allowed symbols are ( ) . , / - ' &",
          }
        )
        .optional(),
      "Percentage Employees Certified (If Applicable)": z
        .unknown()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Input: Please enter a valid numeric value for Percentage Employees Certified (If Applicable). Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Percentage Employees Certified (If Applicable) cannot be negative. Please enter a positive number."
        )
        .optional()
        .or(z.literal("")),
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
const validateemployeediversitySheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = employeediversity(baseMonth, baseYear).safeParse(
      item
    );
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      HumanResourcesActivityConstant.excel_template.sheets
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

const validateemployeeturnoverSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = employeeturnover(baseMonth, baseYear).safeParse(
      item
    );
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      HumanResourcesActivityConstant.excel_template.sheets
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

const validatetraininghoursSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = traininghours(baseMonth, baseYear).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      HumanResourcesActivityConstant.excel_template.sheets
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
  THumanResourcesActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Employee Diversity": validateemployeediversitySheet,
  "Employee Turnover": validateemployeeturnoverSheet,
  "Training Hours": validatetraininghoursSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in THumanResourcesActivitySheetNames]: Record<
      THumanResourcesActivitySheetColumnNames,
      any
    >[];
  } = {
    "Employee Diversity": [],
    "Employee Turnover": [],
    "Training Hours": [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as THumanResourcesActivitySheetNames;
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

//#region Master Validation

const validateEmployeeDiversityDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Employment Type"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Employment Type"],
        index,
        "human_resources_employment_type",
        "Employment Type",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (!!dataItem["Employee Category"]) {
      const errorEntriesColumn2Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Employee Category"],
        index,
        "human_resources_employee_category",
        "Employee Category",
        ApiHitType.Excel
      );
      if (errorEntriesColumn2Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn2Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        HumanResourcesActivityConstant.excel_template.sheets.filter(
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

const validateEmployeeTurnoverDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Employment Type"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Employment Type"],
        index,
        "human_resources_employment_type",
        "Employment Type",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (!!dataItem["Employee Category"]) {
      const errorEntriesColumn2Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Employee Category"],
        index,
        "human_resources_employee_category",
        "Employee Category",
        ApiHitType.Excel
      );
      if (errorEntriesColumn2Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn2Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        HumanResourcesActivityConstant.excel_template.sheets.filter(
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

const validateTrainingHoursDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Employment Type"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Employment Type"],
        index,
        "human_resources_employment_type",
        "Employment Type",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (!!dataItem["Employee Category"]) {
      const errorEntriesColumn2Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Employee Category"],
        index,
        "human_resources_employee_category",
        "Employee Category",
        ApiHitType.Excel
      );
      if (errorEntriesColumn2Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn2Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        HumanResourcesActivityConstant.excel_template.sheets.filter(
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

const validateMasterDataSheetMethods: Record<
  THumanResourcesActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Employee Diversity": validateEmployeeDiversityDataSheet,
  "Employee Turnover": validateEmployeeTurnoverDataSheet,
  "Training Hours": validateTrainingHoursDataSheet,
};

const validateDatabyDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.human_resources,
  });
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in THumanResourcesActivitySheetNames]: Record<
      THumanResourcesActivitySheetColumnNames,
      any
    >[];
  } = {
    "Employee Diversity": [],
    "Employee Turnover": [],
    "Training Hours": [],
  };

  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as THumanResourcesActivitySheetNames;

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

//#endregion

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    organizationId
  );
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
    [key in THumanResourcesActivitySheetNames]: Record<
      THumanResourcesActivitySheetColumnNames,
      any
    >[];
  } = {
    "Employee Diversity": [],
    "Employee Turnover": [],
    "Training Hours": [],
  };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as THumanResourcesActivitySheetNames;
    failedEntries[sheetName] = validateduplicateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

const validateEmployeeDiversityDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (
      !!dataItem["Employee Category"] &&
      !!dataItem["Year"] &&
      !!dataItem["Month"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "Employment Type",
        "Employee Category",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["Employment Type"],
        dataItem["Employee Category"],
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
        HumanResourcesActivityConstant.excel_template.sheets.filter(
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
const validateEmployeeTurnoverDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (!!dataItem["Employee Category"] && !!dataItem["Year"]) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "Employment Type",
        "Employee Category",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["Employment Type"],
        dataItem["Employee Category"],
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
        HumanResourcesActivityConstant.excel_template.sheets.filter(
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
const validateTrainingHoursDuplicateDataSheet = (sheet: TExcelSheet) => {
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
        "Employment Type",
        "Employee Category",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["Employment Type"],
        dataItem["Employee Category"],
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
        HumanResourcesActivityConstant.excel_template.sheets.filter(
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
  THumanResourcesActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  "Employee Diversity": validateEmployeeDiversityDuplicateDataSheet,
  "Employee Turnover": validateEmployeeTurnoverDuplicateDataSheet,
  "Training Hours": validateTrainingHoursDuplicateDataSheet,
};

export const validateduplidateDataByKey = (
  index: number,
  columnName: string,
  columnName1: string,
  Year: string,
  month: string,
  employment_type: string,
  employee_category: string,
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
    let sheetName = sheet.sheetName;

    // Generate a unique key based on the relevant fields (adjust as needed)
    const uniqueKeyindex = `${Year}-${month}-${sanitizeString.v1(employment_type.toString())}-${sanitizeString.v1(employee_category.toString())}`; // Replace 'Column1' and 'Column2' with actual column names
    let uniqueKeyrow = "";

    if (sheetName === "Employee Diversity")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${sanitizeString.v1(item["Employment Type"].toString())}-${sanitizeString.v1(item["Employee Category"].toString())}`;
    else if (sheetName === "Employee Turnover")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${sanitizeString.v1(item["Employment Type"].toString())}-${sanitizeString.v1(item["Employee Category"].toString())}`;
    else if (sheetName === "Training Hours")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${sanitizeString.v1(item["Employment Type"].toString())}-${sanitizeString.v1(item["Employee Category"].toString())}`;

    if (uniqueKeyrow === uniqueKeyindex) {
      // Check for duplicates
      if (seenEntries.has(uniqueKeyrow)) {
        columnObject["Row Number"] = index1;
        columnObject["Error"] = "Duplicate Entry Detected";
        duplicateEntries.push(columnObject);
      } else {
        seenEntries.add(uniqueKeyrow); // Mark the current entry as seen
      }
    }
  });
  length = duplicateEntries.length;
  if (length > 0) {
    if (employment_type !== "") {
      errorEntries.push({
        column: columnName,
        row: index,
        errorMessage:
          "Duplicate Entry Detected: This record already exists. Please enter unique data.",
      });
    }
    if (employee_category !== "") {
      errorEntries.push({
        column: columnName1,
        row: index,
        errorMessage:
          "Duplicate Entry Detected: This record already exists. Please enter unique data.",
      });
    }

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
