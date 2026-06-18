import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { distanceMatrixCalculation } from "~/lib/distance-matrix-calculation/distance-matrix-calculation";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { getServerEnv } from "~/utils/env/env.server";

async function POSTHandler(req: NextRequest) {
  const env = await getServerEnv();
  const providedKey = req.headers.get("Authorization") ?? "";

  let authorized = false;
  try {
    authorized = timingSafeEqual(
      Buffer.from(providedKey),
      Buffer.from(env.CRON_SECRET)
    );
  } catch {
    authorized = false;
  }

  if (!authorized) {
    return NextResponse.json({}, { status: 401 });
  }

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
}

export const POST = apiExceptionGuard(POSTHandler);
