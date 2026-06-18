/**
 * DocumentCard Component - Single document display
 * 
 * Responsibilities:
 * - Display one document slot
 * - Wire dropzone with document state
 * - Use domain selectors for badge/status
 * 
 * Rules:
 * - No GraphQL
 * - No REST calls
 * - Memoized for card-level isolation
 */

import { useMemo } from "react";

import {
  calculateExpiryStatus,
  canDelete,
  canProcessWithAI,
  isSystemGenerated,
} from "../domain/document.rules";
import {
  Document,
  DocumentStatus,
  DocumentTemplate,
  ExpiryStatus,
  SubscriptionStatus
} from "../domain/document.types";
import Dropzone from "./Dropzone";

interface DocumentCardProps {
  template: DocumentTemplate;
  document: Document | null;
  uploadProgress?: number;
  subscription: SubscriptionStatus;
  companyMetadata: any;
  onDrop: (templateId: string, files: File[]) => void;
  onDelete: (documentId: string) => void;
  onProcessWithAI: (documentId: string) => void;
}

function DocumentCard({
  template,
  document,
  uploadProgress,
  subscription,
  companyMetadata,
  onDrop,
  onDelete,
  onProcessWithAI,
}: DocumentCardProps) {
  /**
   * Calculate badge to display
   * Uses domain rules for business logic
   */
  const badge = useMemo(() => {
    if (!document) return undefined;

    // System-generated takes priority
    if (isSystemGenerated(document)) {
      return { label: "System Generated", color: "#1C9689" };
    }

    // Expiry status
    if (document.expiryDate) {
      const expiryStatus = calculateExpiryStatus(document.expiryDate);
      if (expiryStatus === ExpiryStatus.Expired) {
        return { label: "Expired", color: "#DD3E3E" };
      }
      if (expiryStatus === ExpiryStatus.ExpiringSoon) {
        return { label: "Expiring Soon", color: "#FFA93C" };
      }
    }

    // Processing error
    if (document.status === DocumentStatus.ProcessingError) {
      return { label: "Processing Error", color: "#DD3E3E" };
    }

    // Processing
    if (document.status === DocumentStatus.Processing) {
      return { label: "Processing", color: "#038FC7" };
    }

    // Complete (Processed)
    if (document.status === DocumentStatus.Processed) {
      return { label: "Complete", color: "#038FC7" };
    }

    return undefined;
  }, [document]);

  /**
   * Check if dropzone should be disabled
   */
  const isDisabled = useMemo(() => {
    if (!document) return false;

    return (
      isSystemGenerated(document) ||
      document.status === DocumentStatus.Uploading ||
      document.status === DocumentStatus.Processing ||
      (document.expiryDate && calculateExpiryStatus(document.expiryDate) !== ExpiryStatus.Valid)
    );
  }, [document]);

  /**
   * Check if "Process with AI" button should be shown
   */
  const showProcessButton = useMemo(() => {
    if (!document) return false;
    return canProcessWithAI(document, subscription);
  }, [document, subscription]);

  /**
   * Handle file drop
   */
  const handleDrop = (files: File[]) => {
    onDrop(template.id, files);
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    if (document && canDelete(document)) {
      onDelete(document.documentLogsId);
    }
  };

  /**
   * Handle AI processing
   */
  const handleProcessWithAI = () => {
    if (document) {
      onProcessWithAI(document.documentLogsId);
    }
  };

  /**
   * Current file for display
   */
  const currentFile = document
    ? {
        name: document.originalFileName,
        size: document.fileSize,
        status: document.status,
        documentLogsId: document.documentLogsId,
      }
    : null;

  /**
   * Calculate raraResponse to display
   * 
   * Business Logic (from V1 architecture):
   * - If document has raraResponse → Show actual rating or "Rating - NA" based on document_rating
   * - If company doesn't have RARA enabled → Don't show rating block at all
   * - If RARA enabled AND no masterDocumentKey → Show "Rating - NA" (synthetic raraResponse with null rating)
   * - If RARA enabled AND has masterDocumentKey but no raraResponse → Don't show rating block (waiting for processing)
   * 
   * CRITICAL: Uses company metadata flag (isRARAEnabled) NOT subscription status
   * This matches V1 architecture where RARA is a company-level feature flag
   */
  const displayRaraResponse = useMemo(() => {
    // If document has raraResponse, use it (for all users with RARA enabled)
    if (document?.raraResponse) {
      return document.raraResponse;
    }

    // CRITICAL: Only show "Rating - NA" for companies with RARA enabled
    // This is determined by company metadata, NOT user subscription
    if (!companyMetadata.isRARAEnabled) {
      return null; // Don't show rating block if RARA not enabled for company
    }

    // If template has no masterDocumentKey (or it's empty), show "Rating - NA"
    // This matches V1 architecture behavior where templates without masterDocumentKey
    // still show rating block but with NA FOR RARA-ENABLED COMPANIES ONLY
    if (
      !template.masterDocumentKey ||
      template.masterDocumentKey.trim() === ""
    ) {
      return {
        document_rating: null,
        recommendations: [],
        reason_for_rating: "",
      };
    }

    // No raraResponse and has valid masterDocumentKey → Don't show rating yet
    return null;
  }, [document?.raraResponse, template.masterDocumentKey, companyMetadata.isRARAEnabled]);

  return (
    <Dropzone
      template={template}
      currentFile={currentFile}
      uploadProgress={uploadProgress}
      disabled={isDisabled as boolean}
      badge={badge}
      onDrop={handleDrop}
      onDelete={canDelete(document || ({} as Document)) ? handleDelete : undefined}
      onProcessWithAI={showProcessButton ? handleProcessWithAI : undefined}
      showProcessButton={showProcessButton}
      isChatSubscriptionActive={subscription.isChatSubscriptionActive}
      expiryDate={document?.expiryDate || null}
      raraResponse={displayRaraResponse}
      extractionPercentage={document?.extractionPercentage || null}
      isSystemGenerated={document ? isSystemGenerated(document) : false}
      metadata={{Location: document?.fileUrl || ""}}
      warningMessage={document?.error?.warning || ""}
      errorMessage={document?.error?.error || ""}
    />
  );
}
export default DocumentCard;
