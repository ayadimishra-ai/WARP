import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import { UomMaster } from "~/graphql/shared/types";
import {
  ApiHitType,
  TActivityMasterData,
  TErrorExcelSheet,
  TExcelSheet,
  TTemplateErrorData,
  YearMonthSchema,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  validateActivityMasterDataByKey,
  validateActivityMasterDataGroupByKey,
} from "~/lib/excel/excel.service";
import {
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import {
  TTransportDownstreamSheetColumnNames,
  TTransportDownstreamSheetNames,
  TTransportDownstreamSheetTemplate,
  TransportDownstreamExcelConstant,
} from "~/shared/constants/activity.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } =
  TransportDownstreamExcelConstant.excel_template;
const transportDownstream = (
  baseMonth: string,
  baseYear: number,
  sheetName: string
) => {
  if (sheetName === TTransportDownstreamSheetTemplate.RoadBased) {
    return YearMonthSchema(baseYear)
      .extend({
        "SKU Code": z
          .unknown()
          .transform((q) => sanitizeString.v1(String(q)).toUpperCase())
          .optional(),
        "Number of SKUs": z.union([
          z
            .number()
            .int({ message: "Number of SKUs should be a valid integer." })
            .min(1, { message: "Number of SKUs is invalid." }),
          z.string().refine((value) => value === "", {
            message: "Number of SKUs should be a valid integer",
          }),
        ]),
        "Distributor Code": z.preprocess(
          (val) => {
            return typeof val === "number" ? String(val).trim() : val;
          },
          z.string().trim().min(1, { message: "Distributor Code is required" })
        ),
        "Distributed from Location Country": z.union([
          z.number().transform((val) => val.toString()),
          z.string().trim().min(1, {
            message: "Distributed from Location Country is required",
          }),
        ]),
        /*"Distributed from Location Pincode": z.union([
          z.number().transform((val) => val.toString()),
          z.string().trim().min(1, {
            message: "Distributed from Location Pincode is required",
          }),
        ]),*/
        "Distributed from Location Pincode": z
          .union([z.number().transform((val) => String(val)), z.string()])
          .pipe(
            z
              .string()
              .min(1, {
                message: "Distributed from Location Pincode is required",
              })
              .regex(/^[A-Za-z0-9\-\s/]+$/, {
                message:
                  "Distributed from Location Pincode must contain only letters, numbers, spaces, hyphens, and slashes",
              })
              .transform((val) => val.trim()) // Remove leading/trailing spaces
          ),
        "Distributed to Location Country": z.union([
          z.number().transform((val) => val.toString()),
          z.string().trim().min(1, {
            message: "Distributed to Location Country is required",
          }),
        ]),
        /*"Distributed to Location Pincode": z.union([
          z.number().transform((val) => val.toString()),
          z
            .string()
            .trim()
            .min(1, { message: "Distributed to Location Pincode is required" }),
        ]),*/
        "Distributed to Location Pincode": z
          .union([z.number().transform((val) => String(val)), z.string()])
          .pipe(
            z
              .string()
              .min(1, {
                message: "Distributed to Location Pincode is required",
              })
              .regex(/^[A-Za-z0-9\-\s/]+$/, {
                message:
                  "Distributed to Location Pincode must contain only letters, numbers, spaces, hyphens, and slashes",
              })
              .transform((val) => val.trim()) // Remove leading/trailing spaces
          ),
        "Type of Vehicle": z
          .string()
          .trim()
          .min(1, { message: "Type of Vehicle is required" })
          .refine((val) => val === "HDV" || val === "MDV" || val === "LDV", {
            message: "Invalid Value: Data should be HDV,MDV,LDV",
          }),
        "Type of Fuel Used": z.string().trim().optional(),
        "Total Distance Travelled": z.union([z.number(), z.string()]).refine(
          (val) => {
            if (typeof val === "string") {
              return val.length === 0;
            }
            return typeof val === "number";
          },
          {
            message: "Invalid Value: Data should be Numeric",
          }
        ),
        "Total Distance Travelled UoM": z.string().optional(),
      })
      .refine(
        ({ Year, Month }) => {
          let fullNameMonth = months.filter(
            (month) => sanitizeString.v1(month) == sanitizeString.v1(Month)
          );
          if (fullNameMonth.length > 0) {
            yearMonthError = validateMonthYear(
              Month,
              Year,
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
      )
      .refine(
        (data) =>
          !data["Total Distance Travelled"] ||
          data["Total Distance Travelled UoM"],
        () => ({
          message:
            "Total Distance Travelled UoM is required if Total Distance Travelled is given",
          path: ["Total Distance Travelled UoM"],
        })
      )
      .refine(
        (data) =>
          !data["Total Distance Travelled UoM"] ||
          data["Total Distance Travelled"],
        () => ({
          message:
            "Total Distance Travelled is required if Total Distance Travelled UoM is given",
          path: ["Total Distance Travelled"],
        })
      );
  } else {
    return YearMonthSchema(baseYear)
      .extend({
        "SKU Code": z
          .unknown()
          .refine((q) => !!String(q).trim(), "SKU Code is required")
          .transform((q) => sanitizeString.v1(String(q)).toUpperCase())
          .optional(),
        "Number of SKUs": z.union([
          z
            .number()
            .int({ message: "Number of SKUs should be a valid integer." })
            .min(1, { message: "Number of SKUs is invalid" }),
          z
            .string()
            .refine((value) => value.trim() !== "", {
              message: "Number of SKUs is required",
            })
            .refine((value) => value.length === 0, {
              message: "Number of SKUs should be a valid integer.",
            }),
        ]),
        "Distributor Code": z.preprocess(
          (val) => {
            return typeof val === "number" ? String(val).trim() : val;
          },
          z.string().min(1, { message: "Distributor Code is required" })
        ),
        "Distributed from Location Country": z.union([
          z.number().transform((val) => val.toString()),
          z.string().min(1, {
            message: "Distributed from Location Country is required",
          }),
        ]),
        "Distributed from Location Pincode": z
          .union([z.number().transform((val) => String(val)), z.string()])
          .pipe(
            z
              .string()
              .min(1, {
                message: "Distributed from Location Pincode is required",
              })
              .regex(/^[A-Za-z0-9\-\s/]+$/, {
                message:
                  "Distributed from Location Pincode must contain only letters, numbers, spaces, hyphens, and slashes",
              })
              .transform((val) => val.trim()) // Remove leading/trailing spaces
          ),
        "Distributed to Location Country": z.union([
          z.number().transform((val) => val.toString()),
          z.string().min(1, {
            message: "Distributed to Location Country is required",
          }),
        ]),
        "Distributed to Location Pincode": z
          .union([z.number().transform((val) => String(val)), z.string()])
          .pipe(
            z
              .string()
              .min(1, {
                message: "Distributed to Location Pincode is required",
              })
              .regex(/^[A-Za-z0-9\-\s/]+$/, {
                message:
                  "Distributed to Location Pincode must contain only letters, numbers, spaces, hyphens, and slashes",
              })
              .transform((val) => val.trim()) // Remove leading/trailing spaces
          ),
        "Mode of Transport": z
          .string()
          .min(1, { message: "Mode of Transport is required" })
          .refine(
            (val) =>
              val === "Rail" || val === "Air" || val === "Water" || val === "",
            {
              message: "Mode of Transport can only be Rail,Air or Water",
            }
          ),
        "Type of Fuel Used": z.string().optional(),
        "Total Distance Travelled": z.union([z.number(), z.string()]).refine(
          (val) => {
            if (typeof val === "string") {
              return val.length === 0;
            }
            return typeof val === "number";
          },
          {
            message: "Invalid Value: Data should be Numeric",
          }
        ),
        "Total Distance Travelled UoM": z.string().optional(),
      })
      .refine(
        ({ Year, Month }) => {
          let fullNameMonth = months.filter(
            (month) => sanitizeString.v1(month) == sanitizeString.v1(Month)
          );
          if (fullNameMonth.length > 0) {
            yearMonthError = validateMonthYear(
              Month,
              Year,
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
      )
      .refine(
        (data) =>
          !data["Total Distance Travelled"] ||
          data["Total Distance Travelled UoM"],
        () => ({
          message:
            "Total Distance Travelled UoM is required if Total Distance Travelled is given",
          path: ["Total Distance Travelled UoM"],
        })
      )
      .refine(
        (data) =>
          !data["Total Distance Travelled UoM"] ||
          data["Total Distance Travelled"],
        () => ({
          message:
            "Total Distance Travelled is required if Total Distance Travelled UoM is given",
          path: ["Total Distance Travelled"],
        })
      );
  }
};

//#region Excel Template Validation
export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
  let errorMessageData: TTemplateErrorData[] = [];
  // validate sheets and column names
  let sheetswithData: number = excelData.filter(
    (errorItem) => errorItem.data.length > 0
  ).length;
  if (sheetswithData > 0) {
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
        "Enter data in atleast one of the sheets " +
        excelData.map((item) => item.sheetName),
    });
  }
  return errorMessageData;
};
//#endregion

//#region Zod Validation
const validateTransportDownstreamSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeParseData: any = transportDownstream(
      baseMonth,
      baseYear,
      sheet.sheetName
    ).safeParse(item);
    if (!safeParseData.success) {
      columnObject["Row Number"] = index;
      TransportDownstreamExcelConstant.excel_template.sheets
        .filter(
          (sheetItem) =>
            sanitizeString.v1(sheetItem.name) ==
            sanitizeString.v1(sheet.sheetName)
        )[0]
        .columns.forEach((columnItem) => {
          safeParseData.error.issues.forEach(
            (issueItem: Record<string, string>) => {
              if (!!columnObject[columnItem.name]) {
                return;
              }
              if (columnItem.name == issueItem.path[0]) {
                columnObject[columnItem.name] = issueItem.message;
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
  TTransportDownstreamSheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Downstream - Road": validateTransportDownstreamSheet,
  "Downstream - Rail_Air_Water": validateTransportDownstreamSheet,
};
const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TTransportDownstreamSheetNames]: Record<
      TTransportDownstreamSheetColumnNames,
      any
    >[];
  } = {
    "Downstream - Road": [],
    "Downstream - Rail_Air_Water": [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TTransportDownstreamSheetNames;
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

//#region Master Db Validation
const validateTransportDownstreamDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[],
  UomMasterData: UomMaster[]
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  if (sheet.sheetName === TTransportDownstreamSheetTemplate.RoadBased) {
    sheet.data.forEach((dataItem: Record<string, string>) => {
      let errorEntries: TErrorExcelSheet[] = [];
      index++;
      if (dataItem["Type of Fuel Used"] !== "") {
        const errorEntriesForModeOfTransport_groupCheck =
          validateActivityMasterDataGroupByKey(
            ActivityMasterData,
            "Road",
            `${dataItem["Type of Fuel Used"]}`,
            index,
            "transport_downstream_fuel_used",
            "Type of Fuel Used",
            ApiHitType.Excel,
            "transport_downstream_mode_of_transport"
          );
        if (errorEntriesForModeOfTransport_groupCheck.length > 0) {
          errorEntries.push({
            ...errorEntriesForModeOfTransport_groupCheck[0],
          });
        }
      }
      if (!!dataItem["Total Distance Travelled UoM"]) {
        const errorEntriesForTransportMode = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Total Distance Travelled UoM"],
          index,
          "transport_downstream_Distance_per_Trip_UOM",
          "Total Distance Travelled UoM",
          ApiHitType.Excel
        );
        if (errorEntriesForTransportMode.length > 0) {
          errorEntries.push({ ...errorEntriesForTransportMode[0] });
        }
      }
      if (errorEntries.length > 0) {
        let allColumns: any =
          TransportDownstreamExcelConstant.excel_template.sheets.filter(
            (sheetItem) =>
              sanitizeString.v1(sheetItem.name) ==
              sanitizeString.v1(sheet.sheetName)
          )[0].columns;
        const errorRow = createErrorDataForExcel(allColumns, errorEntries);
        sheetAllErrorEntries.push(errorRow[0]);
      }
    });
  } else {
    sheet.data.forEach((dataItem: Record<string, string>) => {
      let errorEntries: TErrorExcelSheet[] = [];
      index++;
      if (!!dataItem["Mode of Transport"]) {
        const errorEntriesForTransportMode = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Mode of Transport"],
          index,
          "transport_downstream_mode_of_transport",
          "Mode of Transport",
          ApiHitType.Excel
        );
        if (errorEntriesForTransportMode.length > 0) {
          errorEntries.push({ ...errorEntriesForTransportMode[0] });
        } else {
          if (!!dataItem["Type of Fuel Used"]) {
            const errorEntriesForModeOfTransport_groupCheck =
              validateActivityMasterDataGroupByKey(
                ActivityMasterData,
                dataItem["Mode of Transport"],
                dataItem["Type of Fuel Used"],
                index,
                "transport_downstream_fuel_used",
                "Type of Fuel Used",
                ApiHitType.Excel,
                "transport_downstream_mode_of_transport"
              );
            if (errorEntriesForModeOfTransport_groupCheck.length > 0) {
              errorEntries.push({
                ...errorEntriesForModeOfTransport_groupCheck[0],
              });
            }
          }
        }
      }

      if (!!dataItem["Total Distance Travelled UoM"]) {
        const errorEntriesForTransportMode = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Total Distance Travelled UoM"],
          index,
          "transport_downstream_Distance_per_Trip_UOM",
          "Total Distance Travelled UoM",
          ApiHitType.Excel
        );
        if (errorEntriesForTransportMode.length > 0) {
          errorEntries.push({ ...errorEntriesForTransportMode[0] });
        }
      }
      if (errorEntries.length > 0) {
        let allColumns: any =
          TransportDownstreamExcelConstant.excel_template.sheets.filter(
            (sheetItem) =>
              sanitizeString.v1(sheetItem.name) ==
              sanitizeString.v1(sheet.sheetName)
          )[0].columns;
        const errorRow = createErrorDataForExcel(allColumns, errorEntries);
        sheetAllErrorEntries.push(errorRow[0]);
      }
    });
  }

  return sheetAllErrorEntries;
};
const validateSheetMasterDataMethods: Record<
  TTransportDownstreamSheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[],
    UomMasterData: UomMaster[]
  ) => Record<string, any>[]
> = {
  "Downstream - Road": validateTransportDownstreamDataSheet,
  "Downstream - Rail_Air_Water": validateTransportDownstreamDataSheet,
};

const validateDataByDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.transport_downstream,
  });
  const uomMasterData = await sdk.getUOMMasterdata();

  const failedEntries: {
    [key in TTransportDownstreamSheetNames]: Record<
      TTransportDownstreamSheetColumnNames,
      any
    >[];
  } = {
    "Downstream - Road": [],
    "Downstream - Rail_Air_Water": [],
  };

  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TTransportDownstreamSheetNames;
    failedEntries[sheetName] = validateSheetMasterDataMethods[sheetName](
      sheet,
      activityMasterData?.ActivityMaster,
      uomMasterData?.UomMaster as []
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
  organizationAddressId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];

  const zodErrorEntries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    organizationId
  );
  const masterErrorEntries: TExcelSheet[] = await validateDataByDb(
    excelData,
    organizationId
  );

  allError = combineAllErrorSheets(zodErrorEntries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);

  return finalError;
};
