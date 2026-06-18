import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { exportActivityData } from "~/lib/monthly-activity-summary/export-service";
import { getSummaryData } from "~/lib/monthly-activity-summary/service";
import {
  ExportParams,
  SummaryParams,
  TabType,
  YearType,
} from "~/lib/monthly-activity-summary/types";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "~/shared/error/custom-error";

async function POST_Handler(req: NextRequest, userSession: TUserSession) {
  // Use clone() to avoid "Body already read" when the rate-limiter
  // middleware has already consumed the original body via request.clone().json().
  const body = await req.clone().json();

  const isExport = body.is_export === true;

  // ── Shared filter params (same for both summary and export) ────────────────
  const yearRaw = String(body.year ?? "");
  const year = yearRaw === "all" || yearRaw === "" ? 0 : parseInt(yearRaw, 10);
  if (yearRaw !== "all" && yearRaw !== "" && isNaN(year)) {
    throw CustomError({
      statusCode: 400,
      message: 'Invalid year value. Must be a number or "all".',
    });
  }

  const yearType = (body.yearType ?? "financial") as YearType;
  if (!["financial", "calendar"].includes(yearType)) {
    throw CustomError({
      statusCode: 400,
      message: 'Invalid yearType. Must be "financial" or "calendar".',
    });
  }

  // locationIds — array or comma-separated string; empty = all user locations
  const rawLocationIds: unknown = body.locationIds;
  const locationIds: string[] = Array.isArray(rawLocationIds)
    ? rawLocationIds.map(String)
    : typeof rawLocationIds === "string" && rawLocationIds.trim()
      ? rawLocationIds.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  // months — array or comma-separated string; empty = all months in FY
  const rawMonths: unknown = body.months;
  const months: string[] = Array.isArray(rawMonths)
    ? rawMonths.map((m) => String(m).toLowerCase())
    : typeof rawMonths === "string" && rawMonths.trim()
      ? rawMonths.split(",").map((m) => m.trim().toLowerCase()).filter(Boolean)
      : [];

  // ── Export path ─────────────────────────────────────────────────────────────
  if (isExport) {
    const activityCode = String(body.activityCode ?? "").trim();
    if (!activityCode) {
      throw CustomError({
        statusCode: 400,
        message: "activityCode is required for export.",
      });
    }
    // Prevent SQL injection — only alphanumeric + underscore allowed
    if (!/^[a-zA-Z0-9_]+$/.test(activityCode)) {
      throw CustomError({ statusCode: 400, message: "Invalid activityCode." });
    }

    const activityName = String(body.activityName ?? activityCode).trim();

    const rawExportStatusFilter = body.statusFilter;
    const exportStatusFilter: "pending" | "approved" | null =
      rawExportStatusFilter === "pending" || rawExportStatusFilter === "approved"
        ? rawExportStatusFilter
        : null;

    const rawClientDateTime = body.clientDateTime;
    const clientDateTime =
      typeof rawClientDateTime === "string" &&
      !isNaN(Date.parse(rawClientDateTime))
        ? rawClientDateTime
        : undefined;

    const exportParams: ExportParams = {
      activityCode,
      activityName,
      year,
      yearType,
      locationIds,
      months,
      statusFilter: exportStatusFilter ?? undefined,
      clientDateTime,
    };

    const data = await exportActivityData(userSession, exportParams);
    return NextResponse.json({ success: true, data });
  }

  // ── Summary path ────────────────────────────────────────────────────────────
  const tab = (body.tab ?? "activity_type") as TabType;
  if (!["activity_type", "location_wise"].includes(tab)) {
    throw CustomError({
      statusCode: 400,
      message: 'Invalid tab value. Must be "activity_type" or "location_wise".',
    });
  }

  const pageIndex = parseInt(String(body.pageIndex ?? "0"), 10);
  const pageSize = parseInt(String(body.pageSize ?? "10"), 10);

  // statusFilter — optional, only "pending" or "approved" are accepted values
  const rawStatusFilter = body.statusFilter;
  const statusFilter: "pending" | "approved" | null =
    rawStatusFilter === "pending" || rawStatusFilter === "approved"
      ? rawStatusFilter
      : null;

  const summaryParams: SummaryParams = {
    tab,
    locationIds,
    year,
    yearType,
    months,
    pageIndex,
    pageSize,
    // search is only meaningful on the location_wise tab — ignore it otherwise
    // to avoid unnecessary cache fragmentation.
    search:
      tab === "location_wise" && typeof body.search === "string"
        ? body.search.trim().substring(0, 200)
        : undefined,
    statusFilter: statusFilter ?? undefined,
  };

  const data = await getSummaryData(userSession, summaryParams);
  return NextResponse.json({ success: true, data });
}

// Single rate limit covers both paths.
// Export (is_export=true) is the more expensive operation — 30/min is the
// binding constraint. Summary calls are low-frequency (one per filter change)
// so 30/min is more than sufficient for normal usage.
export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POST_Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
