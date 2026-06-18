import { NextRequest, NextResponse } from "next/server";
import { getMenuList } from "@/server/services/menu.services";
import { MenuListRequest, ErrorResponse } from "@/lib/interfaces";
import { withEmailOrIpRateLimit } from "@/lib/rate-limit-by-email-or-ip";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/lib/progressive-delay-rate-limit";

async function handlePOST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<MenuListRequest>;

    // Input validation
    if (!body.roleGuid?.trim() || !body.userGuid?.trim()) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Both roleGuid and userGuid are required in request body"
        },
        { status: 400 }
      );
    }

    const result = await getMenuList({
      roleGuid: body.roleGuid!,
      userGuid: body.userGuid!
    });

    if (!result.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: result.error || "Failed to fetch menu",
          details: result.details
        },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      table1: result.data?.table1
    });
  } catch (error) {
    console.error("Error in GetMenuList API:", error);
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export const POST = withEmailOrIpRateLimitWithProgressiveDelay(handlePOST, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true
});

export const dynamic = "force-dynamic"; // Ensure this route is handled at runtime
