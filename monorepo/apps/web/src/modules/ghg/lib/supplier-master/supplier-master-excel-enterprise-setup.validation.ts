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
} from "@/modules/ghg/lib/excel/excel.service";
import {
  validateColumnNames,
  validateSheetName,
} from "@/modules/ghg/lib/excel/excel.validation";
import { ActivityMasterKey } from "@/modules/ghg/shared/constants/input.constant";
import {
  SUPPLIER_ADMIN_EMAIL_ID,
  SUPPLIER_ADMIN_NAME,
  SUPPLIER_CATEGORY,
  SUPPLIER_CODE,
  SUPPLIER_GST_OR_LICENSE_NUMBER,
  SUPPLIER_NAME,
  SUPPLIER_PAN_OR_LICENSE_NUMBER,
  SupplierMasterEnterpriseSetupActivityConstant,
  SUPPLIERS,
  TSupplierMasterEnterpriseSetupSheetColumnNames,
  TSupplierMasterEnterpriseSetupSheetNames,
} from "@/modules/ghg/shared/constants/supplier-master-enterprise-setup-activity.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import {
  IAppUser,
  ICountry,
  IFeatureActivityMapping,
  IOrgSupplierMaster,
} from "./supplier-master.interface";

const { sheets: templateSheets } =
  SupplierMasterEnterpriseSetupActivityConstant.excel_template;
const SUPPLIER_MASTER_ID = "SupplierMasterID";

const normalizeSupplierRow = (row: Record<string, any>) => {
  const normalizedRow = { ...row };

  const supplierCode =
    row?.[SUPPLIER_CODE] ?? row?.[SUPPLIER_MASTER_ID] ?? undefined;
  if (supplierCode !== undefined) {
    normalizedRow[SUPPLIER_CODE] = supplierCode;
  }

  const gstOrLicense =
    row?.[SUPPLIER_GST_OR_LICENSE_NUMBER] ??
    row?.[SUPPLIER_PAN_OR_LICENSE_NUMBER] ??
    undefined;
  if (gstOrLicense !== undefined) {
    normalizedRow[SUPPLIER_GST_OR_LICENSE_NUMBER] = gstOrLicense;
  }

  // if (
  //   normalizedRow[COUNTRY] === undefined ||
  //   normalizedRow[COUNTRY] === null ||
  //   String(normalizedRow[COUNTRY]).trim() === ""
  // ) {
  //   normalizedRow[COUNTRY] = INDIA;
  // }

  // if (
  //   normalizedRow[SUPPLIER_FULL_ADDRESS] === undefined ||
  //   normalizedRow[SUPPLIER_FULL_ADDRESS] === null
  // ) {
  //   normalizedRow[SUPPLIER_FULL_ADDRESS] = "";
  // }

  // if (
  //   normalizedRow[DATA_REQUIRED_FOR] === undefined ||
  //   normalizedRow[DATA_REQUIRED_FOR] === null
  // ) {
  //   normalizedRow[DATA_REQUIRED_FOR] = "";
  // }

  return normalizedRow;
};

const normalizeSupplierSheet = (sheetData: TExcelSheet) => {
  if (sanitizeString.v1(sheetData.sheetName) !== sanitizeString.v1(SUPPLIERS)) {
    return sheetData;
  }

  return {
    ...sheetData,
    data: sheetData.data.map((row) => normalizeSupplierRow(row)),
  };
};

export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
  let errorMessageData: TTemplateErrorData[] = [];
  // validate sheets and column names
  templateSheets.forEach((templateSheet) => {
    //Validate sheet name
    const sheetValidations = validateSheetName(excelData, templateSheet.name);
    if (sheetValidations.length > 0) {
      errorMessageData.push({ ...sheetValidations[0] });
    }
    if (excelData?.[0]?.data?.length > 0) {
      if (sheetValidations.length == 0) {
        // validate column names
        const templateColumnNames = templateSheet.columns.map((m) => m.name);
        const sheetData = excelData.filter(
          (sheetData) =>
            sanitizeString.v1(sheetData.sheetName) ==
            sanitizeString.v1(templateSheet.name)
        )[0];
        const normalizedSheetData = normalizeSupplierSheet(sheetData);
        const columnsValidations = validateColumnNames(
          normalizedSheetData,
          templateColumnNames
        );
        if (columnsValidations.length > 0) {
          columnsValidations.forEach((validationItem) => {
            errorMessageData.push(validationItem);
          });
        } else {
          if (normalizedSheetData.data.length > 10000) {
            errorMessageData.push({
              sheet: templateSheet.name,
              error_message: "Maximum 10,000 records can be uploaded at a time",
            });
          }
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

const supplierMasterSchema = () => {
  const supplierNameSchema = z.preprocess(
    (val) => {
      if (typeof val !== "string") return String(val);
      return val;
    },
    z
      .string({
        required_error: `${SUPPLIER_NAME} is required`,
        invalid_type_error: `Invalid Input: Numeric values are not allowed`,
      })
      .max(255, { message: `${SUPPLIER_NAME} cannot exceed 255 characters` })
      .transform((val) => val.trim().replace(/\s+/g, " "))
      .refine((val) => val !== "", {
        message: `${SUPPLIER_NAME} is required`,
      })
      .refine(
        (val) =>
          val !== null &&
          val !== undefined &&
          val !== "null" &&
          val !== "undefined" &&
          val !== "",
        {
          message: `Invalid Input: ${SUPPLIER_NAME} cannot be null, undefined, or empty.`,
        }
      )
      .refine((val) => /^[a-zA-Z0-9 ]*$/.test(val), {
        message: `Invalid Input: ${SUPPLIER_NAME} may only contain letters, numbers and spaces`,
      })
  );

  const supplierCodeSchema = z.preprocess(
    (val) => {
      if (typeof val !== "string") return String(val);
      return val;
    },
    z
      .string({
        required_error: `${SUPPLIER_CODE} is required.`,
      })
      .max(50, { message: `${SUPPLIER_CODE} cannot exceed 50 characters.` })
      .transform((val) => val.trim().replace(/\s+/g, " "))
      .refine((val) => val !== "", {
        message: `${SUPPLIER_CODE} is required.`,
      })
      .refine(
        (val) =>
          val !== null &&
          val !== undefined &&
          val !== "null" &&
          val !== "undefined" &&
          val !== "",
        {
          message: `Invalid Input: ${SUPPLIER_CODE} cannot be null, undefined, or empty.`,
        }
      )
      .refine((val) => /^[a-zA-Z0-9]*$/.test(val), {
        message: `Invalid Input: ${SUPPLIER_CODE} may only contain letters and numbers.`,
      })
      .superRefine((val: string, ctx: z.RefinementCtx) => {
        // Check for uniqueness in all rows
        const allRows = (ctx as any).parent?.__allRows as string[] | undefined;
        if (!allRows) return;
        const occurrences = allRows.filter((code) => code === val).length;
        if (occurrences !== 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate Entry Detected: Supplier Code already exists. Please use a different code.`,
          });
        }
      })
  );

  return z.object({
    // SupplierName
    [SUPPLIER_NAME]: supplierNameSchema,
    // SupplierCode
    [SUPPLIER_CODE]: supplierCodeSchema,
    // SupplierCategory
    [SUPPLIER_CATEGORY]: z
      .string({
        invalid_type_error: `Invalid Input: ${SUPPLIER_CATEGORY} may only contain letters, spaces and hyphens(-).`,
      })
      .transform((val) => val.trim().replace(/\s+/g, " "))
      .refine((val) => val !== "", {
        message: `${SUPPLIER_CATEGORY} is required.`,
      })
      .refine((val) => /^[a-zA-Z -]*$/.test(val), {
        message: `Invalid Input: ${SUPPLIER_CATEGORY} may only contain letters, spaces and hyphens(-).`,
      }),
    // Country validation disabled for enterprise setup.
    // [COUNTRY]: z
    //   .string({
    //     invalid_type_error: `Invalid Input: ${COUNTRY} must not contain special characters and numbers.`,
    //   })
    //   .transform((val) => val.trim().replace(/\s+/g, " "))
    //   .refine((val) => val !== "", {
    //     message: `${COUNTRY} is required.`,
    //   })
    //   .refine((val) => /^[a-zA-Z ]*$/.test(val), {
    //     message: `Invalid Input: ${COUNTRY} must not contain special characters and numbers.`,
    //   }),
    // SupplierGSTorLicenseNumber
    [SUPPLIER_GST_OR_LICENSE_NUMBER]: z
      .unknown()
      .transform((val) =>
        val === null || val === undefined
          ? ""
          : String(val).trim().replace(/\s+/g, " ")
      )
      .refine((val) => !val || String(val).length < 100, {
        message: `${SUPPLIER_GST_OR_LICENSE_NUMBER} cannot exceed 100 characters.`,
      })
      .refine(
        (val) =>
          !val ||
          (val !== null &&
            val !== undefined &&
            val !== "null" &&
            val !== "undefined"),
        {
          message: `Invalid Input: ${SUPPLIER_GST_OR_LICENSE_NUMBER} cannot be null or undefined.`,
        }
      )
      .refine((val) => !val || /^[a-zA-Z0-9]*$/.test(val), {
        message: `Invalid Input: ${SUPPLIER_GST_OR_LICENSE_NUMBER} may only contain letters and numbers.`,
      }),
    // Supplier full address validation disabled for enterprise setup.
    // [SUPPLIER_FULL_ADDRESS]: z ...
    // Data required for validation disabled for enterprise setup.
    // [DATA_REQUIRED_FOR]: z ...
    // SupplierAdminEmailId
    [SUPPLIER_ADMIN_EMAIL_ID]: z
      .unknown()
      .transform((val) =>
        typeof val === "string"
          ? val.trim().toLowerCase()
          : typeof val !== "string"
            ? val?.toString().trim()
            : ""
      )
      .refine(
        (val) => {
          if (!val) return true; // optional field
          return val.length < 254;
        },
        {
          message: `${SUPPLIER_ADMIN_EMAIL_ID} cannot exceed 254 characters`,
        }
      )
      .refine(
        (val) => {
          if (!val) return true; // optional field
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        },
        {
          message: "Invalid Input: Please enter a valid email address.",
        }
      )
      .optional(),
    // SupplierAdminName
    [SUPPLIER_ADMIN_NAME]: z
      .unknown()
      .transform((val) =>
        typeof val === "string"
          ? val.trim()
          : typeof val !== "string"
            ? val?.toString().trim()
            : ""
      )
      .refine((val) => !val || val.length < 100, {
        message: `${SUPPLIER_ADMIN_NAME} cannot exceed 100 characters`,
      })
      .refine(
        (val) =>
          val !== null &&
          val !== undefined &&
          val !== "null" &&
          val !== "undefined",
        {
          message: `Invalid Input: ${SUPPLIER_ADMIN_NAME} cannot be null, undefined`,
        }
      )
      .refine((val) => !val || /^[a-zA-Z ]+$/.test(val), {
        message: `Invalid Input: ${SUPPLIER_ADMIN_NAME} may only contain letters and spaces.`,
      })
      .optional(),
  });
};

const validateSupplierMasterSheet = (sheet: TExcelSheet) => {
  const errorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((item: Record<string, string>) => {
    const normalizedItem = normalizeSupplierRow(item);
    index++;
    let columnObject: any = {};
    let safeParseData: any = supplierMasterSchema().safeParse(normalizedItem);
    if (!safeParseData.success) {
      columnObject["Row Number"] = index;
      SupplierMasterEnterpriseSetupActivityConstant.excel_template.sheets
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

const validateSheetMethods: Record<
  TSupplierMasterEnterpriseSetupSheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  [SUPPLIERS]: validateSupplierMasterSheet,
};

const _validateDataByZod = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TSupplierMasterEnterpriseSetupSheetNames]: Record<
      TSupplierMasterEnterpriseSetupSheetColumnNames,
      any
    >[];
  } = { [SUPPLIERS]: [] };
  excelData.forEach((sheet) => {
    const normalizedSheet = normalizeSupplierSheet(sheet);
    const sheetName =
      normalizedSheet.sheetName.trim() as TSupplierMasterEnterpriseSetupSheetNames;
    failedEntries[sheetName] = validateSheetMethods[sheetName](normalizedSheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });
  return excelSheetData;
};

const validateSupplierMasterDataSheet = (
  sheet: TExcelSheet,
  activityMasterData: TActivityMasterData[],
  supplierMasterData: IOrgSupplierMaster[],
  countryNames: ICountry[],
  featureActivityCodes: IFeatureActivityMapping[],
  appUsers: IAppUser[],
  appUserOrgsData: IAppUser[]
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index: number = 0;
  sheet.data.forEach((dataItem: Record<string, string>) => {
    const normalizedItem = normalizeSupplierRow(dataItem);
    const errorEntries: TErrorExcelSheet[] = [];
    index++;

    /*
    / Validation Supplier Category from Activity Master Data
    / "Supplier Category" must be exist in Activity Master Data
    */
    let supplierCategory = normalizedItem[SUPPLIER_CATEGORY];
    if (typeof supplierCategory !== "string") {
      supplierCategory = String(supplierCategory);
    }
    if (!!supplierCategory) {
      const errorEntriesColumnData = validateActivityMasterDataByKey(
        activityMasterData,
        supplierCategory,
        index,
        "supplier_category",
        SUPPLIER_CATEGORY,
        ApiHitType.Excel
      );
      if (errorEntriesColumnData.length > 0) {
        errorEntries.push({ ...errorEntriesColumnData[0] });
      }
    }

    // Country validation disabled for enterprise setup.
    // GST-by-country validation disabled for enterprise setup.
    // Data Required For validation disabled for enterprise setup.

    /*
    / Validate "Supplier Admin Email ID" based on AppUser Emails
    / "Supplier Admin Email ID" must not be exist in AppUser Emails
    */
    if (!!normalizedItem[SUPPLIER_ADMIN_EMAIL_ID]) {
      const appUserEmailLength = appUsers?.filter(
        (appUser: IAppUser) =>
          sanitizeString.v3(appUser?.email ?? "") ===
          sanitizeString.v3(String(normalizedItem[SUPPLIER_ADMIN_EMAIL_ID]))
      )?.length;

      if (appUserEmailLength > 0) {
        errorEntries.push({
          column: SUPPLIER_ADMIN_EMAIL_ID,
          row: index,
          errorMessage: `Invalid Entry: The email address is already associated with an existing user in the organization. Please use a different email address.`,
        });
      }
    }

    /*
    / Validate "Supplier Admin Email ID" 
    / Check that if email is associated with other org's email and pan is different for that organization
    / Return the error like "The email address is associated with other companies. Please enter a different email address."
    */
    if (
      !!normalizedItem[SUPPLIER_ADMIN_EMAIL_ID] &&
      !!normalizedItem[SUPPLIER_GST_OR_LICENSE_NUMBER]
    ) {
      // Get PAN number from GST Number
      const gstOrLicense =
        sanitizeString.v2(
          String(normalizedItem[SUPPLIER_GST_OR_LICENSE_NUMBER])
        ) || "";
      const panNumber =
        gstOrLicense.length === 15
          ? gstOrLicense.substring(2, 12)
          : gstOrLicense.length === 10
            ? gstOrLicense
            : "";

      const appUserWithSameNameLength = appUserOrgsData?.filter(
        (appUser) =>
          sanitizeString.v3(appUser?.email ?? "") ===
            sanitizeString.v3(
              String(normalizedItem[SUPPLIER_ADMIN_EMAIL_ID])
            ) &&
          sanitizeString.v3(
            appUser?.Organization?.metadata?.pan_or_license_number
          ) !== sanitizeString.v3(panNumber)
      )?.length;

      if (appUserWithSameNameLength > 0) {
        errorEntries.push({
          column: SUPPLIER_ADMIN_EMAIL_ID,
          row: index,
          errorMessage: `Invalid Entry: The email address is associated with other companies. Please enter a different email address.`,
        });
      }
    }

    if (errorEntries.length > 0) {
      let allColumns: any =
        SupplierMasterEnterpriseSetupActivityConstant.excel_template.sheets.filter(
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

const validateSheetMasterDataMethods: Record<
  TSupplierMasterEnterpriseSetupSheetNames,
  (
    sheet: TExcelSheet,
    activityMasterData: TActivityMasterData[],
    supplierMasterData: IOrgSupplierMaster[],
    countryNames: ICountry[],
    featureActivityCodes: IFeatureActivityMapping[],
    appUsers: IAppUser[],
    appUserOrgsData: IAppUser[]
  ) => Record<string, any>[]
> = {
  [SUPPLIERS]: validateSupplierMasterDataSheet,
};

// Validate Data by DB Master Data
const validateDataByDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();
  const supplierMasterResponse = await sdk.getSupplierCodesByOrgId({
    organizationId,
  });
  const supplierMasterData: IOrgSupplierMaster[] =
    supplierMasterResponse?.OrgSupplierMaster ?? [];

  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ActivityMasterKey.supplier_master,
  });

  // Country and feature-activity validations are disabled for enterprise setup.
  // Keep placeholders to avoid changing the downstream function signatures.
  const countryNames: ICountry[] = [];
  const featureActivityCodes: IFeatureActivityMapping[] = [];

  const appUsersResponse = await sdk.getAppUserEmails({
    organizationId,
  });
  const appUsers: IAppUser[] = appUsersResponse?.AppUser ?? [];
  const emails =
    excelData[0]?.data?.map((item) =>
      sanitizeString.v3(
        String(
          normalizeSupplierRow(item)[SUPPLIER_ADMIN_EMAIL_ID] ?? ""
        ).toLowerCase()
      )
    ) || [];
  const appUserOrgResponse = await sdk.getAppUserOrgByEmail({
    emails,
  });
  const appUserOrgsData: IAppUser[] = appUserOrgResponse?.AppUser ?? [];

  const failedEntries: {
    [key in TSupplierMasterEnterpriseSetupSheetNames]: Record<
      TSupplierMasterEnterpriseSetupSheetColumnNames,
      any
    >[];
  } = { Suppliers: [] };
  excelData.forEach((sheet) => {
    const normalizedSheet = normalizeSupplierSheet(sheet);
    const sheetName =
      normalizedSheet.sheetName.trim() as TSupplierMasterEnterpriseSetupSheetNames;
    failedEntries[sheetName] = validateSheetMasterDataMethods[sheetName](
      normalizedSheet,
      activityMasterData?.ActivityMaster ?? [],
      supplierMasterData,
      countryNames,
      featureActivityCodes,
      appUsers,
      appUserOrgsData
    );
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });
  return excelSheetData;
};

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];

  const zodErrorEntries: TExcelSheet[] = await _validateDataByZod(
    excelData,
    organizationId
  );

  const duplicateEntries: TExcelSheet[] =
    await handleCheckDuplicates(excelData);

  const masterErrorEntries: TExcelSheet[] = await validateDataByDb(
    excelData,
    organizationId
  );

  allError = combineAllErrorSheets(zodErrorEntries, allError);
  allError = combineAllErrorSheets(duplicateEntries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);
  return finalError;
};

export const validateSupplierMasterDataBySupplierCode = (
  supplierMasterData: IOrgSupplierMaster[],
  columnValue: string,
  index: number,
  columnName: string
) => {
  // Existing supplier code is allowed for enterprise setup excel upload.
  // Matching records are handled as updates in save flow.
  return [] as TErrorExcelSheet[];
};

export const validateCountryDataBySupplierCountry = (
  countryNames: ICountry[],
  columnValue: string,
  index: number,
  columnName: string
) => {
  const errorEntries: TErrorExcelSheet[] = [];

  // checking either data of excel is exist to supplier master data or not
  let length: number = 0;

  length = countryNames?.filter(
    (country: ICountry) =>
      sanitizeString.v1(country?.name ?? "") ===
      sanitizeString.v1(String(columnValue))
  )?.length;

  if (length == 0) {
    errorEntries.push({
      column: columnName,
      row: index,
      errorMessage: `Invalid Entry: The entered country does not exist in the system. Please enter a valid country.`,
    });
  }

  return errorEntries;
};

export const validateGSTNumberBySupplierCountry = (
  columnValue: string,
  index: number,
  columnName: string
) => {
  const errorEntries: TErrorExcelSheet[] = [];

  // checking either data of excel is validate or not
  let length: number = 0;

  // Check that GST number is valid or not by regex
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
  if (gstRegex.test(columnValue) || panRegex.test(columnValue)) {
    length = 1;
  }

  if (length == 0) {
    errorEntries.push({
      column: columnName,
      row: index,
      errorMessage: `Invalid Entry: Invalid GST or PAN Number. Please enter a valid GSTIN or PAN.`,
    });
  }

  return errorEntries;
};

const handleCheckDuplicates = async (excelData: TExcelSheet[]) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TSupplierMasterEnterpriseSetupSheetNames]: Record<
      TSupplierMasterEnterpriseSetupSheetNames,
      any
    >[];
  } = {
    [SUPPLIERS]: [],
  };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TSupplierMasterEnterpriseSetupSheetNames;
    failedEntries[sheetName] = validateDuplicateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

const validateSupplierMasterDuplicateDataSheet = (sheet: TExcelSheet) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  let index: number = 0;

  sheet.data.forEach((dataItem: Record<string, string>) => {
    const normalizedItem = normalizeSupplierRow(dataItem);
    let errorEntries: TErrorExcelSheet[] = [];
    index++;
    /// Validation of Columns value from Master Data
    // Check that "Type of waste generated" must be exist in "WasteMaster" Table
    let supplierCodeValue = normalizedItem[SUPPLIER_CODE];
    if (typeof normalizedItem[SUPPLIER_CODE] !== "string") {
      supplierCodeValue = String(normalizedItem[SUPPLIER_CODE]);
    }
    if (!!supplierCodeValue && !!normalizedItem[SUPPLIER_NAME]) {
      const errorEntriesColumn5Data = validateDuplicateDataByKey(
        index,
        SUPPLIER_CODE,
        supplierCodeValue,
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
        SupplierMasterEnterpriseSetupActivityConstant.excel_template.sheets.filter(
          (sheetitem) =>
            sanitizeString.v1(sheetitem.name) ==
            sanitizeString.v1(sheet.sheetName)
        )[0].columns;
      const errorrow = createErrorDataForExcel(allcolumns, errorEntries);
      sheetAllErrorEntries.push(errorrow[0]);
    }
  });
  return sheetAllErrorEntries;
};

const validateDuplicateSheetMethods: Record<
  TSupplierMasterEnterpriseSetupSheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  [SUPPLIERS]: validateSupplierMasterDuplicateDataSheet,
};

export const validateDuplicateDataByKey = (
  index: number,
  columnName: string,
  supplierCode: string,
  sheet: TExcelSheet
) => {
  const errorEntries: TErrorExcelSheet[] = [];
  const duplicateEntries: Record<string, string>[] = [];
  /// checking either data of excel is correct according to master data or not
  let length: number = 0;
  let index1: number = 0;
  const seenEntries = new Set<string>();
  sheet.data.forEach((item: Record<string, string>) => {
    const normalizedItem = normalizeSupplierRow(item);
    index1++;
    let columnObject: any = {};

    // Generate a unique key based on the relevant fields (adjust as needed)
    const uniqueKeyIndex = `${sanitizeString.v1(supplierCode).toString()}`;
    let uniqueKeyRow = "";
    let supplierCodeValue = normalizedItem[SUPPLIER_CODE];
    if (typeof normalizedItem[SUPPLIER_CODE] !== "string") {
      supplierCodeValue = String(normalizedItem[SUPPLIER_CODE]);
    }
    uniqueKeyRow = `${sanitizeString.v1(supplierCodeValue).toString()}`;
    if (uniqueKeyRow === uniqueKeyIndex) {
      // Check for duplicates
      if (seenEntries.has(uniqueKeyRow)) {
        columnObject["Row Number"] = index1;
        columnObject["Error"] = "Duplicate Entry Detected";
        duplicateEntries.push(columnObject);
      } else {
        seenEntries.add(uniqueKeyRow);
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
  }
  return errorEntries;
};
