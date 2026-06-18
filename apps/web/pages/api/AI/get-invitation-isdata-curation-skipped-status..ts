import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import { NextApiRequest, NextApiResponse } from "next";

const getInvitationDataPoints = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { invitationId } = req.body;
    {
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
      error: error.message || "Internal Server Error",
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
