/**
 * useDocuments Hook - Document state management
 * 
 * Responsibilities:
 * - Hold document list state
 * - Expose explicit refreshDocuments()
 * - Accept initialDocuments from SSR
 * 
 * Rules:
 * - No upload logic
 * - Minimal useEffect usage
 * - Event-driven, not effect-driven
 */

import { useApolloClient } from "@apollo/client";
import { useRef, useState } from "react";
import {
    Document,
    UserContext
} from "../domain/document.types";
import { fetchDocumentsWithFiltering } from "../server/fetchDocuments";

interface UseDocumentsProps {
    initialDocuments: Document[];
    userContext: UserContext;
}

interface UseDocumentsReturn {
    documents: Document[];
    refreshDocuments: () => Promise<Document[]>;
    isRefreshing: boolean;
    updateDocument: (documentId: string, updates: Partial<Document>) => void;
    removeDocument: (documentId: string) => void;
    addDocument: (document: Document) => void;
}

export function useDocuments({
    initialDocuments,
    userContext,
}: UseDocumentsProps): UseDocumentsReturn {
    const apolloClient = useApolloClient();
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Use ref for stable userContext reference
    const userContextRef = useRef(userContext);
    userContextRef.current = userContext;

    /**
     * Explicitly refresh documents from server
     * 
     * CRITICAL: Uses fetchDocumentsWithFiltering to apply system-generated filtering
     * This ensures client-side refresh has same filtering as SSR initial load
     * 
     * Called by:
     * - Polling (every 5 seconds when processing)
     * - User actions (after delete, after AI processing retry)
     * 
     * Returns the fresh documents for immediate consumption
     * NO useCallback
     */
    const refreshDocuments = async (): Promise<Document[]> => {
        setIsRefreshing(true);
        try {
            // Use fetchDocumentsWithFiltering to apply business logic
            // This ensures only latest system-generated document per form is shown
            const freshDocuments = await fetchDocumentsWithFiltering(
                apolloClient,
                userContextRef.current
            );
            setDocuments(freshDocuments);
            return freshDocuments;
        } catch (error) {
            console.error("Failed to refresh documents:", error);
            return documents; // Return current documents on error
        } finally {
            setIsRefreshing(false);
        }
    };

    /**
     * Update a specific document in state
     * Used for optimistic updates
     */
    const updateDocument = (documentId: string, updates: Partial<Document>) => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.documentLogsId === documentId ? { ...doc, ...updates } : doc
            )
        );
    };

    /**
     * Remove a document from state
     */
    const removeDocument = (documentId: string) => {
        setDocuments((prev) =>
            prev.filter((doc) => doc.documentLogsId !== documentId)
        );
    };

    /**
     * Add a new document to state (or update if already exists)
     */
    const addDocument = (document: Document) => {
        setDocuments((prev) => {
            // Check if document already exists
            const existingIndex = prev.findIndex(d => d.documentLogsId === document.documentLogsId);
            if (existingIndex !== -1) {
                // Update existing document
                const updated = [...prev];
                updated[existingIndex] = document;
                return updated;
            }
            // Add new document
            return [...prev, document];
        });
    };

    return {
        documents,
        refreshDocuments,
        isRefreshing,
        updateDocument,
        removeDocument,
        addDocument,
    };
}
