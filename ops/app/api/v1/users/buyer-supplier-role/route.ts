import { NextRequest, NextResponse } from "next/server";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { getUserRole } from "~/lib/op-database/op-service.server";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";

async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const orgId = String(body.organizationId);

    // Validate that orgId is a string (UUID)
    if (typeof orgId !== "string") {
      return NextResponse.json(
        { error: "Invalid organization ID format." },
        { status: 400 }
      );
    }
    let role = await getUserRole(orgId);
    return NextResponse.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error("Error in postHandler:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
