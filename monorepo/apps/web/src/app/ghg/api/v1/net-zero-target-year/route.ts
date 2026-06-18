import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  try {
    const payload = await req.json();
    const orgId = String(payload?.organizationId);
    const sdk = await getGraphQlServerSDK();
    const orgData: any = await sdk.getOrgData({
      organizationId: orgId,
    });

    return NextResponse.json({
      success: true,
      data: orgData?.Organization[0] || [],
    });
  } catch (error) {
    throw CustomError({
      statusCode: 400,
      message: "Invalid organization id.",
      error: error,
    });
  }
}

export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
