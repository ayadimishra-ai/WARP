/**
 * useTemplateManager Hook - Template list management
 * 
 * Responsibilities:
 * - Expand template list with temporary templates for "Other" documents
 * - Handle template list transformations
 * 
 * Business Logic:
 * - "Any Other" card supports bulk uploads
 * - Each uploaded "Other" file gets its own card (temp template)
 * - On page load, create temp template for each existing "Other" document
 * 
 * Rules:
 * - Pure state transformation (useMemo)
 * - No side effects
 * - Domain logic delegation
 */

import { useMemo } from "react";
import { expandTemplatesWithOtherDocuments } from "../domain/document.selectors";
import { Document, DocumentTemplate } from "../domain/document.types";

interface UseTemplateManagerProps {
    baseTemplates: DocumentTemplate[];
    documents: Document[];
}

interface UseTemplateManagerReturn {
    expandedTemplates: DocumentTemplate[];
}

export function useTemplateManager({
    baseTemplates,
    documents,
}: UseTemplateManagerProps): UseTemplateManagerReturn {
    /**
     * Expand templates with temporary templates for "Other" documents
     * 
     * Memoized to prevent unnecessary recalculations
     * Recalculates when:
     * - Base templates change (rarely, only on SSR or template config change)
     * - Documents change (on upload, delete, refresh)
     */
    const expandedTemplates = useMemo(() => {
        return expandTemplatesWithOtherDocuments(baseTemplates, documents);
    }, [baseTemplates, documents]);

    return {
        expandedTemplates,
    };
}
