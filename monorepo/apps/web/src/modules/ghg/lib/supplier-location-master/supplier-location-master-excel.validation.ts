import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  TErrorExcelSheet,
  TExcelSheet,
  TTemplateErrorData,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  validateColumnNames,
  validateSheetName,
} from "@/modules/ghg/lib/excel/excel.validation";
import {
  LOCATION_ADDRESS,
  LOCATION_CODE,
  LOCATION_COUNTRY,
  LOCATION_NAME,
  LOCATION_PIN_OR_ZIP_CODE,
  SUPPLIER_CODE,
  SUPPLIER_LOCATIONS,
  SupplierLocationMasterActivityConstant,
  TSupplierLocationMasterActivitySheetColumnNames,
  TSupplierLocationMasterActivitySheetNames,
} from "@/modules/ghg/shared/constants/supplier-location-master-activity.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

const { sheets: templateSheets } =
  SupplierLocationMasterActivityConstant.excel_template;

// ─── Template Validation ───────────────────────────────────────────────────

export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
  const errorMessageData: TTemplateErrorData[] = [];

  templateSheets.forEach((templateSheet) => {
    const sheetValidations = validateSheetName(excelData, templateSheet.name);
    if (sheetValidations.length > 0) {
      errorMessageData.push({ ...sheetValidations[0] });
    }

    if (excelData?.[0]?.data?.length > 0) {
      if (sheetValidations.length === 0) {
        const templateColumnNames = templateSheet.columns.map((m) => m.name);
        const sheetData = excelData.filter(
          (s) =>
            sanitizeString.v1(s.sheetName) ===
            sanitizeString.v1(templateSheet.name)
        )[0];
        const columnsValidations = validateColumnNames(
          sheetData,
          templateColumnNames
        );
        if (columnsValidations.length > 0) {
          columnsValidations.forEach((v) => errorMessageData.push(v));
        } else if (sheetData.data.length > 10000) {
          errorMessageData.push({
            sheet: templateSheet.name,
            error_message: "Maximum 10,000 records can be uploaded at a time",
          });
        }
      }
    } else {
      errorMessageData.push({
        sheet: templateSheet.name,
        error_message: `No data found in sheet '${templateSheet.name}'`,
      });
    }
  });

  return errorMessageData;
};

// ─── Zod Row Schema ────────────────────────────────────────────────────────

const supplierLocationMasterSchema = () => {
  return z.object({
    [SUPPLIER_CODE]: z.preprocess(
      (val) => (typeof val !== "string" ? String(val) : val),
      z
        .string({ required_error: `${SUPPLIER_CODE} is required` })
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: `${SUPPLIER_CODE} is required`,
        })
    ),

    [LOCATION_NAME]: z.preprocess(
      (val) => (typeof val !== "string" ? String(val) : val),
      z
        .string({ required_error: `${LOCATION_NAME} is required` })
        .max(255, {
          message: `${LOCATION_NAME} cannot exceed 255 characters`,
        })
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: `${LOCATION_NAME} is required`,
        })
    ),

    [LOCATION_CODE]: z.preprocess(
      (val) => {
        if (val === null || val === undefined || val === "") return undefined;
        return typeof val !== "string" ? String(val) : val;
      },
      z
        .string()
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .optional()
    ),

    [LOCATION_ADDRESS]: z.preprocess(
      (val) => (typeof val !== "string" ? String(val) : val),
      z
        .string({ required_error: `${LOCATION_ADDRESS} is required` })
        .max(2000, {
          message: `${LOCATION_ADDRESS} cannot exceed 2000 characters`,
        })
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: `${LOCATION_ADDRESS} is required`,
        })
        .refine((val) => /^[a-zA-Z0-9 ,.\-/_]*$/.test(val), {
          message: `Invalid Input: ${LOCATION_ADDRESS} may only contain letters, numbers, spaces, and punctuation (, . - / _)`,
        })
    ),

    [LOCATION_COUNTRY]: z.preprocess(
      (val) => (typeof val !== "string" ? String(val) : val),
      z
        .string({ required_error: `${LOCATION_COUNTRY} is required` })
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: `${LOCATION_COUNTRY} is required`,
        })
        .refine((val) => /^[a-zA-Z ]*$/.test(val), {
          message: `Invalid Input: ${LOCATION_COUNTRY} must only contain alphabets`,
        })
    ),

    [LOCATION_PIN_OR_ZIP_CODE]: z.preprocess(
      (val) => (typeof val !== "string" ? String(val) : val),
      z
        .string({ required_error: `${LOCATION_PIN_OR_ZIP_CODE} is required` })
        .transform((val) => val.trim().replace(/\s+/g, " "))
        .refine((val) => val !== "", {
          message: `${LOCATION_PIN_OR_ZIP_CODE} is required`,
        })
        .refine((val) => /^[a-zA-Z0-9 ]*$/.test(val), {
          message: `Invalid Input: ${LOCATION_PIN_OR_ZIP_CODE} must be alphanumeric`,
        })
    ),
  });
};

// ─── Zod Validation per Sheet ──────────────────────────────────────────────

const validateSupplierLocationSheet = (sheet: TExcelSheet) => {
  const errorEntries: Record<string, string>[] = [];
  let index = 0;

  sheet.data.forEach((item: Record<string, string>) => {
    index++;
    const safeParseData = supplierLocationMasterSchema().safeParse(item);
    if (!safeParseData.success) {
      const columnObject: any = { "Row Number": index };
      const templateColumns =
        SupplierLocationMasterActivityConstant.excel_template.sheets.filter(
          (s) =>
            sanitizeString.v1(s.name) === sanitizeString.v1(sheet.sheetName)
        )[0].columns;

      templateColumns.forEach((columnItem) => {
        safeParseData.error.issues.forEach((issueItem: Record<string, any>) => {
          if (columnObject[columnItem.name]) return;
          if (columnItem.name === issueItem.path[0]) {
            columnObject[columnItem.name] = issueItem.message;
          } else {
            columnObject[columnItem.name] = "";
          }
        });
      });
      errorEntries.push(columnObject);
    }
  });

  return errorEntries;
};

const validateSheetMethods: Record<
  TSupplierLocationMasterActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  [SUPPLIER_LOCATIONS]: validateSupplierLocationSheet,
};

const _validateDataByZod = (excelData: TExcelSheet[]) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TSupplierLocationMasterActivitySheetNames]: Record<
      TSupplierLocationMasterActivitySheetColumnNames,
      any
    >[];
  } = { [SUPPLIER_LOCATIONS]: [] };

  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TSupplierLocationMasterActivitySheetNames;
    failedEntries[sheetName] = validateSheetMethods[sheetName](sheet);
    excelSheetData.push({ sheetName, data: failedEntries[sheetName] });
  });

  return excelSheetData;
};

// ─── DB-Level Data Validation ──────────────────────────────────────────────

const _validateDataByDB = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const sdk = await getGraphQlServerSDK();
  const countryData = await sdk.getCountryData();
  const countryNames = countryData?.Country ?? [];

  const excelSheetData: TExcelSheet[] = [];

  excelData.forEach((sheet) => {
    const sheetAllErrorEntries: Record<string, string>[] = [];
    let index = 0;

    sheet.data.forEach((dataItem: Record<string, string>) => {
      const errorEntries: TErrorExcelSheet[] = [];
      index++;

      // Validate Country exists
      const country = sanitizeString.v2(String(dataItem[LOCATION_COUNTRY]));
      if (country) {
        const countryExists = countryNames.some(
          (c) => sanitizeString.v1(c?.name ?? "") === sanitizeString.v1(country)
        );
        if (!countryExists) {
          errorEntries.push({
            column: LOCATION_COUNTRY,
            row: index,
            errorMessage: `Country '${country}' does not exist in the system.`,
          });
        }
      }

      // Validate LocationName uniqueness within the file
      const locationName = sanitizeString.v2(String(dataItem[LOCATION_NAME]));
      if (locationName) {
        const duplicates = sheet.data.filter(
          (row) =>
            sanitizeString.v1(String(row[LOCATION_NAME])) ===
            sanitizeString.v1(locationName)
        );
        if (duplicates.length > 1) {
          errorEntries.push({
            column: LOCATION_NAME,
            row: index,
            errorMessage: `Duplicate Entry Detected: Location Name '${locationName}' appears multiple times in the file.`,
          });
        }
      }

      // Validate LocationCode uniqueness within the file (if provided)
      const locationCode = sanitizeString.v2(String(dataItem[LOCATION_CODE]));
      if (locationCode) {
        const duplicates = sheet.data.filter(
          (row) =>
            sanitizeString.v1(String(row[LOCATION_CODE])) ===
            sanitizeString.v1(locationCode)
        );
        if (duplicates.length > 1) {
          errorEntries.push({
            column: LOCATION_CODE,
            row: index,
            errorMessage: `Duplicate Entry Detected: Location Code '${locationCode}' appears multiple times in the file.`,
          });
        }
      }

      // Combine row errors into formatted output
      if (errorEntries.length > 0) {
        const allColumns = [
          ...SupplierLocationMasterActivityConstant.excel_template.sheets.filter(
            (s) =>
              sanitizeString.v1(s.name) === sanitizeString.v1(sheet.sheetName)
          )[0].columns,
        ];
        const errorRow = createErrorDataForExcel(allColumns, errorEntries);
        if (errorRow.length > 0) {
          sheetAllErrorEntries.push(errorRow[0]);
        }
      }
    });

    excelSheetData.push({
      sheetName: sheet.sheetName,
      data: sheetAllErrorEntries,
    });
  });

  return excelSheetData;
};

// ─── Public Entry Point ────────────────────────────────────────────────────

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  // Step 1: Zod validation
  const zodErrors = _validateDataByZod(excelData);

  // Step 2: DB validation
  const dbErrors = await _validateDataByDB(excelData, organizationId);

  // Combine all errors
  let allError: TExcelSheet[] = [];
  allError = combineAllErrorSheets(zodErrors, allError);
  allError = combineAllErrorSheets(dbErrors, allError);

  // Merge row-level errors and filter empty sheets
  let finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((item) => item.data.length > 0);

  return finalError;
};
