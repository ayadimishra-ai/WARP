import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { getFilters } from "~/lib/monthly-activity-summary/service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";

// Let apiExceptionGuard catch and surface real errors — no inner try/catch.
async function GET_Handler(req: NextRequest, userSession: TUserSession) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams?.get("year");
  const yearOverride = yearParam ? parseInt(yearParam, 10) : undefined;
  const locationIdsParam = searchParams?.get("locationIds");
  const locationIds = locationIdsParam
    ? locationIdsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;
  const data = await getFilters(userSession, yearOverride, locationIds);
  return NextResponse.json({ success: true, data });
}

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
