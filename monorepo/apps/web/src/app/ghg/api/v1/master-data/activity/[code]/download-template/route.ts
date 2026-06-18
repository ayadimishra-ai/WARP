import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { GetActivityTemplateDownloadUrl } from "@/modules/ghg/lib/supplier-master/download-template.service";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  // Extract activity code from URL pathname
  // URL format: /api/v1/master-data/activity/{code}/download-template
  const pathname = req.nextUrl.pathname;
  const pathSegments = pathname.split("/");
  const codeIndex = pathSegments.indexOf("activity") + 1;
  const code = pathSegments[codeIndex];

  if (!code || typeof code !== "string") {
    throw CustomError({
      statusCode: 400,
      message: "Activity code is required",
    });
  }

  // Pass organizationId for special handling of buyer_share activity
  const response = await GetActivityTemplateDownloadUrl(
    code,
    userSession?.organizationId
  );

  if (!!response?.url) {
    return NextResponse.json({
      success: true,
      response,
    });
  } else {
    throw CustomError({
      statusCode: 404,
      message: `Template not found for activity code: ${code}`,
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
