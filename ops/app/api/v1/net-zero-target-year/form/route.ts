import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { INetZeroTargetYearInput } from "~/lib/net-zero-target-year/net-zero-target-year.interface";
import { updateNetZeroTargetYearDetails } from "~/lib/net-zero-target-year/net-zero-target-year.service";
import { validateNetZeroTargetFormInput } from "~/lib/net-zero-target-year/net-zero-target-year.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "~/shared/error/custom-error";

const POST_Handler = async (req: NextRequest, session: TUserSession) => {
  const organization_id = session.organizationId;
  const sessionUserId = session.userId;
  const payload: INetZeroTargetYearInput = await req.json();

  if (session?.userRole !== "OrganizationAdmin") {
    throw CustomError({
      statusCode: 403,
      message: "Only an Organisation Admin can perform this action.",
    });
  }

  const validationResult = validateNetZeroTargetFormInput(payload);

  if (!validationResult.success) {
    return Response.json(
      {
        success: validationResult.success,
        errors: validationResult.errors,
        data: null,
      },
      { status: 400 }
    );
  }

  if (validationResult.success) {
    let response: any | null = await updateNetZeroTargetYearDetails(
      payload,
      sessionUserId,
      organization_id
    );
    if (response?.success) {
      return NextResponse.json({
        success: true,
        data: response?.data,
      });
    } else {
      throw CustomError({
        statusCode: 500,
        message: "Some error occurred please try again",
      });
    }
  } else {
    throw CustomError({
      statusCode: 404,
      message: "Some error occurred please try again",
    });
  }
};

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POST_Handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
