import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
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
} from "@/modules/ghg/lib/excel/excel.service";
import {
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "@/modules/ghg/lib/excel/excel.validation";
import {
  fugitiveActivityConstant,
  TFugitiveActivitySheetColumnNames,
  TFugitiveActivitySheetNames,
} from "@/modules/ghg/shared/constants/activity.constant";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";
import { months, validateMonthYear } from "@/modules/ghg/utils/date.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } = fugitiveActivityConstant.excel_template;

export const refrigerantAndACSystemsData = (
  baseMonth: string,
  baseYear: number
) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Type of Refrigerant used": z.coerce
        .string()
        .min(1, { message: "Type of Refrigerant used is required" }),
      // .regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9 -]+$/, {
      //   message:
      //     "Invalid value: The data in this column must match the corresponding values in the respective column of the Master sheet.",
      // }),
      "Quantity of Refrigerant filled": z
        .unknown()
        .refine((val) => val !== "", {
          message: "Quantity of Refrigerant filled is required",
        })
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Entry: Please enter a valid numeric value for Quantity of Refrigerant filled. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Entry: The value for Quantity of Refrigerant filled cannot be negative. Please enter a positive number."
        ),
      UoM: z.coerce
        .string()
        .min(1, { message: "UoM is required" })
        .regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9 -]+$/, {
          message:
            "Invalid value: The data in this column must match the corresponding values in the respective column of the Master sheet.",
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

export const fireExtinguisherData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Gas used in Fire extinguisher": z.coerce
        .string()
        .min(1, { message: "Gas used in Fire extinguisher is required" }),
      // .regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9 -]+$/, {
      //   message:
      //     "Invalid value: The data in this column must match the corresponding values in the respective column of the Master sheet.",
      // }),
      "Quantity of gas filled": z
        .unknown()
        .refine((val) => val !== "", {
          message: "Quantity of gas filled is required",
        })
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Entry: Please enter a valid numeric value for Quantity of gas filled. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Entry: The value for Quantity of gas filled cannot be negative. Please enter a positive number."
        ),
      UoM: z.coerce
        .string()
        .min(1, { message: "UoM is required" })
        .regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9 -]+$/, {
          message:
            "Invalid value: The data in this column must match the corresponding values in the respective column of the Master sheet.",
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

export const industrialGasData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Type of Industrial Gas used": z.coerce
        .string()
        .min(1, { message: "Type of Industrial Gas used is required" }),
      // .regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9 -]+$/, {
      //   message:
      //     "Invalid value: The data in this column must match the corresponding values in the respective column of the Master sheet.",
      // }),

      "Quantity of Industrial Gas filled": z
        .unknown()
        .refine((val) => val !== "", {
          message: "Quantity of Industrial Gas filled is required",
        })
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Entry: Please enter a valid numeric value for Quantity of Industrial Gas filled. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Entry: The value for Quantity of Industrial Gas filled cannot be negative. Please enter a positive number."
        ),
      UoM: z.coerce
        .string()
        .min(1, { message: "UoM is required" })
        .regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9 -]+$/, {
          message:
            "Invalid value: The data in this column must match the corresponding values in the respective column of the Master sheet.",
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

//call zod validation methods from this method.
const validateFugitiveDataSheet = (
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

    if (sheetName === "Refrigerant and AC Systems") {
      safeparseData = refrigerantAndACSystemsData(
        baseMonth,
        baseYear
      ).safeParse(item);
    } else if (sheetName === "Fire Extinguisher") {
      safeparseData = fireExtinguisherData(baseMonth, baseYear).safeParse(item);
    } else if (sheetName === "Industrial Gas") {
      safeparseData = industrialGasData(baseMonth, baseYear).safeParse(item);
    }

    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      fugitiveActivityConstant.excel_template.sheets
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
  TFugitiveActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number,
    sheetName: string
  ) => Record<string, any>[]
> = {
  "Refrigerant and AC Systems": validateFugitiveDataSheet,
  "Fire Extinguisher": validateFugitiveDataSheet,
  "Industrial Gas": validateFugitiveDataSheet,
};

const fugitiveDataValidate = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TFugitiveActivitySheetNames]: Record<
      TFugitiveActivitySheetColumnNames,
      any
    >[];
  } = {
    "Refrigerant and AC Systems": [],
    "Fire Extinguisher": [],
    "Industrial Gas": [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TFugitiveActivitySheetNames;
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

const validateRefrigerantAndACSystemsDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Type of Refrigerant used"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Type of Refrigerant used"],
        index,
        "fugitive_type_of_refrigerant_used",
        "Type of Refrigerant used",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      } else {
        const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
          ActivityMasterData,
          dataItem["Type of Refrigerant used"],
          dataItem["UoM"],
          index,
          "fugitive_type_of_refrigerant_uom",
          "UoM",
          ApiHitType.Excel,
          "fugitive_type_of_refrigerant_used"
        );
        if (errorEntriesColumn2Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn2Data[0] });
        }
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        fugitiveActivityConstant.excel_template.sheets.filter(
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

const validateFireExtinguisherDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Gas used in Fire extinguisher"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Gas used in Fire extinguisher"],
        index,
        "fugitive_gas_used_in_fire_extinguisher",
        "Gas used in Fire extinguisher",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      } else {
        const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
          ActivityMasterData,
          dataItem["Gas used in Fire extinguisher"],
          dataItem["UoM"],
          index,
          "fugitive_gas_used_in_fire_extinguisher_uom",
          "UoM",
          ApiHitType.Excel,
          "fugitive_gas_used_in_fire_extinguisher"
        );
        if (errorEntriesColumn2Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn2Data[0] });
        }
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        fugitiveActivityConstant.excel_template.sheets.filter(
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

const validateIndustrialGasDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["Type of Industrial Gas used"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Type of Industrial Gas used"],
        index,
        "fugitive_type_of_industrial_gas_used",
        "Type of Industrial Gas used",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      } else {
        const errorEntriesColumn2Data = validateActivityMasterDataGroupByKey(
          ActivityMasterData,
          dataItem["Type of Industrial Gas used"],
          dataItem["UoM"],
          index,
          "fugitive_type_of_industrial_gas_used_uom",
          "UoM",
          ApiHitType.Excel,
          "fugitive_type_of_industrial_gas_used"
        );
        if (errorEntriesColumn2Data.length > 0) {
          errorEntries.push({ ...errorEntriesColumn2Data[0] });
        }
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        fugitiveActivityConstant.excel_template.sheets.filter(
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
  TFugitiveActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Refrigerant and AC Systems": validateRefrigerantAndACSystemsDataSheet,
  "Fire Extinguisher": validateFireExtinguisherDataSheet,
  "Industrial Gas": validateIndustrialGasDataSheet,
};

const validateDatabyDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.fugitive,
  });
  const failedEntries: {
    [key in TFugitiveActivitySheetNames]: Record<
      TFugitiveActivitySheetNames,
      any
    >[];
  } = {
    "Refrigerant and AC Systems": [],
    "Fire Extinguisher": [],
    "Industrial Gas": [],
  };
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TFugitiveActivitySheetNames;
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

// Validate each excel sheet column names based on activity.
export const validateFugitiveExcelTemplate = (excelData: TExcelSheet[]) => {
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

// Validate each excel sheet cells based on column data type.
export const validateFugitiveExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] = await fugitiveDataValidate(
    excelData,
    organizationId
  );
  const masterErrorEntries: TExcelSheet[] = await validateDatabyDb(
    excelData,
    organizationId
  );

  // // duplicate validations
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
    [key in TFugitiveActivitySheetNames]: Record<
      TFugitiveActivitySheetColumnNames,
      any
    >[];
  } = {
    "Refrigerant and AC Systems": [],
    "Fire Extinguisher": [],
    "Industrial Gas": [],
  };
  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TFugitiveActivitySheetNames;
    failedEntries[sheetName] = validateduplicateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

const validateRefrigerantAndACSystemsDuplicateDataSheet = (
  sheet: TExcelSheet
) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (
      !!dataItem["Type of Refrigerant used"] &&
      !!dataItem["Year"] &&
      !!dataItem["Month"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "Type of Refrigerant used",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["Type of Refrigerant used"],
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
        fugitiveActivityConstant.excel_template.sheets.filter(
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

const validateFireExtinguisherDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (
      !!dataItem["Gas used in Fire extinguisher"] &&
      !!dataItem["Year"] &&
      !!dataItem["Month"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "Gas used in Fire extinguisher",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["Gas used in Fire extinguisher"],
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
        fugitiveActivityConstant.excel_template.sheets.filter(
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

const validateIndustrialGasDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (
      !!dataItem["Type of Industrial Gas used"] &&
      !!dataItem["Year"] &&
      !!dataItem["Month"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "Type of Industrial Gas used",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["Type of Industrial Gas used"],
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
        fugitiveActivityConstant.excel_template.sheets.filter(
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
  TFugitiveActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  "Refrigerant and AC Systems":
    validateRefrigerantAndACSystemsDuplicateDataSheet,
  "Fire Extinguisher": validateFireExtinguisherDuplicateDataSheet,
  "Industrial Gas": validateIndustrialGasDuplicateDataSheet,
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

    if (sheetName === "Refrigerant and AC Systems")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${item["Type of Refrigerant used"]}`;
    else if (sheetName === "Fire Extinguisher")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${item["Gas used in Fire extinguisher"]}`;
    else if (sheetName === "Industrial Gas")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${item["Type of Industrial Gas used"]}`;

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
