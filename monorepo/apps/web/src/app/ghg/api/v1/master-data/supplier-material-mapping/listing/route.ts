import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { GetSupplierMaterialMappingListFromView } from "@/modules/ghg/lib/supplier-material-mapping/supplier-material-mapping.service";
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

  const url = new URL(req.url);
  const pageIndex = parseInt(url.searchParams.get("pageIndex") || "0", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
  const search = url.searchParams.get("search") || "";
  const sortBy = url.searchParams.get("sortBy") || "";
  const sortOrder =
    (url.searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  const response = await GetSupplierMaterialMappingListFromView(userSession, {
    pageIndex,
    pageSize,
    search,
    sortBy,
    sortOrder,
  });

  if (!response.success) {
    throw CustomError({
      statusCode: 500,
      message:
        (response?.error as any)?.toString() ||
        "Failed to fetch supplier material mapping list.",
    });
  }

  return NextResponse.json({
    success: true,
    data: response?.data,
    totalCount: response?.totalCount,
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
