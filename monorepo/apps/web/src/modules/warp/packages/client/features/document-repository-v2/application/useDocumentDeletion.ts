/**
 * useDocumentDeletion Hook - Document deletion orchestration
 * 
 * Responsibilities:
 * - Handle delete confirmation flow with modal
 * - Check if document already deleted
 * - Execute deletion (database + embeddings)
 * - Listen for modal responses
 * 
 * Rules:
 * - Encapsulates useState/useEffect (allowed in application layer)
 * - No UI components
 * - Callbacks for parent notification
 */

//AITODO: Can we directly delete the file, instead of queries first, then deleteing?

import { useApolloClient } from "@apollo/client";
import { formatDate } from "@/modules/warp/packages/client/features/document-repository/utils/documentHelpers";
import {
    documentRepositoryDeleteFileModal,
    rejectAlreadyDeletedFileMessageModal,
} from "@/modules/warp/packages/client/services/platform-window-message.service";
import { useEffect, useState } from "react";
import {
    Document,
    DocumentTemplate,
    UserContext,
} from "../domain/document.types";

interface UseDocumentDeletionProps {
    userContext: UserContext;
    documents: Document[];
    templates: DocumentTemplate[];
    // Optimistic local removal — runs immediately after the DB mutation so the
    // card disappears without waiting for refreshDocuments() (which currently
    // fails client-side because the server `sdk` requires AWS credentials).
    removeDocument?: (documentId: string) => void;
    onDeleteComplete?: () => void;
}

interface UseDocumentDeletionReturn {
    deleteDocument: (documentId: string) => Promise<void>;
    isDeleting: boolean;
}

export function useDocumentDeletion({
    userContext,
    documents,
    templates,
    removeDocument,
    onDeleteComplete,
}: UseDocumentDeletionProps): UseDocumentDeletionReturn {
    const apolloClient = useApolloClient();
    const [isDeleting, setIsDeleting] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<{
        documentId: string;
        templateId: string;
    } | null>(null);

    /**
     * Listen for modal confirmation messages from parent window
     */
    useEffect(() => {
        const messageHandler = async (event: MessageEvent) => {
            let messageData: any;
            const dataType = typeof event.data;

            if (dataType === "string") {
                try {
                    messageData = JSON.parse(event.data);
                } catch (error) {
                    return; // Not JSON, ignore
                }
            } else if (dataType === "object") {
                messageData = event.data;
            }

            if (!messageData) return;

            // Handle delete confirmation
            if (messageData.type === "document-repository-delete-file-from-modal-true") {
                if (pendingDelete) {
                    await executeDelete(pendingDelete.documentId);
                    setPendingDelete(null);
                }
            }

            // Handle rejection of already deleted file
            if (messageData.type === "document-repository-reject-already-deleted-file-message-true") {
                setPendingDelete(null);
                onDeleteComplete?.(); // Refresh to show current state
            }
        };

        window.addEventListener("message", messageHandler);
        return () => window.removeEventListener("message", messageHandler);
    }, [pendingDelete, onDeleteComplete]);

    /**
     * Check if document is already deleted by another user
     */
    const checkIfAlreadyDeleted = async (documentId: string) => {
        const { GetDocumentLogsDocument } = await import(
            "@/modules/warp/packages/graphql/queries/generated/get-document-logs"
        );

        const { data } = await apolloClient.query({
            query: GetDocumentLogsDocument,
            variables: {
                where: {
                    id: { _eq: documentId },
                    companyId: { _eq: userContext.companyId },
                },
            },
            fetchPolicy: "network-only",
        });

        const doc = data?.DocumentLogs?.[0];
        if (doc?.status === "Deleted" && doc?.deletedBy) {
            return {
                isDeleted: true,
                deletedByUserId: doc.deletedBy,
                deletedAt: doc.deletedAt,
            };
        }

        return { isDeleted: false };
    };

    /**
     * Execute the actual deletion (called after modal confirmation)
     */
    const executeDelete = async (documentId: string) => {
        console.log("[executeDelete] Executing deletion for:", documentId);
        setIsDeleting(true);

        try {
            // Embedding cleanup only applies to PDFs — those are the only files
            // the parser ingests. Skip the AIProcessing call for .doc/.docx,
            // .xls/.xlsx, images, etc., to avoid unnecessary backend work.
            const docForType = documents?.find((d) => d.id === documentId);
            const fileNameForType =
                docForType?.originalFileName || docForType?.fileName || "";
            const isPdf = fileNameForType
                .toLowerCase()
                .trim()
                .split("?")[0]
                .endsWith(".pdf");

            if (isPdf) {
                // Background: Delete embeddings (fire and forget - don't block UI)
                fetch("/warp/api/AI/AIprocessing", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        process: "deleteParsedDocument",
                        data: { document_log_ids: [documentId] },
                    }),
                })
                    .then((response) => {
                        if (response.ok) {
                            console.log(
                                "[executeDelete] Background embedding deletion initiated:",
                                documentId
                            );
                        } else {
                            console.warn("[executeDelete] Embedding deletion failed:", documentId);
                        }
                    })
                    .catch((error) => {
                        console.warn("[executeDelete] Embedding deletion error:", error);
                    });
            } else {
                console.log(
                    "[executeDelete] Skipping embedding deletion (non-PDF file):",
                    fileNameForType
                );
            }

            // Update database: Mark document as deleted
            const { Bulk_Update_Document_LogFilesDocument } = await import(
                "@/modules/warp/packages/graphql/mutations/generated/bulk-update-document-logFiles"
            );

            await apolloClient.mutate({
                mutation: Bulk_Update_Document_LogFilesDocument,
                variables: {
                    deletes: [],
                    updates: [
                        {
                            where: {
                                id: { _eq: documentId },
                                companyId: { _eq: userContext.companyId },
                            },
                            _set: {
                                status: "Deleted",
                                deletedBy: userContext.userId,
                                deletedAt: new Date().toISOString(),
                            },
                        },
                    ],
                },
            });

            console.log("[executeDelete] Document marked as deleted in database:", documentId);

            // Optimistically remove from local state so the card disappears
            // immediately. onDeleteComplete -> refreshDocuments() currently fails
            // client-side (the server `sdk` reads HASURA_GRAPHQL_ADMIN_SECRET from
            // AWS Secrets Manager which has no credentials in the browser), so
            // without this the UI stayed stale until a hard refresh.
            removeDocument?.(documentId);

            // Notify parent to refresh
            onDeleteComplete?.();

            console.log("[executeDelete] Deletion completed successfully:", documentId);
        } catch (error) {
            console.error("[executeDelete] Error deleting document:", error);
            throw error;
        } finally {
            setIsDeleting(false);
        }
    };

    /**
     * Initiate document deletion - Show confirmation modal
     */
    const deleteDocument = async (documentId: string) => {
        console.log("[deleteDocument] Delete request for:", documentId);

        // Find the document
        const document = documents.find((d) => d.documentLogsId === documentId);
        if (!document) {
            console.error("[deleteDocument] Document not found:", documentId);
            return;
        }

        // Find the template
        const template = templates.find((t) => t.id === document.aiSuggestedDocumentId);
        if (!template) {
            console.error("[deleteDocument] Template not found for document:", documentId);
            return;
        }

        // Check if already deleted
        const deleteCheck = await checkIfAlreadyDeleted(documentId);
        if (deleteCheck.isDeleted) {
            // Show "already deleted" modal
            const { GetUserDetailByIdDocument } = await import(
                "@/modules/warp/packages/graphql/queries/generated/get-userdetail-by-id"
            );
            const { data: userData } = await apolloClient.query({
                query: GetUserDetailByIdDocument,
                variables: { id: deleteCheck.deletedByUserId },
                fetchPolicy: "network-only",
            });

            const deletedByName = userData?.User?.[0]?.name || "Unknown User";
            const formattedDate = formatDate(deleteCheck.deletedAt);

            window.parent?.postMessage(
                rejectAlreadyDeletedFileMessageModal(
                    deletedByName,
                    formattedDate,
                    documentId,
                    [] as any // Empty array - modal doesn't need full templates
                ),
                "*"
            );
            return;
        }

        // Store pending delete info
        setPendingDelete({
            documentId,
            templateId: template.id,
        });

        // Show delete confirmation modal
        window.parent?.postMessage(
            documentRepositoryDeleteFileModal(
                template.id,
                document.fileUrl,
                documentId,
                [] as any, // Empty array - modal doesn't need full templates
                document.status,
                document.originalFileName
            ),
            "*"
        );
    };

    return {
        deleteDocument,
        isDeleting,
    };
}
