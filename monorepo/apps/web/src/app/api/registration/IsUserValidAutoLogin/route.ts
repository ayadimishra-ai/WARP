import { NextRequest, NextResponse } from "next/server";
import { validateUserAutoLogin } from "@/server/services/user-valid-auto-login.services";
import { ErrorResponse, LoginRequestBody } from "@/lib/interfaces";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";

async function handlePOST(req: NextRequest) {
  try {
    // Parse body
    const contentType = req.headers.get("content-type");
    const rawAuthHeader = req.headers.get("Authorization");
    const PlatformToken = rawAuthHeader?.split(" ")[1];
    if (
      !PlatformToken ||
      !contentType ||
      !contentType.includes("application/json")
    ) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Request must have Content-Type: application/json header",
          status: 415
        },
        { status: 415 }
      );
    }

    let body: LoginRequestBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, "Malformed JSON request body");
    }

    const { EmailId, Password, BrowserToken, BrowserName } = body;

    // Validate fields
    if (!isValidString(EmailId))
      return jsonResponse(
        400,
        "Email is required and must be a non-empty string"
      );
    if (!isValidString(Password))
      return jsonResponse(
        400,
        "Password is required and must be a non-empty string"
      );
    if (!isValidEmail(EmailId))
      return jsonResponse(400, "Please provide a valid email address");

    // Business logic
    const response = await validateUserAutoLogin(
      EmailId,
      Password,
      BrowserToken,
      BrowserName
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error in user validation:", error);

    const message = error?.message || "";

    if (
      message.includes("User not found") ||
      message.includes("Invalid credentials")
    ) {
      return jsonResponse(401, "Invalid email or password");
    }

    return jsonResponse(
      500,
      "An unexpected error occurred during authentication"
    );
  }
}

const jsonResponse = (status: number, error: string) =>
  NextResponse.json({ error }, { status });

const isValidString = (val: any): val is string =>
  typeof val === "string" && val.trim().length > 0;

const isValidEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 30,
  progressiveDelay: false
});

export const dynamic = "force-dynamic";
