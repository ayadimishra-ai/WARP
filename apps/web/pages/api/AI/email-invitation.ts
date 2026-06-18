import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sendCompanyAIInvitationEmail } from "@warp/server/services/notification.service";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") { return res.status(405).json({ data: null, error: "Method Not Allowed" }); }
  const responseData = await sendCompanyAIInvitationEmail(req.body);
  if (!!responseData) {
    res.status(200).send({ data: responseData, error: null });
  } else {
    res.status(400).send({ data: null, error: "Failed to send email" });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1,
  maxRequestCount: 60,
  progressiveDelay: false,
});

export const dynamic = "force-dynamic";
