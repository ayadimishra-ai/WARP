import _ from "lodash";
import {
  ApiHitType,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  getDefaultData,
  TTemplateErrorData,
  validateActivityMasterDataByKey,
  validateActivityMasterDataGroupByKey,
  YearMonthSchema,
  type TActivityMasterData,
  type TErrorExcelSheet,
  type TExcelSheet,
} from "@/modules/ghg/lib/excel/excel.service";

import {
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "@/modules/ghg/lib/excel/excel.validation";

import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { OPSOrgRole } from "@/modules/ghg/lib/op-database/types";
import {
  FuelPurchasedActivityConstant,
  TFuelPurchasedActivitySheetColumnNames,
  TFuelPurchasedActivitySheetNames,
} from "@/modules/ghg/shared/constants/activity.constant";
import {
  ActivityMasterKey,
  TransportModes,
} from "@/modules/ghg/shared/constants/input.constant";
import { sanitize_compare_str_v1 } from "@/modules/ghg/utils/comapre.util";
import { toNumber } from "@/modules/ghg/utils/data-transformer.util";
import { months, validateMonthYear } from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
let yearMonthError: TErrorExcelSheet[] = [];

const validNumericRegex = /^\d+(\.\d+)?$/;
const MAX_NUMERIC_DIGITS = 15;
const MAX_DECIMAL_PLACES = 4;

const generalPurpose = (
  baseMonth: string,
  baseYear: number,
  isFromForm: boolean = false
) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Type of Fuel Consumption": z
        .string()
        .min(1, { message: "Type of Fuel Consumption is required" })
        .refine(
          (val) => isNaN(Number(val.trim())) || val.trim() === "",
          { message: "Invalid Entry : Numeric values are not allowed." }
        ),
      "Quantity of Fuel Consumption": z
        .union([z.string(), z.number()])
        .transform((val) => {
          if (val === "" || val === undefined || val === null)
            return "EMPTY";
          const strVal = String(val).trim();
          if (strVal === "") return "EMPTY";
          if (!validNumericRegex.test(strVal)) return "INVALID_FORMAT";
          const digitCount = strVal.replace(/\D/g, "").length;
          if (digitCount > MAX_NUMERIC_DIGITS) return "INVALID_FORMAT";
          const num = Number(strVal);
          return isNaN(num) ? "INVALID_FORMAT" : num;
        })
        .refine((val) => val !== "EMPTY", {
          message: "Quantity of Fuel Consumption is required",
        })
        .refine((val) => val !== "INVALID_FORMAT", {
          message:
            "Please enter a valid numeric value for Quantity of Fuel Consumption",
        })
        .refine(
          (val) => {
            if (typeof val !== "number") return true;
            return (
              (val.toString().split(".")[1] || "").length <= MAX_DECIMAL_PLACES
            );
          },
          {
            message:
              "Please enter a valid numeric value for Quantity of Fuel Consumption",
          }
        ),
      "UoM for Fuel Consumption": z
        .string()
        .min(1, { message: "UoM for Fuel Consumption is required" })
        .refine(
          (val) => isNaN(Number(val.trim())) || val.trim() === "",
          { message: "Invalid Entry : Numeric values are not allowed." }
        ),
      "Quality of Fuel": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => {
          if (val === "" || val === undefined || val === null) return undefined;
          const strVal = String(val).trim();
          if (strVal === "") return undefined;
          if (!validNumericRegex.test(strVal)) return "INVALID_FORMAT";
          const digitCount = strVal.replace(/\D/g, "").length;
          if (digitCount > MAX_NUMERIC_DIGITS) return "INVALID_FORMAT";
          const num = Number(strVal);
          return isNaN(num) ? "INVALID_FORMAT" : num;
        })
        .refine((val) => val !== "INVALID_FORMAT", {
          message: "Please enter a valid numeric value for Quality of Fuel",
        })
        .refine(
          (val) => {
            if (val === undefined) return true;
            if (typeof val === "number") return val > 0;
            return true;
          },
          {
            message: "Quality of Fuel must be greater than 0",
          }
        )
        .refine(
          (val) => {
            if (val === undefined || typeof val !== "number") return true;
            return (
              (val.toString().split(".")[1] || "").length <= MAX_DECIMAL_PLACES
            );
          },
          {
            message: "Please enter a valid numeric value for Quality of Fuel",
          }
        ),
      "Point of Consumption": z
        .union([z.string(), z.number()])
        .optional()
        .refine(
          (val) => {
            if (val === undefined || val === null || val === "") return true;
            if (typeof val === "number") return false;
            return isNaN(Number(val.trim())) || val.trim() === "";
          },
          { message: "Invalid Entry : Numeric values are not allowed." }
        ),
    })
    .refine(
      (item) => {
        if (sanitizeString.v1(item["Type of Fuel Consumption"]) == "diesel") {
          if (
            item["Point of Consumption"] === "" ||
            item["Point of Consumption"] === null
          ) {
            return false;
          }
        }
        return true;
      },
      {
        message: "Point of Consumption is required",
        path: ["Point of Consumption"],
      }
    )
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
const heatingWater = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Type of Fuel Consumption": z
        .string()
        .min(1, { message: "Type of Fuel Consumption is required" }),
      "Quality of Fuel Consumption": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Value is invalid")
        .transform(toNumber)
        .optional()
        .or(z.literal("")),
      "SKUs applicable": z
        .unknown()
        .refine((q) => !!String(q) || String(q), "SKU is required")
        .transform(String),
      "Quantity of Fuel Consumed": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Value is invalid")
        .transform(toNumber),
      "UoM_Heating fuel": z
        .string()
        .min(1, { message: "UoM_Heating fuel is required" }),
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
const heatingWaterSupplier = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Type of Fuel Purchased": z
        .string()
        .min(1, { message: "Type of Fuel Purchased is required" }),
      "Quality of Fuel Purchased": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Value is invalid")
        .transform(toNumber)
        .optional()
        .or(z.literal("")),
      "SKUs applicable": z
        .union([z.string(), z.number()])
        .refine(
          (value) => typeof value === "string" || typeof value === "number",
          {
            message: "Invalid SKUs",
          }
        ),
      "Quantity of Fuel Consumed": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Value is invalid")
        .transform(toNumber),
      "UoM_Heating fuel": z
        .string()
        .min(1, { message: "UoM_Heating fuel is required" }),
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

const auxFuel = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "AUX Fuel Types Consumption": z
        .string()
        .min(1, { message: "AUX Fuel Types Consumption is required" }),
      "SKUs applicable": z
        .unknown()
        .refine((q) => !!String(q) || String(q), "SKU is required")
        .transform(String),
      "Quantity of fuel Consumed": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Value is invalid")
        .transform(toNumber),
      UoM_AuxFuel: z.string().min(1, { message: "UoM_AuxFuel is required" }),
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
const auxFuelSupplier = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Type of Fuel Purchased": z
        .string()
        .min(1, { message: "Type of Fuel Purchased is required" }),
      "Quality of Fuel Purchased": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Value is invalid")
        .transform(toNumber)
        .optional()
        .or(z.literal("")),
      "SKUs applicable": z
        .union([z.string(), z.number()])
        .refine(
          (value) => typeof value === "string" || typeof value === "number",
          {
            message: "Invalid SKUs",
          }
        ),
      "Quantity of Fuel Consumed": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Value is invalid")
        .transform(toNumber),
      "UoM_Heating fuel": z
        .string()
        .min(1, { message: "UoM_Heating fuel is required" }),
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

const Transportation = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Vehicle Type Used for Road Transport": z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),
      "Type of Fuel Consumption": z.string().optional(),
      "Quantity of fuel Consumption": z
        .unknown()
        .refine(
          (q) => q !== undefined && q !== null && q !== "",
          "Quantity of Fuel Consumption is required"
        )
        .transform(toNumber)
        .refine(
          (q) => typeof q === "number" && !isNaN(q),
          "Quantity of Fuel Consumption must be a number"
        )
        .refine(
          (q) => toNumber(q) >= 0,
          "Quantity of Fuel Consumption must be 0 or greater"
        ),
      "UoM for fuel Consumption": z
        .unknown()
        .refine(
          (value) => value !== undefined && value !== null && value !== "",
          {
            message: "UoM for Fuel Consumption is required.",
          }
        ),
      "Distance travelled": z
        .unknown()
        .refine(
          (d) => toNumber(d) >= 0,
          "Distance Travelled must be greater than 0"
        )
        .transform(toNumber)
        .optional(),
      "Transportation Type": z
        .unknown()
        .refine((value) => typeof value === "string", {
          message:
            "Invalid value: Data should be Upstream, Downstream, Internal",
        })
        .refine((value) => typeof value === "string" && value.length > 0, {
          message: "Transportation Type is required",
        })
        .refine(
          (value) => {
            const validTypes = ["upstream", "downstream", "internal"];
            return (
              typeof value === "string" &&
              value.length > 0 &&
              validTypes.includes(value.toLowerCase())
            );
          },
          {
            message:
              "Invalid value: Data should be Upstream, Downstream, Internal",
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

const { sheets: templateSheets } = FuelPurchasedActivityConstant.excel_template;

//#region  Template Validation
export const validateExcelTemplate = (
  excelData: TExcelSheet[],
  ownership_type: string,
  addressType: string
) => {
  let errorMessageData: TTemplateErrorData[] = [];
  // validate sheets and column names
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
      templateSheets.forEach((templateSheet) => {
        const validSheet = templateSheet.address_permissions.filter(
          (item) =>
            sanitizeString.v1(item.address_owership_type) ==
              sanitizeString.v1(ownership_type) &&
            sanitizeString.v1(item.address_type) ==
              sanitizeString.v1(addressType)
        ).length;
        if (validSheet > 0) {
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
//#endregion

//#region Zod Validation Starts
const validateGeneralPurposeSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number,
  activityMasterData: TActivityMasterData[],
  isFromForm: boolean = false
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = generalPurpose(
      baseMonth,
      baseYear,
      isFromForm
    ).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      FuelPurchasedActivityConstant.excel_template.sheets
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

const validateHeatingWaterSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number,
  activityMasterData: TActivityMasterData[],
  isFromForm: boolean = false
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = heatingWater(baseMonth, baseYear).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      FuelPurchasedActivityConstant.excel_template.sheets
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

const validateAuxFuelSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number,
  activityMasterData: TActivityMasterData[],
  isFromForm: boolean = false
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = auxFuel(baseMonth, baseYear).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      FuelPurchasedActivityConstant.excel_template.sheets
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

const validateTransportationSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number,
  activityMasterData: TActivityMasterData[],
  isFromForm: boolean = false
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = Transportation(baseMonth, baseYear).safeParse(
      item
    );
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      FuelPurchasedActivityConstant.excel_template.sheets
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
  TFuelPurchasedActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number,
    activityMasterData: TActivityMasterData[],
    isFromForm?: boolean
  ) => Record<string, any>[]
> = {
  "General Purpose": validateGeneralPurposeSheet,
  "Heating Water": validateHeatingWaterSheet,
  "AUX Fuel": validateAuxFuelSheet,
  Transportation: validateTransportationSheet,
};
const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID,
  org_role: keyof typeof OPSOrgRole,
  isFromForm: boolean = false
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TFuelPurchasedActivitySheetNames]: Record<
      TFuelPurchasedActivitySheetColumnNames,
      any
    >[];
  } = {
    "Heating Water": [],
    "General Purpose": [],
    "AUX Fuel": [],
    Transportation: [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: [
      "Energy_FuelPurchased_General_FuelType",
      "Energy_FuelPurchased_Auxiliary_FuelType",
      "Energy_FuelPurchased_HeatingWater_FuelType",
      "energy_fuelpurchased_transportation_type_of_fuel",
    ],
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TFuelPurchasedActivitySheetNames;
    failedEntries[sheetName] = validateSheetMethods[sheetName](
      sheet,
      orgData.Organization[0].FinancialYearMonth,
      orgData.Organization[0].Baselineyear,
      activityMasterData?.ActivityMaster || [],
      isFromForm
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });
  return excelSheetData;
};

//#endregion

//#region Master Data Vlidation Starts

const validateGeneralPurposeMasterDataSheet = (
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
      dataItem["Type of Fuel Consumption"],
      index,
      "Energy_FuelPurchased_General_FuelType",
      "Type of Fuel Consumption",
      ApiHitType.Excel
    );
    if (errorEntriesColumn1Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn1Data[0] });
    } else {
      const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
        ActivityMasterData,
        dataItem["Type of Fuel Consumption"],
        dataItem["UoM for Fuel Consumption"],
        index,
        "Energy_FuelPurchased_General_FuelType_UOM",
        "UoM for Fuel Consumption",
        ApiHitType.Excel,
        "Energy_FuelPurchased_General_FuelType"
      );
      if (errorEntriesColumn2Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn2Data[0] });
      }
    }
    if (!!String(dataItem["Point of Consumption"] ?? "").trim()) {
      const errorEntriesColumn3Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Point of Consumption"],
        index,
        "Energy_FuelPurchased_General_PointOfConsumption",
        "Point of Consumption",
        ApiHitType.Excel
      );
      if (errorEntriesColumn3Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn3Data[0] });
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        FuelPurchasedActivityConstant.excel_template.sheets.filter(
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

const validateHeatingWaterMasterDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((dataItem: Record<string, string>) => {
    const errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    const errorEntriesColumn1Data = validateActivityMasterDataByKey(
      ActivityMasterData,
      dataItem["Type of Fuel Consumption"],
      index,
      "Energy_FuelPurchased_HeatingWater_FuelType",
      "Type of Fuel Consumption",
      ApiHitType.Excel
    );
    if (errorEntriesColumn1Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn1Data[0] });
    } else {
      const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
        ActivityMasterData,
        dataItem["Type of Fuel Consumption"],
        dataItem["UoM_Heating fuel"],
        index,
        "Energy_FuelPurchased_HeatingWater_FuelType_UOM",
        "UoM_Heating fuel",
        ApiHitType.Excel,
        "Energy_FuelPurchased_HeatingWater_FuelType"
      );
      if (errorEntriesColumn2Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn2Data[0] });
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        FuelPurchasedActivityConstant.excel_template.sheets.filter(
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

const validateAuxFuelMasterDataSheet = (
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
      dataItem["AUX Fuel Types Consumption"],
      index,
      "Energy_FuelPurchased_Auxiliary_FuelType",
      "AUX Fuel Types Consumption",
      ApiHitType.Excel
    );
    if (errorEntriesColumn1Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn1Data[0] });
    } else {
      const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
        ActivityMasterData,
        dataItem["AUX Fuel Types Consumption"],
        dataItem["UoM_AuxFuel"],
        index,
        "Energy_FuelPurchased_Auxiliary_FuelType_UOM",
        "UoM_AuxFuel",
        ApiHitType.Excel,
        "Energy_FuelPurchased_Auxiliary_FuelType"
      );
      if (errorEntriesColumn2Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn2Data[0] });
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        FuelPurchasedActivityConstant.excel_template.sheets.filter(
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

const validateTransportationMasterDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  8;
  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Type of Fuel Consumption"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Type of Fuel Consumption"],
        index,
        "energy_fuelpurchased_transportation_type_of_fuel",
        "Type of Fuel Consumption",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      } else {
        const defaultFuel = !!dataItem["Type of Fuel Consumption"]
          ? dataItem["Type of Fuel Consumption"]
          : getDefaultData({
              masterKey: "energy_fuelpurchased_transportation_type_of_fuel",
              activityMasterData: ActivityMasterData,
              valueForDefaultValue: TransportModes.Road,
            });
        if (!!dataItem["UoM for fuel Consumption"]) {
          const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
            ActivityMasterData,
            defaultFuel,
            String(dataItem["UoM for fuel Consumption"]),
            index,
            "energy_fuelpurchased_transportation_type_of_fuel_uom",
            "UoM for fuel Consumption",
            ApiHitType.Excel,
            "energy_fuelpurchased_transportation_type_of_fuel"
          );
          if (errorEntriesColumn2Data.length > 0) {
            errorEntries.push({ ...errorEntriesColumn2Data[0] });
          }
        }
      }
    }
    if (!!dataItem["Vehicle Type Used for Road Transport"]) {
      const errorEntriesColumn3Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Vehicle Type Used for Road Transport"] || "MDV",
        index,
        "transport_upstream_road_vehicle_type",
        "Vehicle Type Used for Road Transport",
        ApiHitType.Excel
      );
      if (errorEntriesColumn3Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn3Data[0] });
      }
    }
    if (!!dataItem["Transportation Type"]) {
      const errorEntriesColumn3Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Transportation Type"],
        index,
        "Energy_FuelPurchased_Transportation_Type",
        "Transportation Type",
        ApiHitType.Excel
      );
      if (errorEntriesColumn3Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn3Data[0] });
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        FuelPurchasedActivityConstant.excel_template.sheets.filter(
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
  TFuelPurchasedActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "General Purpose": validateGeneralPurposeMasterDataSheet,
  "Heating Water": validateHeatingWaterMasterDataSheet,
  "AUX Fuel": validateAuxFuelMasterDataSheet,
  Transportation: validateTransportationMasterDataSheet,
};

const validateDatabyDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.energy_fuel_purchased,
  });
  const failedEntries: {
    [key in TFuelPurchasedActivitySheetNames]: Record<
      TFuelPurchasedActivitySheetColumnNames,
      any
    >[];
  } = {
    "Heating Water": [],
    "General Purpose": [],
    "AUX Fuel": [],
    Transportation: [],
  };
  excelData.forEach(async (sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TFuelPurchasedActivitySheetNames;
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

//#region  Specification Validation Starts

const ValidateSkudetails = async (
  skusArray: Record<string, any>[],
  excelData: TExcelSheet,
  organisationAddressId: UUID,
  organizationId: UUID
) => {
  const validations: TErrorExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const skuWhereCondition = skusArray.flatMap((item) => {
    return [
      { client_master_id: { _ilike: String(item.sku).trim() } },
      { code: { _ilike: String(item.sku).trim() } },
    ];
  });
  const skuReturnData = await sdk.getSkuDetailsFromBySkucodeOrClientMasterId({
    where: { _or: skuWhereCondition, organization_id: { _eq: organizationId } },
  });
  if (!!skuReturnData) {
    const invalidSkus: Record<string, any>[] = skusArray?.filter(
      (obj1: Record<string, any>) =>
        !skuReturnData?.OrgSKUMaster.some(
          (obj2: any) =>
            sanitize_compare_str_v1(obj1.sku, obj2.client_master_id) ||
            sanitize_compare_str_v1(obj1.sku, obj2.code)
        )
    );
    const validSkus: Record<string, any>[] = skusArray?.filter(
      (obj1: Record<string, any>) =>
        skuReturnData?.OrgSKUMaster.some(
          (obj2: any) =>
            sanitize_compare_str_v1(obj1.sku, obj2.client_master_id) ||
            sanitize_compare_str_v1(obj1.sku, obj2.code)
        )
    );
    if (!!invalidSkus.length) {
      invalidSkus.forEach((item) => {
        validations.push({
          column: "SKUs applicable",
          row: parseInt(item.index) + 1,
          errorMessage: "No production details found for this sku",
        });
      });
    }
    if (!!validSkus.length) {
      const whereCondition: Record<string, any>[] = [];
      const skuIndexDetail: Record<string, any>[] = [];
      const taskreqData = validSkus.map(async (item) => {
        whereCondition.push({
          _and: {
            month: { _eq: excelData.data[item.index]["Month"] },
            year: { _eq: excelData.data[item.index]["Year"] },
            organization_address_id: { _eq: organisationAddressId },
          },
        });
        skuIndexDetail.push({
          month: excelData.data[item.index]["Month"],
          year: excelData.data[item.index]["Year"],
          index: item.index,
          sku: item.sku,
        });
      });

      const batchSize = 1000; // Define your batch size
      const allWhere = whereCondition;

      const processBatch = async (whereBatch: any[]): Promise<any> => {
        return await sdk.getSkuDetailsByProductionMonthAndYear({
          where: { _or: whereBatch },
        });
      };
      const taskreqProductionData: any = {
        TaskRequest: [],
      };

      for (let i = 0; i < allWhere.length; i += batchSize) {
        const whereBatch = allWhere.slice(i, i + batchSize);
        const res = await processBatch(whereBatch);
        if (res && res.TaskRequest && res.TaskRequest.length > 0) {
          taskreqProductionData.TaskRequest = [
            ...taskreqProductionData.TaskRequest,
            ...res.TaskRequest,
          ];
        }
      }

      if (!!taskreqProductionData) {
        skuIndexDetail.forEach((items) => {
          const TaskRequestdata = taskreqProductionData?.TaskRequest.filter(
            (item: any) =>
              sanitize_compare_str_v1(
                String(item.month),
                String(items.month)
              ) && item.year == items.year
          );
          if (!!TaskRequestdata.length) {
            let item = TaskRequestdata[0];
            let skuData = [];
            const validProductionSkus = skuReturnData?.OrgSKUMaster.filter(
              (obj1: Record<string, any>) =>
                item.GHGProductionDetails?.some(
                  (obj2: any) =>
                    sanitize_compare_str_v1(
                      obj2.SKU_ID,
                      obj1.client_master_id
                    ) || sanitize_compare_str_v1(obj2.SKU_ID, obj1.code)
                )
            );
            skuData = validProductionSkus.filter(
              (item) =>
                sanitize_compare_str_v1(
                  String(item.client_master_id),
                  String(items.sku)
                ) ||
                sanitize_compare_str_v1(String(item.code), String(items.sku))
            );
            if (skuData.length == 0) {
              validations.push({
                column: "SKUs applicable",
                row: parseInt(items.index) + 1,
                errorMessage: "No production details found for this sku",
              });
            }
          } else {
            validations.push({
              column: "SKUs applicable",
              row: parseInt(items.index) + 1,
              errorMessage: "No production details found for this sku",
            });
          }
        });
      }
    }
  }
  return validations;
};

const validateGeneralPurposeSpecificationDataSheet = (
  excelData: TExcelSheet
) => {
  return [];
};
const validateHeatingWaterSpecificationDataSheet = async (
  excelData: TExcelSheet,
  organisationAddressId: UUID,
  organizationId: UUID,
  org_role: keyof typeof OPSOrgRole
) => {
  let sheetAllerrorEntries: Record<string, string>[] = [];
  if (org_role === OPSOrgRole.BUYER) {
    const allSkus = excelData.data.map(
      (dataItem: Record<string, string>, rowNumber: number) => ({
        sku: String(dataItem["SKUs applicable"]),
        index: rowNumber,
      })
    );
    const Skuvalidations: TErrorExcelSheet[] = await ValidateSkudetails(
      allSkus,
      excelData,
      organisationAddressId,
      organizationId
    );
    if (Skuvalidations.length > 0) {
      let allcolumns: any =
        FuelPurchasedActivityConstant.excel_template.sheets.filter(
          (sheetitem) =>
            sanitizeString.v1(sheetitem.name) ==
            sanitizeString.v1(excelData.sheetName)
        )[0].columns;
      sheetAllerrorEntries = createErrorDataForExcel(
        allcolumns,
        Skuvalidations
      );
    }
  }
  return sheetAllerrorEntries;
};
const validateAuxFuelSpecificationDataSheet = async (
  excelData: TExcelSheet,
  organisationAddressId: UUID,
  organizationId: UUID,
  org_role: keyof typeof OPSOrgRole
) => {
  let sheetAllerrorEntries: Record<string, string>[] = [];
  if (org_role === OPSOrgRole.BUYER) {
    const allSkus = excelData.data.map(
      (dataItem: Record<string, string>, rowNumber: number) => ({
        sku: String(dataItem["SKUs applicable"]),
        index: rowNumber,
      })
    );
    const Skuvalidations: TErrorExcelSheet[] = await ValidateSkudetails(
      allSkus,
      excelData,
      organisationAddressId,
      organizationId
    );
    if (Skuvalidations.length > 0) {
      let allcolumns: any =
        FuelPurchasedActivityConstant.excel_template.sheets.filter(
          (sheetitem) =>
            sanitizeString.v1(sheetitem.name) ==
            sanitizeString.v1(excelData.sheetName)
        )[0].columns;
      sheetAllerrorEntries = createErrorDataForExcel(
        allcolumns,
        Skuvalidations
      );
    }
  }
  return sheetAllerrorEntries;
};
const validateTransportationPurposeSpecificationDataSheet = (
  excelData: TExcelSheet
) => {
  return [];
};

const validateSheetSpecificationMethods: Record<
  TFuelPurchasedActivitySheetNames,
  (
    sheet: TExcelSheet,
    organisationAddressId: UUID,
    organizationId: UUID,
    org_role: keyof typeof OPSOrgRole
  ) => Promise<Record<string, any>[]>
> = {
  "General Purpose": async (sheet) => {
    return validateGeneralPurposeSpecificationDataSheet(sheet);
  },
  "Heating Water": async (
    sheet,
    organisationAddressId,
    organizationId,
    org_role
  ) => {
    return await validateHeatingWaterSpecificationDataSheet(
      sheet,
      organisationAddressId,
      organizationId,
      org_role
    );
  },
  "AUX Fuel": async (
    sheet,
    organisationAddressId,
    organizationId,
    org_role
  ) => {
    return await validateAuxFuelSpecificationDataSheet(
      sheet,
      organisationAddressId,
      organizationId,
      org_role
    );
  },
  Transportation: async (sheet) => {
    return validateTransportationPurposeSpecificationDataSheet(sheet);
  },
};

const validatespecificationData = async (
  excelData: TExcelSheet[],
  organisationAddressId: UUID,
  organizationId: UUID,
  org_role: keyof typeof OPSOrgRole
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TFuelPurchasedActivitySheetNames]: Record<
      TFuelPurchasedActivitySheetColumnNames,
      any
    >[];
  } = {
    "Heating Water": [],
    "General Purpose": [],
    "AUX Fuel": [],
    Transportation: [],
  };
  let errorData: any = null;
  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TFuelPurchasedActivitySheetNames;
    errorData = await validateSheetSpecificationMethods[sheetName](
      excelData[i],
      organisationAddressId,
      organizationId,
      org_role
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: errorData,
    });
  }
  return excelSheetData;
};

//#endregion

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID,
  organizationAddressId: UUID,
  org_role: keyof typeof OPSOrgRole,
  isFromForm: boolean = false
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    organizationId,
    org_role,
    isFromForm
  );
  const masterErrorEntries: TExcelSheet[] = await validateDatabyDb(
    excelData,
    organizationId
  );
  const specificationerrorEntries: TExcelSheet[] =
    await validatespecificationData(
      excelData,
      organizationAddressId,
      organizationId,
      org_role
    );
  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  allError = combineAllErrorSheets(specificationerrorEntries, allError);

  const duplicateEntries: TExcelSheet[] = await validateDataForDuplicates(
    excelData
  );
  allError = combineAllErrorSheets(duplicateEntries, allError);

  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};

// Duplicate Row Validation for Fuel Consumption General (within-sheet only, no DB check for excel upload)
const validateDataForDuplicates = async (
  excelData: TExcelSheet[]
) => {
  const excelSheetData: TExcelSheet[] = [];

  const generalSheet = excelData.find(
    (sheet) =>
      sanitizeString.v1(sheet.sheetName) === sanitizeString.v1("General Purpose")
  );

  if (!generalSheet || generalSheet.data.length === 0) {
    return excelSheetData;
  }

  const failedEntries: Record<string, any>[] =
    validateDuplicateFuelGeneralSheet(generalSheet);

  excelSheetData.push({
    sheetName: "General Purpose",
    data: failedEntries,
  });

  return excelSheetData;
};

const validateDuplicateFuelGeneralSheet = (
  sheet: TExcelSheet
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  // Helper function to normalize values for comparison
  const normalizeValue = (val: any): any => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "string") {
      const trimmed = val.trim();
      const num = Number(trimmed);
      if (!isNaN(num) && trimmed !== "") return num;
      return trimmed.toLowerCase();
    }
    if (typeof val === "number") return val;
    return val;
  };

  const valuesMatch = (val1: any, val2: any): boolean => {
    const norm1 = normalizeValue(val1);
    const norm2 = normalizeValue(val2);
    if (norm1 === null && norm2 === null) return true;
    if (norm1 === null && norm2 === 0) return true;
    if (norm1 === 0 && norm2 === null) return true;
    if (norm1 === null || norm2 === null) return false;
    return norm1 === norm2;
  };

  const checkIfRecordsMatch = (
    item1: Record<string, any>,
    item2: Record<string, any>
  ): boolean => {
    return (
      valuesMatch(
        item1["Type of Fuel Consumption"],
        item2["Type of Fuel Consumption"] || item2["Type_of_Fuel_Purchased"]
      ) &&
      valuesMatch(
        item1["Quantity of Fuel Consumption"],
        item2["Quantity of Fuel Consumption"] || item2["Quantity_of_fuel_Consumed"]
      ) &&
      valuesMatch(
        item1["UoM for Fuel Consumption"],
        item2["UoM for Fuel Consumption"] || item2["Quantity_of_fuel_Consumed_uom"]
      ) &&
      valuesMatch(
        item1["Quality of Fuel"],
        item2["Quality of Fuel"] || item2["Quality_of_fuel"]
      ) &&
      valuesMatch(
        item1["Point of Consumption"],
        item2["Point of Consumption"] || item2["Point_of_Consumption"]
      )
    );
  };

  sheet.data.forEach((dataItem: Record<string, string>, currentIndex: number) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;

    if (!dataItem["Month"] || !dataItem["Year"]) {
      return;
    }

    const duplicateInData = sheet.data.some((otherItem, otherIndex) => {
      if (currentIndex === otherIndex) return false;
      const monthMatch = String(otherItem["Month"] || "").trim().toLowerCase() === String(dataItem["Month"] || "").trim().toLowerCase();
      const yearMatch = String(otherItem["Year"]) === String(dataItem["Year"]);
      if (!monthMatch || !yearMatch) return false;
      return checkIfRecordsMatch(dataItem, otherItem);
    });

    if (duplicateInData) {
      Object.keys(dataItem).forEach((key) => {
        errorEntries.push({
          column: key,
          row: index,
          errorMessage: "Duplicate Entry, Multiple identical records found in the uploaded data for the same period.",
        });
      });
    }

    if (errorEntries.length > 0) {
      const allColumns = FuelPurchasedActivityConstant.excel_template.sheets
        .find((s) => sanitizeString.v1(s.name) === sanitizeString.v1(sheet.sheetName))
        ?.columns.map(col => ({ name: col.name, code: col.code })) || [];
      
      const errorRow = createErrorDataForExcel(allColumns, errorEntries);
      sheetAllErrorEntries.push(errorRow[0]);
    }
  });

  return sheetAllErrorEntries;
};
