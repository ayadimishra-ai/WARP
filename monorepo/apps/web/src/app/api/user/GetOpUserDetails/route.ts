import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";
import { getUserByOpsUserIds } from "@/server/services/user.services";
import { NextRequest, NextResponse } from "next/server";

async function handlePOST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { opUserIds } = requestBody || {};

    // Support both single ID and multiple IDs
    let userIds: string[] = [];

    if (opUserIds && Array.isArray(opUserIds)) {
      userIds = opUserIds.filter(
        (id) => id && typeof id === "string" && id.trim() !== ""
      );
    }

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: "At least one valid user ID is required." },
        { status: 400 }
      );
    }

    // Add reasonable limit to prevent abuse
    if (userIds.length > 100) {
      return NextResponse.json(
        { saveresult: "Maximum 100 user IDs allowed per request." },
        { status: 400 }
      );
    }

    const result = await getUserByOpsUserIds(userIds);

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

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true
});

export const dynamic = "force-dynamic";
