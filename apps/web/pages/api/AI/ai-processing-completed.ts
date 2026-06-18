import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { aiProcessingCompleted } from "@warp/server/services/AI/ai-processing-completed";
import crypto from "crypto";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const AI_SERVICE_TOKEN = process.env.AI_SERVICES_AUTHORIZATION ?? "";

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ data: null, error: "Method Not Allowed" });
  }

  const incomingToken = String(req.headers["x-ai-services-authorization"] ?? "");

  // Use constant-time comparison to prevent timing attacks
  if (!AI_SERVICE_TOKEN || !incomingToken) {
    return res.status(401).json({ data: null, error: "Unauthorized" });
  }

  try {
    const incomingDigest = new Uint8Array(crypto.createHash('sha256').update(incomingToken).digest());
    const expectedDigest = new Uint8Array(crypto.createHash('sha256').update(AI_SERVICE_TOKEN).digest());

    if (!crypto.timingSafeEqual(incomingDigest, expectedDigest)) {
      return res.status(401).json({ data: null, error: "Unauthorized" });
    }
  } catch (error) {
    // Fallback to 401 on any comparison error
    return res.status(401).json({ data: null, error: "Unauthorized" });
  }

  const processingIds: string[] = req.body?.processingIds;

  // Validate processingIds is a non-empty array of strings
  if (!Array.isArray(processingIds) ||
    processingIds.length === 0 ||
    !processingIds.every(p => typeof p === 'string' && p.trim().length > 0)) {
    return res
      .status(400)
      .json({ data: null, error: "processingIds must be a non-empty array of strings" });
  }

  const { data, error } = await aiProcessingCompleted(processingIds);

  if (data !== null) {
    return res.status(200).json({ data, error: null });
  }

  return res.status(400).json({ data: null, error: error || "Processing failed" });
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1,
  maxRequestCount: 60,
  progressiveDelay: false,
});
