// import { UUID } from "crypto";
import { getGraphQlServerSDK } from "~/graphql/server";
import { saveSupplierMaterialMapping } from "~/lib/auditlog/auditlog.service";
import { TExcelSheet } from "~/lib/excel/excel.service";
// import { calculatePCFEmission } from "~/lib/pcf-emission/pcf-emission.service";
// import { SQL_QUERY_Buyer_Task_Requests_For_Time_Periods } from "~/lib/pcf-emission/pcf-emission.queries";
import {
  FROM_MONTH,
  FROM_YEAR,
  MATERIAL_CODE,
  SUPPLIER_LOCATION_CODE,
  TO_MONTH,
  TO_YEAR,
} from "~/shared/constants/activity.constant";
import { sanitizeString } from "~/utils/sanitize.util";
// import { GetOPSDBContext } from "~/utils/database/db-context";
// import { VALID_MONTHS } from "./supplier-material-mapping.interface";
import { TUserSession } from "../auth/auth.client";

export type TSMMInsertResult = {
  affected_rows: number;
  skipped: number;
  errors: { row: number; message: string }[];
};

export const saveSMMSheetEntries = async (
  excelData: TExcelSheet[],
  userSession: TUserSession
): Promise<TSMMInsertResult> => {
  const sdk = await getGraphQlServerSDK();
  const { organizationId, userId } = userSession;

  // Fetch lookup data for ID resolution
  const [suppliersRes, materialsRes] = await Promise.all([
    sdk.getSuppliersForMappingDropdown({ organizationId }),
    sdk.getMaterialsForMappingDropdown({ organizationId }),
  ]);

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

  const sheet = excelData[0];
  const objects: any[] = [];
  const rowErrors: { row: number; message: string }[] = [];

  sheet.data.forEach((row, idx) => {
    const rowNum = idx + 1;
    const supplierCode = String(row[SUPPLIER_LOCATION_CODE] ?? "").trim();
    const materialCode = String(row[MATERIAL_CODE] ?? "").trim();

    const supplierAddressMappingId = supplierMap.get(
      sanitizeString.v4(supplierCode)
    );
    const orgMaterialMasterId = materialMap.get(
      sanitizeString.v4(materialCode)
    );

    if (!supplierAddressMappingId || !orgMaterialMasterId) {
      rowErrors.push({
        row: rowNum,
        message: `Row ${rowNum}: Supplier or Material Code not found.`,
      });
      return;
    }

    objects.push({
      supplier_address_mapping_id: supplierAddressMappingId,
      org_material_master_id: orgMaterialMasterId,
      From_Year: Number(row[FROM_YEAR]),
      From_Month: String(row[FROM_MONTH]).trim(),
      To_Year: Number(row[TO_YEAR]),
      To_Month: String(row[TO_MONTH]).trim(),
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId,
    });
  });

  if (objects.length === 0) {
    return {
      affected_rows: 0,
      skipped: rowErrors.length,
      errors: rowErrors,
    };
  }

  const result = await sdk.bulkInsertSupplierMaterialMapping({ objects });

  const insertedRows = (result?.insert_SupplierMaterialMapping?.returning ??
    []) as {
    id: string;
    supplier_address_mapping_id: string;
    org_material_master_id: string;
    From_Year: number;
    From_Month: string;
    To_Year: number;
    To_Month: string;
    meta_data: any;
    created_at: string;
  }[];

  if (insertedRows.length > 0) {
    const auditData = insertedRows.map((row) => ({
      id: row.id,
      supplier_address_mapping_id: row.supplier_address_mapping_id,
      org_material_master_id: row.org_material_master_id,
      From_Year: row.From_Year,
      From_Month: row.From_Month,
      To_Year: row.To_Year,
      To_Month: row.To_Month,
      meta_data: row.meta_data ?? null,
      created_at: row.created_at,
      updated_at: row.created_at,
      created_by: userSession.userId,
    }));
    await saveSupplierMaterialMapping(auditData, userSession);
  }

  return {
    affected_rows: result?.insert_SupplierMaterialMapping?.affected_rows ?? 0,
    skipped: rowErrors.length,
    errors: rowErrors,
  };
};

// export const triggerPCFEmissionForSMM = async (
//   saveResult: TSMMInsertResult,
//   excelData: TExcelSheet[],
//   userSession: TUserSession
// ): Promise<void> => {
//   if (saveResult.affected_rows <= 0 || saveResult.returning.length === 0) return;

//   try {
//     // 1. Enumerate all unique year/month combinations across all inserted mapping periods
//     const periodSet = new Set<string>();
//     const allPeriods: Array<{ year: number; month: string }> = [];

//     saveResult.returning.forEach((mapping: any) => {
//       const fromYear = Number(mapping.From_Year);
//       const toYear = Number(mapping.To_Year);
//       let currentYear = fromYear;
//       let currentMonthIdx = VALID_MONTHS.indexOf(
//         String(mapping.From_Month) as any
//       );
//       const toMonthIdx = VALID_MONTHS.indexOf(String(mapping.To_Month) as any);

//       while (
//         currentYear < toYear ||
//         (currentYear === toYear && currentMonthIdx <= toMonthIdx)
//       ) {
//         const key = `${currentYear}|${VALID_MONTHS[currentMonthIdx]}`;
//         if (!periodSet.has(key)) {
//           periodSet.add(key);
//           allPeriods.push({ year: currentYear, month: VALID_MONTHS[currentMonthIdx] });
//         }
//         currentMonthIdx++;
//         if (currentMonthIdx >= 12) {
//           currentMonthIdx = 0;
//           currentYear++;
//         }
//       }
//     });

//     if (allPeriods.length === 0) return;

//     // 2. Build SQL time-period conditions and find affected task requests
//     const timePeriodConditions = allPeriods
//       .map(
//         (p) =>
//           `(tr."year" = ${p.year} AND LOWER(TRIM(tr."month")) = '${p.month.toLowerCase()}')`
//       )
//       .join(" OR ");

//     const dbContext = await GetOPSDBContext();
//     const affectedTaskRequests: Array<{ id: string }> =
//       await dbContext.execute(
//         SQL_QUERY_Buyer_Task_Requests_For_Time_Periods(
//           userSession.organizationId as UUID,
//           timePeriodConditions
//         )
//       );

//     if (affectedTaskRequests.length === 0) return;

//     const taskRequestIds = affectedTaskRequests.map((tr) => tr.id);

//     // 3. Build changedMaterialKeys from the uploaded Excel rows (deduplicated)
//     const changedMaterialKeys = excelData[0].data
//       .map((row: any) => ({
//         supplier_code: sanitizeString.v4(String(row[SUPPLIER_LOCATION_CODE] ?? "")),
//         buyer_material_code: sanitizeString.v4(String(row[MATERIAL_CODE] ?? "")),
//       }))
//       .filter(
//         (item, index, self) =>
//           index ===
//           self.findIndex(
//             (t) =>
//               t.supplier_code === item.supplier_code &&
//               t.buyer_material_code === item.buyer_material_code
//           )
//       );

//     await calculatePCFEmission(
//       userSession.organizationId,
//       taskRequestIds,
//       userSession.userId as UUID,
//       changedMaterialKeys.length > 0 ? changedMaterialKeys : undefined
//     );
//   } catch (error) {
//     console.log("PCF calculation error after SMM upload:", error);
//   }
// };
