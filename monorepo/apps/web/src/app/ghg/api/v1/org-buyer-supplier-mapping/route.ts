import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { Buyersuppliermappingsdata } from "@/modules/ghg/lib/master-data/organization-buyer-supplier-mappingcheck";

async function POST_handler(req: NextRequest, userSession: TUserSession) {
  userSession.organizationId;
  const response = await Buyersuppliermappingsdata(
    userSession.organizationId,
    "cb3a1243-c11b-4eb5-ae3d-061ff9178b6b" // Buyer Org Id diamler
  );
  return NextResponse.json({
    statusCode: 200,
    data: response,
  });
}

export const POST = apiExceptionGuard(apiAuthGuard(POST_handler));
