import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { getCachedAIDataStatistics } from "@warp/server/services/AI/AI-dataStats-calculation";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle OPTIONS preflight requests
  let formId = "";
  let invitationId = "";
  let isAIUser = "";
  if (typeof req.body == "object") {
    formId = req.body.formId;
    invitationId = req.body.invitationId;
    isAIUser = req.body.isAIUser;
  } else {
    formId = JSON.parse(req.body).formId;
    invitationId = JSON.parse(req.body).invitationId;
    isAIUser = JSON.parse(req.body).isAIUser;
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
