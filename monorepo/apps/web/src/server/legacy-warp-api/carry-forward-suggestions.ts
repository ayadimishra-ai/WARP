import { processCarryForwardSuggestions } from "@/modules/warp/packages/server/services/carry-forward-suggestions.service";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Background API for carry-forward-as-suggestions processing
 * Only processes for Non-AI users on second-time invitations
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let session;
  if (!!req?.headers?.authorization) {
    const accessToken = String(req.headers.authorization);
    const decodedToken: any = jwt.decode(accessToken);
    session = parseHasuraClaims(decodedToken, accessToken);
  }
  if (!session) {
    return res.status(500).json({
      error: {
        message: "Unauthorized",
      },
    });
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

    // Validate required parameters
    if (!currentInvitationId || !formId || !companyId) {
      return res.status(400).json({
        error:
          "Missing required parameters: currentInvitationId, formId, companyId",
      });
    }

    // Return immediately to client with 202 (Accepted)
    res.status(202).json({
      message:
        "Background carry-forward-as-suggestions processing started successfully",
      currentInvitationId,
      formId,
      questionaryName: questionaryName || "Report",
      timestamp: new Date().toISOString(),
    });

    // Process in background after response is sent
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
        // Error is handled within the service and logged to database
      });
    });
  } catch (error) {
    console.error("API error in carry-forward-suggestions:", error);
    res.status(500).json({
      error:
        "Failed to initiate background carry-forward-suggestions processing",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
