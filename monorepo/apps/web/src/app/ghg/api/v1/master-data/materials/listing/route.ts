import { NextRequest, NextResponse } from "next/server";
import { GetMaterialMasterWithPaginationQuery } from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import {
  GetMaterialMasterDetail,
  PaginationType,
  SortingType,
} from "@/modules/ghg/lib/material-master/material-master.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";
import { logger } from "@/modules/ghg/utils/logger";

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  try {
    const organization_id = userSession.organizationId;

    // Extract pagination, search, and sorting parameters from query string
    const { searchParams } = new URL(req.url);
    const pageIndexParam = searchParams?.get("pageIndex");
    const pageSizeParam = searchParams?.get("pageSize");
    const searchTerm = searchParams?.get("search");
    const sortBy = searchParams?.get("sortBy");
    const sortOrder = searchParams?.get("sortOrder");

    // Parse pagination parameters with defaults
    const pageIndex = pageIndexParam ? parseInt(pageIndexParam, 10) : 0;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    // Create pagination object
    const pagination: PaginationType = {
      pageIndex: Math.max(0, pageIndex), // Ensure non-negative
      pageSize: Math.max(1, Math.min(20, pageSize)), // Ensure between 1 and 20
    };

    // Create sorting object
    const sorting: SortingType | undefined = sortBy
      ? {
          sortBy: sortBy,
          sortOrder: (sortOrder === "desc" ? "desc" : "asc") as "desc" | "asc",
        }
      : undefined;

    const response: GetMaterialMasterWithPaginationQuery =
      await GetMaterialMasterDetail(
        organization_id,
        pagination,
        searchTerm || undefined, // Pass search term to the service
        sorting // Pass sorting parameters to the service
      );

    const materialData = response?.OrgMaterialMaster ?? [];
    const totalCount = response?.totalMaterialsCount?.aggregate?.totalRows ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        materialList: materialData,
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          totalCount: totalCount,
        },
      },
    });
  } catch (err) {
    logger.error("Failed to fetch material data", {
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
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
