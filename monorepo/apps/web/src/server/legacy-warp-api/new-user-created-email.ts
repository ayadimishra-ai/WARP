import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { newUserCreatedEmailInvitation } from "@/modules/warp/packages/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const response: any = await newUserCreatedEmailInvitation(
    req.body.id,
    req.body.type,
    req.body.companyId,
    req.body.formId,
    req.body.userName,
    req.body.userEmail,
    req.body.userId,
    req.body.platformId
  );
  if (response.response.indexOf("OK") !== -1) {
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
