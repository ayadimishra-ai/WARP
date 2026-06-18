import { UUID } from "crypto";
import { z } from "zod";
import { getAccociatedBuyers } from "~/components/activity-data-records/activity-data-records-server-action";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  BuyerSupplierAddressMappings,
  UomMaster,
} from "~/graphql/shared/types";
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
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import {
  BuyerShareAttributionActivityConstant,
  BuyerShareAttributionMainActivityConstant,
} from "~/shared/constants/activity.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

let yearMonthError: TErrorExcelSheet[] = [];

export const by_mass = "by_mass";
export const by_volume = "by_volume";
export const by_revenue = "by_revenue";
export const by_number_of_units = "by_number_of_units";

const { sheets: templateSheets } =
  BuyerShareAttributionActivityConstant.excel_template;

export const validateExcelTemplate = (
  excelData: TExcelSheet[],
  buyerShareMethod: string
) => {
  let errorMessageData: TTemplateErrorData[] = [];
  // validate sheets and column names
  let sheetswithOutData: number = excelData.filter(
    (errorItem) => errorItem.data.length > 0
  ).length;
  if (sheetswithOutData > 0) {
    templateSheets.forEach((templateSheet) => {
      if (templateSheet?.code?.toLocaleLowerCase() === buyerShareMethod) {
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
  } else {
    errorMessageData.push({
      sheet: "",
      error_message:
        "Enter data in sheet " +
        templateSheets?.find(
          (sheet) => sheet.code?.toLowerCase() === buyerShareMethod
        )?.name,
    });
  }
  return errorMessageData;
};

export type TBuyerShareAttributionSheetNames =
  (typeof BuyerShareAttributionActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TBuyerShareAttributionMainSheetNames =
  (typeof BuyerShareAttributionMainActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TBuyerShareAttributionSheetColumnNames =
  (typeof BuyerShareAttributionActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export const TBuyerShareAttributionSheetTemplate = {
  byMass: "By Mass",
  totalMass: "Total Mass",
  byVolume: "By Volume",
  totalVolume: "Total Volume",
  byRevenue: "By Revenue",
  totalRevenue: "Total Revenue",
  byNumberOfUnits: "By Number of Units",
  totalNumberOfUnits: "Total Number of Units",
} as const;

export const TBuyerShareAttributionMainSheetTemplate = {
  byMass: "By Mass",
  byVolume: "By Volume",
  byRevenue: "By Revenue",
  byNumberOfUnits: "By Number of Units",
} as const;

const validateCommonFields = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear).extend({
    "Buyer Name": z
      .string({
        required_error: "Buyer Name is required",
        invalid_type_error: "The buyer name entered is invalid",
      })
      .min(1, { message: "Buyer Name is required" }),
    // "Supplier Location Code": z
    //   .string()
    //   .min(1, { message: "Supplier Location Code is required" }),
  });
};

const buyerShareAttributionValidationSchema = (
  baseMonth: string,
  baseYear: number,
  sheetName: string,
  buyerShareMethod: string
) => {
  const currentSheet =
    BuyerShareAttributionActivityConstant?.excel_template?.sheets?.find(
      (sheet) => sheet.name === sheetName
    );
  const currentSheetCode = currentSheet?.code?.toLowerCase();

  // By Mass
  if (
    sheetName === TBuyerShareAttributionSheetTemplate.byMass &&
    currentSheetCode === buyerShareMethod
  ) {
    return validateCommonFields(baseMonth, baseYear)
      .extend({
        "Mass of Products Purchased by Buyer": z.number({
          required_error: "Mass of Products Purchased by Buyer is required",
          invalid_type_error:
            "Mass of Products Purchased by Buyer should be a number",
        }),
      })
      .superRefine((data, ctx) => {
        const massOfProductsPurchasedByBuyer =
          data["Mass of Products Purchased by Buyer"];

        if (massOfProductsPurchasedByBuyer < 0) {
          ctx.addIssue({
            code: "custom",
            message:
              "Mass of Products Purchased by Buyer should not be negative",
            path: ["Mass of Products Purchased by Buyer"],
          });
        }
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
      );
  }

  // Total Mass
  if (
    sheetName === TBuyerShareAttributionSheetTemplate.totalMass &&
    buyerShareMethod === by_mass &&
    currentSheetCode === "total_mass"
  ) {
    return YearMonthSchema(baseYear)
      .extend({
        "Total Mass of Products Produced in the Facility": z.number({
          required_error:
            "Total Mass of Products Produced in the Facility is required",
          invalid_type_error:
            "Total Mass of Products Produced in the Facility should be a number",
        }),
        UoM: z
          .string({
            invalid_type_error: "The unit of measure entered is invalid",
          })
          .min(1, { message: "UoM is required" }),
      })
      .superRefine((data, ctx) => {
        const totalMassOfProductsProducedInTheFacility =
          data["Total Mass of Products Produced in the Facility"];
        if (totalMassOfProductsProducedInTheFacility < 0) {
          ctx.addIssue({
            code: "custom",
            message:
              "Total Mass of Products Produced in the Facility should not be negative",
            path: ["Total Mass of Products Produced in the Facility"],
          });
        }
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
      );
  }

  // By Volume
  if (
    sheetName === TBuyerShareAttributionSheetTemplate.byVolume &&
    currentSheetCode === buyerShareMethod
  ) {
    return validateCommonFields(baseMonth, baseYear)
      .extend({
        "Volume of Products Purchased by Buyer": z.number({
          required_error: "Volume of Products Purchased by Buyer is required",
          invalid_type_error:
            "Volume of Products Purchased by Buyer should be a number",
        }),
      })
      .superRefine((data, ctx) => {
        const volumeOfProductsPurchasedByBuyer =
          data["Volume of Products Purchased by Buyer"];
        if (volumeOfProductsPurchasedByBuyer < 0) {
          ctx.addIssue({
            code: "custom",
            message:
              "Volume of Products Purchased by Buyer should not be negative",
            path: ["Volume of Products Purchased by Buyer"],
          });
        }
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
      );
  }

  // Total Volume
  if (
    sheetName === TBuyerShareAttributionSheetTemplate.totalVolume &&
    buyerShareMethod === by_volume &&
    currentSheetCode === "total_volume"
  ) {
    return YearMonthSchema(baseYear)
      .extend({
        "Total Volume Produced of all the Products": z.number({
          required_error:
            "Total Volume Produced of all the Products is required",
          invalid_type_error:
            "Total Volume Produced of all the Products should be a number",
        }),
        UoM: z
          .string({
            invalid_type_error: "The unit of measure entered is invalid",
          })
          .min(1, { message: "UoM is required" }),
      })
      .superRefine((data, ctx) => {
        const totalVolumeOfProductsPurchased =
          data["Total Volume Produced of all the Products"];
        if (totalVolumeOfProductsPurchased < 0) {
          ctx.addIssue({
            code: "custom",
            message:
              "Total Volume Produced of all the Products should not be negative",
            path: ["Total Volume Produced of all the Products"],
          });
        }
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
      );
  }

  // By Revenue
  if (
    sheetName === TBuyerShareAttributionSheetTemplate.byRevenue &&
    currentSheetCode === buyerShareMethod
  ) {
    return validateCommonFields(baseMonth, baseYear)
      .extend({
        "Market Value of Products Purchased by Buyer": z.number({
          required_error:
            "Market Value of Products Purchased by Buyer is required",
          invalid_type_error:
            "Market Value of Products Purchased by Buyer should be a number",
        }),
      })
      .superRefine((data, ctx) => {
        const totalRevenue =
          data["Market Value of Products Purchased by Buyer"];
        if (totalRevenue < 0) {
          ctx.addIssue({
            code: "custom",
            message:
              "Market Value of Products Purchased by Buyer should not be negative",
            path: ["Market Value of Products Purchased by Buyer"],
          });
        }
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
      );
  }

  // Total Revenue
  if (
    sheetName === TBuyerShareAttributionSheetTemplate.totalRevenue &&
    buyerShareMethod === by_revenue &&
    currentSheetCode === "total_revenue"
  ) {
    return YearMonthSchema(baseYear)
      .extend({
        "Total Market Value of Products Produced": z.number({
          required_error: "Total Market Value of Products Produced is required",
          invalid_type_error:
            "Total Market Value of Products Produced should be a number",
        }),
        UoM: z
          .string({
            invalid_type_error: "The unit of measure entered is invalid",
          })
          .min(1, { message: "UoM is required" }),
      })
      .superRefine((data, ctx) => {
        const total = data["Total Market Value of Products Produced"];
        if (total < 0) {
          ctx.addIssue({
            code: "custom",
            message:
              "Total Market Value of Products Produced should not be negative",
            path: ["Total Market Value of Products Produced"],
          });
        }
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
      );
  }

  // By Number of Units
  if (
    sheetName === TBuyerShareAttributionSheetTemplate.byNumberOfUnits &&
    currentSheetCode === buyerShareMethod
  ) {
    return validateCommonFields(baseMonth, baseYear)
      .extend({
        "Number of Units Purchased by Buyer": z.number({
          required_error: "Number of Units Purchased by Buyer is required",
          invalid_type_error:
            "Number of Units Purchased by Buyer should be a number",
        }),
      })
      .superRefine((data, ctx) => {
        const value = data["Number of Units Purchased by Buyer"];
        if (!Number.isInteger(value)) {
          ctx.addIssue({
            code: "custom",
            message: "Number of Units Purchased by Buyer should not be decimal",
            path: ["Number of Units Purchased by Buyer"],
          });
        }
        if (value < 0) {
          ctx.addIssue({
            code: "custom",
            message:
              "Number of Units Purchased by Buyer should not be negative",
            path: ["Number of Units Purchased by Buyer"],
          });
        }
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
      );
  }

  // Total Number of Units
  if (
    sheetName === TBuyerShareAttributionSheetTemplate.totalNumberOfUnits &&
    buyerShareMethod === by_number_of_units &&
    currentSheetCode === "total_number_of_units"
  ) {
    return YearMonthSchema(baseYear)
      .extend({
        "Total Number of Units Produced": z.number({
          required_error: "Total Number of Units Produced is required",
          invalid_type_error:
            "Total Number of Units Produced should be a number",
        }),
      })
      .superRefine((data, ctx) => {
        const total = data["Total Number of Units Produced"];
        if (!Number.isInteger(total)) {
          ctx.addIssue({
            code: "custom",
            message: "Total Number of Units Produced should not be decimal",
            path: ["Total Number of Units Produced"],
          });
        }
        if (total < 0) {
          ctx.addIssue({
            code: "custom",
            message: "Total Number of Units Produced should not be negative",
            path: ["Total Number of Units Produced"],
          });
        }
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
      );
  } else {
    return validateCommonFields(baseMonth, baseYear).refine(
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
  }
};

const validateBuyerShareAttributionSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number,
  buyerShareMethod: string
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeParseData: any = buyerShareAttributionValidationSchema(
      baseMonth,
      baseYear,
      sheet.sheetName.trim(),
      buyerShareMethod
    ).safeParse(item);
    if (!safeParseData.success) {
      columnObject["Row Number"] = index;
      BuyerShareAttributionActivityConstant.excel_template.sheets
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

const validateBuyerShareAttributionDataSheet = (
  sheet: TExcelSheet,
  activityMasterData: TActivityMasterData[],
  UomMasterData: UomMaster[]
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    const errorEntries: TErrorExcelSheet[] = [];
    index++;

    const sheetName = sanitizeString.v1(String(sheet.sheetName));

    if (
      sheetName ===
      sanitizeString.v1(TBuyerShareAttributionSheetTemplate.totalMass)
    ) {
      if (!!dataItem["UoM"]) {
        const errorEntriesColumn5Data = validateActivityMasterDataByKey(
          activityMasterData,
          dataItem["UoM"],
          index,
          ActivityMasterKey.buyer_share_attribution[0],
          "UoM",
          ApiHitType.Excel
        );
        if (errorEntriesColumn5Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn5Data[0] });
        }
      }
    }

    if (
      sheetName ===
      sanitizeString.v1(TBuyerShareAttributionSheetTemplate.totalVolume)
    ) {
      if (!!dataItem["UoM"]) {
        const errorEntriesColumn5Data = validateActivityMasterDataByKey(
          activityMasterData,
          dataItem["UoM"],
          index,
          ActivityMasterKey.buyer_share_attribution[1],
          "UoM",
          ApiHitType.Excel
        );
        if (errorEntriesColumn5Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn5Data[0] });
        }
      }
    }

    if (
      sheetName ===
      sanitizeString.v1(TBuyerShareAttributionSheetTemplate.totalRevenue)
    ) {
      if (!!dataItem["UoM"]) {
        const errorEntriesColumn5Data = validateActivityMasterDataByKey(
          activityMasterData,
          dataItem["UoM"],
          index,
          ActivityMasterKey.buyer_share_attribution[2],
          "UoM",
          ApiHitType.Excel
        );
        if (errorEntriesColumn5Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn5Data[0] });
        }
      }
    }

    if (errorEntries.length > 0) {
      const allColumns: any =
        BuyerShareAttributionActivityConstant.excel_template.sheets.filter(
          (sheetItem) =>
            sanitizeString.v1(sheetItem.name) ==
            sanitizeString.v1(sheet.sheetName)
        )[0].columns;
      const errorRow = createErrorDataForExcel(allColumns, errorEntries);
      sheetAllErrorEntries.push(errorRow[0]);
    }
  });
  return sheetAllErrorEntries;
};

const validateBuyerShareAttributionDataSheetUserSpecification = async (
  sheet: TExcelSheet,
  organizationId: UUID,
  organizationAddressId: UUID,
  buyerList: BuyerSupplierAddressMappings[],
  buyerShareMethod: string,
  excelData: TExcelSheet[]
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  const currentSheet =
    BuyerShareAttributionActivityConstant?.excel_template?.sheets?.find(
      (sh) => sh.name === sheet.sheetName.trim()
    );
  const currentSheetCode = currentSheet?.code?.toLowerCase();

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;

    // Supplier Location Code Validation //? Not Required
    // if (
    //   !!orgAddress &&
    //   orgAddress?.UserOrganizationAddressMapping &&
    //   orgAddress?.UserOrganizationAddressMapping?.length > 0 &&
    //   currentSheetCode === buyerShareMethod
    // ) {
    //   const suppLocCodes = orgAddress.UserOrganizationAddressMapping?.filter(
    //     (userOrgAdd) =>
    //       sanitizeString.v1(
    //         String(userOrgAdd?.OrganizationAddress?.Address?.code)
    //       ) === sanitizeString.v1(String(dataItem["Supplier Location Code"]))
    //   );
    //   if (suppLocCodes.length === 0) {
    //     errorEntries.push({
    //       column: "Supplier Location Code",
    //       row: index,
    //       errorMessage: "Invalid Supplier Location Code",
    //     });
    //   }
    // }

    // Buyer Name Validation
    if (
      !!buyerList &&
      buyerList?.length > 0 &&
      (currentSheetCode === by_mass ||
        currentSheetCode === by_volume ||
        currentSheetCode === by_revenue ||
        currentSheetCode === by_number_of_units)
    ) {
      const buyerNames = buyerList?.filter(
        (buyerData) =>
          sanitizeString.v1(String(buyerData?.Organization?.name)) ===
          sanitizeString.v1(String(dataItem["Buyer Name"]))
      );
      if (buyerNames.length === 0) {
        errorEntries.push({
          column: "Buyer Name",
          row: index,
          errorMessage: `Buyer "${dataItem["Buyer Name"]}" details not found`,
        });
      }
    }

    // Buyer Name and Organization Address Combined Validation
    if (
      !!buyerList &&
      buyerList?.length > 0 &&
      (currentSheetCode === by_mass ||
        currentSheetCode === by_volume ||
        currentSheetCode === by_revenue ||
        currentSheetCode === by_number_of_units)
    ) {
      const buyerNames = buyerList?.filter(
        (buyerData) =>
          sanitizeString.v1(String(buyerData?.Organization?.name)) ===
            sanitizeString.v1(String(dataItem["Buyer Name"])) &&
          organizationAddressId === buyerData?.BuyerSupplierAddresId
      );
      if (buyerNames?.length === 0) {
        errorEntries.push({
          column: "Buyer Name",
          row: index,
          errorMessage: `Location is not mapped to buyer "${dataItem["Buyer Name"]}"`,
        });
      }
    }

    // Duplicate Buyer Name for Year Month Validation
    if (
      currentSheetCode === by_mass ||
      currentSheetCode === by_volume ||
      currentSheetCode === by_revenue ||
      currentSheetCode === by_number_of_units
    ) {
      const currentBuyerName = sanitizeString.v1(
        String(dataItem["Buyer Name"])
      );
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const isExistBuyerName = sheet.data
        .slice(0, index)
        .filter(
          (data) =>
            sanitizeString.v1(String(data["Buyer Name"])) ===
              currentBuyerName &&
            currentMonthYear ===
              `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
      if (!!isExistBuyerName && isExistBuyerName.length > 1) {
        errorEntries.push({
          column: "Buyer Name",
          row: index,
          errorMessage: `Buyer "${dataItem["Buyer Name"]}" is duplicate for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
        });
      }
    }

    // Check that Buyer has uploaded the upstream data for the suppliers or not
    // if (
    //   currentSheetCode === by_mass ||
    //   currentSheetCode === by_volume ||
    //   currentSheetCode === by_revenue ||
    //   currentSheetCode === by_number_of_units
    // ) {
    //   if (
    //     !!dataItem["Buyer Name"] &&
    //     !!dataItem["Year"] &&
    //     !!dataItem["Month"]
    //   ) {
    //     const upstreamDataExist = buyerListUpstream?.filter(
    //       (data) =>
    //         sanitizeString.v1(String(dataItem["Buyer Name"])) ===
    //           sanitizeString.v1(String(data.buyer_name)) &&
    //         sanitizeString.v1(String(dataItem["Month"])) ===
    //           sanitizeString.v1(String(data.month)) &&
    //         Number(dataItem["Year"]) === data.year
    //     );
    //     if (!!upstreamDataExist && upstreamDataExist.length > 0) {
    //       if (
    //         !!upstreamDataExist[0].upstream &&
    //         upstreamDataExist[0].upstream.length === 0
    //       ) {
    //         errorEntries.push({
    //           column: "Buyer Name",
    //           row: index,
    //           errorMessage: `Buyer "${dataItem["Buyer Name"]}" has not submitting the relevant data for ${String(dataItem["Month"])} ${dataItem["Year"]}, Please upload once data submitted`,
    //         });
    //       }
    //     } else {
    //       errorEntries.push({
    //         column: "Buyer Name",
    //         row: index,
    //         errorMessage: `Buyer "${dataItem["Buyer Name"]}" has not submitting the relevant data for ${String(dataItem["Month"])} ${dataItem["Year"]}, Please upload once data submitted`,
    //       });
    //     }
    //   }
    // }

    // Total Column validation => Only One records allowed per year month => By Mass[Total Mass]
    if (
      currentSheetCode === "total_mass" &&
      !!dataItem["Total Mass of Products Produced in the Facility"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const isExist = sheet.data
        .slice(0, index)
        .filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );

      if (!!isExist && isExist.length > 1) {
        errorEntries.push({
          column: "Total Mass of Products Produced in the Facility",
          row: index,
          errorMessage: `"Total Mass of Products Produced in the Facility" should be unique for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
        });
      }
    }

    // Total Column validation => Only One records allowed per year month => By Volume[Total Volume]
    if (
      currentSheetCode === "total_volume" &&
      !!dataItem["Total Volume Produced of all the Products"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const isExist = sheet.data
        .slice(0, index)
        .filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );

      if (!!isExist && isExist.length > 1) {
        errorEntries.push({
          column: "Total Volume Produced of all the Products",
          row: index,
          errorMessage: `"Total Volume Produced of all the Products" should be unique for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
        });
      }
    }

    // Total Column validation => Only One records allowed per year month => By Revenue[Total Revenue]
    if (
      currentSheetCode === "total_revenue" &&
      !!dataItem["Total Market Value of Products Produced"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const isExist = sheet.data
        .slice(0, index)
        .filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );

      if (!!isExist && isExist.length > 1) {
        errorEntries.push({
          column: "Total Market Value of Products Produced",
          row: index,
          errorMessage: `"Total Market Value of Products Produced" should be unique for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
        });
      }
    }

    // Total Column validation => Only One records allowed per year month => By Number of Units [Total Number of Units]
    if (
      currentSheetCode === "total_number_of_units" &&
      !!dataItem["Total Number of Units Produced"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const isExist = sheet.data
        .slice(0, index)
        .filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );

      if (!!isExist && isExist.length > 1) {
        errorEntries.push({
          column: "Total Number of Units Produced",
          row: index,
          errorMessage: `"Total Number of Units Produced" should be unique for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
        });
      }
    }

    //Value is missing but total exist => By Mass [Total Mass]
    if (
      currentSheetCode === "total_mass" &&
      !!dataItem["Total Mass of Products Produced in the Facility"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const byMassSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("By Mass"))
      );
      if (!!byMassSheet && byMassSheet?.length > 0) {
        const isExist = byMassSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
        if (!!isExist && isExist?.length === 0) {
          errorEntries.push({
            column: "Total Mass of Products Produced in the Facility",
            row: index,
            errorMessage: `"Mass of Products Purchased by Buyer" is missing for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Value is missing but total exist => By Volume [Total Volume]
    if (
      currentSheetCode === "total_volume" &&
      !!dataItem["Total Volume Produced of all the Products"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const byVolumeSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("By Volume"))
      );
      if (!!byVolumeSheet && byVolumeSheet?.length > 0) {
        const isExist = byVolumeSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
        if (!!isExist && isExist?.length === 0) {
          errorEntries.push({
            column: "Total Volume Produced of all the Products",
            row: index,
            errorMessage: `"Volume of Products Purchased by Buyer" is missing for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Value is missing but total exist => By Revenue [Total Revenue]
    if (
      currentSheetCode === "total_revenue" &&
      !!dataItem["Total Market Value of Products Produced"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const byRevenueSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("By Revenue"))
      );
      if (!!byRevenueSheet && byRevenueSheet?.length > 0) {
        const isExist = byRevenueSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
        if (!!isExist && isExist?.length === 0) {
          errorEntries.push({
            column: "Total Market Value of Products Produced",
            row: index,
            errorMessage: `"Market Value of Products Purchased by Buyer" is missing for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Value is missing but total exist => By Number Of Units [Total Number Of Units]
    if (
      currentSheetCode === "total_number_of_units" &&
      !!dataItem["Total Number of Units Produced"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const byUnitSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("By Number of Units"))
      );
      if (!!byUnitSheet && byUnitSheet?.length > 0) {
        const isExist = byUnitSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
        if (!!isExist && isExist?.length === 0) {
          errorEntries.push({
            column: "Total Number of Units Produced",
            row: index,
            errorMessage: `"Number of Units Purchased by Buyer" is missing for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Total is missing for value => By Mass [Total Mass]
    if (
      currentSheetCode === by_mass &&
      !!dataItem["Mass of Products Purchased by Buyer"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const totalMassSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("Total Mass"))
      );
      if (!!totalMassSheet && totalMassSheet?.length > 0) {
        const yearMonthTotal = totalMassSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
        if (!!yearMonthTotal && yearMonthTotal?.length === 0) {
          errorEntries.push({
            column: "Mass of Products Purchased by Buyer",
            row: index,
            errorMessage: `"Total Mass of Products Produced in the Facility" is missing for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Total is missing for value => By Volume [Total Volume]
    if (
      currentSheetCode === by_volume &&
      !!dataItem["Volume of Products Purchased by Buyer"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const totalVolumeSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("Total Volume"))
      );
      if (!!totalVolumeSheet && totalVolumeSheet?.length > 0) {
        const yearMonthTotal = totalVolumeSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
        if (!!yearMonthTotal && yearMonthTotal?.length === 0) {
          errorEntries.push({
            column: "Volume of Products Purchased by Buyer",
            row: index,
            errorMessage: `"Total Volume Produced of all the Products" is missing for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Total is missing for value => By Revenue [Total Revenue]
    if (
      currentSheetCode === by_revenue &&
      !!dataItem["Market Value of Products Purchased by Buyer"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const totalRevenueSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("Total Revenue"))
      );
      if (!!totalRevenueSheet && totalRevenueSheet?.length > 0) {
        const yearMonthTotal = totalRevenueSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
        if (!!yearMonthTotal && yearMonthTotal?.length === 0) {
          errorEntries.push({
            column: "Market Value of Products Purchased by Buyer",
            row: index,
            errorMessage: `"Total Market Value of Products Produced" is missing for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Total is missing for value => By Number Of Units [Total Number Of Units]
    if (
      currentSheetCode === by_number_of_units &&
      !!dataItem["Number of Units Purchased by Buyer"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const totalUnitsSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("Total Number of Units"))
      );
      if (!!totalUnitsSheet && totalUnitsSheet?.length > 0) {
        const yearMonthTotal = totalUnitsSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
        if (!!yearMonthTotal && yearMonthTotal?.length === 0) {
          errorEntries.push({
            column: "Number of Units Purchased by Buyer",
            row: index,
            errorMessage: `"Total Number of Units Produced" is missing for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Sum of column must be less than total column => By Mass => Total Mass
    if (
      currentSheetCode === by_mass &&
      !!dataItem["Mass of Products Purchased by Buyer"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const totalMassSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("Total Mass"))
      );
      if (!!totalMassSheet && totalMassSheet?.length > 0) {
        const yearMonthTotal = totalMassSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
        const totalOfValue = sheet.data
          .slice(0, index)
          .filter(
            (data) =>
              currentMonthYear ===
              `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
          )
          .reduce((total, data) => {
            return total + data["Mass of Products Purchased by Buyer"];
          }, 0);

        // Value must be less than total => By Mass [Total Mass]
        if (
          !!yearMonthTotal &&
          yearMonthTotal?.length > 0 &&
          dataItem["Mass of Products Purchased by Buyer"] >
            yearMonthTotal[0]["Total Mass of Products Produced in the Facility"]
        ) {
          errorEntries.push({
            column: "Mass of Products Purchased by Buyer",
            row: index,
            errorMessage: `"Mass of Products Purchased by Buyer" should be less than or equal to "Total Mass of Products Produced in the Facility" for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }

        if (
          !!yearMonthTotal &&
          yearMonthTotal?.length > 0 &&
          totalOfValue >
            yearMonthTotal[0]["Total Mass of Products Produced in the Facility"]
        ) {
          errorEntries.push({
            column: "Mass of Products Purchased by Buyer",
            row: index,
            errorMessage: `Sum of "Mass of Products Purchased by Buyer" should be less than or equal to "Total Mass of Products Produced in the Facility" for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Sum of column must be less than total column => By Volume
    if (
      currentSheetCode === by_volume &&
      !!dataItem["Volume of Products Purchased by Buyer"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const totalVolumeSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("Total Volume"))
      );
      if (!!totalVolumeSheet && totalVolumeSheet?.length > 0) {
        const yearMonthTotal = totalVolumeSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );

        const totalOfValue = sheet.data
          .slice(0, index)
          .filter(
            (data) =>
              currentMonthYear ===
              `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
          )
          .reduce((total, data) => {
            return total + data["Volume of Products Purchased by Buyer"];
          }, 0);

        // Value must be less than total => By Volume [Total Volume]
        if (
          !!yearMonthTotal &&
          yearMonthTotal?.length > 0 &&
          totalOfValue >
            yearMonthTotal[0]["Total Volume Produced of all the Products"]
        ) {
          errorEntries.push({
            column: "Volume of Products Purchased by Buyer",
            row: index,
            errorMessage: `Sum of "Volume of Products Purchased by Buyer" should be less than or equal to "Total Volume Produced of all the Products" for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }

        if (
          !!yearMonthTotal &&
          yearMonthTotal?.length > 0 &&
          dataItem["Volume of Products Purchased by Buyer"] >
            yearMonthTotal[0]["Total Volume Produced of all the Products"]
        ) {
          errorEntries.push({
            column: "Volume of Products Purchased by Buyer",
            row: index,
            errorMessage: `"Volume of Products Purchased by Buyer" should be less than or equal to "Total Volume Produced of all the Products" for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Sum of column must be less than total column => By Revenue [Total Revenue]
    if (
      currentSheetCode === by_revenue &&
      !!dataItem["Market Value of Products Purchased by Buyer"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const totalRevenueSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("Total Revenue"))
      );
      if (!!totalRevenueSheet && totalRevenueSheet?.length > 0) {
        const yearMonthTotal = totalRevenueSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );
        const totalOfValue = sheet.data
          .slice(0, index)
          .filter(
            (data) =>
              currentMonthYear ===
              `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
          )
          .reduce((total, data) => {
            return total + data["Market Value of Products Purchased by Buyer"];
          }, 0);

        // Value must be less than total => By Revenue [Total Revenue]
        if (
          !!yearMonthTotal &&
          yearMonthTotal?.length > 0 &&
          dataItem["Market Value of Products Purchased by Buyer"] >
            yearMonthTotal[0]["Total Market Value of Products Produced"]
        ) {
          errorEntries.push({
            column: "Market Value of Products Purchased by Buyer",
            row: index,
            errorMessage: `"Market Value of Products Purchased by Buyer" should be less than or equal to "Total Market Value of Products Produced" for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }

        if (
          !!yearMonthTotal &&
          yearMonthTotal?.length > 0 &&
          totalOfValue >
            yearMonthTotal[0]["Total Market Value of Products Produced"]
        ) {
          errorEntries.push({
            column: "Market Value of Products Purchased by Buyer",
            row: index,
            errorMessage: `Sum of "Market Value of Products Purchased by Buyer" should be less than or equal to "Total Market Value of Products Produced" for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    // Sum of column must be less than total column => By Number of Units [Total Number of Units]
    if (
      currentSheetCode === by_number_of_units &&
      !!dataItem["Number of Units Purchased by Buyer"]
    ) {
      const currentMonthYear = `${sanitizeString.v1(String(dataItem["Month"]))}-${dataItem["Year"]}`;
      const totalUnitSheet = excelData.filter(
        (excel) =>
          sanitizeString.v1(String(excel.sheetName)) ===
          sanitizeString.v1(String("Total Number of Units"))
      );
      if (!!totalUnitSheet && totalUnitSheet?.length > 0) {
        const yearMonthTotal = totalUnitSheet[0]?.data?.filter(
          (data) =>
            currentMonthYear ===
            `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
        );

        const totalOfValue = sheet.data
          .slice(0, index)
          .filter(
            (data) =>
              currentMonthYear ===
              `${sanitizeString.v1(String(data["Month"]))}-${data["Year"]}`
          )
          .reduce((total, data) => {
            return total + data["Number of Units Purchased by Buyer"];
          }, 0);

        // Value must be less than total => By Number of Units [Total Number of Units]
        if (
          !!yearMonthTotal &&
          yearMonthTotal?.length > 0 &&
          dataItem["Number of Units Purchased by Buyer"] >
            yearMonthTotal[0]["Total Number of Units Produced"]
        ) {
          errorEntries.push({
            column: "Number of Units Purchased by Buyer",
            row: index,
            errorMessage: `"Number of Units Purchased by Buyer" should be less than or equal to "Total Number of Units Produced" for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }

        if (
          !!yearMonthTotal &&
          yearMonthTotal?.length > 0 &&
          totalOfValue > yearMonthTotal[0]["Total Number of Units Produced"]
        ) {
          errorEntries.push({
            column: "Number of Units Purchased by Buyer",
            row: index,
            errorMessage: `Sum of "Number of Units Purchased by Buyer" should be less than or equal to "Total Number of Units Produced" for ${String(dataItem["Month"])} ${dataItem["Year"]}`,
          });
        }
      }
    }

    if (errorEntries.length > 0) {
      let allColumns: any =
        BuyerShareAttributionActivityConstant.excel_template.sheets.filter(
          (sheetItem) =>
            sanitizeString.v1(sheetItem.name) ==
            sanitizeString.v1(sheet.sheetName)
        )[0].columns;
      const errorRow = createErrorDataForExcel(allColumns, errorEntries);
      sheetAllErrorEntries.push(errorRow[0]);
    }
  });
  return sheetAllErrorEntries;
};

const validateUserSpecificDataBuyerShareAttributionSheet = async (
  sheet: TExcelSheet,
  organizationId: UUID,
  organizationAddressId: UUID,
  buyerList: BuyerSupplierAddressMappings[],
  buyerShareMethod: string,
  excelData: TExcelSheet[]
) => {
  return validateBuyerShareAttributionDataSheetUserSpecification(
    sheet,
    organizationId,
    organizationAddressId,
    buyerList,
    buyerShareMethod,
    excelData
  );
};

const validateSheetMethods: Record<
  TBuyerShareAttributionSheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number,
    buyerShareMethod: string
  ) => Record<string, any>[]
> = {
  "By Mass": validateBuyerShareAttributionSheet,
  "Total Mass": validateBuyerShareAttributionSheet,
  "By Volume": validateBuyerShareAttributionSheet,
  "Total Volume": validateBuyerShareAttributionSheet,
  "By Revenue": validateBuyerShareAttributionSheet,
  "Total Revenue": validateBuyerShareAttributionSheet,
  "By Number of Units": validateBuyerShareAttributionSheet,
  "Total Number of Units": validateBuyerShareAttributionSheet,
};

const validateSheetMasterDataMethods: Record<
  TBuyerShareAttributionSheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[],
    UomMasterData: UomMaster[]
  ) => Record<string, any>[]
> = {
  "By Mass": validateBuyerShareAttributionDataSheet,
  "Total Mass": validateBuyerShareAttributionDataSheet,
  "By Volume": validateBuyerShareAttributionDataSheet,
  "Total Volume": validateBuyerShareAttributionDataSheet,
  "By Revenue": validateBuyerShareAttributionDataSheet,
  "Total Revenue": validateBuyerShareAttributionDataSheet,
  "By Number of Units": validateBuyerShareAttributionDataSheet,
  "Total Number of Units": validateBuyerShareAttributionDataSheet,
};

const validateSheetSpecificationMethods: Record<
  TBuyerShareAttributionSheetNames,
  (
    sheet: TExcelSheet,
    organizationId: UUID,
    organizationAddressId: UUID,
    buyerList: BuyerSupplierAddressMappings[],
    buyerShareMethod: string,
    excelData: TExcelSheet[]
  ) => Promise<Record<string, any>[]>
> = {
  "By Mass": validateUserSpecificDataBuyerShareAttributionSheet,
  "Total Mass": validateUserSpecificDataBuyerShareAttributionSheet,
  "By Volume": validateUserSpecificDataBuyerShareAttributionSheet,
  "Total Volume": validateUserSpecificDataBuyerShareAttributionSheet,
  "By Revenue": validateUserSpecificDataBuyerShareAttributionSheet,
  "Total Revenue": validateUserSpecificDataBuyerShareAttributionSheet,
  "By Number of Units": validateUserSpecificDataBuyerShareAttributionSheet,
  "Total Number of Units": validateUserSpecificDataBuyerShareAttributionSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID,
  financialYearMonth: string,
  baselineYear: number,
  buyerShareMethod: string
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TBuyerShareAttributionSheetNames]: Record<
      TBuyerShareAttributionSheetColumnNames,
      any
    >[];
  } = {
    "By Mass": [],
    "Total Mass": [],
    "By Volume": [],
    "Total Volume": [],
    "By Revenue": [],
    "Total Revenue": [],
    "By Number of Units": [],
    "Total Number of Units": [],
  };

  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TBuyerShareAttributionSheetNames;
    failedEntries[sheetName] = validateSheetMethods[sheetName](
      sheet,
      financialYearMonth,
      baselineYear,
      buyerShareMethod
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });
  return excelSheetData;
};

const validateDataByDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();

  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.buyer_share_attribution,
  });
  const uomMasterData = await sdk.getUOMMasterdata();

  const failedEntries: {
    [key in TBuyerShareAttributionSheetNames]: Record<
      TBuyerShareAttributionSheetColumnNames,
      any
    >[];
  } = {
    "By Mass": [],
    "Total Mass": [],
    "By Volume": [],
    "Total Volume": [],
    "By Revenue": [],
    "Total Revenue": [],
    "By Number of Units": [],
    "Total Number of Units": [],
  };

  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TBuyerShareAttributionSheetNames;
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

const validateSpecificationData = async (
  excelData: TExcelSheet[],
  organizationId: UUID,
  organizationAddressId: UUID,
  userId: UUID,
  buyerShareMethod: string
) => {
  const excelSheetData: TExcelSheet[] = [];
  let errorData: any = null;
  const sdk = await getGraphQlServerSDK();
  // Get the Organization Address from DB
  // Supplier Location Code will be matched with "Address" table with relation of "Organization Address" table //? Not Required
  // const orgAddress = await sdk.getOrganizationAddressByUserIdOrgId({
  //   organizationId,
  //   userId,
  // });

  const buyerList = await getAccociatedBuyers(organizationId);

  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TBuyerShareAttributionSheetNames;
    errorData = await validateSheetSpecificationMethods[sheetName](
      excelData[i],
      organizationId,
      organizationAddressId,
      buyerList as BuyerSupplierAddressMappings[],
      buyerShareMethod,
      excelData
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: errorData,
    });
  }
  return excelSheetData;
};

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID,
  organizationIdAddressId: UUID,
  userId: UUID,
  financialYearMonth: string,
  baselineYear: number,
  buyerShareMethod: string
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];

  const zodErrorEntries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    organizationId,
    financialYearMonth,
    baselineYear,
    buyerShareMethod
  );

  const masterErrorEntries: TExcelSheet[] = await validateDataByDb(
    excelData,
    organizationId
  );

  // Supplier allowed to upload ONLY one tab data like "by mass", "by volume", "by revenue" and "by number of units"
  // Only one tab data is inserted while rest of data must be ignored
  // Buyer Share Attribution's configuration stored in "Organization" table's metadata

  // Buyer Name Validation
  const userSpecificationErrorEntries: TExcelSheet[] =
    await validateSpecificationData(
      excelData,
      organizationId,
      organizationIdAddressId,
      userId,
      buyerShareMethod
    );

  allError = combineAllErrorSheets(zodErrorEntries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  allError = combineAllErrorSheets(userSpecificationErrorEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);

  return finalError;
};
