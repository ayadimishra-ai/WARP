import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { notifyLocationExecutivesOnApproval } from "~/lib/monthly-activity-summary/email/monthly-activity-summary-email.service";
import { approveActivity, filtersCacheTag, summaryCacheTag } from "~/lib/monthly-activity-summary/service";
import { ApproveParams, YearType } from "~/lib/monthly-activity-summary/types";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "~/shared/error/custom-error";
import { ROLE_ORGANIZATION_ADMIN } from "~/utils/jwt/getUserDataFromToken";
import { logger } from "~/utils/logger";

async function POST_Handler(req: NextRequest, userSession: TUserSession) {
  // RULE-001: Only OrganizationAdmin may approve.
  if (userSession.userRole !== ROLE_ORGANIZATION_ADMIN) {
    throw CustomError({
      statusCode: 403,
      message: "Only an Organisation Admin can approve activity data.",
    });
  }

  const body = await req.json();

  const activityCode = String(body.activityCode ?? "").trim();
  if (!activityCode) {
    throw CustomError({ statusCode: 400, message: "activityCode is required." });
  }

  const year = parseInt(String(body.year ?? ""), 10);
  if (isNaN(year)) {
    throw CustomError({ statusCode: 400, message: "year must be a valid number." });
  }

  const yearType = String(body.yearType ?? "financial") as YearType;
  if (!["financial", "calendar"].includes(yearType)) {
    throw CustomError({
      statusCode: 400,
      message: 'yearType must be "financial" or "calendar".',
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

  const params: ApproveParams = { activityCode, year, yearType, locationIds, months };

  const data = await approveActivity(userSession, params);

  // Bust the summary cache for this org immediately so the next GET/POST to
  // /monthly-activity-summary reflects the just-approved records instead of
  // serving the 5-second stale cache. Without this, the UI re-fetch triggered
  // by RULE-010 (fetchSummaryData after approve) could still see old pending
  // counts within the TTL window.
  if (data.approvedCount > 0) {
    revalidateTag(summaryCacheTag(userSession.organizationId));
    // Also bust the filters cache — monthsWithData may now include newly-approved months.
    revalidateTag(filtersCacheTag(userSession.organizationId));
  }

  // US-6: Notify Location Executives for each approved location + activity.
  // Only triggered when records were actually approved.
  // after() guarantees this runs after the response is flushed — plain
  // fire-and-forget (.catch only) can be killed when the server context
  // closes before the async work finishes in Next.js App Router.
  if (data.approvedCount > 0) {
    after(() =>
      notifyLocationExecutivesOnApproval({
        organizationId: userSession.organizationId,
        effectiveLocationIds: data.approvedLocationIds,
        activityCode,
        approverUserId: userSession.userId,
        approveParams: params,
      }).catch((err) =>
        logger.error("approve: LE notification failed", {
          error: err instanceof Error ? err.message : String(err),
          activityCode,
          organizationId: userSession.organizationId,
        })
      )
    );
  }

  return NextResponse.json({ success: true, data });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POST_Handler), {
    limitInterval: 1,
    maxRequestCount: 30, // lower limit for a write operation
    progressiveDelay: true,
  })
);
