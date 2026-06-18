import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { Buyersuppliermappingsdata } from "~/lib/master-data/organization-buyer-supplier-mappingcheck";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { CustomError } from "~/shared/error/custom-error";

const BodySchema = z.object({
  buyerOrgId: z.string().uuid("Invalid buyer org id"),
});

async function POST_handler(req: NextRequest, userSession: TUserSession) {
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    throw CustomError({ statusCode: 400, message: "Invalid buyer org id." });
  }
  const response = await Buyersuppliermappingsdata(
    userSession.organizationId,
    parsed.data.buyerOrgId
  );
  return NextResponse.json({
    statusCode: 200,
    data: response,
  });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POST_handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
