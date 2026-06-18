import { sdk } from "@warp/graphql/generated/server";
import {
  inputFieldsinFormFields,
  SourcesType,
} from "@warp/shared/constants/app.constants";
import { aiLogger } from "@warp/shared/utils/logger.util";

/**
 * Gets cached AI data statistics from FormInvitation metadata
 * If no cached data exists, calculates and caches new statistics
 */
export const getCachedAIDataStatistics = async (
  formId: string,
  invitationId: string
) => {
  try {
    const currentInvitation = await sdk.getFormInvitationDetailsbyId({
      invitationId: invitationId,
      sourceType: "Uploaded",
    });

    const cachedData =
      currentInvitation.FormInvitation[0]?.metadata?.dataStatsSummary;

    if (cachedData) {
      return cachedData;
    }

    return await calculateAndCacheAIDataStatistics(formId, invitationId);
  } catch (error) {
    throw error;
  }
};

/**
 * Calculates and caches AI data statistics after document processing completion
 * This function is called after sendAICurationCompletionEmail() to pre-calculate
 * and store statistics that were previously calculated on every intro page visit
 */
export const calculateAndCacheAIDataStatistics = async (
  formId: string,
  invitationId: string
) => {
  aiLogger.info("Calculating AI data statistics", {
    formId,
    invitationId,
  });
  const allAIStatsData = await sdk
    .getAIDataStatsByFormIdAndInviationId({
      formId: formId,
      invitationId: invitationId,
      inputFields: inputFieldsinFormFields,
    })
    .catch((error) => {
      aiLogger.error(
        "GraphQL getAIDataStatsByFormIdAndInviationId query failed",
        {
          formId,
          invitationId,
          error: error.message,
          stack: error.stack,
        }
      );
      return { FormField: [] };
    });

  const formFieldsCount = allAIStatsData?.FormField?.length || 0;

  if (formFieldsCount === 0) {
    aiLogger.warn("No form fields returned from GraphQL query", {
      formId,
      invitationId,
    });
  }

  let totalInputsRequired = 0;
  let dataCapturedUsingAI = 0;
  let dataInputsWithMultipleValues = 0;
  let pendingDataPoints = 0;
  let mandatoryFieldsCount = 0;
  let optionalFieldsCount = 0;
  let timeSavedUnit = "hrs";
  const uniqueIds = new Set();
  let processedFieldsCount = 0;
  let aiEnabledFieldsCount = 0;
  let fieldsWithSuggestionsCount = 0;

  allAIStatsData?.FormField?.forEach((field, index) => {
    processedFieldsCount++;

    if (field?.Form?.isAIDataPointsAdded) {
      aiEnabledFieldsCount++;

      if (field.dataPoint) {
        totalInputsRequired++;

        if (field.Suggestions.length === 0) {
          pendingDataPoints++;

          if (field.fieldOptions?.required) {
            mandatoryFieldsCount++;
          } else {
            optionalFieldsCount++;
          }
        } else {
          fieldsWithSuggestionsCount++;
        }
      }

      if (
        field.Suggestions.some(
          (suggestion) => suggestion.suggestion.value !== null
        )
      ) {
        uniqueIds.add(field.id);
      }
      dataCapturedUsingAI = uniqueIds.size;

      if (field.Suggestions.length > 1) {
        const uploadedSuggestionsCount = field.Suggestions.filter(
          (suggestion) =>
            suggestion.SuggestionSourceMappings.some(
              (mapping) =>
                mapping.Source.type === SourcesType?.Uploaded?.dbTittle
            )
        );

        if (uploadedSuggestionsCount?.length > 1) {
          dataInputsWithMultipleValues++;
        }
      }
    } else {
      totalInputsRequired++;
    }
  });

  aiLogger.info("Field processing completed", {
    processedFields: processedFieldsCount,
    aiEnabledFields: aiEnabledFieldsCount,
    fieldsWithSuggestions: fieldsWithSuggestionsCount,
    totalInputsRequired,
    dataCapturedUsingAI,
    pendingDataPoints,
    mandatoryFieldsCount,
    optionalFieldsCount,
  });
  //#region time saved
  const timeSavedMinutes = dataCapturedUsingAI * 2; // 2=Time required for each question, in minutes
  let totalTimeSaved = 0;

  if (timeSavedMinutes > 60) {
    const hours = Math.floor(timeSavedMinutes / 60);
    const minutes = timeSavedMinutes % 60;
    totalTimeSaved = minutes >= 30 ? hours + 0.3 : hours;
    timeSavedUnit = "+ hrs";
  } else {
    timeSavedUnit = " min";
    if (timeSavedMinutes > 0 && timeSavedMinutes <= 15) {
      totalTimeSaved = 15;
    } else if (timeSavedMinutes > 15 && timeSavedMinutes <= 30) {
      totalTimeSaved = 30;
    } else if (timeSavedMinutes > 30 && timeSavedMinutes <= 60) {
      totalTimeSaved = 30;
      timeSavedUnit = "+ min";
    }
  }
  //#endregion

  // Prepare the result to be saved in metadata
  const dataStatsSummary = {
    totalInputsRequired,
    dataCapturedUsingAI,
    dataInputsWithMultipleValues,
    totalTimeSaved,
    pendingDataPoints,
    mandatoryFieldsCount,
    optionalFieldsCount,
    timeSavedMinutes,
    timeSavedUnit,
    calculatedAt: new Date().toISOString(),
  };

  try {
    // Use _append to merge dataStatsSummary into existing metadata at DB level.
    // This avoids a fetch-then-set race condition that could overwrite other
    // metadata keys (e.g. AIData) if the prior fetch returns null or fails.
    await sdk.appendFormInvitationMetadata({
      invitationId: invitationId,
      metadata: { dataStatsSummary },
    });
    aiLogger.success("AI statistics cached successfully", {
      formId,
      invitationId,
    });
  } catch (error) {
    aiLogger.error("Failed to save the metadata to DB:", {
      formId,
      invitationId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
  // Return the result for any immediate use cases
  return dataStatsSummary;
};

/**
 * Fire-and-forget function to calculate and cache AI statistics
 * Used for background processing after email completion
 */
export const triggerAIStatisticsCalculation = async (
  invitationsData: Array<{ invitationId: string; formId: string }>
): Promise<void> => {
  aiLogger.info("Starting background AI statistics calculation", {
    invitationsCount: invitationsData.length,
  });
  // Process each invitation asynchronously
  const promises = invitationsData.map(async ({ invitationId, formId }) => {
    try {
      // Calculate and cache the statistics
      await calculateAndCacheAIDataStatistics(formId, invitationId);
    } catch (error) {
      aiLogger.error(`Error processing invitation ${invitationId}:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Continue processing other invitations even if one fails
    }
  });

  // Wait for all calculations to complete
  await Promise.allSettled(promises);
};
