import { sdk } from "@warp/graphql/generated/server";
import { AiBulkDocumentProcessing_Updates } from "@warp/graphql/generated/types";
import {
  AICurationCompleteEmail,
  AIEmailTemplates,
  AIProcessingTypes,
  bulkFileCurationStatus,
  FormInvitationStatus,
  inputFieldsinFormFields,
  OPSToIQCurationStatus,
  WebDataCurationStatus,
} from "@warp/shared/constants/app.constants";
import { aiLogger } from "@warp/shared/utils/logger.util";
import { uploadError } from "../aws-s3.service";
import { sendAICurationCompletionEmail } from "../notification.service";
import { triggerAIStatisticsCalculation } from "./AI-dataStats-calculation";
import { calculateCompletionPercentage } from "./calculate-completion-percentage";
import { suggestionCleanup } from "./suggestion-cleanup";

export const documentProcessingCompleted = async (
  bulkProcessingId: string[]
) => {
  const start = Date.now();

  let sendEmailResponse: any = [];
  try {
    const bulkProcessingUpdates: AiBulkDocumentProcessing_Updates[] = [];

    // Query all three processing types to find which table contains the provided IDs
    const processingData = await sdk.getProcessingDataByIdAllTypes({
      Id: bulkProcessingId,
      inputFields: inputFieldsinFormFields,
    });

    // Merge results from all three tables - normalize the structure
    const allProcessingRecords = [
      ...(processingData?.AIBulkDocumentProcessing?.map((item) => ({
        ...item,
        status: item.requestStatus, // Normalize status field
        processingType: AIProcessingTypes.AIBulkDocumentProcessing,
      })) || []),
      ...(processingData?.WebCuration?.map((item) => ({
        ...item,
        requestStatus: item.status, // Provide requestStatus for compatibility
        processingType: AIProcessingTypes.WebCuration,
      })) || []),
      ...(processingData?.OPSToIQCuration?.map((item) => ({
        ...item,
        requestStatus: item.status, // Provide requestStatus for compatibility
        processingType: AIProcessingTypes.OPSToIQCuration,
      })) || []),
    ];

    let allSourceIdArray: string[] = [];
    aiLogger.info("documentProcessingCompleted started", {
      bulkProcessingId,
      totalRecords: allProcessingRecords.length,
      byType: {
        AIBulkDocumentProcessing: processingData?.AIBulkDocumentProcessing?.length || 0,
        WebCuration: processingData?.WebCuration?.length || 0,
        OPSToIQCuration: processingData?.OPSToIQCuration?.length || 0,
      },
    });

    const invitationData = allProcessingRecords?.map((items) => {
      // processedDocuments only exists for AIBulkDocumentProcessing
      const processedDocsArray =
        items.processingType === AIProcessingTypes.AIBulkDocumentProcessing && Array.isArray(items?.processedDocuments)
          ? items.processedDocuments
          : [];

      // Only collect source IDs for document processing type
      if (processedDocsArray.length > 0) {
        allSourceIdArray = [
          ...allSourceIdArray,
          ...processedDocsArray.map(
            (documentItems: Record<string, string>) => documentItems?.sourceId
          ),
        ];
      }

      return {
        id: items?.id,
        invitationId: items?.formInvitationId,
        processingType: items.processingType,
        allSourceIds: processedDocsArray.map(
          (documentItems: Record<string, string>) => documentItems?.sourceId
        ),
        answerRecord:
          !!items?.FormInvitation?.FormSubmissions.filter(
            (dataItems) => dataItems?.Answers?.length > 0
          ) &&
            items?.FormInvitation?.FormSubmissions.filter(
              (dataItems) => dataItems?.Answers?.length > 0
            ).length > 0
            ? items?.FormInvitation?.FormSubmissions.filter(
              (dataItems) => dataItems?.Answers?.length > 0
            )[0]?.Answers
            : [],
        invitationFormDetails: items?.FormInvitation?.Form,
      };
    }
    );

    // Fetch source data only if there are document processing records
    const sourceProcessingData = allSourceIdArray.length > 0
      ? await sdk.getSourceDataById({ sourceId: allSourceIdArray })
      : { Sources: [] };

    const emailDetails: AICurationCompleteEmail[] = [];
    const webCurationUpdates: any[] = [];
    const opsCurationUpdates: any[] = [];

    invitationData.forEach((items) => {
      // Decide form type and email type
      const formType = items?.invitationFormDetails?.formtype;
      const emailType =
        formType === "Assessment"
          ? AIEmailTemplates.AIProcessingCompletedAssessment
          : AIEmailTemplates.AIProcessingCompletedReporting;

      emailDetails.push({
        emailType: [emailType],
        invitationId: items?.invitationId,
      });

      // Handle different processing types
      if (items.processingType === AIProcessingTypes.AIBulkDocumentProcessing) {
        // Original document processing logic
        const allSourceIdStatus = sourceProcessingData?.Sources.filter(
          (sourceItems) =>
            items?.allSourceIds.find(
              (documentItems: string) => documentItems == sourceItems?.id
            )
        );

        const processedDocumentsArray = allSourceIdStatus?.map((sourceItems) => {
          return {
            sourceId: sourceItems?.id,
            status: sourceItems?.SourceFile?.status,
          };
        });

        bulkProcessingUpdates.push({
          where: {
            id: {
              _eq: items?.id,
            },
          },
          _set: {
            processedDocuments: processedDocumentsArray,
            emailSendAt: new Date(),
            updated_at: new Date(),
            requestStatus: bulkFileCurationStatus.Completed,
          },
        });
      } else if (items.processingType === AIProcessingTypes.WebCuration) {
        // Update WebCuration status to Completed
        webCurationUpdates.push({
          where: {
            id: {
              _eq: items?.id,
            },
          },
          _set: {
            status: WebDataCurationStatus.Completed,
            updated_at: new Date(),
          },
        });
      } else if (items.processingType === AIProcessingTypes.OPSToIQCuration) {
        // Update OPSToIQCuration status to Completed
        opsCurationUpdates.push({
          where: {
            id: {
              _eq: items?.id,
            },
          },
          _set: {
            status: OPSToIQCurationStatus.Completed,
            updated_at: new Date(),
          },
        });
      }
    });

    // Check WebCuration records for these invitations and filter who should get emails:
    let webCurationMap = new Map<string, any>();
    let opsCurationMap = new Map<string, any>();
    let aiBulkMap = new Map<string, any>();
    // Track which invitations have a WebCuration or OPSToIQCuration row in the DB
    const invitationsWithWebCuration = new Set<string>();
    const invitationsWithOpsCuration = new Set<string>();
    let curationStatusFetchFailed = false;

    try {
      const invitationIds = invitationData
        ?.map((i) => i.invitationId)
        .filter(Boolean);
      const webCurationResp =
        (await sdk.getWebCurationProcessAndAIBulkDocumentProcessing?.({
          invitationIds,
        })) ?? {};
      const webCurationRows = webCurationResp?.WebCuration ?? [];
      const opsCurationRows = webCurationResp?.OPSToIQCuration ?? [];
      const aiBulkRows = (webCurationResp as any)?.AIBulkDocumentProcessing ?? [];

      webCurationRows.forEach((w: any) => {
        const invId = String(w?.formInvitationId);
        webCurationMap.set(invId, w);
        invitationsWithWebCuration.add(invId);
      });
      opsCurationRows.forEach((o: any) => {
        const invId = String(o?.formInvitationId);
        opsCurationMap.set(invId, o);
        invitationsWithOpsCuration.add(invId);
      });

      aiBulkRows.forEach((b: any) =>
        aiBulkMap.set(String(b?.formInvitationId), b)
      );
    } catch (err) {
      // Do NOT clear the maps — leave them as populated (empty on first failure).
      // Setting this flag prevents us from treating missing rows as "completed".
      curationStatusFetchFailed = true;
      console.warn("Failed to fetch WebCuration/OPSToIQCuration rows:", err);
      webCurationMap = new Map();
      opsCurationMap = new Map();
      aiBulkMap = new Map();
    }

    // Only send emails / update processing rows for invitations that have ALL curation types completed:
    // - WebCuration: row does not exist (never triggered) OR status === 'Completed'
    // - OPSToIQCuration: row does not exist (never triggered) OR status === 'Completed'
    // If the status fetch failed we cannot determine completion safely, so we skip all emails.
    // This ensures we wait for ALL enabled AI processing types to complete before sending email
    const emailDetailsToSend: AICurationCompleteEmail[] = [];
    const invitationsToMarkInvited: string[] = [];

    invitationData.forEach((items, idx) => {
      const invId = String(items?.invitationId);

      // If the curation status lookup failed we cannot safely determine whether all
      // curation types have completed — skip this invitation to avoid premature emails.
      if (curationStatusFetchFailed) {
        aiLogger.info("Skipping email - curation status fetch failed, cannot verify completion", {
          invitationId: invId,
        });
        return;
      }

      // A missing WebCuration row means WebCuration was never triggered for this invitation.
      // Only gate on its status when a row actually exists (i.e. it was triggered).
      const webCuration = webCurationMap.get(invId);
      const isWebCompleted = !invitationsWithWebCuration.has(invId) ||
        String(webCuration?.status)?.toLowerCase() === WebDataCurationStatus.Completed.toLowerCase();

      // Same logic for OPSToIQCuration.
      const opsCuration = opsCurationMap.get(invId);
      const isOpsCompleted = !invitationsWithOpsCuration.has(invId) ||
        String(opsCuration?.status)?.toLowerCase() === OPSToIQCurationStatus.Completed.toLowerCase();

      // Only send email if ALL triggered curation types are completed
      const shouldSend = isWebCompleted && isOpsCompleted;

      if (shouldSend) {
        // Non-AI OPS-only: only OPSToIQCuration is configured (no WebCuration, no AIBulkDocumentProcessing)
        // Use the dedicated DataCaptureCompleted template instead of the AI completion template
        const isOpsOnlyNonAI =
          items.processingType === AIProcessingTypes.OPSToIQCuration &&
          !webCurationMap.get(invId) &&
          !aiBulkMap.get(invId);

        const emailEntry = isOpsOnlyNonAI
          ? { ...emailDetails[idx], emailType: [AIEmailTemplates.DataCaptureCompletedReporting] }
          : emailDetails[idx];

        emailDetailsToSend.push(emailEntry);
        invitationsToMarkInvited.push(invId);
      } else {
        aiLogger.info("Skipping email - waiting for other curation types", {
          invitationId: invId,
          webStatus: webCuration?.status || 'not-triggered',
          opsStatus: opsCuration?.status || 'not-triggered',
          isWebCompleted,
          isOpsCompleted,
        });
      }
    });

    // Update FormInvitation status to 'Invited' for invitations that will receive emails
    if (invitationsToMarkInvited.length > 0) {
      const formInvitationUpdates = invitationsToMarkInvited?.map(
        (invitationId) => ({
          where: {
            id: {
              _eq: invitationId,
            },
          },
          _set: {
            status: FormInvitationStatus.Invited,
          },
        })
      );
      //  Update formInvitation status for only those invitations status are completed in WebCuration
      await sdk.updateFormInvitationStatusBulkbyId({
        formInvitationUpdateData: formInvitationUpdates,
        webCurationUpdateData: [],
        aiBulkDocumentProcessingUpdateData: [],
        opsCurationUpdateData: [],
      });
    }
    // Update the processing rows to 'Completed' status (all three types)
    await sdk.updateFormInvitationStatusBulkbyId({
      formInvitationUpdateData: [],
      webCurationUpdateData: webCurationUpdates,
      aiBulkDocumentProcessingUpdateData: bulkProcessingUpdates,
      opsCurationUpdateData: opsCurationUpdates,
    });

    await calculateCompletionPercentage(
      invitationData?.map((items) => items.invitationId),
      true
    );

    //#region Email Sending
    aiLogger.info("documentProcessingCompleted processed", {
      bulkProcessingId,
      totalInvitations: invitationData.length,
      invitationsEmailed: invitationsToMarkInvited.length,
      durationMs: Date.now() - start,
      emailDetailsToSendCount: emailDetailsToSend.length,
    });
    if (emailDetailsToSend.length > 0) {

      // Call suggestion cleanup
      try {
        const invitationIdsForCleanup = invitationData
          ?.map((item) => item.invitationId)
          .filter(Boolean);

        if (invitationIdsForCleanup.length > 0) {
          const cleanupResult = await suggestionCleanup(invitationIdsForCleanup);
          aiLogger.info("Suggestion cleanup completed after document processing email", {
            invitationIds: invitationIdsForCleanup,
            cleanupResult: {
              updateSuggestionCount: cleanupResult.updateSuggestion?.length || 0,
              insertAnswerCount: cleanupResult.insertAnswer?.length || 0,
            },
          });
        }
      } catch (error) {
        aiLogger.error("Suggestion cleanup failed after document processing email:", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        // Don't throw - this shouldn't affect the main flow
      }

      /**
       * Calculate and cache AI data statistics before sending emails
       * Problem: 
            Document processing completes but FormInvitation.metadata.dataStatsSummary is empty. 
            Email calls getAIProcesingStats() → getCachedAIDataStatistics() → gets 0s due to      incompletedata state
        *Solution: 
            Explicitly call calculateAndCacheAIDataStatistics() to populate metadata.dataStatsSummary
            Email template now reads from properly populated cache instead of calculating 0s
       */
      const { calculateAndCacheAIDataStatistics } = await import("./AI-dataStats-calculation");

      for (const item of invitationData) {
        if (invitationsToMarkInvited.includes(String(item.invitationId))) {
          try {
            await calculateAndCacheAIDataStatistics(
              String(item.invitationFormDetails?.id),
              String(item.invitationId)
            );
          } catch (error) {
            aiLogger.error("Failed to calculate AI stats for invitation", {
              invitationId: item.invitationId,
              formId: item.invitationFormDetails?.id,
              error: error instanceof Error ? error.message : String(error),
            });
            // Continue with other invitations even if one fails
          }
        }
      }

      // Then send completion emails
      const response = await sendAICurationCompletionEmail(emailDetailsToSend);
      sendEmailResponse = response;

      // Trigger background AI statistics calculation after successful email completion
      try {
        const invitationsForStats = invitationData
          ?.filter((item) => invitationsToMarkInvited.includes(item.invitationId))
          ?.map((item) => ({
            invitationId: item.invitationId,
            formId: item.invitationFormDetails?.id || "",
          }))
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
    } else {
      // nothing to send
      sendEmailResponse = [];
    }
    //#endregion
  } catch (error: any) {
    const durationMs = Date.now() - start;
    aiLogger.error("documentProcessingCompleted FATAL ERROR", {
      bulkProcessingId,
      message: error?.message,
      stack: error?.stack,
      durationMs,
    });
    const errorContent = JSON.stringify({
      datetime: new Date().toISOString(),
      bulkProcessingId,
      message: error?.message,
      stack: error?.stack,
      durationMs,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
    return { data: null, error: error?.message || "Unknown error" };
  }
  return { data: sendEmailResponse, error: null };
};
