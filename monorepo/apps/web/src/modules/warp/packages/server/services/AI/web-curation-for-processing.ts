import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import {
  FormInvitation_Updates,
  WebCuration_Updates,
} from "@/modules/warp/packages/graphql/generated/types";
import {
  AIEmailTemplates,
  FormInvitationStatus,
  WebDataCurationStatus,
} from "@/modules/warp/packages/shared/constants/app.constants";
import { aiLogger } from "@/modules/warp/packages/shared/utils/logger.util";
import { uploadError } from "../aws-s3.service";
import { sendAICurationCompletionEmail } from "../notification.service";
import { triggerAIStatisticsCalculation } from "./AI-dataStats-calculation";
import { suggestionCleanup } from "./suggestion-cleanup";
export const webCurationForProcessing = async (invitationId: string[]) => {
  let sendEmailResponse = [];
  try {
    // First, fetch AIBulkDocumentProcessing rows to check their status
    let aiBulkMap = new Map<string, any>();
    try {
      const resp =
        (await sdk.getWebCurationProcessAndAIBulkDocumentProcessing?.({
          invitationIds: invitationId,
        })) ?? {};
      const aiRows = resp?.AIBulkDocumentProcessing ?? [];
      aiRows.forEach((r: any) => aiBulkMap.set(String(r?.formInvitationId), r));
    } catch (err) {
      console.warn("Failed to fetch AIBulkDocumentProcessing rows:", err);
      aiBulkMap = new Map();
    }

    // Filter invitationIds to only include those where AIBulkDocumentProcessing is completed or doesn't exist
    const eligibleInvitationIds = invitationId.filter((id) => {
      const aiRecord = aiBulkMap.get(id);
      if (!aiRecord) return true; // No AI record, proceed with update
      const aiStatus = String(
        aiRecord?.requestStatus ?? aiRecord?.status ?? ""
      ).toLowerCase();
      return aiStatus === "completed"; // Only proceed if AI processing is completed
    });

    if (eligibleInvitationIds.length === 0) {
      console.log("No eligible invitations to update");
      // return [];
    }

    const formInvitationRowData: FormInvitation_Updates[] =
      eligibleInvitationIds.map((dataItems) => {
        return {
          where: {
            id: {
              _eq: dataItems,
            },
          },
          _set: {
            status: FormInvitationStatus.Invited,
          },
        };
      });
    const webCurationRowData: WebCuration_Updates[] = invitationId.map(
      (dataItems) => {
        return {
          where: {
            formInvitationId: {
              _eq: dataItems,
            },
            status: {
              _eq: WebDataCurationStatus.Processing,
            },
          },
          _set: {
            status: WebDataCurationStatus.Completed,
          },
        };
      }
    );
    console.log("webCurationRowData::", webCurationRowData);

    // Update FormInvitation status & WebCuration status
    const updatedData = await sdk.updateFormInvitationStatusBulkbyId({
      formInvitationUpdateData: formInvitationRowData,
      webCurationUpdateData: webCurationRowData,
      aiBulkDocumentProcessingUpdateData: [],
      opsCurationUpdateData: [],
    });

    if (
      !!updatedData?.update_FormInvitation_many &&
      updatedData?.update_FormInvitation_many?.length > 0
    ) {
      // prepare email payload for sendAICurationCompletionEmail
      const emailDetails =
        updatedData?.update_FormInvitation_many
          ?.map((items) => {
            const fid = String(items?.returning[0]?.id);
            const aiRecord = aiBulkMap.get(fid);
            const aiStatus = String(
              aiRecord?.requestStatus ?? aiRecord?.status ?? ""
            ).toLowerCase();
            const shouldSend = !aiRecord || aiStatus === "completed";
            if (!shouldSend) return null;

            // Get form type to determine email template
            const formType =
              items?.returning[0]?.Form?.formtype || "Assessment";

            // Create emailType array and push email templates
            const emailTypeArray: string[] = [];
            if (formType === "Assessment") {
              emailTypeArray.push(
                AIEmailTemplates.AIProcessingCompletedAssessment
              );
            } else {
              emailTypeArray.push(
                AIEmailTemplates.AIProcessingCompletedReporting
              );
            }

            return {
              emailType: emailTypeArray,
              // FileDetails: [], // Empty for web curation completion
              invitationId: fid,
            };
          })
          .filter(Boolean)
          .filter((item): item is NonNullable<typeof item> => item !== null) ||
        [];

      if (!!emailDetails && emailDetails?.length > 0) {

        // Call suggestion cleanup after successful email sending
        try {
          const invitationIdsForCleanup = emailDetails
            .map((detail) => detail.invitationId)
            .filter(Boolean);

          if (invitationIdsForCleanup.length > 0) {
            const cleanupResult = await suggestionCleanup(invitationIdsForCleanup);
            aiLogger.info("Suggestion cleanup completed after web curation email", {
              invitationIds: invitationIdsForCleanup,
              cleanupResult: {
                updateSuggestionCount: cleanupResult.updateSuggestion?.length || 0,
                insertAnswerCount: cleanupResult.insertAnswer?.length || 0,
              },
            });
          }
        } catch (error) {
          aiLogger.error("Suggestion cleanup failed after web curation email:", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          // Don't throw - this shouldn't affect the main flow
        }

        /*
         * Calculate and cache AI data statistics before sending emails
         * 
         * Problem: Web curation completes but FormInvitation.metadata.dataStatsSummary is empty
         *          Email calls getAIProcesingStats() → getCachedAIDataStatistics() → gets 0s due to incomplete data state
         *          Test route works because it reads from FormInvitations that already have cached stats
         * 
         * Solution: Explicitly call calculateAndCacheAIDataStatistics() to populate metadata.dataStatsSummary
         *          Email template now reads from properly populated cache instead of calculating 0s
         */
        const { calculateAndCacheAIDataStatistics } = await import("./AI-dataStats-calculation");

        for (const emailDetail of emailDetails) {
          try {
            // Get form ID from the updated data
            const formInvitation = updatedData?.update_FormInvitation_many
              ?.find(item => item?.returning[0]?.id === emailDetail.invitationId);
            const formId = formInvitation?.returning[0]?.Form?.id;

            if (formId) {
              await calculateAndCacheAIDataStatistics(
                String(formId),
                String(emailDetail.invitationId)
              );
            }
          } catch (error) {
            aiLogger.error("Failed to calculate AI stats for web curation invitation", {
              invitationId: emailDetail.invitationId,
              error: error instanceof Error ? error.message : String(error),
            });
            // Continue with other invitations even if one fails
          }
        }

        sendEmailResponse = await sendAICurationCompletionEmail(emailDetails);

        // Trigger background AI statistics calculation after successful email completion
        try {
          const invitationsForStats = emailDetails
            ?.map((detail) => {
              const formId = updatedData?.update_FormInvitation_many
                ?.find((item) => String(item?.returning?.[0]?.id) === detail.invitationId)
                ?.returning?.[0]?.formId;
              return {
                invitationId: detail.invitationId,
                formId: formId || "",
              };
            })
            .filter((item) => item.formId) || [];

          if (invitationsForStats.length > 0) {
            // Fire and forget - don't await to avoid blocking the response
            triggerAIStatisticsCalculation(invitationsForStats).catch((error) => {
              aiLogger.error("Background AI statistics calculation failed:", {
                error: error instanceof Error ? error.message : String(error),
                invitationsForStats,
              });
            });
            aiLogger.info("Background AI statistics calculation initiated", {
              invitationsCount: invitationsForStats.length,
            });
          }
        } catch (error) {
          aiLogger.error("Failed to initiate background AI statistics calculation:", {
            error: error instanceof Error ? error.message : String(error),
          });
          // Don't throw - this shouldn't affect the main flow
        }
      }
    }
  } catch (error: any) {
    const errorContent = JSON.stringify({
      datetime: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
  }
  return sendEmailResponse;
};
