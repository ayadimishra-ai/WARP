import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { NextApiRequest, NextApiResponse } from "next";

const updateInvitationDataPoints = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { status, invitationId, invitationStatus } = req.body ?? {};
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
