/**
 * Document Repository Page (Clean Architecture Version)
 * 
 * This is a composition-only page following clean architecture principles:
 * - SSR via getServerSideProps (in parent page)
 * - Hook composition for orchestration
 * - Pure UI components for rendering
 * - No business logic in this file
 * - No useEffect for data fetching
 * - No local state for business data
 * 
 * @see .architecture-rules.md for detailed architecture guidelines
 */

import { Container } from "@mantine/core";
import { useMemo } from "react";

// Application layer
import { useDocumentDeletion } from "../application/useDocumentDeletion";
import { useDocumentFilters } from "../application/useDocumentFilters";
import { useDocuments } from "../application/useDocuments";
import { useExpiredPopupHandler } from "../application/useExpiredPopupHandler";
import { usePolling } from "../application/usePolling";
import { useProcessingTracker } from "../application/useProcessingTracker";
import { useTemplateManager } from "../application/useTemplateManager";
import { useUploadManager } from "../application/useUploadManager";

// Domain layer
import {
  calculateHeadingText,
  countExpiredDocuments,
  hasProcessingDocuments,
} from "../domain/document.rules";
import {
  getTemplatesWithExpiredDocuments,
  searchTemplates,
  sortTemplatesBySequence,
} from "../domain/document.selectors";
import {
  Document,
  DocumentTemplate,
  SubscriptionStatus,
  UserContext,
} from "../domain/document.types";

// UI layer
import DocumentGrid from "../ui/DocumentGrid";

interface DocumentRepositoryPageProps {
  initialDocuments: Document[];
  templates: DocumentTemplate[]; // Must be provided via SSR in parent page
  subscription: SubscriptionStatus; // Must be provided via SSR in parent page
  userContext: UserContext;
  session?: {
    accessToken?: string;
    company?: {
      id: string;
      name: string;
      isRARAEnabled?: boolean;
      isDocumentValidationEnabled?: boolean;
      isDocumentValidityCheckEnabled?: boolean;
    };
  };
}

export default function DocumentRepositoryPage({
  initialDocuments,
  templates,
  subscription,
  userContext,
  session,
}: DocumentRepositoryPageProps) {
  // ========== Architecture Validation ==========
  
  /**
   * IMPORTANT: All initial data MUST come from parent page's getServerSideProps
   * If templates or subscription are missing, fix the parent page, not this component
   * 
   * Parent page location: apps/web/pages/document-repository.tsx
   * Required SSR calls:
   * - await fetchDocumentTemplates(apolloClient)
   * - await fetchSubscriptionStatus(apolloClient, userContext)
   */
  // ========== State Management ==========

  const {
    documents,
    refreshDocuments,
    refreshProcessingDocuments,
    isRefreshing,
    updateDocument,
    addDocument,
    removeDocument,
  } = useDocuments({
    initialDocuments,
    userContext,
  });

  // ========== Template Management ==========
  
  /**
   * Expand templates with temporary templates for "Other" documents
   * 
   * Business logic:
   * - "Any Other" card supports bulk uploads
   * - Each uploaded "Other" file gets its own card (temp template)
   * - On page load, create temp template for each existing "Other" document
   */
  const { expandedTemplates } = useTemplateManager({
    baseTemplates: templates,
    documents,
  });
  
  const {
    filters,
    filteredDocuments,
    expiredCount,
    newExpiredCount,
    hasViewedExpiredTab,
    setShowExpiredOnly,
    setSearchTerm,
    toggleExpiredView,
    incrementNewExpiredCount,
  } = useDocumentFilters({
    documents,
    templates: expandedTemplates, // Use expanded templates (includes temp templates for "Other" docs)
    userContext, // Required for database persistence of badge count
  });

  const handleUploadComplete = (document: Document) => {
    console.log("handleUploadComplete - Document uploaded:", document.documentLogsId);  
    addDocument(document);
  };

  const handleUploadError = (error: string, fileName: string) => {
    console.error(`Upload failed for ${fileName}:`, error);
    // Could show toast notification here
  };

  /**
   * Handle expired popup events
   * Application hook encapsulates useEffect and refs (architectural compliance)
   * Increments badge count when expired documents are uploaded
   */
  const { handleExpiredDocumentUploaded } = useExpiredPopupHandler({
    onNavigateToExpiredTab: () => setShowExpiredOnly(true),
    onIncrementExpiredCount: incrementNewExpiredCount,
  });

  // Prepare templates Map for useUploadManager (needed for RARA)
  const templatesMap = new Map<string, { masterDocumentKey?: string; title: string }>();
  templates.forEach((template) => {
    templatesMap.set(template.id, {
      masterDocumentKey: template.masterDocumentKey,
      title: template.title,
    });
  });

  // Prepare company metadata for useUploadManager
  const companyMetadata = {
    name: session?.company?.name || "",
    isRARAEnabled: session?.company?.isRARAEnabled || false,
    isDocumentValidationEnabled: session?.company?.isDocumentValidationEnabled || false,
    isDocumentValidityCheckEnabled: session?.company?.isDocumentValidityCheckEnabled || false,
  };

  const {
    uploadProgress,
    uploadFiles,
  } = useUploadManager({
    userContext,
    accessToken: session?.accessToken,
    companyMetadata,
    isChatSubscriptionActive: subscription.isChatSubscriptionActive,
    templates: templatesMap,
    onUploadComplete: handleUploadComplete,
    onUploadError: handleUploadError,
    onExpiredDocumentUploaded: handleExpiredDocumentUploaded,
  });

  /**
   * Processing callbacks
   * Receives full Document object and calls addDocument (full replacement, not partial merge)
   */
  const handleProcessingComplete = (document: Document) => {
    console.log("AI processing status updated:", document.documentLogsId, document.status);
    // EXACT SAME as handleUploadComplete - call addDocument with full document
    addDocument(document);
  };

  const handleProcessingError = (documentId: string, error: string) => {
    console.error("AI processing error:", documentId, error);
  };

  const {
    triggerAIProcessing,
  } = useProcessingTracker({
    userContext,
    subscription,
    accessToken: session?.accessToken,
    onProcessingComplete: handleProcessingComplete,
    onProcessingError: handleProcessingError,
  });

  // ========== Polling ==========

  /**
   * Poll for updates only when:
   * 1. AI subscription is active
   * 2. There are processing documents
   */
  const shouldPoll = useMemo(() => {
    return (
      subscription.isChatSubscriptionActive &&
      hasProcessingDocuments(documents)
    );
  }, [subscription.isChatSubscriptionActive, documents]);

  usePolling({
    enabled: shouldPoll,
    interval: 1000 * 5, // 5 seconds
    onPoll: async () => {
      // Browser-safe partial refresh: updates extractionPercentage / status /
      // raraResponse / error on in-flight Processing docs via Apollo. Avoids
      // the server-only `sdk` path used by refreshDocuments, which throws
      // "Credential is missing" in the browser.
      await refreshProcessingDocuments();
    },
  });

  // ========== Document Deletion ==========

  /**
   * Handle delete completion callback
   * Called after deletion is confirmed and executed
   * 
   * Auto-navigation logic:
   * After documents refresh, check if we're on Expired tab with no expired documents
   * If so, navigate back to main view (all documents)
   */
  const handleDeleteComplete = async () => {
    // Refresh documents and get the fresh list
    const freshDocuments = await refreshDocuments();
    // Calculate expired count directly from fresh documents
    const freshExpiredCount = countExpiredDocuments(freshDocuments);
    
    // If on Expired tab and no expired documents remain, navigate to main view
    if (filters.showExpiredOnly && freshExpiredCount === 0) {
      setShowExpiredOnly(false);
    }
  };

  const { deleteDocument } = useDocumentDeletion({
    userContext,
    documents,
    templates: expandedTemplates, // Use expanded templates for finding document's template
    removeDocument,
    onDeleteComplete: handleDeleteComplete,
  });

  // ========== Event Handlers ==========

  const handleDrop = (templateId: string, files: File[]) => {
    console.log("[handleDrop] Called with:", templateId, files.map(f => f.name));

    // Find template (check both base and expanded templates)
    const template = expandedTemplates.find((t) => t.id === templateId);
    if (!template) {
      console.error("[handleDrop] Template not found:", templateId);
      return;
    }

    // If dropping on "Any Other" template, we need to use the base template ID
    // because the upload manager expects base template IDs, not temp template IDs
    let uploadTemplateId = templateId;
    if (template.isOther && templateId.startsWith("custom-temp-")) {
      // This is a temp template, find the base "Any Other" template
      const baseOtherTemplate = templates.find((t) => t.isOther);
      if (baseOtherTemplate) {
        uploadTemplateId = baseOtherTemplate.id;
      }
    }

    uploadFiles(
      uploadTemplateId,
      files,
      template.acceptedFormats,
      template.maxSize
    );
  };

  const handleDelete = async (documentId: string) => {
    // Show confirmation modal and execute deletion
    // Auto-navigation happens in handleDeleteComplete after refresh completes
    await deleteDocument(documentId);
  };

  /**
   * Handle AI processing
   */
  const handleProcessWithAI = async (documentId: string) => {
    const document = documents.find((d) => d.documentLogsId === documentId);
    if (!document) return;

    await triggerAIProcessing(document);
    // Refresh to get updated status
    await refreshDocuments();
  };

  // ========== Derived Data ==========

  /**
   * Sort and filter templates based on current view
   * Uses expanded templates (includes temp templates for "Other" documents)
   * 
   * When showExpiredOnly is true:
   * - Only display templates that have expired documents
   * When showExpiredOnly is false:
   * - Only display templates that DON'T have expired documents
   * This ensures proper bifurcation between main and expired tabs
   */
  const displayTemplates = useMemo(() => {
    let templatesToDisplay = expandedTemplates;

    // Get templates with expired documents
    const expiredTemplates = getTemplatesWithExpiredDocuments(documents, expandedTemplates);
    const expiredTemplateIds = new Set(expiredTemplates.map(t => t.id));

    if (filters.showExpiredOnly) {
      // Expired tab: Show ONLY templates with expired documents
      templatesToDisplay = expiredTemplates;
    } else {
      // Main view: EXCLUDE templates with expired documents
      templatesToDisplay = expandedTemplates.filter(t => !expiredTemplateIds.has(t.id));
    }

    // Apply search filter
    const filtered = searchTemplates(templatesToDisplay, filters.searchTerm);
    
    // Sort by sequence
    return sortTemplatesBySequence(filtered);
  }, [expandedTemplates, filters.showExpiredOnly, filters.searchTerm, documents]);

  /**
   * Calculate main view count (non-expired templates, before search filter)
   * This is used for the "View All X Documents" button count
   */
  const mainViewCount = useMemo(() => {
    // Get non-expired templates (inverse of expired templates)
    const expiredTemplates = getTemplatesWithExpiredDocuments(documents, expandedTemplates);
    const expiredTemplateIds = new Set(expiredTemplates.map(t => t.id));
    
    // Count templates that are NOT in the expired set
    return expandedTemplates.filter(t => !expiredTemplateIds.has(t.id)).length;
  }, [documents, expandedTemplates]);

  /**
   * Calculate dynamic heading text based on AI features and view context
   * Business logic: AI users get AI-specific messaging, expired view shows different text
   * Uses tracked newExpiredCount from useDocumentFilters for badge-aware messaging
   */
  const headingText = useMemo(() => {
    // Check if AI features are enabled via subscription status (more reliable than metadata)
    const isAIEnabled = subscription.isChatSubscriptionActive;
    
    return calculateHeadingText(isAIEnabled, filters.showExpiredOnly, newExpiredCount);
  }, [subscription.isChatSubscriptionActive, filters.showExpiredOnly, newExpiredCount]);

  /**
   * Convert upload progress map for UI consumption
   */
  const uploadProgressByDocId = useMemo(() => {
    const map = new Map<string, number>();
    uploadProgress.forEach((progress, docId) => {
      map.set(docId, progress.progress);
    });
    return map;
  }, [uploadProgress]);

  // ========== Render ==========

  return (
    <Container fluid px={5} bg="transparent">
      <DocumentGrid
        templates={displayTemplates}
        documentsByTemplate={filteredDocuments}
        uploadProgress={uploadProgressByDocId}
        subscription={subscription}
        companyMetadata={companyMetadata}
        searchTerm={filters.searchTerm}
        showExpiredOnly={filters.showExpiredOnly}
        expiredCount={expiredCount}
        mainViewCount={mainViewCount}
        headingText={headingText}
        newExpiredCount={newExpiredCount}
        hasViewedExpiredTab={hasViewedExpiredTab}
        onSearchChange={setSearchTerm}
        onToggleExpiredView={toggleExpiredView}
        onDrop={handleDrop}
        onDelete={handleDelete}
        onProcessWithAI={handleProcessWithAI}
      />
    </Container>
  );
}

// ========== Server-Side Rendering ==========

// Note: This component is designed to receive props from parent page
// The parent page (apps/web/pages/document-repository.tsx) handles
//