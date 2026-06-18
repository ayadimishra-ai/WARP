import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  ApiHitType,
  YearMonthSchema,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  validateActivityMasterDataByKey,
  type TActivityMasterData,
  type TErrorExcelSheet,
  type TExcelSheet,
  type TTemplateErrorData,
} from "~/lib/excel/excel.service";
import {
  validateColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import { toTitleCase } from "~/lib/shared/constants/input.constant";
import {
  TTransportEmployeeTravelActivitySheetColumnNames,
  TTransportEmployeeTravelActivitySheetNames,
  TransportEmployeeTravelActivityConstant,
} from "~/shared/constants/activity.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import { toNumber } from "~/utils/data-transformer.util";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } =
  TransportEmployeeTravelActivityConstant.excel_template;
///zod validation
export const employeeTravelDataValidationSchema = (
  baseMonth: string,
  baseYear: number
) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Percentage of Employees Travelled by company owned Bus": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine((val) => (val === null ? true : val <= 100), {
          message: "Value cannot be more than 100",
        }),

      "Average Daily Distance Travelled by Office Bus": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine(
          (q) => (q === null ? true : toNumber(q) >= 0),
          "Invalid data format"
        )
        .optional()
        .or(z.literal("")),

      UoM_CompBus: z.unknown().optional(),

      "Percentage of Employees Travelled by Public Transport/Company contracted - Bus":
        z
          .unknown()
          .nullable()
          .transform((val) => (val === "" ? null : toNumber(val)))
          .refine((val) => (val === null ? true : val <= 100), {
            message: "Value cannot be more than 100",
          }),
      "Average Daily Distance Travelled by Public Transport - Bus": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine(
          (q) => (q === null ? true : toNumber(q) >= 0),
          "Invalid data format"
        )
        .optional()
        .or(z.literal("")),

      UoM_PubBus: z.unknown().optional(),

      "Percentage of Employees Travelled by Public Transport - 4 Wheeler": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine((val) => (val === null ? true : val <= 100), {
          message: "Value cannot be more than 100",
        }),

      "Average Daily Distance Travelled by Public Transport - 4 Wheeler": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine(
          (q) => (q === null ? true : toNumber(q) >= 0),
          "Invalid data format"
        )
        .optional()
        .or(z.literal("")),

      UoM_4PubWheel: z.unknown().optional(),

      "Percentage of Employees Travelled by Public Transport - 3 Wheeler": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine((val) => (val === null ? true : val <= 100), {
          message: "Value cannot be more than 100",
        }),

      "Average Daily Distance Travelled by Public Transport - 3 Wheeler": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine(
          (q) => (q === null ? true : toNumber(q) >= 0),
          "Invalid data format"
        )
        .optional()
        .or(z.literal("")),

      UoM_3PubWheel: z.unknown().optional(),

      "Percentage of Employees Travelled by Private Vehicle - 4 Wheeler": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine((val) => (val === null ? true : val <= 100), {
          message: "Value cannot be more than 100",
        }),

      "Average Daily Distance Travelled by Private Vehicle - 4 Wheeler": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine(
          (q) => (q === null ? true : toNumber(q) >= 0),
          "Invalid data format"
        )
        .optional()
        .or(z.literal("")),

      UoM_4PvtWheel: z.unknown().optional(),
      "Percentage of Employees Travelled by Private Vehicle - 2 Wheeler": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine((val) => (val === null ? true : val <= 100), {
          message: "Value cannot be more than 100",
        }),
      "Average Daily Distance Travelled (in kms) by Private Vehicle - 2 Wheeler":
        z
          .unknown()
          .nullable()
          .transform((val) => (val === "" ? null : toNumber(val)))
          .refine(
            (q) => (q === null ? true : toNumber(q) >= 0),
            "Invalid data format"
          )
          .optional()
          .or(z.literal("")),

      UoM_2PvtWheel: z.string().optional(),

      "Percentage of Employees Travelled by Rail - Suburban": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine((val) => (val === null ? true : val <= 100), {
          message: "Value cannot be more than 100",
        }),
      //.optional(),

      "Average Daily Distance Travelled by Rail - Suburban": z
        .unknown()
        .nullable()
        .transform((val) => (val === "" ? null : toNumber(val)))
        .refine(
          (q) => (q === null ? true : toNumber(q) >= 0),
          "Invalid data format"
        )
        .optional()
        .or(z.literal("")),

      UoM_rail: z.unknown().optional(),
    })
    .refine(
      ({ Year, Month, ...rest }) => {
        const values = Object.values(rest);
        const allNullOrEmpty = values.every((val) => {
          return val === null || val === "";
        });

        return !allNullOrEmpty;
      },
      {
        message: "No data found",
        path: ["Percentage of Employees Travelled by company owned Bus"],
      }
    )
    .refine(
      (val) => {
        if (val["Average Daily Distance Travelled by Office Bus"] !== null) {
          if (
            val["Percentage of Employees Travelled by company owned Bus"] ==
            null
          ) {
            return false;
          }
        }
        return true;
      },
      {
        message: "This field is required",
        path: ["Percentage of Employees Travelled by company owned Bus"],
      }
    )
    .refine(
      (val) => {
        if (val["Average Daily Distance Travelled by Office Bus"] !== null) {
          if (
            val.UoM_CompBus === "" ||
            val.UoM_CompBus === null ||
            !["Kilometer", "Mile"].includes(String(val.UoM_CompBus))
          ) {
            return false;
          }
        }
        return true;
      },
      (val) => {
        return {
          message:
            val.UoM_CompBus === "" || val.UoM_CompBus === null
              ? "This field is required"
              : "Expected 'Kilometer' or 'Mile",
          path: ["UoM_CompBus"],
        };
      }
    )
    .refine(
      (val) => {
        if (
          val["Average Daily Distance Travelled by Public Transport - Bus"] !==
          null
        ) {
          if (
            val[
              "Percentage of Employees Travelled by Public Transport/Company contracted - Bus"
            ] == null
          ) {
            return false;
          }
        }
        return true;
      },
      {
        message: "This field is required",
        path: [
          "Percentage of Employees Travelled by Public Transport/Company contracted - Bus",
        ],
      }
    )
    .refine(
      (val) => {
        if (
          val["Average Daily Distance Travelled by Public Transport - Bus"] !==
          null
        ) {
          if (
            val.UoM_PubBus === "" ||
            val.UoM_PubBus === null ||
            !["Kilometer", "Mile"].includes(String(val.UoM_PubBus))
          ) {
            return false;
          }
        }
        return true;
      },
      (val) => {
        return {
          message:
            val.UoM_PubBus === "" || val.UoM_PubBus === null
              ? "This field is required"
              : "Expected 'Kilometer' or 'Mile",
          path: ["UoM_PubBus"],
        };
      }
    )
    .refine(
      (val) => {
        if (
          val[
            "Average Daily Distance Travelled by Public Transport - 4 Wheeler"
          ] !== null
        ) {
          if (
            val[
              "Percentage of Employees Travelled by Public Transport - 4 Wheeler"
            ] == null
          ) {
            return false;
          }
        }
        return true;
      },
      {
        message: "This field is required",
        path: [
          "Percentage of Employees Travelled by Public Transport - 4 Wheeler",
        ],
      }
    )
    .refine(
      (val) => {
        if (
          val[
            "Average Daily Distance Travelled by Public Transport - 4 Wheeler"
          ] !== null
        ) {
          if (
            val.UoM_4PubWheel === "" ||
            val.UoM_4PubWheel === null ||
            !["Kilometer", "Mile"].includes(String(val.UoM_4PubWheel))
          ) {
            return false;
          }
        }
        return true;
      },
      (val) => {
        return {
          message:
            val.UoM_4PubWheel === "" || val.UoM_4PubWheel === null
              ? "This field is required"
              : "Expected 'Kilometer' or 'Mile",
          path: ["UoM_4PubWheel"],
        };
      }
    )

    .refine(
      (val) => {
        if (
          val[
            "Average Daily Distance Travelled by Public Transport - 3 Wheeler"
          ] !== null
        ) {
          if (
            val[
              "Percentage of Employees Travelled by Public Transport - 3 Wheeler"
            ] == null
          ) {
            return false;
          }
        }
        return true;
      },
      {
        message: "This field is required",
        path: [
          "Percentage of Employees Travelled by Public Transport - 3 Wheeler",
        ],
      }
    )
    .refine(
      (val) => {
        if (
          val[
            "Average Daily Distance Travelled by Public Transport - 3 Wheeler"
          ] !== null
        ) {
          if (
            val.UoM_3PubWheel === "" ||
            val.UoM_3PubWheel === null ||
            !["Kilometer", "Mile"].includes(String(val.UoM_3PubWheel))
          ) {
            return false;
          }
        }
        return true;
      },
      (val) => {
        return {
          message:
            val.UoM_3PubWheel === "" || val.UoM_3PubWheel === null
              ? "This field is required"
              : "Expected 'Kilometer' or 'Mile",
          path: ["UoM_3PubWheel"],
        };
      }
    )
    .refine(
      (val) => {
        if (
          val[
            "Average Daily Distance Travelled by Private Vehicle - 4 Wheeler"
          ] !== null
        ) {
          if (
            val[
              "Percentage of Employees Travelled by Private Vehicle - 4 Wheeler"
            ] == null
          ) {
            return false;
          }
        }
        return true;
      },
      {
        message: "This field is required",
        path: [
          "Percentage of Employees Travelled by Private Vehicle - 4 Wheeler",
        ],
      }
    )
    .refine(
      (val) => {
        if (
          val[
            "Average Daily Distance Travelled by Private Vehicle - 4 Wheeler"
          ] !== null
        ) {
          if (
            val.UoM_4PvtWheel === "" ||
            val.UoM_4PvtWheel === null ||
            !["Kilometer", "Mile"].includes(String(val.UoM_4PvtWheel))
          ) {
            return false;
          }
        }
        return true;
      },
      (val) => {
        return {
          message:
            val.UoM_4PvtWheel === "" || val.UoM_4PvtWheel === null
              ? "This field is required"
              : "Expected 'Kilometer' or 'Mile",
          path: ["UoM_4PvtWheel"],
        };
      }
    )
    .refine(
      (val) => {
        if (
          val[
            "Average Daily Distance Travelled (in kms) by Private Vehicle - 2 Wheeler"
          ] !== null
        ) {
          if (
            val[
              "Percentage of Employees Travelled by Private Vehicle - 2 Wheeler"
            ] == null
          ) {
            return false;
          }
        }
        return true;
      },
      {
        message: "This field is required",
        path: [
          "Percentage of Employees Travelled by Private Vehicle - 2 Wheeler",
        ],
      }
    )
    .refine(
      (val) => {
        if (
          val[
            "Average Daily Distance Travelled (in kms) by Private Vehicle - 2 Wheeler"
          ] !== null
        ) {
          if (
            val.UoM_2PvtWheel === "" ||
            val.UoM_2PvtWheel === null ||
            !["Kilometer", "Mile"].includes(String(val.UoM_2PvtWheel))
          ) {
            return false;
          }
        }
        return true;
      },
      (val) => {
        return {
          message:
            val.UoM_2PvtWheel === "" || val.UoM_2PvtWheel === null
              ? "This field is required"
              : "Expected 'Kilometer' or 'Mile",
          path: ["UoM_2PvtWheel"],
        };
      }
    )
    .refine(
      (val) => {
        if (
          val["Average Daily Distance Travelled by Rail - Suburban"] !== null
        ) {
          if (
            val["Percentage of Employees Travelled by Rail - Suburban"] == null
          ) {
            return false;
          }
        }
        return true;
      },
      {
        message: "This field is required",
        path: ["Percentage of Employees Travelled by Rail - Suburban"],
      }
    )
    .refine(
      (val) => {
        if (
          val["Average Daily Distance Travelled by Rail - Suburban"] !== null
        ) {
          if (
            val.UoM_rail === "" ||
            val.UoM_rail === null ||
            !["Kilometer", "Mile"].includes(String(val.UoM_rail))
          ) {
            return false;
          }
        }
        return true;
      },
      (val) => {
        return {
          message:
            val.UoM_rail === "" || val.UoM_rail === null
              ? "This field is required"
              : "Expected 'Kilometer' or 'Mile",
          path: ["UoM_rail"],
        };
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
//#region TEmplate Validation
export const validateEmployeeTravelExcelTemplate = (
  excelData: TExcelSheet[]
) => {
  let errorMessageData: TTemplateErrorData[] = [];
  const sheets = TransportEmployeeTravelActivityConstant.excel_template.sheets;
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
          sheet: "Employee Travel",
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
//#region  zod Validation starts
const validateEmployeeTravelSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = employeeTravelDataValidationSchema(
      baseMonth,
      baseYear
    ).safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      TransportEmployeeTravelActivityConstant.excel_template.sheets
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
  TTransportEmployeeTravelActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Employee Travel": validateEmployeeTravelSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TTransportEmployeeTravelActivitySheetNames]: Record<
      TTransportEmployeeTravelActivitySheetColumnNames,
      any
    >[];
  } = { "Employee Travel": [] };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TTransportEmployeeTravelActivitySheetNames;
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
const validateEmployeeTravelDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  let index: number = 0;
  const sheetAllerrorEntries: Record<string, string>[] = [];
  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data

    if (dataItem["Average Daily Distance Travelled by Office Bus"]) {
      const errorEntriesColumn2Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_CompBus"],
        index,
        "transport_employee_travel_distance_traveled_uom",
        "UoM_CompBus",
        ApiHitType.Excel
      );
      if (errorEntriesColumn2Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn2Data[0] });
      }
    }

    if (
      dataItem["Average Daily Distance Travelled by Public Transport - Bus"]
    ) {
      const errorEntriesColumn3Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_PubBus"],
        index,
        "transport_employee_travel_distance_traveled_uom",
        "UoM_PubBus",
        ApiHitType.Excel
      );
      if (errorEntriesColumn3Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn3Data[0] });
      }
    }

    if (
      dataItem[
        "Average Daily Distance Travelled by Public Transport - 4 Wheeler"
      ]
    ) {
      const errorEntriesColumn4Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_4PubWheel"],
        index,
        "transport_employee_travel_distance_traveled_uom",
        "UoM_4PubWheel",
        ApiHitType.Excel
      );
      if (errorEntriesColumn4Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn4Data[0] });
      }
    }

    if (
      dataItem[
        "Average Daily Distance Travelled by Public Transport - 3 Wheeler"
      ]
    ) {
      const errorEntriesColumn5Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_3PubWheel"],
        index,
        "transport_employee_travel_distance_traveled_uom",
        "UoM_3PubWheel",
        ApiHitType.Excel
      );
      if (errorEntriesColumn5Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn5Data[0] });
      }
    }

    if (
      dataItem[
        "Average Daily Distance Travelled by Private Vehicle - 4 Wheeler"
      ]
    ) {
      const errorEntriesColumn6Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_4PvtWheel"],
        index,
        "transport_employee_travel_distance_traveled_uom",
        "UoM_4PvtWheel",
        ApiHitType.Excel
      );
      if (errorEntriesColumn6Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn6Data[0] });
      }
    }

    if (
      dataItem[
        "Average Daily Distance Travelled (in kms) by Private Vehicle - 2 Wheeler"
      ]
    ) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_2PvtWheel"],
        index,
        "transport_employee_travel_distance_traveled_uom",
        "UoM_2PvtWheel",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (dataItem["Average Daily Distance Travelled by Rail - Suburban"]) {
      const errorEntriesColumn7Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_rail"],
        index,
        "transport_employee_travel_distance_traveled_uom",
        "UoM_rail",
        ApiHitType.Excel
      );
      if (errorEntriesColumn7Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn7Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        TransportEmployeeTravelActivityConstant.excel_template.sheets.filter(
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
  TTransportEmployeeTravelActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Employee Travel": validateEmployeeTravelDataSheet,
};

const validateDatabyDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.transport_employee_travel,
  });
  const failedEntries: {
    [key in TTransportEmployeeTravelActivitySheetNames]: Record<
      TTransportEmployeeTravelActivitySheetColumnNames,
      any
    >[];
  } = { "Employee Travel": [] };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TTransportEmployeeTravelActivitySheetNames;
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

//#region Specification Data Validation
const validateGeneralDataSheet = async (
  excelData: TExcelSheet,
  organizationAddressId: string
) => {
  let sheetAllerrorEntries: Record<string, string>[] = [];
  const uniqueYearMonthComb = new Set(
    excelData.data.map((record: any, index) => ({
      combination: `${toTitleCase(sanitizeString.v1(String(record?.Month ?? "")))} ${record.Year}`,
      rowIndex: index + 1,
    }))
  );
  const whereCondition: Record<string, any>[] = [];

  uniqueYearMonthComb.forEach((combinations) => {
    whereCondition.push({
      _and: {
        organization_address_id: { _eq: organizationAddressId },
        Month_Year: { _eq: combinations.combination },
        Number_Employees: { _gt: 0 },
      },
    });
  });

  const allWhere = whereCondition;
  const batchSize = 2000; // Define your batch size
  const sdk = await getGraphQlServerSDK();
  const response: any = {
    GHGGeneralDetails: [],
  };
  const processBatch = async (whereBatch: any[]): Promise<any> => {
    return await sdk.getGHGGeneralDetailsData({
      where: { _or: whereBatch },
    });
  };
  for (let i = 0; i < allWhere.length; i += batchSize) {
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(whereBatch);
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.GHGGeneralDetails = [
      ...response.GHGGeneralDetails,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.GHGGeneralDetails,
    ];
  }

  const invalidMontYear = Array.from(uniqueYearMonthComb).filter(
    (obj1) =>
      !response.GHGGeneralDetails.some(
        (obj2: any) =>
          sanitizeString.v1(obj1.combination) ===
          sanitizeString.v1(obj2.Month_Year)
      )
  );

  if (invalidMontYear.length > 0) {
    const validations: TErrorExcelSheet[] = [];
    invalidMontYear.forEach((errorEntry) => {
      validations.push(
        {
          column: "Percentage of Employees Travelled by company owned Bus",
          row: errorEntry.rowIndex,
          errorMessage:
            "Number of employees is not entered under General Details",
        },
        {
          column:
            "Percentage of Employees Travelled by Public Transport/Company contracted - Bus",
          row: errorEntry.rowIndex,
          errorMessage:
            "Number of employees is not entered under General Details",
        },
        {
          column:
            "Percentage of Employees Travelled by Public Transport - 4 Wheeler",
          row: errorEntry.rowIndex,
          errorMessage:
            "Number of employees is not entered under General Details",
        },
        {
          column:
            "Percentage of Employees Travelled by Public Transport - 3 Wheeler",
          row: errorEntry.rowIndex,
          errorMessage:
            "Number of employees is not entered under General Details",
        },
        {
          column:
            "Percentage of Employees Travelled by Private Vehicle - 4 Wheeler",
          row: errorEntry.rowIndex,
          errorMessage:
            "Number of employees is not entered under General Details",
        },
        {
          column:
            "Percentage of Employees Travelled by Private Vehicle - 2 Wheeler",
          row: errorEntry.rowIndex,
          errorMessage:
            "Number of employees is not entered under General Details",
        },
        {
          column: "Percentage of Employees Travelled by Rail - Suburban",
          row: errorEntry.rowIndex,
          errorMessage:
            "Number of employees is not entered under General Details",
        }
      );
    });
    let allcolumns: any =
      TransportEmployeeTravelActivityConstant.excel_template.sheets.filter(
        (sheetitem) =>
          sanitizeString.v1(sheetitem.name) ==
          sanitizeString.v1(excelData.sheetName)
      )[0].columns;
    sheetAllerrorEntries = createErrorDataForExcel(allcolumns, validations);
  }

  return sheetAllerrorEntries;
};
const validateSheetSpecificationMethods: Record<
  TTransportEmployeeTravelActivitySheetNames,
  (
    sheet: TExcelSheet,
    organizationAddressId: string
  ) => Promise<Record<string, any>[]>
> = {
  "Employee Travel": async (sheet, organizationAddressId) => {
    return await validateGeneralDataSheet(sheet, organizationAddressId);
  },
};

const validateWithGeneralDetailsData = async (
  excelData: TExcelSheet[],
  organizationAddressId: string
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TTransportEmployeeTravelActivitySheetNames]: Record<
      TTransportEmployeeTravelActivitySheetColumnNames,
      any
    >[];
  } = { "Employee Travel": [] };
  let errorData: any = null;
  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TTransportEmployeeTravelActivitySheetNames;
    errorData = await validateSheetSpecificationMethods[sheetName](
      excelData[i],
      organizationAddressId
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: errorData,
    });
  }
  return excelSheetData;
};
//#endregion

export const validateEmployeeTravelExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID,
  organizationAddressId: string
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];

  const specificationerrorEntries: TExcelSheet[] =
    await validateWithGeneralDetailsData(excelData, organizationAddressId);

  const zodErrorEnteries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    organizationId
  );

  const masterErrorEntries: TExcelSheet[] = await validateDatabyDb(
    excelData,
    organizationId
  );

  allError = combineAllErrorSheets(specificationerrorEntries, allError);
  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};
