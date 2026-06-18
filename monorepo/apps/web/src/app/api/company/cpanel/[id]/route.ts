import { getSdkInstance } from "@/graphql/server/sdk";
import { getServerEnv } from "@/lib/env/env.server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid company ID" },
        { status: 400 }
      );
    }
    const env = await getServerEnv();

    const authHeader = req.headers.get("authorization") ?? "";
    const expected = env.AI_SERVICES_AUTHORIZATION;
    const authBuf = Buffer.from(authHeader.padEnd(expected.length));
    const expectedBuf = Buffer.from(expected);
    const isAuthorized =
      authBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(authBuf, expectedBuf);

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const sdk = await getSdkInstance();
    const result = await sdk.GetCompanyByCpanelId({ cpanelCompanyId: id });

    const company = result.Tbl_Companies?.[0];
    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("[GET /api/company/cpanel/:id]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
