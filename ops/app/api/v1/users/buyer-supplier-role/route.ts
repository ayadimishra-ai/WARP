import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { getUserRole } from "~/lib/op-database/op-service.server";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // Use the org ID from the validated JWT session to prevent cross-tenant access.
  const orgId = userSession.organizationId;
  const role = await getUserRole(orgId);
  return NextResponse.json({
    success: true,
    data: role,
  });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
