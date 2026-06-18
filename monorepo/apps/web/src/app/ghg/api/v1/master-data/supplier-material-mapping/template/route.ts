import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { GetSupplierMaterialMappingTemplateUrl } from "@/modules/ghg/lib/supplier-material-mapping/download-template.service";
import { isOrganizationAdmin } from "@/modules/ghg/shared/constants/user-roles.constant";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  if (!isOrganizationAdmin(userSession.userRole)) {
    throw CustomError({
      statusCode: 401,
      message: "Permission denied.",
    });
  }

  const { url } = await GetSupplierMaterialMappingTemplateUrl();

  if (!url) {
    throw CustomError({
      statusCode: 404,
      message: "Template URL not found in Activity metadata.",
    });
  }

  return NextResponse.json({ success: true, data: { url }, error: null });
};

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
