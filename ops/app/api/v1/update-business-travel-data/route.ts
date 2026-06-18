import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { updateBusinessTraveTripDistancelData } from "~/lib/update-business-travel-data/update-business-travel-data";
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

  const response = await updateBusinessTraveTripDistancelData(
    String(req.headers.get("Organizationid"))
  );
  return NextResponse.json({
    statusCode: response.statusCode,
    data: response,
  });
}

export const POST = apiExceptionGuard(POSTHandler);
