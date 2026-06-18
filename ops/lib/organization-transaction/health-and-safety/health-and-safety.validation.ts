import { UUID } from "crypto";
import { toNumber } from "lodash";
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
  validateColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import {
  AGENCY,
  CATEGORY_OF_WORKFORCE_TRAINED,
  CORRECTIVE_ACTIONS_CLOSED,
  FATALITIES_REPORTED,
  HealthandSafetyActivityConstant,
  HIGH_CONSEQUENCE_WORK_RELATED_INJURIES_REPORTED,
  LOST_TIME_INJURIES_LTI,
  LOST_WORKDAYS_DUE_TO_INJURY,
  MEDICAL_TREATMENT_INCIDENTS,
  NEAR_MISSES_REPORTED,
  NUMBER_OF_FIRE_INCIDENTS_REPORTED,
  NUMBER_OF_FIRST_AID_INCIDENTS,
  NUMBER_OF_MOCK_DRILLS_CONDUCTED,
  NUMBER_OF_PEOPLE_BENEFITTED_FROM_REGULAR_HEALTH_CHECKUPS,
  NUMBER_OF_WORKFORCE_TRAINED,
  THealthandSafetyActivitySheetColumnNames,
  THealthandSafetyActivitySheetNames,
  TOTAL_MAN_HOURS_WORKED,
  TOTAL_RECORDABLE_INJURIES_TRI,
  TOTAL_SAFETY_OBSERVATIONS_CLOSED_RESOLVED,
  TOTAL_TRAINING_HOURS,
  TRAINING_CATEGORY,
  TRAINING_TYPE,
  TYPE_OF_WORKFORCE_TRAINED,
  UNSAFE_ACTS_BEHAVIOUR_OBSERVATIONS_REPORTED,
} from "~/shared/constants/activity.constant";
import {
  ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED,
  ERROR_NUMERIC_VALUES_ARE_NOT_ALLOWED,
} from "~/shared/constants/error.constant";
import { ActivityMasterKey } from "~/shared/constants/input.constant";
import {
  months,
  validateMonthYear,
  validateYearWithoutMonth,
} from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

const { sheets: templateSheets } =
  HealthandSafetyActivityConstant.excel_template;
let yearMonthError: TErrorExcelSheet[] = [];

export const healthAndSafetyData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      "Workforce Type": z
        .string({
          invalid_type_error: "Invalid Input: Numeric values are not allowed",
        })
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: "Workforce Type is required",
        }),
      "Workforce Category": z
        .string({
          invalid_type_error: "Invalid Input: Numeric values are not allowed",
        })
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: "Workforce Category is required",
        }),
      // Total Man hours worked
      [TOTAL_MAN_HOURS_WORKED]: z
        .unknown()
        .refine((val) => val !== "", {
          message: `${TOTAL_MAN_HOURS_WORKED} is required  `,
        })
        .refine(
          (q) => !(String(q).trim() === ""),
          `${TOTAL_MAN_HOURS_WORKED} is required`
        )
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${TOTAL_MAN_HOURS_WORKED}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${TOTAL_MAN_HOURS_WORKED} cannot be negative. Please enter a positive number.`
        ),
      // Below are Optional fields
      // Fatalities Reported
      [FATALITIES_REPORTED]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${FATALITIES_REPORTED}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${FATALITIES_REPORTED} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),

      // High Consequence Work Related Injuries Reported
      [HIGH_CONSEQUENCE_WORK_RELATED_INJURIES_REPORTED]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${HIGH_CONSEQUENCE_WORK_RELATED_INJURIES_REPORTED}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${HIGH_CONSEQUENCE_WORK_RELATED_INJURIES_REPORTED} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),

      // Total Recordable Injuries (TRI)
      [TOTAL_RECORDABLE_INJURIES_TRI]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${TOTAL_RECORDABLE_INJURIES_TRI}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${TOTAL_RECORDABLE_INJURIES_TRI} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),
      // Lost Time Injuries (LTI)
      [LOST_TIME_INJURIES_LTI]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${LOST_TIME_INJURIES_LTI}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${LOST_TIME_INJURIES_LTI} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),

      // Near Misses Reported
      [NEAR_MISSES_REPORTED]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${NEAR_MISSES_REPORTED}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${NEAR_MISSES_REPORTED} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),
      // Lost Workdays (Due to Injury)
      [LOST_WORKDAYS_DUE_TO_INJURY]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${LOST_WORKDAYS_DUE_TO_INJURY}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${LOST_WORKDAYS_DUE_TO_INJURY} cannot be negative. Please enter a positive number.`
        ),
      // Number of First Aid Incidents
      [NUMBER_OF_FIRST_AID_INCIDENTS]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${NUMBER_OF_FIRST_AID_INCIDENTS}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${NUMBER_OF_FIRST_AID_INCIDENTS} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),
      // Medical Treatment Incidents
      [MEDICAL_TREATMENT_INCIDENTS]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${MEDICAL_TREATMENT_INCIDENTS}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${MEDICAL_TREATMENT_INCIDENTS} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),
      // Number of people benefitted from regular health checkups
      [NUMBER_OF_PEOPLE_BENEFITTED_FROM_REGULAR_HEALTH_CHECKUPS]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${NUMBER_OF_PEOPLE_BENEFITTED_FROM_REGULAR_HEALTH_CHECKUPS}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${NUMBER_OF_PEOPLE_BENEFITTED_FROM_REGULAR_HEALTH_CHECKUPS} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),
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

export const safetyObservationsData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      // Optional fields
      [UNSAFE_ACTS_BEHAVIOUR_OBSERVATIONS_REPORTED]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${UNSAFE_ACTS_BEHAVIOUR_OBSERVATIONS_REPORTED}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${UNSAFE_ACTS_BEHAVIOUR_OBSERVATIONS_REPORTED} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),

      [TOTAL_SAFETY_OBSERVATIONS_CLOSED_RESOLVED]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${TOTAL_SAFETY_OBSERVATIONS_CLOSED_RESOLVED}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${TOTAL_SAFETY_OBSERVATIONS_CLOSED_RESOLVED} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),

      // Corrective Actions Closed
      [CORRECTIVE_ACTIONS_CLOSED]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${CORRECTIVE_ACTIONS_CLOSED}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${CORRECTIVE_ACTIONS_CLOSED} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),

      [NUMBER_OF_MOCK_DRILLS_CONDUCTED]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${NUMBER_OF_MOCK_DRILLS_CONDUCTED}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${NUMBER_OF_MOCK_DRILLS_CONDUCTED} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),

      [NUMBER_OF_FIRE_INCIDENTS_REPORTED]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid Entry: Please enter a valid numeric value for ${NUMBER_OF_FIRE_INCIDENTS_REPORTED}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${NUMBER_OF_FIRE_INCIDENTS_REPORTED} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),
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

export const healthAndSafetyTrainingData = (
  baseMonth: string,
  baseYear: number
) => {
  return YearMonthSchema(baseYear)
    .extend({
      [TYPE_OF_WORKFORCE_TRAINED]: z
        .string({
          invalid_type_error: "Invalid Input: Numeric values are not allowed",
        })
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: `${TYPE_OF_WORKFORCE_TRAINED} is required`,
        })
        .refine((val) => val === undefined || /^[a-zA-Z0-9\s]*$/.test(val), {
          message: `${TYPE_OF_WORKFORCE_TRAINED} must not contain special characters`,
        }),
      [CATEGORY_OF_WORKFORCE_TRAINED]: z
        .string({
          required_error: `${CATEGORY_OF_WORKFORCE_TRAINED} is required`,
          invalid_type_error: "Invalid Input: Numeric values are not allowed",
        })
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: `${CATEGORY_OF_WORKFORCE_TRAINED} is required`,
        })
        .refine((val) => val === undefined || /^[a-zA-Z0-9\s]*$/.test(val), {
          message: `${CATEGORY_OF_WORKFORCE_TRAINED} must not contain special characters`,
        }),
      // Optional fields
      [TRAINING_TYPE]: z
        .string({
          invalid_type_error: "Invalid Input: Numeric values are not allowed",
        })
        .transform((val) => (val.trim() === "" ? undefined : val.trim()))
        .refine((val) => val === undefined || /^[a-zA-Z0-9\s]*$/.test(val), {
          message: `${TRAINING_TYPE} must not contain special characters`,
        })
        .optional(),

      //Training Category
      [TRAINING_CATEGORY]: z
        .string({
          invalid_type_error: "Invalid Input: Numeric values are not allowed",
        })
        .transform((val) => (val.trim() === "" ? undefined : val.trim()))
        .refine(
          (val) => val === undefined || /^[a-zA-Z0-9\s\-'&]*$/.test(val),
          {
            message: `${TRAINING_CATEGORY} may only contain letters, numbers, spaces, hyphens (-), apostrophes ('), and ampersands (&)`,
          }
        )
        .optional(),

      [NUMBER_OF_WORKFORCE_TRAINED]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid entry: Please enter a valid number for ${NUMBER_OF_WORKFORCE_TRAINED}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${NUMBER_OF_WORKFORCE_TRAINED} cannot be negative. Please enter a positive number.`
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: Decimal values are not allowed`
        ),

      [TOTAL_TRAINING_HOURS]: z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          `Invalid entry: Please enter a valid number for ${TOTAL_TRAINING_HOURS}. Text or special characters are not allowed.`
        )
        .refine(
          (n) => n >= 0,
          `Invalid Input: The value for ${TOTAL_TRAINING_HOURS} cannot be negative. Please enter a positive number.`
        ),
      [AGENCY]: z
        .string({
          invalid_type_error: "Invalid Input: Numeric values are not allowed",
        })
        .transform((val) => (val.trim() === "" ? undefined : val.trim()))
        .refine((val) => val === undefined || /^[a-zA-Z0-9\s]*$/.test(val), {
          message: `${AGENCY} must not contain special characters`,
        })
        .optional(),
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

export const assessedLocationsData = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear)
    .extend({
      // Optional fields
      "Total Locations": z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Entry: Please enter a valid numeric value for Total Locations. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Total Locations cannot be negative. Please enter a positive number."
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),

      "Number of Locations Assessed on Health and Safety Practices": z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Entry: Please enter a valid numeric value for Number of Locations Assessed on Health and Safety Practices. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Number of Locations Assessed on Health and Safety Practices cannot be negative. Please enter a positive number."
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),

      "Number of Locations Assessed on Working Conditions": z
        .unknown()
        .optional()
        .transform((val) => Number(val))
        .refine(
          (n) => !isNaN(n),
          "Invalid Entry: Please enter a valid numeric value for Number of Locations Assessed on Working Conditions. Text or special characters are not allowed."
        )
        .refine(
          (n) => n >= 0,
          "Invalid Input: The value for Number of Locations Assessed on Working Conditions cannot be negative. Please enter a positive number."
        )
        .refine(
          (n) => Number.isInteger(toNumber(n)),
          `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
        ),

      "Assessed by": z
        .string({
          invalid_type_error: `Invalid Input: ${ERROR_NUMERIC_VALUES_ARE_NOT_ALLOWED}`,
        })
        .transform((val) => (val.trim() === "" ? undefined : val.trim()))
        .refine((val) => val === undefined || /^[a-zA-Z0-9\s]*$/.test(val), {
          message: "Assessed by must not contain special characters",
        })
        .optional(),
    })
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (month) =>
            sanitizeString.v1(month) ==
            sanitizeString.v1(Month?.toString() || "")
        );
        if (fullNameMonth.length > 0) {
          yearMonthError = validateYearWithoutMonth(
            Month?.toString() || "",
            Number(Year),
            baseMonth,
            baseYear
          );
          return yearMonthError.length == 0;
        }
        return true;
      },
      ({ Year }) => ({
        message: yearMonthError[0].errorMessage,
        path: Object.keys({ Year }),
      })
    );
};

const validateHealthAndSafetyDataSheet = (
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
    if (sheetName === "Health and Safety") {
      safeparseData = healthAndSafetyData(baseMonth, baseYear).safeParse(item);
    } else if (sheetName === "Safety Observations") {
      safeparseData = safetyObservationsData(baseMonth, baseYear).safeParse(
        item
      );
    } else if (sheetName === "Health and Safety Training") {
      safeparseData = healthAndSafetyTrainingData(
        baseMonth,
        baseYear
      ).safeParse(item);
    } else if (sheetName === "Assessed Locations") {
      safeparseData = assessedLocationsData(baseMonth, baseYear).safeParse(
        item
      );
    }

    if (!safeparseData.success) {
      columnObject["Row Number"] = index;
      HealthandSafetyActivityConstant.excel_template.sheets
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
  THealthandSafetyActivitySheetNames,
  (
    sheet: TExcelSheet,
    baseMonth: string,
    baseYear: number,
    sheetName: string
  ) => Record<string, any>[]
> = {
  "Health and Safety": validateHealthAndSafetyDataSheet,
  "Safety Observations": validateHealthAndSafetyDataSheet,
  "Health and Safety Training": validateHealthAndSafetyDataSheet,
  "Assessed Locations": validateHealthAndSafetyDataSheet,
};

const healthAndSafetyDataValidate = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in THealthandSafetyActivitySheetNames]: Record<
      THealthandSafetyActivitySheetColumnNames,
      any
    >[];
  } = {
    "Health and Safety": [],
    "Safety Observations": [],
    "Health and Safety Training": [],
    "Assessed Locations": [],
  };
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as THealthandSafetyActivitySheetNames;
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

export const validateHealthAndSafetyExcelTemplate = (
  excelData: TExcelSheet[]
) => {
  let errorMessageData: TTemplateErrorData[] = [];
  //  check for blanks sheets
  let sheetswithOutData: number = excelData.filter(
    (errorItem) => errorItem.data.length > 0
  ).length;
  const totalData = excelData?.reduce(
    (acc: any, record: any) => acc + record.data.length,
    0
  );

  if (totalData > 10000) {
    errorMessageData.push({
      sheet: templateSheets.map((items) => items.name).join(", "),
      error_message: "Maximum 10,000 records can be uploaded at a time",
    });
  } else {
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
          const templateColumnNames = templateSheet.columns.map((m) => m.name);
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
        sheet: "",
        error_message:
          "Enter data in at least one sheets " +
          excelData.map((item) => item.sheetName),
      });
    }
  }
  return errorMessageData;
};

const validateMasterHealthandSafetyDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data

    const errorEntriesColumn1Data = validateActivityMasterDataByKey(
      ActivityMasterData,
      dataItem["Workforce Type"],
      index,
      "Health_and_Safety_Workforce_Type",
      "Workforce Type",
      ApiHitType.Excel
    );
    if (errorEntriesColumn1Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn1Data[0] });
    }

    const errorEntriesColumn2Data = validateActivityMasterDataByKey(
      ActivityMasterData,
      dataItem["Workforce Category"],
      index,
      "Health_and_Safety_Workforce_Category",
      "Workforce Category",
      ApiHitType.Excel
    );
    if (errorEntriesColumn2Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn2Data[0] });
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        HealthandSafetyActivityConstant.excel_template.sheets.filter(
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

const validateMasterHealthAndSafetyTrainingDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data

    const errorEntriesColumn1Data = validateActivityMasterDataByKey(
      ActivityMasterData,
      dataItem["Type of Workforce Trained"],
      index,
      "Health_and_Safety_Workforce_Type",
      "Type of Workforce Trained",
      ApiHitType.Excel
    );
    if (errorEntriesColumn1Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn1Data[0] });
    }

    const errorEntriesColumn2Data = validateActivityMasterDataByKey(
      ActivityMasterData,
      dataItem["Category of Workforce Trained"],
      index,
      "Health_and_Safety_Workforce_Category",
      "Category of Workforce Trained",
      ApiHitType.Excel
    );
    if (errorEntriesColumn2Data.length > 0) {
      errorEntries.push({ ...errorEntriesColumn2Data[0] });
    }
    if (dataItem["Training Type"].toString().trim() !== "") {
      const errorEntriesColumn3Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Training Type"],
        index,
        "Health_and_Safety_Training_Type",
        "Training Type",
        ApiHitType.Excel
      );
      if (errorEntriesColumn3Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn3Data[0] });
      }
    }
    if (dataItem["Agency"].toString().trim() !== "") {
      const errorEntriesColumn4Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Agency"],
        index,
        "Health_and_Safety_Agency",
        "Agency",
        ApiHitType.Excel
      );
      if (errorEntriesColumn4Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn4Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        HealthandSafetyActivityConstant.excel_template.sheets.filter(
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

const validateMasterAssessedLocationsDataSheet = (
  sheet: TExcelSheet,
  ActivityMasterData: TActivityMasterData[]
) => {
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data

    if (dataItem["Assessed by"].toString().trim() !== "") {
      const errorEntriesColumn1Data = validateActivityMasterDataByKey(
        ActivityMasterData,
        dataItem["Assessed by"],
        index,
        "Health_and_Safety_Assessed_By",
        "Assessed by",
        ApiHitType.Excel
      );
      if (errorEntriesColumn1Data.length > 0) {
        errorEntries.push({ ...errorEntriesColumn1Data[0] });
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        HealthandSafetyActivityConstant.excel_template.sheets.filter(
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

const validateMasterDataSheetMethods: Record<
  THealthandSafetyActivitySheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>[]
> = {
  "Health and Safety": validateMasterHealthandSafetyDataSheet,
  "Safety Observations": () => [],
  "Health and Safety Training": validateMasterHealthAndSafetyTrainingDataSheet,
  "Assessed Locations": validateMasterAssessedLocationsDataSheet,
};

const healthAndSafetyDataValidateByDB = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.health_and_safety,
  });
  const failedEntries: {
    [key in THealthandSafetyActivitySheetNames]: Record<
      THealthandSafetyActivitySheetNames,
      any
    >[];
  } = {
    "Health and Safety": [],
    "Safety Observations": [],
    "Health and Safety Training": [],
    "Assessed Locations": [],
  };

  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as THealthandSafetyActivitySheetNames;

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
export const validateHealthAndSafetyExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];
  const zodErrorEnteries: TExcelSheet[] = await healthAndSafetyDataValidate(
    excelData,
    organizationId
  );
  // **************Code to be written for master entry************
  const masterErrorEntries: TExcelSheet[] =
    await healthAndSafetyDataValidateByDB(excelData, organizationId);

  // duplicate validations
  const duplicateEntries: TExcelSheet[] =
    await handleCheckDuplicates(excelData);

  allError = combineAllErrorSheets(zodErrorEnteries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  allError = combineAllErrorSheets(duplicateEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};

// duplicate validations
const handleCheckDuplicates = async (excelData: TExcelSheet[]) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in THealthandSafetyActivitySheetNames]: Record<
      THealthandSafetyActivitySheetColumnNames,
      any
    >[];
  } = {
    "Health and Safety": [],
    "Safety Observations": [],
    "Health and Safety Training": [],
    "Assessed Locations": [],
  };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as THealthandSafetyActivitySheetNames;
    failedEntries[sheetName] = validateduplicateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

const validateHealthandSafetyDuplicateDataSheet = (sheet: TExcelSheet) => {
  //validate duplicate DataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  let sheetName = sheet.sheetName;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data

    if (sheetName === "Health and Safety") {
      if (
        !!dataItem["Workforce Category"] &&
        !!dataItem["Workforce Type"] &&
        !!dataItem["Year"] &&
        !!dataItem["Month"]
      ) {
        const errorEntriesColumn5Data = validateDuplicateDataByKeyforSheet1and3(
          index,
          "Workforce Type",
          "Workforce Category",
          dataItem["Year"],
          dataItem["Month"],
          dataItem["Workforce Type"],
          dataItem["Workforce Category"],
          sheet
        );
        if (errorEntriesColumn5Data.length > 0) {
          for (let i = 0; i < errorEntriesColumn5Data.length; i++) {
            errorEntries.push({ ...errorEntriesColumn5Data[i] });
          }
        }
      }
    } else if (sheetName === "Health and Safety Training") {
      if (
        !!dataItem["Category of Workforce Trained"] &&
        !!dataItem["Type of Workforce Trained"] &&
        !!dataItem["Year"] &&
        !!dataItem["Month"]
      ) {
        const errorEntriesColumn5Data = validateDuplicateDataByKeyforSheet1and3(
          index,
          "Type of Workforce Trained",
          "Category of Workforce Trained",
          dataItem["Year"],
          dataItem["Month"],
          dataItem["Type of Workforce Trained"],
          dataItem["Category of Workforce Trained"],
          sheet
        );
        if (errorEntriesColumn5Data.length > 0) {
          for (let i = 0; i < errorEntriesColumn5Data.length; i++) {
            errorEntries.push({ ...errorEntriesColumn5Data[i] });
          }
        }
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        HealthandSafetyActivityConstant.excel_template.sheets.filter(
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

const validateSafetyObservationandAssessedLocationduplicateDataSheet = (
  sheet: TExcelSheet
) => {
  //validateduplidateDataByKey
  const sheetAllerrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  let sheetName = sheet.sheetName;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data

    if (sheetName === "Safety Observations") {
      if (!!dataItem["Year"] && !!dataItem["Month"]) {
        const errorEntriesColumn5Data = validateduplidateDataByKeyforSheet2and4(
          index,
          dataItem["Year"],
          dataItem["Month"],
          sheet
        );
        if (errorEntriesColumn5Data.length > 0) {
          for (let i = 0; i < errorEntriesColumn5Data.length; i++) {
            errorEntries.push({ ...errorEntriesColumn5Data[i] });
          }
        }
      }
    } else if (sheetName === "Assessed Locations") {
      if (!!dataItem["Year"] && !!dataItem["Month"]) {
        const errorEntriesColumn5Data = validateduplidateDataByKeyforSheet2and4(
          index,
          dataItem["Year"],
          dataItem["Month"],
          sheet
        );
        if (errorEntriesColumn5Data.length > 0) {
          for (let i = 0; i < errorEntriesColumn5Data.length; i++) {
            errorEntries.push({ ...errorEntriesColumn5Data[i] });
          }
        }
      }
    }

    if (errorEntries.length > 0) {
      let allcolumns: any =
        HealthandSafetyActivityConstant.excel_template.sheets.filter(
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
  THealthandSafetyActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  "Health and Safety": validateHealthandSafetyDuplicateDataSheet,
  "Safety Observations":
    validateSafetyObservationandAssessedLocationduplicateDataSheet,
  "Health and Safety Training": validateHealthandSafetyDuplicateDataSheet,
  "Assessed Locations":
    validateSafetyObservationandAssessedLocationduplicateDataSheet,
};

export const validateDuplicateDataByKeyforSheet1and3 = (
  index: number,
  columnName1: string,
  columnName2: string,
  Year: string,
  month: string,
  workforce_type: string,
  workforce_category: string,
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
    const uniqueKeyIndex = `${Year}-${month}-${workforce_type}-${workforce_category}`;

    let uniqueKeyRow = "";

    if (sheetName === "Health and Safety")
      uniqueKeyRow = `${item["Year"]}-${item["Month"]}-${item["Workforce Type"]}-${item["Workforce Category"]}`;
    else if (sheetName === "Health and Safety Training")
      uniqueKeyRow = `${item["Year"]}-${item["Month"]}-${item["Type of Workforce Trained"]}-${item["Category of Workforce Trained"]}`;

    if (uniqueKeyRow === uniqueKeyIndex) {
      // Check for duplicates
      if (seenEntries.has(uniqueKeyRow)) {
        columnObject["Row Number"] = index1;
        columnObject["Error"] = "Duplicate entry detected";
        duplicateEntries.push(columnObject);
      } else {
        seenEntries.add(uniqueKeyRow); // Mark the current entry as seen
      }
    }
  });
  length = duplicateEntries.length;
  if (length > 0) {
    errorEntries.push({
      column: columnName1,
      row: index,
      errorMessage:
        "Duplicate Entry Detected: This record already exists. Please enter unique data.",
    });
    errorEntries.push({
      column: columnName2,
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
export const validateduplidateDataByKeyforSheet2and4 = (
  index: number,
  Year: string,
  month: string,
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
    let uniqueKeyIndex = "";
    let uniqueKeyrow = "";

    if (sheetName === "Safety Observations") {
      uniqueKeyIndex = `${Year}-${month}`;
      uniqueKeyrow = `${item["Year"]}-${item["Month"]}`;
    } else if (sheetName === "Assessed Locations") {
      uniqueKeyIndex = `${Year}`;
      uniqueKeyrow = `${item["Year"]}`;
    }

    if (uniqueKeyrow === uniqueKeyIndex) {
      // Check for duplicates
      if (seenEntries.has(uniqueKeyrow)) {
        columnObject["Row Number"] = index1;
        columnObject["Error"] = "Duplicate entry detected";
        duplicateEntries.push(columnObject);
      } else {
        seenEntries.add(uniqueKeyrow); // Mark the current entry as seen
      }
    }
  });
  length = duplicateEntries.length;
  if (length > 0) {
    errorEntries.push({
      column: "Year",
      row: index,
      errorMessage:
        "Duplicate Entry Detected: This record already exists. Please enter unique data.",
    });
    if (sheet.sheetName === "Safety Observations")
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
