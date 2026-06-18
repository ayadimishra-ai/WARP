import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  ApiHitType,
  TActivityMasterData,
  TTemplateErrorData,
  YearMonthSchema,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  validateActivityMasterDataByKey,
  validateActivityMasterDataGroupByKey,
  type TErrorExcelSheet,
  type TExcelSheet,
} from "@/modules/ghg/lib/excel/excel.service";

import {
  validateColumnNames,
  validateSheetName,
} from "@/modules/ghg/lib/excel/excel.validation";

import {
  TTransport_Business_TravelActivitySheetColumnNames,
  TTransport_Business_TravelActivitySheetNames,
  Transport_Business_TravelActivityConstant,
} from "@/modules/ghg/shared/constants/activity.constant";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";
import { toNumber } from "@/modules/ghg/utils/data-transformer.util";
import { months, validateMonthYear } from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
let yearMonthError: TErrorExcelSheet[] = [];
const Transport_Business_TravelSchema = (
  baseMonth: string,
  baseYear: number
) => {
  return YearMonthSchema(baseYear)
    .extend({
      /*"Trip Start Location Pincode": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Value is invalid")
        .transform(toNumber),*/
      "Trip Start Location Pincode": z
        .union([z.number().transform((val) => String(val)), z.string()])
        .pipe(
          z
            .string()
            .min(1, { message: "Trip Start Location Pincode is required" })
            .regex(/^[A-Za-z0-9\-\s/]+$/, {
              message:
                "Trip Start Location Pincode must contain only letters, numbers, spaces, hyphens, and slashes",
            })
            .transform((val) => val.trim()) // Remove leading/trailing spaces
        ),
      "Trip Start Location Country": z
        .string()
        .min(1, { message: "Trip Start Location Country is required" }),
      /*"Trip End Location Pincode": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Value is invalid")
        .transform(toNumber),*/
      "Trip End Location Pincode": z
        .union([z.number().transform((val) => String(val)), z.string()])
        .pipe(
          z
            .string()
            .min(1, { message: "Trip End Location Pincode is required" })
            .regex(/^[A-Za-z0-9\-\s/]+$/, {
              message:
                "Trip End Location Pincode must contain only letters, numbers, spaces, hyphens, and slashes",
            })
            .transform((val) => val.trim()) // Remove leading/trailing spaces
        ),
      "Trip End Location Country": z
        .string()
        .min(1, { message: "Trip End Location Country is required" }),
      "Number Of Employees": z
        .unknown()
        .refine((q) => toNumber(q) > 0, "Value is invalid")
        .transform(toNumber),
      "Mode of Transport": z
        .string()
        .min(1, { message: "Mode of Transport is required" }),
      "Vehicle Type Used": z
        .string()
        .min(1, { message: "Vehicle Type Used is required" }),
      "Fuel Used": z.string().min(1, { message: "Fuel Used is required" }),
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
        if (
          sanitizeString.v1(
            String(allcolumns["Trip Start Location Pincode"])
          ) ==
          sanitizeString.v1(String(allcolumns["Trip End Location Pincode"]))
        ) {
          if (
            sanitizeString.v3(String(allcolumns["Mode of Transport"])) != "road"
          ) {
            return false;
          }
          return true;
        }
        return true;
      },
      {
        message: "From and to location can't be same",
        path: ["Trip Start Location Pincode"],
      }
    );
};

const { sheets: templateSheets } =
  Transport_Business_TravelActivityConstant.excel_template;

export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
  let errorMessageData: TTemplateErrorData[] = [];
  const sheets =
    Transport_Business_TravelActivityConstant.excel_template.sheets;
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
            } else {
              if (sheetData.data.length > 10000) {
                errorMessageData.push({
                  sheet: templateSheet.name,
                  error_message:
                    "Maximum 10,000 records can be uploaded at a time",
                });
              }
            }
          }
        });
      } else {
        errorMessageData.push({
          sheet: "Business Travel",
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

//#region Zod Validation
const validateBusinessTravelSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = Transport_Business_TravelSchema(
      baseMonth,
      baseYear
    ).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      Transport_Business_TravelActivityConstant.excel_template.sheets
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
  TTransport_Business_TravelActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Business Travel": validateBusinessTravelSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TTransport_Business_TravelActivitySheetNames]: Record<
      TTransport_Business_TravelActivitySheetColumnNames,
      any
    >[];
  } = { "Business Travel": [] };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TTransport_Business_TravelActivitySheetNames;
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

//#region  Master Data Validation
const validateBusinessTravelDataSheet = (
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
      dataItem["Mode of Transport"],
      index,
      "transport_business_travel_mode_of_transport",
      "Mode of Transport",
      ApiHitType.Excel
    );
    if (errorEntriesColumn1Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn1Data[0] });
    } else {
      const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
        ActivityMasterData,
        dataItem["Mode of Transport"],
        dataItem["Vehicle Type Used"],
        index,
        "transport_business_travel_vehicle_type",
        "Vehicle Type Used",
        ApiHitType.Excel,
        "transport_business_travel_mode_of_transport"
      );
      if (errorEntriesColumn2Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn2Data[0] });
      } else {
        const errorEntriesColumn3Data = validateActivityMasterDataGroupByKey(
          ActivityMasterData,
          dataItem["Mode of Transport"],
          dataItem["Fuel Used"],
          index,
          "transport_business_travel_fuel_used",
          "Fuel Used",
          ApiHitType.Excel,
          "transport_business_travel_mode_of_transport"
        );
        if (errorEntriesColumn3Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn3Data[0] });
        }
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        Transport_Business_TravelActivityConstant.excel_template.sheets.filter(
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
  TTransport_Business_TravelActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Business Travel": validateBusinessTravelDataSheet,
};

const validateDatabyDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.transport_business_travel,
  });
  const failedEntries: {
    [key in TTransport_Business_TravelActivitySheetNames]: Record<
      TTransport_Business_TravelActivitySheetColumnNames,
      any
    >[];
  } = { "Business Travel": [] };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TTransport_Business_TravelActivitySheetNames;
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
  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};
