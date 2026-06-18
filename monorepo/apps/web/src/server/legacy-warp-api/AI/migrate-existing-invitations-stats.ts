import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { calculateAndCacheAIDataStatistics } from "@/modules/warp/packages/server/services/AI/AI-dataStats-calculation";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * Developer-only API endpoint for migrating existing invitations
 * Calculates and caches AI statistics for invitations that don't have cached data
 * This is a synchronous operation intended for data migration purposes only
 */
const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { invitationIds } = req.body;

    if (!invitationIds || !Array.isArray(invitationIds)) {
      return res.status(400).json({
        error: "invitationIds array is required",
      });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const invitationId of invitationIds) {
      try {
        // Fetch formId from FormInvitation table
        const invitationDetails = await sdk.getFormInvitationDetailsbyId({
          invitationId: invitationId,
          sourceType: "Uploaded",
        });

        const formId = invitationDetails.FormInvitation[0]?.formId;

        if (!formId) {
          results.push({
            invitationId,
            status: "error",
            error: "FormId not found for invitation",
          });
          errorCount++;
          continue;
        }

        const result = await calculateAndCacheAIDataStatistics(
          formId,
          invitationId
        );

        results.push({
          invitationId,
          formId,
          status: "success",
          data: result,
        });
        successCount++;
      } catch (error: any) {
        results.push({
          invitationId,
          status: "error",
          error: error.message,
        });
        errorCount++;
      }
    }

    return res.status(200).json({
      message: "Migration completed",
      summary: {
        total: invitationIds.length,
        successful: successCount,
        failed: errorCount,
      },
      results,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

export default handler;
