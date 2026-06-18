/**
 * Domain Rules - Pure business logic functions
 * 
 * All business rules are isolated here as pure functions.
 * No React, no hooks, no side effects, fully testable.
 */

import {
    Document,
    DocumentFilters,
    DocumentStatus,
    DocumentTemplate,
    ExpiryStatus,
    SubscriptionStatus,
} from "./document.types";

/**
 * Calculate expiry status for a given date string
 * 
 * @param dateString - ISO date string (YYYY-MM-DD format)
 * @returns ExpiryStatus enum value
 */
export function calculateExpiryStatus(dateString: string | null): ExpiryStatus | null {
    if (!dateString) return null;

    try {
        // Remove time component if present
        const cleanDateString = dateString.includes("T")
            ? dateString.split("T")[0]
            : dateString;

        // Parse YYYY-MM-DD format
        const parts = cleanDateString.split("-").map((num) => parseInt(num, 10));
        if (parts.length !== 3) {
            throw new Error("Invalid date format - expected YYYY-MM-DD");
        }

        const [expiryYear, expiryMonth, expiryDay] = parts;

        // Validate parsed values
        if (
            expiryMonth < 1 ||
            expiryMonth > 12 ||
            expiryDay < 1 ||
            expiryDay > 31
        ) {
            throw new Error("Invalid date values");
        }

        // Get current date components
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        // Create proper Date objects for accurate comparison
        const expiryDate = new Date(expiryYear, expiryMonth - 1, expiryDay);
        const currentDate = new Date(currentYear, currentMonth - 1, currentDay);

        // Calculate difference in days
        const timeDiff = expiryDate.getTime() - currentDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Document expires the day AFTER expiry date
        if (daysDiff < 0) return ExpiryStatus.Expired;
        if (daysDiff <= 30) return ExpiryStatus.ExpiringSoon;
        return ExpiryStatus.Valid;
    } catch (error) {
        console.error("Error parsing expiry date:", dateString, error);
        return null;
    }
}

/**
 * Check if a document is expired or expiring soon
 */
export function isDocumentExpiring(document: Document): boolean {
    if (!document.expiryDate) return false;

    const status = calculateExpiryStatus(document.expiryDate);
    return status === ExpiryStatus.Expired || status === ExpiryStatus.ExpiringSoon;
}

/**
 * Check if a document is expired (not just expiring)
 */
export function isDocumentExpired(document: Document): boolean {
    if (!document.expiryDate) return false;

    const status = calculateExpiryStatus(document.expiryDate);
    return status === ExpiryStatus.Expired;
}

/**
 * Check if a document is system-generated
 */
export function isSystemGenerated(document: Document): boolean {
    return (
        document.createdBy === null &&
        document.uploadedFromInvitationId !== null &&
        document.status !== DocumentStatus.Deleted
    );
}

/**
 * Check if a document is currently being processed
 */
export function isProcessing(document: Document): boolean {
    return document.status === DocumentStatus.Processing;
}

/**
 * Check if a document is eligible for AI processing
 */
export function canProcessWithAI(
    document: Document,
    subscription: SubscriptionStatus
): boolean {
    // Must have active subscription
    if (!subscription.isChatSubscriptionActive) return false;

    // Must be in uploaded state or processing error (retry mechanism)
    if (document.status !== DocumentStatus.Uploaded &&
        document.status !== DocumentStatus.ProcessingError) return false;

    // Must have valid file URL (metadata.Location is constructed in UI layer from fileUrl)
    if (!document.fileUrl) return false;

    // Cannot be expired or expiring
    if (isDocumentExpiring(document)) return false;

    // Cannot be system-generated (unless it's a retry for processing error)
    if (isSystemGenerated(document) && document.status !== DocumentStatus.ProcessingError) {
        return false;
    }

    return true;
}

/**
 * Check if a document can be uploaded
 */
export function canUploadToSlot(document: Document | null): boolean {
    // Empty slot is uploadable
    if (!document) return true;

    // Cannot upload if system-generated
    if (document && isSystemGenerated(document)) return false;

    // Cannot upload if expired/expiring
    if (document && isDocumentExpiring(document)) return false;

    // Cannot upload if currently uploading/processing
    if (
        document &&
        (document.status === DocumentStatus.Uploading ||
            document.status === DocumentStatus.Processing)
    ) {
        return false;
    }

    return false; // Slot already occupied
}

/**
 * Check if a document can be deleted
 */
export function canDelete(document: Document): boolean {
    // Cannot delete if system-generated
    if (isSystemGenerated(document)) return false;

    // Cannot delete if already deleted
    if (document.status === DocumentStatus.Deleted) return false;

    // Cannot delete if currently uploading
    if (document.status === DocumentStatus.Uploading) return false;

    return true;
}

/**
 * Check if upload is stale (left in uploading state too long)
 * Used for cleanup on page refresh
 */
export function isStaleUpload(document: Document, thresholdMinutes: number = 30): boolean {
    if (document.status !== DocumentStatus.Uploading) return false;

    const createdAt = new Date(document.createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    return diffMinutes > thresholdMinutes;
}

/**
 * Validate file type against accepted formats
 */
export function isValidFileType(file: File, acceptedFormats: string[]): boolean {
    if (!acceptedFormats || acceptedFormats.length === 0) return true;

    const MIME_TYPES: Record<string, string> = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    const acceptedMimeTypes = acceptedFormats.map(
        (format) => MIME_TYPES[format.toLowerCase()]
    );

    return acceptedMimeTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

/**
 * Format expiry date for display
 */
export function formatExpiryDate(expiryDate: string): string {
    const date = new Date(expiryDate);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    const year = date.getFullYear();

    const ordinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return "th";
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    return `${day}${ordinalSuffix(day)} ${month} ${year}`;
}

/**
 * Filter documents based on criteria
 */
export function filterDocuments(
    documents: Document[],
    filters: DocumentFilters
): Document[] {
    let filtered = documents;

    // Filter by expiry status
    if (filters.showExpiredOnly) {
        // Expired tab: Show ONLY expired documents (past expiry date, not just expiring soon)
        filtered = filtered.filter(isDocumentExpired);
    } else {
        // Main view: EXCLUDE expired documents (but INCLUDE expiring soon with warning)
        filtered = filtered.filter(doc => !isDocumentExpired(doc));
    }

    // Filter by search term
    if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(
            (doc) =>
                doc.title.toLowerCase().includes(term) ||
                doc.originalFileName.toLowerCase().includes(term)
        );
    }

    return filtered;
}

/**
 * Count expired documents (only truly expired, not expiring soon)
 */
export function countExpiredDocuments(documents: Document[]): number {
    return documents.filter(isDocumentExpired).length;
}

/**
 * Check if any documents are currently processing
 */
export function hasProcessingDocuments(documents: Document[]): boolean {
    return documents.some(isProcessing);
}

/**
 * Calculate heading text based on AI features and view context
 * 
 * Business logic ported from V1:
 * - AI users get AI-specific messaging
 * - Non-AI users get generic document management messaging
 * - Expired view shows different text than main view
 * - New expired count shows in expired view for AI users
 * 
 * @param isAIEnabled - Whether user has AI features enabled
 * @param showExpiredOnly - Whether currently viewing expired documents
 * @param newExpiredCount - Count of newly detected expired documents (optional)
 * @returns Object with mainHeading and subHeading text
 */
export function calculateHeadingText(
    isAIEnabled: boolean,
    showExpiredOnly: boolean,
    newExpiredCount: number = 0
): { mainHeading: string; subHeading: string } {
    if (isAIEnabled) {
        if (showExpiredOnly) {
            return {
                mainHeading:
                    "Uploaded documents are no longer valid. Please upload an updated version so our AI can continue providing suggestions and pre-filled responses.",
                subHeading:
                    newExpiredCount > 0
                        ? `${newExpiredCount} new expired documents detected`
                        : "",
            };
        } else {
            return {
                mainHeading:
                    "Upload your company documents here. Our AI will use them to automatically provide suggestions and pre-fill your responses in all AI-enabled reports and assessments.",
                subHeading:
                    "AI can process .csv, .pdf, .xls, and .xlsx files. Please upload the recommended documents below.",
            };
        }
    } else {
        if (showExpiredOnly) {
            return {
                mainHeading:
                    "Review and manage all your company documents, including expired ones. Easily reference current documents while completing your responses.",
                subHeading:
                    "Upload fresh documents to replace expired ones. Both current and expired documents are shown for your review.",
            };
        } else {
            return {
                mainHeading:
                    "Upload your company documents here. Easily reference them while completing your responses.",
                subHeading: "Recommended documents to upload.",
            };
        }
    }
}

/**
 * Get processing documents count
 */
export function countProcessingDocuments(documents: Document[]): number {
    return documents.filter(isProcessing).length;
}

/**
 * Check if document is an "Other" document (uploaded to "Any Other" template)
 */
export function isOtherDocument(document: Document, templates: DocumentTemplate[]): boolean {
    const template = templates.find((t) => t.id === document.aiSuggestedDocumentId);
    return template?.isOther || false;
}

/**
 * Check if template is the "Any Other" template
 */
export function isOtherTemplate(template: DocumentTemplate): boolean {
    return template.isOther;
}

/**
 * Generate temporary template ID for "Other" documents
 * Format: custom-temp-{timestamp}-{index}
 */
export function generateTempTemplateId(index: number): string {
    return `custom-temp-${Date.now()}-${index}`;
}
