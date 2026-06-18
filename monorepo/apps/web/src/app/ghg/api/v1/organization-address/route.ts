import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";

async function getHandler(req: NextRequest, userSession: TUserSession) {
  try {
    const organizationId = userSession.organizationId;

    // Validate that organizationId exists
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required." },
        { status: 400 }
      );
    }

    // Get the server SDK
    const sdk = await getGraphQlServerSDK();

    // Fetch all addresses for the organization
    const orgAddress = await sdk.getAddresses({
      organisationAddressId: organizationId,
    });

    return NextResponse.json({
      success: true,
      data: orgAddress?.OrganizationAddress || [],
    });
  } catch (error) {
    console.error("Error in getHandler:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching addresses." },
      { status: 500 }
    );
  }
}

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(getHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
