import { NextRequest, NextResponse } from "next/server";
import { CreateOPsUser } from "@/server/services/create-user.services";

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    const response: any = await CreateOPsUser(requestData);
    return NextResponse.json(response, {
      status: response.isError ? 400 : 200
    });
  } catch (error) {
    console.error("Error saving user data:", error);
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: "Failed to save user data"
      },
      { status: 500 }
    );
  }
}
