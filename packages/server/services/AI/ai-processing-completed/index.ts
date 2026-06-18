import { sdk } from "@warp/graphql/generated/server";
import { FormInvitation_Updates } from "@warp/graphql/generated/types";
import {
  AIEmailTemplates,
  AIProcessingTypes,
  bulkFileCurationStatus,
  FormInvitationStatus,
  inputFieldsinFormFields,
  OPSToIQCurationStatus,
  WebDataCurationStatus,
} from "@warp/shared/constants/app.constants";
import { aiLogger } from "@warp/shared/utils/logger.util";
import { uploadError } from "../../aws-s3.service";
import { calculateCompletionPercentage } from "../calculate-completion-percentage";
import { EmailEligibleInvitation, runPostPipeline } from "./post-pipeline";
import { buildCurationUpdates, collectSourceIds, NormalizedRecord } from "./processors";

// ── triggeredCuration string values ──────────────────────────────────────────
// These are the exact strings written by update-invitation-web-curation-ai-bulk-processing.ts.
// "DocumentCuration" maps to the AIBulkDocumentProcessing table (NOT "AIBulkDocumentProcessing").
const TRIGGERED = {
  Document: "DocumentCuration",
  Web: "WebCuration",
  OPS: "OPSToIQCuration",
  Manual: "Manual",
} as const;

export const aiProcessingCompleted = async (
  processingIds: string[]
): Promise<{ data: any; error: string | null }> => {
  const start = Date.now();

  aiLogger.info("aiProcessingCompleted started", {
    processingIds,
    timestamp: new Date().toISOString(),
  });

  try {
    // ── 1. FETCH ───────────────────────────────────────────────────────────────
    // Query all three curation tables at once. The caller provides IDs that may
    // belong to any combination of the three tables.
    const processingData = await sdk.getProcessingDataByIdAllTypes({
      Id: processingIds,
      inputFields: inputFieldsinFormFields,
    });

    // Normalize all three result sets into a single consistent shape.
    // triggeredCuration is read from FormInvitation.metadata.AIData.triggeredCuration
    // (written by the orchestrator before AI tasks are dispatched).
    // metadata is not in the generated TypeScript types so it is accessed via any cast —
    // consistent with the pattern used throughout the codebase.
    const records: NormalizedRecord[] = [
      ...(processingData?.AIBulkDocumentProcessing?.map((item) => ({
        id: String(item.id),
        invitationId: String(item.formInvitationId),
        processingType: AIProcessingTypes.AIBulkDocumentProcessing,
        processedDocuments: Array.isArray(item.processedDocuments)
          ? item.processedDocuments
          : [],
        formId: String(item.FormInvitation?.Form?.id ?? ""),
        formType: item.FormInvitation?.Form?.formtype ?? "Assessment",
        triggeredCuration:
          (item.FormInvitation as any)?.metadata?.AIData?.triggeredCuration ?? [],
      })) ?? []),
      ...(processingData?.WebCuration?.map((item) => ({
        id: String(item.id),
        invitationId: String(item.formInvitationId),
        processingType: AIProcessingTypes.WebCuration,
        processedDocuments: [],
        formId: String(item.FormInvitation?.Form?.id ?? ""),
        formType: item.FormInvitation?.Form?.formtype ?? "Assessment",
        triggeredCuration:
          (item.FormInvitation as any)?.metadata?.AIData?.triggeredCuration ?? [],
      })) ?? []),
      ...(processingData?.OPSToIQCuration?.map((item) => ({
        id: String(item.id),
        invitationId: String(item.formInvitationId),
        processingType: AIProcessingTypes.OPSToIQCuration,
        processedDocuments: [],
        formId: String(item.FormInvitation?.Form?.id ?? ""),
        formType: item.FormInvitation?.Form?.formtype ?? "Assessment",
        triggeredCuration:
          (item.FormInvitation as any)?.metadata?.AIData?.triggeredCuration ?? [],
      })) ?? []),
    ];

    if (records.length === 0) {
      aiLogger.warn("No processing records found for provided IDs", { processingIds });
      return { data: [], error: null };
    }

    aiLogger.info("Processing records resolved", {
      total: records.length,
      byType: {
        AIBulkDocumentProcessing: records.filter(
          (r) => r.processingType === AIProcessingTypes.AIBulkDocumentProcessing
        ).length,
        WebCuration: records.filter(
          (r) => r.processingType === AIProcessingTypes.WebCuration
        ).length,
        OPSToIQCuration: records.filter(
          (r) => r.processingType === AIProcessingTypes.OPSToIQCuration
        ).length,
      },
    });

    // ── 2. BUILD UPDATES ───────────────────────────────────────────────────────
    const sourceIds = collectSourceIds(records);
    const sourceData = sourceIds.length > 0
      ? await sdk.getSourceDataById({ sourceId: sourceIds })
      : { Sources: [] };

    const sourcesById = new Map<string, { status: string | null }>(
      (sourceData.Sources ?? []).map((s: any) => [
        String(s.id),
        { status: s.SourceFile?.status ?? null },
      ])
    );

    const { aiBulkUpdates, webCurationUpdates, opsCurationUpdates } =
      buildCurationUpdates(records, sourcesById);

    // ── 3. COMPLETION GATE ─────────────────────────────────────────────────────
    // Source of truth: FormInvitation.metadata.AIData.triggeredCuration
    //
    // Per invitation, every type listed in triggeredCuration must have a
    // Completed row in the corresponding DB table before an email is sent.
    //
    // Scenarios:
    //   A. triggeredCuration = ["OPSToIQCuration"] only
    //      → OPS-only email template; gate on OPSToIQCuration row
    //
    //   B. triggeredCuration contains any AI type ("DocumentCuration" / "WebCuration"),
    //      with or without "OPSToIQCuration"
    //      → AI combined email template; gate on ALL listed types
    //
    //   C. triggeredCuration = ["Manual"] or empty
    //      → Not an AI processing trigger — skip silently

    const allInvitationIds = Array.from(
      new Set(records.map((r) => r.invitationId))
    );

    // Build a per-invitation context (first record wins for stable formId/formType/triggeredCuration).
    const invitationContextMap = new Map<
      string,
      { formId: string; formType: string; triggeredCuration: string[] }
    >();
    for (const record of records) {
      if (!invitationContextMap.has(record.invitationId)) {
        invitationContextMap.set(record.invitationId, {
          formId: record.formId,
          formType: record.formType,
          triggeredCuration: record.triggeredCuration,
        });
      }
    }

    // Fetch current DB status for all three curation types across these invitations.
    let webCurationMap = new Map<string, any>();
    let opsCurationMap = new Map<string, any>();
    let aiBulkMap = new Map<string, any>();
    let curationStatusFetchFailed = false;

    try {
      const statusResp =
        (await sdk.getWebCurationProcessAndAIBulkDocumentProcessing?.({
          invitationIds: allInvitationIds,
        })) ?? {};

      (statusResp?.WebCuration ?? []).forEach((w: any) => {
        webCurationMap.set(String(w.formInvitationId), w);
      });
      (statusResp?.OPSToIQCuration ?? []).forEach((o: any) => {
        opsCurationMap.set(String(o.formInvitationId), o);
      });
      ((statusResp as any)?.AIBulkDocumentProcessing ?? []).forEach((b: any) => {
        aiBulkMap.set(String(b.formInvitationId), b);
      });
    } catch (err) {
      // If status cannot be fetched we cannot verify completion — skip all emails.
      curationStatusFetchFailed = true;
      webCurationMap = new Map();
      opsCurationMap = new Map();
      aiBulkMap = new Map();
      aiLogger.warn("Failed to fetch curation status maps — all emails will be skipped", {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    const emailEligibleInvitations: EmailEligibleInvitation[] = [];
    const invitationsToMarkInvited: string[] = [];

    for (const invitationId of allInvitationIds) {
      const ctx = invitationContextMap.get(invitationId)!;
      const triggered = ctx.triggeredCuration;

      // ── Scenario C: not a standard AI processing trigger ─────────────────
      if (
        triggered.length === 0 ||
        (triggered.length === 1 && triggered[0] === TRIGGERED.Manual)
      ) {
        aiLogger.info("Skipping email — triggeredCuration is empty or Manual", {
          invitationId,
          triggeredCuration: triggered,
        });
        continue;
      }

      // ── Fail-safe: status fetch failure ───────────────────────────────────
      if (curationStatusFetchFailed) {
        aiLogger.info("Skipping email — curation status fetch failed", {
          invitationId,
          triggeredCuration: triggered,
        });
        continue;
      }

      // ── Gate: every triggered type must have a Completed DB row ───────────
      let allCompleted = true;
      const statusSnapshot: Record<string, string> = {};

      for (const cType of triggered) {
        if (cType === TRIGGERED.Document) {
          const row = aiBulkMap.get(invitationId);
          const status = String(row?.requestStatus ?? "").toLowerCase();
          statusSnapshot["DocumentCuration"] = row?.requestStatus ?? "not-found";
          if (!row || status !== bulkFileCurationStatus.Completed.toLowerCase()) {
            allCompleted = false;
            break;
          }
        } else if (cType === TRIGGERED.Web) {
          const row = webCurationMap.get(invitationId);
          const status = String(row?.status ?? "").toLowerCase();
          statusSnapshot["WebCuration"] = row?.status ?? "not-found";
          if (!row || status !== WebDataCurationStatus.Completed.toLowerCase()) {
            allCompleted = false;
            break;
          }
        } else if (cType === TRIGGERED.OPS) {
          const row = opsCurationMap.get(invitationId);
          const status = String(row?.status ?? "").toLowerCase();
          statusSnapshot["OPSToIQCuration"] = row?.status ?? "not-found";
          if (!row || status !== OPSToIQCurationStatus.Completed.toLowerCase()) {
            allCompleted = false;
            break;
          }
        }
        // Unknown types are ignored — they do not block the gate.
      }

      if (!allCompleted) {
        aiLogger.info("Skipping email — awaiting other curation types to complete", {
          invitationId,
          triggeredCuration: triggered,
          currentStatuses: statusSnapshot,
        });
        continue;
      }

      // ── Email template selection ───────────────────────────────────────────
      // Scenario A: OPS-only
      //   triggeredCuration has exactly one entry and it is OPSToIQCuration.
      // Scenario B: AI (or AI + OPS combined)
      //   Any AI type present → AI email template. No separate OPS email is sent.
      const isOpsOnly =
        triggered.length === 1 && triggered[0] === TRIGGERED.OPS;

      let emailType: string;
      if (isOpsOnly) {
        emailType = AIEmailTemplates.DataCaptureCompletedReporting;
      } else if (ctx.formType === "Assessment") {
        emailType = AIEmailTemplates.AIProcessingCompletedAssessment;
      } else {
        emailType = AIEmailTemplates.AIProcessingCompletedReporting;
      }

      emailEligibleInvitations.push({
        invitationId,
        formId: ctx.formId,
        emailType: [emailType],
      });
      invitationsToMarkInvited.push(invitationId);

      aiLogger.info("Invitation passed gate — email queued", {
        invitationId,
        triggeredCuration: triggered,
        isOpsOnly,
        emailType,
      });
    }

    // ── 4. WRITE ───────────────────────────────────────────────────────────────
    // Combine FormInvitation status updates with processing row completions in a single call
    // to maintain atomicity and prevent inconsistent state if one operation fails.
    const formInvitationUpdates: FormInvitation_Updates[] =
      invitationsToMarkInvited.length > 0
        ? invitationsToMarkInvited.map((invitationId) => ({
          where: { id: { _eq: invitationId } },
          _set: { status: FormInvitationStatus.Invited },
        }))
        : [];

    // Single atomic update: FormInvitation → Invited (for gated) AND all processing rows → Completed
    await sdk.updateFormInvitationStatusBulkbyId({
      formInvitationUpdateData: formInvitationUpdates,
      webCurationUpdateData: webCurationUpdates,
      aiBulkDocumentProcessingUpdateData: aiBulkUpdates,
      opsCurationUpdateData: opsCurationUpdates,
    });

    // ── 5. COMPLETION PERCENTAGE ───────────────────────────────────────────────
    // WebCuration writes suggestions only — actual answers are stored when the
    // user accepts a suggestion. Completion % is therefore recalculated at that
    // point, not here.
    // DocumentCuration and OPSToIQCuration both write answers, so they always
    // trigger an immediate recalculation.
    const completionPercentageInvitationIds = Array.from(
      new Set(
        records
          .filter((r) => r.processingType !== AIProcessingTypes.WebCuration)
          .map((r) => r.invitationId)
      )
    );

    if (completionPercentageInvitationIds.length > 0) {
      await calculateCompletionPercentage(completionPercentageInvitationIds, true);
    }

    // ── 6. POST-PIPELINE ───────────────────────────────────────────────────────
    // Suggestion cleanup → cache stats → send email → background stats.
    // Always runs, even if no invitations are email-eligible (for cache/stats cleanup).
    const sendEmailResponse = await runPostPipeline(
      emailEligibleInvitations,
      allInvitationIds
    );

    const durationMs = Date.now() - start;
    aiLogger.info("aiProcessingCompleted finished", {
      processingIds,
      totalRecords: records.length,
      emailsSent: emailEligibleInvitations.length,
      durationMs,
    });

    return { data: sendEmailResponse, error: null };
  } catch (error: any) {
    const durationMs = Date.now() - start;
    aiLogger.error("aiProcessingCompleted FATAL ERROR", {
      processingIds,
      message: error?.message,
      stack: error?.stack,
      durationMs,
    });

    const errorContent = JSON.stringify({
      datetime: new Date().toISOString(),
      processingIds,
      message: error?.message,
      stack: error?.stack,
      durationMs,
    });

    // Wrap uploadError in try-catch to avoid masking the original exception
    try {
      await uploadError("exception-logs", "exception-logs", errorContent);
    } catch (uploadErr) {
      aiLogger.error("Failed to upload error log to S3", {
        processingIds,
        uploadError: uploadErr instanceof Error ? uploadErr.message : String(uploadErr),
        originalError: error?.message,
      });
      // Continue to return the original error, not the upload failure
    }

    return { data: null, error: error?.message ?? "Unknown error" };
  }
};
