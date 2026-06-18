/**
 * Domain Types - Framework-agnostic type definitions
 * 
 * These types represent the core domain model for documents.
 * No React, no hooks, no side effects.
 * 
 * IMPORTANT: Status values MUST match database values exactly (case-sensitive)
 * Database schema: public."DocumentLogs".status
 * Valid values: Pending, Uploading, Uploaded, Processing, Processed, UploadError, ProcessingError, Deleted
 */

export enum DocumentStatus {
    Idle = "idle", // UI-only state, not stored in database
    Pending = "Pending", // Database value
    Uploading = "Uploading", // Database value
    Uploaded = "Uploaded", // Database value
    Processing = "Processing", // Database value
    Processed = "Processed", // Database value (complete state)
    UploadError = "UploadError", // Database value
    ProcessingError = "ProcessingError", // Database value
    Deleted = "Deleted", // Database value
}

export enum ExpiryStatus {
    Valid = "Valid",
    ExpiringSoon = "Expiring Soon",
    Expired = "Expired",
}

export interface RaraResponse {
    document_rating: number | null;
    recommendations: string[];
    reason_for_rating: string;
}

export interface DocumentError {
    error: string;
    warning: string;
}

export interface DocumentMetadata {
    Location?: string;
    [key: string]: any;
}

/**
 * Core Document entity
 */
export interface Document {
    id: string;
    documentLogsId: string;
    aiSuggestedDocumentId: string;
    title: string;
    fileName: string;
    originalFileName: string;
    fileUrl: string;
    fileSize: number;
    status: DocumentStatus;
    error: DocumentError | null;
    metadata: DocumentMetadata | null;

    // Processing-related
    processingMessage?: string;
    extractionPercentage?: number | string | null;

    // AI-related
    raraResponse?: RaraResponse | null;

    // Expiry-related
    expiryDate?: string | null;

    // System-generated
    createdBy: string | null;
    uploadedFromInvitationId?: string | null;

    // Timestamps
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string | null;
    deletedBy?: string | null;
}

/**
 * Document Template (AI Suggested Document)
 */
export interface DocumentTemplate {
    id: string;
    title: string;
    sampleFileUrl?: string;
    acceptedFormats: string[];
    maxSize: number;
    isOther: boolean;
    seqIndex: number;
    warning?: string;
    masterDocumentKey?: string; // For RARA document rating
}

/**
 * Upload progress tracking
 */
export interface UploadProgress {
    documentId: string;
    fileName: string;
    progress: number; // 0-100
    status: DocumentStatus;
    error?: string;
}

/**
 * User context
 */
export interface UserContext {
    userId: string;
    companyId: string;
}

/**
 * Subscription status
 */
export interface SubscriptionStatus {
    isChatSubscriptionActive: boolean;
}

/**
 * Filter options
 */
export interface DocumentFilters {
    showExpiredOnly: boolean;
    searchTerm: string;
}

/**
 * Duplicate file info
 */
export interface DuplicateFileInfo {
    title: string;
    originalFileName: string;
    documentLogsId: string;
    documentId?: string;
}

/**
 * Rejected file info
 */
export interface RejectedFile {
    file: File;
    rejectionMessage: string;
}
