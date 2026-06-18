import { NextRequest, NextResponse } from "next/server";
import { updateBusinessTraveTripDistancelData } from "~/lib/update-business-travel-data/update-business-travel-data";
import { cronJobKey } from "~/shared/constants/input.constant";

export async function POST(req: NextRequest) {
  if (String(req.headers.get("Authorization")) == cronJobKey) {
    const response = await updateBusinessTraveTripDistancelData(
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
