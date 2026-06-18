import { NextRequest, NextResponse } from "next/server";
import { distanceMatrixCalculation } from "~/lib/distance-matrix-calculation/distance-matrix-calculation";
import { cronJobKey } from "~/shared/constants/input.constant";

export async function POST(req: NextRequest) {
  if (String(req.headers.get("Authorization")) == cronJobKey) {
    const date = new Date();
    const dateWithStartTime = new Date(date.setHours(0, 0, 0, 1));
    const dateWithEndTime = new Date(date.setHours(23, 59, 59, 999));
    const response = await distanceMatrixCalculation(
      dateWithStartTime,
      dateWithEndTime,
      String(req.headers.get("Organizationid"))
    );
    return NextResponse.json({
      statusCode: response.statusCode,
      data: response,
    });
  } else {
    return NextResponse.json({}, { status: 401 });
  }
}
