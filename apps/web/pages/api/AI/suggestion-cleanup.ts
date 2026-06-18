import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { suggestionCleanup } from "@warp/server/services/AI/suggestion-cleanup";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const responseData = await suggestionCleanup(req.body.invitationId);
  if (!!responseData) {
    res.status(200).send({ data: responseData, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to perform suggestion cleanup" });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: false,
});

export const dynamic = "force-dynamic";
