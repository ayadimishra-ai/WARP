import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { NextApiRequest, NextApiResponse } from "next";

const getInvitationDataPoints = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { invitationId } = req.body ?? {};
    if (req.method === "POST") {
      const formInvitationIdData = await sdk.getinvitationSkipStatus({
        formInvitationId: invitationId,
      });
      return res.status(200).send({
        data: {
          status:
            !!formInvitationIdData?.FormInvitation &&
            formInvitationIdData?.FormInvitation.length > 0
              ? formInvitationIdData?.FormInvitation[0]?.status
              : "",
        },
      });
    }
  } catch (error: any) {
    return res.status(500).send({
      error: error,
    });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(
  getInvitationDataPoints,
  {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: false,
  }
);

export const dynamic = "force-dynamic";
