import { sql } from "drizzle-orm";
import { getGraphQlServerSDK } from "~/graphql/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { jsonToExcelBuffer } from "~/lib/excel/excel.service";
import { isOrganizationAdmin } from "~/shared/constants/user-roles.constant";
import { CustomError } from "~/shared/error/custom-error";
import { GetOPSDBContext } from "~/utils/database/db-context";
import { uploadFileBufferToS3 } from "~/utils/file-storage/server.service";
import { getExportConfig } from "./export-config";
import {
  ExportQueryParams,
  queryExportData,
  queryLocations,
  queryMatchingAtrIds,
  YearMonthFilterParams,
} from "./queries";
import { ExportParams, ExportResponse, YearType } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAME_TO_NUM: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function parseFinancialYearStartMonth(
  value: string | null | undefined
): number {
  if (!value) return 4;
  const asInt = parseInt(value, 10);
  if (!isNaN(asInt) && asInt >= 1 && asInt <= 12) return asInt;
  return MONTH_NAME_TO_NUM[value.toLowerCase()] ?? 4;
}

function currentDefaultYear(startMonth: number, yearType: YearType): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (yearType === "financial" && startMonth !== 1) {
    return m >= startMonth ? y : y - 1;
  }
  return y;
}

async function fetchOrgData(organizationId: string) {
  const sdk = await getGraphQlServerSDK();
  const result = await sdk.getOrgData({ organizationId });
  return result.Organization?.[0] ?? null;
}

/**
 * Builds the file name per the spec:
 *   Single location:  {Activity}_{Location}_{YYYY-MM-DD}_{HH-MM-SS}.xlsx
 *   Multiple/all:     {Activity}_{YYYY-MM-DD}_{HH-MM-SS}.xlsx
 */
function buildFileName(
  activityName: string,
  locationNames: string[],
  at?: Date
): string {
  const sanitise = (s: string) =>
    s.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
  const now = at ?? new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const actPart = sanitise(activityName);

  if (locationNames.length === 1) {
    const locPart = sanitise(locationNames[0]);
    return `${actPart}_${locPart}_${datePart}_${timePart}.xlsx`;
  }
  return `${actPart}_${datePart}_${timePart}.xlsx`;
}

// ─── Public service ──────────────────────────────────────────────────────────

export async function exportActivityData(
  session: TUserSession,
  params: ExportParams
): Promise<ExportResponse> {
  // 1. Validate export config exists for this activity
  const config = getExportConfig(params.activityCode);
  if (!config) {
    throw CustomError({
      statusCode: 400,
      message: `Export is not yet available for activity "${params.activityName}"-"${params.activityCode}".`,
    });
  }

  // 2. Resolve org settings
  const orgData = await fetchOrgData(session.organizationId);
  const startMonth = parseFinancialYearStartMonth(
    orgData?.FinancialYearMonth as string | null
  );

  // 3. Resolve effective location IDs (intersection with user access)
  const userAddressIds = session.mappings.map((m) => m.organization_address_id);
  const effectiveLocationIds =
    params.locationIds.length > 0
      ? params.locationIds.filter((id) => userAddressIds.includes(id))
      : userAddressIds;

  // Admin projection (Location + Status columns) must be derived from the
  // session role, not the request — otherwise a non-admin caller could set
  // this flag in the body and bypass the restriction.
  const isOrgAdmin = isOrganizationAdmin(session.userRole);

  if (effectiveLocationIds.length === 0) {
    throw CustomError({
      statusCode: 400,
      message: "No accessible locations found for export.",
    });
  }

  // 4. For location-executives: verify they are allowed to export this activity.
  //    session.mappings[].activities stores parent-level codes (e.g. 'energy', 'transport').
  //    We accept the request when either:
  //      a) activityCode is directly in the allowed parent codes (root activities like 'waste'), OR
  //      b) activityCode's parent_code is in the allowed parent codes (leaf activities like 'energy_captive_power')
  //    activityCode is already validated as [a-zA-Z0-9_]+ by the route before reaching here.
  if (!isOrgAdmin) {
    const allowedParentCodes = new Set(
      session.mappings.flatMap((m) => m.activities ?? [])
    );
    const db = await GetOPSDBContext();
    const actRows = (await db.execute(
      sql.raw(
        `SELECT parent_code FROM "Activity" WHERE code = '${params.activityCode}' AND is_deleted IS NOT TRUE LIMIT 1`
      )
    )) as any[];
    const parentCode: string | null = actRows[0]?.parent_code ?? null;
    const isAllowed =
      allowedParentCodes.has(params.activityCode) ||
      (parentCode !== null && allowedParentCodes.has(parentCode));
    if (!isAllowed) {
      throw CustomError({
        statusCode: 403,
        message: "You do not have permission to export this activity.",
      });
    }
  }

  // 4. Build year/month filter
  const yearMonthFilter: YearMonthFilterParams = {
    year: params.year || currentDefaultYear(startMonth, params.yearType),
    yearType: params.yearType,
    startMonth,
    months: params.months,
  };

  // When a status filter is active, pre-fetch the exact ATR IDs that match
  // using the same data-table union and COALESCE logic as the summary query.
  // This guarantees the exported row count is identical to what the table shows.
  let matchingAtrIds: string[] | undefined;
  if (params.statusFilter === "pending" || params.statusFilter === "approved") {
    matchingAtrIds = await queryMatchingAtrIds(
      session.organizationId,
      effectiveLocationIds,
      config,
      yearMonthFilter,
      params.statusFilter
    );
  }

  const baseQueryParams: ExportQueryParams = {
    organizationId: session.organizationId,
    effectiveLocationIds,
    yearMonthFilter,
    includeAdminColumns: isOrgAdmin,
    matchingAtrIds,
    statusFilter: params.statusFilter ?? undefined,
  };

  // 5. Fetch data for each sheet. Every configured sheet is emitted — even when
  //    no rows match, the sheet is still added with its header row so the
  //    exported workbook stays structurally consistent across runs. Since
  //    xlsx.utils.json_to_sheet derives headers from object keys, we synthesize
  //    one row of empty values to carry the column order when there's no data.
  const excelSheets: { sheetName: string; data: Record<string, any>[] }[] = [];

  for (const sheet of config.sheets) {
    const rawRows = (await queryExportData(baseQueryParams, sheet)) as any[];

    const buildRow = (row: Record<string, any> | null): Record<string, any> => {
      const out: Record<string, any> = {};

      if (isOrgAdmin) {
        out["Location"] = row?.Location ?? "";
      }

      out["Year"] = row?.Year ?? "";
      out["Month"] = row?.Month ?? "";

      for (const col of sheet.columns) {
        out[col.displayName] = row?.[col.dbColumn] ?? "";
      }

      if (isOrgAdmin) {
        out["Status"] = row?.Status ?? "";
      }

      return out;
    };

    const transformedRows =
      rawRows.length > 0 ? rawRows.map((r) => buildRow(r)) : [buildRow(null)];

    excelSheets.push({
      sheetName: sheet.sheetName.substring(0, 31), // Excel sheet name max 31 chars
      data: transformedRows,
    });
  }

  // 6. Generate Excel buffer
  const buffer = jsonToExcelBuffer(excelSheets);
  if (!buffer) {
    throw CustomError({
      statusCode: 500,
      message: "Failed to generate Excel file.",
    });
  }

  // 7. Build file name per spec
  // For single-location exports, resolve the location name for the filename.
  // We can't rely on the "Location" column in data (only present for admins),
  // so we look it up from effectiveLocationIds when exactly one is in scope.
  let locationNames: string[] = [];
  if (effectiveLocationIds.length === 1) {
    const locRows = (await queryLocations(
      session.organizationId,
      effectiveLocationIds
    )) as any[];
    if (locRows.length > 0) {
      locationNames = [String(locRows[0].name)];
    }
  }
  const clientDate = params.clientDateTime
    ? new Date(params.clientDateTime)
    : undefined;
  const fileName = buildFileName(params.activityName, locationNames, clientDate);

  // 8. Upload to S3
  const s3Result = await uploadFileBufferToS3(
    session.organizationId,
    "activity_exports",
    buffer,
    "xlsx",
    { organizationId: session.organizationId, fileName },
    true // use the built fileName as the S3 object key
  );

  if (!s3Result?.downloadUrl) {
    throw CustomError({
      statusCode: 500,
      message: "Failed to upload export file.",
    });
  }

  return {
    downloadUrl: s3Result.downloadUrl,
    fileName,
  };
}
