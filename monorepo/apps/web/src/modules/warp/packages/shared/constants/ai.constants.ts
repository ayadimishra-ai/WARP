import { DocumentType, DocumentTypeColorMap, DocumentTypeLabelMap } from '../types/ai.types';

// Document Type Color Constants
export const DOCUMENT_TYPE_COLORS: DocumentTypeColorMap = {
    [DocumentType.ESG_DOCUMENTS]: '#8FE8AD', // Light green for ESG documents
    [DocumentType.BRSR_DOCUMENTS]: '#8EDAF9', // Light blue for BRSR documents
    [DocumentType.DOCUMENT_REPO]: '#FFD39C', // Light orange/beige for document repository
};

// Document Type Label Constants
export const DOCUMENT_TYPE_LABELS: DocumentTypeLabelMap = {
    [DocumentType.ESG_DOCUMENTS]: 'ESG Report',
    [DocumentType.BRSR_DOCUMENTS]: 'BRSR Report',
    [DocumentType.DOCUMENT_REPO]: 'Document Repository',
};

// Default color for unknown document types
export const DEFAULT_DOCUMENT_COLOR = '#F28B82'; // Default light red color

// Export utility functions
export const getSourceColor = (documentType: string): string => {
    const docType = documentType as DocumentType;
    return DOCUMENT_TYPE_COLORS[docType] || DEFAULT_DOCUMENT_COLOR;
};

export const getDocumentTypeLabel = (documentType: string): string => {
    const docType = documentType as DocumentType;
    return DOCUMENT_TYPE_LABELS[docType] || documentType.toUpperCase();
};

// Notification type constants for metadata logging
export const NOTIFICATION_TYPES = {
    USER_LIMIT_EXCEEDED: 'user_limit_exceeded',
    COMPANY_LIMIT_EXCEEDED: 'company_limit_exceeded',
} as const;

// Email status constants for metadata logging
export const EMAIL_STATUS = {
    SENT: 'sent',
    FAILED: 'failed',
} as const;

// Data Source Type Constants
export const DATA_SOURCE_TYPES = {
    ESG_DOCUMENTS: 'esg_documents',
    BRSR_DOCUMENTS: 'brsr_documents',
    COMPANY_DOCUMENTS: 'company_documents',
} as const;

// Query Type Constants
export const QUERY_TYPES = {
    TEXTUAL: 'textual',
    GRAPHICAL: 'graphical',
} as const;

// Message Role Constants
export const MESSAGE_ROLES = {
    USER: 'user',
    ASSISTANT: 'assistant',
} as const;

// Message Type Constants  
export const MESSAGE_TYPES = {
    USER: 'user',
    ASSISTANT: 'assistant',
} as const;

// Document Status Constants
export const DOCUMENT_STATUS = {
    UPLOADED: 'Uploaded',
    PROCESSED: 'Processed',
    PROCESSING: 'Processing',
} as const;

// GraphQL Query Filters
export const DOCUMENT_FILTERS = {
    STATUS_UPLOADED: { _eq: DOCUMENT_STATUS.UPLOADED },
    STATUS_PROCESSED_AND_PROCESSING: {
        _in: [DOCUMENT_STATUS.PROCESSED, DOCUMENT_STATUS.PROCESSING],
    },
};
