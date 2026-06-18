import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "~/shared/error/custom-error";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  try {
    const payload = await req.json();
    const orgId = String(payload?.organizationId);
    const sdk = await getGraphQlServerSDK();
    const orgData: any = await sdk.getOrgData({
      organizationId: orgId,
    });

    return NextResponse.json({
      success: true,
      data: orgData?.Organization[0] || [],
    });
  } catch (error) {
    throw CustomError({
      statusCode: 400,
      message: "Invalid organization id.",
      error: error,
    });
  }
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
