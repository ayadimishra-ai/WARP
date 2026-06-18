import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  return NextResponse.json({
    message: "This is energy fuel consumption excel data import api",
    data: "",
  });
}

export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
