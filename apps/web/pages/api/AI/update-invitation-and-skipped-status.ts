import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import { NextApiRequest, NextApiResponse } from "next";

const updateInvitationDataPoints = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { status, invitationId, invitationStatus } = req.body;
    {
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
      error: error.message || "Internal Server Error",
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
