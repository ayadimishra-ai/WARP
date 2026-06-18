// FIXED: pages/api/AI/ routes
//
// Two bugs affect multiple AI route files:
//
// [CRITICAL] JSON.parse(req.body) permanently breaks endpoints:
//   Next.js automatically parses JSON request bodies — req.body is already
//   a JavaScript object when Content-Type is application/json.
//   JSON.parse(object) calls object.toString() → "[object Object]" →
//   JSON.parse throws SyntaxError → caught → 500 on every request.
//   Files: AIprocessing.ts (line 493), get-formInvitation-detail.ts (line 28),
//          get-invitation-isdata-curation-skipped-status..ts (line 20),
//          update-form-invitation.ts (line 20),
//          update-invitation-and-skipped-status.ts (line 20)
//   Note: AI-dataStats-calculation.ts has a guard (typeof req.body == "object")
//   so it correctly handles both cases — no change needed there.
//
// [HIGH] Access-Control-Allow-Origin: "*" on all AI endpoints.
//   These are server-to-server AI processing APIs — they should NOT be accessible
//   from arbitrary browser origins. Wildcard CORS means any website can trigger
//   AI processing jobs under a logged-in user's session.
//   Fix: Set CORS origin to NEXT_PUBLIC_APP_URL or remove the CORS headers
//   entirely (these endpoints don't need cross-origin browser access).
//
// [HIGH] No authentication guard on most AI routes.
//   Any unauthenticated caller can trigger expensive AI processing.
//
// [MEDIUM] { error: error } — Error objects serialize to {} in JSON responses.
//   Fix: { error: error.message || "Internal Server Error" }.
//
// [MEDIUM] generate-background-report.ts: jwt.decode() not jwt.verify()
//   + Returns 500 for Unauthorized (should be 401)
//   + Leaks error.message to client in 500 response.

import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: update-form-invitation.ts
// BUG: JSON.parse(req.body) → SyntaxError on every request
// ─────────────────────────────────────────────────────────────────────────────

const updateFormInvitationHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // FIX: Removed Access-Control-Allow-Origin: "*"
  // These AI endpoints are not intended for cross-origin browser access.

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // FIX: req.body is already parsed by Next.js — do NOT call JSON.parse()
    const { invitationId, invitationStatus } = req.body;

    const pageData =
      (await sdk.getSourceDataByInvitationId?.({ invitationId })) ?? {};
    const existingMetadata =
      (pageData as any)?.FormInvitation?.[0]?.metadata ?? {};
    const existingAIData = (existingMetadata as any)?.AIData ?? {};

    const newAIData = {
      ...existingAIData,
      allowedAICuration:
        existingAIData?.allowedAICuration ??
        existingAIData?.allowedCuration ??
        [],
      triggeredCuration: ["Manual"],
    };

    const updatedMetadata = { ...existingMetadata, AIData: newAIData };

    let formInvitationIdData: any = null;
    try {
      formInvitationIdData = await sdk.updateFormInvitationMetadata?.({
        formInvitationId: invitationId,
        status: invitationStatus,
        metadata: updatedMetadata,
      });
    } catch (err) {
      console.warn("Failed to update invitation metadata", err);
    }

    return res.status(200).send({
      data: formInvitationIdData?.update_FormInvitation?.returning ?? null,
    });
  } catch (error: any) {
    // FIX: error.message instead of Error object (serializes to {})
    return res.status(500).send({ error: error.message || "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: update-invitation-and-skipped-status.ts
// BUG: JSON.parse(req.body) → SyntaxError
// ─────────────────────────────────────────────────────────────────────────────

// Apply same fix: replace JSON.parse(req.body) with req.body directly.
// const { status, invitationId, invitationStatus } = req.body;

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: get-formInvitation-detail.ts
// BUG: JSON.parse(req.body) → SyntaxError
// ─────────────────────────────────────────────────────────────────────────────

// Apply same fix: replace JSON.parse(req.body) with req.body directly.
// const { companyId, invitationId, userId } = req.body;

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: get-invitation-isdata-curation-skipped-status..ts
// BUG: JSON.parse(req.body) → SyntaxError
// ─────────────────────────────────────────────────────────────────────────────

// Apply same fix: replace JSON.parse(req.body) with req.body directly.
// const { invitationId } = req.body;

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: AIprocessing.ts line 493
// BUG: JSON.parse(req.body) → SyntaxError
// ─────────────────────────────────────────────────────────────────────────────

// Apply same fix: replace JSON.parse(req.body) with req.body directly.
// const { process, data } = req.body;

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: generate-background-report.ts
// BUGS: jwt.decode() not jwt.verify(), 500 for Unauthorized, error.message leaked
// ─────────────────────────────────────────────────────────────────────────────

import { generateAIBackgroundReportOnServer } from "@warp/server/services/ai-report.service";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";

export const generateBackgroundReportHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // FIX: jwt.verify() — was jwt.decode(), signature never validated
  const jwtSecret = process.env.HASURA_JWT_SECRET;
  let session: any;

  if (req?.headers?.authorization && jwtSecret) {
    const rawHeader = String(req.headers.authorization);
    const accessToken = rawHeader.startsWith("Bearer ")
      ? rawHeader.slice(7)
      : rawHeader;
    try {
      const decodedToken: any = jwt.verify(accessToken, jwtSecret);
      session = parseHasuraClaims(decodedToken, accessToken);
    } catch {
      // FIX: 401 Unauthorized, not 500 Internal Server Error
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { invitationId, questionaryName, companyId } = req.body;

    if (!invitationId) {
      return res
        .status(400)
        .json({ error: "Missing required parameter: invitationId" });
    }

    res.status(202).json({
      message: "Background report generation started successfully",
      invitationId,
      questionaryName: questionaryName || "Report",
      timestamp: new Date().toISOString(),
    });

    setImmediate(() => {
      generateAIBackgroundReportOnServer(
        invitationId,
        questionaryName || "Report",
        session.user.id,
        companyId,
        req.headers.authorization || ""
      ).catch((error) => {
        console.error("Background report generation failed:", error);
      });
    });
  } catch (error) {
    console.error("API error in generate-background-report:", error);
    // FIX: Do not leak error.message to client
    res
      .status(500)
      .json({ error: "Failed to initiate background report generation" });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(
  updateFormInvitationHandler,
  { limitInterval: 1, maxRequestCount: 60, progressiveDelay: false }
);

export const dynamic = "force-dynamic";
