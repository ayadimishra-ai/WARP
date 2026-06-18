// apps\web\src\app\api\forgot-password\ResetNewPasswordEmail\route.ts
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { sendResetPasswordEmail } from "@/server/services/reset-new-password-email.services";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";
import { sanitiseObjectValues } from "@/util/dom-purifier.server.util";

// Define the schema for the request body
const ResetPasswordSchema = z.object({
  UserEmailId: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
});

async function handlePOST(request: NextRequest) {
  try {
    const bodyData = await request.json();
    const body = sanitiseObjectValues<{ UserEmailId: string }>(bodyData);
    // Validate the request body against the schema
    const validation = ResetPasswordSchema.safeParse(body);

    // If validation fails, return the error response
    if (!validation.success) {
      const errorMessage =
        validation.error.issues[0]?.message || "Invalid request data";
      return NextResponse.json({ status200OK: 400, saveresult: errorMessage });
    }

    const { UserEmailId } = validation.data;

    const result = await sendResetPasswordEmail(UserEmailId);

    if (!result.success) {
      return NextResponse.json({
        status200OK: 400,
        saveresult: result.error || "Failed to process request"
      });
    }

    return NextResponse.json({ status200OK: 200, saveresult: "Success" });
  } catch (error) {
    console.error("Error in ResetNewPasswordEmail:", error);
    return NextResponse.json({
      status200OK: 500,
      saveresult: "An error occurred while processing your request"
    });
  }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 10,
  progressiveDelay: true
});

export const dynamic = "force-dynamic";
