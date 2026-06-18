import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { NextApiRequest, NextApiResponse } from "next";

const updateInvitationDataPoints = async (
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

  try {
    const { status, invitationId, invitationStatus } = JSON.parse(req.body);
    if (req.method === "POST") {
      const formInvitationIdData = await sdk.updateSkipStatusByInvitationId({
        formInvitationId: invitationId,
        status: status,
        invitationStatus: invitationStatus,
      });
      return res.status(200).send({
        data: formInvitationIdData?.update_FormInvitation?.returning,
      });
    }
  } catch (error: any) {
    return res.status(500).send({
      error: error,
    });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(
  updateInvitationDataPoints,
  {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: false,
  }
);

export const dynamic = "force-dynamic";
