/**
 * Webhook — 1st-of-month upload-pending reminder (US-7).
 *
 * Must be triggered by the external CRON service at 09:00 IST on the 1st of
 * every month.  Example cron expression (UTC): 30 3 1 * *
 *
 * Security: Bearer token checked against CRON_SECRET env var.
 * The CRON provider must send:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Returns 202 Accepted immediately; email dispatch runs in the background.
 * No user session is required — this is a system-initiated action.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendUploadPendingReminders } from "@/modules/ghg/lib/monthly-activity-summary/email/monthly-activity-summary-email.service";
import { getServerEnv } from "@/modules/ghg/utils/env/env.server";
import { logger } from "@/modules/ghg/utils/logger";

async function validateCronSecret(req: NextRequest): Promise<boolean> {
  const env = await getServerEnv();
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return token === env.CRON_SECRET;
}

export async function POST(req: NextRequest) {
  const isAuthorized = await validateCronSecret(req);
  if (!isAuthorized) {
    logger.warn("upload-pending-first: unauthorized CRON request");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  logger.info("upload-pending-first: CRON webhook accepted, processing in background");

  sendUploadPendingReminders("1st").catch((err) => {
    logger.error("upload-pending-first: background job failed", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
  });

  return NextResponse.json({ success: true, accepted: true }, { status: 202 });
}
