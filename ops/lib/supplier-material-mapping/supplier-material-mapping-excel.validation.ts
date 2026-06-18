import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  combineAllErrorSheets,
  combineAllTypeErrorInRow,
  createErrorDataForExcel,
  TErrorExcelSheet,
  TExcelSheet,
  TTemplateErrorData,
} from "~/lib/excel/excel.service";
import {
  validateColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import {
  FROM_MONTH,
  FROM_YEAR,
  MATERIAL_CODE,
  SUPPLIER_LOCATION_CODE,
  SupplierMaterialMappingActivityConstant,
  TO_MONTH,
  TO_YEAR,
  TSMMActivitySheetColumnNames,
  TSMMActivitySheetNames,
} from "~/shared/constants/activity.constant";
import { sanitizeString } from "~/utils/sanitize.util";
import { VALID_MONTHS } from "./supplier-material-mapping.interface";

const { sheets: templateSheets } =
  SupplierMaterialMappingActivityConstant.excel_template;

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
            sanitizeString.v4(s.sheetName) ===
            sanitizeString.v4(templateSheet.name)
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

const smmRowSchema = z
  .object({
    [SUPPLIER_LOCATION_CODE]: z
      .unknown()
      .transform((v) =>
        typeof v === "string" ? v.trim() : String(v ?? "").trim()
      )
      .refine((v) => v !== "", {
        message: `${SUPPLIER_LOCATION_CODE} is required`,
      }),
    [MATERIAL_CODE]: z
      .unknown()
      .transform((v) =>
        typeof v === "string" ? v.trim() : String(v ?? "").trim()
      )
      .refine((v) => v !== "", { message: `${MATERIAL_CODE} is required` }),
    [FROM_YEAR]: z
      .unknown()
      .refine((v) => v !== "" && v !== null && v !== undefined, {
        message: `${FROM_YEAR} is required`,
      })
      .transform((v) => Number(v))
      .refine(
        (v) =>
          Number.isInteger(v) && v >= 2000 && v <= new Date().getFullYear(),
        {
          message: `${FROM_YEAR} must be a valid year between 2000 and ${new Date().getFullYear()}`,
        }
      ),
    [FROM_MONTH]: z
      .unknown()
      .transform((v) =>
        typeof v === "string" ? v.trim() : String(v ?? "").trim()
      )
      .refine((v) => (VALID_MONTHS as readonly string[]).includes(v), {
        message: `${FROM_MONTH} must be a valid month name (e.g. January)`,
      }),
    [TO_YEAR]: z
      .unknown()
      .refine((v) => v !== "" && v !== null && v !== undefined, {
        message: `${TO_YEAR} is required`,
      })
      .transform((v) => Number(v))
      .refine(
        (v) =>
          Number.isInteger(v) && v >= 2000 && v <= new Date().getFullYear(),
        {
          message: `${TO_YEAR} must be a valid year between 2000 and ${new Date().getFullYear()}`,
        }
      ),
    [TO_MONTH]: z
      .unknown()
      .transform((v) =>
        typeof v === "string" ? v.trim() : String(v ?? "").trim()
      )
      .refine((v) => (VALID_MONTHS as readonly string[]).includes(v), {
        message: `${TO_MONTH} must be a valid month name (e.g. January)`,
      }),
  })
  .superRefine((data, ctx) => {
    const fromYear = data[FROM_YEAR] as number;
    const toYear = data[TO_YEAR] as number;
    const fromMonth = data[FROM_MONTH] as string;
    const toMonth = data[TO_MONTH] as string;

    if (typeof fromYear === "number" && typeof toYear === "number") {
      if (toYear < fromYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${TO_YEAR} must be >= ${FROM_YEAR}`,
          path: [TO_YEAR],
        });
      }
      if (
        toYear === fromYear &&
        VALID_MONTHS.indexOf(toMonth as any) <
          VALID_MONTHS.indexOf(fromMonth as any)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${TO_MONTH} must be >= ${FROM_MONTH} when years are equal`,
          path: [TO_MONTH],
        });
      }
    }
  });

const validateSMMSheet = (sheet: TExcelSheet) => {
  const errorEntries: Record<string, any>[] = [];
  let index = 0;

  sheet.data.forEach((item: Record<string, any>) => {
    index++;
    let columnObject: any = {};
    const safeParseData = smmRowSchema.safeParse(item);
    if (!safeParseData.success) {
      columnObject["Row Number"] = index;
      SupplierMaterialMappingActivityConstant.excel_template.sheets
        .filter(
          (sheetItem) =>
            sanitizeString.v1(sheetItem.name) ===
            sanitizeString.v1(sheet.sheetName)
        )[0]
        .columns.forEach((columnItem) => {
          safeParseData.error.issues.forEach(
            (issueItem: Record<string, any>) => {
              if (!!columnObject[columnItem.name]) return;
              if (columnItem.name === issueItem.path[0]) {
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
  TSMMActivitySheetNames,
  (sheet: TExcelSheet) => Record<string, any>[]
> = {
  "Supplier Material Mapping": validateSMMSheet,
};

const _validateDataByZod = async (excelData: TExcelSheet[]) => {
  const excelSheetData: TExcelSheet[] = [];
  const failedEntries: {
    [key in TSMMActivitySheetNames]: Record<
      TSMMActivitySheetColumnNames,
      any
    >[];
  } = { "Supplier Material Mapping": [] };

  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TSMMActivitySheetNames;
    failedEntries[sheetName] = validateSheetMethods[sheetName](sheet);
    excelSheetData.push({
      sheetName: sheetName,
      data: failedEntries[sheetName],
    });
  });

  return excelSheetData;
};

const validateSMMDataSheet = (
  sheet: TExcelSheet,
  validSupplierCodes: Set<string>,
  validMaterialCodes: Set<string>,
  supplierMap: Map<string, string>,
  materialMap: Map<string, string>,
  existingMappingKeys: Set<string>
) => {
  const sheetAllErrorEntries: Record<string, string>[] = [];
  const allColumns =
    SupplierMaterialMappingActivityConstant.excel_template.sheets.filter(
      (sheetItem) =>
        sanitizeString.v1(sheetItem.name) === sanitizeString.v1(sheet.sheetName)
    )[0].columns;
  const seen = new Set<string>();
  let index = 0;

  sheet.data.forEach((dataItem: Record<string, any>) => {
    const errorEntries: TErrorExcelSheet[] = [];
    index++;

    // Validate Supplier Location Code exists in system
    const supplierCode = sanitizeString.v4(
      String(dataItem[SUPPLIER_LOCATION_CODE] ?? "").trim()
    );
    if (supplierCode && !validSupplierCodes.has(supplierCode)) {
      errorEntries.push({
        column: SUPPLIER_LOCATION_CODE,
        row: index,
        errorMessage: `Supplier Location Code '${dataItem[SUPPLIER_LOCATION_CODE]}' not found in the system.`,
      });
    }

    // Validate Material Code exists in system
    const materialCode = sanitizeString.v4(
      String(dataItem[MATERIAL_CODE] ?? "").trim()
    );
    if (materialCode && !validMaterialCodes.has(materialCode)) {
      errorEntries.push({
        column: MATERIAL_CODE,
        row: index,
        errorMessage: `Material Code '${dataItem[MATERIAL_CODE]}' not found in the system.`,
      });
    }

    // Validate no within-file duplicates
    const fileKey = [
      supplierCode,
      materialCode,
      String(dataItem[FROM_YEAR] ?? ""),
      String(dataItem[FROM_MONTH] ?? "")
        .trim()
        .toLowerCase(),
      String(dataItem[TO_YEAR] ?? ""),
      String(dataItem[TO_MONTH] ?? "")
        .trim()
        .toLowerCase(),
    ].join("|");

    if (seen.has(fileKey)) {
      errorEntries.push({
        column: SUPPLIER_LOCATION_CODE,
        row: index,
        errorMessage:
          "Duplicate Entry: Same Supplier Location Code, Material Code and period already exists in this file.",
      });
    } else {
      seen.add(fileKey);
    }

    // Validate no DB duplicates (mapping already exists in the system)
    const supplierAddressMappingId = supplierMap.get(supplierCode);
    const orgMaterialMasterId = materialMap.get(materialCode);
    if (supplierAddressMappingId && orgMaterialMasterId) {
      const dbKey = [
        supplierAddressMappingId,
        orgMaterialMasterId,
        String(dataItem[FROM_YEAR] ?? ""),
        String(dataItem[FROM_MONTH] ?? "")
          .trim()
          .toLowerCase(),
        String(dataItem[TO_YEAR] ?? ""),
        String(dataItem[TO_MONTH] ?? "")
          .trim()
          .toLowerCase(),
      ].join("|");

      if (existingMappingKeys.has(dbKey)) {
        errorEntries.push({
          column: SUPPLIER_LOCATION_CODE,
          row: index,
          errorMessage:
            "Duplicate Entry: A mapping with the same Supplier Location Code, Material Code and period already exists in the system.",
        });
      }
    }

    if (errorEntries.length > 0) {
      const errorRow = createErrorDataForExcel(allColumns as any, errorEntries);
      sheetAllErrorEntries.push(errorRow[0]);
    }
  });

  return sheetAllErrorEntries;
};

const validateSheetMasterDataMethods: Record<
  TSMMActivitySheetNames,
  (
    sheet: TExcelSheet,
    validSupplierCodes: Set<string>,
    validMaterialCodes: Set<string>,
    supplierMap: Map<string, string>,
    materialMap: Map<string, string>,
    existingMappingKeys: Set<string>
  ) => Record<string, any>[]
> = {
  "Supplier Material Mapping": validateSMMDataSheet,
};

const validateDataByDb = async (
  excelData: TExcelSheet[],
  organizationId: UUID
) => {
  const excelSheetData: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();

  const [suppliersRes, materialsRes, existingMappingsRes] = await Promise.all([
    sdk.getSuppliersForMappingDropdown({ organizationId }),
    sdk.getMaterialsForMappingDropdown({ organizationId }),
    sdk.getExistingSupplierMaterialMappings({ organizationId }),
  ]);

  const validSupplierCodes = new Set<string>(
    (suppliersRes?.SupplierAddressMapping ?? [])
      .filter((s: any) => s.Address?.code)
      .map((s: any) => sanitizeString.v4(s.Address.code))
  );

  const validMaterialCodes = new Set<string>(
    (materialsRes?.OrgMaterialMaster ?? []).map((m: any) =>
      sanitizeString.v4(m.code)
    )
  );

  const supplierMap = new Map<string, string>();
  (suppliersRes?.SupplierAddressMapping ?? []).forEach((s: any) => {
    if (s.Address?.code) {
      supplierMap.set(sanitizeString.v4(s.Address.code), s.id);
    }
  });

  const materialMap = new Map<string, string>();
  (materialsRes?.OrgMaterialMaster ?? []).forEach((m: any) => {
    materialMap.set(sanitizeString.v4(m.code), m.id);
  });

  const existingMappingKeys = new Set<string>(
    (existingMappingsRes?.SupplierMaterialMapping ?? []).map((m: any) =>
      [
        m.supplier_address_mapping_id,
        m.org_material_master_id,
        String(m.From_Year),
        m.From_Month.trim().toLowerCase(),
        String(m.To_Year),
        m.To_Month.trim().toLowerCase(),
      ].join("|")
    )
  );

  const failedEntries: {
    [key in TSMMActivitySheetNames]: Record<
      TSMMActivitySheetColumnNames,
      any
    >[];
  } = { "Supplier Material Mapping": [] };

  excelData.forEach((sheet) => {
    const sheetName = sheet.sheetName.trim() as TSMMActivitySheetNames;
    failedEntries[sheetName] = validateSheetMasterDataMethods[sheetName](
      sheet,
      validSupplierCodes,
      validMaterialCodes,
      supplierMap,
      materialMap,
      existingMappingKeys
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
): Promise<TExcelSheet[]> => {
  let finalError: TExcelSheet[] = [];
  let allError: TExcelSheet[] = [];

  const zodErrorEntries: TExcelSheet[] = await _validateDataByZod(excelData);
  const masterErrorEntries: TExcelSheet[] = await validateDataByDb(
    excelData,
    organizationId
  );

  allError = combineAllErrorSheets(zodErrorEntries, allError);
  allError = combineAllErrorSheets(masterErrorEntries, allError);
  finalError = combineAllTypeErrorInRow(allError, templateSheets as any);
  finalError = finalError.filter((errorItem) => errorItem.data.length > 0);

  return finalError;
};
