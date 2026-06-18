import { AICurationCompleteEmail } from "@warp/shared/constants/app.constants";
import { aiLogger } from "@warp/shared/utils/logger.util";
import { sendAICurationCompletionEmail } from "../../notification.service";
import {
  calculateAndCacheAIDataStatistics,
  triggerAIStatisticsCalculation,
} from "../AI-dataStats-calculation";
import { suggestionCleanup } from "../suggestion-cleanup";

export interface EmailEligibleInvitation {
  invitationId: string;
  formId?: string;  // Optional because it can be missing at runtime
  emailType: string[];
}

/**
 * Runs all post-processing steps for invitations that passed the completion gate.
 *
 * Execution order is strict:
 *   1. Suggestion cleanup   — normalize suggestion values; must precede stats caching
 *   2. Cache AI statistics  — populate metadata.dataStatsSummary; must precede email
 *   3. Send completion email
 *   4. Background stats     — fire-and-forget recalculation; does not block the response
 *
 * Steps 1-4 apply only to email-eligible (gated) invitations.
 * Suggestion cleanup receives all invitation IDs in the batch — the same behavior
 * as the previous document-processing-completed service.
 *
 * Failures in cleanup and stats caching are logged but do not interrupt email delivery.
 */
export const runPostPipeline = async (
  emailEligibleInvitations: EmailEligibleInvitation[],
  allBatchInvitationIds: string[]
): Promise<any[]> => {
  if (emailEligibleInvitations.length === 0) return [];

  // ── 1. Suggestion cleanup ────────────────────────────────────────────────────
  // Runs for all invitations in the batch, not only the gated subset.
  try {
    await suggestionCleanup(allBatchInvitationIds);
    aiLogger.info("Suggestion cleanup completed", {
      invitationCount: allBatchInvitationIds.length,
    });
  } catch (error) {
    aiLogger.error("Suggestion cleanup failed — continuing to email", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  // ── 2. Cache AI statistics ───────────────────────────────────────────────────
  // Must complete before email: the email template reads directly from
  // FormInvitation.metadata.dataStatsSummary populated here.
  for (const invitation of emailEligibleInvitations) {
    // Skip if formId is missing
    if (!invitation.formId) {
      aiLogger.warn("Skipping stats caching for invitation with missing formId", {
        invitationId: invitation.invitationId,
      });
      continue;
    }

    try {
      await calculateAndCacheAIDataStatistics(invitation.formId, invitation.invitationId);
    } catch (error) {
      aiLogger.error("Failed to cache AI statistics — email may show zeroes", {
        invitationId: invitation.invitationId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // ── 3. Send completion emails ────────────────────────────────────────────────
  const emailPayload: AICurationCompleteEmail[] = emailEligibleInvitations.map((inv) => ({
    invitationId: inv.invitationId,
    emailType: inv.emailType,
  }));

  const emailResponse = await sendAICurationCompletionEmail(emailPayload);

  // ── 4. Background statistics recalculation (fire-and-forget) ────────────────
  try {
    // Filter out invitations with missing formId and assert non-null
    const statsPayload = emailEligibleInvitations
      .filter((inv) => inv.formId)
      .map((inv) => ({ invitationId: inv.invitationId, formId: inv.formId! }));

    if (statsPayload.length > 0) {
      triggerAIStatisticsCalculation(statsPayload).catch((error) => {
        aiLogger.error("Background statistics recalculation failed", {
          error: error instanceof Error ? error.message : String(error),
          invitationsCount: statsPayload.length,
        });
      });
      aiLogger.info("Background statistics recalculation initiated", {
        invitationsCount: statsPayload.length,
      });
    }
  } catch (error) {
    aiLogger.error("Failed to initiate background statistics recalculation", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return emailResponse;
};
