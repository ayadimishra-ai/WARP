import { NextRequest, NextResponse } from "next/server";
import { ErrorResponse } from "@/lib/interfaces";
import { SetNewPasswordForInternalAssessment } from "@/server/services/set-new-password-for-internal-assessment";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";
import { sanitiseObjectValues } from "@/util/dom-purifier.server.util";

async function handlePOST(req: NextRequest) {
  try {
    const bodyData = await req.json();
    const body = sanitiseObjectValues<{
      EmailId: string;
      Password: string;
      Formid: string;
    }>(bodyData);
    const { EmailId, Password, Formid } = body;

    // Validate at least one identifier is provided
    if (!EmailId || EmailId.trim() === "") {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Email is required",
          status: 400
        },
        { status: 400 }
      );
    }

    const userData = await SetNewPasswordForInternalAssessment(
      EmailId,
      Password,
      Formid
    );

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error in SetNewPasswordForInternalAssessment API:", error);
    const responseData = {
      error: "Internal server error"
    };
    return NextResponse.json(responseData, { status: 500 });
  }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 30,
  progressiveDelay: true
});

export const dynamic = "force-dynamic"; // Ensure this route is handled at runtime
