import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { emailWhenTheActionsTakenOnTheRecommendationsAreApproved } from "@warp/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const response: any =
    await emailWhenTheActionsTakenOnTheRecommendationsAreApproved(
      req.body.id,
      req.body.questionId,
      req.body.type,
      req.body.companyId,
      req.body.formId,
      req.body.dateAndTime,
      req.body.platformId
    );
  if (!!response && response.includes("OK")) {
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
