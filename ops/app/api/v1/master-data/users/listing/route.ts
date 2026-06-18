import { NextRequest, NextResponse } from "next/server";
import {
  GetAppUserDataQuery,
  GetAppUserDataWithPaginationQuery,
  GetViewAppUserDataWithPaginationQuery,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { getSnowkapServicesApiClient } from "~/lib/fetcher/server";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import {
  GetAppUserDetail,
  GetAppUsersByLastLogin,
} from "~/lib/user/form/user.service";
import { CustomError } from "~/shared/error/custom-error";
import { logger } from "~/utils/logger";

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  try {
    const snowkapServicesApiClient = await getSnowkapServicesApiClient();
    // Use session values from the validated JWT to prevent privilege escalation
    // via client-supplied headers.
    const organization_id = userSession.organizationId;
    const userId = userSession.userId;

    // Extract pagination, search, and sorting parameters from query string
    const { searchParams } = new URL(req.url);
    const pageIndexParam = searchParams.get("pageIndex");
    const pageSizeParam = searchParams.get("pageSize");
    const searchTerm = searchParams.get("search");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    // Parse pagination parameters with defaults
    const pageIndex = pageIndexParam ? parseInt(pageIndexParam, 10) : 0;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    // Create pagination object
    const pagination = {
      pageIndex: Math.max(0, pageIndex), // Ensure non-negative
      pageSize: Math.max(1, Math.min(20, pageSize)), // Ensure between 1 and 20
    };

    // Create sorting object
    const sorting = sortBy
      ? {
          sortBy: sortBy,
          sortOrder: (sortOrder === "desc" ? "desc" : "asc") as "desc" | "asc",
        }
      : undefined;

    // Handle last_logged_in sorting separately
    if (sorting?.sortBy === "last_logged_in") {
      const { userListWithLoginDetails, totalCount } =
        await GetAppUsersByLastLogin(
          organization_id,
          userId || "",
          pagination,
          sorting,
          searchTerm || undefined
        );

      return NextResponse.json({
        success: true,
        data: {
          userList: userListWithLoginDetails,
          pagination: {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            totalCount: totalCount,
          },
        },
      });
    }

    const response:
      | GetAppUserDataWithPaginationQuery
      | GetAppUserDataQuery
      | GetViewAppUserDataWithPaginationQuery = await GetAppUserDetail(
      organization_id,
      !!req.headers.get("userId") ? userId : "",
      userSession?.userEmail,
      pagination,
      searchTerm || undefined, // Pass search term to the service
      sorting // Pass sorting parameters to the service
    );

    // Handle both AppUser and view_app_user responses
    const userData =
      (response as GetAppUserDataWithPaginationQuery)?.AppUser ||
      (response as GetViewAppUserDataWithPaginationQuery)?.view_app_user ||
      [];
    const hasUsers = userData && userData.length > 0;
    const totalCount =
      "totalUsersCount" in response
        ? (response as GetAppUserDataWithPaginationQuery)?.totalUsersCount
            ?.aggregate?.totalRows ||
          (response as GetViewAppUserDataWithPaginationQuery)?.totalUsersCount
            ?.aggregate?.totalRows ||
          0
        : userData?.length || 0;

    if (hasUsers) {
      // Get user IDs from the current page response
      const userIds = userData?.map((user) => user?.id) || [];

      const userResponse = await snowkapServicesApiClient.post(
        "/api/user/op-users-last-login-details",
        JSON.stringify({
          op_organization_id: organization_id,
          user_ids: userIds, // Only fetch for users in current response
        })
      );

      // Get login details and merge into userList
      const lastLoginDetails = userResponse?.data?.data || [];
      const userListWithLoginDetails = userData?.map((user) => {
        const loginRecord = lastLoginDetails?.find(
          (login: any) => login?.op_user_id === user?.id
        );
        return {
          ...user,
          lastLoginDetails: loginRecord?.login_timestamp || null,
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          userList: userListWithLoginDetails,
          pagination: {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            totalCount: totalCount,
          },
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        data: {
          userList: [],
          pagination: {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            totalCount: totalCount,
          },
        },
      });
    }
  } catch (err) {
    logger.error("Failed to fetch user data", {
      error: err,
      errorStack: err instanceof Error ? err.stack : undefined,
    });
    throw CustomError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
};
// Select
export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
