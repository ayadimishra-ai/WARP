import { getServerEnv } from "@/lib/env/env.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({
      success: false,
      statusCode: 405,
      error: "Method not allowed"
    });
  }

  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({
      success: false,
      error: "Missing token",
      statusCode: 400
    });
  }

  const serverEnv = await getServerEnv();

  if (!serverEnv.RECAPTCHA_SECRET_KEY) {
    return NextResponse.json({
      success: false,
      error: "Missing secret key",
      statusCode: 500
    });
  }

  try {
    const response = await fetch(
      String("https://www.google.com/recaptcha/api/siteverify"),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${serverEnv.RECAPTCHA_SECRET_KEY}&response=${token}`
      }
    );

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json({
        success: false,
        error: "Failed verification",
        statusCode: 300,
        data
      });
    }
    if (data.success == true && data.score >= 0.5) {
      return NextResponse.json({ success: true, data, statusCode: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: "You are BOT",
        data,
        statusCode: 300
      });
    }
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      statusCode: 500
    });
  }
}

export const dynamic = "force-dynamic"; // Ensure this route is handled at runtime
