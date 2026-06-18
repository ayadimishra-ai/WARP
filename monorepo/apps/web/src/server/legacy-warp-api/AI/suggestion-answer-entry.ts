import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { suggestionAnswerEntry } from "@/modules/warp/packages/server/services/AI/suggesstion-answer-entry";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle OPTIONS preflight requests
  const { submissionId, invitationId } = req.body;
  const responseData = await suggestionAnswerEntry(invitationId, submissionId);
  if (!!responseData) {
    res.status(200).send({ data: responseData, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: false,
});

export const dynamic = "force-dynamic";
