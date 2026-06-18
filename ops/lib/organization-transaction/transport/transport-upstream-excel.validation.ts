import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
  OrgMaterialMaster,
  UomMaster,
} from "~/graphql/shared/types";
import { checkConflictsForUpstreamOrMaterialProcurement } from "~/lib/cross-template-validation";
import {
  ApiHitType,
  TActivityMasterData,
  TActivityMasterDataArray,
  TErrorExcelSheet,
  TTemplateErrorData,
  YearMonthSchema,
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  validateActivityMasterDataByKey,
  validateActivityMasterDataGroupByKey,
  type TExcelSheet,
} from "~/lib/excel/excel.service";
import {
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import { getUomGroup } from "~/lib/material-conversion/material-conversion.service";
import {
  getMaterialMasterUoMCategory,
  getUoMCategory,
  validateUoMCategoryCompatibility,
} from "~/lib/uom-category";
import type { IUoMValidationWarning } from "~/lib/uom-category/uom-validation-warning.types";
import {
  CAPITAL_GOODS,
  TTransportUpstreamActivitySheetColumnNames,
  TTransportUpstreamActivitySheetNames,
  TTransportUpstreamSheetTemplate,
  TransportUpstreamExcelActivityConstant,
} from "~/shared/constants/activity.constant";
import {
  ActivityMasterKey,
  CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY,
  DistancePerTripUOMType,
  MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
  MATERIAL_QUANTITY_PROCURED_UOM_KEY,
  TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
  TransportModes,
  restrictedMaterialTypesForMaterialProcurementActivity,
} from "~/shared/constants/input.constant";
import { sanitize_compare_str_v4 } from "~/utils/comapre.util";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } =
  TransportUpstreamExcelActivityConstant.excel_template;

type RequiredDataFieldsforSheetDataComparision = {
  materialCode: string;
  uom: string;
  sheetName: string;
};

export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
  let errorMessageData: TTemplateErrorData[] = [];
  // validate sheets and column names
  let noOfSheetswithData: number = excelData.filter(
    (errorItem) => errorItem.data.length > 0
  ).length;

  if (noOfSheetswithData > 0) {
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
        "Enter data in at least one of the sheets " +
        excelData.map((item) => item.sheetName),
    });
  }
  return errorMessageData;
};

//zod validation of transport upstream for multiple sheets
const transportUpstreamNew = (
  baseMonth: string,
  baseYear: number,
  sheetName: string
) => {
  const stringSchema = z.preprocess((val) => {
    if (typeof val !== "string") return String(val);
    return val;
  }, z.string());

  const numberSchema = z.preprocess((val) => {
    if (typeof val !== "number") return Number(val);
    return val;
  }, z.number());

  const materialQuantityCheck = z
    .union([z.number(), z.string()])
    .refine(
      (val) => {
        if (typeof val === "string" && val.length === 0) {
          return false;
        }
        return true;
      },
      {
        message: "Material Procured Quantity is required.",
      }
    )
    .refine(
      (val) => {
        // Convert string to number if necessary for further validation
        const stringVal = String(val).trim();

        // Ensure the value does not contain any alphabetic characters
        return !/[a-zA-Z]/.test(stringVal);
      },
      {
        message: "Material Quantity should not contain alphabetic characters.",
      }
    )
    .refine(
      (val) => {
        const numberVal = typeof val === "string" ? Number(val) : val;
        return !isNaN(numberVal);
      },
      {
        message: "Material Quantity should be a valid number.",
      }
    );
  // .refine(
  //   (val) => {
  //     return Number.isInteger(val);
  //   },
  //   {
  //     message: "Material Quantity should be a number",
  //   }
  // );

  {
    /*const sourcePinCodeCheck = z.preprocess(
    (val) => {
      if (val === undefined || val === null) return "";
      return String(val);
    },
    z.string().min(1, {
      message: "Procured from Location Pincode is required",
    })
  );*/
  }

  const sourcePinCodeCheck = z.preprocess(
    (val) => {
      if (val === undefined || val === null) return "";
      return String(val);
    },
    z
      .string()
      .min(1, { message: "Procured from Location Pincode is required" })
      .regex(/^[A-Za-z0-9\-\s/]+$/, {
        message:
          "Procured from Location Pincode must contain only letters, numbers, spaces, hyphens, and slashes",
      })
      .transform((val) => val.trim()) // Remove leading/trailing spaces
  );

  {
    /*const destinationPincodeCheck = z.preprocess(
    (val) => {
      if (val === undefined || val === null) return "";
      return String(val);
    },
    z.string().min(1, { message: "Destination Location Pincode is required" })
  );*/
  }

  const destinationPincodeCheck = z.preprocess(
    (val) => {
      if (val === undefined || val === null) return "";
      return String(val);
    },
    z
      .string()
      .min(1, { message: "Destination Location Pincode is required" })
      .regex(/^[A-Za-z0-9\-\s/]+$/, {
        message:
          "Destination Location Pincode must contain only letters, numbers, spaces, hyphens, and slashes",
      })
      .transform((val) => val.trim()) // Remove leading/trailing spaces
  );

  const procuredCountrySchema = z
    .string()
    .min(1, { message: "Procured from Location Country is required" })
    .regex(/^[A-Za-z]+(?:\s[A-Za-z]+)*$/, {
      message: "Procured from Location Country must contain only alphabets",
    })
    .transform((val) => val.trim().replace(/\s+/g, " ")); // Remove multiple spaces and trim
  const destinationCountrySchema = z
    .string()
    .min(1, { message: "Destination Location Country is required" })
    .regex(/^[A-Za-z]+(?:\s[A-Za-z]+)*$/, {
      message: "Destination Location Country must contain only alphabets",
    })
    .transform((val) => val.trim().replace(/\s+/g, " ")); // Remove multiple spaces and trim;

  /*const procuredCountrySchema = z
    .string()
    .min(1, { message: "Procured from Location Country is required" })
    .regex(/^[A-Za-z]+$/, {
      message: "Procured from Location Country must contain only alphabets",
    });
  const destinationCountrySchema = z
    .string()
    .min(1, { message: "Destination Location Country is required" })
    .regex(/^[A-Za-z]+$/, {
      message: "Destination Location Country must contain only alphabets",
    });*/

  if (sheetName === TTransportUpstreamSheetTemplate.roadTransport) {
    return YearMonthSchema(baseYear)
      .extend({
        "Material Procured Code": stringSchema,
        "Material Procured Quantity": numberSchema,
        "Material Procured Quantity UOM": stringSchema,
        "Supplier code": z
          .string()
          .min(1, { message: "Supplier code is required" }),
        "Procured from Location Country": procuredCountrySchema,
        "Procured from Location Pincode": sourcePinCodeCheck,
        "Destination Location Country": destinationCountrySchema,
        "Destination Location Pincode": destinationPincodeCheck,
        "Type of Vehicle": z
          .string()
          .min(1, { message: "Type of Vehicle is required" })
          .refine((val) => val === "HDV" || val === "MDV" || val === "LDV", {
            message: "Invalid Value: Data should be HDV,MDV,LDV",
          }),
        "Type of Fuel Used": stringSchema,
        "Total Distance Travelled": numberSchema,
        "Total Distance Travelled UoM": z
          .string()
          .refine(
            (val) =>
              val === "" ||
              sanitizeString.v1(val) ===
                sanitizeString.v1(DistancePerTripUOMType.kilometer) ||
              sanitizeString.v1(val) ===
                sanitizeString.v1(DistancePerTripUOMType.Mile),
            {
              message: "Invalid Value: Data should be in Kilometer or Mile",
            }
          ),
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
          !data["Material Procured Quantity"] ||
          data["Material Procured Quantity UOM"],
        () => ({
          message:
            "Material Procured Quantity UoM is required if Material Procured Quantity is given",
          path: ["Material Procured Quantity UOM"],
        })
      )
      .refine(
        (data) =>
          data["Material Procured Quantity"] ||
          !data["Material Procured Quantity UOM"],
        () => ({
          message:
            "Material Procured Quantity is required if Material Procured Quantity UoM is given",
          path: ["Material Procured Quantity"],
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
          data["Total Distance Travelled"] ||
          !data["Total Distance Travelled UoM"],
        () => ({
          message:
            "Total Distance Travelled is required if Total Distance Travelled UoM is given",
          path: ["Total Distance Travelled"],
        })
      );
  } else if (
    sheetName === TTransportUpstreamSheetTemplate.railAirWaterTransport
  ) {
    return YearMonthSchema(baseYear)
      .extend({
        "Material Procured Code": stringSchema,
        "Material Procured Quantity": materialQuantityCheck,
        "Material Procured Quantity UOM": z
          .string()
          .min(1, { message: "Material Procured Quantity UOM is required" }),
        "Supplier code": z
          .string()
          .min(1, { message: "Supplier code is required" }),
        "Procured from Location Country": procuredCountrySchema,
        "Procured from Location Pincode": sourcePinCodeCheck,
        "Destination Location Country": destinationCountrySchema,
        "Destination Location Pincode": destinationPincodeCheck,
        "Mode of Transport": z
          .string()
          .min(1, { message: "Mode of Transport is required" }),
        "Type of Fuel Used": stringSchema,
        "Total Distance Travelled": numberSchema,
        "Total Distance Travelled UoM": z
          .string()
          .refine(
            (val) =>
              val === "" ||
              sanitizeString.v1(val) ===
                sanitizeString.v1(DistancePerTripUOMType.kilometer) ||
              sanitizeString.v1(val) ===
                sanitizeString.v1(DistancePerTripUOMType.Mile),
            {
              message: "Invalid Value: Data should be in Kilometer or Mile",
            }
          ),
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
          data["Total Distance Travelled"] ||
          !data["Total Distance Travelled UoM"],
        () => ({
          message:
            "Total Distance Travelled is required if Total Distance Travelled UoM is given",
          path: ["Total Distance Travelled"],
        })
      );
  }
};

//#region Zod Validation
const transportUpstreamSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any = transportUpstreamNew(
      baseMonth,
      baseYear,
      sheet?.sheetName
    )?.safeParse(item);
    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      TransportUpstreamExcelActivityConstant.excel_template.sheets
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
  TTransportUpstreamActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number
  ) => Record<string, any>[]
> = {
  "Upstream - Road": transportUpstreamSheet,
  "Upstream - Rail_Air_Water": transportUpstreamSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TTransportUpstreamActivitySheetNames]: Record<
      TTransportUpstreamActivitySheetColumnNames,
      any
    >[];
  } = {
    "Upstream - Road": [],
    "Upstream - Rail_Air_Water": [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TTransportUpstreamActivitySheetNames;
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

const validateTransportUpstreamDataSheet = async (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[],
  UomMasterData: UomMaster[],
  sheetName: String,
  existingMaterialMasters: OrgMaterialMaster[],
  organizationId: String
): Promise<Record<string, any>[]> => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  const materialCodes = [
    ...new Set(
      sheet?.data
        .map((item) => item["Material Procured Code"])
        .filter(Boolean)
        .map((code) => String(code))
    ),
  ];
  let distinctUOMsData: GetDistinctUoMsMaterialProcurementByMaterialCodesQuery;
  if (materialCodes.length > 0) {
    // Helpers to build _ilike filters with safe wildcard handling
    const escapeLike = (s: string) => s.replace(/[%_\\]/g, (m) => "\\" + m);

    // If caller already includes %/_ in a code, treat it as a pattern.
    // Otherwise do a contains search: %value%
    const toIlikePattern = (s: string) => {
      if (s.includes("%") || s.includes("_")) return s; // user-supplied pattern
      return `%${escapeLike(s)}%`;
    };

    const buildIlikeOr = (values: string[], column: string) =>
      values.map((v) => ({
        [column]: { _ilike: toIlikePattern(v) },
      }));

    // Build per-table _or filters
    const mpOr = buildIlikeOr(materialCodes, "Material_Code"); // GHGMaterialProcurement
    const tuOr = buildIlikeOr(materialCodes, "Material_ID"); // GHGTransport_Upstream
    const cgOr = buildIlikeOr(materialCodes, "Material_Code"); // GHGCapital_Goods
    const mmOr = buildIlikeOr(materialCodes, "code"); // OrgMaterialMaster

    // Get distinct UOMs from existing data for the specific material patterns
    const sdk = await getGraphQlServerSDK();
    distinctUOMsData =
      await sdk.getDistinctUOMsMaterialProcurementByMaterialCodes({
        organizationId: organizationId,
        mpOr,
        tuOr,
        cgOr,
        mmOr,
      });
  }

  if (sheetName == TTransportUpstreamSheetTemplate.roadTransport) {
    sheet.data.forEach(async (dataItem: Record<string, string>) => {
      let errorEntries: TErrorExcelSheet[] = [];
      index++;

      if (!!dataItem["Supplier code"]) {
        const errorEntriesColumn1Data = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Supplier code"],
          index,
          "transport_upstream_supplier_code",
          "Supplier code",
          ApiHitType.Excel
        );
        if (errorEntriesColumn1Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn1Data[0] });
        }
      }

      // for vehicle type check
      if (!!dataItem["Type of Vehicle"]) {
        const errorEntriesColumn1Data = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Type of Vehicle"],
          index,
          "transport_upstream_road_vehicle_type",
          "Type of Vehicle",
          ApiHitType.Excel
        );

        if (errorEntriesColumn1Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn1Data[0] });
        }
      }
      if (!!dataItem["Type of Fuel Used"]) {
        const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
          ActivityMasterData,
          TransportModes.Road,
          dataItem["Type of Fuel Used"],
          index,
          "transport_upstream_mode_of_transport_fuel_used",
          "Type of Fuel Used",
          ApiHitType.Excel,
          "transport_upstream_mode_of_transport"
        );
        if (errorEntriesColumn2Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn2Data[0] });
        }
      }

      // check for Material Procured Quantity UOM field
      if (
        !!dataItem["Material Procured Quantity UOM"] &&
        !!dataItem["Material Procured Quantity"]
      ) {
        const errorEntriesColumn1Data = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Material Procured Quantity UOM"],
          index,
          "transport_upstream_Material_Quantity_Procured_UOM",
          "Material Procured Quantity UOM",
          ApiHitType.Excel
        );
        if (errorEntriesColumn1Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn1Data[0] });
        }
      }

      // check for Material Procured Code field
      if (
        !dataItem["Material Procured Code"] &&
        dataItem["Material Procured Code"]?.trim() === "" &&
        !!dataItem["Material Procured Quantity UOM"]
      ) {
        const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
          ActivityMasterData,
          "",
          dataItem["Material Procured Quantity UOM"],
          index,
          "transport_upstream_Material_Quantity_Procured_UOM",
          "Material Procured Code",
          ApiHitType.Excel,
          ""
        );
        if (errorEntriesColumn2Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn2Data[0] });
        }
      }

      // Check that material code must NOT be "Capital Goods" in OrgMaterialMaster Table
      const materialCodeLower = sanitizeString.v4(
        String(dataItem["Material Procured Code"] || "")
      );
      const materialMasters =
        existingMaterialMasters?.filter(
          (master) =>
            master?.code &&
            sanitizeString.v4(master?.code) === materialCodeLower
        ) || [];
      if (
        materialCodeLower.length > 0 &&
        materialMasters.length > 0 &&
        sanitizeString.v4(materialMasters?.[0]?.type) ===
          sanitizeString.v4(CAPITAL_GOODS)
      ) {
        errorEntries.push({
          column: "Material Procured Code",
          row: index,
          errorMessage: `Material Code '${dataItem["Material Procured Code"]}' is defined as Capital Goods in Material Master. Please use the Capital Goods template for this material.`,
        });
      }

      // Within-file UoM category compatibility check:
      // If material has weight in Material Master: Volume + Count not allowed (Mass + anything is OK)
      // If material does NOT have weight in Material Master: All UOMs must belong to the same group
      if (
        !!dataItem["Material Procured Code"] &&
        dataItem["Material Procured Code"]?.trim() !== ""
      ) {
        const yearMonthMaterialKey = `${sanitizeString.v4(
          String(dataItem["Material Procured Code"] || "")
        )}`;

        const currentUoMGroup = getUomGroup(
          ActivityMasterData,
          TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
          String(dataItem["Material Procured Quantity UOM"] || "")
        );

        // Check if this material has weight configured in Material Master
        const materialHasWeight = distinctUOMsData?.OrgMaterialMaster?.some(
          (item) =>
            item?.Material_Code &&
            sanitize_compare_str_v4(
              String(item?.Material_Code),
              yearMonthMaterialKey
            ) &&
            item?.Material_Weight_Per_Unit !== 0 &&
            item?.Material_Weight_Per_Unit !== null &&
            !!item?.Material_Quantity_Procured_uom
        );

        if (materialHasWeight) {
          // Material has weight: Validate upload UoM against the material master's UoM category
          const currentUoMCategory = getUoMCategory(
            ActivityMasterData,
            TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            String(dataItem["Material Procured Quantity UOM"] || "")
          );

          // Get the material master's UoM value and derive its category
          const matchingMaster = distinctUOMsData?.OrgMaterialMaster?.find(
            (item) =>
              item?.Material_Code &&
              sanitize_compare_str_v4(
                String(item?.Material_Code),
                yearMonthMaterialKey
              )
          );
          const masterUoMValue =
            matchingMaster?.Material_Quantity_Procured_uom || "";
          const masterUoMCategory = getMaterialMasterUoMCategory(
            ActivityMasterData,
            TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            masterUoMValue
          );

          const compatResult = validateUoMCategoryCompatibility(
            currentUoMCategory,
            masterUoMCategory
          );

          if (compatResult.status === "error" && currentUoMGroup) {
            errorEntries.push({
              column: "Material Procured Quantity UOM",
              row: index,
              errorMessage: `UoM '${dataItem["Material Procured Quantity UOM"]}' (${currentUoMGroup}-based) is incompatible with master UoM '${masterUoMValue}' (${masterUoMCategory}-based) for material '${dataItem["Material Procured Code"]}'. Volume and count-based UoMs cannot coexist. Upload blocked.`,
            });
          }
        } else {
          // Material does NOT have weight: Strict same-group enforcement
          const isDifferentUoMGroupForSameMaterial = sheet?.data?.some(
            (item, itemIndex) => {
              if (itemIndex >= sheet?.data?.indexOf(dataItem)) return false;

              const itemYearMonthMaterialKey = `${sanitizeString.v4(
                String(item["Material Procured Code"] || "")
              )}`;
              if (itemYearMonthMaterialKey !== yearMonthMaterialKey)
                return false;

              const itemUoMGroup = getUomGroup(
                ActivityMasterData,
                TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
                String(item["Material Procured Quantity UOM"] || "")
              );

              return itemUoMGroup !== currentUoMGroup;
            }
          );

          if (isDifferentUoMGroupForSameMaterial && currentUoMGroup) {
            errorEntries.push({
              column: "Material Procured Quantity UOM",
              row: index,
              errorMessage: `Material Procured Quantity UOM '${dataItem["Material Procured Quantity UOM"]}' belongs to '${currentUoMGroup}' group. All Material Procured Quantity UOMs for the same Material Procured Code must belong to the same group.`,
            });
          }
        }
      }

      if (errorEntries.length > 0) {
        let allcolumns: any =
          TransportUpstreamExcelActivityConstant.excel_template.sheets.filter(
            (sheetitem) =>
              sanitizeString.v1(sheetitem.name) ==
              sanitizeString.v1(sheet.sheetName)
          )[0].columns;
        const errorrow = createErrorDataForExcel(allcolumns, errorEntries);
        sheetAllerrorEntries.push(errorrow[0]);
      }
    });
  } else {
    sheet.data.forEach(async (dataItem: Record<string, string>) => {
      let errorEntries: TErrorExcelSheet[] = [];
      index++;

      if (!!dataItem["Supplier code"]) {
        const errorEntriesColumn1Data = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Supplier code"],
          index,
          "transport_upstream_supplier_code",
          "Supplier code",
          ApiHitType.Excel
        );
        if (errorEntriesColumn1Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn1Data[0] });
        }
      }

      if (!!dataItem["Mode of Transport"]) {
        const errorEntriesColumn1Data = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Mode of Transport"],
          index,
          "transport_upstream_mode_of_transport",
          "Mode of Transport",
          ApiHitType.Excel
        );
        if (errorEntriesColumn1Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn1Data[0] });
        }
      }

      //type of fuel check
      if (!!dataItem["Mode of Transport"]) {
        const isValidTransportMode = Object.values(TransportModes)?.some(
          (material) =>
            sanitizeString.v1(material) ===
            sanitizeString.v1(dataItem["Mode of Transport"])
        );

        if (isValidTransportMode && !!dataItem["Type of Fuel Used"]) {
          const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
            ActivityMasterData,
            dataItem["Mode of Transport"],
            dataItem["Type of Fuel Used"],
            index,
            "transport_upstream_mode_of_transport_fuel_used",
            "Type of Fuel Used",
            ApiHitType.Excel,
            "transport_upstream_mode_of_transport"
          );
          if (errorEntriesColumn2Data.length > 0) {
            errorEntries.push({ ...errorEntriesColumn2Data[0] });
          }
        }
      }

      // check for Material Procured Quantity UOM field
      if (
        !!dataItem["Material Procured Quantity UOM"] &&
        !!dataItem["Material Procured Quantity"]
      ) {
        const errorEntriesColumn1Data = validateActivityMasterDataByKey(
          ActivityMasterData,
          dataItem["Material Procured Quantity UOM"],
          index,
          "transport_upstream_Material_Quantity_Procured_UOM",
          "Material Procured Quantity UOM",
          ApiHitType.Excel
        );
        if (errorEntriesColumn1Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn1Data[0] });
        }
      }

      // check for Material Procured Code field
      if (
        !dataItem["Material Procured Code"] &&
        dataItem["Material Procured Code"]?.trim() === "" &&
        !!dataItem["Material Procured Quantity UOM"]
      ) {
        const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
          ActivityMasterData,
          "",
          dataItem["Material Procured Quantity UOM"],
          index,
          "transport_upstream_Material_Quantity_Procured_UOM",
          "Material Procured Code",
          ApiHitType.Excel,
          ""
        );
        if (errorEntriesColumn2Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn2Data[0] });
        }
      }

      // Check that material code must NOT be "Capital Goods" in OrgMaterialMaster Table
      const materialCodeLowerRailAirWater = sanitizeString.v4(
        String(dataItem["Material Procured Code"] || "")
      );
      const materialMastersRailAirWater =
        existingMaterialMasters?.filter(
          (master) =>
            master?.code &&
            sanitizeString.v4(master?.code) === materialCodeLowerRailAirWater
        ) || [];
      if (
        materialCodeLowerRailAirWater.length > 0 &&
        materialMastersRailAirWater.length > 0 &&
        sanitizeString.v4(materialMastersRailAirWater?.[0]?.type) ===
          sanitizeString.v4(CAPITAL_GOODS)
      ) {
        errorEntries.push({
          column: "Material Procured Code",
          row: index,
          errorMessage: `Material Code '${dataItem["Material Procured Code"]}' is defined as Capital Goods in Material Master. Please use the Capital Goods template for this material.`,
        });
      }

      // Within-file UoM category compatibility check:
      // If material has weight in Material Master: Volume + Count not allowed (Mass + anything is OK)
      // If material does NOT have weight in Material Master: All UOMs must belong to the same group
      if (
        !!dataItem["Material Procured Code"] &&
        dataItem["Material Procured Code"]?.trim() !== ""
      ) {
        const yearMonthMaterialKey = `${sanitizeString.v4(
          String(dataItem["Material Procured Code"] || "")
        )}`;

        const currentUoMGroup = getUomGroup(
          ActivityMasterData,
          TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
          String(dataItem["Material Procured Quantity UOM"] || "")
        );

        // Check if this material has weight configured in Material Master
        const materialHasWeight = distinctUOMsData?.OrgMaterialMaster?.some(
          (item) =>
            item?.Material_Code &&
            sanitize_compare_str_v4(
              String(item?.Material_Code),
              yearMonthMaterialKey
            ) &&
            item?.Material_Weight_Per_Unit !== 0 &&
            item?.Material_Weight_Per_Unit !== null &&
            !!item?.Material_Quantity_Procured_uom
        );

        if (materialHasWeight) {
          // Material has weight: Validate upload UoM against the material master's UoM category
          const currentUoMCategory = getUoMCategory(
            ActivityMasterData,
            TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            String(dataItem["Material Procured Quantity UOM"] || "")
          );

          // Get the material master's UoM value and derive its category
          const matchingMaster = distinctUOMsData?.OrgMaterialMaster?.find(
            (item) =>
              item?.Material_Code &&
              sanitize_compare_str_v4(
                String(item?.Material_Code),
                yearMonthMaterialKey
              )
          );
          const masterUoMValue =
            matchingMaster?.Material_Quantity_Procured_uom || "";
          const masterUoMCategory = getMaterialMasterUoMCategory(
            ActivityMasterData,
            TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            masterUoMValue
          );

          const compatResult = validateUoMCategoryCompatibility(
            currentUoMCategory,
            masterUoMCategory
          );

          if (compatResult.status === "error" && currentUoMGroup) {
            errorEntries.push({
              column: "Material Procured Quantity UOM",
              row: index,
              errorMessage: `UoM '${dataItem["Material Procured Quantity UOM"]}' (${currentUoMGroup}-based) is incompatible with master UoM '${masterUoMValue}' (${masterUoMCategory}-based) for material '${dataItem["Material Procured Code"]}'. Volume and count-based UoMs cannot coexist. Upload blocked.`,
            });
          }
        } else {
          // Material does NOT have weight: Strict same-group enforcement
          const isDifferentUoMGroupForSameMaterial = sheet?.data?.some(
            (item, itemIndex) => {
              if (itemIndex >= sheet?.data?.indexOf(dataItem)) return false;

              const itemYearMonthMaterialKey = `${sanitizeString.v4(
                String(item["Material Procured Code"] || "")
              )}`;
              if (itemYearMonthMaterialKey !== yearMonthMaterialKey)
                return false;

              const itemUoMGroup = getUomGroup(
                ActivityMasterData,
                TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
                String(item["Material Procured Quantity UOM"] || "")
              );

              return itemUoMGroup !== currentUoMGroup;
            }
          );

          if (isDifferentUoMGroupForSameMaterial && currentUoMGroup) {
            errorEntries.push({
              column: "Material Procured Quantity UOM",
              row: index,
              errorMessage: `Material Procured Quantity UOM '${dataItem["Material Procured Quantity UOM"]}' belongs to '${currentUoMGroup}' group. All Material Procured Quantity UOMs for the same Material Procured Code must belong to the same group.`,
            });
          }
        }
      }

      if (errorEntries.length > 0) {
        let allcolumns: any =
          TransportUpstreamExcelActivityConstant.excel_template.sheets.filter(
            (sheetitem) =>
              sanitizeString.v1(sheetitem.name) ==
              sanitizeString.v1(sheet.sheetName)
          )[0].columns;
        const errorrow = createErrorDataForExcel(allcolumns, errorEntries);
        sheetAllerrorEntries.push(errorrow[0]);
      }
    });
  }

  return sheetAllerrorEntries;
};

const validateSheetMasterDataMethods: Record<
  TTransportUpstreamActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[],
    UomMasterData: UomMaster[],
    sheetName: String,
    existingMaterialMasters: OrgMaterialMaster[],
    organizationId: String
  ) => Promise<Record<string, any>[]>
> = {
  "Upstream - Road": validateTransportUpstreamDataSheet,
  "Upstream - Rail_Air_Water": validateTransportUpstreamDataSheet,
};

const validateDatabyDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const uomMasterData = await sdk.getUOMMasterdata();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.transport_upstream,
  });

  const materialMasterData = await sdk.getMaterialMasterByTypes({
    organizationId: organizationId,
    types: restrictedMaterialTypesForMaterialProcurementActivity,
  });

  const existingMaterialMasters = materialMasterData.OrgMaterialMaster || [];

  const failedEntries: {
    [key in TTransportUpstreamActivitySheetNames]: Record<
      TTransportUpstreamActivitySheetColumnNames,
      any
    >[];
  } = {
    "Upstream - Road": [],
    "Upstream - Rail_Air_Water": [],
  };
  const uploadedData: RequiredDataFieldsforSheetDataComparision[] = [];

  for (const sheet of excelData) {
    const sheetName =
      sheet.sheetName.trim() as TTransportUpstreamActivitySheetNames;

    sheet.data?.map((item: any) =>
      uploadedData.push({
        materialCode: item["Material Procured Code"],
        uom: item["Material Procured Quantity UOM"],
        sheetName:
          sheetName == TTransportUpstreamSheetTemplate.roadTransport
            ? "Upstream - Road"
            : "Upstream - Rail_Air_Water",
      })
    );
  }

  const materialCodes = [
    ...new Set(
      (uploadedData ?? [])
        .map((item: any) => String(item.materialCode))
        .filter(Boolean)
    ),
  ];

  // Fetch material weight data for weight-conditional UoM validation
  let materialWeightData: {
    Material_Code?: string | null;
    Material_Weight_Per_Unit?: any | null;
    Material_Quantity_Procured_uom?: string | null;
  }[] = [];
  if (materialCodes.length > 0) {
    const escapeLike = (s: string) => s.replace(/[%_\\]/g, (m) => "\\" + m);
    const toIlikePattern = (s: string) => {
      if (s.includes("%") || s.includes("_")) return s;
      return `%${escapeLike(s)}%`;
    };
    const mmOr = materialCodes.map((v) => ({
      code: { _ilike: toIlikePattern(v) },
    }));
    const mpOr = materialCodes.map((v) => ({
      Material_Code: { _ilike: toIlikePattern(v) },
    }));
    const tuOr = materialCodes.map((v) => ({
      Material_ID: { _ilike: toIlikePattern(v) },
    }));
    const cgOr = materialCodes.map((v) => ({
      Material_Code: { _ilike: toIlikePattern(v) },
    }));

    const distinctUOMsResult =
      await sdk.getDistinctUOMsMaterialProcurementByMaterialCodes({
        organizationId: organizationId,
        mpOr,
        tuOr,
        cgOr,
        mmOr,
      });
    materialWeightData = distinctUOMsResult?.OrgMaterialMaster || [];
  }

  excelData.forEach((dataItem) => {
    let index: number = 0;
    let errorEntries: TErrorExcelSheet[] = [];
    if (dataItem.sheetName === "Upstream - Road") {
      dataItem.data.map((item: any) => {
        index++;

        const materialCode = item["Material Procured Code"];
        const materialUom = item["Material Procured Quantity UOM"];

        const materialUomGroup =
          getUomGroup(
            activityMasterData.ActivityMaster || [],
            TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            materialUom
          ) || "";

        const otherSheet = "Upstream - Rail_Air_Water";

        // Check if this material has weight configured in Material Master
        const materialKeyNormalized = sanitizeString.v4(
          String(materialCode || "")
        );
        const materialHasWeight = materialWeightData?.some(
          (master) =>
            master?.Material_Code &&
            sanitize_compare_str_v4(
              String(master?.Material_Code),
              materialKeyNormalized
            ) &&
            master?.Material_Weight_Per_Unit !== 0 &&
            master?.Material_Weight_Per_Unit !== null &&
            !!master?.Material_Quantity_Procured_uom
        );

        if (materialHasWeight) {
          // Material has weight: Validate upload UoM against the material master's UoM category
          const currentUoMCategory = getUoMCategory(
            activityMasterData.ActivityMaster || [],
            TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            materialUom
          );

          // Get the material master's UoM value and derive its category
          const matchingMaster = materialWeightData?.find(
            (master) =>
              master?.Material_Code &&
              sanitize_compare_str_v4(
                String(master?.Material_Code),
                materialKeyNormalized
              )
          );
          const masterUoMValue =
            matchingMaster?.Material_Quantity_Procured_uom || "";
          const masterUoMCategory = getMaterialMasterUoMCategory(
            activityMasterData.ActivityMaster || [],
            TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            masterUoMValue
          );

          const compatResult = validateUoMCategoryCompatibility(
            currentUoMCategory,
            masterUoMCategory
          );

          if (compatResult.status === "error" && materialUomGroup) {
            errorEntries.push({
              column: "Material Procured Quantity UOM",
              row: index,
              errorMessage: `UoM '${item["Material Procured Quantity UOM"]}' (${materialUomGroup}-based) is incompatible with master UoM '${masterUoMValue}' (${masterUoMCategory}-based) for material '${materialCode}'. Volume and count-based UoMs cannot coexist. Upload blocked.`,
            });
          }
        } else {
          // Material does NOT have weight: Strict same-group enforcement across sheets
          const differentGroupOnOtherSheet = uploadedData?.some((x) => {
            if (x.sheetName !== otherSheet) return false;
            if (!sanitize_compare_str_v4(x.materialCode, materialCode))
              return false;

            const otherUoMGroup =
              getUomGroup(
                activityMasterData.ActivityMaster || [],
                TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
                x.uom
              ) || "";

            return otherUoMGroup !== materialUomGroup;
          });

          if (differentGroupOnOtherSheet && materialUomGroup) {
            errorEntries.push({
              column: "Material Procured Quantity UOM",
              row: index,
              errorMessage: `Material Procured Quantity UOM '${item["Material Procured Quantity UOM"]}' belongs to '${materialUomGroup}' group. All Material Procured Quantity UOMs for the same Material Procured Code must belong to the same group across sheets.`,
            });
          }
        }
      });

      if (errorEntries.length > 0) {
        let allColumns: any =
          TransportUpstreamExcelActivityConstant.excel_template.sheets.filter(
            (sheetItem) =>
              sanitizeString.v1(sheetItem.name) ==
              sanitizeString.v1(dataItem.sheetName)
          )[0].columns;
        const errorRow = createErrorDataForExcel(allColumns, errorEntries);

        excelSheetData.push({
          sheetName: dataItem.sheetName,
          data: errorRow,
        });
      }
    } else {
      // Mirror the same logic for the other sheet
      dataItem.data.map((item: any) => {
        index++;

        const materialCode = item["Material Procured Code"];
        const materialUom = item["Material Procured Quantity UOM"];

        const materialUomGroup =
          getUomGroup(
            activityMasterData.ActivityMaster || [],
            TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            materialUom
          ) || "";

        const otherSheet = "Upstream - Road";

        // Check if this material has weight configured in Material Master
        const materialKeyNormalized = sanitizeString.v4(
          String(materialCode || "")
        );
        const materialHasWeight = materialWeightData?.some(
          (master) =>
            master?.Material_Code &&
            sanitize_compare_str_v4(
              String(master?.Material_Code),
              materialKeyNormalized
            ) &&
            master?.Material_Weight_Per_Unit !== 0 &&
            master?.Material_Weight_Per_Unit !== null &&
            !!master?.Material_Quantity_Procured_uom
        );

        if (materialHasWeight) {
          // Material has weight: Validate upload UoM against the material master's UoM category
          const currentUoMCategory = getUoMCategory(
            activityMasterData.ActivityMaster || [],
            TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            materialUom
          );

          // Get the material master's UoM value and derive its category
          const matchingMaster = materialWeightData?.find(
            (master) =>
              master?.Material_Code &&
              sanitize_compare_str_v4(
                String(master?.Material_Code),
                materialKeyNormalized
              )
          );
          const masterUoMValue =
            matchingMaster?.Material_Quantity_Procured_uom || "";
          const masterUoMCategory = getMaterialMasterUoMCategory(
            activityMasterData.ActivityMaster || [],
            TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            masterUoMValue
          );

          const compatResult = validateUoMCategoryCompatibility(
            currentUoMCategory,
            masterUoMCategory
          );

          if (compatResult.status === "error" && materialUomGroup) {
            errorEntries.push({
              column: "Material Procured Quantity UOM",
              row: index,
              errorMessage: `UoM '${item["Material Procured Quantity UOM"]}' (${materialUomGroup}-based) is incompatible with master UoM '${masterUoMValue}' (${masterUoMCategory}-based) for material '${materialCode}'. Volume and count-based UoMs cannot coexist. Upload blocked.`,
            });
          }
        } else {
          // Material does NOT have weight: Strict same-group enforcement across sheets
          const differentGroupOnOtherSheet = uploadedData?.some((x) => {
            if (x.sheetName !== otherSheet) return false;
            if (!sanitize_compare_str_v4(x.materialCode, materialCode))
              return false;

            const otherUoMGroup =
              getUomGroup(
                activityMasterData.ActivityMaster || [],
                TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
                x.uom
              ) || "";

            return otherUoMGroup !== materialUomGroup;
          });

          if (differentGroupOnOtherSheet && materialUomGroup) {
            errorEntries.push({
              column: "Material Procured Quantity UOM",
              row: index,
              errorMessage: `Material Procured Quantity UOM '${item["Material Procured Quantity UOM"]}' belongs to '${materialUomGroup}' group. All Material Procured Quantity UOMs for the same Material Procured Code must belong to the same group across sheets.`,
            });
          }
        }
      });
      if (errorEntries.length > 0) {
        let allColumns: any =
          TransportUpstreamExcelActivityConstant.excel_template.sheets.filter(
            (sheetitem) =>
              sanitizeString.v1(sheetitem.name) ==
              sanitizeString.v1(dataItem.sheetName)
          )[0].columns;
        const errorRow = createErrorDataForExcel(allColumns, errorEntries);

        excelSheetData.push({
          sheetName: dataItem.sheetName,
          data: errorRow,
        });
      }
    }
  });
  if (excelSheetData?.length == 0) {
    for (const sheet of excelData) {
      const sheetName =
        sheet.sheetName.trim() as TTransportUpstreamActivitySheetNames;

      const errors = await validateSheetMasterDataMethods[sheetName](
        sheet,
        activityMasterData?.ActivityMaster,
        uomMasterData?.UomMaster as [],
        sheetName,
        existingMaterialMasters as OrgMaterialMaster[],
        organizationId
      );

      failedEntries[sheetName] = errors;
      excelSheetData.push({
        sheetName: sheetName,
        data: errors,
      });
    }
  }
  return excelSheetData;
};

//#end region

const validateUOMConsistencyByUoMGroup1 = (
  distinctUOMsData: GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
  materialCode: string,
  materialUom: string,
  columnName: string,
  index: number,
  activityMasterData: TActivityMasterData[]
) => {
  const errorEntries: TErrorExcelSheet[] = [];

  const normalizedMaterialCode = String(materialCode);

  // Helper: Extract UOM set for a dataset
  const extractUOMs = (
    data: any[] | undefined,
    uomKey: string
  ): Set<string> => {
    const set = new Set<string>();
    if (!data) return set;

    for (const item of data) {
      if (
        sanitize_compare_str_v4(
          String(item?.Material_Code),
          normalizedMaterialCode
        ) &&
        item?.[uomKey]
      ) {
        set.add(String(item[uomKey]));
      }
    }
    return set;
  };

  // Extract all UOM sets
  const upstreamUOMs = extractUOMs(
    distinctUOMsData?.GHGTransport_Upstream,
    "Material_Quantity_Procured_uom"
  );

  const materialProcurementUOMs = extractUOMs(
    distinctUOMsData?.GHGMaterialProcurement,
    "Material_Quantity_Procured_uom"
  );

  const capitalGoodsUOMs = extractUOMs(
    distinctUOMsData?.GHGCapital_Goods,
    "Material_Quantity_Procured_uom"
  );

  const orgMaterialMasterUOMs = extractUOMs(
    distinctUOMsData?.OrgMaterialMaster,
    "Material_Quantity_Procured_uom"
  );

  const mmUOMs = [...orgMaterialMasterUOMs][0];
  const denominatorUom = mmUOMs?.split("/")?.[1] ?? ""; // i.e Litre, EA
  //Material Master UOM Group
  const materialMasterUomGroup =
    getUomGroup(
      activityMasterData,
      TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
      String(denominatorUom)
    ) ?? "";

  // Current UOM group
  const currentMaterialUomGroup =
    getUomGroup(
      activityMasterData,
      TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
      String(materialUom)
    ) ?? "";

  // Cache master data lookup by key (avoids repeating filter()[0])
  const masterDataMap = new Map(
    activityMasterData.map((m) => [m.master_key, m.master_data])
  );

  // Generic validator
  const validateGroupConsistency = (uoms: Set<string>, masterKey: string) => {
    const inconsistentGroups = new Set<string>();

    for (const uom of uoms) {
      const group = getUomGroup(activityMasterData, masterKey, uom);
      if (group && group !== currentMaterialUomGroup) {
        inconsistentGroups.add(group);
      }
    }

    if (inconsistentGroups.size > 0) {
      const firstGroup = Array.from(inconsistentGroups)[0];
      const masterData = masterDataMap.get(masterKey) ?? [];

      const allowedUoms = masterData
        .filter((md: any) => md?.group?.includes(firstGroup))
        .map((md: any) => md.label);

      errorEntries.push({
        column: columnName,
        row: index,
        errorMessage:
          "UOM is not consistent for this Material, allowed UOMs are " +
          allowedUoms.join(", "),
      });
    }
  };

  if (
    !!currentMaterialUomGroup &&
    !!materialMasterUomGroup &&
    currentMaterialUomGroup !== "" &&
    materialMasterUomGroup !== "" &&
    !sanitize_compare_str_v4(currentMaterialUomGroup, materialMasterUomGroup)
  ) {
    const denominatorUom = mmUOMs?.split("/")?.[1] ?? ""; // i.e litre
    const group = getUomGroup(
      activityMasterData,
      TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
      String(denominatorUom)
    );
    if (group && sanitize_compare_str_v4(group, currentMaterialUomGroup)) {
      return;
    }
    const masterData =
      masterDataMap.get(
        TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY
      ) ?? [];
    const allowedUoms = masterData
      .filter((md: any) => md?.group?.includes(group))
      .map((md: any) => md.label);
    errorEntries.push({
      column: columnName,
      row: index,
      errorMessage:
        "UOM is not consistent for this Material, allowed UOMs are " +
        allowedUoms.join(", "),
    });
  }

  // Validate each section
  // validateGroupConsistency(
  //   upstreamUOMs,
  //   TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY
  // );

  validateGroupConsistency(
    materialProcurementUOMs,
    MATERIAL_QUANTITY_PROCURED_UOM_KEY
  );

  validateGroupConsistency(
    capitalGoodsUOMs,
    CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY
  );

  return errorEntries;
};

const validateUOMConsistencyByUoMGroup = (
  distinctUOMsData: GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
  materialCode: string,
  materialUom: string,
  columnName: string,
  index: number,
  activityMasterData: TActivityMasterData[]
): { errors: TErrorExcelSheet[]; warnings: IUoMValidationWarning[] } => {
  const errorEntries: TErrorExcelSheet[] = [];
  const warningEntries: IUoMValidationWarning[] = [];

  const existingUpstreamTransportUOMs = new Set<string>();
  distinctUOMsData?.GHGTransport_Upstream?.map((item) => {
    if (
      item?.Material_Quantity_Procured_uom &&
      sanitize_compare_str_v4(String(item?.Material_Code), String(materialCode))
    ) {
      existingUpstreamTransportUOMs.add(
        String(item?.Material_Quantity_Procured_uom)
      );
    }
  });

  const existingMaterialProcurementUOMs = new Set<string>();
  distinctUOMsData?.GHGMaterialProcurement?.map((item) => {
    if (
      item?.Material_Quantity_Procured_uom &&
      sanitize_compare_str_v4(String(item?.Material_Code), String(materialCode))
    ) {
      existingMaterialProcurementUOMs.add(
        String(item?.Material_Quantity_Procured_uom)
      );
    }
  });

  const existingMaterialMasterUOMs = new Set<string>();
  distinctUOMsData?.OrgMaterialMaster?.map((item) => {
    if (
      item?.Material_Code &&
      sanitize_compare_str_v4(
        String(item?.Material_Code),
        String(materialCode)
      ) &&
      item?.Material_Weight_Per_Unit !== 0 &&
      item?.Material_Quantity_Procured_uom
    ) {
      existingMaterialMasterUOMs.add(
        String(item?.Material_Quantity_Procured_uom)
      );
    }
  });

  // Get upload UoM category
  const currentMaterialUomCategory = getUoMCategory(
    activityMasterData,
    TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
    String(materialUom)
  );

  const currentMaterialUomGroup =
    getUomGroup(
      activityMasterData,
      TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
      String(materialUom)
    ) ?? "";

  // Check upstream transport UoM consistency with category compatibility
  for (const uom of existingUpstreamTransportUOMs) {
    const existingGroup = getUomGroup(
      activityMasterData,
      TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
      String(uom)
    );

    if (existingGroup && existingGroup !== currentMaterialUomGroup) {
      const existingCategory = getUoMCategory(
        activityMasterData,
        TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY,
        String(uom)
      );

      const compatResult = validateUoMCategoryCompatibility(
        currentMaterialUomCategory,
        existingCategory
      );

      if (compatResult.status === "error") {
        errorEntries.push({
          column: columnName,
          row: index,
          errorMessage: `UOM '${materialUom}' (${currentMaterialUomCategory}) is incompatible with existing upstream transport UOM '${uom}' (${existingCategory}). ${compatResult.reason}`,
        });
      } else if (compatResult.status === "warning") {
        warningEntries.push({
          row: index,
          column: columnName,
          uploadedUoM: materialUom,
          masterUoM: uom,
          uploadCategory: currentMaterialUomCategory ?? "unknown",
          masterCategory: existingCategory ?? "unknown",
          reason: compatResult.reason,
        });
      }
      break;
    }
  }

  // Check material procurement UoM consistency with category compatibility
  for (const uom of existingMaterialProcurementUOMs) {
    const existingGroup = getUomGroup(
      activityMasterData,
      MATERIAL_QUANTITY_PROCURED_UOM_KEY,
      String(uom)
    );

    if (existingGroup && existingGroup !== currentMaterialUomGroup) {
      const existingCategory = getUoMCategory(
        activityMasterData,
        MATERIAL_QUANTITY_PROCURED_UOM_KEY,
        String(uom)
      );

      const compatResult = validateUoMCategoryCompatibility(
        currentMaterialUomCategory,
        existingCategory
      );

      if (compatResult.status === "error") {
        errorEntries.push({
          column: columnName,
          row: index,
          errorMessage: `UOM '${materialUom}' (${currentMaterialUomCategory}) is incompatible with existing material procurement UOM '${uom}' (${existingCategory}). ${compatResult.reason}`,
        });
      } else if (compatResult.status === "warning") {
        warningEntries.push({
          row: index,
          column: columnName,
          uploadedUoM: materialUom,
          masterUoM: uom,
          uploadCategory: currentMaterialUomCategory ?? "unknown",
          masterCategory: existingCategory ?? "unknown",
          reason: compatResult.reason,
        });
      }
      break;
    }
  }

  // Check material master UoM consistency with category compatibility
  for (const uom of existingMaterialMasterUOMs) {
    let existingDenominatorGroup: string | null = "";

    const materialMasterUOM = activityMasterData?.filter(
      (activityMaster) =>
        activityMaster?.master_key === MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY
    );

    const currentMaterialUom = materialMasterUOM?.[0]?.master_data?.filter(
      (item: TActivityMasterDataArray) =>
        sanitize_compare_str_v4(String(item?.value), String(uom))
    );

    if (materialMasterUOM?.length) {
      if (currentMaterialUom?.length) {
        currentMaterialUom.forEach((uomItem: TActivityMasterDataArray) => {
          const denominatorUom = uomItem?.value?.split("/")?.[1] ?? "";
          existingDenominatorGroup = getUomGroup(
            activityMasterData,
            MATERIAL_QUANTITY_PROCURED_UOM_KEY,
            String(denominatorUom)
          );
        });
      }
    }

    if (
      existingDenominatorGroup &&
      existingDenominatorGroup !== currentMaterialUomGroup
    ) {
      const existingCategory = existingDenominatorGroup as
        | import("~/lib/uom-category").UoMCategory
        | null;

      const compatResult = validateUoMCategoryCompatibility(
        currentMaterialUomCategory,
        existingCategory
      );

      if (compatResult.status === "error") {
        errorEntries.push({
          column: columnName,
          row: index,
          // errorMessage: `UOM '${materialUom}' (${currentMaterialUomCategory}) is incompatible with material master UOM '${uom}' (${existingCategory}). ${compatResult.reason}`,
          errorMessage: `UOM '${materialUom}' (${currentMaterialUomCategory}-based) is incompatible with master UOM '${uom}' (${existingCategory}-based) for '${materialCode}'. Volume and count-based UoMs cannot coexist.`,
        });
      } else if (compatResult.status === "warning") {
        warningEntries.push({
          row: index,
          column: columnName,
          uploadedUoM: materialUom,
          masterUoM: uom,
          uploadCategory: currentMaterialUomCategory ?? "unknown",
          masterCategory: existingCategory ?? "unknown",
          reason: compatResult.reason,
        });
      }
      break;
    }
  }

  return { errors: errorEntries, warnings: warningEntries };
};

const validateTransportUpstreamUOMConsistencyDataSheet = async (
  sheet: TExcelSheet,
  organizationId: UUID
): Promise<{
  errors: Record<string, string>[];
  warnings: IUoMValidationWarning[];
}> => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  const sheetAllWarningEntries: IUoMValidationWarning[] = [];
  let index: number = 0;

  const sdk = await getGraphQlServerSDK();

  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: [
      ...ActivityMasterKey.transport_upstream,
      ...ActivityMasterKey.material_procurement,
      ...ActivityMasterKey.capital_goods,
      ...ActivityMasterKey.material_master,
    ],
  });

  const materialCodes = [
    ...new Set(
      sheet?.data
        .map((item) => item["Material Procured Code"])
        .filter(Boolean)
        .map((code) => String(code))
    ),
  ];

  if (materialCodes.length > 0) {
    // Helpers to build _ilike filters with safe wildcard handling
    const escapeLike = (s: string) => s.replace(/[%_\\]/g, (m) => "\\" + m);

    // If caller already includes %/_ in a code, treat it as a pattern.
    // Otherwise do a contains search: %value%
    const toIlikePattern = (s: string) => {
      if (s.includes("%") || s.includes("_")) return s; // user-supplied pattern
      return `%${escapeLike(s)}%`;
    };

    const buildIlikeOr = (values: string[], column: string) =>
      values.map((v) => ({
        [column]: { _ilike: toIlikePattern(v) },
      }));

    // Build per-table _or filters
    const mpOr = buildIlikeOr(materialCodes, "Material_Code"); // GHGMaterialProcurement
    const tuOr = buildIlikeOr(materialCodes, "Material_ID"); // GHGTransport_Upstream
    const cgOr = buildIlikeOr(materialCodes, "Material_Code"); // GHGCapital_Goods
    const mmOr = buildIlikeOr(materialCodes, "code"); // OrgMaterialMaster

    // Get distinct UOMs from existing data for the specific material patterns
    const distinctUOMsData =
      await sdk.getDistinctUOMsMaterialProcurementByMaterialCodes({
        organizationId: organizationId,
        mpOr,
        tuOr,
        cgOr,
        mmOr,
      });

    sheet.data.forEach((dataItem: Record<string, string>) => {
      const errorEntries: TErrorExcelSheet[] = [];
      index++;

      // Validation of Columns value from Master Data - now returns both errors and warnings
      const validationResult = validateUOMConsistencyByUoMGroup(
        distinctUOMsData as GetDistinctUoMsMaterialProcurementByMaterialCodesQuery,
        String(dataItem["Material Procured Code"]),
        String(dataItem["Material Procured Quantity UOM"]),
        "Material Procured Quantity UOM",
        index,
        activityMasterData?.ActivityMaster || []
      );

      // Collect hard errors
      if (validationResult.errors.length > 0) {
        errorEntries.push({ ...validationResult.errors[0] });
      }

      // Collect warnings (these rows are accepted but flagged)
      if (validationResult.warnings.length > 0) {
        sheetAllWarningEntries.push(...validationResult.warnings);
      }

      if (errorEntries.length > 0) {
        let allColumns: any =
          TransportUpstreamExcelActivityConstant.excel_template.sheets.filter(
            (sheetItem) =>
              sanitize_compare_str_v4(sheetItem.name, sheet.sheetName)
          )[0].columns;
        const errorRow = createErrorDataForExcel(allColumns, errorEntries);
        sheetAllErrorEntries.push(errorRow[0]);
      }
    });
  }
  return { errors: sheetAllErrorEntries, warnings: sheetAllWarningEntries };
};

const validateSheetUOMConsistencyMethods: Record<
  TTransportUpstreamActivitySheetNames,
  (
    sheet: TExcelSheet,
    organizationId: UUID
  ) => Promise<{
    errors: Record<string, any>[];
    warnings: IUoMValidationWarning[];
  }>
> = {
  "Upstream - Road": validateTransportUpstreamUOMConsistencyDataSheet,
  "Upstream - Rail_Air_Water": validateTransportUpstreamUOMConsistencyDataSheet,
};

const validateUOMConsistency = async (
  excelData: TExcelSheet[],
  organizationId: UUID
): Promise<{
  errorSheets: TExcelSheet[];
  warnings: IUoMValidationWarning[];
}> => {
  const excelSheetData: TExcelSheet[] = [];
  const allWarnings: IUoMValidationWarning[] = [];
  const failedEntries: {
    [key in TTransportUpstreamActivitySheetNames]: Record<
      TTransportUpstreamActivitySheetColumnNames,
      any
    >[];
  } = { "Upstream - Road": [], "Upstream - Rail_Air_Water": [] };

  for (const sheet of excelData) {
    const sheetName =
      sheet.sheetName.trim() as TTransportUpstreamActivitySheetNames;

    // Call our UOM consistency check method - now returns errors and warnings
    const result = await validateSheetUOMConsistencyMethods[sheetName](
      sheet,
      organizationId
    );

    failedEntries[sheetName] = result.errors;
    allWarnings.push(...result.warnings);

    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  }

  return { errorSheets: excelSheetData, warnings: allWarnings };
};

/**
 * Cross-Template Material Code Hard Validation (Enhancement 3)
 *
 * Checks if any material codes being uploaded to Upstream Transport already have
 * activity data in Capital Goods. If conflict is found, returns a HARD ERROR.
 */
const validateCrossTemplateConflict = async (
  excelData: TExcelSheet[],
  organizationId: UUID
): Promise<TExcelSheet[]> => {
  const excelSheetData: TExcelSheet[] = [];

  // Extract unique material codes from all Upstream sheets
  const uniqueMaterialCodes = Array.from(
    new Set(
      excelData.flatMap((sheet) =>
        sheet.data
          .map((item: Record<string, string>) => item["Material Procured Code"])
          .filter((code) => code !== null && code !== undefined)
          .map((code) => String(code).trim())
          .filter((code) => code.length > 0)
      )
    )
  );

  if (uniqueMaterialCodes.length === 0) return excelSheetData;

  // Check for cross-template conflicts
  const conflicts = await checkConflictsForUpstreamOrMaterialProcurement(
    uniqueMaterialCodes,
    organizationId
  );

  if (conflicts.size === 0) return excelSheetData;

  // Generate error entries for conflicting rows
  for (const sheet of excelData) {
    const sheetName =
      sheet.sheetName.trim() as TTransportUpstreamActivitySheetNames;
    const sheetAllErrorEntries: Record<string, string>[] = [];
    let index = 0;

    for (const dataItem of sheet.data) {
      index++;
      const materialCode = sanitizeString.v4(
        String(dataItem["Material Procured Code"] || "")
      );
      const conflict = conflicts.get(materialCode);

      if (conflict) {
        const errorEntries: TErrorExcelSheet[] = [
          {
            column: "Material Procured Code",
            row: index,
            errorMessage: `Material Code '${dataItem["Material Procured Code"]}' is defined as ${conflict.conflictingTemplate} in Material Master or already has activity data in ${conflict.conflictingTemplate}. The same material code cannot exist in Upstream / Material Procurement.`,
          },
        ];

        const allColumns: any =
          TransportUpstreamExcelActivityConstant.excel_template.sheets.filter(
            (sheetItem) =>
              sanitizeString.v1(sheetItem.name) ===
              sanitizeString.v1(sheet.sheetName)
          )[0].columns;
        const errorRow = createErrorDataForExcel(allColumns, errorEntries);
        sheetAllErrorEntries.push(errorRow[0]);
      }
    }

    excelSheetData.push({
      sheetName: sheetName,
      data: sheetAllErrorEntries,
    });
  }

  return excelSheetData;
};

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID,
  organizationIdaddressid: UUID
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

  const uomConsistencyResult = await validateUOMConsistency(
    excelData,
    organizationId
  );

  const crossTemplateErrorEntries: TExcelSheet[] =
    await validateCrossTemplateConflict(excelData, organizationId);

  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  allError = combineAllErrorSheets(uomConsistencyResult.errorSheets, allError);
  allError = combineAllErrorSheets(crossTemplateErrorEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};
