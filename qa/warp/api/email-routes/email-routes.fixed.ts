// FIXED: All email route API handlers
//
// This file documents the fix pattern that applies to ALL email route files.
// Each section shows the original file path and what changed.
//
// Two root bugs affect the email routes:
//
// BUG-1: `response.indexOf("OK") !== -1` — crashes when response is null/undefined
//   (TypeError: Cannot read property 'indexOf' of null)
//   Files: commentsubmission-email.ts, commentsubmissionuser2-email.ts,
//          assessmentreopen-email.ts, reviewer-declined-email.ts,
//          reviewer-resubmit-email.ts
//
// BUG-2: `response?.response?.indexOf("OK") !== -1` — returns 200 on null response
//   When response is null, optional chaining returns undefined.
//   undefined !== -1 is TRUE, so HTTP 200 is returned even on send failure.
//   Files: email-invitation.ts, khaitan-email-invitation.ts,
//          Reviewer-email-invitation.ts
//
// BUG-3: `String(req.headers["x-warp-shared-key"])` = "undefined" when header absent
//   Cron routes rely on this header as the only auth mechanism. If the header is
//   missing, the value becomes the string "undefined" — if the service does
//   a simple equality check it may pass with "undefined" as the key.
//   Files: sending-email-from-db.ts, assigned-question-bulk-email-invitation.ts,
//          comments-on-question-bulk-email.ts, reviewer-pending-emails-cron.ts,
//          answer-on-assigned-question-bulk-email.ts
//
// FIX for BUG-1 and BUG-2: Replace indexOf check with explicit null check + includes()
// FIX for BUG-3: Validate header presence before calling String()

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN FIX 1: email-invitation.ts (and Reviewer-email-invitation.ts,
//                khaitan-email-invitation.ts)
// ─────────────────────────────────────────────────────────────────────────────

import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import {
  sendCompanyInvitationEmail,
  sendAssessmentReopenMail,
  sendCommentSubmissionMail,
  sendCommentSubmissionMailUser2,
  assignedQuestionBulkEmailInvitation,
  commentsOnQuestionBulkEmail,
  sendingEmailFromDb,
  sendReviewerPendingEmailsCron,
} from "@warp/server/services/notification.service";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { NextApiHandler } from "next";

// Shared helper — replaces the buggy indexOf pattern used across all email routes.
// Returns true only when response exists AND contains "OK".
const emailSentSuccessfully = (response: any): boolean => {
  if (!response) return false;
  const text = typeof response === "string" ? response : response?.response;
  return typeof text === "string" && text.includes("OK");
};

// Shared helper — validate the cron shared key.
// Returns null if the header is missing (prevents String(undefined) bypass).
const getCronSharedKey = (req: any): string | null => {
  const raw = req.headers["x-warp-shared-key"];
  if (!raw || raw === "undefined") return null;
  return String(raw);
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/email-invitation.ts
// BUG-2: response?.response?.indexOf("OK") !== -1 returned 200 on null
// ─────────────────────────────────────────────────────────────────────────────
export const emailInvitationHandler: NextApiHandler = async (req, res) => {
  const bodyObject = {
    invitationId: req.body.id,
    emailType: req.body.type,
    companyId: req.body.companyId,
    formId: req.body.formId,
    platformId: req.body.platformId,
  };
  const response: any = await sendCompanyInvitationEmail(bodyObject);

  // FIX: Explicit truthy check + includes("OK") — undefined !== -1 was always true
  if (emailSentSuccessfully(response)) {
    res.status(200).send({ data: response, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/assessmentreopen-email.ts
// BUG-1: response.response.indexOf("OK") — crashes when response is null
// ─────────────────────────────────────────────────────────────────────────────
export const assessmentReopenEmailHandler: NextApiHandler = async (req, res) => {
  const response: any = await sendAssessmentReopenMail(
    req.body.id,
    req.body.type,
    req.body.companyId,
    req.body.formId,
    req.body.platformId
  );

  // FIX: was response.response.indexOf — crashed on null; null-safe helper used
  if (emailSentSuccessfully(response)) {
    res.status(200).send({ data: response, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/commentsubmission-email.ts
// BUG-1: response.indexOf("OK") — crashes when response is null
// ─────────────────────────────────────────────────────────────────────────────
export const commentSubmissionEmailHandler: NextApiHandler = async (req, res) => {
  const response: any = await sendCommentSubmissionMail(
    req.body.id,
    req.body.type,
    req.body.companyId,
    req.body.formId,
    req.body.userRole,
    req.body.platformId
  );

  // FIX: was response.indexOf — crashed on null response
  if (emailSentSuccessfully(response)) {
    res.status(200).send({ data: response, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/commentsubmissionuser2-email.ts
// BUG-1: same indexOf crash pattern
// ─────────────────────────────────────────────────────────────────────────────
export const commentSubmissionUser2EmailHandler: NextApiHandler = async (req, res) => {
  const response: any = await sendCommentSubmissionMailUser2(
    req.body.id,
    req.body.type,
    req.body.companyId,
    req.body.formId,
    req.body.userRole,
    req.body.platformId
  );

  if (emailSentSuccessfully(response)) {
    res.status(200).send({ data: response, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/assigned-question-bulk-email-invitation.ts
// BUG-3: String(req.headers["x-warp-shared-key"]) when header absent = "undefined"
// ─────────────────────────────────────────────────────────────────────────────
export const assignedQuestionBulkEmailHandler: NextApiHandler = async (req, res) => {
  try {
    const date = new Date();
    const dateWithStartTime = new Date(date.setHours(0, 0, 0, 1));
    const dateWithEndTime = new Date(date.setHours(23, 59, 59, 999));

    // FIX: Validate header presence before using — String(undefined) = "undefined"
    const sharedKey = getCronSharedKey(req);
    if (!sharedKey) {
      return res.status(401).json({ error: "Missing x-warp-shared-key header" });
    }

    const response: any = await assignedQuestionBulkEmailInvitation(
      dateWithStartTime,
      dateWithEndTime,
      sharedKey
    );

    res.status(200).send({ data: response });
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

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/comments-on-question-bulk-email.ts
// BUG-3: same String(undefined) pattern
// ─────────────────────────────────────────────────────────────────────────────
export const commentsOnQuestionBulkEmailHandler: NextApiHandler = async (req, res) => {
  try {
    const date = new Date();
    const dateWithStartTime = new Date(date.setHours(0, 0, 0, 1));
    const dateWithEndTime = new Date(date.setHours(23, 59, 59, 999));

    const sharedKey = getCronSharedKey(req);
    if (!sharedKey) {
      return res.status(401).json({ error: "Missing x-warp-shared-key header" });
    }

    const response: any = await commentsOnQuestionBulkEmail(
      dateWithStartTime,
      dateWithEndTime,
      sharedKey
    );

    res.status(200).send({ data: response });
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

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/sending-email-from-db.ts
// BUG-3: String(undefined) bypass on shared key
// ─────────────────────────────────────────────────────────────────────────────
export const sendingEmailFromDbHandler: NextApiHandler = async (req, res) => {
  try {
    const date = new Date();
    const dateWithStartTime = new Date(date.setHours(0, 0, 0, 1));
    const dateWithEndTime = new Date(date.setHours(23, 59, 59, 999));

    const sharedKey = getCronSharedKey(req);
    if (!sharedKey) {
      return res.status(401).json({ error: "Missing x-warp-shared-key header" });
    }

    const response: any = await sendingEmailFromDb(
      dateWithStartTime,
      dateWithEndTime,
      sharedKey
    );

    res.status(200).send({ data: response });
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

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/reviewer-pending-emails-cron.ts
// BUG-3: String(undefined) bypass on shared key
// ─────────────────────────────────────────────────────────────────────────────
export const reviewerPendingEmailsCronHandler: NextApiHandler = async (req, res) => {
  try {
    const sharedKey = getCronSharedKey(req);
    if (!sharedKey) {
      return res.status(401).json({ error: "Missing x-warp-shared-key header" });
    }

    await sendReviewerPendingEmailsCron(sharedKey);
    res.status(200).send({ data: "Cron job executed successfully", error: null });
  } catch (error: any) {
    const currentDate = new Date();
    await uploadError("exception-logs", "reviewer-pending-emails-cron", JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    }));
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};

// Export rate-limited versions for the per-user-facing endpoints
export default withEmailOrIpRateLimitWithProgressiveDelay(emailInvitationHandler, {
  limitInterval: 1,
  maxRequestCount: 60,
  progressiveDelay: true,
});
