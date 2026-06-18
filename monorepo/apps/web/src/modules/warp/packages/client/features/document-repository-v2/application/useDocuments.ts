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
  DocumentStatus,
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
  refreshProcessingDocuments: () => Promise<void>;
  isRefreshing: boolean;
  updateDocument: (documentId: string, updates: Partial<Document>) => void;
  removeDocument: (documentId: string) => void;
  addDocument: (document: Document) => void;
}

export function useDocuments({
  initialDocuments,
  userContext
}: UseDocumentsProps): UseDocumentsReturn {
  const apolloClient = useApolloClient();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use ref for stable userContext reference
  const userContextRef = useRef(userContext);
  userContextRef.current = userContext;

  // Mirror documents into a ref so refreshProcessingDocuments can read the
  // latest list without re-creating itself (and without re-wiring usePolling).
  const documentsRef = useRef(documents);
  documentsRef.current = documents;

  /**
   * Browser-safe refresh for currently-processing documents.
   *
   * The full `refreshDocuments` path goes through the server-side `sdk`
   * (graphql-request + HASURA_GRAPHQL_ADMIN_SECRET from AWS Secrets Manager),
   * which fails in the browser with "Credential is missing". This function
   * instead queries Apollo Client — already configured for browser use — and
   * merges only the fields that polling actually needs to refresh
   * (status, extractionPercentage, raraResponse, error, processingMessage).
   *
   * Narrowed to the currently-processing document IDs so the query stays small.
   */
  const refreshProcessingDocuments = async (): Promise<void> => {
    const processingIds = documentsRef.current
      .filter((d) => d.status === DocumentStatus.Processing)
      .map((d) => d.documentLogsId);

    if (processingIds.length === 0) return;

    try {
      // Lazy-import to keep this hook tree-shakeable for non-polling callers.
      const { GetDocumentLogsDocument } = await import(
        "@/modules/warp/packages/graphql/queries/generated/get-document-logs"
      );

      const { data } = await apolloClient.query({
        query: GetDocumentLogsDocument,
        variables: {
          where: {
            id: { _in: processingIds },
            companyId: { _eq: userContextRef.current.companyId }
          }
        },
        fetchPolicy: "network-only"
      });

      const rows: any[] = data?.DocumentLogs ?? [];
      if (rows.length === 0) return;

      setDocuments((prev) =>
        prev.map((doc) => {
          const fresh = rows.find((r) => r.id === doc.documentLogsId);
          if (!fresh) return doc;
          return {
            ...doc,
            status: mapStatus(fresh.status, doc.status),
            extractionPercentage:
              fresh.extractionPercentage ?? doc.extractionPercentage,
            raraResponse: fresh.raraResponse ?? doc.raraResponse,
            error: fresh.error ?? doc.error,
            updatedAt: fresh.updatedAt ?? doc.updatedAt
          };
        })
      );
    } catch (error) {
      console.error("Failed to refresh processing documents:", error);
    }
  };

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
      const existingIndex = prev.findIndex(
        (d) => d.documentLogsId === document.documentLogsId
      );
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
    refreshProcessingDocuments,
    isRefreshing,
    updateDocument,
    removeDocument,
    addDocument
  };
}

/**
 * Map raw GraphQL status string to DocumentStatus enum. Falls back to the
 * current in-memory status if the server returns something we don't recognize
 * (avoids flipping a card back to Idle on an unexpected value).
 */
function mapStatus(raw: string, fallback: DocumentStatus): DocumentStatus {
  const map: Record<string, DocumentStatus> = {
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
  return map[raw] ?? fallback;
}
