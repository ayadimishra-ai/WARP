import { UUID } from "crypto";
import _ from "lodash";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TErrorExcelSheet,
  YearMonthSchema,
  type TExcelSheet,
  type TTemplateErrorData,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  validateColumnNames,
  validateSheetName,
} from "@/modules/ghg/lib/excel/excel.validation";
import {
  GridPowerDetailsConstant,
  TGridPowerSheetColumnNames,
  TGridPowerSheetNames,
} from "@/modules/ghg/shared/constants/activity.constant";
import { months, validateMonthYear } from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } = GridPowerDetailsConstant.excel_template;

// Regex pattern for Distribution Company: letters, spaces, hyphens, ampersand, and dots
// Allowed: A-Z, a-z, space, hyphen (-), ampersand (&), dot (.)
const validDistributionCompanyRegex = /^[a-zA-Z\s&.-]*$/;

// Regex pattern for PPA and REC Company names: letters, spaces, hyphens, ampersand, and dots
// Allowed: A-Z, a-z, space, hyphen (-), ampersand (&), dot (.)
// Does NOT allow numbers
const validPPACompanyNameRegex = /^[a-zA-Z\s&.-]*$/;

// Regex pattern for numeric fields: validates positive numbers with any decimal places
// Decimal place validation (max 4) is handled by .refine() checks below
const validNumericRegex = /^\d+(\.\d+)?$/;

export const gridpowerdetailsschema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Name of Distribution Company": z
        .string()
        .optional()
        .transform((val) => {
          // Convert any input to string and trim
          if (val === null || val === undefined || val === "") return undefined;
          return String(val).trim();
        })
        .refine((val) => !val || validDistributionCompanyRegex.test(val), {
          message:
            "Invalid Entry : Please use only letters, spaces, hyphens (-), ampersands (&), and dots (.).",
        }),
      "Units of Power Consumed - Grid (in Kwh)": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 2 decimal places, max 15 characters
          if (!validNumericRegex.test(strVal)) {
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
          message: "Please enter a valid numeric value for grid power consumed",
        })
        .refine((val) => val === undefined || val >= 0, {
          message: "Value can not be less than 0",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 2)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 4;
          },
          {
            message:
              "Please ensure that values are entered with up to 4 decimal places only",
          }
        ),
      "PPA Company Name - Renewable": z
        .string()
        .optional()
        .transform((val) => {
          // Convert any input to string and trim
          if (val === null || val === undefined || val === "") return undefined;
          return String(val).trim();
        })
        .refine((val) => !val || validPPACompanyNameRegex.test(val), {
          message:
            "Invalid Entry : Please use only letters, spaces, hyphens (-), ampersands (&), and dots (.).",
        }),
      "Units of Renewable power - PPA (in Kwh)": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 2 decimal places
          if (!validNumericRegex.test(strVal)) {
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
          message: "Please enter a valid numeric value for renewable PPA power",
        })
        .refine((val) => val === undefined || val >= 0, {
          message: "Please enter a valid numeric value for renewable PPA power",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 2)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 4;
          },
          {
            message:
              "Please ensure that values are entered with up to 4 decimal places only",
          }
        ),
      "PPA Company Name - Non Renewable": z
        .string()
        .optional()
        .transform((val) => {
          // Convert any input to string and trim
          if (val === null || val === undefined || val === "") return undefined;
          return String(val).trim();
        })
        .refine((val) => !val || validPPACompanyNameRegex.test(val), {
          message:
            "Invalid Entry : Please use only letters, spaces, hyphens (-), ampersands (&), and dots (.).",
        }),
      "Units of Non Renewable power - PPA (in Kwh)": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 2 decimal places
          if (!validNumericRegex.test(strVal)) {
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
            "Please enter a valid numeric value for non-renewable PPA power",
        })
        .refine((val) => val === undefined || val >= 0, {
          message: "Value can not be less than 0",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 2)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 4;
          },
          {
            message:
              "Please ensure that values are entered with up to 4 decimal places only",
          }
        ),
      "REC Company": z
        .string()
        .optional()
        .transform((val) => {
          // Convert any input to string and trim
          if (val === null || val === undefined || val === "") return undefined;
          return String(val).trim();
        })
        .refine((val) => !val || validPPACompanyNameRegex.test(val), {
          message:
            "Invalid Entry : Please use only letters, spaces, hyphens (-), ampersands (&), and dots (.).",
        }),
      "Units of power purchased - REC (in Kwh)": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          // Validate format: positive number with up to 2 decimal places
          if (!validNumericRegex.test(strVal)) {
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
          message: "Please enter a valid numeric value for REC power purchased",
        })
        .refine((val) => val === undefined || val >= 0, {
          message: "Please enter a valid numeric value for REC power purchased",
        })
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            // Check decimal places (up to 2)
            const decimalPlaces = (val.toString().split(".")[1] || "").length;
            return decimalPlaces <= 4;
          },
          {
            message:
              "Please ensure that values are entered with up to 4 decimal places only",
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
    )
    .superRefine((obj, ctx) => {
      // Check for negative values in numeric fields
      const numericFields = [
        "Units of Power Consumed - Grid (in Kwh)",
        "Units of Renewable power - PPA (in Kwh)",
        "Units of Non Renewable power - PPA (in Kwh)",
        "Units of power purchased - REC (in Kwh)",
      ];

      for (const field of numericFields) {
        const value = obj[field as keyof typeof obj];
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          Number(value) < 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: "No negative values allowed",
          });
        }
      }

      // Conditional validation: Company name required if units > 0
      const renewableUnits = obj["Units of Renewable power - PPA (in Kwh)"];
      const renewableCompany = (obj["PPA Company Name - Renewable"] || "")
        .toString()
        .trim();
      if (renewableUnits && Number(renewableUnits) > 0 && !renewableCompany) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["PPA Company Name - Renewable"],
          message:
            "PPA Renewable company name is required when renewable power units are entered",
        });
      }

      // Reverse conditional validation: Units required if company name is provided
      if (
        renewableCompany &&
        (renewableUnits === undefined || renewableUnits === null)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["Units of Renewable power - PPA (in Kwh)"],
          message: "Please enter a valid numeric value for renewable PPA power",
        });
      }

      // Character limit validation for company names
      const nonRenewableUnits =
        obj["Units of Non Renewable power - PPA (in Kwh)"];
      const nonRenewableCompany = (
        obj["PPA Company Name - Non Renewable"] || ""
      )
        .toString()
        .trim();
      if (
        nonRenewableUnits &&
        Number(nonRenewableUnits) > 0 &&
        !nonRenewableCompany
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["PPA Company Name - Non Renewable"],
          message:
            "PPA Non-Renewable company name is required when non-renewable power units are entered",
        });
      }

      // Reverse conditional validation: Units required if non-renewable company name is provided
      if (
        nonRenewableCompany &&
        (nonRenewableUnits === undefined || nonRenewableUnits === null)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["Units of Non Renewable power - PPA (in Kwh)"],
          message:
            "Please enter a valid numeric value for non-renewable PPA power",
        });
      }

      const recUnits = obj["Units of power purchased - REC (in Kwh)"];
      const recCompany = (obj["REC Company"] || "").toString().trim();
      if (recUnits && Number(recUnits) > 0 && !recCompany) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["REC Company"],
          message:
            "REC company name is required when REC power units are entered",
        });
      }

      // Reverse conditional validation: Units required if REC company name is provided
      if (recCompany && (recUnits === undefined || recUnits === null)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["Units of power purchased - REC (in Kwh)"],
          message: "Please enter a valid numeric value for REC power purchased",
        });
      } // Character limit validation - max 100 characters for company names
      const companyNameFields = [
        { key: "Name of Distribution Company", max: 100 },
        { key: "PPA Company Name - Renewable", max: 100 },
        { key: "PPA Company Name - Non Renewable", max: 100 },
        { key: "REC Company", max: 100 },
      ];

      for (const field of companyNameFields) {
        const value = (obj[field.key as keyof typeof obj] || "")
          .toString()
          .trim();
        if (value && value.length > field.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field.key],
            message: `Maximum ${field.max} characters allowed`,
          });
        }
      }

      // Validation: At least one power source must have a value
      const gridConsumption = obj["Units of Power Consumed - Grid (in Kwh)"];
      const renewablePPA = obj["Units of Renewable power - PPA (in Kwh)"];
      const nonRenewablePPA =
        obj["Units of Non Renewable power - PPA (in Kwh)"];
      const recPower = obj["Units of power purchased - REC (in Kwh)"];

      const hasGridConsumption =
        gridConsumption !== undefined && gridConsumption !== null;
      const hasRenewablePPA =
        renewablePPA !== undefined && renewablePPA !== null;
      const hasNonRenewablePPA =
        nonRenewablePPA !== undefined && nonRenewablePPA !== null;
      const hasRECPower = recPower !== undefined && recPower !== null;

      if (
        !hasGridConsumption &&
        !hasRenewablePPA &&
        !hasNonRenewablePPA &&
        !hasRECPower
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["Units of Power Consumed - Grid (in Kwh)"],
          message:
            "At least one power source must have a value (Grid consumption, PPA Renewable, PPA Non-Renewable, or REC)",
        });
      }
    });
  // .refine(
  //   (obj) => {
  //     const totalConsumed =
  //       obj["Units of Power Consumed - Grid (in Kwh)"] || 0;

  //     const ppa = obj["Units of Renewable power - PPA (in Kwh)"] || 0;
  //     const nonRenewablePPA =
  //       obj["Units of Non Renewable power - PPA (in Kwh)"] || 0;
  //     const rec = obj["Units of power purchased - REC (in Kwh)"] || 0;
  //     const sum = ppa + nonRenewablePPA + rec;
  //     // return totalConsumed > 0 && totalConsumed >= sum;
  //     return totalConsumed >= 0;
  //   },
  //   {
  //     message:
  //       "Sum of 'Units of Renewable power - PPA (in Kwh)', 'Units of Non Renewable power - PPA (in Kwh)' and 'Units of power purchased - REC (in Kwh)' can't be more than 'Units of Power Consumed - Grid (in Kwh)",
  //     path: ["Units of Power Consumed - Grid (in Kwh)"],
  //   }
  // );
  //validation removed due to ai changes
};
//#region Template Validation
export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
  const sheets = GridPowerDetailsConstant.excel_template.sheets;
  let errorMessageData: TTemplateErrorData[] = [];
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
            }
          }
        });
      } else {
        errorMessageData.push({
          sheet: "Grid Power",
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
//#endregion

//#region Zod Validation
const validategridpowerdetailsSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = gridpowerdetailsschema(
      baseMonth,
      baseYear
    ).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      GridPowerDetailsConstant.excel_template.sheets
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
  TGridPowerSheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Grid Power Details": validategridpowerdetailsSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: string
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TGridPowerSheetNames]: Record<TGridPowerSheetColumnNames, any>[];
  } = { "Grid Power Details": [] };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TGridPowerSheetNames;
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

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  userSession: TUserSession,
  org_address_id: UUID,
  isFromForm: boolean = false,
  isEdit: boolean = false
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];

  // Create dynamic template sheets - add location column for manual forms
  let dynamicTemplateSheets = JSON.parse(JSON.stringify(templateSheets)); // Deep clone
  if (isFromForm) {
    // Add location column to template for manual form error processing
    dynamicTemplateSheets[0].columns.push({
      name: "location",
      code: "location",
    });
  }
  const zodErrorEnteries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    userSession.organizationId
  );
  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  //if zod fails this validation will not be called
  if (
    zodErrorEnteries[0].data.length === 0 &&
    userSession.isAiEnabled === "true" &&
    !isEdit
  ) {
    const ExistingEntries: TExcelSheet[] = await handleCheckaidata(
      excelData,
      userSession,
      org_address_id,
      GridPowerDetailsConstant.parent_code,
      isFromForm
    );
    allError = combineAllErrorSheets(ExistingEntries, allError);
  }
  // Validate for duplicate entries (works for both Excel bulk upload and form)
  // This validation runs only if Zod validation passes
  if (zodErrorEnteries[0].data.length === 0) {
    const duplicateEntries: TExcelSheet[] = await validateDataForDuplicates(
      excelData,
      userSession,
      org_address_id,
      isFromForm
    );
    allError = combineAllErrorSheets(duplicateEntries, allError);
  }
  //if zod fails this validation will not be called
  finalError = combineAllTypeErrorInRow(allError, dynamicTemplateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};

const handleCheckaidata = async (
  excelData: TExcelSheet[],
  userSession: TUserSession,
  org_address_id: UUID,
  activitycode: string,
  isFromForm: boolean
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TGridPowerSheetNames]: Record<TGridPowerSheetColumnNames, any>[];
  } = { "Grid Power Details": [] };
  const sdk = await getGraphQlServerSDK();
  const taskRequestActvityTaskRequestData =
    (await getTaskRequestActvityTaskRequestId(
      org_address_id,
      excelData,
      activitycode,
      userSession,
      "GHGEnergyConsumption_GridPower"
    )) as TActivityTaskRequestMasterData[];
  if (
    !!taskRequestActvityTaskRequestData &&
    taskRequestActvityTaskRequestData.length > 0
  ) {
    const taskRequestIds = taskRequestActvityTaskRequestData.map(
      (item) => item.taskRequestId
    );

    const powerConsumptionData: any = await sdk.getPowerConsumptionData({
      task_request_id: taskRequestIds,
    });
    if (powerConsumptionData.GHGEnergyConsumption_GridPower.length > 0) {
      let gridpower_data = powerConsumptionData.GHGEnergyConsumption_GridPower;
      //get power consumption data from task request id on data
      //check power consumption data insertion manual/ai
      let ai_inserted_grid_data = gridpower_data;

      excelData.forEach((sheet) => {
        const sheetName = sheet.sheetName.trim() as TGridPowerSheetNames;
        failedEntries[sheetName] = validateexistingdataSheetMethods[sheetName](
          sheet,
          taskRequestActvityTaskRequestData,
          ai_inserted_grid_data,
          isFromForm
        );
        excelSheetData.push({
          sheetName: sheetName,
          data: failedEntries[sheetName],
        });
      });
    }
  }

  return excelSheetData;
};
const validateGridAiDataSheet = (
  sheet: TExcelSheet,
  TaskRequestData: TActivityTaskRequestMasterData[],
  ai_inserted_grid_data: [],
  isFromForm: boolean
) => {
  //validateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach(async (dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    // Validation of Columns value from Master Data
    // For manual form entries, check for AI data existence regardless of whether power consumed is 0 or not
    if (
      !!dataItem["Month"] &&
      !!dataItem["Year"] &&
      (!!dataItem["Units of Power Consumed - Grid (in Kwh)"] || isFromForm)
    ) {
      let ActivityTaskData = TaskRequestData.filter(
        (item: Record<string, any>) =>
          sanitizeString.v1(item.month) ==
            sanitizeString.v1(dataItem["Month"]) &&
          item.year == dataItem["Year"]
      );
      let metadata: Record<string, any> = ai_inserted_grid_data.filter(
        (itemrow: Record<string, any>) =>
          sanitizeString.v1(itemrow.task_request_id) ==
          sanitizeString.v1(ActivityTaskData[0].taskRequestId)
      );

      if (metadata.length > 0) {
        metadata.forEach((item: any) => {
          if (!!item.metadata) {
            errorEntries.push({
              column: "Month",
              row: index,
              errorMessage:
                "Existing Entry Detected: Data is already available for this particular period, captured using AI",
            });
          }
        });
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        GridPowerDetailsConstant.excel_template.sheets.filter(
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

const validateexistingdataSheetMethods: Record<
  TGridPowerSheetNames,
  (
    sheet: TExcelSheet,
    TaskRequestData: TActivityTaskRequestMasterData[],
    ai_inserted_grid_data: [],
    isFromForm: boolean
  ) => Record<string, any>[]
> = {
  "Grid Power Details": validateGridAiDataSheet,
};

// Duplicate Row Validation
const validateDataForDuplicates = async (
  excelData: TExcelSheet[],
  userSession: TUserSession,
  org_address_id: UUID,
  isFromForm: boolean = false
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();

  // For Excel uploads: Only check for duplicates within the Excel file itself (not against DB)
  // Because Excel upload will override/upsert existing data in DB
  // For Form submissions: Check against both within-data and existing DB records
  let allExistingGridPowerRecords: any[] = [];

  if (isFromForm) {
    // Collect all unique month/year combinations from the excel data
    const monthYearSet: any[] = [];
    excelData.forEach((sheet) => {
      const sheetName = sheet.sheetName.trim() as TGridPowerSheetNames;
      sheet.data.forEach((dataItem: Record<string, string>) => {
        if (sheetName === "Grid Power Details") {
          const month = dataItem["Month"];
          const year = dataItem["Year"];
          monthYearSet.push({ month, year });
        }
      });
    });

    // Get unique combinations
    const uniqueMonthYearSet = _.uniqWith(monthYearSet, _.isEqual);

    // Fetch existing grid power data for all month/year combinations
    const existingDataPromises = uniqueMonthYearSet.map(({ month, year }) =>
      sdk.getGridPowerDetailsByYearMonthOrgAddressId({
        orgAddressId: org_address_id,
        month: month,
        year: Number(year),
      })
    );

    const existingDataResults = await Promise.all(existingDataPromises);

    // Flatten all existing grid power records
    allExistingGridPowerRecords = existingDataResults.flatMap(
      (result) => result.GHGEnergyConsumption_GridPower || []
    );
  }

  const failedEntries: {
    [key in TGridPowerSheetNames]: Record<TGridPowerSheetColumnNames, any>[];
  } = { "Grid Power Details": [] };

  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TGridPowerSheetNames;
    failedEntries[sheetName] = validateDuplicateGridPowerSheet(
      sheet,
      allExistingGridPowerRecords,
      isFromForm
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

const validateDuplicateGridPowerSheet = (
  sheet: TExcelSheet,
  existingGridPowerRecords: any[],
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

  // Helper function to check if two data items match
  const checkIfRecordsMatch = (
    item1: Record<string, any>,
    item2: Record<string, any>
  ): boolean => {
    return (
      valuesMatch(
        item1["Name of Distribution Company"],
        item2["Name of Distribution Company"]
      ) &&
      valuesMatch(
        item1["Units of Power Consumed - Grid (in Kwh)"],
        item2["Units of Power Consumed - Grid (in Kwh)"]
      ) &&
      valuesMatch(
        item1["PPA Company Name - Renewable"],
        item2["PPA Company Name - Renewable"]
      ) &&
      valuesMatch(
        item1["Units of Renewable power - PPA (in Kwh)"],
        item2["Units of Renewable power - PPA (in Kwh)"]
      ) &&
      valuesMatch(
        item1["PPA Company Name - Non Renewable"],
        item2["PPA Company Name - Non Renewable"]
      ) &&
      valuesMatch(
        item1["Units of Non Renewable power - PPA (in Kwh)"],
        item2["Units of Non Renewable power - PPA (in Kwh)"]
      ) &&
      valuesMatch(item1["REC Company"], item2["REC Company"]) &&
      valuesMatch(
        item1["Units of power purchased - REC (in Kwh)"],
        item2["Units of power purchased - REC (in Kwh)"]
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
      if (!duplicateInSheet) {
        // NOTE: All existingGridPowerRecords are already filtered by month/year/orgAddress
        // in the GraphQL query, so we don't need to filter again by month/year.
        // We just need to exclude the current record being edited and compare field values.

        const recordsToCheck = existingGridPowerRecords.filter((record) => {
          // Exclude the current record being edited
          if (currentRecordId && record.id === currentRecordId) {
            return false;
          }
          return true;
        });

        // Check if any existing record matches all field values
        const isDuplicateInDB = recordsToCheck.some((existingRecord) => {
          // Compare all data fields using the valuesMatch helper
          const distCoMatch = valuesMatch(
            existingRecord.Name_of_Distribution_Company,
            dataItem["Name of Distribution Company"]
          );
          const gridPowerMatch = valuesMatch(
            existingRecord.PowerConsumed_through_Grid_Kwh,
            dataItem["Units of Power Consumed - Grid (in Kwh)"]
          );
          const ppaRenewableMatch = valuesMatch(
            existingRecord.NameOfCompany_PPA_Renewable,
            dataItem["PPA Company Name - Renewable"]
          );
          const ppaRenewableKwhMatch = valuesMatch(
            existingRecord.PowerPurchased_through_PPA_Kwh_Renewable,
            dataItem["Units of Renewable power - PPA (in Kwh)"]
          );
          const ppaNonRenewableMatch = valuesMatch(
            existingRecord.NameOfCompany_PPA_NonRenewable,
            dataItem["PPA Company Name - Non Renewable"]
          );
          const ppaNonRenewableKwhMatch = valuesMatch(
            existingRecord.PowerPurchased_through_PPA_Kwh_NonRenewable,
            dataItem["Units of Non Renewable power - PPA (in Kwh)"]
          );
          const recCompanyMatch = valuesMatch(
            existingRecord.Name_of_company_for_REC,
            dataItem["REC Company"]
          );
          const recKwhMatch = valuesMatch(
            existingRecord.PowerPurchased_through_REC_Kwh,
            dataItem["Units of power purchased - REC (in Kwh)"]
          );

          const fieldsMatch =
            distCoMatch &&
            gridPowerMatch &&
            ppaRenewableMatch &&
            ppaRenewableKwhMatch &&
            ppaNonRenewableMatch &&
            ppaNonRenewableKwhMatch &&
            recCompanyMatch &&
            recKwhMatch;

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
          if (isFromForm) {
            errorEntries.push({
              column: "location",
              row: index,
              errorMessage:
                "Duplicate Entry, Multiple identical records found in the uploaded data for the same period.",
            });
          }
        }
      }

      if (errorEntries.length > 0) {
        const allColumns = GridPowerDetailsConstant.excel_template.sheets
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
