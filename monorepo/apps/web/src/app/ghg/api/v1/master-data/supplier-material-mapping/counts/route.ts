import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { GetMappingCount } from "@/modules/ghg/lib/supplier-material-mapping/supplier-material-mapping.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { isOrganizationAdmin } from "@/modules/ghg/shared/constants/user-roles.constant";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  if (!isOrganizationAdmin(userSession.userRole)) {
    throw CustomError({
      statusCode: 401,
      message: "Only admin user can access this page.",
    });
  }

  const response = await GetMappingCount(userSession.organizationId);

  if (!response.success) {
    throw CustomError({
      statusCode: 500,
      message: "Failed to fetch mapping count.",
    });
  }

  return NextResponse.json({
    success: true,
    totalCount: response.totalCount,
  });
};

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
