import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sendCompanyInvitationEmail } from "@warp/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const bodyObject = {
    invitationId: req.body.id,
    emailType: req.body.type,
    companyId: req.body.companyId,
    formId: req.body.formId,
    platformId: req.body.platformId,
  };
  const response: any = await sendCompanyInvitationEmail(bodyObject);

  // Check if response.response contains "OK"
  if (!!response?.response && response.response.includes("OK")) {
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
