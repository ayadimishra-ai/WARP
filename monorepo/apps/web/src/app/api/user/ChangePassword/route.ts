import { NextRequest, NextResponse } from "next/server";
import { changePasswordService } from "@/server/services/change-password.service";
import { sanitiseObjectValues } from "@/util/dom-purifier.server.util";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";

async function handlePOST(request: NextRequest) {
  try {
    const bodyData = await request.json();
    const body = sanitiseObjectValues<{
      UserGuid: string;
      Password: string;
    }>(bodyData);
    const { UserGuid, Password } = body;
    if (!UserGuid || !Password) {
      return NextResponse.json(
        { error: "UserGuid and Password are required." },
        { status: 400 }
      );
    }

    const result = await changePasswordService({ UserGuid, Password });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Change password API error:", error);
    return NextResponse.json(
      { status200OK: 500, saveresult: "Internal server error." },
      { status: 500 }
    );
  }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true
});

export const dynamic = "force-dynamic";
