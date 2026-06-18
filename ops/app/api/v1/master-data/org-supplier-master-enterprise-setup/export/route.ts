import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { ExportSupplierMasterData } from "~/lib/supplier-master/export-supplier-master-data";
import { CustomError } from "~/shared/error/custom-error";

const postHandler = async (req: NextRequest, userSession: TUserSession) => {
  const response = await ExportSupplierMasterData(userSession.organizationId);

  if (!!response) {
    return NextResponse.json({
      success: true,
      data: response,
    });
  } else {
    throw CustomError({
      statusCode: 404,
      message: "record not present.",
    });
  }
};
export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
