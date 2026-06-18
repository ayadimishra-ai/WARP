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
  TWastWaterTreatmentActivitySheetColumnNames,
  TWastWaterTreatmentActivitySheetNames,
  WasteWaterTreatmentActivityConstant,
} from "~/shared/constants/activity.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import { months, validateMonthYear } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

let yearMonthError: TErrorExcelSheet[] = [];
const { sheets: templateSheets } =
  WasteWaterTreatmentActivityConstant.excel_template;

const validUomAraryForWastWaterTreatment = [
  "litre",
  "gallon",
  "million litres",
  "kilolitres",
  "m3",
];

const hasAnyBodCodValue = (data: Record<string, any>) => {
  const bodCodFields = [
    "Influent BOD Concentration",
    "Treated Effluent BOD Concentration",
    "Influent COD Concentration",
    "Treated Effluent COD Concentration",
  ];

  return (
    bodCodFields.some(
      (field) => Number(data[field]) >= 0 && data[field] != null
    ) ||
    (typeof data.UoM_BOD === "string" && data.UoM_BOD.length > 0) ||
    (typeof data.UoM_COD === "string" && data.UoM_COD.length > 0)
  );
};

export const wasteWaterTreatmentData = (
  baseMonth: string,
  baseYear: number
) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Total Influent": z
        .unknown()
        .refine((val) => sanitizeString.v2(String(val)) !== "", {
          message: "Total Influent is required",
        })
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Please enter a valid numeric value for Total Influent."
        ),
      "Total Treated Effluent": z
        .unknown()
        .refine((val) => sanitizeString.v2(String(val)) !== "", {
          message: "Total Treated Effluent is required",
        })
        .transform((value) => {
          if (value === "") return 0;
          return Number(value);
        })
        .refine((n) => n >= 0, {
          message:
            "Please enter a valid numeric value for Total Treated Effluent.",
        }),
      // BOD fields - optional by default
      "Influent BOD Concentration": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "" || value === null || value === undefined)
            return null;
          return Number(value);
        })
        .refine((n) => n == null || (typeof n === "number" && n >= 0), {
          message:
            "Please enter a valid numeric value for Influent BOD Concentration.",
        }),
      "Treated Effluent BOD Concentration": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "" || value === null || value === undefined)
            return null;
          return Number(value);
        })
        .refine((n) => n == null || (typeof n === "number" && n >= 0), {
          message:
            "Please enter a valid numeric value for Treated Effluent BOD Concentration.",
        }),
      // COD fields - optional by default
      "Influent COD Concentration": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "" || value === null || value === undefined)
            return null;
          return Number(value);
        })
        .refine((n) => n == null || (typeof n === "number" && n >= 0), {
          message:
            "Please enter a valid numeric value for Influent COD Concentration.",
        }),
      "Treated Effluent COD Concentration": z
        .unknown()
        .optional()
        .transform((value) => {
          if (value === "" || value === null || value === undefined)
            return null;
          return Number(value);
        })
        .refine((n) => n == null || (typeof n === "number" && n >= 0), {
          message:
            "Please enter a valid numeric value for Treated Effluent COD Concentration.",
        }),
      // UoM fields - optional by default
      UoM_BOD: z
        // .union([
        //   z.string().min(1, { message: "UoM_BOD is required" }),
        //   z.number(),
        // ])
        .unknown()
        .optional()
        .refine(
          (value) =>
            !value || (typeof value === "string" && isNaN(Number(value))),
          {
            message: "Invalid input",
          }
        ),
      UoM_COD: z
        // .union([
        //   z.string().min(1, { message: "UoM_COD is required" }),
        //   z.number(),
        // ])
        .unknown()
        .optional()
        .refine(
          (value) =>
            !value || (typeof value === "string" && isNaN(Number(value))),
          {
            message: "Invalid input",
          }
        ),
      UoM_Influent_Effluent: z
        .union([
          z.string().min(1, { message: "UoM_Influent_Effluent is required" }),
          z.number(),
        ])
        .refine((value) => typeof value === "string" && isNaN(Number(value)), {
          message: "Invalid input",
        }),
    })
    .refine(
      (data) => {
        // Check if any BOD/COD related field has a value
        const hasAnyBodCodData = hasAnyBodCodValue(data);

        if (hasAnyBodCodData) {
          // If any BOD/COD field has value, all fields become mandatory
          return (
            Number(data["Influent BOD Concentration"]) >= 0 &&
            Number(data["Treated Effluent BOD Concentration"]) >= 0 &&
            Number(data["Influent COD Concentration"]) >= 0 &&
            Number(data["Treated Effluent COD Concentration"]) >= 0 &&
            typeof data.UoM_BOD === "string" &&
            data.UoM_BOD.length > 0 &&
            typeof data.UoM_COD === "string" &&
            data.UoM_COD.length > 0
          );
        }
        // If no BOD/COD fields have values, validation passes
        return true;
      },
      (data) => {
        const missingFields = [];

        if (
          Number(data["Influent BOD Concentration"]) < 0 ||
          data["Influent BOD Concentration"] == null
        ) {
          missingFields.push("Influent BOD Concentration");
        }
        if (
          Number(data["Treated Effluent BOD Concentration"]) < 0 ||
          data["Treated Effluent BOD Concentration"] == null
        ) {
          missingFields.push("Treated Effluent BOD Concentration");
        }
        if (
          Number(data["Influent COD Concentration"]) < 0 ||
          data["Influent COD Concentration"] == null
        ) {
          missingFields.push("Influent COD Concentration");
        }
        if (
          Number(data["Treated Effluent COD Concentration"]) < 0 ||
          data["Treated Effluent COD Concentration"] == null
        ) {
          missingFields.push("Treated Effluent COD Concentration");
        }
        if (!data.UoM_BOD || data.UoM_BOD.toString().length === 0) {
          missingFields.push("UoM_BOD");
        }
        if (!data.UoM_COD || data.UoM_COD.toString().length === 0) {
          missingFields.push("UoM_COD");
        }

        return {
          message:
            "All BOD and COD related fields (including UoM) are required when any BOD/COD field is filled",
          path: missingFields,
        };
      }
    )
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
    )
    .refine(
      (data) =>
        Number(data["Total Treated Effluent"]) <=
        Number(data["Total Influent"]),
      {
        message:
          "Value Out of Range: Treated Effluent volume cannot exceed incoming influent. Please verify and enter a correct value",
        path: ["Total Treated Effluent"],
      }
    )
    .refine(
      (data) =>
        Number(data["Treated Effluent BOD Concentration"]) <=
        Number(data["Influent BOD Concentration"]),
      {
        message:
          "Detected—effluent BOD exceeds influent values.Please verify and enter a correct value",
        path: ["Treated Effluent BOD Concentration"],
      }
    )
    .refine(
      (data) =>
        Number(data["Treated Effluent COD Concentration"]) <=
        Number(data["Influent COD Concentration"]),
      {
        message:
          "Detected—effluent COD exceeds influent values.Please verify and enter a correct value",
        path: ["Treated Effluent COD Concentration"],
      }
    );
};

export const wasteWaterEffluentDischargeData = (
  baseMonth: string,
  baseYear: number
) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Total Effluent Disposed Off": z
        .unknown()
        .refine((val) => sanitizeString.v2(String(val)) !== "", {
          message: "Total Effluent Disposed Off is required",
        })
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Please enter a valid numeric value for Total Effluent Disposed Off"
        ),
      UoM_Effluent: z
        .union([
          z.string().min(1, { message: "UoM_Effluent is required" }),
          z.number(), // Optional: If you want to allow number but with validation
        ])
        .refine((value) => typeof value === "string" && isNaN(Number(value)), {
          message: "Invalid input",
        }),
      "Point of Discharge": z
        .union([
          z.string().min(1, { message: "Point of Discharge is required" }),
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

export const wasteWaterSludgeDisposalData = (
  baseMonth: string,
  baseYear: number
) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Total Sludge Disposed Off": z
        .unknown()
        .refine((val) => sanitizeString.v2(String(val)) !== "", {
          message: "Total Sludge Disposed Off is required",
        })
        .transform(Number)
        .refine(
          (q) => Number(q) >= 0,
          "Please enter a valid numeric value for Total Sludge Disposed Off"
        ),
      "UoM_Sludge Disposed Off": z
        .union([
          z.string().min(1, { message: "UoM_Sludge Disposed Off is required" }),
          z.number(), // Optional: If you want to allow number but with validation
        ])
        .refine((value) => typeof value === "string" && isNaN(Number(value)), {
          message: "Invalid input",
        }),
      "Point of Sludge Disposal": z
        .union([
          z
            .string()
            .min(1, { message: "Point of Sludge Disposal is required" }),
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
const validateWasteWaterTreatmentDataSheet = (
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

    if (sheetName === "Wastewater Treatment") {
      safeparseData = wasteWaterTreatmentData(baseMonth, baseYear).safeParse(
        item
      );
    } else if (sheetName === "Effluent Discharge") {
      safeparseData = wasteWaterEffluentDischargeData(
        baseMonth,
        baseYear
      ).safeParse(item);
    } else if (sheetName === "Sludge Disposal") {
      safeparseData = wasteWaterSludgeDisposalData(
        baseMonth,
        baseYear
      ).safeParse(item);
    }

    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      WasteWaterTreatmentActivityConstant.excel_template.sheets
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
              if (issueitem.path && Array.isArray(issueitem.path)) {
                issueitem.path.forEach((element) => {
                  if (columnItem.name === element) {
                    columnObject[columnItem.name] = issueitem.message;
                  } else {
                    columnObject[columnItem.name] =
                      columnObject[columnItem.name] || "";
                  }
                });
              }
              // if (columnItem.name == issueitem.path[0]) {
              //   columnObject[columnItem.name] = issueitem.message;
              // } else {
              //   columnObject[columnItem.name] = "";
              // }
            }
          );
        });
      errorEntries.push(columnObject);
    }
  });
  return errorEntries;
};

const validateSheetMethods: Record<
  TWastWaterTreatmentActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number,
    sheetName: string
  ) => Record<string, any>[]
> = {
  "Wastewater Treatment": validateWasteWaterTreatmentDataSheet,
  "Effluent Discharge": validateWasteWaterTreatmentDataSheet,
  "Sludge Disposal": validateWasteWaterTreatmentDataSheet,
};

const waterDataValidate = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TWastWaterTreatmentActivitySheetNames]: Record<
      TWastWaterTreatmentActivitySheetColumnNames,
      any
    >[];
  } = {
    "Wastewater Treatment": [],
    "Effluent Discharge": [],
    "Sludge Disposal": [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWastWaterTreatmentActivitySheetNames;
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

const validateWastewaterTreatmentDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["UoM_Influent_Effluent"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_Influent_Effluent"],
        index,
        "waste_water_treatment_uom_influent_effluent",
        "UoM_Influent_Effluent",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }
    if (!!dataItem["UoM_BOD"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_BOD"],
        index,
        "waste_water_treatment_uom_bod",
        "UoM_BOD",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }
    if (!!dataItem["UoM_COD"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_COD"],
        index,
        "waste_water_treatment_uom_cod",
        "UoM_COD",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        WasteWaterTreatmentActivityConstant.excel_template.sheets.filter(
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

const validateEffluentDischargeDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["UoM_Effluent"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_Effluent"],
        index,
        "waste_water_treatment_uom_effluent",
        "UoM_Effluent",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }
    if (!!dataItem["Point of Discharge"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Point of Discharge"],
        index,
        "waste_water_treatment_point_of_discharge",
        "Point of Discharge",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        WasteWaterTreatmentActivityConstant.excel_template.sheets.filter(
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

const validateSludgeDisposalDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    if (!!dataItem["UoM_Sludge Disposed Off"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["UoM_Sludge Disposed Off"],
        index,
        "waste_water_treatment_uom_sludgedisposedoff",
        "UoM_Sludge Disposed Off",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }
    if (!!dataItem["Point of Sludge Disposal"]) {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Point of Sludge Disposal"],
        index,
        "waste_water_treatment_type_of_sludge_disposal",
        "Point of Sludge Disposal",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }
    if (errorEntries.length > 0) {
      let allcolumns: any =
        WasteWaterTreatmentActivityConstant.excel_template.sheets.filter(
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
  TWastWaterTreatmentActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Wastewater Treatment": validateWastewaterTreatmentDataSheet,
  "Effluent Discharge": validateEffluentDischargeDataSheet,
  "Sludge Disposal": validateSludgeDisposalDataSheet,
};

const validateDatabyDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.waste_water_treatment,
  });
  const failedEntries: {
    [key in TWastWaterTreatmentActivitySheetNames]: Record<
      TWastWaterTreatmentActivitySheetNames,
      any
    >[];
  } = {
    "Wastewater Treatment": [],
    "Effluent Discharge": [],
    "Sludge Disposal": [],
  };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWastWaterTreatmentActivitySheetNames;
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
    [key in TWastWaterTreatmentActivitySheetNames]: Record<
      TWastWaterTreatmentActivitySheetColumnNames,
      any
    >[];
  } = {
    "Wastewater Treatment": [],
    "Effluent Discharge": [],
    "Sludge Disposal": [],
  };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TWastWaterTreatmentActivitySheetNames;
    failedEntries[sheetName] = validateduplicateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};
const validateWastewaterTreatmentDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (!!dataItem["Year"] && !!dataItem["Month"]) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "UoM_Influent_Effluent",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["UoM_Influent_Effluent"],
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
        WasteWaterTreatmentActivityConstant.excel_template.sheets.filter(
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
const validateEffluentDischargeDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (
      !!dataItem["Point of Discharge"] &&
      !!dataItem["Year"] &&
      !!dataItem["Month"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "Point of Discharge",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["Point of Discharge"],
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
        WasteWaterTreatmentActivityConstant.excel_template.sheets.filter(
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
const validateSludgeDisposalDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table

    if (
      !!dataItem["Point of Sludge Disposal"] &&
      !!dataItem["Year"] &&
      !!dataItem["Month"]
    ) {
      const errorEntriesColumn5Data = validateduplidateDataByKey(
        index,
        "Point of Sludge Disposal",
        dataItem["Year"],
        dataItem["Month"],
        dataItem["Point of Sludge Disposal"],
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
        WasteWaterTreatmentActivityConstant.excel_template.sheets.filter(
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
  TWastWaterTreatmentActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  "Wastewater Treatment": validateWastewaterTreatmentDuplicateDataSheet,
  "Effluent Discharge": validateEffluentDischargeDuplicateDataSheet,
  "Sludge Disposal": validateSludgeDisposalDuplicateDataSheet,
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

    if (sheetName === "Wastewater Treatment")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${item["UoM_Influent_Effluent"]}`;
    else if (sheetName === "Effluent Discharge")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${item["Point of Discharge"]}`;
    else if (sheetName === "Sludge Disposal")
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}-${item["Point of Sludge Disposal"]}`;

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
