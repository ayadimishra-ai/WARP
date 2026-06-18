import { NextRequest, NextResponse } from "next/server";
import { checkUserDataService } from "@/server/services/check-email-mobile-exists.services";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const response: any = await checkUserDataService(requestData.data);
    return NextResponse.json(response, {
      status: response.isError ? 400 : 200
    });
  } catch (error) {
    console.error("Error getting user data:", error);
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: "Failed to get user data"
      },
      { status: 500 }
    );
  }
}
