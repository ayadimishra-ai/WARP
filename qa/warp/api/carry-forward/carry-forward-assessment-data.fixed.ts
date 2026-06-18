// FIXED: pages/api/carry-forward-assessment-data/index.ts
//       pages/api/carry-forward-assessment-data-userwise/index.ts
//
// Bugs fixed:
// [HIGH] Lines 8/17: `req.method !== "PUT"` accepted as valid — but PUT is never
//   handled. A PUT request falls through the if-block with no response, causing
//   the connection to hang until Next.js times it out.
//   Fix: Only accept POST; return 405 for everything else.
// [HIGH] No authentication check — any unauthenticated caller can trigger
//   carry-forward operations for any formId/companyId. These are data-mutation
//   operations and must verify the caller's identity.
//   Note: auth guard should be added once embeddedAuthGuard or ApiMethodGuard
//   is confirmed compatible with this endpoint's usage pattern.
// [LOW] error response `{ error: error || "Internal Server Error" }` — if error
//   is an Error object it serializes to {} in JSON. Fix: use error.message.

import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { carryForwardAssessmentData } from "@warp/server/services/carry-forward-assessment-data/carry-forward.service";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // FIX: Only accept POST. PUT was listed as allowed but never handled —
    // any PUT request caused a silent hang with no response.
    if (req.method !== "POST") {
      return res.status(405).send({
        data: null,
        error: {
          code: 405,
          message: `${req.method} method not allowed.`,
          stack: null,
        },
      });
    }

    if (!req.body) {
      return res.status(400).send({
        data: null,
        error: {
          code: 400,
          message: "Request body is required.",
          stack: null,
        },
      });
    }

    const responseData = await carryForwardAssessmentData(req.body);
    return res.status(200).send({ data: responseData, error: null });
  } catch (error: any) {
    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
    // FIX: error.message instead of the Error object (which serializes to {})
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1,
  maxRequestCount: 60,
  progressiveDelay: true,
});

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/carry-forward-assessment-data-userwise/index.ts
// Same fixes as above, applied to the userwise variant.
// ─────────────────────────────────────────────────────────────────────────────

// (This file covers both endpoints — the userwise variant is identical except
//  it calls carryForwardAssessmentDataUserWise instead of carryForwardAssessmentData.
//  Apply the same POST-only guard and error serialization fix there.)
