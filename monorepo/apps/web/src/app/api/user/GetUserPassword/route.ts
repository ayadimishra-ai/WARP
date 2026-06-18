import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";
import { getUserPasswordService } from "@/server/services/get-user-password.service";
import { NextRequest, NextResponse } from "next/server";

async function handleGET(request: NextRequest) {
  try {
    const userGuid = request.headers.get("UserGuid");

    if (!userGuid) {
      return NextResponse.json(
        { error: "UserGuid header is required." },
        { status: 400 }
      );
    }

    const result = await getUserPasswordService(userGuid);

    if (result && typeof result === "object" && "status200OK" in result) {
      return NextResponse.json(result, { status: result.status200OK });
    }

    return NextResponse.json(
      { status200OK: 200, saveresult: result },
      { status: 200 }
    );
  } catch (_error) {
    return NextResponse.json(
      { status200OK: 500, saveresult: "Internal server error." },
      { status: 500 }
    );
  }
}

export const GET = withEmailOrIpRateLimitWithProgressiveDelay(handleGET, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true
});

export const dynamic = "force-dynamic";