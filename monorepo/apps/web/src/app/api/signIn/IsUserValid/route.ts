import { NextRequest, NextResponse } from "next/server";
import { validateUser } from "@/server/services/user-valid.services";
import { LoginRequestBody, ErrorResponse } from "@/lib/interfaces";
import {
  validateLoginCredentials,
  LoginCredentials
} from "@/lib/validations/user-valid.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";
import { sanitiseObjectValues } from "@/util/dom-purifier.server.util";

async function handlePOST(req: NextRequest) {
  try {
    // Check content type
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

    // Parse and validate body
    let body: LoginRequestBody;
    try {
      const bodyData = await req.json();
      body = sanitiseObjectValues<LoginRequestBody>(bodyData);
    } catch (e) {
      return NextResponse.json(
        { error: "Malformed JSON request body" },
        { status: 400 }
      );
    }

    // Use Zod validation for login credentials
    const validationResult = validateLoginCredentials(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // Extract validated data (we know these exist and are valid because of the Zod validation)
    const { EmailId, Password, BrowserToken, BrowserName } =
      body as LoginCredentials;

    const response = await validateUser(
      EmailId,
      Password,
      BrowserToken,
      BrowserName
    );

    if (!response.success) {
      return NextResponse.json(
        { error: response.error?.message ?? "Authentication failed" },
        { status: response.error?.status ?? 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (_error: any) {
    console.error("Error in user validation:", _error);

    // Handle specific error cases
    if (
      _error.message.includes("User not found") ||
      _error.message.includes("Invalid credentials")
    ) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred during authentication"
      },
      { status: 500 }
    );
  }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 30,
  progressiveDelay: true
});

export const dynamic = "force-dynamic";
