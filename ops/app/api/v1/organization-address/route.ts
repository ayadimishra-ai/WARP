import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";

async function getHandler(req: NextRequest, userSession: TUserSession) {
  const organizationId = userSession.organizationId;

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
}

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(getHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
