import { NextRequest, NextResponse } from "next/server";
import { getEmailEncryptDecrypt } from "@/server/services/get-email-encrypt-decrypt";

export async function GET(request: NextRequest) {
  const email = request.headers.get("email");
  const type = request.headers.get("type");

  if (!email || !type) {
    return NextResponse.json(
      { error: "Email and type are required." },
      { status: 400 }
    );
  }

  const result = await getEmailEncryptDecrypt({ email, type });

  return NextResponse.json(result);
}
