import { UUID } from "crypto";
import _ from "lodash";
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
    validateActivityMasterDataGroupByKey,
    YearMonthSchema,
} from "~/lib/excel/excel.service";
import {
    validateColumnNames,
    validateSheetName,
} from "~/lib/excel/excel.validation";
import {
    TWasteActivitySheetColumnNames,
    TWasteActivitySheetNames,
    WasteActivityConstant,
} from "~/shared/constants/activity.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import { toNumber } from "~/utils/data-transformer.util";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

// Helper function to count non-space characters
const countNonSpaceChars = (text: string): number => {
  return (text || "").replace(/\s/g, "").length;
};

// Zod schema for character limit validation
const maxCharLimitSchema = (maxChars: number) =>
  z.string().refine(
    (val) => countNonSpaceChars(val) <= maxChars,
    `Max ${maxChars} characters are allowed`
  );

let yearMonthError: TErrorExcelSheet[] = [];
const validNumericRegex = /^\d+(\.\d+)?$/;

const isNumericValue = (val: any): boolean => {
  if (val === undefined || val === null || val === "") return false;
  return /^-?\d+(\.\d+)?$/.test(String(val).trim());
};

// Unlike !!, treats 0 as a present value (not falsy)
const hasValue = (val: any): boolean =>
  val !== undefined && val !== null && val !== "";

const getMasterDataList = (ActivityMasterData: TActivityMasterData[], key: string): string => {
  const masterItem = ActivityMasterData.find((g: any) => g.master_key === key);
  if (!masterItem) return "";
  return masterItem.master_data.map((a: any) => a.label).join(", ");
};
const getGroupFilteredMasterDataList = (
  ActivityMasterData: TActivityMasterData[],
  key: string,
  parentKey: string,
  parentLabelValue: string
): string => {
  const masterItem = ActivityMasterData.find((g: any) => g.master_key === key);
  if (!masterItem) return "";
  const parentMasterItem = ActivityMasterData.find((g: any) => g.master_key === parentKey);
  if (!parentMasterItem) return masterItem.master_data.map((a: any) => a.label).join(", ");
  const parentValue = parentMasterItem.master_data.find(
    (item: any) => sanitizeString.v1(item.label) === sanitizeString.v1(parentLabelValue)
  )?.value;
  if (!parentValue) return masterItem.master_data.map((a: any) => a.label).join(", ");
  return masterItem.master_data
    .filter((a: any) =>
      a.group?.some((g: string) => sanitizeString.v1(g) === sanitizeString.v1(parentValue))
    )
    .map((a: any) => a.label)
    .join(", ");
};

const numericFieldSchema = (columnName: string, required = true) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined || val === null)
        return required ? "REQUIRED" : undefined;
      const str = String(val).trim();
      if (str === "") return required ? "REQUIRED" : undefined;
      if (!validNumericRegex.test(str)) return "INVALID_FORMAT";
      const digitCount = str.replace(/\D/g, "").length;
      if (digitCount > 15) return "INVALID_FORMAT";
      const num = Number(str);
      return isNaN(num) ? "INVALID_FORMAT" : num;
    })
    .refine((val) => val !== "REQUIRED", {
      message: `${columnName} is required`,
    })
    .refine((val) => val !== "INVALID_FORMAT", {
      message: `Please enter a valid numeric value for ${columnName}`,
    })
    .refine(
      (val) => val === undefined || (typeof val === "number" && val >= 0),
      { message: `Please enter a valid numeric value for ${columnName}` }
    )
    .refine(
      (val) => {
        if (val === undefined || typeof val !== "number") return true;
        const decimalPlaces = (val.toString().split(".")[1] || "").length;
        return decimalPlaces <= 4;
      },
      { message: `Please enter a valid numeric value for ${columnName}` }
    );

const { sheets: templateSheets } = WasteActivityConstant.excel_template;
// export const wasteProducedData = (baseMonth: string, baseYear: number) => {
//   return YearMonthSchema(baseYear)
//     .extend({
//       "Types of Waste Generated": z
//         .string()
//         .trim()
//         .min(1, "Types of Waste Generated is required"),
//       "Waste Disposal Managed by": z
//         .string()
//         .trim()
//         .min(1, "Waste Disposal Managed by is required"),
//       "Name of Third Party": z
//         .string()
//         .optional()
//         .or(z.literal(""))
//         .refine(
//           (val) => !val || val.length <= 250,
//           "Max 250 characters are allowed"
//         ),
//       "Quantity of Waste": z
//         .unknown()
//         .refine((val) => val !== undefined && val !== null && val !== "", "Quantity of waste is required")
//         .transform(Number)
//         .refine((q) => Number(q) >= 0, "Invalid quantity of waste"),
//       UoM_Waste: z.string().min(1, "UoM Waste is required"),
//       "Disposal Mechanism": z.string().optional().or(z.literal("")),
//       "Location of Waste Disposal": z
//         .string()
//         .optional()
//         .or(z.literal(""))
//         .refine(
//           (val) => !val || val.length <= 250,
//           "Max 250 characters are allowed"
//         ),
//       "Waste Transportation Managed By": z
//         .string()
//         .trim()
//         .optional()
//         .or(z.literal("")),
//       "Mode of Transport": z.string().trim().optional().or(z.literal("")),
//       "Vehicle Type Used for Road Transport": z
//         .string()
//         .trim()
//         .optional()
//         .or(z.literal("")),
//       "Fuel Used": z.string().trim().optional().or(z.literal("")),
//       "Distance of Waste Disposal Location from Facility": z
//         .unknown()
//         .transform(Number)
//         .optional()
//         .or(z.literal("")),
//       UoM: z.string().optional().or(z.literal("")),
//     })
//     .refine(
//       ({ Year, Month }) => {
//         let fullNameMonth = months.filter(
//           (month) => sanitizeString.v1(month) == sanitizeString.v1(Month)
//         );
//         if (fullNameMonth.length > 0) {
//           yearMonthError = validateMonthYear(Month, Year, baseMonth, baseYear);
//           return yearMonthError.length == 0;
//         }
//         return true;
//       },
//       ({ Month }) => ({
//         message: yearMonthError[0].errorMessage,
//         path: Object.keys({ Month }),
//       })
//     )
//     .refine(
//       (allcolumns) => {
//         const distance = allcolumns["Distance of Waste Disposal Location from Facility"];
//         const uom = allcolumns["UoM"];

//         // If UoM has a value, Distance must be provided and > 0
//         if (!!uom && (!distance || toNumber(distance) <= 0)) {
//           return false;
//         }

//         // If Distance exists, it must be > 0
//         if (!!distance && toNumber(distance) <= 0) {
//           return false;
//         }

//         return true;
//       },
//       (allcolumns) => {
//         const distance = allcolumns["Distance of Waste Disposal Location from Facility"];
//         const uom = allcolumns["UoM"];

//         if (!!uom && !distance) {
//           return {
//             message: "Please enter valid Distance of Waste Disposal Location from Facility value",
//             path: ["Distance of Waste Disposal Location from Facility"],
//           };
//         }

//         return {
//           message: "Please enter valid Distance of Waste Disposal Location from Facility value",
//           path: ["Distance of Waste Disposal Location from Facility"],
//         };
//       }
//     );
// };

// Validate organization activity permission.
// Validate user AND location activity permission.

// Validate each excel sheet names based on activity.
// Validate each excel sheet column names based on activity.

export const wasteProducedData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Types of Waste Generated": z
        .unknown()
        .refine(
          (val) => val !== undefined && val !== null && String(val).trim() !== "",
          "Types of Waste Generated is required"
        )
        .refine(
          (val) => !isNumericValue(val),
          "Invalid Entry: Numeric values are not allowed."
        )
        .transform(String),
      "Waste Disposal Managed by": z
        .union([z.string(), z.number()])
        .transform((val) => String(val ?? "").trim())
        .refine((val) => val.length > 0, "Waste Disposal Managed by is required"),
      "Name of Third Party": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => (val !== undefined && val !== null ? String(val).trim() : ""))
        .refine(
          (val) => val.length <= 250,
          "Max 250 characters are allowed"
        ),
      "Quantity of Waste": numericFieldSchema("Quantity of Waste", true),
      UoM_Waste: z
        .union([z.string(), z.number()])
        .transform((val) => String(val ?? "").trim())
        .refine((val) => val.length > 0, "UoM Waste is required"),
      "Disposal Mechanism": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => (val !== undefined && val !== null ? String(val).trim() : "")),
      "Location of Waste Disposal": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => (val !== undefined && val !== null ? String(val).trim() : ""))
        .refine(
          (val) => val.length <= 250,
          "Max 250 characters are allowed"
        ),
      "Waste Transportation Managed By": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => (val !== undefined && val !== null ? String(val).trim() : "")),
      "Mode of Transport": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => (val !== undefined && val !== null ? String(val).trim() : "")),
      "Vehicle Type Used for Road Transport": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => (val !== undefined && val !== null ? String(val).trim() : "")),
      "Fuel Used": z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => (val !== undefined && val !== null ? String(val).trim() : "")),
      "Distance of Waste Disposal Location from Facility": numericFieldSchema(
        "Distance of Waste Disposal Location from Facility",
        false
      ),
      UoM: z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => (val !== undefined && val !== null ? String(val).trim() : "")),
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
    .refine(
      (allcolumns) => {
        const distance = allcolumns["Distance of Waste Disposal Location from Facility"];
        const uom = allcolumns["UoM"];

        // Skip cross-field check if distance failed its own field validation (sentinel string values)
        if (typeof distance === "string") return true;

        // If UoM has a value, Distance must be provided and > 0
        if (!!uom && (!distance || (typeof distance === "number" && distance <= 0))) {
          return false;
        }

        // If Distance exists and is a number, it must be > 0
        if (typeof distance === "number" && distance <= 0) {
          return false;
        }

        return true;
      },
      (allcolumns) => {
        const distance = allcolumns["Distance of Waste Disposal Location from Facility"];
        const uom = allcolumns["UoM"];

        if (!!uom && !distance) {
          return {
            message: "Please enter valid Distance of Waste Disposal Location from Facility value",
            path: ["Distance of Waste Disposal Location from Facility"],
          };
        }

        return {
          message: "Please enter valid Distance of Waste Disposal Location from Facility value",
          path: ["Distance of Waste Disposal Location from Facility"],
        };
      }
    );
};

export const validateWasteExcelTemplate = (excelData: TExcelSheet[]) => {
  let errorMessageData: TTemplateErrorData[] = [];
  const sheets = WasteActivityConstant.excel_template.sheets;
  sheets.forEach((sheetObj) => {
    const sheetData = excelData.find(
      (sheet) =>
        sanitizeString.v2(sheet.sheetName) === sanitizeString.v2(sheetObj.name)
    );
    // validate sheets and column names //
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
          sheet: "Waste Data",
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

const validateWasteProducedDataSheet = (
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
      WasteActivityConstant.excel_template.sheets
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

// const validateMasterWasteProducedDataSheet = (
//   sheet: TExcelSheet,
//   ActivityMasterData: TActivityMasterData[]
// ) => {
//   const sheetAllerrorEntries: Record<string, string>[] = [];
//   let index: number = 0;
  

//   sheet.data.forEach((dataItem: Record<string, string>) => {
//     let errorEntries: TErrorExcelSheet[] = [];
//     index++;
//     /// Validation of Columns value from Master Data

//     if (hasValue(dataItem["Mode of Transport"])) {
//       const errorEntriesColumn1Data = validateActivityMasterDataByKey(
//         ActivityMasterData,
//         dataItem["Mode of Transport"],
//         index,
//         "waste_disposal_tansport_mode_of_transport",
//         "Mode of Transport",
//         ApiHitType.Excel
//       );
//       if (errorEntriesColumn1Data.length > 0) {
//         errorEntries.push({ ...errorEntriesColumn1Data[0] });
//       } else {
//         if (!!dataItem["Fuel Used"]) {
//           const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
//             ActivityMasterData,
//             dataItem["Mode of Transport"],
//             dataItem["Fuel Used"],
//             index,
//             "waste_disposal_tansport_fuel_used",
//             "Fuel Used",
//             ApiHitType.Excel,
//             "waste_disposal_tansport_mode_of_transport"
//           );
//           if (errorEntriesColumn2Data.length > 0) {
//             errorEntries.push({ ...errorEntriesColumn2Data[0] });
//           }
//         }
//       }
//     }

//     const errorEntriesColumn3Data = validateActivityMasterDataByKey(
//       ActivityMasterData,
//       dataItem["Waste Disposal Managed by"],
//       index,
//       "waste_disposal_managed_by",
//       "Waste Disposal Managed by",
//       ApiHitType.Excel
//     );
//     if (errorEntriesColumn3Data.length > 0) {
//       errorEntries.push({ ...errorEntriesColumn3Data[0] });
//     }

//     if (dataItem["Waste Disposal Managed by"] === "Third Party") {
//       if (dataItem["Name of Third Party"] === "") {
//         errorEntries.push({
//           column: "Name of Third Party",
//           row: index,
//           errorMessage: "Name of Third Party is required",
//         });
//       }
//     }

//     const errorEntriesColumn4Data = validateActivityMasterDataByKey(
//       ActivityMasterData,
//       dataItem["UoM_Waste"],
//       index,
//       "waste_quantity_UOM",
//       "UoM_Waste",
//       ApiHitType.Excel
//     );
//     if (errorEntriesColumn4Data.length > 0) {
//       errorEntries.push({ ...errorEntriesColumn4Data[0] });
//     }
//     if (hasValue(dataItem["UoM"])) {
//       const errorEntriesColumn5Data = validateActivityMasterDataByKey(
//         ActivityMasterData,
//         dataItem["UoM"],
//         index,
//         "waste_disposal_location_distance_uom",
//         "UoM",
//         ApiHitType.Excel
//       );
//       if (errorEntriesColumn5Data.length > 0) {
//         errorEntries.push({ ...errorEntriesColumn5Data[0] });
//       }
//     }

//     if (sanitizeString.v1(dataItem["Mode of Transport"]) === "road") {
//       if (hasValue(dataItem["Vehicle Type Used for Road Transport"])) {
//         const errorEntriesColumn6Data = validateActivityMasterDataByKey(
//           ActivityMasterData,
//           dataItem["Vehicle Type Used for Road Transport"],
//           index,
//           "waste_disposal_tansport_road_vehicle_type",
//           "Vehicle Type Used for Road Transport",
//           ApiHitType.Excel
//         );
//         if (errorEntriesColumn6Data.length > 0) {
//           errorEntries.push({ ...errorEntriesColumn6Data[0] });
//         }
//       }
//     }
//     if (hasValue(dataItem["Waste Transportation Managed By"])) {
//       const errorEntriesColumn7Data = validateActivityMasterDataByKey(
//         ActivityMasterData,
//         dataItem["Waste Transportation Managed By"],
//         index,
//         "waste_transportation_managed_by",
//         "Waste Transportation Managed By",
//         ApiHitType.Excel
//       );
//       if (errorEntriesColumn7Data.length > 0) {
//         errorEntries.push({ ...errorEntriesColumn7Data[0] });
//       }
//     }
//     if (hasValue(dataItem["Disposal Mechanism"])) {
//       const errorEntriesColumn8Data = validateActivityMasterDataByKey(
//         ActivityMasterData,
//         dataItem["Disposal Mechanism"],
//         index,
//         "waste_disposal_mechanism",
//         "Disposal Mechanism",
//         ApiHitType.Excel
//       );
//       if (errorEntriesColumn8Data.length > 0) {
//         errorEntries.push({ ...errorEntriesColumn8Data[0] });
//       }
//     }

//     if (errorEntries.length > 0) {
//       let allcolumns: any = WasteActivityConstant.excel_template.sheets.filter(
//         (sheetitem) =>
//           sanitizeString.v1(sheetitem.name) ==
//           sanitizeString.v1(sheet.sheetName)
//       )[0].columns;
//       const errorrow = createErrorDataForExcel(allcolumns, errorEntries);
//       sheetAllerrorEntries.push(errorrow[0]);
//     }
//   });
//   return sheetAllerrorEntries;
// };

// const validateMasterWasteProducedDataSheet = (
//   sheet: TExcelSheet,
//   ActivityMasterData: TActivityMasterData[]
// ) => {
//   const sheetAllerrorEntries: Record<string, string>[] = [];
//   let index: number = 0;

//   const checkMasterField = (
//     val: any,
//     masterKey: string,
//     columnName: string,
//     errorEntries: TErrorExcelSheet[]
//   ) => {
//     if (isNumericValue(val)) {
//       errorEntries.push({
//         column: columnName,
//         row: index,
//         errorMessage: "Invalid Entry: Numeric values are not allowed.",
//       });
//       return;
//     }
//     const result = validateActivityMasterDataByKey(
//       ActivityMasterData,
//       val,
//       index,
//       masterKey,
//       columnName,
//       ApiHitType.Excel
//     );
//     if (result.length > 0) {
//       errorEntries.push({
//         ...result[0],
//         errorMessage: `Invalid entry: Data must be ${getMasterDataList(ActivityMasterData, masterKey)}`,
//       });
//     }
//   };

//   sheet.data.forEach((dataItem: Record<string, string>) => {
//     let errorEntries: TErrorExcelSheet[] = [];
//     index++;

//     if (hasValue(dataItem["Mode of Transport"])) {
//       if (isNumericValue(dataItem["Mode of Transport"])) {
//         errorEntries.push({
//           column: "Mode of Transport",
//           row: index,
//           errorMessage: "Invalid Entry: Numeric values are not allowed.",
//         });
//       } else {
//         const modeResult = validateActivityMasterDataByKey(
//           ActivityMasterData,
//           dataItem["Mode of Transport"],
//           index,
//           "waste_disposal_tansport_mode_of_transport",
//           "Mode of Transport",
//           ApiHitType.Excel
//         );
//         if (modeResult.length > 0) {
//           errorEntries.push({
//             ...modeResult[0],
//             errorMessage: `Invalid entry: Data must be ${getMasterDataList(ActivityMasterData, "waste_disposal_tansport_mode_of_transport")}`,
//           });
//         } else {
//           if (hasValue(dataItem["Fuel Used"])) {
//             if (isNumericValue(dataItem["Fuel Used"])) {
//               errorEntries.push({
//                 column: "Fuel Used",
//                 row: index,
//                 errorMessage: "Invalid Entry: Numeric values are not allowed.",
//               });
//             } else {
//               const fuelResult = validateActivityMasterDataGroupByKey(
//                 ActivityMasterData,
//                 dataItem["Mode of Transport"],
//                 dataItem["Fuel Used"],
//                 index,
//                 "waste_disposal_tansport_fuel_used",
//                 "Fuel Used",
//                 ApiHitType.Excel,
//                 "waste_disposal_tansport_mode_of_transport"
//               );
//               if (fuelResult.length > 0) {
//                 errorEntries.push({
//                   ...fuelResult[0],
//                   errorMessage: `Invalid entry: Data must be ${getMasterDataList(ActivityMasterData, "waste_disposal_tansport_fuel_used")}`,
//                 });
//               }
//             }
//           }
//         }
//       }
//     }

//     checkMasterField(
//       dataItem["Waste Disposal Managed by"],
//       "waste_disposal_managed_by",
//       "Waste Disposal Managed by",
//       errorEntries
//     );

//     if (String(dataItem["Waste Disposal Managed by"] ?? "").trim() === "Third Party") {
//       if (!dataItem["Name of Third Party"] || String(dataItem["Name of Third Party"]).trim() === "") {
//         errorEntries.push({
//           column: "Name of Third Party",
//           row: index,
//           errorMessage: "Name of Third Party is required",
//         });
//       }
//     }

//     checkMasterField(
//       dataItem["UoM_Waste"],
//       "waste_quantity_UOM",
//       "UoM_Waste",
//       errorEntries
//     );

//     if (hasValue(dataItem["UoM"])) {
//       checkMasterField(
//         dataItem["UoM"],
//         "waste_disposal_location_distance_uom",
//         "UoM",
//         errorEntries
//       );
//     }

//     if (sanitizeString.v1(String(dataItem["Mode of Transport"] ?? "")) === "road") {
//       if (hasValue(dataItem["Vehicle Type Used for Road Transport"])) {
//         checkMasterField(
//           dataItem["Vehicle Type Used for Road Transport"],
//           "waste_disposal_tansport_road_vehicle_type",
//           "Vehicle Type Used for Road Transport",
//           errorEntries
//         );
//       }
//     }

//     if (hasValue(dataItem["Waste Transportation Managed By"])) {
//       checkMasterField(
//         dataItem["Waste Transportation Managed By"],
//         "waste_transportation_managed_by",
//         "Waste Transportation Managed By",
//         errorEntries
//       );
//     }

//     if (hasValue(dataItem["Disposal Mechanism"])) {
//       checkMasterField(
//         dataItem["Disposal Mechanism"],
//         "waste_disposal_mechanism",
//         "Disposal Mechanism",
//         errorEntries
//       );
//     }

//     if (errorEntries.length > 0) {
//       let allcolumns: any = WasteActivityConstant.excel_template.sheets.filter(
//         (sheetitem) =>
//           sanitizeString.v1(sheetitem.name) ==
//           sanitizeString.v1(sheet.sheetName)
//       )[0].columns;
//       const errorrow = createErrorDataForExcel(allcolumns, errorEntries);
//       sheetAllerrorEntries.push(errorrow[0]);
//     }
//   });
//   return sheetAllerrorEntries;
// };

const validateMasterWasteProducedDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  const checkMasterField = (
    val: any,
    masterKey: string,
    columnName: string,
    errorEntries: TErrorExcelSheet[]
  ) => {
    if (isNumericValue(val)) {
      errorEntries.push({
        column: columnName,
        row: index,
        errorMessage: "Invalid Entry: Numeric values are not allowed.",
      });
      return;
    }
    const result = validateActivityMasterDataByKey(
      ActivityMasterData,
      val,
      index,
      masterKey,
      columnName,
      ApiHitType.Excel
    );
    if (result.length > 0) {
      errorEntries.push({
        ...result[0],
        errorMessage: `Invalid entry: Data must be ${getMasterDataList(ActivityMasterData, masterKey)}`,
      });
    }
  };

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;

    if (hasValue(dataItem["Mode of Transport"])) {
      if (isNumericValue(dataItem["Mode of Transport"])) {
        errorEntries.push({
          column: "Mode of Transport",
          row: index,
          errorMessage: "Invalid Entry: Numeric values are not allowed.",
        });
      } else {
        const modeResult = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Mode of Transport"],
          index,
          "waste_disposal_tansport_mode_of_transport",
          "Mode of Transport",
          ApiHitType.Excel
        );
        if (modeResult.length > 0) {
          errorEntries.push({
            ...modeResult[0],
            errorMessage: `Invalid entry: Data must be ${getMasterDataList(ActivityMasterData, "waste_disposal_tansport_mode_of_transport")}`,
          });
        } else {
          if (hasValue(dataItem["Fuel Used"])) {
            const fuelResult = validateActivityMasterDataGroupByKey(
              ActivityMasterData,
              String(dataItem["Mode of Transport"]),
              String(dataItem["Fuel Used"]),
              index,
              "waste_disposal_tansport_fuel_used",
              "Fuel Used",
              ApiHitType.Excel,
              "waste_disposal_tansport_mode_of_transport"
            );
            if (fuelResult.length > 0) {
              errorEntries.push({
                ...fuelResult[0],
                errorMessage: `Invalid entry: Data must be ${getGroupFilteredMasterDataList(
                  ActivityMasterData,
                  "waste_disposal_tansport_fuel_used",
                  "waste_disposal_tansport_mode_of_transport",
                  String(dataItem["Mode of Transport"])
                )}`,
              });
            }
          }
        }
      }
    }

    checkMasterField(
      dataItem["Waste Disposal Managed by"],
      "waste_disposal_managed_by",
      "Waste Disposal Managed by",
      errorEntries
    );

    if (String(dataItem["Waste Disposal Managed by"] ?? "").trim() === "Third Party") {
      if (!dataItem["Name of Third Party"] || String(dataItem["Name of Third Party"]).trim() === "") {
        errorEntries.push({
          column: "Name of Third Party",
          row: index,
          errorMessage: "Name of Third Party is required",
        });
      }
    }

    checkMasterField(
      dataItem["UoM_Waste"],
      "waste_quantity_UOM",
      "UoM_Waste",
      errorEntries
    );

    if (hasValue(dataItem["UoM"])) {
      checkMasterField(
        dataItem["UoM"],
        "waste_disposal_location_distance_uom",
        "UoM",
        errorEntries
      );
    }

    if (sanitizeString.v1(String(dataItem["Mode of Transport"] ?? "")) === "road") {
      if (hasValue(dataItem["Vehicle Type Used for Road Transport"])) {
        checkMasterField(
          dataItem["Vehicle Type Used for Road Transport"],
          "waste_disposal_tansport_road_vehicle_type",
          "Vehicle Type Used for Road Transport",
          errorEntries
        );
      }
    }

    if (hasValue(dataItem["Waste Transportation Managed By"])) {
      checkMasterField(
        dataItem["Waste Transportation Managed By"],
        "waste_transportation_managed_by",
        "Waste Transportation Managed By",
        errorEntries
      );
    }

    if (hasValue(dataItem["Disposal Mechanism"])) {
      checkMasterField(
        dataItem["Disposal Mechanism"],
        "waste_disposal_mechanism",
        "Disposal Mechanism",
        errorEntries
      );
    }

    if (errorEntries.length > 0) {
      let allcolumns: any = WasteActivityConstant.excel_template.sheets.filter(
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
  TWasteActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Waste Produced Data": validateWasteProducedDataSheet,
};

const validateMasterDataSheetMethods: Record<
  TWasteActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Waste Produced Data": validateMasterWasteProducedDataSheet,
};

const wasteDataValidate = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TWasteActivitySheetNames]: Record<
      TWasteActivitySheetColumnNames,
      any
    >[];
  } = { "Waste Produced Data": [] };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TWasteActivitySheetNames;
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

const wasteDataValidateByDB = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.waste,
  });
  // Get Waste Master data
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TWasteActivitySheetNames]: Record<
      TWasteActivitySheetColumnNames,
      any
    >[];
  } = { "Waste Produced Data": [] };

  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TWasteActivitySheetNames;

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

// Validate each excel sheet cells based on column data type.
export const validateWasteExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID,
  org_address_id?: UUID,
  isFromForm: boolean = false
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

  const zodErrorEnteries: TExcelSheet[] = await wasteDataValidate(
    excelData,
    organizationId
  );

  const masterErrorEntries: TExcelSheet[] = await wasteDataValidateByDB(
    excelData,
    organizationId
  );
  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);

  // Validate for duplicate entries
  const wasteProducedSheetZodErrors = zodErrorEnteries.find(
    (sheet) =>
      sanitizeString.v1(sheet.sheetName) ===
      sanitizeString.v1("Waste Produced Data")
  );

  if (
    wasteProducedSheetZodErrors &&
    wasteProducedSheetZodErrors.data.length === 0 &&
    org_address_id
  ) {
    const duplicateEntries: TExcelSheet[] = await validateDataForDuplicates(
      excelData,
      org_address_id,
      isFromForm
    );
    allError = combineAllErrorSheets(duplicateEntries, allError);
  }

  finalError = combineAllTypeErrorInRow(allError, dynamicTemplateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};

// Duplicate Row Validation for Waste Produced Data
const validateDataForDuplicates = async (
  excelData: TExcelSheet[],
  org_address_id: UUID,
  isFromForm: boolean = false
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();

  // Get the Waste Produced Data sheet data
  const wasteProducedSheet = excelData.find(
    (sheet) =>
      sanitizeString.v1(sheet.sheetName) ===
      sanitizeString.v1("Waste Produced Data")
  );

  if (!wasteProducedSheet || wasteProducedSheet.data.length === 0) {
    return excelSheetData;
  }

  let allExistingWasteRecords: any[] = [];

  if (isFromForm) {
    // Collect all unique month/year combinations from the data
    const monthYearSet: { month: string; year: string }[] = [];
    wasteProducedSheet.data.forEach((dataItem: Record<string, string>) => {
      const month = dataItem["Month"];
      const year = dataItem["Year"];
      if (month && year) {
        monthYearSet.push({ month, year });
      }
    });

    // Get unique combinations
    const uniqueMonthYearSet = _.uniqWith(monthYearSet, _.isEqual);

    // Fetch existing waste data for all month/year combinations
    const existingDataPromises = uniqueMonthYearSet.map(async ({ month, year }) => {
      // First get the task request ID for this month/year/orgAddress
      const result = await sdk.getTaskRequestV2({
        month: month,
        year: Number(year),
        organizationAddressId: org_address_id,
      });

      const taskRequestIds = result.TaskRequest.map((tr) => tr.id);
      if (taskRequestIds.length === 0) return { GHGWaste: [] };

      return sdk.getGHGWasteByTaskRequestIds({
        taskRequestId: taskRequestIds,
      });
    });

    const existingDataResults = await Promise.all(existingDataPromises);

    // Flatten all existing waste records
    allExistingWasteRecords = existingDataResults.flatMap(
      (result) => result.GHGWaste || []
    );
  }

  const failedEntries: {
    [key in TWasteActivitySheetNames]: Record<
      TWasteActivitySheetColumnNames,
      any
    >[];
  } = {
    "Waste Produced Data": [],
  };

  // Only process Waste Produced Data sheet for duplicates
  failedEntries["Waste Produced Data"] = validateDuplicateWasteProducedDataSheet(
    wasteProducedSheet,
    allExistingWasteRecords,
    isFromForm
  );

  excelSheetData.push({
    sheetName: "Waste Produced Data",
    data: failedEntries["Waste Produced Data"],
  });

  return excelSheetData;
};

const validateDuplicateWasteProducedDataSheet = (
  sheet: TExcelSheet,
  existingWasteRecords: any[],
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

  // Helper function to check if two data items match for Waste Produced Data
  const checkIfRecordsMatch = (
    item1: Record<string, any>,
    item2: Record<string, any>
  ): boolean => {
    return (
      valuesMatch(item1["Types of Waste Generated"], item2["Types of Waste Generated"]) &&
      valuesMatch(item1["Waste Disposal Managed by"], item2["Waste Disposal Managed by"]) &&
      valuesMatch(item1["Name of Third Party"], item2["Name of Third Party"]) &&
      valuesMatch(item1["Quantity of Waste"], item2["Quantity_of_Waste"] || item2["Quantity of Waste"]) &&
      valuesMatch(item1["UoM_Waste"], item2["Quantity_of_Waste_UoM"] || item2["UoM_Waste"]) &&
      valuesMatch(item1["Disposal Mechanism"], item2["Disposal_Mechanism"] || item2["Disposal Mechanism"]) &&
      valuesMatch(item1["Location of Waste Disposal"], item2["Location_of_Waste_Disposal"] || item2["Location of Waste Disposal"]) &&
      valuesMatch(item1["Waste Transportation Managed By"], item2["Who_Managed_Transportation_of_Waste"] || item2["Waste Transportation Managed By"]) &&
      valuesMatch(item1["Mode of Transport"], item2["Mode_of_Transport"] || item2["Mode of Transport"]) &&
      valuesMatch(item1["Vehicle Type Used for Road Transport"], item2["Vehicle_Type_Used_for_Road_Transport"] || item2["Vehicle Type Used for Road Transport"]) &&
      valuesMatch(item1["Fuel Used"], item2["Fuel_Used"] || item2["Fuel Used"]) &&
      valuesMatch(item1["Distance of Waste Disposal Location from Facility"], item2["DistOf_WasteDisposalLoction_from_FacilityLocation"] || item2["Distance of Waste Disposal Location from Facility"]) &&
      valuesMatch(item1["UoM"], item2["DistOf_WasteDisposalLoction_from_FacilityLocation_UoM"] || item2["UoM"])
    );
  };

  sheet.data.forEach((dataItem: Record<string, string>, currentIndex: number) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;

    // Skip validation if essential fields are missing
    if (!dataItem["Month"] || !dataItem["Year"]) {
      return;
    }

    // Get the ID if this is an edit operation (from form)
    const currentRecordId = (dataItem as any).id || (dataItem as any).row_id;

    // 1. Check for duplicates within the sheet data itself
    const duplicateInSheet = sheet.data.some(
      (otherItem: Record<string, string>, otherIndex: number) => {
        if (currentIndex === otherIndex) return false;

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
      const recordsToCheck = existingWasteRecords.filter((record) => {
        if (currentRecordId && record.id === currentRecordId) {
          return false;
        }
        return true;
      });

      const isDuplicateInDB = recordsToCheck.some((existingRecord) => {
        return (
          valuesMatch(existingRecord.Types_of_Waste_Generated, dataItem["Types of Waste Generated"]) &&
          valuesMatch(existingRecord.Waste_Disposal_Managed_by, dataItem["Waste Disposal Managed by"]) &&
          valuesMatch(existingRecord.Name_of_Third_Party, dataItem["Name of Third Party"]) &&
          valuesMatch(existingRecord.Quantity_of_Waste, dataItem["Quantity of Waste"]) &&
          valuesMatch(existingRecord.Quantity_of_Waste_UoM, dataItem["UoM_Waste"]) &&
          valuesMatch(existingRecord.Disposal_Mechanism, dataItem["Disposal Mechanism"]) &&
          valuesMatch(existingRecord.Location_of_Waste_Disposal, dataItem["Location of Waste Disposal"]) &&
          valuesMatch(existingRecord.Who_Managed_Transportation_of_Waste, dataItem["Waste Transportation Managed By"]) &&
          valuesMatch(existingRecord.Mode_of_Transport, dataItem["Mode of Transport"]) &&
          valuesMatch(existingRecord.Vehicle_Type_Used_for_Road_Transport, dataItem["Vehicle Type Used for Road Transport"]) &&
          valuesMatch(existingRecord.Fuel_Used, dataItem["Fuel Used"]) &&
          valuesMatch(existingRecord.DistOf_WasteDisposalLoction_from_FacilityLocation, dataItem["Distance of Waste Disposal Location from Facility"]) &&
          valuesMatch(existingRecord.DistOf_WasteDisposalLoction_from_FacilityLocation_UoM, dataItem["UoM"])
        );
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
      const allColumns = WasteActivityConstant.excel_template.sheets
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
  });

  return sheetAllErrorEntries;
};

// After data tranformation, validate data fields as per GHG specification.
