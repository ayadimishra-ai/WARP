import { NextRequest, NextResponse } from "next/server";
import { getUserByEmailOrMobile } from "@/server/services/user.services";
import { emailEncrypt } from "@/util/emailEncrypt";
import { UserExistsRequest, ErrorResponse } from "@/lib/interfaces";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";
import { getServerEnv } from "@/lib/env/env.server";

async function handlePOST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Email, Mobile } = body as UserExistsRequest;

    // Validate at least one identifier is provided
    if ((!Email || Email.trim() === "") && (!Mobile || Mobile.trim() === "")) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Either email or mobile must be provided",
          status: 400
        },
        { status: 400 }
      );
    }

    let encryptedEmailId: string | undefined;

    // Only encrypt if Email is provided
    if (!!Email) {
      const env = await getServerEnv();
      encryptedEmailId = emailEncrypt(
        {
          encryptionKey: env.ENCRYPTION_KEY,
          encryptionIV: env.ENCRYPTION_IV
        },
        Email
      );
    }

    // Get user data
    const userData = await getUserByEmailOrMobile(
      !!Email ? String(encryptedEmailId).toUpperCase() : "",
      Mobile
    );

    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error in IfUserExists API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 30,
  progressiveDelay: true
});

export const dynamic = "force-dynamic"; // Ensure this route is handled at runtime
