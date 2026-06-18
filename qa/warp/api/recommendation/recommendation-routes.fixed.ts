// FIXED: pages/api/recommendation/ routes (all 5 files)
//
// Two bugs across all recommendation email handlers:
//
// BUG-1 (HIGH): `response?.indexOf("OK") !== -1` returned 200 on null response.
//   Same optional-chaining pitfall as other email routes — undefined !== -1 is true.
//   Files: email-on-manually-raising-the-recommendations.ts,
//          email-when-a-recommendation-is-reopened.ts,
//          email-when-the-actions-taken-on-the-recommendations-are-approved.ts
//
// BUG-2 (HIGH): `String(req.headers["x-warp-shared-key"])` = "undefined" when absent.
//   Cron reminder endpoints rely on this as their sole auth mechanism.
//   Missing header produces the literal string "undefined", bypassing the check.
//   Also: `response.indexOf("OK")` (no optional chaining) crashes on null.
//   Files: recommendation-reminder-pre-duedate.ts,
//          recommendation-reminder-post-duedate.ts
//
// BUG-3 (LOW): error serialized as `{ error: error }` — Error objects serialize
//   to {} in JSON. Fixed to `{ error: error.message }`.

import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import {
  emailOnManuallyRaisingTheRecommendations,
  emailWhenTheActionsTakenOnTheRecommendationsAreApproved,
  EmailWhenRecommendationReopened,
  sendRecommenationReminderPreDueDate,
  sendRecommenationReminderPostDueDate,
} from "@warp/server/services/notification.service";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { NextApiHandler } from "next";

// Shared helper for the indexOf("OK") pattern — null-safe.
const emailSentSuccessfully = (response: any): boolean => {
  if (!response) return false;
  const text = typeof response === "string" ? response : response?.response;
  return typeof text === "string" && text.includes("OK");
};

// Shared helper — validate cron shared key header.
const getCronSharedKey = (req: any): string | null => {
  const raw = req.headers["x-warp-shared-key"];
  if (!raw || raw === "undefined") return null;
  return String(raw);
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: email-on-manually-raising-the-recommendations.ts
// BUG-1: response?.indexOf("OK") !== -1 returned 200 on null
// ─────────────────────────────────────────────────────────────────────────────
export const emailOnManuallyRaisingHandler: NextApiHandler = async (req, res) => {
  const response: any = await emailOnManuallyRaisingTheRecommendations(
    req.body.id,
    req.body.questionId,
    req.body.type,
    req.body.companyId,
    req.body.formId,
    req.body.recommendation,
    req.body.dueDate,
    req.body.platformId
  );
  if (emailSentSuccessfully(response)) {
    res.status(200).send({ data: response, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: email-when-a-recommendation-is-reopened.ts
// BUG-1: same optional-chaining indexOf false positive
// ─────────────────────────────────────────────────────────────────────────────
export const emailWhenRecommendationReopenedHandler: NextApiHandler = async (req, res) => {
  const response: any = await EmailWhenRecommendationReopened(
    req.body.id,
    req.body.questionId,
    req.body.type,
    req.body.companyId,
    req.body.formId,
    req.body.recommendation,
    req.body.comments,
    req.body.dateandtime,
    req.body.platformId
  );
  if (emailSentSuccessfully(response)) {
    res.status(200).send({ data: response, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: email-when-the-actions-taken-on-the-recommendations-are-approved.ts
// BUG-1: same optional-chaining indexOf false positive
// ─────────────────────────────────────────────────────────────────────────────
export const emailWhenActionsApprovedHandler: NextApiHandler = async (req, res) => {
  const response: any =
    await emailWhenTheActionsTakenOnTheRecommendationsAreApproved(
      req.body.id,
      req.body.questionId,
      req.body.type,
      req.body.companyId,
      req.body.formId,
      req.body.dateAndTime,
      req.body.platformId
    );
  if (emailSentSuccessfully(response)) {
    res.status(200).send({ data: response, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: recommendation-reminder-pre-duedate.ts
// BUG-2: String(undefined) bypass + response.indexOf crash on null
// ─────────────────────────────────────────────────────────────────────────────
export const recommendationReminderPreDuedateHandler: NextApiHandler = async (req, res) => {
  try {
    // FIX: Reject missing/undefined header before calling String()
    const sharedKey = getCronSharedKey(req);
    if (!sharedKey) {
      return res.status(401).json({ error: "Missing x-warp-shared-key header" });
    }

    const response: any = await sendRecommenationReminderPreDueDate(sharedKey);
    if (response === undefined) {
      res.status(200).send({ data: null, error: "Sending email" });
    } else if (emailSentSuccessfully(response)) {
      // FIX: was response.indexOf("OK") — crashed when response was null/object
      res.status(200).send({ data: response, error: null });
    } else {
      res.status(400).send({ data: null, error: "Failed to send email" });
    }
  } catch (error: any) {
    const currentDate = new Date();
    await uploadError("exception-logs", "exception-logs", JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    }));
    // FIX: error.message instead of Error object (serializes to {})
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: recommendation-reminder-post-duedate.ts
// BUG-2: String(undefined) bypass + response.indexOf crash on null
// ─────────────────────────────────────────────────────────────────────────────
export const recommendationReminderPostDuedateHandler: NextApiHandler = async (req, res) => {
  try {
    const sharedKey = getCronSharedKey(req);
    if (!sharedKey) {
      return res.status(401).json({ error: "Missing x-warp-shared-key header" });
    }

    const response: any = await sendRecommenationReminderPostDueDate(
      req.body.type,
      sharedKey
    );

    if (response === undefined) {
      res.status(200).send({ data: null, error: "Sending email" });
    } else if (emailSentSuccessfully(response)) {
      res.status(200).send({ data: response, error: null });
    } else {
      res.status(400).send({ data: null, error: "Failed to send email" });
    }
  } catch (error: any) {
    const currentDate = new Date();
    await uploadError("exception-logs", "exception-logs", JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    }));
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Rate-limited exports (for per-user-facing endpoints)
export default withEmailOrIpRateLimitWithProgressiveDelay(
  emailOnManuallyRaisingHandler,
  { limitInterval: 1, maxRequestCount: 60, progressiveDelay: true }
);
