import { NextRequest, NextResponse } from "next/server";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { TUserSession } from "~/lib/auth/auth.client";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";

// NOTE: This is a sample/placeholder route. The previous implementation contained a
// SQL injection vulnerability (user-supplied organizationId interpolated into raw SQL)
// and was unauthenticated. It has been replaced with a safe stub.
async function GETHandler(req: NextRequest, userSession: TUserSession) {
  return NextResponse.json({ message: "Sample GET route", organizationId: userSession.organizationId });
}

async function POSTHandler(req: NextRequest, userSession: TUserSession) {
  const data = await req.json();
  return NextResponse.json({ message: "Sample POST route", data });
}

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GETHandler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POSTHandler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
