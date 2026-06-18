import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { getDataFlowResult, type TInput } from "./data-flow.service";

const POSTHandler = async (req: NextRequest, _session: TUserSession) => {
  const input: TInput = await req.json();
  const data = await getDataFlowResult(input);
  return NextResponse.json(data);
};

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POSTHandler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: false,
  })
);

export const dynamic = "force-dynamic";
