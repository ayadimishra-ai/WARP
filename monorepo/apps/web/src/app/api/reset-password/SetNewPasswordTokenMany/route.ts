import { NextResponse, type NextRequest } from "next/server";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";
import { updateUserPasswordTokenByOpsUserId } from "@/server/services/reset-password.service";

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
    const { opsUserIds } = requestBody;

    // Extract opsUserId values from the array of objects
    const extractedOpsUserIds =
      opsUserIds?.map((item: { opsUserId: string }) => item.opsUserId) || [];

    // Validate OPSUserId
    if (
      !extractedOpsUserIds ||
      !Array.isArray(extractedOpsUserIds) ||
      extractedOpsUserIds.length === 0
    ) {
      return NextResponse.json(
        {
          status200OK: 400,
          saveresult: "Missing required parameters"
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const userResult =
      await updateUserPasswordTokenByOpsUserId(extractedOpsUserIds);

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
