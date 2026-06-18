import { useFileUploadWithProgress } from "@warp/client/hooks/use-file-upload-with-progress";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import {
  DocumentLogs_Insert_Input,
  DocumentLogs_Updates,
  FormField,
} from "@warp/graphql/generated/types";
import { useBulk_Insert_Document_LogFilesMutation } from "@warp/graphql/mutations/generated/bulk-insert-document-logs-files";
import { useBulk_Update_Document_LogFilesMutation } from "@warp/graphql/mutations/generated/bulk-update-document-logFiles";
import { useGetActiveSubscriptionByCompanyIdQuery } from "@warp/graphql/queries/generated/get-active-subscription-by-company-id";
import { useGetAiSuggestedDocumentsQuery } from "@warp/graphql/queries/generated/get-AI-suggested-documents";
import { useGetCompanyDetailByIdQuery } from "@warp/graphql/queries/generated/get-companydetail-by-id";
import { useGetDocumentLogsQuery } from "@warp/graphql/queries/generated/get-document-logs";
import { useGetFormInvitationDetailsbyIdLazyQuery } from "@warp/graphql/queries/generated/get-form-invitation-details-by-id";
import {
  DOCUMENT_VALIDATION_TYPES,
  DocumentLogsStatus,
  DropzoneStatus,
  SourcesType,
  UploadStatus,
  type DocumentLogs,
} from "@warp/shared/constants/app.constants";
import { isSubscriptionActive } from "@warp/shared/utils/jwt-ai.util";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { isDocumentExpired } from "../features/form/common-functions";

export type TableData = {
  id: string;
  companyId: string;
  originalFileName: string;
  status: string;
  aiSuggestedDocumentId?: string;
  updatedBy?: string;
  updatedAt: string;
  fileSize?: number;
  fileName: string;
  fileUrl?: string;
  createdBy?: string;
  expiryDate?: string; // Extracted from document validation API (format: YYYY-MM-DD)
  error?: string | { warning?: string; error?: string };
  deletedBy?: string;
  deletedAt?: string;
  AISuggestedDocuments?: {
    title: string;
    isOther: boolean;
  };
  index: number;
  uploadedBy?: string;
  extractionPercentage?: number; // AI extraction progress percentage
};

export interface UseUploadFilesPopupReturn {
  // Data
  data: TableData[];
  loading: boolean;
  error: any;

  // Selection
  selectedRowId: Record<string, boolean>;
  selectedRows: TableData[];
  handleRowSelect: (rowId: string) => void;

  // Upload
  uploadStatus: Record<string, UploadStatus>;
  handleFileUpload: (
    files: File[],
    onDangerousFiles?: (message: string) => void
  ) => Promise<void>;
  isUploading: boolean; // New: indicates if files are currently being uploaded
  isValidatingRARA: boolean; // New: indicates if RARA validation is in progress for submit

  // Actions
  handleSubmitSelectedDocuments: () => Promise<void>;

  // Configuration
  allowMultiple: boolean;
  formFieldId: string | undefined;
  acceptFiles: string[];
  fileSize: number;
}

export const useUploadFilesPopup = (): UseUploadFilesPopupReturn => {
  const userSession = useUserSession();
  const companyId = userSession?.company?.id as string | undefined;
  const { query } = useRouter();

  const allowMultiple = query.allowMultiple === "true";

  // Security-focused file filtering: Block dangerous file types while allowing business documents
  const dangerousFileTypes = {
    // Executable files
    extensions: [
      ".exe",
      ".bat",
      ".cmd",
      ".com",
      ".scr",
      ".msi",
      ".dll",
      ".sys",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".mjs",
      ".cjs",
      ".php",
      ".asp",
      ".aspx",
      ".jsp",
      ".cgi",
      ".pl",
      ".py",
      ".rb",
      ".sh",
      ".sql",
      ".vbs",
      ".vbe",
      ".wsf",
      ".wsh",
      ".ps1",
      ".psm1",
      ".jar",
      ".app",
      ".dmg",
      ".deb",
      ".rpm",
      ".apk",
      ".reg",
      ".lnk",
      ".url",
      ".desktop",
    ],
    // Dangerous MIME types
    mimeTypes: [
      "application/x-executable",
      "application/x-msdownload",
      "application/x-msdos-program",
      "application/x-javascript",
      "text/javascript",
      "application/javascript",
      "application/x-php",
      "application/x-sql",
      "text/x-sql",
      "application/x-sh",
      "application/x-shellscript",
    ],
  };

  const isFileTypeSafe = (file: File): { safe: boolean; reason?: string } => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    const mimeType = file.type.toLowerCase();

    // Check dangerous extensions
    if (dangerousFileTypes.extensions.includes(fileExtension)) {
      return {
        safe: false,
        reason: `File type ${fileExtension} is not allowed for security reasons`,
      };
    }

    // Check dangerous MIME types
    if (dangerousFileTypes.mimeTypes.includes(mimeType)) {
      return {
        safe: false,
        reason: `File type ${mimeType} is not allowed for security reasons`,
      };
    }

    // Additional checks for files without extensions or suspicious names
    if (!fileExtension || fileExtension === fileName) {
      return {
        safe: false,
        reason: "Files without extensions are not allowed for security reasons",
      };
    }

    return { safe: true };
  };

  // Accept all file types (no restriction) - security filtering happens in upload handler
  const acceptFiles: string[] = [];

  const fileSize = 200; // in MB

  // Data queries
  const {
    data: documentLogsData,
    loading,
    error,
    refetch: refetchDocumentLogs,
  } = useGetDocumentLogsQuery({
    variables: {
      where: {
        companyId: { _eq: companyId },
        status: { _in: [DocumentLogsStatus.Uploaded, DocumentLogsStatus.Processed, DocumentLogsStatus.Processing] },
      },
    },
  });

  const { data: companyDetails } = useGetCompanyDetailByIdQuery({
    variables: {
      id: companyId,
    },
  });

  const { data: AISuggestedDocumentData } = useGetAiSuggestedDocumentsQuery();

  // Dynamically find the "Other Documents" ID from AI suggested documents
  const ANY_OTHER_DOCUMENT_ID = useMemo(() => {
    const otherDocument = AISuggestedDocumentData?.AISuggestedDocuments?.find(
      (doc: any) => doc.isOther === true
    );
    return otherDocument?.id || null;
  }, [AISuggestedDocumentData]);

  // File upload hooks
  const { uploadFile } = useFileUploadWithProgress();
  const [insertDocumentsLogsFiles] = useBulk_Insert_Document_LogFilesMutation();
  const [updateDocumentLogFiles] = useBulk_Update_Document_LogFilesMutation();
  const [getFormInvitationDetails] = useGetFormInvitationDetailsbyIdLazyQuery();

  // Fetch active subscription for the company to check if file parsing is enabled
  const { data: subscriptionData } = useGetActiveSubscriptionByCompanyIdQuery({
    variables: { companyId: companyId || "", userId: userSession?.user?.id },
    skip: !companyId,
  });

  const isChatSubscriptionActive = isSubscriptionActive(
    subscriptionData?.AIChatSubscription?.[0]
  );

  // State management
  const [selectedRowId, setSelectedRowId] = useState<Record<string, boolean>>(
    {}
  );
  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: UploadStatus;
  }>({});
  const [newUploadedDocuments, setNewUploadedDocuments] = useState<
    { id: string }[]
  >([]);
  // Store files received from parent while table `data` is still loading
  const [pendingFilesForPopup, setPendingFilesForPopup] = useState<
    { name?: string; selectedDocumentLogId?: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [formField, setFormField] = useState<FormField>();
  const [formFieldId, setFormFieldId] = useState<string>();
  // Track files uploaded in this session to avoid re-validating them
  const [filesUploadedInThisSession, setFilesUploadedInThisSession] = useState<
    Set<string>
  >(new Set());
  // Track RARA validation loading state for submit button
  const [isValidatingRARA, setIsValidatingRARA] = useState<boolean>(false);
  // Track initially selected files when popup loads to avoid re-validating them
  const [initiallySelectedFiles, setInitiallySelectedFiles] = useState<
    Set<string>
  >(new Set());

  // Computed data - only from database, no local state merge
  // Function to filter latest system-generated documents per unique form
  const getLatestSystemGeneratedDocuments = async (
    documentLogs: any[],
    getFormInvitationDetailsCallback: any
  ) => {
    const systemGeneratedDocs = documentLogs.filter(
      (item) =>
        item.createdBy === null && // System generated (no user created it)
        item.status !== DocumentLogsStatus.Deleted && // Not deleted
        item.uploadedFromInvitationId !== null // Has an associated form invitation
    );

    if (systemGeneratedDocs.length === 0) {
      return [];
    }

    // Get unique invitation IDs
    const invitationIds = Array.from(
      new Set(systemGeneratedDocs.map((doc) => doc.uploadedFromInvitationId))
    );

    try {
      // Create mapping: invitationId -> formId
      const invitationToFormMap: { [invitationId: string]: string } = {};

      // Fetch data for each invitation ID
      for (const invitationId of invitationIds) {
        const { data: invitationData } = await getFormInvitationDetailsCallback(
          {
            variables: {
              invitationId: invitationId,
              sourceType: SourcesType.Uploaded?.dbTittle,
            },
            fetchPolicy: "network-only",
          }
        );

        if (invitationData?.FormInvitation?.[0]?.Form?.id) {
          invitationToFormMap[invitationId] =
            invitationData.FormInvitation[0].Form.id;
        }
      }

      // Group documents by actual Form ID
      const latestByFormId: { [formId: string]: any } = {};

      systemGeneratedDocs.forEach((doc) => {
        const formId = invitationToFormMap[doc.uploadedFromInvitationId];

        if (!formId) return;

        // Keep the latest document for each unique form (by createdAt)
        if (
          !latestByFormId[formId] ||
          new Date(doc.createdAt) > new Date(latestByFormId[formId].createdAt)
        ) {
          latestByFormId[formId] = doc;
        }
      });

      return Object.values(latestByFormId);
    } catch (error) {
      console.error(
        "[getLatestSystemGeneratedDocuments] Error fetching FormInvitation details:",
        error
      );
      return [];
    }
  };

  const [data, setData] = useState<TableData[]>([]);

  // Process document logs with async Form ID grouping
  useEffect(() => {
    const processDocuments = async () => {
      if (!documentLogsData?.DocumentLogs) {
        setData([]);
        return;
      }

      const allDocumentLogs = documentLogsData.DocumentLogs;

      // FILTER: Get only latest system-generated documents
      const latestSystemGenerated = await getLatestSystemGeneratedDocuments(
        allDocumentLogs,
        getFormInvitationDetails
      );

      // FILTER: Combine latest system-generated with all user-uploaded documents
      const filteredDocumentLogs = allDocumentLogs.filter((item) => {
        // Include all user-uploaded documents (createdBy is not null)
        if (item.createdBy !== null) return true;

        // For system-generated, only include if it's the latest for its type
        return latestSystemGenerated.some((latest) => latest.id === item.id);
      });

      const processedData = filteredDocumentLogs.map(
        (log: any, index: number): TableData => ({
          id: log.id,
          companyId: log.companyId,
          originalFileName: log.originalFileName || "Unknown File",
          status: log.status,
          aiSuggestedDocumentId: log.aiSuggestedDocumentId,
          updatedBy: log.updatedBy,
          updatedAt: log.updatedAt,
          fileSize: log.fileSize,
          fileName: log.fileName,
          fileUrl: log.fileUrl || "#",
          createdBy: log.createdBy,
          error: log.error,
          deletedBy: log.deletedBy,
          deletedAt: log.deletedAt,
          AISuggestedDocuments: log.AISuggestedDocuments,
          index,
          uploadedBy: log.UserByCreatedBy?.name,
          expiryDate: companyDetails?.Company?.[0]?.metadata
            ?.isDocumentValidityCheckEnabled
            ? log.expiryDate
            : undefined,
          extractionPercentage: log.extractionPercentage,
        })
      );

      setData(processedData);
    };

    processDocuments();
  }, [documentLogsData, getFormInvitationDetails]);

  // Selected rows computation
  const selectedRows = useMemo(() => {
    const selectedIds = Object.keys(selectedRowId).filter(
      (id) => selectedRowId[id]
    );
    return selectedIds
      .map((id) => data.find((row) => row.id === id))
      .filter((row): row is TableData => row !== undefined);
  }, [selectedRowId, data]);

  // File parsing API call function - called asynchronously after file upload
  // This function updates status to "Processing" BEFORE calling the API
  // so the Document Repository page shows the correct processing state
  const callFileParsingAPI = async (
    documentLogId: string,
    fileUrl: string,
    originalFileName: string
  ) => {
    if (!isChatSubscriptionActive) {
      console.log("File parsing skipped: AI subscription not active");
      return;
    }

    try {
      // STEP 1: Update status to "Processing" and extractionPercentage to "0" BEFORE calling API
      // This ensures Document Repository page shows processing state immediately
      await updateDocumentLogFiles({
        variables: {
          deletes: [],
          updates: [
            {
              where: {
                id: { _eq: documentLogId },
              },
              _set: {
                status: DocumentLogsStatus.Processing,
                extractionPercentage: "0",
              },
            },
          ],
        },
      });

      console.log(
        `[AI Processing] Started processing for ${originalFileName} (ID: ${documentLogId})`
      );

      // STEP 2: Call the parsing API asynchronously
      const parseFilePayload = {
        url: fileUrl,
        document_log_id: documentLogId,
        company_id: companyId,
        user_id: userSession?.user?.id,
      };

      const response = await axios.post(
        "/api/AI/AIprocessing",
        {
          process: "fileParsing",
          data: parseFilePayload,
        },
        {
          headers: {
            Authorization: "Bearer " + userSession?.accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("File parsing API response:", response.data);

      // STEP 3: Handle successful response and update extraction percentage
      // Check for extractionPercentage in both possible locations
      const extractionPercentage =
        response.data?.extractionPercentage ??
        response.data?.data?.extractionPercentage;

      if (response.data && extractionPercentage !== undefined) {
        try {
          // Update DocumentLogs with extraction percentage
          // Convert to string as DB expects string type
          await updateDocumentLogFiles({
            variables: {
              deletes: [],
              updates: [
                {
                  where: {
                    id: { _eq: documentLogId },
                  },
                  _set: {
                    extractionPercentage: String(extractionPercentage),
                  },
                },
              ],
            },
          });

          console.log(
            `Updated extraction percentage for ${originalFileName}: ${extractionPercentage}%`
          );
        } catch (updateError) {
          console.error(
            "Failed to update extraction percentage in DocumentLogs:",
            updateError
          );
        }
      }
    } catch (error) {
      console.error("File parsing API failed:", error);

      // If API fails, revert status back to "Uploaded" so user can retry
      try {
        await updateDocumentLogFiles({
          variables: {
            deletes: [],
            updates: [
              {
                where: {
                  id: { _eq: documentLogId },
                },
                _set: {
                  status: DocumentLogsStatus.Uploaded,
                  extractionPercentage: null,
                },
              },
            ],
          },
        });
        console.log(
          `[AI Processing] Reverted status to Uploaded for ${originalFileName} due to API failure`
        );
      } catch (revertError) {
        console.error("Failed to revert status:", revertError);
      }
    }
  };

  // File upload handler with security validation and RARA validation
  const handleFileUpload = async (
    files: File[],
    onDangerousFiles?: (message: string) => void
  ) => {
    setIsUploading(true); // Start upload loading

    // Security validation: Filter out dangerous file types
    const securityResults = files.map((file) => ({
      file,
      validation: isFileTypeSafe(file),
    }));

    const safeFiles = securityResults
      .filter((result) => result.validation.safe)
      .map((result) => result.file);

    const dangerousFiles = securityResults.filter(
      (result) => !result.validation.safe
    );

    // Log dangerous file attempts for security monitoring
    if (dangerousFiles.length > 0) {
      // Notify UI component about dangerous files with user-friendly message
      if (onDangerousFiles) {
        const fileNames = dangerousFiles.map((f) => f.file.name).join(", ");
        const fileCount = dangerousFiles.length;
        const message = `${fileCount === 1
          ? `File "${fileNames}"`
          : `${fileCount} files (${fileNames})`
          } was not uploaded. Please ensure it is a valid business document.`;
        onDangerousFiles(message);
      }
    }
    // If no safe files remain after security filtering, stop processing
    if (safeFiles.length === 0) {
      setIsUploading(false);
      if (dangerousFiles.length > 0) {
        console.error("All files rejected due to security restrictions");
        // You could show user notification here
      }
      return;
    }

    try {
      const folderName = `AI_SOURCES/${companyId}`;
      const documentLogFiles_Updates: DocumentLogs_Updates[] = [];
      const uploadedFilesStateData: { [key: string]: any } = {};
      let insertedData: DocumentLogs[] = [];
      let insertError: string | unknown;

      // Set uploading status for safe files only
      safeFiles.forEach((file, index) => {
        const tempId = `temp-${Date.now()}-${index}`;
        setUploadStatus((prev) => ({
          ...prev,
          [tempId]: DropzoneStatus.uploading as UploadStatus,
        }));
      });

      // Structure of documentLogs_Insert_Input before uploading file to S3
      const documentLogs_Insert_Input: DocumentLogs_Insert_Input[] = [];
      safeFiles.forEach((file, index) => {
        const uniqueId = `${crypto.randomUUID()}-${index}`;
        documentLogs_Insert_Input.push({
          originalFileName: file.name,
          fileUrl: uniqueId,
          fileName: uniqueId,
          aiSuggestedDocumentId: ANY_OTHER_DOCUMENT_ID,
          createdBy: userSession?.user?.id,
          fileSize: String(file.size),
          error: { warning: "", error: "" },
          status: DocumentLogsStatus.Uploading,
          companyId,
          updatedBy: userSession?.user?.id,
          uploadedFromInvitationId: query?.invitationId,
          uploadedFromFormfieldId: formFieldId || null,
        });
      });

      // Insert sample file to DB
      try {
        const insertResult = await insertDocumentsLogsFiles({
          variables: { data: documentLogs_Insert_Input },
        });
        insertedData = insertResult?.data?.insert_DocumentLogs?.returning || [];
      } catch (error) {
        insertError = error;
        console.error("Error inserting source files:", error);
      }

      // Handle file uploads concurrently for safe files only
      const uploadPromises = safeFiles.map(async (file, index) => {
        const tempId = `temp-${Date.now()}-${index}`;

        // Upload the actual file to S3
        const { fileInfo: fileResult, error: errorMessage } = await uploadFile(
          tempId,
          file,
          false,
          folderName
        );

        let fileUploadError: string = !!errorMessage
          ? "File upload failed. Please try again later."
          : "";

        let validationApiResponse: any;
        let raraMessage: string = "";
        let expiryDate: string | null = null;
        let fileProcessError: string = !!fileUploadError
          ? fileUploadError
          : insertError
            ? "An unexpected error occurred while saving the file. Please try again later."
            : "";

        // RARA validation and expiry date extraction for PDF files
        // Key change: Removed the strict RARA configuration requirement to enable expiry date extraction
        // Now calls the API for any PDF file if either RARA validation OR expiry extraction is needed
        if (!errorMessage && fileResult?.type === "pdf") {
          try {
            // Build dynamic validations array based on company metadata and form configuration
            const validationsToCheck: string[] = [];

            // Get company details for metadata-based validation configuration
            const company = companyDetails?.Company?.[0];

            // RARA validation: Only add soft validation checks (company name & document name)
            // if the form field has RARA configuration AND the company's document validation flag is enabled.
            const companyValidationEnabled =
              company?.metadata?.isDocumentValidationEnabled ?? false;
            const hasRaraConfig = formField?.interfaceOptions?.hasOwnProperty("rara");
            if (companyValidationEnabled) {
              // Always validate company name if company validation is enabled
              validationsToCheck.push(
                DOCUMENT_VALIDATION_TYPES.VALIDATE_COMPANY_NAME
              );
            }

            // Only validate document name if both company validation is enabled AND RARA config is present
            if (companyValidationEnabled && hasRaraConfig) {
              validationsToCheck.push(
                DOCUMENT_VALIDATION_TYPES.VALIDATE_DOCUMENT_NAME
              );
            }

            // Expiry date extraction: Always extract if company has document validity check enabled
            // This allows expiry date extraction even without RARA configuration
            if (company?.metadata?.isDocumentValidityCheckEnabled) {
              // Extract expiry date from document content regardless of RARA config
              validationsToCheck.push(
                DOCUMENT_VALIDATION_TYPES.EXTRACT_EXPIRY_DATE
              );
            }

            // Date validation: Only validate dates if RARA is configured and date validation is enabled
            if (formField?.interfaceOptions?.rara?.isValidDate) {
              validationsToCheck.push(
                DOCUMENT_VALIDATION_TYPES.VALIDATE_GIVEN_DATE
              );
            }
            // Build the API payload - flexible to handle both RARA validation and expiry extraction
            const apiPayload: any = {
              document_url: String(fileResult?.path),
              validations_to_check: validationsToCheck,
              company_name: company?.name || "",
              // Document name: Use RARA config if available, otherwise use original file name
              document_name: hasRaraConfig
                ? formField?.interfaceOptions?.rara?.documentName
                : fileResult?.name,
              parent_companies: [],
            };

            // Add given_date only for RARA date validation (not needed for expiry extraction)
            if (formField?.interfaceOptions?.rara?.isValidDate) {
              const currentDate = new Date();
              const formattedDate = currentDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
              apiPayload.given_date = formattedDate;
            }

            // Only call the RARA API if there are validations to check
            if (validationsToCheck.length > 0) {
              // Call the RARA API - now serves dual purpose: validation + expiry extraction
              validationApiResponse = await axios.post(
                "/api/rara/document-validation-comprehensive",
                apiPayload,
                {
                  headers: {
                    Authorization: "Bearer " + userSession?.accessToken,
                    "Content-Type": "application/json",
                  },
                }
              );
            }

            // Only process validation errors if RARA validation was requested
            // Expiry-only extractions should not trigger validation error messages
            if (
              (validationApiResponse?.data?.data?.valid
                ?.toString()
                ?.toLowerCase() === "false" ||
                validationApiResponse?.data?.valid
                  ?.toString()
                  ?.toLowerCase() === "false")
            ) {
              raraMessage =
                validationApiResponse?.data?.data?.explanation ||
                validationApiResponse?.data?.explanation ||
                "Invalid file";
            }

            // Extract expiry_date from API response - always attempt extraction regardless of validation result
            // This ensures we get expiry dates even when RARA validation fails or isn't configured
            // Handle both nested (data.data.expiry_date) and direct (data.expiry_date) response structures
            if (
              validationApiResponse?.data?.data?.expiry_date ||
              validationApiResponse?.data?.expiry_date
            ) {
              expiryDate =
                validationApiResponse.data.data.expiry_date ||
                validationApiResponse.data.expiry_date;
            }
          } catch (error) {
            console.error("RARA API call failed:", error);
            // Only set validation error message if RARA validation was actually requested
            // Expiry extraction failures should not show validation errors to users
            if (formField?.interfaceOptions.hasOwnProperty("rara")) {
              raraMessage = `Invalid ${file.name} file`;
            }
          }
        }

        const uploadedFilePath =
          folderName + fileResult?.path?.split(folderName)?.[1] || "";

        uploadedFilesStateData[tempId] = {
          file: file,
          metadata: fileResult?.metadata,
          fileUrl: String(fileResult?.path || ""),
          validation:
            validationApiResponse?.data?.valid?.toString()?.toLowerCase() ===
            "true" || raraMessage === "",
          warning: raraMessage,
          FileProcessingErrorMessage: fileProcessError,
        };

        // Update upload status
        setUploadStatus((prev) => ({
          ...prev,
          [tempId]: (fileUploadError || insertError
            ? DropzoneStatus.error
            : DropzoneStatus.uploaded) as UploadStatus,
        }));

        // Update query payload for DocumentLogs
        const documentLogsData = insertedData?.find(
          (item) => item?.originalFileName === file.name
        );

        if (documentLogsData) {
          const updateObject = errorMessage
            ? {
              status: DocumentLogsStatus.UploadError,
              error: { warning: raraMessage, error: fileProcessError },
            }
            : {
              fileName: fileResult?.path?.split("/").pop() || "",
              error: { warning: raraMessage, error: fileProcessError },
              status: fileProcessError
                ? DocumentLogsStatus.UploadError
                : DocumentLogsStatus.Uploaded,
              fileUrl: fileProcessError ? "" : fileResult?.path,
              expiryDate: expiryDate,
            };

          documentLogFiles_Updates.push({
            where: {
              id: { _eq: documentLogsData.id },
            },
            _set: updateObject,
          });

          // Store document ID for auto-selection after refetch (only if successfully uploaded)
          if (!fileProcessError && !errorMessage) {
            // We'll auto-select this document after refetch completes
            // No need to add to local state since refetchDocumentLogs() will provide the latest data
            setNewUploadedDocuments((prev) => [
              ...prev,
              { id: documentLogsData.id } as any, // Minimal object just to track IDs for auto-selection
            ]);

            // Track this file as uploaded in this session
            setFilesUploadedInThisSession((prev) => {
              const newSet = new Set(prev);
              newSet.add(documentLogsData.id);
              return newSet;
            });
          }
        }
      });

      // Execute all uploads and validation in parallel
      await Promise.allSettled(uploadPromises);

      // Update the DocumentLogs in the DB
      if (documentLogFiles_Updates.length > 0) {
        await updateDocumentLogFiles({
          variables: { deletes: [], updates: documentLogFiles_Updates },
        });
      }

      // Call file parsing API for successfully uploaded files (asynchronous, non-blocking)
      if (isChatSubscriptionActive) {
        // Extract successfully uploaded files from the updates
        const successfulUploads = documentLogFiles_Updates.filter(
          (update) =>
            update._set?.status === DocumentLogsStatus.Uploaded &&
            update._set?.fileUrl
        );

        // Call parsing API for each successfully uploaded file
        successfulUploads.forEach(async (update) => {
          try {
            const documentLogId = update.where.id?._eq;
            const fileUrl = update._set?.fileUrl;
            const fileName = update._set?.fileName || "Unknown";

            if (documentLogId && fileUrl) {
              // Call parsing API asynchronously without awaiting (fire and forget)
              callFileParsingAPI(documentLogId, fileUrl, fileName);
            }
          } catch (error) {
            console.error("Error initiating file parsing:", error);
            // Don't let parsing errors affect the upload flow
          }
        });
      }

      // Refetch document logs to get the latest data
      await refetchDocumentLogs();
    } catch (error) {
      console.error("Error in file upload process:", error);
    } finally {
      setIsUploading(false); // End upload loading
    }
  };

  // Auto-select newly uploaded documents after refetch
  useEffect(() => {
    if (newUploadedDocuments.length === 0 || !data.length) return;

    // Find documents in the refetched data that match our uploaded IDs
    const uploadedIds = newUploadedDocuments.map((doc) => doc.id);
    const documentsToSelect = data.filter((row) =>
      uploadedIds.includes(row.id)
    );

    if (documentsToSelect.length > 0) {
      setSelectedRowId((prev) => {
        const newSelection: Record<string, boolean> = allowMultiple
          ? { ...prev }
          : {};

        documentsToSelect.forEach((doc) => {
          if (!allowMultiple) {
            // For single selection, only select the last uploaded document
            const lastDoc = documentsToSelect[documentsToSelect.length - 1];
            return { [lastDoc.id]: true };
          } else {
            // For multiple selection, select all uploaded documents
            newSelection[doc.id] = true;
          }
        });

        return allowMultiple
          ? newSelection
          : { [documentsToSelect[documentsToSelect.length - 1].id]: true };
      });

      // Clear the uploaded documents tracker after auto-selection
      setNewUploadedDocuments([]);
    }
  }, [data, newUploadedDocuments, allowMultiple]);

  // RARA validation and expiry date extraction function for existing files
  const validateExistingFileWithRARA = async (rowData: TableData) => {
    // Check if we need to process this file for RARA validation or expiry extraction
    // Key change: Removed strict RARA configuration requirement to enable expiry date extraction
    if (
      !rowData.fileUrl ||
      !rowData.originalFileName.toLowerCase().endsWith(".pdf")
    ) {
      return null; // No processing needed for non-PDF files
    }

    // Get company details for metadata-based validation configuration
    const company = companyDetails?.Company?.[0];

    // Determine if we need to call RARA API for any reason
    const hasRaraConfig =
      formField?.interfaceOptions?.hasOwnProperty("rara") || false;
    const needsExpiryExtraction =
      company?.metadata?.isDocumentValidityCheckEnabled;
    const companyValidationEnabled =
      company?.metadata?.isDocumentValidationEnabled ?? false;

    // Skip API call if neither RARA validation, expiry extraction or company validation is needed
    if (!hasRaraConfig && !needsExpiryExtraction && !companyValidationEnabled) {
      return null;
    }

    try {
      // Build dynamic validations array based on requirements
      const validationsToCheck: string[] = [];

      // RARA validation: Only add soft validation checks (company name & document name)
      // if the form field has RARA configuration AND the company's document validation flag is enabled.
      if (companyValidationEnabled) {
        // Always validate company name if company validation is enabled
        validationsToCheck.push(
          DOCUMENT_VALIDATION_TYPES.VALIDATE_COMPANY_NAME
        );
      }

      // Only validate document name if both company validation is enabled AND RARA config is present
      if (companyValidationEnabled && hasRaraConfig) {
        validationsToCheck.push(
          DOCUMENT_VALIDATION_TYPES.VALIDATE_DOCUMENT_NAME
        );
      }

      // Expiry date extraction: Always extract if company has document validity check enabled
      // This allows expiry date extraction even without RARA configuration
      if (needsExpiryExtraction) {
        validationsToCheck.push(DOCUMENT_VALIDATION_TYPES.EXTRACT_EXPIRY_DATE);
      }

      // Date validation: Only validate dates if RARA is configured and date validation is enabled
      if (hasRaraConfig && formField?.interfaceOptions?.rara?.isValidDate) {
        validationsToCheck.push(DOCUMENT_VALIDATION_TYPES.VALIDATE_GIVEN_DATE);
      }

      // Build the API payload - flexible to handle both RARA validation and expiry extraction
      const apiPayload: any = {
        document_url: rowData.fileUrl,
        validations_to_check: validationsToCheck,
        company_name: company?.name || "",
        // Document name: Use RARA config if available, otherwise use original file name
        document_name:
          hasRaraConfig && formField?.interfaceOptions?.rara?.documentName
            ? formField.interfaceOptions.rara.documentName
            : rowData.originalFileName,
        parent_companies: [],
      };

      // Add given_date only for RARA date validation (not needed for expiry extraction)
      if (hasRaraConfig && formField?.interfaceOptions?.rara?.isValidDate) {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        apiPayload.given_date = formattedDate;
      }

      // Only call the RARA API if there are validations to check
      if (validationsToCheck.length === 0) {
        return null; // No validations needed
      }

      // Call the RARA API - now serves dual purpose: validation + expiry extraction
      const validationApiResponse = await axios.post(
        "/api/rara/document-validation-comprehensive",
        apiPayload,
        {
          headers: {
            Authorization: "Bearer " + userSession?.accessToken,
            "Content-Type": "application/json",
          },
        }
      );
      // Return validation status, explanation, and expiry date
      return {
        valid: validationApiResponse?.data?.data?.valid
          ?.toString()
          ?.toLowerCase() === "true" ||
          validationApiResponse?.data?.valid?.toString()?.toLowerCase() ===
          "true",
        explanation: validationApiResponse?.data?.data?.explanation ||
          validationApiResponse?.data?.explanation ||
          "",
        expiryDate:
          validationApiResponse?.data?.data?.expiry_date ||
          validationApiResponse?.data?.expiry_date ||
          null,
      };
    } catch (error) {
      console.error("RARA API call failed for existing file:", error);
      return {
        valid: false,
        explanation: `Invalid ${rowData.originalFileName} file`,
        expiryDate: null,
      };
    }
  };

  // Row selection handler
  const handleRowSelect = (rowId: string) => {
    if (allowMultiple) {
      // Multiple selection: toggle the clicked row
      setSelectedRowId((prev) => {
        const isCurrentlySelected = prev[rowId];
        const newSelection = {
          ...prev,
          [rowId]: !isCurrentlySelected,
        };
        return newSelection;
      });
    } else {
      // Single selection: toggle the clicked row (allow deselection)
      setSelectedRowId((prev) => {
        const isCurrentlySelected = prev[rowId];
        if (isCurrentlySelected) {
          // If already selected, deselect it (empty selection)
          return {};
        } else {
          // If not selected, clear all and select only this row
          return { [rowId]: true };
        }
      });
    }
  };

  // Submit selected documents handler
  const handleSubmitSelectedDocuments = async () => {
    if (selectedRows.length === 0) return;

    setIsValidatingRARA(true); // Start RARA validation loading

    try {
      // Create the file data with RARA validation for each selected file
      const answerFilesData = await Promise.all(
        selectedRows.map(async (row, index) => {
          let validation = true;
          let explanation = "";

          // Check if this file was uploaded in this session and already has RARA validation
          const wasUploadedInThisSession = filesUploadedInThisSession.has(
            row.id
          );
          const wasInitiallySelected = initiallySelectedFiles.has(row.id);

          if (
            wasUploadedInThisSession &&
            row.error &&
            typeof row.error === "object" &&
            row.error.warning
          ) {
            // This file was uploaded in this session with RARA validation already done
            validation = false; // If there's a warning, validation failed
            explanation = row.error.warning;
          } else if (wasInitiallySelected) {
            // This file was initially selected, use existing validation data from the file
            if (
              row.error &&
              typeof row.error === "object" &&
              row.error.warning
            ) {
              // File has existing RARA validation data
              validation = false; // If there's a warning, validation failed
              explanation = row.error.warning;
            } else {
              // No existing validation data, assume it's valid
              validation = true;
              explanation = "";
            }
          } else {
            // For newly selected files, perform RARA validation now
            const raraResult = await validateExistingFileWithRARA(row);
            if (raraResult) {
              validation = raraResult.valid;
              explanation = raraResult.explanation;
            }
          }

          const now = Date.now() + index; // Ensure unique ID even if called rapidly

          return {
            _id: now, // Generate unique ID
            value: [
              {
                name: row.originalFileName,
                path: row.fileUrl || "",
                type:
                  row.originalFileName.split(".").pop()?.toLowerCase() || "",
                size: row.fileSize || 0,
                selectedDocumentLogId: row.id || "",
                validation: validation,
                explanation: explanation,
                fileId: now,
                expiryDate: row.expiryDate || null,
              },
            ],
          };
        })
      );
      // Send RARA warning messages for files with validation failures
      const raraWarningMessages = answerFilesData
        .filter(
          (fileData) =>
            (fileData.value[0].validation === false &&
              fileData.value[0].explanation) ||
            (isDocumentExpired(fileData.value[0].expiryDate) &&
              companyDetails?.Company?.[0]?.metadata
                ?.isDocumentValidityCheckEnabled) // Only show expiry warnings if company has enabled document validity checking
        ) //If validation failed and explanation exists, OR if document is expired AND validity check is enabled, then send warning message
        .map((fileData) => ({
          isWarningRule: true,
          formfieldid: formFieldId,
          ispopupmessageremoved: false,
          questionid: formField?.Question?.id,
          warningmessage: (() => {
            const isExpired = isDocumentExpired(fileData.value[0].expiryDate);
            const isValidityCheckEnabled =
              companyDetails?.Company?.[0]?.metadata
                ?.isDocumentValidityCheckEnabled;
            const explanation = fileData.value[0].explanation || "";

            if (isExpired && isValidityCheckEnabled && explanation) {
              // Both expiry warning and validation explanation
              return (
                "You have used an expired document, We recommend uploading the latest version." +
                "\n" +
                explanation
              );
            } else if (isExpired && isValidityCheckEnabled) {
              // Only expiry warning
              return "You have used an expired document, We recommend uploading the latest version.";
            } else {
              // Only validation explanation
              return explanation;
            }
          })(),
          // warningmessage: fileData.value[0].explanation,
          isFileUpload: true,
          fileId: fileData._id,
          expiryDate: fileData.value[0].expiryDate || null,
        }));
      const messageToSend = {
        type: "add-files-directly-to-answer",
        data: {
          formFieldId: formFieldId,
          answerFiles: answerFilesData,
          raraWarningMessages: raraWarningMessages,
          invitationId: query?.invitationId as string, // Add invitation context for cross-tab isolation
        },
      };

      try {
        const bc = new BroadcastChannel("warp-upload-files");
        bc.postMessage(messageToSend);
        bc.postMessage({ type: "close-upload-document-popup" });
        bc.close();
      } catch (err) {
        // fallback - keep original behavior
        window.parent?.postMessage(JSON.stringify(messageToSend), "*");
        window.parent?.postMessage(
          JSON.stringify({ type: "close-upload-document-popup" }),
          "*"
        );
      }

      // Close Popup after selection
      window.parent.postMessage(
        JSON.stringify({ type: "close-upload-document-popup" }),
        "*"
      );
    } catch (error) {
      console.error("Error in handleSubmitSelectedDocuments:", error);
    } finally {
      setIsValidatingRARA(false); // End RARA validation loading
    }
  };
  //Recieve the already selected files from message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (event.data.type === "FORM_FIELD_DATA") {
          setFormFieldId(event.data.formField?.id);
          setFormField(event.data.formField);
        }
        // Normalize incoming payload (support both string and object)
        const messageData =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : (event.data as any);

        if (messageData?.type !== "send-selected-files-for-popup") return;

        // support multiple payload shapes
        const filesForPopup: any[] =
          messageData.filesForPopup ??
          messageData.data?.selectedFiles ??
          messageData.data?.filesForPopup ??
          [];

        if (!Array.isArray(filesForPopup)) {
          console.warn(
            "send-selected-files-for-popup: filesForPopup not an array",
            filesForPopup
          );
          return;
        }
        // Always normalize and store pending files for later processing by the effect that watches `data`
        const normalized = filesForPopup.map((f: any) => ({
          name: f?.name,
          selectedDocumentLogId:
            f?.selectedDocumentLogId || f?.selectedDocumentId || f?.id,
        }));

        setPendingFilesForPopup(normalized);
      } catch (error) {
        console.error("Error handling message in upload popup:", error);
      }
    };

    globalThis.addEventListener("message", handleMessage);

    // Cleanup function to remove event listener
    return () => {
      globalThis.removeEventListener("message", handleMessage);
    };
  }, [allowMultiple, data]);

  // When `data` becomes available, process any pending files received earlier
  useEffect(() => {
    if (!data || data.length === 0) return; // still loading table rows

    // If no pending files, set empty initial selection (popup loaded without pre-selected files)
    if (!pendingFilesForPopup || pendingFilesForPopup.length === 0) {
      if (initiallySelectedFiles.size === 0) {
        // Only set if not already set, to avoid resetting after processing pending files
        setInitiallySelectedFiles(new Set());
      }
      return;
    }

    // Apply selection based on pendingFilesForPopup
    setSelectedRowId((prev) => {
      const newSelection: Record<string, boolean> = allowMultiple
        ? { ...prev }
        : {};

      const initiallySelectedIds = new Set<string>();

      for (const inc of pendingFilesForPopup) {
        let matched = null as TableData | null;
        if (inc.selectedDocumentLogId) {
          matched =
            data.find((d) => d.id === inc.selectedDocumentLogId) ?? null;
        }

        if (matched) {
          initiallySelectedIds.add(matched.id); // Track initially selected files

          if (!allowMultiple) {
            const single: Record<string, boolean> = {};
            single[matched.id] = true;
            // Clear pending after applying single selection
            setPendingFilesForPopup([]);
            // Track the initially selected file
            setInitiallySelectedFiles(new Set([matched.id]));
            return single;
          }
          newSelection[matched.id] = true;
        }
      }

      // For multiple selection, track all initially selected files
      if (allowMultiple && initiallySelectedIds.size > 0) {
        setInitiallySelectedFiles(initiallySelectedIds);
      }

      // Clear pending after applying selection
      setPendingFilesForPopup([]);
      return newSelection;
    });
  }, [data, pendingFilesForPopup, allowMultiple, initiallySelectedFiles.size]);
  return {
    // Data
    data,
    loading,
    error,

    // Selection
    selectedRowId,
    selectedRows,
    handleRowSelect,

    // Upload
    uploadStatus,
    handleFileUpload,
    isUploading,
    isValidatingRARA,

    // Actions
    handleSubmitSelectedDocuments,

    // Configuration
    allowMultiple,
    formFieldId,
    acceptFiles,
    fileSize,
  };
};
