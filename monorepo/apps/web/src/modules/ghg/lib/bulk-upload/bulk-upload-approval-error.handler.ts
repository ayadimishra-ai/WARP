import { NextResponse } from "next/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import { ApiHitType } from "@/modules/ghg/lib/excel/excel.service";
import { DataImportHistoryStatus } from "@/modules/ghg/lib/shared/constants/dataimporthistory.constant";
import { TActivityCodes } from "@/modules/ghg/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { isApprovalLockError } from "./bulk-upload-approval.validation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApprovalLockHandlerCtx {
  userSession: TUserSession;
  fileName: string;
  fileUrl: string;
  // string (not TActivityCodes) because some routes pass parent_code values
  // (e.g. "transport") which are not in the TActivityCodes union. Cast at call site.
  activityCode: string;
  organizationAddressId: string;
  // When provided, the handler matches locked pairs against the uploaded rows
  // to include a 1-based "Row Number" column in the error sheet.
  excelData?: TExcelSheet[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface LockedRowInfo {
  rowNumber: number;
  month: string;
  year: number;
}

function findLockedRows(
  excelData: TExcelSheet[],
  lockedPairs: Array<{ month: string; year: number }>
): LockedRowInfo[] {
  const lockedMap = new Map(
    lockedPairs.map((p) => [`${p.month.toLowerCase()}|${p.year}`, p])
  );

  const result: LockedRowInfo[] = [];
  excelData.forEach((sheet) => {
    sheet.data.forEach((row, idx) => {
      const rowMonth = String(row["Month"] ?? row["month"] ?? "").trim();
      const rowYear = Number(row["Year"] ?? row["year"]);
      const matched = lockedMap.get(`${rowMonth.toLowerCase()}|${rowYear}`);
      if (matched) {
        // idx + 2: Excel row 1 is the header row, data starts at row 2,
        // so the absolute Excel row number = idx (0-based) + 1 (header) + 1 = idx + 2.
        result.push({ rowNumber: idx + 2, month: matched.month, year: matched.year });
      }
    });
  });

  return result;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

/**
 * If `err` is an approval-lock error (RULE-008), builds an error sheet,
 * uploads it to S3, records a failure in import history, and returns a
 * `NextResponse` with `{ success: false, data: historyRecord }`.
 *
 * Returns `null` for any other error so the caller can re-throw it:
 *
 *   } catch (err) {
 *     const r = await handleApprovalLockError(err, ctx);
 *     if (r) return r;
 *     throw err;
 *   }
 *
 * This keeps RULE-008 enforcement central (in excel.service.ts) while giving
 * every upload route the same user-friendly error-sheet response.
 */
export async function handleApprovalLockError(
  err: unknown,
  ctx: ApprovalLockHandlerCtx
): Promise<NextResponse | null> {
  if (!isApprovalLockError(err)) return null;

  const lockedPairs: Array<{ month: string; year: number }> =
    (err as any).data?.lockedPairs ?? [];

  const lockedRows = ctx.excelData
    ? findLockedRows(ctx.excelData, lockedPairs)
    : [];

  const errorRows: Record<string, any>[] =
    lockedRows.length > 0
      ? lockedRows.map(({ rowNumber, month, year }) => ({
          "Row Number": rowNumber,
          Month: month,
          Year: year,
          Error: `Data for ${month} ${year} has already been approved and cannot be modified`,
        }))
      : lockedPairs.length > 0
        ? lockedPairs.map(({ month, year }) => ({
            Month: month,
            Year: year,
            Error: `Data for ${month} ${year} has already been approved and cannot be modified`,
          }))
        : [{ Error: (err as any).message }];

  const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
    ctx.userSession,
    ctx.fileName,
    [{ sheetName: "Approval Lock Error", data: errorRows }]
  );

  const historyData = await insertNewDataImportHistory(
    ctx.userSession,
    ctx.activityCode as TActivityCodes,
    ApiHitType.Excel,
    ctx.fileName,
    ctx.fileUrl,
    DataImportHistoryStatus.Failure,
    { file_url: uploadResponse?.downloadUrl ?? "" },
    ctx.organizationAddressId
  );

  return NextResponse.json({ success: false, data: historyData });
}
