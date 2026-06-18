/**
 * Domain Selectors - Derived data helpers
 * 
 * Pure functions that compute derived state from domain models.
 * No React, no hooks, no side effects.
 */

import {
    countExpiredDocuments,
    filterDocuments,
    isDocumentExpired,
    isProcessing,
    isSystemGenerated
} from "./document.rules";
import {
    Document,
    DocumentFilters,
    DocumentStatus,
    DocumentTemplate,
} from "./document.types";

/**
 * Group documents by template ID
 */
export function groupDocumentsByTemplate(
    documents: Document[]
): Map<string, Document[]> {
    const grouped = new Map<string, Document[]>();

    documents.forEach((doc) => {
        const templateId = doc.aiSuggestedDocumentId;
        if (!grouped.has(templateId)) {
            grouped.set(templateId, []);
        }
        grouped.get(templateId)!.push(doc);
    });

    return grouped;
}

/**
 * Get the latest document for each template slot
 * Used to determine what to display in each dropzone
 * 
 * Handles temporary templates for "Other" documents:
 * - Maps "Other" documents to their temp template IDs ONLY
 * - Excludes "Other" documents from base "Other Documents" template
 * - Regular documents use their aiSuggestedDocumentId
 * 
 * Two-pass algorithm:
 * 1. First pass: Map documents to temp templates (if temp template exists)
 * 2. Second pass: Map remaining documents to base templates (excluding those with temp templates)
 */
export function getLatestDocumentPerTemplate(
    documents: Document[],
    templates: DocumentTemplate[]
): Map<string, Document | null> {
    const result = new Map<string, Document | null>();

    // Initialize all templates with null
    templates.forEach((template) => {
        result.set(template.id, null);
    });

    // Track which documents have been assigned to temp templates
    const documentsWithTempTemplates = new Set<string>();

    // FIRST PASS: Map "Other" documents to their temp templates
    documents.forEach((doc) => {
        const tempTemplateId = `custom-temp-${doc.documentLogsId}`;
        const hasTempTemplate = templates.some((t) => t.id === tempTemplateId);

        if (hasTempTemplate) {
            // This document has a temp template
            result.set(tempTemplateId, doc);
            documentsWithTempTemplates.add(doc.documentLogsId);
        }
    });

    // Group regular documents by their template ID
    const grouped = groupDocumentsByTemplate(documents);

    // SECOND PASS: For each base template, find the most recent non-deleted document
    // EXCLUDE documents that have temp templates (already mapped above)
    templates.forEach((template) => {
        // Skip temp templates (already processed)
        if (template.id.startsWith("custom-temp-")) return;

        const docs = grouped.get(template.id) || [];

        // Filter out documents that have been assigned to temp templates
        const availableDocs = docs.filter(
            (doc) => !documentsWithTempTemplates.has(doc.documentLogsId)
        );

        const validDocs = availableDocs
            .filter((doc) => doc.status !== DocumentStatus.Deleted)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const selectedDoc = validDocs[0] || null;
        result.set(template.id, selectedDoc);
    });

    return result;
}

/**
 * Get documents that match filters
 * 
 * CRITICAL: Must preserve template-to-document mapping from getLatestDocumentPerTemplate
 * For "Other" documents, the mapping is template.id (temp) → document (with base aiSuggestedDocumentId)
 * DO NOT try to rebuild mapping using aiSuggestedDocumentId - it will break temp templates!
 */
export function getFilteredDocuments(
    documents: Document[],
    templates: DocumentTemplate[],
    filters: DocumentFilters
): Map<string, Document | null> {
    const latestPerTemplate = getLatestDocumentPerTemplate(documents, templates);

    // Apply filters to each template's document while preserving the mapping
    const result = new Map<string, Document | null>();

    templates.forEach((template) => {
        const doc = latestPerTemplate.get(template.id);

        if (!doc) {
            // No document for this template
            result.set(template.id, null);
            return;
        }

        // Check if this document passes the filters
        const matchesFilters = filterDocuments([doc], filters).length > 0;

        // Preserve the template mapping, only include doc if it matches filters
        result.set(template.id, matchesFilters ? doc : null);
    });

    return result;
}

/**
 * Get expired documents (only truly expired, not expiring soon)
 */
export function getExpiredDocuments(documents: Document[]): Document[] {
    return documents.filter(isDocumentExpired);
}

/**
 * Get system-generated documents
 */
export function getSystemGeneratedDocuments(documents: Document[]): Document[] {
    return documents.filter(isSystemGenerated);
}

/**
 * Get processing documents
 */
export function getProcessingDocuments(documents: Document[]): Document[] {
    return documents.filter(isProcessing);
}

/**
 * Get templates that have expired documents (only truly expired, not expiring soon)
 */
export function getTemplatesWithExpiredDocuments(
    documents: Document[],
    templates: DocumentTemplate[]
): DocumentTemplate[] {
    const latestPerTemplate = getLatestDocumentPerTemplate(documents, templates);

    return templates.filter((template) => {
        const doc = latestPerTemplate.get(template.id);
        return doc && isDocumentExpired(doc);
    });
}

/**
 * Get templates that have system-generated documents
 */
export function getTemplatesWithSystemGeneratedDocuments(
    documents: Document[],
    templates: DocumentTemplate[]
): DocumentTemplate[] {
    const latestPerTemplate = getLatestDocumentPerTemplate(documents, templates);

    return templates.filter((template) => {
        const doc = latestPerTemplate.get(template.id);
        return doc && isSystemGenerated(doc);
    });
}

/**
 * Calculate document statistics
 */
export interface DocumentStatistics {
    total: number;
    uploaded: number;
    processing: number;
    complete: number;
    expired: number;
    systemGenerated: number;
    errors: number;
}

export function calculateDocumentStatistics(
    documents: Document[]
): DocumentStatistics {
    const validDocs = documents.filter((doc) => doc.status !== DocumentStatus.Deleted);

    return {
        total: validDocs.length,
        uploaded: validDocs.filter((doc) => doc.status === DocumentStatus.Uploaded).length,
        processing: validDocs.filter((doc) => doc.status === DocumentStatus.Processing).length,
        complete: validDocs.filter((doc) => doc.status === DocumentStatus.Processed).length,
        expired: countExpiredDocuments(validDocs),
        systemGenerated: validDocs.filter(isSystemGenerated).length,
        errors: validDocs.filter(
            (doc) =>
                doc.status === DocumentStatus.UploadError ||
                doc.status === DocumentStatus.ProcessingError
        ).length,
    };
}

/**
 * Sort templates by sequence index
 */
export function sortTemplatesBySequence(
    templates: DocumentTemplate[]
): DocumentTemplate[] {
    return [...templates].sort((a, b) => a.seqIndex - b.seqIndex);
}

/**
 * Get templates filtered by search term
 */
export function searchTemplates(
    templates: DocumentTemplate[],
    searchTerm: string
): DocumentTemplate[] {
    if (!searchTerm) return templates;

    const term = searchTerm.toLowerCase();
    return templates.filter((template) =>
        template.title.toLowerCase().includes(term)
    );
}

/**
 * Create temporary template for an "Other" document
 * 
 * Each uploaded "Other" document gets its own card (temp template) to display separately from the base template.
 * 
 * SEQUENCING LOGIC:
 * - Uses fractional seqIndex to position temp cards immediately after base "Other Documents" card
 * - Base template: seqIndex = 1
 * - First temp:    seqIndex = 1.001
 * - Second temp:   seqIndex = 1.002
 * - Third temp:    seqIndex = 1.003
 * - Next base:     seqIndex = 2 (Annual Report, CSR, etc.)
 * 
 * Why fractional? Prevents conflicts with base template seqIndex values (2, 3, 4...)
 * All temp cards cluster together after base "Other Documents" without interleaving with other base templates.
 */
export function createTempTemplateForOtherDocument(
    document: Document,
    baseOtherTemplate: DocumentTemplate,
    index: number
): DocumentTemplate {
    const tempId = `custom-temp-${document.documentLogsId}`;

    // Calculate fractional seqIndex: base + 0.001, 0.002, 0.003, etc.
    const fractionalIndex = (index + 1) * 0.001;
    const seqIndex = baseOtherTemplate.seqIndex + fractionalIndex;

    return {
        id: tempId,
        title: document.originalFileName || document.fileName || "Untitled",
        sampleFileUrl: baseOtherTemplate.sampleFileUrl,
        acceptedFormats: baseOtherTemplate.acceptedFormats,
        maxSize: baseOtherTemplate.maxSize,
        isOther: true,
        seqIndex,
        warning: baseOtherTemplate.warning,
        masterDocumentKey: baseOtherTemplate.masterDocumentKey,
    };
}

/**
 * Expand template list with temporary templates for "Other" documents
 * 
 * HOW "ANY OTHER" CARD WORKS:
 * --------------------------
 * 1. Base "Other Documents" card (seqIndex = 1) accepts new uploads
 * 2. Each uploaded file creates a NEW temporary card with the file's data
 * 3. Temp cards appear immediately after base card using fractional seqIndex (1.001, 1.002, 1.003...)
 * 4. Base card remains empty and ready for next upload
 * 
 * EXAMPLE CARD SEQUENCE:
 * - "Other Documents" (base, seqIndex: 1) ← empty, ready for uploads
 * - "NewReport.pdf" (temp, seqIndex: 1.001) ← NEWEST uploaded file (just uploaded)
 * - "Report.pdf" (temp, seqIndex: 1.002) ← second newest
 * - "Policy.pdf" (temp, seqIndex: 1.003) ← older upload
 * - "Data.csv" (temp, seqIndex: 1.004) ← oldest upload
 * - "Annual Report" (base, seqIndex: 2)
 * - "CSR Report" (base, seqIndex: 3)
 * 
 * SEQUENCING BEHAVIOR:
 * - Newest uploads always get the lowest fractional index (1.001)
 * - Existing "Other" documents are automatically pushed down (1.002, 1.003, etc.)
 * - This ensures recently uploaded files appear first, closest to the base "Other Documents" card
 * 
 * TEMP TEMPLATE DETAILS:
 * - ID format: "custom-temp-{documentLogsId}"
 * - Title: Original filename
 * - Sorted by createdAt (NEWEST first)
 * - Inherits acceptedFormats, maxSize from base template
 * 
 * @param baseTemplates - Templates from database
 * @param documents - All documents (including "Other" documents)
 * @returns Expanded list: base templates + temp templates, sorted by seqIndex
 */
export function expandTemplatesWithOtherDocuments(
    baseTemplates: DocumentTemplate[],
    documents: Document[]
): DocumentTemplate[] {
    // Find the base "Any Other" template
    const baseOtherTemplate = baseTemplates.find((t) => t.isOther);

    if (!baseOtherTemplate) {
        // No "Any Other" template exists, return base templates as-is
        return baseTemplates;
    }

    // Find all "Other" documents (documents associated with "Any Other" template)
    const otherDocuments = documents.filter(
        (doc) => doc.aiSuggestedDocumentId === baseOtherTemplate.id
    );

    // Sort by creation date (NEWEST first) - newest uploads appear closest to base template
    // This ensures newly uploaded files always get lower fractional indexes (1.001)
    // and push older documents down (1.002, 1.003, etc.)
    const sortedOtherDocuments = otherDocuments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Create temp templates for each "Other" document
    const tempTemplates = sortedOtherDocuments.map((doc, index) =>
        createTempTemplateForOtherDocument(doc, baseOtherTemplate, index)
    );

    // Combine: base templates + temp templates, then sort by seqIndex
    const expanded = [...baseTemplates, ...tempTemplates];
    const sorted = sortTemplatesBySequence(expanded);

    return sorted;
}

/**
 * Map "Other" documents to their temporary template IDs
 * Used to associate uploaded "Other" files with their temp templates
 */
export function mapOtherDocumentsToTempTemplates(
    documents: Document[],
    expandedTemplates: DocumentTemplate[]
): Map<string, string> {
    const mapping = new Map<string, string>();

    documents.forEach((doc) => {
        // Find the temp template for this document
        const tempTemplate = expandedTemplates.find(
            (t) => t.id === `custom-temp-${doc.documentLogsId}`
        );

        if (tempTemplate) {
            mapping.set(doc.documentLogsId, tempTemplate.id);
        }
    });

    return mapping;
}

/**
 * Select latest system-generated documents per unique form
 * 
 * Filters system-generated documents to show only the most recent one per form.
 * This prevents duplicate system-generated reports from the same form appearing in the UI.
 * 
 * Business Rules:
 * - Only system-generated documents (createdBy === null)
 * - Only non-deleted documents (status !== Deleted)
 * - Only documents with uploadedFromInvitationId
 * - Group by actual Form ID (from invitationToFormMap)
 * - Return latest document per form (by createdAt)
 * 
 * @param documents - All documents
 * @param invitationToFormMap - Mapping of invitationId -> formId
 * @returns Array of latest system-generated documents per form
 * 
 * @example
 * const invitationToFormMap = { 'inv-1': 'form-1', 'inv-2': 'form-1', 'inv-3': 'form-2' };
 * const filtered = selectLatestSystemGeneratedPerForm(documents, invitationToFormMap);
 * // Returns: [latestDoc for form-1, latestDoc for form-2]
 */
export function selectLatestSystemGeneratedPerForm(
    documents: Document[],
    invitationToFormMap: Record<string, string>
): Document[] {
    // Filter system-generated documents with invitation IDs
    const systemGeneratedDocs = documents.filter(
        (doc) =>
            doc.createdBy === null && // System generated (no user created it)
            doc.status !== DocumentStatus.Deleted && // Not deleted
            doc.uploadedFromInvitationId !== null && // Has an associated form invitation
            doc.uploadedFromInvitationId !== undefined
    );

    if (systemGeneratedDocs.length === 0) {
        return [];
    }

    // Group documents by actual Form ID
    const latestByFormId: Record<string, Document> = {};

    systemGeneratedDocs.forEach((doc) => {
        const formId = invitationToFormMap[doc.uploadedFromInvitationId!];

        if (!formId) return; // Skip if no form mapping available

        // Keep the latest document for each unique form (by createdAt)
        if (
            !latestByFormId[formId] ||
            new Date(doc.createdAt) > new Date(latestByFormId[formId].createdAt)
        ) {
            latestByFormId[formId] = doc;
        }
    });

    return Object.values(latestByFormId);
}

/**
 * Merge non-system-generated documents with latest system-generated per form
 * 
 * Combines user-uploaded documents with filtered system-generated documents
 * to ensure only one system-generated report per form appears in the UI.
 * 
 * @param documents - All documents
 * @param invitationToFormMap - Mapping of invitationId -> formId
 * @returns Merged array of documents
 */
export function mergeWithLatestSystemGenerated(
    documents: Document[],
    invitationToFormMap: Record<string, string>
): Document[] {
    // Separate non-system-generated documents
    const nonSystemGenerated = documents.filter(
        (doc) => doc.createdBy !== null || doc.uploadedFromInvitationId === null
    );

    // Get latest system-generated per form
    const latestSystemGenerated = selectLatestSystemGeneratedPerForm(
        documents,
        invitationToFormMap
    );

    // Merge both arrays
    return [...nonSystemGenerated, ...latestSystemGenerated];
}