import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { GetSupplierLocationMasterList } from "~/lib/supplier-location-master/supplier-location-master-form.service";
import { isOrganizationAdmin } from "~/shared/constants/user-roles.constant";
import { CustomError } from "~/shared/error/custom-error";

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

  const response = await GetSupplierLocationMasterList(userSession, {
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
        response?.error?.toString() ||
        "Failed to fetch supplier location master list.",
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
