/**
 * useUploadManager Hook - Upload orchestration
 * 
 * Responsibilities:
 * - Accept files from UI
 * - Trigger uploads explicitly (event-driven)
 * - Track progress per file
 * - Notify completion via callbacks
 * - Post-upload processing (RARA, validation, AI parsing)
 * 
 * Rules:
 * - Event-driven (NO effect-driven uploads)
 * - No UI state
 * - No document fetching inside effects
 */

import { useApolloClient } from "@apollo/client";
import { DOCUMENT_VALIDATION_TYPES } from "@warp/shared/constants/app.constants";
import axios from "axios";
import { useState } from "react";
import {
    isDocumentExpired,
    isValidFileSize,
    isValidFileType,
} from "../domain/document.rules";
import {
    Document,
    DocumentStatus,
    RejectedFile,
    UploadProgress,
    UserContext,
} from "../domain/document.types";

interface TemplateMetadata {
    masterDocumentKey?: string;
    title: string;
}

interface CompanyMetadata {
    name: string;
    isRARAEnabled?: boolean;
    isDocumentValidationEnabled?: boolean;
    isDocumentValidityCheckEnabled?: boolean;
}

interface PostUploadProcessingResult {
    raraResponse?: {
        document_rating: number | null;
        recommendations: string[];
        reason_for_rating: string;
    } | null;
    expiryDate?: string | null;
    extractionPercentage?: number | null;
    validationWarning?: string;
    processingError?: string;
    status: DocumentStatus;
}

interface UseUploadManagerProps {
    userContext: UserContext;
    accessToken?: string; // For API auth
    companyMetadata?: CompanyMetadata; // Company settings for feature flags
    isChatSubscriptionActive?: boolean; // AI processing enabled
    templates?: Map<string, TemplateMetadata>; // Template metadata for RARA
    onUploadComplete?: (document: Document) => void;
    onUploadError?: (error: string, fileName: string) => void;
    onExpiredDocumentUploaded?: (count: number) => void; // Called when expired doc(s) uploaded
}

interface UseUploadManagerReturn {
    uploadProgress: Map<string, UploadProgress>;
    uploadFiles: (
        templateId: string,
        files: File[],
        acceptedFormats: string[],
        maxSizeMB: number
    ) => Promise<void>;
    cancelUpload: (documentId: string) => void;
    clearProgress: (documentId: string) => void;
}

export function useUploadManager({
    userContext,
    accessToken,
    companyMetadata,
    isChatSubscriptionActive,
    templates,
    onUploadComplete,
    onUploadError,
    onExpiredDocumentUploaded,
}: UseUploadManagerProps): UseUploadManagerReturn {
    const apolloClient = useApolloClient();
    const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(
        new Map()
    );

    /**
     * Upload a single file
     * @param file - File to upload
     * @param templateId - Template ID
     * @param documentId - Pre-generated document ID (for instant UI feedback)
     */
    const uploadSingleFile = async (file: File, templateId: string, documentId: string) => {
        console.log(`[uploadSingleFile] Starting:`, file.name, documentId);

        let realDocumentId: string | null = null; // Track real ID for error handling

        try {
            // Step 1: Create document log entry
            const newDocument = await createDocumentLog(
                file,
                templateId,
                userContext,
                apolloClient
            );

            // CRITICAL: Remap progress from temp ID to real document ID
            // This allows UI to show progress using document.documentLogsId
            realDocumentId = newDocument.documentLogsId;
            setUploadProgress((prev) => {
                const next = new Map(prev);
                const tempProgress = next.get(documentId);
                if (tempProgress) {
                    // Move progress from temp ID to real document ID
                    next.delete(documentId); // Remove temp ID
                    next.set(realDocumentId!, {
                        ...tempProgress,
                        documentId: realDocumentId!, // Update to real ID
                    });
                }
                return next;
            });

            console.log(`[uploadSingleFile] Remapped progress: ${documentId} → ${realDocumentId}`);

            // At this point, realDocumentId is guaranteed to be non-null (we just set it)
            const docId = realDocumentId as string;

            // CRITICAL: Add document to UI immediately so progress bar can be displayed
            // This ensures the UI shows the document card with "Uploading" status and progress bar
            console.log(`[uploadSingleFile] Adding document to UI with ID: ${docId}, status: Uploading`);
            onUploadComplete?.({
                ...newDocument,
                fileUrl: newDocument.fileUrl, // Temporary placeholder URL
                status: DocumentStatus.Uploading,
            });

            // Step 2: Upload file to S3 with progress tracking (now using real document ID)
            const { fileUrl, fileInfo } = await uploadToS3(
                file,
                userContext.companyId,
                (progress) => {//on progress callback, set upload progress
                    setUploadProgress((prev) => {
                        const next = new Map(prev);
                        const current = next.get(docId);
                        if (current) {
                            next.set(docId, {
                                ...current,
                                progress,
                            });
                        }
                        return next;
                    });
                },
                new AbortController().signal // Add signal parameter
            );

            // Step 3: Post-upload processing (RARA, validation, AI parsing): Based on the enabled features
            const processingResult = await postUploadProcessing(
                fileUrl,
                fileInfo,
                file.name,
                templateId,
                docId,
                {
                    userContext,
                    accessToken,
                    companyMetadata,
                    isChatSubscriptionActive,
                    templates,
                }
            );
            // Step 4: Update document log with file URL and processing results
            await updateDocumentLogWithFileUrl(
                docId,
                fileUrl,
                processingResult,
                apolloClient
            );

            // Create updated document with processing results
            const completedDocument: Document = {
                ...newDocument,
                fileUrl,
                status: processingResult.status,
                expiryDate: processingResult.expiryDate || null,
                error: (processingResult.validationWarning || processingResult.processingError)
                    ? {
                        warning: processingResult.validationWarning || "",
                        error: processingResult.processingError || ""
                    }
                    : null,
            };

            // Check if document is expired and notify via callback
            if (processingResult.expiryDate && isDocumentExpired(completedDocument)) {
                onExpiredDocumentUploaded?.(1); // Notify that one expired document was uploaded
            }

            // Update progress to complete
            setUploadProgress((prev) => {
                const next = new Map(prev);
                next.set(docId, {
                    documentId: docId,
                    fileName: file.name,
                    progress: 100,
                    status: processingResult.status,
                });
                return next;
            });

            // Notify completion
            console.log(`[uploadSingleFile] Updating document status to: ${processingResult.status}`);
            onUploadComplete?.(completedDocument);

            console.log(`[uploadSingleFile] Completed:`, file.name);
        } catch (error: any) {
            console.error("[uploadSingleFile] Failed:", error);

            // Use real document ID if we got that far, otherwise use temp ID
            const errorDocId = realDocumentId || documentId;

            // Update progress to error
            setUploadProgress((prev) => {
                const next = new Map(prev);
                next.set(errorDocId, {
                    documentId: errorDocId,
                    fileName: file.name,
                    progress: 0,
                    status: DocumentStatus.UploadError,
                    error: error.message || "Upload failed",
                });
                return next;
            });

            onUploadError?.(error.message || "Upload failed", file.name);
            throw error; // Re-throw so caller knows it failed
        }
    };

    /**
     * Upload files
     * 
     * CRITICAL: Sets upload progress IMMEDIATELY before starting uploads
     * This ensures UI shows "Uploading" status and progress bar instantly
     */
    const uploadFiles = async (
        templateId: string,
        files: File[],
        acceptedFormats: string[],
        maxSizeMB: number
    ) => {
        console.log('[uploadFiles] Called with:', templateId, files.map(f => f.name));

        // Validate files
        const { validFiles, rejectedFiles } = validateFiles(
            files,
            acceptedFormats,
            maxSizeMB
        );

        // Handle rejected files: call error callback
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach((rejected) => {
                onUploadError?.(rejected.rejectionMessage, rejected.file.name);
            });
        }

        // IMMEDIATE UI FEEDBACK: Pre-generate document IDs and set progress to 0
        // This makes the UI show "Uploading" status and progress bar instantly
        const fileDocumentMap = new Map<File, string>();
        validFiles.forEach((file) => {
            const documentId = generateTempDocumentId();
            fileDocumentMap.set(file, documentId);

            // Set initial progress immediately
            setUploadProgress((prev) => {
                const next = new Map(prev);
                next.set(documentId, {
                    documentId,
                    fileName: file.name,
                    progress: 0,
                    status: DocumentStatus.Uploading,
                });
                return next;
            });
        });

        console.log('[uploadFiles] Set initial progress for files:',
            Array.from(fileDocumentMap.entries()).map(([f, id]) => ({ name: f.name, id }))
        );

        // Upload valid files with pre-generated IDs
        //AITODO: This can be optimized with concurrency control
        for (const file of validFiles) {
            const documentId = fileDocumentMap.get(file)!;

            // Upload in background
            uploadSingleFile(file, templateId, documentId)
                .then(() => {
                    console.log('[uploadFiles] Upload completed:', file.name);
                })
                .catch((error) => {
                    console.error('[uploadFiles] Upload failed:', file.name, error);
                });
        }
    };

    return {
        uploadProgress,
        uploadFiles,
        cancelUpload: () => { }, // Simplified - not implemented
        clearProgress: () => { }, // Simplified - not implemented
    };
}

/**
 * Validate files against rules
 */
function validateFiles(
    files: File[],
    acceptedFormats: string[],
    maxSizeMB: number
): { validFiles: File[]; rejectedFiles: RejectedFile[] } {
    const validFiles: File[] = [];
    const rejectedFiles: RejectedFile[] = [];

    files.forEach((file) => {
        // Check size
        if (!isValidFileSize(file, maxSizeMB)) {
            rejectedFiles.push({
                file,
                rejectionMessage: `File is larger than ${maxSizeMB}MB`,
            });
            return;
        }

        // Check type
        if (!isValidFileType(file, acceptedFormats)) {
            rejectedFiles.push({
                file,
                rejectionMessage: `Invalid file format. Accepted formats are: ${acceptedFormats
                    .map((f) => `.${f}`)
                    .join(", ")}`,
            });
            return;
        }

        validFiles.push(file);
    });

    return { validFiles, rejectedFiles };
}

/**
 * Generate temporary document ID
 */
function generateTempDocumentId(): string {
    return `temp-${crypto.randomUUID()}`;
}

/**
 * Create document log entry in database
 */
async function createDocumentLog(
    file: File,
    templateId: string,
    userContext: UserContext,
    apolloClient: any
): Promise<Document> {
    const { Bulk_Insert_Document_LogFilesDocument: BULK_INSERT_DOCUMENT_LOG_FILES } = await import("@warp/graphql/mutations/generated/bulk-insert-document-logs-files");

    const uniqueId = `${crypto.randomUUID()}-0`;
    const payload = {
        originalFileName: file.name,
        fileUrl: uniqueId, // Temporary placeholder
        fileName: uniqueId,
        aiSuggestedDocumentId: templateId,
        createdBy: userContext.userId,
        fileSize: String(file.size),
        error: { warning: "", error: "" },
        status: DocumentStatus.Uploading,
        companyId: userContext.companyId,
    };

    const { data } = await apolloClient.mutate({
        mutation: BULK_INSERT_DOCUMENT_LOG_FILES,
        variables: {
            data: [payload], // Changed from 'objects' to 'data' to match GraphQL mutation parameter
        },
    });

    const newDoc = data?.insert_DocumentLogs?.returning?.[0];
    if (!newDoc) {
        throw new Error("Failed to create document log");
    }

    return {
        id: newDoc.id,
        documentLogsId: newDoc.id,
        aiSuggestedDocumentId: templateId,
        title: file.name,
        fileName: uniqueId,
        originalFileName: file.name,
        fileUrl: uniqueId,
        fileSize: file.size,
        status: DocumentStatus.Uploading,
        error: null,
        metadata: null,
        createdBy: userContext.userId,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Upload file to S3 with progress tracking
 */
async function uploadToS3(
    file: File,
    companyId: string,
    onProgress: (progress: number) => void,
    signal: AbortSignal
): Promise<{ fileUrl: string; fileInfo: any }> {
    // Import and use the existing upload hook
    const { useFileUploadWithProgress } = await import("@warp/client/hooks/use-file-upload-with-progress");
    const { uploadFile } = useFileUploadWithProgress();

    const folderName = `AI_SOURCES/${companyId}`;

    // Use the existing upload utility with progress callback
    const { fileInfo, error } = await uploadFile(
        file.name,
        file,
        false,
        folderName,
        onProgress
    );

    if (error || !fileInfo) {
        throw new Error(error as string || "Upload failed");
    }

    return { fileUrl: fileInfo.path, fileInfo };
}

/**
 * Post-upload processing: RARA rating, document validation, AI parsing
 */
async function postUploadProcessing(
    fileUrl: string,
    fileInfo: any,
    fileName: string,
    templateId: string,
    documentLogsId: string,
    context: {
        userContext: UserContext;
        accessToken?: string;
        companyMetadata?: CompanyMetadata;
        isChatSubscriptionActive?: boolean;
        templates?: Map<string, TemplateMetadata>;
    }
): Promise<PostUploadProcessingResult> {
    console.log("[postUploadProcessing] Starting post-upload processing for:", fileName);
    const result: PostUploadProcessingResult = {
        status: DocumentStatus.Uploaded,
    };
    // Get template metadata
    const template = context.templates?.get(templateId);
    const isOtherDocument = !template; // "Other" documents don't have template metadata
    //AITODO: Need to understand, what does it mean, "other" documents don't have template metadata?

    try {
        // Step 1: RARA Document Rating (if enabled and has masterDocumentKey)
        if (!isOtherDocument && context.companyMetadata?.isRARAEnabled && template?.masterDocumentKey) {
            try {
                const raraPayload = {
                    document_url: fileUrl,
                    company_name: context.companyMetadata?.name || context.userContext.companyId,
                    document_key: template.masterDocumentKey,
                    company_size: "large",
                };

                const raraResponse = await axios({
                    method: "POST",
                    url: "/api/rara/document-rating-direct",
                    data: raraPayload,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: context.accessToken || "",
                    },
                });

                if (raraResponse.data?.success) {
                    result.raraResponse = {
                        document_rating: raraResponse.data.data?.document_rating ?? null,
                        recommendations: raraResponse.data.data?.recommendations || [],
                        reason_for_rating: raraResponse.data.data?.reason_for_rating || "",
                    };
                } else {
                    console.warn("RARA API returned unsuccessful response:", raraResponse.data);
                }
            } catch (raraError: any) {
                console.error("RARA API call failed:", {
                    message: raraError?.message,
                    status: raraError?.response?.status,
                    data: raraError?.response?.data,
                });
            }
        }

        // Step 2 & 3: Document Validation and AI Parsing (Parallel execution)
        const validationPromise = (fileInfo?.type === "pdf")
            ? performDocumentValidation(
                fileUrl,
                fileName,
                template?.title || "",
                isOtherDocument,
                context
            )
            : Promise.resolve(null);

        const aiParsingPromise = context.isChatSubscriptionActive
            ? performAIParsing(
                fileUrl,
                documentLogsId,
                context
            )
            : Promise.resolve(null);

        // Execute both in parallel
        const [validationResult, aiParsingResult] = await Promise.all([
            validationPromise,
            aiParsingPromise,
        ]);

        // Process validation result
        if (validationResult) {
            if (validationResult.expiryDate) {
                result.expiryDate = validationResult.expiryDate;
            }
            if (validationResult.warning) {
                result.validationWarning = validationResult.warning;
            }
        }

        // Process AI parsing result
        if (aiParsingResult) {
            if (aiParsingResult.success) {
                result.extractionPercentage = aiParsingResult.extractionPercentage || 0;
                result.status = DocumentStatus.Processing;
            } else {
                result.processingError = aiParsingResult.error;
            }
        }

    } catch (error: any) {
        console.error("Post-upload processing error:", error);
        result.processingError = error.message || "Processing failed";
    }

    return result;
}

/**
 * Perform document validation (company name, document name, expiry date)
 */
async function performDocumentValidation(
    fileUrl: string,
    fileName: string,
    documentTitle: string,
    isOtherDocument: boolean,
    context: {
        userContext: UserContext;
        accessToken?: string;
        companyMetadata?: CompanyMetadata;
    }
): Promise<{ expiryDate?: string; warning?: string } | null> {
    const validationsToCheck: string[] = [];

    // Add document validation checks if enabled
    if (context.companyMetadata?.isDocumentValidationEnabled) {
        validationsToCheck.push(DOCUMENT_VALIDATION_TYPES.VALIDATE_COMPANY_NAME);

        // Validate document name only for non-other documents
        if (!isOtherDocument) {
            validationsToCheck.push(DOCUMENT_VALIDATION_TYPES.VALIDATE_DOCUMENT_NAME);
        }
    }

    // Add expiry date extraction if enabled
    if (context.companyMetadata?.isDocumentValidityCheckEnabled) {
        validationsToCheck.push(DOCUMENT_VALIDATION_TYPES.EXTRACT_EXPIRY_DATE);
    }

    // Skip if no validations needed
    if (validationsToCheck.length === 0) {
        return null;
    }

    try {
        const response = await axios.post(
            "/api/rara/document-validation-comprehensive",
            {
                document_url: fileUrl,
                validations_to_check: validationsToCheck,
                company_name: context.companyMetadata?.name,
                document_name: documentTitle,
                parent_companies: [],
            },
            {
                headers: {
                    Authorization: "Bearer " + context.accessToken,
                    "Content-Type": "application/json",
                },
            }
        );

        const result: { expiryDate?: string; warning?: string } = {};

        if (response.data?.success && response.data?.data) {
            // Extract expiry date from response
            if (response.data.data.expiry_date) {
                result.expiryDate = response.data.data.expiry_date;
            }

            // If validation failed, use explanation as warning
            if (response.data.data.valid === false && response.data.data.explanation) {
                result.warning = response.data.data.explanation;
            }
        }

        return result;
    } catch (error: any) {
        console.error("Document validation API failed:", error);
        return null;
    }
}

/**
 * Perform AI parsing (file parsing for chat feature)
 */
async function performAIParsing(
    fileUrl: string,
    documentLogsId: string,
    context: {
        userContext: UserContext;
        accessToken?: string;
    }
): Promise<{ success: boolean; extractionPercentage?: number; error?: string } | null> {
    try {
        const response = await axios({
            method: "POST",
            url: "/api/AI/AIprocessing",
            data: {
                process: "fileParsing",
                data: {
                    url: fileUrl,
                    document_log_id: documentLogsId,
                    company_id: context.userContext.companyId,
                    user_id: context.userContext.userId,
                },
            },
            headers: {
                "Content-Type": "application/json",
                Authorization: context.accessToken || "",
            },
        });

        if (response.data?.data?.success) {
            return {
                success: true,
                extractionPercentage: response.data.data?.extractionPercentage || 0,
            };
        } else {
            return {
                success: false,
                error: response.data?.data?.message || "AI parsing failed",
            };
        }
    } catch (error: any) {
        console.error("AI parsing API failed:", error);
        return {
            success: false,
            error: error.message || "AI parsing failed",
        };
    }
}

/**
 * Update document log with final file URL and processing results
 */
async function updateDocumentLogWithFileUrl(
    documentLogsId: string,
    fileUrl: string,
    processingResult: PostUploadProcessingResult,
    apolloClient: any
): Promise<void> {
    const { Bulk_Update_Document_LogFilesDocument: BULK_UPDATE_DOCUMENT_LOG_FILES } = await import("@warp/graphql/mutations/generated/bulk-update-document-logFiles");

    const updatePayload: any = {
        fileName: fileUrl.split("/").pop() || "",
        fileUrl,
        status: processingResult.status,
        error: {
            warning: processingResult.validationWarning || "",
            error: processingResult.processingError || "",
        },
    };

    // Add optional fields if present
    if (processingResult.raraResponse !== undefined) {
        updatePayload.raraResponse = processingResult.raraResponse;
    }

    if (processingResult.expiryDate) {
        updatePayload.expiryDate = processingResult.expiryDate;
    }

    if (processingResult.extractionPercentage !== undefined) {
        updatePayload.extractionPercentage = String(processingResult.extractionPercentage);
    }

    await apolloClient.mutate({
        mutation: BULK_UPDATE_DOCUMENT_LOG_FILES,
        variables: {
            deletes: [],
            updates: [
                {
                    where: { id: { _eq: documentLogsId } },
                    _set: updatePayload,
                },
            ],
        },
    });
}
