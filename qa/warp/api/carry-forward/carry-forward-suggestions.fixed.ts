// FIXED: pages/api/carry-forward-suggestions.ts
//
// Bugs fixed:
// [CRITICAL] Line 21: jwt.decode() → jwt.verify() — token signature was never
//   verified, allowing any crafted JWT with valid Hasura claims structure to be
//   accepted as authenticated.
// [HIGH] Line 20: authorization header not stripped of "Bearer " prefix — jwt.decode/
//   verify expect the raw token, not "Bearer <token>". If the client sends the header
//   with "Bearer " prefix the token decode silently returns null and session is null.
// [MEDIUM] Line 25: Returns 500 for "Unauthorized" — HTTP 401 is the correct status.
// [MEDIUM] Line 84: Error details leaked to client via `details: error.message`.
//   This could expose internal service paths, query strings, or DB schema in errors.

import { processCarryForwardSuggestions } from "@warp/server/services/carry-forward-suggestions.service";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let session;
  if (req?.headers?.authorization) {
    // FIX: Strip "Bearer " prefix before passing to jwt.verify.
    const rawHeader = String(req.headers.authorization);
    const accessToken = rawHeader.startsWith("Bearer ")
      ? rawHeader.slice(7)
      : rawHeader;

    try {
      // FIX: jwt.verify() verifies the signature using the shared secret.
      // Previously jwt.decode() was used — it never validates the signature,
      // so any attacker-crafted JWT with arbitrary Hasura claims was accepted.
      const jwtSecret = process.env.HASURA_JWT_SECRET;
      if (!jwtSecret) {
        console.error("HASURA_JWT_SECRET not configured");
        return res.status(500).json({ error: "Server configuration error" });
      }
      const decodedToken: any = jwt.verify(accessToken, jwtSecret);
      session = parseHasuraClaims(decodedToken, accessToken);
    } catch {
      // Invalid or expired token — return 401
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  if (!session) {
    // FIX: 401 Unauthorized, not 500 Internal Server Error.
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const {
      currentInvitationId,
      formId,
      companyId,
      questionaryName,
      pdfUrl,
      pdfFileName,
    } = req.body;

    if (!currentInvitationId || !formId || !companyId) {
      return res.status(400).json({
        error:
          "Missing required parameters: currentInvitationId, formId, companyId",
      });
    }

    // Return immediately to client with 202 (Accepted) — background processing continues
    res.status(202).json({
      message:
        "Background carry-forward-as-suggestions processing started successfully",
      currentInvitationId,
      formId,
      questionaryName: questionaryName || "Report",
      timestamp: new Date().toISOString(),
    });

    setImmediate(() => {
      processCarryForwardSuggestions(
        currentInvitationId,
        formId,
        companyId,
        req.headers.authorization || "",
        questionaryName,
        pdfUrl,
        pdfFileName
      ).catch((error) => {
        console.error(
          "Background carry-forward-suggestions processing failed:",
          error
        );
      });
    });
  } catch (error) {
    console.error("API error in carry-forward-suggestions:", error);
    // FIX: Do not leak error.message to client — log server-side only.
    res.status(500).json({
      error: "Failed to initiate background carry-forward-suggestions processing",
    });
  }
}
