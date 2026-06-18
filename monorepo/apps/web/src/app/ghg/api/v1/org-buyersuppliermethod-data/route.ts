import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";

async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const orgId = String(body.organizationId);
    const sdk = await getGraphQlServerSDK();
    const orgData: any = await sdk.getOrgData({
      organizationId: orgId,
    });
    const orgMetaData = orgData?.Organization[0]?.metadata || [];
    const [metaData] = orgMetaData || [];
    const buyerShareMethod = metaData?.BuyerShareMethod || "";
    return NextResponse.json({ data: buyerShareMethod });
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
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
