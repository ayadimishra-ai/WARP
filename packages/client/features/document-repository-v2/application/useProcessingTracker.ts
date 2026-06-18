/**
 * useProcessingTracker Hook - AI Processing Retry Management
 * 
 * Responsibilities:
 * - Handle AI processing retry for failed documents
 * - Validate retry eligibility
 * - Trigger AI processing API
 * - Notify completion via callbacks
 * 
 * Rules:
 * - Event-driven (NO effect-driven processing)
 * - Call onProcessingComplete with FULL document objects
 * - NEVER call refreshDocuments (polling handles natural sync)
 */

import { useApolloClient } from "@apollo/client";
import { canProcessWithAI } from "../domain/document.rules";
import {
    Document,
    DocumentStatus,
    SubscriptionStatus,
    UserContext,
} from "../domain/document.types";

interface UseProcessingTrackerProps {
    userContext: UserContext;
    subscription: SubscriptionStatus;
    accessToken?: string;
    onProcessingComplete?: (document: Document) => void;
    onProcessingError?: (documentId: string, error: string) => void;
}

interface UseProcessingTrackerReturn {
    triggerAIProcessing: (document: Document) => Promise<void>;
    canProcess: (document: Document) => boolean;
}

export function useProcessingTracker({
    userContext,
    subscription,
    accessToken,
    onProcessingComplete,
    onProcessingError,
}: UseProcessingTrackerProps): UseProcessingTrackerReturn {
    const apolloClient = useApolloClient();

    /**
     * Check if document can be processed with AI
     */
    const canProcess = (document: Document) => {
        return canProcessWithAI(document, subscription);
    };

    /**
     * Trigger AI processing for a document
     * 
     * Pattern:
     * 1. Call onProcessingComplete with Processing document → INSTANT UI UPDATE
     * 2. Update DB to Processing status
     * 3. Trigger API call (async background processing)
     * 4. Polling detects completion naturally (no second callback needed)
     * 
     * Error case:
     * 1. Call onProcessingComplete with Error document → INSTANT UI UPDATE
     * 2. Update DB to Error status
     * 
     * CRITICAL: Like uploadSingleFile, we call onProcessingComplete with FULL document object
     * CRITICAL: Like uploadSingleFile, we NEVER call refreshDocuments - polling handles it
     */
    const triggerAIProcessing = async (document: Document) => {
        // Validate eligibility
        if (!canProcess(document)) {
            const reason = getIneligibilityReason(document, subscription);
            console.error(`[triggerAIProcessing] Cannot process:`, reason);
            onProcessingError?.(document.documentLogsId, reason);
            return;
        }

        try {
            // Step 1: Update DB FIRST to prevent polling from fetching stale error data
            // This ensures when polling runs, it gets the correct Processing status from DB
            await updateDocumentStatus(
                document.documentLogsId,
                DocumentStatus.Processing,
                apolloClient
            );

            // Step 2: IMMEDIATE UI update - call onProcessingComplete with Processing document
            // This is EXACTLY like uploadSingleFile calling onUploadComplete with Uploading status
            const processingDocument: Document = {
                ...document,
                status: DocumentStatus.Processing,
                error: {error: '', warning: ''}, // Clear old error
                extractionPercentage: "", // Clear old progress
            };
            onProcessingComplete?.(processingDocument);

            // Step 3: Trigger AI processing API (async background work)
            await triggerProcessingAPI(
                document.documentLogsId,
                document.fileUrl,
                document.originalFileName,
                userContext,
                accessToken
            );

            // Note: Final "Processed" status will be detected by polling
            // This is EXACTLY like uploadSingleFile - polling handles natural updates
            // NO second onProcessingComplete call needed
            // Polling is safe now because DB has correct data

        } catch (error: any) {
            console.error(`[triggerAIProcessing] Failed:`, error);

            // Update DB FIRST with error status
            await updateDocumentStatus(
                document.documentLogsId,
                DocumentStatus.ProcessingError,
                apolloClient,
                error.message || "Processing failed"
            );

            // Then update UI with error - call onProcessingComplete with Error document
            const errorDocument: Document = {
                ...document,
                status: DocumentStatus.ProcessingError,
                error: {
                    error: error.message || "Processing failed",
                    warning: "",
                },
                extractionPercentage: "",
            };
            onProcessingComplete?.(errorDocument);

            onProcessingError?.(document.documentLogsId, error.message || "Processing failed");
        }
    };

    return {
        triggerAIProcessing,
        canProcess,
    };
}

/**
 * Get reason why document cannot be processed
 */
function getIneligibilityReason(
    document: Document,
    subscription: SubscriptionStatus
): string {
    if (!subscription.isChatSubscriptionActive) {
        return "AI processing requires an active subscription";
    }

    if (document.status !== DocumentStatus.Uploaded && document.status !== DocumentStatus.ProcessingError) {
        return `Document cannot be processed in ${document.status} state`;
    }

    if (!document.fileUrl) {
        return "Missing file URL";
    }

    return "Document cannot be processed";
}

/**
 * Update document status in database
 * 
 * CRITICAL: Clear all processing-related fields to prevent stale data
 */
async function updateDocumentStatus(
    documentLogsId: string,
    status: DocumentStatus,
    apolloClient: any,
    errorMessage?: string
): Promise<void> {
    const { Bulk_Update_Document_LogFilesDocument: BULK_UPDATE_DOCUMENT_LOG_FILES } = await import("@warp/graphql/mutations/generated/bulk-update-document-logFiles");

    const updatePayload: any = {
        status,
        error: errorMessage
            ? { error: errorMessage, warning: "" }
            : { error: "", warning: "" },
        // Clear all processing-related fields when starting retry
        ...(status === DocumentStatus.Processing && {
            extractionPercentage: null,
        }),
    };

    await apolloClient.mutate({
        mutation: BULK_UPDATE_DOCUMENT_LOG_FILES,
        variables: {
            deletes: [],
            updates: [
                {
                    where: { id: { _eq: documentLogsId } },
                    _set: updatePayload,
                },
            ],
        },
    });
}

/**
 * Trigger AI processing via API
 * Uses the existing /api/AI/AIprocessing endpoint with fileParsing process
 */
async function triggerProcessingAPI(
    documentLogsId: string,
    fileUrl: string,
    fileName: string,
    userContext: UserContext,
    accessToken?: string
): Promise<void> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (accessToken) {
        headers["Authorization"] = accessToken;
    }

    const response = await fetch("/api/AI/AIprocessing", {
        method: "POST",
        headers,
        body: JSON.stringify({
            process: "fileParsing",
            data: {
                url: fileUrl,
                document_log_id: documentLogsId,
                company_id: userContext.companyId,
                user_id: userContext.userId,
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "AI processing API failed" }));
        throw new Error(errorData.message || errorData.data?.message || "AI processing API failed");
    }

    const result = await response.json();

    if (!result.data?.success) {
        throw new Error(result.data?.message || "AI parsing failed");
    }
}
