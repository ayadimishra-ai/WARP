import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { GetSupplierMasterListEnterpriseSetup } from "~/lib/master-data/organization-supplier-master.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "~/shared/error/custom-error";
import { logger } from "~/utils/logger";

type PaginationType = {
  pageIndex: number;
  pageSize: number;
};

type SortingType = {
  sortBy: string;
  sortOrder: "asc" | "desc";
};

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  try {
    const { searchParams } = new URL(req.url);

    // Query params
    const pageIndexParam = searchParams.get("pageIndex");
    const pageSizeParam = searchParams.get("pageSize");
    const searchTerm = searchParams.get("search");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    // Pagination
    const pageIndex = pageIndexParam ? parseInt(pageIndexParam, 10) : 0;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    const pagination: PaginationType = {
      pageIndex: Math.max(0, pageIndex),
      pageSize: Math.max(1, Math.min(20, pageSize)),
    };

    // Sorting
    const sorting: SortingType | undefined = sortBy
      ? {
          sortBy,
          sortOrder: sortOrder === "desc" ? "desc" : "asc",
        }
      : undefined;

    // 🔥 IMPORTANT: Your service must support these params
    const response = await GetSupplierMasterListEnterpriseSetup(
      userSession,
      pagination,
      searchTerm || undefined,
      sorting
    );

    if (!response.success) {
      throw CustomError({
        statusCode: 500,
        message:
          response?.error?.toString() ||
          "Failed to fetch supplier master list.",
      });
    }

    const supplierList = response?.data?.suppliers ?? [];
    const totalCount = response?.data?.totalCount ?? 0;
    return NextResponse.json({
      success: true,
      data: {
        supplierList,
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          totalCount,
        },
      },
    });
  } catch (err) {
    logger.error("Failed to fetch supplier data", {
      error: err,
      errorStack: err instanceof Error ? err.stack : undefined,
    });

    throw CustomError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
};

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
