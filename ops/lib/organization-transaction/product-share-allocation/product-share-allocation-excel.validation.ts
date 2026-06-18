import { UUID } from "crypto";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  createErrorDataForExcel,
  TErrorExcelSheet,
  TExcelSheet,
  TTemplateErrorData,
  YearMonthSchema,
} from "~/lib/excel/excel.service";
import {
  validateMultipleSheetColumnNames,
  validateSheetName,
} from "~/lib/excel/excel.validation";
import {
  PRODUCT_SHARE_RATIONALE_OPTIONS,
  ProductShareAllocationActivityConstant,
  RATIONALE_FOR_PERCENTAGE,
} from "~/shared/constants/activity.constant";
import { sanitizeString } from "~/utils/sanitize.util";

const { sheets: templateSheets } =
  ProductShareAllocationActivityConstant.excel_template;

// ─── Rationale Uniformity Validation ──────────────────────────────────────────

/**
 * Validates that all rows in the upload have the same Rationale_For_Percentage value
 * Returns the uniform rationale value if valid, or null with errors if not uniform
 *
 * Uses majority-based approach: the most common rationale is considered "correct",
 * and only rows with different rationale values are flagged as errors.
 */
export const validateRationaleUniformity = (
  sheet: TExcelSheet
): { rationale: string | null; errors: TErrorExcelSheet[] } => {
  const errors: TErrorExcelSheet[] = [];

  // Count occurrences of each rationale value
  const rationaleCounts = new Map<string, number>();
  sheet.data.forEach((row: Record<string, any>) => {
    const rationale = sanitizeString.v4(
      String(row[RATIONALE_FOR_PERCENTAGE] || "")
    );
    if (rationale) {
      rationaleCounts.set(rationale, (rationaleCounts.get(rationale) || 0) + 1);
    }
  });

  // If no rationale values found, return null
  if (rationaleCounts.size === 0) {
    return { rationale: null, errors: [] };
  }

  // If only one unique rationale value, all rows are uniform
  if (rationaleCounts.size === 1) {
    const rationale = Array.from(rationaleCounts.keys())[0];
    return { rationale, errors: [] };
  }

  // Multiple different rationale values found - determine majority
  let majorityRationale = "";
  let maxCount = 0;
  rationaleCounts.forEach((count, rationale) => {
    if (count > maxCount) {
      maxCount = count;
      majorityRationale = rationale;
    }
  });

  // Add errors only for rows that differ from the majority
  let rowIndex = 1;
  sheet.data.forEach((row: Record<string, any>) => {
    rowIndex++;
    const rationale = sanitizeString.v4(
      String(row[RATIONALE_FOR_PERCENTAGE] || "")
    );
    if (rationale && rationale !== majorityRationale) {
      errors.push({
        column: RATIONALE_FOR_PERCENTAGE,
        row: rowIndex,
        errorMessage: `Rationale must be uniform across the facility. Multiple rationale values are not allowed.`,
      });
    }
  });

  // Return null for rationale since validation failed (multiple values exist)
  return { rationale: null, errors };
};

/**
 * Validates that the uploaded rationale matches the existing rationale in the database
 * for the given organization address
 */
export const validateRationaleWithExisting = async (
  uploadedRationale: string,
  organizationAddressId: UUID
): Promise<{
  isValid: boolean;
  existingRationale: string | null;
  error: string | null;
}> => {
  try {
    const sdk = await getGraphQlServerSDK();
    const existingData = await sdk.getExistingRationaleForFacility?.({
      organizationAddressId,
    });

    const existingRecords = existingData?.GHGProductShareAttribution || [];

    if (existingRecords.length === 0) {
      // No existing rationale, upload is valid
      return { isValid: true, existingRationale: null, error: null };
    }

    // Get the existing rationale value
    const existingRationale = existingRecords[0]?.Rationale_For_Percentage;

    if (!existingRationale) {
      return { isValid: true, existingRationale: null, error: null };
    }

    // Compare uploaded rationale with existing
    const normalizedUploaded = sanitizeString.v4(uploadedRationale);
    const normalizedExisting = sanitizeString.v4(existingRationale);

    if (normalizedUploaded !== normalizedExisting) {
      return {
        isValid: false,
        existingRationale,
        error: `The rationale must remain consistent across the facility, and the rationale type for this material is ${existingRationale}.`,
      };
    }

    return { isValid: true, existingRationale, error: null };
  } catch (error) {
    console.warn("Rationale validation query not available:", error);
    return { isValid: true, existingRationale: null, error: null };
  }
};

// ─── Template-Level Validation ────────────────────────────────────────────────

export const validateExcelTemplate = (excelData: TExcelSheet[]) => {
  const errorMessageData: TTemplateErrorData[] = [];
  const sheet = templateSheets[0];

  const sheetsvWithData = excelData.filter((s) => s.data.length > 0).length;
  if (sheetsvWithData === 0) {
    errorMessageData.push({
      sheet: "",
      error_message: `Enter data in sheet ${sheet.name}`,
    });
    return errorMessageData;
  }

  const sheetValidations = validateSheetName(excelData, sheet.name);
  if (sheetValidations.length > 0) {
    errorMessageData.push({ ...sheetValidations[0] });
    return errorMessageData;
  }

  const sheetData = excelData.find(
    (s) => sanitizeString.v4(s.sheetName) === sanitizeString.v4(sheet.name)
  );
  if (sheetData) {
    const columnErrors = validateMultipleSheetColumnNames(
      sheetData,
      sheet.columns.map((c) => c.name)
    );
    columnErrors.forEach((e) => errorMessageData.push(e));
  }

  return errorMessageData;
};

// ─── Row Schema ───────────────────────────────────────────────────────────────

const rationaleValues = PRODUCT_SHARE_RATIONALE_OPTIONS.map((r) => r.label);

const ProductShareRowSchema = (baseYear: number) =>
  YearMonthSchema(baseYear)
    .extend({
      "Buyer's Name": z
        .unknown()
        .refine((val) => val !== "" && val !== null && val !== undefined, {
          message: "Buyer's Name is required",
        })
        .transform((val) => String(val).trim())
        .refine((val) => val.length >= 1, {
          message: "Buyer's Name is required",
        }),
      "Buyer's Material Code": z
        .unknown()
        .refine((val) => val !== "" && val !== null && val !== undefined, {
          message: "Buyer's Material Code is required",
        })
        .transform((val) => String(val).trim())
        .refine((val) => val.length >= 1, {
          message: "Buyer's Material Code is required",
        }),
      "Buyer's Material Name": z
        .unknown()
        .refine((val) => val !== "" && val !== null && val !== undefined, {
          message: "Buyer's Material Name is required",
        })
        .transform((val) => String(val).trim())
        .refine((val) => val.length >= 1, {
          message: "Buyer's Material Name is required",
        }),
      // .refine((val) => val.length <= 50, {
      //   message: "Buyer Material Code must not exceed 50 characters",
      // })
      // .refine((val) => /^[a-zA-Z0-9\-_]+$/.test(val), {
      //   message:
      //     "Buyer Material Code must be alphanumeric (hyphens and underscores allowed)",
      // }),

      "In % -> Quantity of a particular SKU purchased by a buyer vs total facility production across all SKUs.":
        z
          .unknown()
          .refine((val) => val !== "" && val !== null && val !== undefined, {
            message: "Percentage is required",
          })
          .transform((val) => Number(val))
          .refine((val) => !isNaN(val), { message: "Enter a valid number" })
          .refine((val) => val >= 0, { message: "Must be 0 or greater" })
          .refine((val) => val <= 100, {
            message: "Cannot exceed 100%",
          })
          .refine(
            (val) => {
              const parts = String(val).split(".");
              return !parts[1] || parts[1].length <= 4;
            },
            { message: "Percentage can have at most 4 decimal places" }
          ),

      "Rationale for percentage": z
        .string({
          required_error: "Rationale for Percentage is required",
        })
        .min(1, {
          message: "Rationale for Percentage is required",
        })
        .refine(
          (val) =>
            rationaleValues.some(
              (r) => sanitizeString.v4(r) === sanitizeString.v4(val)
            ),
          {
            message: `Rationale must be one of: ${rationaleValues.join(", ")}`,
          }
        ),
    })
    .superRefine((data, ctx) => {
      const year = Number(data["Year"]);
      const monthRaw = data["Month"];

      if (!year || !monthRaw) return;

      const monthMap: Record<string, number> = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11,
      };

      const monthKey = sanitizeString.v4(monthRaw);
      const monthIndex = monthMap[monthKey];

      if (monthIndex === undefined) return;

      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Future year
      if (year > currentYear) {
        ctx.addIssue({
          path: ["Year"],
          code: z.ZodIssueCode.custom,
          message: "Future year is not allowed",
        });
        return;
      }

      // Current + future month
      if (year === currentYear && monthIndex >= currentMonth) {
        ctx.addIssue({
          path: ["Month"],
          code: z.ZodIssueCode.custom,
          message:
            "Current and future months are not allowed. Only past months are allowed.",
        });
      }
    });

// ─── Per-Row Validation ───────────────────────────────────────────────────────

const validateProductShareSheet = (sheet: TExcelSheet, baseYear: number) => {
  const allColumns = templateSheets[0].columns;
  const errorEntries: Record<string, string>[] = [];
  let index: number = 1;
  sheet.data.forEach((item: Record<string, any>, i) => {
    // const rowIndex = i + 1;
    index++;
    const result = ProductShareRowSchema(baseYear).safeParse(item);
    if (!result.success) {
      const columnObject: Record<string, any> = { "Row Number": index };
      allColumns.forEach((col) => {
        const issue = result.error.issues.find(
          (iss) => iss.path[0] === col.name
        );
        columnObject[col.name] = issue ? issue.message : "";
      });
      errorEntries.push(columnObject);
    }
  });
  return errorEntries;
};

// ─── Data-Level Validation (duplicates, existing records, totals) ─────────────

export const validateExcelTemplateData = async (
  excelData: TExcelSheet[],
  organizationId: UUID,
  organizationAddressId: UUID,
  baseYear: number,
  baseMonth: string
): Promise<TExcelSheet[]> => {
  const sheet = excelData[0];
  const allColumns = templateSheets[0].columns;
  const allError: TExcelSheet[] = [];
  const sdk = await getGraphQlServerSDK();

  const monthMap: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  const materialMappings =
    await sdk.getSupplierMaterialMappingsByOrganizationAddress?.({
      organizationAddressId,
    });

  type MaterialObj = {
    MaterialId: string;
    MaterialCode?: string | null;
    OrganizationId: string;
    OrganizationName?: string;
    MaterialCodeOrg: string;
    fromYear: number;
    fromMonth: string;
    toYear: number;
    toMonth: string;
  };

  const materialResult: MaterialObj[] = [];
  const seenSet = new Set<string>();

  materialMappings?.SupplierMaterialMapping?.forEach((item) => {
    const MaterialId = item?.org_material_master_id;
    const MaterialCode = item?.OrgMaterialMaster?.code;
    const OrganizationId = item?.Organization?.id;
    const OrganizationName = item?.Organization?.name ?? "";
    const fromYear = Number(item?.From_Year);
    const fromMonth = item?.From_Month ?? "";
    const toYear = Number(item?.To_Year);
    const toMonth = item?.To_Month ?? "";

    const key = `${MaterialCode}-${OrganizationName}`;
    if (seenSet.has(key)) return;

    seenSet.add(key);

    materialResult.push({
      MaterialId,
      MaterialCode,
      OrganizationId,
      OrganizationName,
      MaterialCodeOrg: `${sanitizeString.v4(String(MaterialCode))}|${sanitizeString.v4(String(OrganizationName))}`,
      fromYear,
      fromMonth,
      toYear,
      toMonth,
    });
  });

  // 1. Row-schema validation
  const rowErrors = validateProductShareSheet(sheet, baseYear);
  if (rowErrors.length > 0) {
    allError.push({ sheetName: sheet.sheetName, data: rowErrors });
    return allError;
  }

  // 2. Rationale uniformity validation (all rows must have same rationale)
  const rationaleValidation = validateRationaleUniformity(sheet);
  if (rationaleValidation.errors.length > 0) {
    const errorRows = createErrorDataForExcel(
      allColumns as any,
      rationaleValidation.errors
    );
    allError.push({ sheetName: sheet.sheetName, data: errorRows });
    return allError;
  }

  // 3. Rationale consistency with existing data in database
  if (rationaleValidation.rationale) {
    const existingRationaleCheck = await validateRationaleWithExisting(
      rationaleValidation.rationale,
      organizationAddressId
    );
    if (!existingRationaleCheck.isValid) {
      const rationaleErrors: TErrorExcelSheet[] = [];
      let rowIdx = 1;
      sheet.data.forEach(() => {
        rowIdx++;
        rationaleErrors.push({
          column: RATIONALE_FOR_PERCENTAGE,
          row: rowIdx,
          errorMessage:
            existingRationaleCheck.error ||
            "Rationale must be uniform across the facility. Multiple rationale values are not allowed.",
        });
      });
      const errorRows = createErrorDataForExcel(
        allColumns as any,
        rationaleErrors
      );
      allError.push({ sheetName: sheet.sheetName, data: errorRows });
      return allError;
    }
  }

  // 4. Duplicate rows within the file (Year + Month + Buyer Material Code)
  const seen = new Set<string>();
  const duplicateErrors: TErrorExcelSheet[] = [];
  let index: number = 1;
  sheet.data.forEach((row: Record<string, any>, i) => {
    index++;
    const key = `${row["Year"]}|${sanitizeString.v4(String(row["Month"]))}|${sanitizeString.v4(String(row["Buyer's Material Code"]))}`;
    if (seen.has(key)) {
      duplicateErrors.push({
        column: "Buyer's Material Code",
        row: index,
        errorMessage: "Duplicate data found for Year Month and Material Code.",
      });
    } else {
      seen.add(key);
    }
  });

  if (duplicateErrors.length > 0) {
    const errorRows = createErrorDataForExcel(
      allColumns as any,
      duplicateErrors
    );
    allError.push({ sheetName: sheet.sheetName, data: errorRows });
    return allError;
  }

  // 5. Existing-record check (block if same Year+Month+Material_Code already in DB)
  try {
    const matCodes = Array.from(
      new Set(
        sheet.data.map((r: any) => String(r["Buyer's Material Code"]).trim())
      )
    );
    const existingCheck = await (
      sdk as any
    ).getExistingProductShareAllocations?.({
      organizationAddressId,
      materialCodes: matCodes,
    });

    if (existingCheck?.GHGProductShareAttribution?.length > 0) {
      const existingSet = new Set(
        existingCheck.GHGProductShareAttribution.map(
          (rec: any) =>
            `${rec.task_request_id_year}|${rec.task_request_id_month}|${sanitizeString.v4(rec.Material_Code)}`
        )
      );
      let rowIdx1: number = 1;
      const existingErrors: TErrorExcelSheet[] = [];
      sheet.data.forEach((row: Record<string, any>, i) => {
        rowIdx1++;
        const key = `${row["Year"]}|${sanitizeString.v4(String(row["Month"]))}|${sanitizeString.v4(String(row["Buyer's Material Code"]))}`;
        if (existingSet.has(key)) {
          existingErrors.push({
            column: "Buyer's Material Code",
            row: rowIdx1,
            errorMessage:
              "Record already exists for this Year, Month and Material Code.",
          });
        }
      });

      if (existingErrors.length > 0) {
        const errorRows = createErrorDataForExcel(
          allColumns as any,
          existingErrors
        );
        allError.push({ sheetName: sheet.sheetName, data: errorRows });
        return allError;
      }
    }
  } catch {
    // If the query doesn't exist yet (pre-codegen), skip this check gracefully
  }

  // 6. Check other locations data (Buyer Material Code + Buyer Name)
  const materialMap = new Map<string, MaterialObj>();
  materialResult.forEach((m) => {
    const key = `${sanitizeString.v4(String(m.MaterialCode))}|${sanitizeString.v4(String(m.OrganizationName))}`;
    materialMap.set(key, m);
  });

  const duplicateErrorsMaterial: TErrorExcelSheet[] = [];
  let rowIndex: number = 1;
  sheet.data.forEach((row: Record<string, any>, i) => {
    rowIndex++;

    const materialCode = sanitizeString.v4(
      String(row["Buyer's Material Code"])
    );
    const buyerName = sanitizeString.v4(String(row["Buyer's Name"]));

    const year = Number(row["Year"]);
    const monthKey = sanitizeString.v4(String(row["Month"]));
    const monthIndex = monthMap[monthKey];

    const key = `${materialCode}|${buyerName}`;

    const material = materialMap.get(key);

    // Not mapped
    if (!material) {
      duplicateErrorsMaterial.push({
        column: "Buyer's Material Code",
        row: rowIndex,
        errorMessage:
          "The material code is not mapped with the supplier location.",
      });
      return;
    }

    // Invalid month
    if (monthIndex === undefined) {
      duplicateErrorsMaterial.push({
        column: "Month",
        row: rowIndex,
        errorMessage: "Invalid month value.",
      });
      return;
    }

    // Convert supplier range
    const fromMonthIndex =
      monthMap[sanitizeString.v4(String(material.fromMonth))];
    const toMonthIndex = monthMap[sanitizeString.v4(String(material.toMonth))];

    const fromValue = material.fromYear * 100 + fromMonthIndex;
    const toValue = material.toYear * 100 + toMonthIndex;
    const rowValue = year * 100 + monthIndex;

    if (rowValue < fromValue || rowValue > toValue) {
      duplicateErrorsMaterial.push({
        column: "Month",
        row: rowIndex,
        errorMessage: `Month and year does not belong to supplier range (${material.fromMonth} ${material.fromYear} - ${material.toMonth} ${material.toYear}).`,
      });
    }
  });

  if (duplicateErrorsMaterial.length > 0) {
    const errorRows = createErrorDataForExcel(
      allColumns as any,
      duplicateErrorsMaterial
    );
    allError.push({ sheetName: sheet.sheetName, data: errorRows });
    return allError;
  }

  // 7. Material Code ↔ Material Name consistency check
  const materialCodeNameMap = new Map<string, string>();
  const materialNameErrors: TErrorExcelSheet[] = [];
  let nameCheckIndex: number = 1;
  sheet.data.forEach((row: Record<string, any>) => {
    nameCheckIndex++;
    const code = sanitizeString.v4(String(row["Buyer's Material Code"]));
    const name = String(row["Buyer's Material Name"]).trim();

    const existingName = materialCodeNameMap.get(code);
    if (existingName === undefined) {
      materialCodeNameMap.set(code, name);
    } else if (sanitizeString.v4(existingName) !== sanitizeString.v4(name)) {
      materialNameErrors.push({
        column: "Buyer's Material Name",
        row: nameCheckIndex,
        errorMessage: `Material Code "${row["Buyer's Material Code"]}" has different Material Names: "${existingName}" and "${name}". The same Material Code must have the same Material Name throughout the sheet.`,
      });
    }
  });

  if (materialNameErrors.length > 0) {
    const errorRows = createErrorDataForExcel(
      allColumns as any,
      materialNameErrors
    );
    allError.push({ sheetName: sheet.sheetName, data: errorRows });
    return allError;
  }

  // 5. Running-total check per (Year + Month) — block if >100%
  /*const periodMap = new Map<string, number>();
  sheet.data.forEach((row: Record<string, any>) => {
    const key = `${row["Year"]}|${sanitizeString.v4(String(row["Month"]))}`;
    const pct =
      Number(
        row[
          "In % -> Quantity of a particular SKU purchased by a buyer vs total facility production across all SKUs."
        ]
      ) || 0;
    periodMap.set(key, (periodMap.get(key) ?? 0) + pct);
  });

  const totalErrors: TErrorExcelSheet[] = [];
  let rowIdx: number = 1;
  const periodWarnings: string[] = [];

  sheet.data.forEach((row: Record<string, any>, i) => {
    rowIdx++;
    const key = `${row["Year"]}|${sanitizeString.v4(String(row["Month"]))}`;
    const total = periodMap.get(key) ?? 0;
    if (total > 100) {
      totalErrors.push({
        column:
          "In % -> Quantity of a particular SKU purchased by a buyer vs total facility production across all SKUs.",
        row: rowIdx,
        errorMessage: `Total allocation exceeds 100%. Please review your entries.`,
      });
    } else if (total < 100 && !periodWarnings.includes(key)) {
      periodWarnings.push(key);
    }
  });

  if (totalErrors.length > 0) {
    const errorRows = createErrorDataForExcel(allColumns as any, totalErrors);
    allError.push({ sheetName: sheet.sheetName, data: errorRows });
  }*/

  return allError;
};

// ─── Warnings (non-blocking, returned as metadata) ───────────────────────────

export const computeAllocationWarnings = (
  excelData: TExcelSheet[]
): { period: string; total: number }[] => {
  const sheet = excelData[0];
  const periodMap = new Map<string, number>();

  sheet.data.forEach((row: Record<string, any>) => {
    const key = `${row["Year"]} ${sanitizeString.v4(String(row["Month"]))}`;
    const pct =
      Number(
        row[
          "In % -> Quantity of a particular SKU purchased by a buyer vs total facility production across all SKUs."
        ]
      ) || 0;
    periodMap.set(key, (periodMap.get(key) ?? 0) + pct);
  });

  const warnings: { period: string; total: number }[] = [];
  periodMap.forEach((total, period) => {
    if (total < 100) {
      warnings.push({ period, total });
    }
  });
  return warnings;
};
