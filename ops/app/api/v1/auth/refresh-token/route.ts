import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({
    message: "This is refresh token endpoint",
    data: req.body,
  });
}
