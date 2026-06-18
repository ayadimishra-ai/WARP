import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/modules/ghg/lib/auth/auth.server";
import { ValidateAPIAccessTokenBodySchema } from "@/modules/ghg/lib/auth/auth.validation";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";

async function POSTHandler(req: NextRequest) {
  const input = await ValidateAPIAccessTokenBodySchema.parseAsync(
    await req.json()
  );

  const access_token = await getAccessToken(
    input.organization_id,
    input.user_email
  );

  return NextResponse.json({
    access_token,
  });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(POSTHandler, {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: false,
  })
);

export const dynamic = "force-dynamic";
