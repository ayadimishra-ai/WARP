import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { NextApiRequest, NextApiResponse } from "next";

const updateFormInvitation = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { invitationId, invitationStatus } = req.body ?? {};
    if (req.method === "POST") {
      // fetch existing metadata (SDK types may not include metadata — cast to any)
      const pageData =
        (await sdk.getSourceDataByInvitationId?.({
          invitationId,
        })) ?? {};
      const existingMetadata =
        (pageData as any)?.FormInvitation?.[0]?.metadata ?? {};
      const existingAIData = (existingMetadata as any)?.AIData ?? {};

      // preserve allowedAICuration, set triggeredCuration to ["Manual"]
      const newAIData = {
        ...existingAIData,
        allowedAICuration:
          existingAIData?.allowedAICuration ??
          existingAIData?.allowedCuration ??
          [],
        triggeredCuration: ["Manual"],
      };

      const updatedMetadata = {
        ...existingMetadata,
        AIData: newAIData,
      };

      // persist metadata update (do not alter other columns)
      let formInvitationIdData: any = null;
      try {
        formInvitationIdData = await sdk.updateFormInvitationMetadata?.({
          formInvitationId: invitationId,
          status: invitationStatus,
          metadata: updatedMetadata,
        });
      } catch (err) {
        console.warn("Failed to update invitation metadata", err);
      }

      return res.status(200).send({
        data: formInvitationIdData?.update_FormInvitation?.returning ?? null,
      });
    }
  } catch (error: any) {
    return res.status(500).send({
      error: error,
    });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(
  updateFormInvitation,
  {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: false,
  }
);

export const dynamic = "force-dynamic";
