import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { khaitanInvitationEmail } from "@/modules/warp/packages/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  try {
    const response: any = await khaitanInvitationEmail(
      req.body.id,
      req.body.type,
      req.body.companyId,
      req.body.formId,
      req.body.NewUser,
      req.body.platformId
    );

    if (response && response.response && response.response.indexOf("OK") !== -1) {
      res.status(200).send({ data: response, error: null });
    } else {
      res.status(400).send({ data: null, error: "Failed to send email" });
    }
  } catch (error) {
    console.error("Error in khaitan-email-invitation handler:", error);
    res.status(500).send({ data: null, error: "Internal server error" });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1, // in minutes
  maxRequestCount: 200,
  progressiveDelay: true,
});

export const dynamic = "force-dynamic";
