import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { getServerEnv } from "~/utils/env/env.server";

// Platform-sync routes are internal service-to-service endpoints authenticated
// by the SK_SERVICES_AUTH_TOKEN bearer token — not by user JWTs.
async function POSTHandler(req: NextRequest) {
  const env = await getServerEnv();
  const authToken = req.headers.get("authorization") ?? "";

  let authorized = false;
  try {
    authorized = timingSafeEqual(
      Buffer.from(authToken),
      Buffer.from(env.SK_SERVICES_AUTH_TOKEN)
    );
  } catch {
    authorized = false;
  }

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized request" }, { status: 401 });
  }

  return NextResponse.json({
    message: "This is POST request - Platform Sync - Users - Upsert",
    success: true,
  });
}

export const POST = apiExceptionGuard(POSTHandler);
