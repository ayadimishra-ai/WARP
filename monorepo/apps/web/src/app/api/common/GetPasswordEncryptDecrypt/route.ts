import { NextRequest, NextResponse } from "next/server";
import { getPasswordEncryptDecrypt } from "@/server/services/get-password-encrypt-decrypt";

export async function GET(request: NextRequest) {
  const password = request.headers.get("password");
  const type = request.headers.get("type");

  if (!password || !type) {
    return NextResponse.json(
      { error: "Password and type are required." },
      { status: 400 }
    );
  }

  const result = await getPasswordEncryptDecrypt({ password, type });
  return NextResponse.json(result);
}
