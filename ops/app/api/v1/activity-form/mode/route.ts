import { NextRequest, NextResponse } from "next/server";
import { getActivityFormMode } from "~/lib/activity-form/activity-form-mode.service";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "~/shared/error/custom-error";

/**
 * GET /api/v1/activity-form/mode
 *
 * Check if an organization has standard or prepopulate form mode
 *
 * Returns:
 * {
 *   "success": true,
 *   "formMode": "standard" | "prepopulate"
 * }
 */

async function getHandler(
  req: NextRequest,
  userSession?: TUserSession
): Promise<NextResponse> {
  if (!userSession) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const organizationId = userSession.organizationId;

  if (!organizationId) {
    throw CustomError({
      statusCode: 400,
      message: "Organization ID is required",
    });
  }

  try {
    // Use server-side service to determine form mode from feature flags
    const { mode } = await getActivityFormMode(organizationId);

    // Map detailed modes to simple form mode for backward compatibility
    const formMode = mode.startsWith("prepopulate")
      ? "prepopulate"
      : "standard";

    return NextResponse.json({
      success: true,
      formMode,
    });
  } catch (error) {
    console.error(
      `Error checking activity form mode for org ${organizationId}:`,
      error
    );
    throw CustomError({
      statusCode: 500,
      message: "Failed to check activity form mode",
    });
  }
}

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(getHandler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
