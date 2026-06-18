import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { getCachedAIDataStatistics } from "@warp/server/services/AI/AI-dataStats-calculation";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const formId = req.body?.formId ?? "";
  const invitationId = req.body?.invitationId ?? "";
  const responseData = await getCachedAIDataStatistics(formId, invitationId);
  if (!!responseData) {
    res.status(200).send({ data: responseData, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to get AI statistics" });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1,
  maxRequestCount: 60,
  progressiveDelay: false,
});

export const dynamic = "force-dynamic";
