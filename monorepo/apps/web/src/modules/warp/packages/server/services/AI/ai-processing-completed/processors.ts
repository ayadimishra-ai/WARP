import { AiBulkDocumentProcessing_Updates } from "@/modules/warp/packages/graphql/generated/types";
import {
  AIProcessingType,
  AIProcessingTypes,
  bulkFileCurationStatus,
  OPSToIQCurationStatus,
  WebDataCurationStatus,
} from "@/modules/warp/packages/shared/constants/app.constants";

/**
 * Normalized shape for a single processing record, regardless of curation type.
 * Derived from the raw GraphQL result of getProcessingDataByIdAllTypes.
 */
export interface NormalizedRecord {
  id: string;
  invitationId: string;
  processingType: AIProcessingType;
  /** Populated only for AIBulkDocumentProcessing records. */
  processedDocuments: Array<{ sourceId: string }>;
  formId: string;
  formType: string;
  /**
   * The curation types actually triggered for this invitation, read from
   * FormInvitation.metadata.AIData.triggeredCuration. Written by the
   * update-invitation-web-curation-ai-bulk-processing orchestrator before
   * AI tasks are dispatched.
   *
   * Known values: "DocumentCuration" | "WebCuration" | "OPSToIQCuration" | "Manual"
   *
   * Note: "DocumentCuration" maps to the AIBulkDocumentProcessing table —
   * it is NOT the same string as AIProcessingTypes.AIBulkDocumentProcessing.
   */
  triggeredCuration: string[];
}

export interface CurationUpdates {
  aiBulkUpdates: AiBulkDocumentProcessing_Updates[];
  webCurationUpdates: any[];
  opsCurationUpdates: any[];
}

/**
 * Extracts source IDs from AIBulkDocumentProcessing records.
 * Used to fetch SourceFile statuses before building DB update objects.
 */
export function collectSourceIds(records: NormalizedRecord[]): string[] {
  return records
    .filter((r) => r.processingType === AIProcessingTypes.AIBulkDocumentProcessing)
    .flatMap((r) => r.processedDocuments.map((d) => d.sourceId))
    .filter(Boolean);
}

/**
 * Builds the typed DB update objects for all three curation tables.
 * AIBulkDocumentProcessing: includes source file statuses and emailSendAt timestamp.
 * WebCuration / OPSToIQCuration: simple status → Completed update.
 */
export function buildCurationUpdates(
  records: NormalizedRecord[],
  sourcesById: Map<string, { status: string | null }>
): CurationUpdates {
  const aiBulkUpdates: AiBulkDocumentProcessing_Updates[] = [];
  const webCurationUpdates: any[] = [];
  const opsCurationUpdates: any[] = [];

  for (const record of records) {
    switch (record.processingType) {
      case AIProcessingTypes.AIBulkDocumentProcessing: {
        const processedDocumentsWithStatus = record.processedDocuments.map((doc) => ({
          sourceId: doc.sourceId,
          status: sourcesById.get(doc.sourceId)?.status ?? null,
        }));
        aiBulkUpdates.push({
          where: { id: { _eq: record.id } },
          _set: {
            processedDocuments: processedDocumentsWithStatus,
            emailSendAt: new Date(),
            updated_at: new Date(),
            requestStatus: bulkFileCurationStatus.Completed,
          },
        });
        break;
      }

      case AIProcessingTypes.WebCuration: {
        webCurationUpdates.push({
          where: { id: { _eq: record.id } },
          _set: {
            status: WebDataCurationStatus.Completed,
            updated_at: new Date(),
          },
        });
        break;
      }

      case AIProcessingTypes.OPSToIQCuration: {
        opsCurationUpdates.push({
          where: { id: { _eq: record.id } },
          _set: {
            status: OPSToIQCurationStatus.Completed,
            updated_at: new Date(),
          },
        });
        break;
      }
    }
  }

  return { aiBulkUpdates, webCurationUpdates, opsCurationUpdates };
}
