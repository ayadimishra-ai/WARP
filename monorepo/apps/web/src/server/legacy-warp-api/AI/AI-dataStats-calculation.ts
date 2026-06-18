import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { getCachedAIDataStatistics } from "@/modules/warp/packages/server/services/AI/AI-dataStats-calculation";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const parsedBody: any = req.body ?? {};

  const formId: string = parsedBody.formId ?? "";
  const invitationId: string = parsedBody.invitationId ?? "";
  const isAIUser: string = parsedBody.isAIUser ?? "";

  if (!formId || !invitationId) {
    return res.status(400).json({
      data: null,
      error: "Missing required fields: formId and invitationId"
    });
  }
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
