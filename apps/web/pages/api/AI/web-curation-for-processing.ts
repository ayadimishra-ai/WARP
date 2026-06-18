import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { webCurationForProcessing } from "@warp/server/services/AI/web-curation-for-processing";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const responseData = await webCurationForProcessing(req.body?.[0]?.invitationId);
  if (!!responseData) {
    res.status(200).send({ data: responseData, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to process web curation" });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: false,
});

export const dynamic = "force-dynamic";
