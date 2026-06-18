import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { GetActivityTemplateByCode } from "~/lib/supplier-master/download-template.service";
import { CustomError } from "~/shared/error/custom-error";

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  const response = await GetActivityTemplateByCode("supplier_master");

  if (!!response) {
    return NextResponse.json({
      success: true,
      response,
    });
  } else {
    throw CustomError({
      statusCode: 404,
      message: "Supplier master template not found.",
    });
  }
};
export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
