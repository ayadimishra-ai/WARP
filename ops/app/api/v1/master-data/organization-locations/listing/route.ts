import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { GetAddressDetailByOrganization } from "~/lib/master-data/organization-location.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "~/shared/error/custom-error";

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  // Use organizationId from the validated JWT session instead of a client-supplied
  // header to prevent privilege escalation.
  const organizationId = userSession.organizationId;
  if (!organizationId) {
    throw new Error("Invalid input data");
  }

  // Get pagination params from query string
  const { searchParams } = new URL(req.url);
  const pageIndex = parseInt(searchParams.get("pageIndex") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const searchTerm = searchParams.get("search") || undefined;
  const sortBy = searchParams.get("sortBy") || undefined;
  const sortOrder = searchParams.get("sortOrder") || "asc";

  let response = await GetAddressDetailByOrganization(
    organizationId,
    pageIndex,
    pageSize,
    searchTerm,
    sortBy,
    sortOrder
  );
  if (!!response) {
    return NextResponse.json({
      success: true,
      data: response.mappingData,
      pagination: {
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: response.totalCount,
      },
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
