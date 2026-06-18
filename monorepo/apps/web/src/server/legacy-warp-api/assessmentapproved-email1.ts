import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sendAssessmentApprovedMail } from "@/modules/warp/packages/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const response: any = await sendAssessmentApprovedMail(
    req.body.id,
    req.body.type,
    req.body.companyId,
    req.body.formId,
    req.body.platformId
  );
  //if (response?.indexOf("OK") !== -1) {
  if (!!response) {
    res?.status(200).send({ data: response, error: null });
  } else {
    res?.status(400).send({ data: null, error: "Failed to send email" });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true,
});

export const dynamic = "force-dynamic";
