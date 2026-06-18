/**
 * Server Layer - Data Fetching (SSR-compatible)
 *
 * Responsible for fetching raw data from backend and normalizing to domain models.
 * No React, no hooks, compatible with getServerSideProps.
 */

import { ApolloClient } from "@apollo/client";
import { SourcesType } from "@/modules/warp/packages/shared/constants/app.constants";
import {
  Document,
  DocumentStatus,
  DocumentTemplate,
  UserContext
} from "../domain/document.types";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { mergeWithLatestSystemGenerated } from "../domain/document.selectors";

/**
 * Fetch documents from backend
 *
 * This function is designed to work in both SSR and client contexts.
 * It accepts an Apollo client instance to avoid coupling to global state.
 */
export async function fetchDocuments(
  userContext: UserContext
): Promise<Document[]> {
  const data = await sdk
    .GetDocumentLogs({
      where: {
        companyId: { _eq: userContext.companyId },
        status: { _neq: DocumentStatus.Deleted }
      }
    })
    .catch((error) => {
      console.error("Error fetching documents:", error);
      throw error;
    });

  // Normalize raw GraphQL response to domain models
  const rawDocuments = data?.DocumentLogs || [];
  return rawDocuments.map(normalizeDocumentFromGraphQL);
}

/**
 * Fetch documents with system-generated filtering applied
 *
 * This applies business logic to show only the latest system-generated document per form,
 * preventing duplicate reports from appearing in the UI.
 *
 * BUSINESS RULE:
 * - System-generated reports: Show only the LATEST one per form
 * - User-uploaded documents: Show all
 *
 * Used by:
 * - Client-side (refreshDocuments) - After uploads, polling, etc.
 *
 * @param apolloClient - Apollo Client instance
 * @param userContext - User context (userId, companyId)
 * @returns Filtered documents array
 */
export async function fetchDocumentsWithFiltering(
  userContext: UserContext
): Promise<Document[]> {
  // Step 1: Fetch raw documents from database
  const rawDocuments = await fetchDocuments(userContext);

  // Step 2: Extract system-generated documents with invitation IDs
  const systemGeneratedDocs = rawDocuments.filter(
    (doc) =>
      doc.createdBy === null &&
      doc.uploadedFromInvitationId !== null &&
      doc.uploadedFromInvitationId !== undefined
  );

  // If no system-generated documents, return raw documents as-is
  if (systemGeneratedDocs.length === 0) {
    return rawDocuments;
  }

  // Step 3: Get unique invitation IDs
  const uniqueInvitationIds = Array.from(
    new Set(systemGeneratedDocs.map((doc) => doc.uploadedFromInvitationId!))
  );

  // Step 4: Fetch form invitation mappings (invitationId -> formId)
  const invitationToFormMap =
    await fetchFormInvitationsMapping(uniqueInvitationIds);

  // Step 5: Apply domain selector to filter system-generated documents
  const filteredDocuments = mergeWithLatestSystemGenerated(
    rawDocuments,
    invitationToFormMap
  );

  return filteredDocuments;
}

/**
 * Fetch form invitation mappings (invitationId -> formId)
 *
 * Returns a mapping object that associates invitation IDs with their corresponding form IDs.
 * Used to group system-generated documents by their actual form, not just invitation.
 *
 * @param invitationIds - Array of invitation IDs to fetch mappings for
 * @returns Record<invitationId, formId>
 */
export async function fetchFormInvitationsMapping(
  invitationIds: string[]
): Promise<Record<string, string>> {
  if (invitationIds.length === 0) {
    return {};
  }

  const invitationToFormMap: Record<string, string> = {};

  // Fetch form details for each invitation ID
  // Note: This could be optimized with a bulk query if available
  await Promise.all(
    invitationIds.map(async (invitationId) => {
      try {
        const data = await sdk
          .getFormInvitationDetailsbyId({
            invitationId: invitationId,
            sourceType: SourcesType.Uploaded?.dbTittle || "Uploaded"
          })
          .catch((error) => {
            console.error(
              `Error fetching form invitation ${invitationId}:`,
              error
            );
            throw error;
          });

        // Extract formId from response
        const formId = data?.FormInvitation?.[0]?.Form?.id;
        if (formId) {
          invitationToFormMap[invitationId] = formId;
        }
      } catch (error) {
        console.error(
          `Exception fetching form invitation ${invitationId}:`,
          error
        );
      }
    })
  );

  return invitationToFormMap;
}

/**
 * Fetch document templates (AI Suggested Documents)
 */
export async function fetchDocumentTemplates(): Promise<DocumentTemplate[]> {
  try {
    const data = await sdk.GetAISuggestedDocuments().catch((error) => {
      console.error("[SSR] Error fetching document templates:", error);
      throw error;
    });

    const rawTemplates = data?.AISuggestedDocuments || [];
    const normalizedTemplates = rawTemplates.map(normalizeTemplateFromGraphQL);

    return normalizedTemplates;
  } catch (err) {
    console.error("[SSR] fetchDocumentTemplates - Exception caught:", err);
    throw err;
  }
}

/**
 * Fetch subscription status
 */
export async function fetchSubscriptionStatus(
  userContext: UserContext
): Promise<{ isChatSubscriptionActive: boolean }> {
  const data = await sdk
    .GetActiveSubscriptionByCompanyId({
      companyId: userContext.companyId,
      userId: userContext.userId
    })
    .catch((error) => {
      console.error("Error fetching subscription:", error);
      // Don't throw - subscription is not critical
      // throw { isChatSubscriptionActive: false };
    });

  // Check if subscription is active based on existing business logic
  const subscription = data?.AIChatSubscription?.[0];
  const isChatSubscriptionActive = isSubscriptionActive(subscription);

  return { isChatSubscriptionActive };
}

/**
 * Normalize raw GraphQL document to domain model
 */
function normalizeDocumentFromGraphQL(raw: any): Document {
  return {
    id: raw.id,
    documentLogsId: raw.id,
    aiSuggestedDocumentId: raw.aiSuggestedDocumentId || "",
    title: raw.AISuggestedDocument?.title || raw.originalFileName || "Untitled",
    fileName: raw.fileName || "",
    originalFileName: raw.originalFileName || "",
    fileUrl: raw.fileUrl || "",
    fileSize: parseFloat(raw.fileSize || "0"),
    status: mapGraphQLStatus(raw.status),
    error: raw.error ?? null,
    metadata: raw.metadata ?? null,
    processingMessage: raw.processingMessage ?? null,
    extractionPercentage: raw.extractionPercentage ?? null,
    raraResponse: raw.raraResponse ?? null,
    expiryDate: raw.expiryDate ?? null,
    createdBy: raw.createdBy ?? null,
    uploadedFromInvitationId: raw.uploadedFromInvitationId ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    deletedAt: raw.deletedAt ?? null,
    deletedBy: raw.deletedBy ?? null
  };
}

/**
 * Normalize raw GraphQL template to domain model
 */
function normalizeTemplateFromGraphQL(raw: any): DocumentTemplate {
  // The acceptedFormats field in database is stored as a JSON object with nested acceptedFormats array
  // Example: { "acceptedFormats": ["pdf", "xlsx", "jpg"] }
  // We need to extract the inner array
  let acceptedFormats: string[] = [];

  if (raw.acceptedFormats) {
    // If it's already an array, use it directly
    if (Array.isArray(raw.acceptedFormats)) {
      acceptedFormats = raw.acceptedFormats;
    }
    // If it's an object with acceptedFormats property, extract the nested array
    else if (
      typeof raw.acceptedFormats === "object" &&
      raw.acceptedFormats.acceptedFormats
    ) {
      if (Array.isArray(raw.acceptedFormats.acceptedFormats)) {
        acceptedFormats = raw.acceptedFormats.acceptedFormats;
      }
    }
    // If it's a JSON string, parse it and extract the nested array
    else if (typeof raw.acceptedFormats === "string") {
      try {
        const parsed = JSON.parse(raw.acceptedFormats);
        if (parsed && Array.isArray(parsed.acceptedFormats)) {
          acceptedFormats = parsed.acceptedFormats;
        } else if (Array.isArray(parsed)) {
          acceptedFormats = parsed;
        }
      } catch (error) {
        console.warn(
          "[normalizeTemplateFromGraphQL] Failed to parse acceptedFormats:",
          raw.acceptedFormats,
          error
        );
        acceptedFormats = [];
      }
    }
  }

  return {
    id: raw.id,
    title: raw.title || "",
    sampleFileUrl: raw.sampleFileUrl ?? null,
    acceptedFormats,
    maxSize: raw.maxSize || 10,
    isOther: raw.isOther || false,
    seqIndex: raw.seqIndex || 0,
    warning: raw.warning ?? null,
    masterDocumentKey: raw.masterDocumentKey ?? null
  };
}

/**
 * Map GraphQL status to domain status
 * Maps database status values to domain enum
 */
function mapGraphQLStatus(status: string): DocumentStatus {
  const statusMap: Record<string, DocumentStatus> = {
    idle: DocumentStatus.Idle,
    Pending: DocumentStatus.Pending,
    Uploading: DocumentStatus.Uploading,
    Uploaded: DocumentStatus.Uploaded,
    Processing: DocumentStatus.Processing,
    Processed: DocumentStatus.Processed,
    UploadError: DocumentStatus.UploadError,
    ProcessingError: DocumentStatus.ProcessingError,
    Deleted: DocumentStatus.Deleted
  };

  return statusMap[status] || DocumentStatus.Idle;
}

/**
 * Check if subscription is active (preserved from original business logic)
 */
function isSubscriptionActive(subscription: any): boolean {
  if (!subscription) return false;

  const now = new Date();
  const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

  // Subscription is active if:
  // 1. It exists
  // 2. End date is in the future or null (unlimited)
  return !endDate || endDate > now;
}
