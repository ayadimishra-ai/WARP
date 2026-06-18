import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { GetStateData } from "@/modules/ghg/lib/common-functions/common-functions";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  const country_id = req.headers.get("country_id");

  if (!country_id) {
    throw new Error("Invalid input data");
  }
  const response = await GetStateData(country_id);
  if (!!response) {
    return NextResponse.json({
      success: true,
      data: response,
    });
  } else {
    throw CustomError({
      statusCode: 404,
      message: "Address not present.",
    });
  }
}; // Select
export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
