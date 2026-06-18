import { NextResponse, type NextRequest } from "next/server";
import { sanitiseServerSideValuesByTypeOfData } from "@/util/dom-purifier.server.util";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";
import { getUserDetailsByPasswordToken } from "@/server/services/reset-password.service";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, resetPasswordToken"
};

// Handle preflight request
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

async function handlePOST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { resetPasswordToken } = requestBody;

    // Get headers from the request
    const resetPasswordTokenSanitized = sanitiseServerSideValuesByTypeOfData(
      String(resetPasswordToken)
    );

    if (
      !resetPasswordTokenSanitized ||
      resetPasswordTokenSanitized?.trim() === ""
    ) {
      return NextResponse.json(
        {
          status200OK: 400,
          saveresult: "Missing required parameters"
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const userResult = await getUserDetailsByPasswordToken(
      resetPasswordTokenSanitized
    );

    if (!userResult.success) {
      return NextResponse.json(
        {
          status200OK: 400,
          saveresult: "Invalid reset password request",
          error: userResult.message
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Return the response with CORS headers
    return NextResponse.json(userResult, { headers: corsHeaders });
  } catch (error) {
    console.error("Error in SetNewPasswordToken API:", error);
    return NextResponse.json(
      {
        status200OK: 500,
        saveresult: "Internal server error"
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 30,
  progressiveDelay: true
});

export const dynamic = "force-dynamic";
