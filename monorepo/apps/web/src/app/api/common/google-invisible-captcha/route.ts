import { getServerEnv } from "@/lib/env/env.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // req.method check removed — App Router named exports already enforce the method
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Missing token", statusCode: 400 },
      { status: 400 }
    );
  }

  const serverEnv = await getServerEnv();

  // RECAPTCHA_SECRET_KEY is validated by Zod at startup; this is a defensive check
  if (!serverEnv.RECAPTCHA_SECRET_KEY) {
    return NextResponse.json(
      { success: false, error: "Service misconfiguration", statusCode: 500 },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${serverEnv.RECAPTCHA_SECRET_KEY}&response=${encodeURIComponent(token)}`
      }
    );

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: "Failed verification", statusCode: 400 },
        { status: 400 }
      );
    }

    if (data.success === true && data.score >= 0.5) {
      // Omit raw reCAPTCHA response from client — it may contain internal metadata
      return NextResponse.json({ success: true, statusCode: 200 }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: "Bot score too low", statusCode: 400 },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", statusCode: 500 },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; // Ensure this route is handled at runtime
