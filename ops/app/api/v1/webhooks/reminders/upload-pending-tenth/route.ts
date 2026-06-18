/**
 * Webhook — 10th-of-month upload-pending reminder (US-8).
 *
 * Must be triggered by the external CRON service at 09:00 IST on the 10th of
 * every month.  Example cron expression (UTC): 30 3 10 * *
 *
 * This job is independent of the 1st-of-month job — both check the same
 * previous-month window but run as separate scheduler entries.
 *
 * Security: Bearer token checked against CRON_SECRET env var.
 * The CRON provider must send:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Returns 202 Accepted immediately; email dispatch runs in the background.
 */

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendUploadPendingReminders } from "~/lib/monthly-activity-summary/email/monthly-activity-summary-email.service";
import { getServerEnv } from "~/utils/env/env.server";
import { logger } from "~/utils/logger";

async function validateCronSecret(req: NextRequest): Promise<boolean> {
  const env = await getServerEnv();
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const expected = env.CRON_SECRET;
  if (!expected || token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  const isAuthorized = await validateCronSecret(req);
  if (!isAuthorized) {
    logger.warn("upload-pending-tenth: unauthorized CRON request");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  logger.info("upload-pending-tenth: CRON webhook accepted, processing in background");

  sendUploadPendingReminders("10th").catch((err) => {
    logger.error("upload-pending-tenth: background job failed", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
  });

  return NextResponse.json({ success: true, accepted: true }, { status: 202 });
}
