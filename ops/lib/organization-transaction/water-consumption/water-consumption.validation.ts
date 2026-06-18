import { UUID } from "crypto";
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
  YearMonthSchema,
} from "~/lib/excel/excel.service";
import {
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import {
  TWaterConsumptionActivitySheetColumnNames,
  TWaterConsumptionActivitySheetNames,
  WaterConsumptionActivityConstant,
} from "~/shared/constants/activity.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } =
  WaterConsumptionActivityConstant.excel_template;

const validUomAraryForWaterConsumption = [
  "litre",
  "gallon",
  "million litres",
  "kilolitres",
  "m3",
];

export const freshWaterData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Total Fresh Water Used for Domestic Use": z
        .unknown()
        .refine((val) => sanitizeString.v2(String(val)) !== "", {
          message: "Total Fresh Water Used for Domestic Use is required",
        })
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Please enter a valid numeric value for Total Fresh Water Used for Domestic Use."
        ),
      "Total Fresh Water Used for Industrial Use": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "") {
            return 0;
          }
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Please enter a valid numeric value for Total Fresh Water Used for Industrial Use.",
        }),
      "Total Fresh Water Used for Landscaping": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "") {
            return 0;
          }
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Please enter a valid numeric value for Total Fresh Water Used for Landscaping.",
        }),
      "Total Fresh Water Used for Miscellaneous Uses": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "") {
            return 0;
          }
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Please enter a valid numeric value for Total Fresh Water Used for Miscellaneous Uses.",
        }),
      "UoM Freshwater": z
        .union([
          z.string().min(1, { message: "UoM Freshwater is required" }),
          z.number(), // Optional: If you want to allow number but with validation
        ])
        .refine((value) => typeof value === "string" && isNaN(Number(value)), {
          message: "Invalid input",
        }),
    })
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (month) =>
            sanitizeString.v1(month) ==
            sanitizeString.v1(Month?.toString() || "")
        );
        if (fullNameMonth.length > 0) {
          yearMonthError = validateMonthYear(
            Month?.toString() || "",
            Number(Year),
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
};

export const wasteWaterData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Total Treated Effluent Reused for Domestic Use": z
        .unknown()
        .refine((val) => sanitizeString.v2(String(val)) !== "", {
          message: "Total Treated Effluent Reused for Domestic Use is required",
        })
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Please enter a valid numeric value for Total Treated Effluent Reused for Domestic Use"
        ),
      "Total Treated Effluent Reused for Industrial Use": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "") {
            return 0;
          }
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Please enter a valid numeric value for Total Treated Effluent Reused for Industrial Use.",
        }),
      "Total Treated Effluent Reused for Landscaping": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "") {
            return 0;
          }
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Please enter a valid numeric value for Total Treated Effluent Reused for Landscaping.",
        }),
      "Total Treated Effluent Used for Miscellaneous Uses": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "") {
            return 0;
          }
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Please enter a valid numeric value for Total Treated Effluent Used for Miscellaneous Uses.",
        }),
      "UoM Treated Effluent": z
        .union([
          z.string().min(1, { message: "UoM Treated Effluent is required" }),
          z.number(), // Optional: If you want to allow number but with validation
        ])
        .refine((value) => typeof value === "string" && isNaN(Number(value)), {
          message: "Invalid input",
        }),
    })
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (month) =>
            sanitizeString.v1(month) ==
            sanitizeString.v1(Month?.toString() || "")
        );
        if (fullNameMonth.length > 0) {
          yearMonthError = validateMonthYear(
            Month?.toString() || "",
            Number(Year),
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
};

export const harvestedWaterData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Total Harvested Water Used for Domestic Use": z
        .unknown()
        .refine((val) => sanitizeString.v2(String(val)) !== "", {
          message: "Total Harvested Water Used for Domestic Use is required",
        })
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Please enter a valid numeric value for Total Harvested Water Used for Domestic Use"
        ),
      "Total Harvested Water Used for Industrial Use": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "") {
            return 0;
          }
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Please enter a valid numeric value for Total Harvested Water Used for Industrial Use.",
        }),
      "Total Harvested Water Used for Landscaping": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "") {
            return 0;
          }
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Please enter a valid numeric value for Total Harvested Water Used for Landscaping.",
        }),
      "Total Harvested Water Used for Miscellaneous Uses": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "") {
            return 0;
          }
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Please enter a valid numeric value for Total Harvested Water Used for Miscellaneous Uses.",
        }),
      "UoM Harvested Water": z
        .union([
          z.string().min(1, { message: "UoM Harvested Water is required" }),
          z.number(), // Optional: If you want to allow number but with validation
        ])
        .refine((value) => typeof value === "string" && isNaN(Number(value)), {
          message: "Invalid input",
        }),
    })
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (month) =>
            sanitizeString.v1(month) ==
            sanitizeString.v1(Month?.toString() || "")
        );
        if (fullNameMonth.length > 0) {
          yearMonthError = validateMonthYear(
            Month?.toString() || "",
            Number(Year),
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
};

// Validate each excel sheet names based on activity.
// Validate each excel sheet column names based on activity.
export const validateWaterExcelTemplate = (excelData: TExcelSheet[]) => {
  let errorMessageData: TTemplateErrorData[] = [];
  //check for blanks sheets
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
      // validate sheets and column names
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

//call zod validation methods from this method.
const validateWaterDataSheet = (
  sheet: TExcelSheet,
  baseMonth: string,
  baseYear: number,
  sheetName: string
) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    let columnObject: any = {};
    let safeparseData: any;

    if (sheetName === "Freshwater Use") {
      safeparseData = freshWaterData(baseMonth, baseYear).safeParse(item);
    } else if (sheetName === "Wastewater Reuse") {
      safeparseData = wasteWaterData(baseMonth, baseYear).safeParse(item);
    } else if (sheetName === "Harvested Water Use") {
      safeparseData = harvestedWaterData(baseMonth, baseYear).safeParse(item);
    }

    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      WaterConsumptionActivityConstant.excel_template.sheets
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
  TWaterConsumptionActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number,
    sheetName: string
  ) => Record<string, any>[]
> = {
  "Freshwater Use": validateWaterDataSheet,
  "Wastewater Reuse": validateWaterDataSheet,
  "Harvested Water Use": validateWaterDataSheet,
};

const waterDataValidate = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TWaterConsumptionActivitySheetNames]: Record<
      TWaterConsumptionActivitySheetColumnNames,
      any
    >[];
  } = {
    "Freshwater Use": [],
    "Wastewater Reuse": [],
    "Harvested Water Use": [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWaterConsumptionActivitySheetNames;
    failedEntries[sheetName] = validateSheetMethods[sheetName](
      sheet,
      orgData.Organization[0].FinancialYearMonth,
      orgData.Organization[0].Baselineyear,
      sheetName
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

//#region Master data validation

const validateFreshWaterDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["UoM Freshwater"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM Freshwater"],
        index,
        "water_consumption_uom",
        "UoM Freshwater",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        WaterConsumptionActivityConstant.excel_template.sheets.filter(
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

const validateWasteWaterDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["UoM Treated Effluent"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM Treated Effluent"],
        index,
        "water_consumption_uom",
        "UoM Treated Effluent",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        WaterConsumptionActivityConstant.excel_template.sheets.filter(
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

const validateHarvestedWaterDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["UoM Harvested Water"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM Harvested Water"],
        index,
        "water_consumption_uom",
        "UoM Harvested Water",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        WaterConsumptionActivityConstant.excel_template.sheets.filter(
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
  TWaterConsumptionActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Freshwater Use": validateFreshWaterDataSheet,
  "Wastewater Reuse": validateWasteWaterDataSheet,
  "Harvested Water Use": validateHarvestedWaterDataSheet,
};

const validateDatabyDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.water_consumption,
  });
  const failedEntries: {
    [key in TWaterConsumptionActivitySheetNames]: Record<
      TWaterConsumptionActivitySheetNames,
      any
    >[];
  } = {
    "Freshwater Use": [],
    "Wastewater Reuse": [],
    "Harvested Water Use": [],
  };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWaterConsumptionActivitySheetNames;
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
//end region

//main method called from route
// Validate each excel sheet cells based on column data type.
export const validateWaterExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] = await waterDataValidate(
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
    [key in TWaterConsumptionActivitySheetNames]: Record<
      TWaterConsumptionActivitySheetColumnNames,
      any
    >[];
  } = {
    "Freshwater Use": [],
    "Wastewater Reuse": [],
    "Harvested Water Use": [],
  };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWaterConsumptionActivitySheetNames;
    failedEntries[sheetName] = validateduplicateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};
const validateFreshWaterDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (
      !!dataItem["UoM Freshwater"] &&
      !!dataItem["Year"] &&
      !!dataItem["Month"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "UoM Freshwater",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["UoM Freshwater"],
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
        WaterConsumptionActivityConstant.excel_template.sheets.filter(
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
const validateWasteWaterDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (
      !!dataItem["UoM Treated Effluent"] &&
      !!dataItem["Year"] &&
      !!dataItem["Month"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "UoM Treated Effluent",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["UoM Treated Effluent"],
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
        WaterConsumptionActivityConstant.excel_template.sheets.filter(
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
const validateHarvestedWaterDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (
      !!dataItem["UoM Harvested Water"] &&
      !!dataItem["Year"] &&
      !!dataItem["Month"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "UoM Harvested Water",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["UoM Harvested Water"],
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
        WaterConsumptionActivityConstant.excel_template.sheets.filter(
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
  TWaterConsumptionActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  "Freshwater Use": validateFreshWaterDuplicateDataSheet,
  "Wastewater Reuse": validateWasteWaterDuplicateDataSheet,
  "Harvested Water Use": validateHarvestedWaterDuplicateDataSheet,
};

export const validateduplidateDataByKey = (
  index: number,
  columnName: string,
  Year: string,
  month: string,
  sheet_uom: string,
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
    const uniqueKeyindex = `${Year}-${month}-${sheet_uom}`; // Replace 'Column1' and 'Column2' with actual column names
    let uniqueKeyrow = "";

    if (sheetName === "Freshwater Use")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${item["UoM Freshwater"]}`;
    else if (sheetName === "Wastewater Reuse")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${item["UoM Treated Effluent"]}`;
    else if (sheetName === "Harvested Water Use")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${item["UoM Harvested Water"]}`;

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
    errorEntries.push({
      column: columnName,
      row: index,
      errorMessage:
        "Duplicate Entry Detected: This record already exists. Please enter unique data.",
    });
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
// duplicate validations
// After data tranformation, validate data fields as per GHG specification.
