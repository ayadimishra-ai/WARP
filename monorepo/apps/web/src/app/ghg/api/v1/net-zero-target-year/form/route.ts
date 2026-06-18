import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { INetZeroTargetYearInput } from "@/modules/ghg/lib/net-zero-target-year/net-zero-target-year.interface";
import { updateNetZeroTargetYearDetails } from "@/modules/ghg/lib/net-zero-target-year/net-zero-target-year.service";
import { validateNetZeroTargetFormInput } from "@/modules/ghg/lib/net-zero-target-year/net-zero-target-year.validation";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";

const POST_Handler = async (req: NextRequest, session: TUserSession) => {
  const organization_id = session.organizationId;
  const sessionUserId = session.userId;
  const payload: INetZeroTargetYearInput = await req.json();

  if (session?.userRole !== "OrganizationAdmin") {
    return NextResponse.json({
      success: false,
      status: 403,
      message: "Only admin user can access proceed this request.",
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

export const POST = apiExceptionGuard(apiAuthGuard(POST_Handler));
