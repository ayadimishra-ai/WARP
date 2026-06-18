import { NextRequest, NextResponse } from "next/server";

export const POST = (req: NextRequest) => {
  const data = req.body;
  return NextResponse.json({
    message: "This is POST request - Platform Sync - Users - Remove",
    data,
  });
};
