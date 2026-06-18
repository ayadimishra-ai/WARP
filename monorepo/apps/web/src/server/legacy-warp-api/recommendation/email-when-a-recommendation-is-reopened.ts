import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { EmailWhenRecommendationReopened } from "@/modules/warp/packages/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const response: any = await EmailWhenRecommendationReopened(
    req.body.id,
    req.body.questionId,
    req.body.type,
    req.body.companyId,
    req.body.formId,
    req.body.recommendation,
    req.body.comments,
    req.body.dateandtime,
    req.body.platformId
  );
  if (response?.indexOf("OK") !== -1) {
    res.status(200).send({ data: response, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true,
});

export const dynamic = "force-dynamic";
