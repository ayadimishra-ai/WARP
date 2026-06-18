import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  TErrorExcelSheet,
  TTemplateErrorData,
  YearMonthSchema,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  type TExcelSheet,
} from "~/lib/excel/excel.service";
import {
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import {
  ProductionExcelActivityConstant,
  TProductionActivitySheetColumnNames,
  TProductionActivitySheetNames,
} from "~/shared/constants/activity.constant";
import {
  locationOwnerShipType,
  locationType,
} from "~/shared/constants/input.constant";
import { sanitize_compare_str_v1 } from "~/utils/comapre.util";
import { toNumber } from "~/utils/data-transformer.util";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } =
  ProductionExcelActivityConstant.excel_template;

const processesEmployed = z.string({
  required_error: "length should be greater than 0",
});

const productionDetails = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Manufactured Product Code": z
        .unknown()
        .refine(
          (q) => !!String(q).trim(),
          "Manufactured Product code is required"
        )
        .transform((q) => sanitizeString.v1(String(q)).toUpperCase()),
      "Process Employeed": z.string(processesEmployed).optional(),
      "Manufactured SKU Code": z
        .unknown()
        .refine((q) => !!String(q).trim(), "Manufactured SKU code is required")
        .transform((q) => sanitizeString.v1(String(q)).toUpperCase()),

      "Units of SKU Manufactured": z
        .unknown()
        .refine((q) => !isNaN(Number(q)), "Invalid Input")
        .refine(
          (q) => !(String(q) === ""),
          "Units of SKU Manufactured is required"
        )
        .refine((q) => !(toNumber(q) <= 0), "Value must be greater than 0")
        .transform(toNumber)
        .refine((val) => Number(val) > 0, "Should be greater than 0")
        .refine((val) => Number.isInteger(val), "Value must be a whole number"),

      "What Percentage of Total Production Represents Production of SKU": z
        .number()
        .refine(
          (n) => {
            const precision = n.toString().split(".")[1]?.length ?? 0;
            return precision <= 2 && n > 0;
          },
          {
            message:
              "Max precision is 2 decimal places and value must be greater than 0",
          }
        )
        .refine((d: any) => d > 0 && d <= 100, {
          message: "Should be between 0 to 100",
        })
        .or(z.string().refine((val) => val === "")),
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
      sheet: "Production",
      error_message:
        "No data found in sheet " +
        `'${excelData.map((item) => item.sheetName)}'`,
    });
  }
  return errorMessageData;
};

//#region Zod Validation
const validateProductionSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = productionDetails(baseMonth, baseYear).safeParse(
      item
    );
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      ProductionExcelActivityConstant.excel_template.sheets
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
  TProductionActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  Production: validateProductionSheet,
  //"Renewable Captive Power": validateRenewableSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TProductionActivitySheetNames]: Record<
      TProductionActivitySheetColumnNames,
      any
    >[];
  } = { Production: [] };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TProductionActivitySheetNames;
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

const masterDataValidation = async (
  productionDetailsBody: TExcelSheet,
  userDetails: TUserSession,
  organizationAddressId: UUID
) => {
  const sdk = await getGraphQlServerSDK();
  let index: number = 0;
  const sheetAllerrorEntries: Record<string, string>[] = [];
  const organizationAcitiviesAndAddress =
    await sdk.getOrganizationAddressAndActivityMapping({
      userId: userDetails.userId,
    });
  const productSkuData = await sdk.getProductbyskucode({
    organizationId: String(userDetails?.organizationId),
  });

  const addressesDetails =
    organizationAcitiviesAndAddress.UserOrganizationAddressMapping.map(
      (item) => ({
        client_master_id: item.OrganizationAddress?.Address.client_master_id,
        ownerShip: item.OrganizationAddress?.Address.ownership_type,
        type: item.OrganizationAddress?.Address.type,
        activities: item.activities,
        id: item.OrganizationAddress?.id,
      })
    );
  productionDetailsBody.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    //validation will be done here
    index++;
    if (
      !!String(dataItem["Manufactured Product Code"]).trim() &&
      typeof dataItem["Manufactured Product Code"] === "string" &&
      !!String(dataItem["Manufactured SKU Code"]).trim() &&
      typeof dataItem["Manufactured SKU Code"] === "string"
    ) {
      const productData = productSkuData?.OrgProductMaster.filter((item) =>
        sanitize_compare_str_v1(
          String(dataItem["Manufactured Product Code"]),
          String(item?.code)
        )
      );
      const skuData = productSkuData?.OrgSKUMaster.filter((item) =>
        sanitize_compare_str_v1(
          String(dataItem["Manufactured SKU Code"]),
          String(item?.code)
        )
      );
      if (productData.length == 0 && skuData?.length > 0) {
        errorEntries.push({
          column: "Manufactured SKU Code",
          row: index,
          errorMessage: "SKU code is already exist",
        });
      } else if (productData.length > 0 && skuData?.length > 0) {
        const checkSKUMapping = skuData?.filter((item) =>
          sanitize_compare_str_v1(
            String(dataItem["Manufactured Product Code"]),
            String(item?.OrgProductMaster?.code)
          )
        );
        if (checkSKUMapping.length == 0) {
          errorEntries.push({
            column: "Manufactured SKU Code",
            row: index,
            errorMessage: "SKU code already exist for different Product",
          });
        }
      }
      const producSkuUnificationCheck = productionDetailsBody.data
        .filter(
          (item) =>
            !!String(item["Manufactured Product Code"]) &&
            !!String(item["Manufactured SKU Code"])
        )
        .filter(
          (items) =>
            sanitizeString.v1(String(dataItem["Manufactured SKU Code"])) ===
              sanitizeString.v1(String(items["Manufactured SKU Code"])) &&
            sanitizeString.v1(String(dataItem["Manufactured Product Code"])) !==
              sanitizeString.v1(String(items["Manufactured Product Code"]))
        );
      if (producSkuUnificationCheck.length > 0) {
        errorEntries.push({
          column: "Manufactured SKU Code",
          row: index,
          errorMessage: "Multiple product codes should not have the same SKU",
        });
      }
      addressesDetails.forEach((ele) => {
        if (
          dataItem[
            "What Percentage of Total Production Represents Production of SKU"
          ] === "" &&
          ele.id === organizationAddressId &&
          ele.type === locationType?.manufacturing?.value &&
          ele.ownerShip === locationOwnerShipType?.Contract
        ) {
          errorEntries.push({
            column:
              "What Percentage of Total Production Represents Production of SKU",
            row: index,
            errorMessage:
              "Percentage of Total Production Represents Production of SKU is required",
          });
        }
      });
      if (errorEntries.length > 0) {
        let allcolumns: any =
          ProductionExcelActivityConstant.excel_template.sheets.filter(
            (sheetitem) =>
              sanitizeString.v1(sheetitem.name) ==
              sanitizeString.v1(productionDetailsBody.sheetName)
          )[0].columns;
        const errorrow = createErrorDataForExcel(allcolumns, errorEntries);
        sheetAllerrorEntries.push(errorrow[0]);
      }
    }
  });
  return sheetAllerrorEntries;
};

const validateSheetSpecificationMethods: Record<
  TProductionActivitySheetNames,
  (
    sheet: TExcelSheet,
    usersession: TUserSession,
    organizationAddressId: UUID
  ) => Promise<Record<string, any>>
> = {
  Production: async (sheet, usersession, organizationAddressId) => {
    return masterDataValidation(sheet, usersession, organizationAddressId);
  },
};

const validatespecificationData = async (
  excelData: TExcelSheet[],
  usersession: TUserSession,
  organizationAddressId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  let errorData: any = null;
  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TProductionActivitySheetNames;
    errorData = await validateSheetSpecificationMethods[sheetName](
      excelData[i],
      usersession,
      organizationAddressId
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
  userDetails: TUserSession,
  organizationAddressId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    userDetails.organizationId as UUID
  );

  const masterErrorEntries = await validatespecificationData(
    excelData,
    userDetails,
    organizationAddressId
  );
  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};
