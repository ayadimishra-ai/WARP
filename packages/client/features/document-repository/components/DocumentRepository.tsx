import {
  ActionIcon,
  Box,
  Button,
  Center,
  Container,
  Flex,
  SimpleGrid,
  Space,
  Text,
  TextInput,
} from "@mantine/core";
import {
  formatFileName,
  getUserContext,
  isURLValid,
} from "@warp/client/features/form/common-functions";
import Spinner from "@warp/client/layouts/Spinner";
import {
  documentRepositoryDeleteFileModal,
  documentRepositoryExpiredDocumentsPopup,
  raraGetTokenDetails,
  rejectAlreadyDeletedFileMessageModal,
} from "@warp/client/services/platform-window-message.service";
import {
  DocumentLogs_Insert_Input,
  DocumentLogs_Updates,
} from "@warp/graphql/generated/types";
import { useBulk_Insert_Document_LogFilesMutation } from "@warp/graphql/mutations/generated/bulk-insert-document-logs-files";
import { useBulk_Update_Document_LogFilesMutation } from "@warp/graphql/mutations/generated/bulk-update-document-logFiles";
import { useGetAiSuggestedDocumentsQuery } from "@warp/graphql/queries/generated/get-AI-suggested-documents";
import { useGetCompanyDetailByIdQuery } from "@warp/graphql/queries/generated/get-companydetail-by-id";
import {
  useGetDocumentLogsLazyQuery,
  useGetDocumentLogsQuery,
} from "@warp/graphql/queries/generated/get-document-logs";
import { useGetFormInvitationDetailsbyIdLazyQuery } from "@warp/graphql/queries/generated/get-form-invitation-details-by-id";

import { useGetUserDetailByIdLazyQuery } from "@warp/graphql/queries/generated/get-userdetail-by-id";

import { IconX } from "@tabler/icons";
import {
  commonValues,
  DOCUMENT_VALIDATION_TYPES,
  DocumentLogs,
  DocumentLogsStatus,
  DropzoneStatus,
  rejectedFiles,
  SourcesType,
  UploadStatus,
} from "@warp/shared/constants/app.constants";
import InfoItem from "@warp/web/pages/embed/AIBasedSections/Common/InfoItem";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from 'react-dom'; // Import from react-dom
import SearchInputIcon from "../../../components/svgIcons/SearchInputIcon";
import {
  useDocumentRepository,
  useFetchActiveSubscription
} from "../../../hooks/use-document-repository";
import { useFileUploadWithProgress } from "../../../hooks/use-file-upload-with-progress";
import { useUserSession } from "../../../hooks/use-user-session";
import {
  AISuggestedDocumentType,
  DuplicateFileInfo,
  UploadFileStatData,
} from "../document-repository-utils";
import {
  buildDocumentLogsInsertEntry,
  customDropzoneIdPrefix,
  formatDate,
  removeProgressFromLocalStorage,
} from "../utils/documentHelpers";

interface RaraResponse {
  document_rating: number | null;
  recommendations: string[];
  reason_for_rating: string;
}

const postParentMessage = (message: any) =>
  window.parent?.postMessage(message, "*");

const DocumentRepository: FC<{}> = () => {
  const userSession = useUserSession();
  const { query } = useRouter();
  const { accessToken } = query;
  const [isfocused, setisfocused] = useState(false);
  // Get userId and companyId
  const userContext: { userId: string; companyId: string } = getUserContext(
    accessToken as string
  );
  const NumberOfDatainFirstRow: number = 8;

  const { isChatSubscriptionActive } = useFetchActiveSubscription(
    userContext.companyId,
    userContext.userId
  );

  const pageLoadDocumentLogsData = useGetDocumentLogsQuery({
    variables: {
      where: {
        companyId: { _eq: userContext.companyId },
        status: { _neq: DocumentLogsStatus.Deleted },
      },
    },
  });
  const [getDocumentLogs] = useGetDocumentLogsLazyQuery();
  const [getFormInvitationDetails] = useGetFormInvitationDetailsbyIdLazyQuery();

  const { uploadFile } = useFileUploadWithProgress();
  const insertDocumentsLogsFiles =
    useBulk_Insert_Document_LogFilesMutation()[0];
  const updateDocumentLogFiles = useBulk_Update_Document_LogFilesMutation()[0];
  const [getUserDetailsById] = useGetUserDetailByIdLazyQuery();
  const { data: AISuggestedDocumentData } = useGetAiSuggestedDocumentsQuery();
  const [showExpiredDocuments, setShowExpiredDocuments] = useState(false);

  const { data: companyDetails } = useGetCompanyDetailByIdQuery({
    variables: {
      id: userContext.companyId,
    },
  });
  const DropzoneCard = dynamic(
    () =>
      import("@warp/web/pages/embed/AIBasedSections/Common/CustomDropzoneV2"),
    {
      ssr: false,
    }
  );

  const [dropzoneConfig, setDropzoneConfig] = useState<
    AISuggestedDocumentType[]
  >([]);

  // Ref to track if an upload is in progress - prevents processDocuments from overwriting
  const isUploadInProgressRef = useRef<boolean>(false);
  
  // Ref to track if expired documents popup is currently open
  const isExpiredPopupOpenRef = useRef<boolean>(false);
  
  // Ref to accumulate expired document counts while popup is open
  const pendingExpiredCountsRef = useRef<{ expiredCount: number; totalCount: number }>({ expiredCount: 0, totalCount: 0 });
  
  // POLLING REMOVED: Upload tracking refs temporarily disabled
  // const activeUploadsRef = useRef<Set<string>>(new Set());
  // const pendingPollingUpdatesRef = useRef<any>(null);

  useEffect(() => {
    const processDocuments = async () => {
      // Skip if an upload is in progress to prevent overwriting newly uploaded documents
      if (isUploadInProgressRef.current) {
        return;
      }

      if (AISuggestedDocumentData?.AISuggestedDocuments) {
        let otherDoc: AISuggestedDocumentType | null = null;
        const otherUploadedDocs: AISuggestedDocumentType[] = [];
        const restDocs: AISuggestedDocumentType[] = [];

        //FILTER: Get only latest system-generated documents
        const allDocumentLogs =
          pageLoadDocumentLogsData.data?.DocumentLogs || [];
        const latestSystemGenerated = await getLatestSystemGeneratedDocuments(
          allDocumentLogs,
          getFormInvitationDetails
        );

        //FILTER: Combine latest system-generated with user-uploaded documents
        const filteredDocumentLogs = allDocumentLogs.filter((item) => {
          // Include all user-uploaded documents
          if (item.createdBy !== null) return true;

          // For system-generated, only include if it's the latest for its type
          return latestSystemGenerated.some((latest) => latest.id === item.id);
        });

        AISuggestedDocumentData.AISuggestedDocuments.forEach((doc) => {
          // Use filtered document logs instead of all
          const documentLogsFilesData = filteredDocumentLogs.filter(
            (item) =>
              item.aiSuggestedDocumentId === doc.id &&
              item.status !== DocumentLogsStatus.Deleted
          );

          if (doc?.isOther) {
            // Always add the "Other" upload card first
            otherDoc = {
              id: doc.id as string,
              maxSize: doc.maxSize as number,
              sampleFileUrl: doc.sampleFileUrl as string,
              seqIndex: doc.seqIndex,
              title: doc.title as string,
              acceptedFormats: doc?.acceptedFormats,
              isOther: doc?.isOther,
              warning: "",
              FileProcessingErrorMessage: "",
              sourceFileUrl: "",
            };

            // Add any uploaded "Other" files as separate cards (after the main "Other" card)
            documentLogsFilesData?.forEach((item, index) => {
              otherUploadedDocs.push({
                maxSize: doc.maxSize as number,
                seqIndex: 999 + index, // Use high sequence number to ensure they come after other cards initially
                title:
                  item?.createdBy === null
                    ? (item?.cardName as string)
                    : item?.originalFileName
                      ? formatFileName(String(item?.originalFileName))
                      : "File Not Found",
                acceptedFormats: doc?.acceptedFormats,
                isOther: doc?.isOther,
                id: item.id, // use backend id for stable mapping
                warning: item?.error?.warning,
                FileProcessingErrorMessage: item?.error?.error,
                sourceFileUrl: item?.fileUrl ? item?.fileUrl : "",
              });
            });
          } else {
            // For regular documents, handle both user-uploaded and system-generated
            if (documentLogsFilesData && documentLogsFilesData.length > 0) {
              // If there are uploaded files, create cards for each one
              documentLogsFilesData.forEach((item, index) => {
                restDocs.push({
                  id: item.id, // Use individual document log ID for system-generated docs
                  maxSize: doc.maxSize as number,
                  sampleFileUrl: doc.sampleFileUrl as string,
                  seqIndex: doc.seqIndex + index,
                  title:
                    item?.createdBy === null
                      ? (item?.cardName as string) || doc.title // Use cardName for system-generated, fallback to doc title
                      : doc.title, // Use original title for user-uploaded
                  acceptedFormats: doc?.acceptedFormats,
                  isOther: doc?.isOther,
                  warning: item?.error?.warning || "",
                  FileProcessingErrorMessage: item?.error?.error || "",
                  sourceFileUrl: item?.fileUrl || "",
                });
              });
            } else {
              // No uploaded files, show the template card
              restDocs.push({
                id: doc.id as string,
                maxSize: doc.maxSize as number,
                sampleFileUrl: doc.sampleFileUrl as string,
                seqIndex: doc.seqIndex,
                title: doc.title as string,
                acceptedFormats: doc?.acceptedFormats,
                isOther: doc?.isOther,
                warning: "",
                FileProcessingErrorMessage: "",
                sourceFileUrl: "",
              });
            }
          }
        });

        // Compose the final array: Other card, uploaded other files, then rest
        const sortedRest = restDocs.sort((a, b) => a.seqIndex - b.seqIndex);

        // Create final ordered array with proper sequence indices
        const dropzoneOrder: AISuggestedDocumentType[] = [];
        let currentSeqIndex = 1;

        // First add the main "Other Documents" card
        if (otherDoc) {
          dropzoneOrder.push({
            ...(otherDoc as AISuggestedDocumentType),
            seqIndex: currentSeqIndex++,
          });
        }

        // Then add all uploaded "Other" files
        otherUploadedDocs.forEach((doc) => {
          dropzoneOrder.push({ ...doc, seqIndex: currentSeqIndex++ });
        });

        // Finally add regular document cards
        sortedRest.forEach((doc) => {
          dropzoneOrder.push({ ...doc, seqIndex: currentSeqIndex++ });
        });

        setDropzoneConfig(dropzoneOrder);
        /**
         * Start Temp Fix states update to align with new dropzoneOrder
         */

        // Immediately align `uploadedFiles` and `uploadStatus` with the
        // newly computed `dropzoneOrder` to avoid stale keys causing
        // progress bars to persist after re-renders / fetch updates.
        // Keep this minimal: map existing entries by exact id, by
        // `documentLogsId`, or by `fileUrl` (best-effort).
        try {
          flushSync(() => {
            setUploadedFiles((prev: any) => {
              const mapped: any = {};
              dropzoneOrder.forEach((card: any) => {
                if (prev[card.id]) {
                  mapped[card.id] = prev[card.id];
                  return;
                }
                const foundKey = Object.keys(prev).find((k) =>
                  prev[k] && (prev[k].documentLogsId === card.id || prev[k].fileUrl === card.sourceFileUrl)
                );
                if (foundKey) mapped[card.id] = prev[foundKey];
              });
              return mapped;
            });

            setUploadStatus((prev: any) => {
              const next: any = {};
              dropzoneOrder.forEach((card: any) => {
                next[card.id] = prev[card.id] ?? DropzoneStatus.idle;
              });
              return next;
            });
          });
        } catch (e) {
          console.warn("Failed to align uploadedFiles/uploadStatus:", e);
        }
         /**
         * End Temp Fix states update to align with new dropzoneOrder
         */
      }
    };

    processDocuments();
  }, [
    AISuggestedDocumentData,
    pageLoadDocumentLogsData.data?.DocumentLogs,
    getFormInvitationDetails,
  ]);

  const [getTokendetails, setTokendetails] = useState<{
    token?: string;
    serviceURL?: string;
  }>({});

  type UploadStatusMap = {
    [key in (typeof dropzoneConfig)[number]["id"]]: UploadStatus;
  };

  const initialUploadStatus: UploadStatusMap = dropzoneConfig.reduce(
    (acc, item) => ({ ...acc, [item.id]: DropzoneStatus.idle }), // Set initial status for each item as 'idle'
    {}
  );
  const [uploadStatus, setUploadStatus] =
    useState<UploadStatusMap>(initialUploadStatus);

  // ---- uploaded files state --------------------------------
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: {
      file: File | null;
      fileSize?: number;
      metadata: any | undefined;
      fileUrl: string;
      documentLogsId: string;
      isDeleted: boolean;
      status: string;
      FileProcessingErrorMessage: string;
      error?: { error: string; warning: string };
      expiryDate?: string | null;
      raraResponse?: RaraResponse | null;
      extractionPercentage?: string | null;
      createdBy?: string | null; // Add createdBy to determine if system-generated
    };
  }>({});

  // Use custom hook for business logics
  const {
    newExpiredDocumentsCount,
    setNewExpiredDocumentsCount,
    hasViewedExpiredTab,
    setHasViewedExpiredTab,
    trackExpiredDocument,
    headingTextData,
    refreshUI,
    handleProcessWithAI,
    setFileStatus,
    handleInsertRejectedFiles,
    findDuplicates,
    createTempOtherDocEntry,
    handleToCheckFileIsAlreadyDeleted,
    isDocumentExpired,
  } = useDocumentRepository({
    accessToken: accessToken as string,
    showExpiredDocuments,
    setShowExpiredDocuments,
    dropzoneConfig,
    uploadedFiles,
  });

  const [documentLogsError, setDocumentLogsError] = useState<
    DocumentLogs_Updates[]
  >([]);

  // Guard set to avoid processing the same duplicate-upload twice
  const duplicateProcessingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!getTokendetails.hasOwnProperty("token")) {
      postParentMessage(raraGetTokenDetails());
    }

    const tokenHandler = async (event: any) => {
      event.preventDefault();
      let messageData: any;
      const dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
        } catch (error) {
          // not JSON, ignore
        }
      } else if (dataType === "object") {
        // structured-clone payload (may include File objects)
        messageData = event.data;
      }

      if (!messageData) return;
      const type = messageData.type;
      if (type === "snowkap-tokendetails") {
        setTokendetails({
          token: messageData.token,
          serviceURL: messageData.serviceurl,
        });
      }
    };

    globalThis.addEventListener("message", tokenHandler);
    return () => globalThis.removeEventListener("message", tokenHandler);
  }, [getTokendetails]);

  useEffect(() => {
    const repoMessageHandler = async (event: any) => {
      event.preventDefault();
      let messageData: any;
      const dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
        } catch (error) {
          // not JSON
        }
      } else if (dataType === "object") {
        // structured-clone payload (may include File objects)
        messageData = event.data;
      }

      if (!messageData) return;
      const type = messageData.type;
      switch (type) {
        case "document-repository-delete-file-from-modal-true":
          await handleDelete(
            messageData.configId,
            messageData.documentLogsId,
            messageData.fileUrl,
            messageData.cardArray,
            messageData.status
          );
          break;
        case "document-repository-duplicate-document-modal-true":
          await handleDuplicate(
            messageData.duplicateFilesData,
            messageData.filesData,
            messageData.configId,
            messageData.isOther,
            messageData.docTitle
          );
          break;
        case "document-repository-expired-documents-popup-true":
          // User confirmed viewing expired documents - navigate to expired tab
          setShowExpiredDocuments(true);
          // Mark tab as viewed so count disappears from button
          // The hook will handle clearing the database count via its own useEffect
          setHasViewedExpiredTab(true);
          // Reset popup tracking refs
          isExpiredPopupOpenRef.current = false;
          pendingExpiredCountsRef.current = { expiredCount: 0, totalCount: 0 };
        break;
        case "document-repository-expired-documents-popup-closed":
          // Reset popup tracking refs when user closes popup
          isExpiredPopupOpenRef.current = false;
          pendingExpiredCountsRef.current = { expiredCount: 0, totalCount: 0 };
        break;
        case "document-repository-reject-already-deleted-file-message-true":
          try {
            localRefreshUI(messageData.dropzoneConfig, messageData.configId);
          } catch (e) {
            console.warn("Failed to reload iframe for refresh:", e);
          }
          break;
        default:
          break;
      }
    };

    globalThis.addEventListener("message", repoMessageHandler);
    return () => globalThis.removeEventListener("message", repoMessageHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    pageLoadDocumentLogsData?.data?.DocumentLogs?.filter(
      (items) => items.status !== DocumentLogsStatus.Deleted
    )?.forEach(async (items) => {
      const cardId = items.id; // Always use document log ID for consistency with dropzoneConfig

      setUploadStatus((prevStatus) => ({
        ...prevStatus,
        [cardId]: (() => {
          switch (items?.status) {
            case DocumentLogsStatus.Success:
              return DropzoneStatus.complete;
            case DocumentLogsStatus.Processed:
              return DropzoneStatus.complete;
            case DocumentLogsStatus.Pending:
              return DropzoneStatus.pending;
            case DocumentLogsStatus.Processing:
              return DropzoneStatus.processing;
            case DocumentLogsStatus.Error:
              return DropzoneStatus.error;
            case DocumentLogsStatus.Uploaded:
              return DropzoneStatus.uploaded;
            case DocumentLogsStatus.ProcessingError:
              return DropzoneStatus.ProcessingError;
            default:
              return DropzoneStatus.idle;
          }
        })(),
      }));
      // Create a placeholder File object for display purposes
      // This avoids the slow urlToFile fetch and "Not Found" errors
      // The actual file content is not needed - only the name for display
      const fileDetail: File = new File(
        [new Blob()],
        String(items?.originalFileName),
        {
          type:
            items?.status === DocumentLogsStatus.Error
              ? ""
              : "application/octet-stream",
          lastModified: Date.now(),
        }
      );

      setUploadedFiles((prevFiles) => ({
        ...prevFiles,
        [cardId]: {
          file: fileDetail,
          fileSize: parseInt(items?.fileSize) || 0,
          metadata: {
            Key: "public" + items?.fileUrl,
            key: "public" + items?.fileUrl,
            Bucket: String(items?.fileUrl).split("public")[0].split("/")[
              String(items?.fileUrl).split("public")[0].split("/").length - 1
            ],
            Location: items?.fileUrl,
          },
          fileUrl: items?.fileUrl,
          documentLogsId: items?.id,
          isDeleted: false,
          status: items?.status,
          FileProcessingErrorMessage: items?.error?.error,
          expiryDate: items?.expiryDate,
          raraResponse: items?.raraResponse as RaraResponse | null,
          extractionPercentage: items?.extractionPercentage || null,
          createdBy: items?.createdBy, // Add createdBy to determine if system-generated
        },
      }));

      const updatesourceFile =
        pageLoadDocumentLogsData?.data?.DocumentLogs?.filter(
          (items) =>
            items?.status == DocumentLogsStatus.Error &&
            isURLValid(String(items?.fileUrl))
        ).map((dataItems) => {
          return {
            where: {
              id: {
                _eq: dataItems?.id,
              },
            },
            _set: {
              error: {
                warning: dataItems?.error?.warning,
                error: commonValues.commonError,
              },
            },
          };
        }) || [];
      setDocumentLogsError(updatesourceFile);
    });
  }, [pageLoadDocumentLogsData?.data?.DocumentLogs]);

  useEffect(() => {
    const updateError = async () => {
      if (documentLogsError.length > 0) {
        const updatedData = await updateDocumentLogFiles({
          variables: { deletes: [], updates: documentLogsError },
        });
      }
    };
    updateError();
  }, [documentLogsError, updateDocumentLogFiles]);

  // helpers used by handleDrop â€” keep them small and local to avoid behavioral changes
  // Wrapper for createTempOtherDocEntry from hook
  const localCreateTempOtherDocEntry = (
    file: File,
    index: number,
    otherDocTemplate: AISuggestedDocumentType,
    prefix: string = customDropzoneIdPrefix
  ) => {
    return createTempOtherDocEntry(file, index, otherDocTemplate, prefix);
  };

  // Safely remove the duplicate-processing guard for a given duplicate payload.
  // Kept small and defensive to avoid throwing during cleanup.
  const cleanupDuplicateProcessing = (duplicateFilesData?: any) => {
    try {
      const dk = (duplicateFilesData as any)?.__duplicateKey;
      if (dk) duplicateProcessingRef.current.delete(dk);
    } catch (e) {
      /* ignore cleanup errors */
    }
  };

  // Wrapper functions for the hook functions to provide correct parameters
  const localRefreshUI = useCallback(
    (cardArray: AISuggestedDocumentType[], configId: string) => {
      refreshUI(
        cardArray,
        configId,
        uploadStatus,
        uploadedFiles,
        setDropzoneConfig,
        setUploadStatus,
        setUploadedFiles
      );
    },
    [refreshUI, uploadStatus, uploadedFiles]
  );

  const localHandleProcessWithAI = useCallback(
    async (fileData: {
      documentLogsId: string;
      fileUrl: string;
      fileName: string;
    }) => {
      return handleProcessWithAI(
        fileData,
        userContext,
        pageLoadDocumentLogsData,
        updateDocumentLogFiles,
        null, // POLLING REMOVED: refetchPollingData disabled
        uploadedFiles,
        setUploadedFiles,
        setUploadStatus,
        null // POLLING REMOVED: setForcePollingRefresh disabled
      );
    },
    [
      handleProcessWithAI,
      userContext,
      pageLoadDocumentLogsData,
      updateDocumentLogFiles,
      // POLLING REMOVED: refetchPollingData disabled
      uploadedFiles,
    ]
  );

  const localSetFileStatus = useCallback(
    async (configId: string) => {
      return setFileStatus(
        configId,
        userContext,
        getDocumentLogs,
        setDropzoneConfig
      );
    },
    [setFileStatus, userContext, getDocumentLogs]
  );

  // Process the unique files upload + DB insert/update path (extracted from handleDrop)
  const processUniqueFiles = async (
    id: string,
    files: File[],
    isOther: boolean,
    docTitle: string
  ) => {
    console.log("Processing unique files for upload:", files);
    // POLLING REMOVED: Upload tracking disabled
    // startUploadTracking(id);
    // Mark upload as in progress to prevent processDocuments from overwriting
    isUploadInProgressRef.current = true;

    try {
      const folderName = `AI_SOURCES/${userContext.companyId}`;
      const documentLogFiles_Updates: DocumentLogs_Updates[] = [];
      const documentLogs_dates_payload: DocumentLogs_Updates[] = [];
      const uploadedFilesStateData: { [key: string]: UploadFileStatData } = {};
      const otherDocumentData: AISuggestedDocumentType[] = [];
      let insertedData: DocumentLogs[] = [];
      let insertError: string | unknown;
      let insertErrorStack: string | undefined;
      const FilewithIdArray: any[] = [];
      // Update 'uploading' status for non-other documents
      const uploadCardStatus = uploadStatus;
      if (!isOther) {
        uploadCardStatus[id] = DropzoneStatus.uploading as UploadStatus;
        files.forEach((file) => {
          FilewithIdArray.push({
            id: id,
            file: file,
          });
        });
      } else {
        // Handle other documents
        const otherDocData = dropzoneConfig.filter((items) => items.id == id);

        files.forEach((file, index) => {
          // Using a temporary id for upload, will be replaced by backend id after insert
          const { tempOtherDocId, entry } = localCreateTempOtherDocEntry(
            file,
            index,
            otherDocData[0]
          );
          otherDocumentData.push(entry);
          FilewithIdArray.push({
            id: tempOtherDocId,
            file: file,
          });
        });
        // Update sequence indices for Other Documents upload:
        // Business Logic: New files should appear immediately after "Other Documents" template
        // 1. Other template card stays at seqIndex 1
        // 2. NEW uploaded files get seqIndex 2, 3, etc. (immediately after template)
        // 3. EXISTING uploaded files get shifted to start after new files
        // 4. Regular template cards get reassigned to start after all uploaded files
        setDropzoneConfig((prevConfig) => {
          // Separate items into categories
          const otherTemplate = prevConfig.find(
            (item) => item.isOther && item.id === id
          );
          const existingOtherUploads = prevConfig.filter(
            (item) => item.isOther && item.id !== id
          );
          const regularTemplates = prevConfig.filter((item) => !item.isOther);

          const templateSeqIndex = otherTemplate?.seqIndex || 1;

          // NEW files get seqIndex immediately after template (2, 3, 4...)
          const newOtherUploads = otherDocumentData.map((entry, idx) => ({
            ...entry,
            seqIndex: templateSeqIndex + idx + 1,
          }));

          // EXISTING uploaded files get shifted to start after new files
          const updatedExistingUploads = existingOtherUploads.map(
            (item, idx) => ({
              ...item,
              seqIndex: templateSeqIndex + newOtherUploads.length + idx + 1,
            })
          );
          // Regular templates start after all uploaded files (new + existing)

          const totalUploadedFiles =
            newOtherUploads.length + existingOtherUploads.length;
          const updatedRegularTemplates = regularTemplates.map((item, idx) => ({
            ...item,
            seqIndex: templateSeqIndex + totalUploadedFiles + idx + 1,
          }));

          // Compose final array: template, NEW files, existing files, regular templates
          const finalConfig: AISuggestedDocumentType[] = [];
          if (otherTemplate) finalConfig.push(otherTemplate);
          finalConfig.push(...newOtherUploads); // NEW files first (right after template)
          finalConfig.push(...updatedExistingUploads); // EXISTING files after new ones
          finalConfig.push(...updatedRegularTemplates);

          return finalConfig.sort((a, b) => a.seqIndex - b.seqIndex);
        });
        otherDocumentData.forEach((item) => {
          uploadCardStatus[item.id] = DropzoneStatus.uploading as UploadStatus;
        });
      }
      setUploadStatus((prevStatus) => ({
        ...prevStatus,
        ...uploadCardStatus,
      }));

      //Structure of documentLogs_Insert_Input before uploading file to S3
      // Declare locally to avoid cross-call accumulation
      const documentLogs_Insert_Input: DocumentLogs_Insert_Input[] = [];
      files?.forEach((file, index) => {
        documentLogs_Insert_Input.push(
          buildDocumentLogsInsertEntry(
            file,
            index,
            id,
            userContext.userId,
            userContext.companyId
          )
        );
      });

      // Insert sample file to DB
      try {
        const insertResult = await insertDocumentsLogsFiles({
          variables: { data: documentLogs_Insert_Input },
        });
        insertedData = insertResult?.data?.insert_DocumentLogs?.returning || [];
      } catch (error) {
        insertError = error;
        insertErrorStack = error instanceof Error ? error.stack : undefined;
        console.error("Error inserting source files:", error);
      }

      //Handle file uploads concurrently
      const uploadPromises = FilewithIdArray.map(async (fileItem, index) => {
        // Upload the actual file to S3
        const { fileInfo: fileResult, error: errorMessage, errorStack } = await uploadFile(
          isOther ? fileItem?.id : id,
          fileItem?.file,
          true, // Passing isCustomName as true to use custom filename instead of random UUID
          folderName
        );

        let fileUploadError: string = !!errorMessage
          ? "File upload failed. Please try again later."
          : "";

        let validationApiResponse: any;
        let raraMessage: string = "";
        let extractedExpiryDate: string | null = null;
        let parseFileSuccessFlag: boolean = false;
        let fileProcessError: string = !!fileUploadError
          ? fileUploadError
          : insertError
          ? "An unexpected error occurred while saving the file. Please try again later."
          : "";
        
        // Capture error stack - prioritize upload error stack, then insert error stack
        let fileProcessErrorStack: string | undefined = errorStack || insertErrorStack;

        if (!errorMessage) {
          //#region RARA document-rating-single API call
          // Skip RARA API call for "other" document types
          if (!isOther) {
            // Check if RARA is enabled for document repository in company metadata
            const isRARAEnabled =
              companyDetails?.Company?.[0]?.metadata?.isRARAEnabled === true;

            if (isRARAEnabled) {
              // Get masterDocumentKey from AISuggestedDocuments
              const aiSuggestedDoc =
                AISuggestedDocumentData?.AISuggestedDocuments?.find(
                  (doc: any) => doc.id === id
                );
              const masterDocumentKey = aiSuggestedDoc?.masterDocumentKey;
              // Skip RARA API call if masterDocumentKey is blank, empty, or null
              if (
                !masterDocumentKey ||
                masterDocumentKey === null ||
                masterDocumentKey.trim() === ""
              ) {
                console.log(
                  "Skipping RARA API call: masterDocumentKey is blank, empty, or null for document ID:",
                  id
                );
              } else {
                // Get document log ID for this file by matching filename
                const matchedDocLogForRara = insertedData?.filter(
                  (item) =>
                    formatFileName(String(item?.originalFileName ?? "")) ===
                    formatFileName(files[index].name)
                );
                const documentLogsIdForRara = matchedDocLogForRara?.[0]?.id || "";

                // Prepare RARA API payload (credentials fetched server-side from GlobalMaster)
                const raraPayload = {
                  document_url: fileResult?.path,
                  company_name:
                    companyDetails?.Company[0]?.name || userContext.companyId,
                  document_key: masterDocumentKey || "",
                  company_size: "large",
                  document_log_id: documentLogsIdForRara,
                };
                try {
                  // Call the new RARA document rating API
                  const raraResponse = await axios({
                    method: "POST",
                    url: "/api/rara/document-rating-direct",
                    data: raraPayload,
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: accessToken || "",
                    },
                  });

                  if (raraResponse.data?.success) {
                    // Store the RARA response for later use in document logs update
                    uploadedFilesStateData[id] = {
                      ...uploadedFilesStateData[id],
                      raraResponse:
                        raraResponse.data?.data || raraResponse.data,
                    };
                  } else {
                    console.error(
                      "RARA document rating failed:",
                      raraResponse.data?.error
                    );
                  }
                } catch (raraError: any) {
                  console.error("RARA API call failed:", {
                    message: raraError?.message,
                    status: raraError?.response?.status,
                    data: raraError?.response?.data,
                    stack: raraError?.stack,
                  });
                  
                  // If there's a RARA API error and we don't have other errors, capture the stack
                  if (!fileProcessError && !fileProcessErrorStack && raraError?.stack) {
                    fileProcessErrorStack = raraError.stack;
                  }
                }
              }
            }
          }
          //#endregion

          //#region RARA Starts + Parse-file API call (PARALLEL EXECUTION)
          // Both validation and AI processing APIs are called in parallel for better performance
          // They will execute simultaneously

          // Prepare validation API promise
          let validationApiPromise: Promise<any> | null = null;
          if (fileResult?.type == "pdf") {
            // Check if document validation is enabled for document repository
            const isDocumentValidationEnabled =
              companyDetails?.Company?.[0]?.metadata
                ?.isDocumentValidationEnabled === true;

            // Check if document validity check is enabled for company (for date extraction)
            const isDocumentValidityCheckEnabled =
              companyDetails?.Company?.[0]?.metadata
                ?.isDocumentValidityCheckEnabled === true;

            // Build validations array - start with empty array
            const validationsToCheck: string[] = [];

            // Add document validation checks if enabled for document repository
            if (isDocumentValidationEnabled) {
              validationsToCheck.push(
                DOCUMENT_VALIDATION_TYPES.VALIDATE_COMPANY_NAME
              );

              // validate document name only for non-other documents
              if (!isOther) {
                validationsToCheck.push(
                  DOCUMENT_VALIDATION_TYPES.VALIDATE_DOCUMENT_NAME
                );
              }
            }

            // Add expiry date extraction if enabled (independent of document validation)
            if (isDocumentValidityCheckEnabled) {
              validationsToCheck.push(
                DOCUMENT_VALIDATION_TYPES.EXTRACT_EXPIRY_DATE
              );
            }

            // Only make API call if we have validations to check
            if (validationsToCheck.length > 0) {
              validationApiPromise = axios
                .post(
                  "/api/rara/document-validation-comprehensive",
                  JSON.stringify({
                    document_url: String(fileResult?.path),
                    validations_to_check: validationsToCheck,
                    company_name: companyDetails?.Company[0]?.name,
                    document_name: isOther
                      ? formatFileName(String(fileResult?.name))
                      : docTitle,
                    parent_companies: [],
                  }),
                  {
                    headers: {
                      Authorization: "Bearer " + accessToken,
                      "Content-Type": "application/json",
                    },
                  }
                )
                .then((res) => res)
                .catch((err) => err);
            }
          }

          // Prepare parse-file API promise
          let parseFilePromise: Promise<any> | null = null;
          if (isChatSubscriptionActive && !errorMessage && fileResult?.path) {
            const parseFilePayload = {
              url: fileResult.path,
              document_log_id:
                insertedData.find(
                  (item) =>
                    formatFileName(String(item?.originalFileName ?? "")) ===
                    formatFileName(files[index].name)
                )?.id || "",
              company_id: userContext.companyId,
              user_id: userContext.userId,
            };

            parseFilePromise = axios({
              method: "POST",
              url: "/api/AI/AIprocessing",
              data: {
                process: "fileParsing",
                data: parseFilePayload,
              },
              headers: {
                "Content-Type": "application/json",
                Authorization: accessToken || "",
              },
            });
          }

          // Execute both API calls in parallel using Promise.all
          if (validationApiPromise || parseFilePromise) {
            const [validationApiResponse, parseFileResponse] =
              await Promise.all(
                [validationApiPromise, parseFilePromise].map((p) =>
                  p ? p.catch((err) => err) : Promise.resolve(null)
                )
              );

            // Process validation API response
            if (validationApiResponse) {
              try {
                // Check if there's an error in the response first
                if (validationApiResponse?.response?.status >= 400) {
                  console.error(
                    "Validation API error:",
                    validationApiResponse?.response?.data,
                    "Stack:",
                    validationApiResponse?.stack
                  );
                  raraMessage = "Document validation failed. Please try again.";
                  
                  // Capture validation API error stack if available
                  if (!fileProcessErrorStack && validationApiResponse?.stack) {
                    fileProcessErrorStack = validationApiResponse.stack;
                  }
                } else if (validationApiResponse?.data) {
                  // Handle successful response
                  const responseData = validationApiResponse.data;

                  // Check for validation results
                  const isValid =
                    responseData?.data?.valid !== undefined
                      ? responseData.data.valid
                      : responseData?.valid;

                  const explanation =
                    responseData?.data?.explanation ||
                    responseData?.explanation;

                  if (
                    isValid === false ||
                    isValid?.toString()?.toLowerCase() === "false"
                  ) {
                    raraMessage = explanation || "Document validation failed";
                  }

                  // Extract expiry date if present
                  const expiryDate =
                    responseData?.data?.expiry_date ||
                    responseData?.expiry_date;

                  if (expiryDate) {
                    extractedExpiryDate = expiryDate;
                  }
                }
              } catch (error) {
                console.error("Error processing validation response:", error);
                raraMessage = `Invalid ${
                  isOther ? formatFileName(String(fileResult?.name)) : docTitle
                } file`;
                
                // Capture validation error stack if not already captured
                if (!fileProcessErrorStack && error instanceof Error && error.stack) {
                  fileProcessErrorStack = error.stack;
                }
              }
            }

            // Process parse-file API response
            if (parseFileResponse) {
              try {
                // AIprocessing wraps response in { data: {...}, error: null }
                if (
                  parseFileResponse.data?.data?.success ||
                  parseFileResponse.data?.success
                ) {
                  // Clear any previous error when parse-file API succeeds
                  fileProcessError = "";

                  // Store extractionPercentage from parse-file API response
                  // AIprocessing wraps response in { data: {...}, error: null }
                  const extractionPercentage =
                    parseFileResponse.data?.data?.extractionPercentage ||
                    parseFileResponse.data?.extractionPercentage ||
                    parseFileResponse.data?.data?.data?.extractionPercentage ||
                    "0";

                  if (extractionPercentage !== null) {
                    const storageKey = isOther ? fileItem?.id : id;
                    uploadedFilesStateData[storageKey] = {
                      ...uploadedFilesStateData[storageKey],
                      extractionPercentage: extractionPercentage, // Convert to string for database
                    };
                  }

                  // Mark that status should be updated to Processing on success
                  parseFileSuccessFlag = true;
                } else {
                  console.error(
                    "Parse-file API failed:",
                    parseFileResponse.data?.error ||
                      parseFileResponse.data?.data?.error,
                    "Stack:",
                    parseFileResponse?.stack
                  );

                  // Add error message to fileProcessError when parse-file API fails
                  const apiErrorMessage =
                    parseFileResponse.data?.error ||
                    parseFileResponse.data?.data?.error ||
                    "Parse-file API failed";
                  fileProcessError = fileProcessError || apiErrorMessage;
                  
                  // Capture parse-file API error stack if available and not already captured
                  if (!fileProcessErrorStack && parseFileResponse?.stack) {
                    fileProcessErrorStack = parseFileResponse.stack;
                  }
                }
              } catch (parseFileError: any) {
                console.error("Parse-file API call failed:", {
                  message: parseFileError?.message,
                  status: parseFileError?.response?.status,
                  data: parseFileError?.response?.data,
                  stack: parseFileError?.stack,
                });

                // Add error message to fileProcessError when parse-file API call fails
                const catchErrorMessage =
                  parseFileError?.response?.data?.error ||
                  parseFileError?.message ||
                  "Parse-file API call failed";
                fileProcessError = fileProcessError || catchErrorMessage;
                
                // Capture error stack if not already captured
                if (!fileProcessErrorStack && parseFileError?.stack) {
                  fileProcessErrorStack = parseFileError.stack;
                }
              }
            }
          }
          //#endregion
        }

        let uploadedFilePath: string =
          folderName +
          fileResult?.path.split(folderName)[
            fileResult?.path.split(folderName).length - 1
          ];
        const storageKey = isOther ? fileItem?.id : id;
        uploadedFilesStateData[storageKey] = {
          ...uploadedFilesStateData[storageKey], // Preserve existing data including raraResponse
          file: fileItem?.file,
          metadata: fileResult?.metadata,
          fileUrl: String(fileResult?.path),
          warning: raraMessage,
          FileProcessingErrorMessage: fileProcessError,
          expiryDate: extractedExpiryDate,
        };

        // Determine the status for this file
        const fileStatus = (() => {
          if (fileUploadError || insertError) {
            return DropzoneStatus.error;
          }
          
          // Check if extractionPercentage is 100, set to processed (complete) - only when AI is enabled
          const extractionPercentage =
            uploadedFilesStateData[storageKey]?.extractionPercentage;
          if (
            isChatSubscriptionActive &&
            extractionPercentage &&
            parseInt(extractionPercentage) === 100
          ) {
            return DropzoneStatus.complete;
          }

          // Check if extractionPercentage is between 1-99, set to processing - only when AI is enabled
          if (
            isChatSubscriptionActive &&
            extractionPercentage &&
            parseInt(extractionPercentage) >= 0 &&
            parseInt(extractionPercentage) <= 99
          ) {
            return DropzoneStatus.processing;
          }

          // If AI is enabled and parse-file was successful, set to processing even without extractionPercentage
          if (isChatSubscriptionActive && parseFileSuccessFlag) {
            return DropzoneStatus.processing;
          }
          return DropzoneStatus.uploaded;
        })();

        setUploadStatus((prevStatus) => ({
          ...prevStatus,
          [isOther ? fileItem?.id : id]: fileStatus as UploadStatus,
        }));

        // Get the documentLogsId for this file
        const matchedDocLog = insertedData?.filter(
          (item) =>
            formatFileName(String(item?.originalFileName ?? "")) ===
            formatFileName(files[index].name)
        );
        const documentLogsId = matchedDocLog?.[0]?.id;

        // If status is processing and we have documentLogsId, immediately update uploadedFiles 
        // so the child component can start polling
        if (fileStatus === DropzoneStatus.processing && documentLogsId) {
          setUploadedFiles((prevFiles) => ({
            ...prevFiles,
            [storageKey]: {
              file: fileItem?.file,
              fileSize: fileItem?.file?.size || 0,
              metadata: fileResult?.metadata,
              fileUrl: String(fileResult?.path),
              isDeleted: false,
              status: fileStatus,
              FileProcessingErrorMessage: "",
              documentLogsId: documentLogsId,
              expiryDate: uploadedFilesStateData[storageKey]?.expiryDate || null,
              raraResponse: uploadedFilesStateData[storageKey]?.raraResponse as RaraResponse | null,
              extractionPercentage: uploadedFilesStateData[storageKey]?.extractionPercentage || null,
            },
          }));
        }

        //Update query payload for DocumentLogs
        const documentLogsDataForUpdate = insertedData?.filter(
          (item) =>
            formatFileName(String(item?.originalFileName ?? "")) ===
            formatFileName(files[index].name)
        );

        if (!!documentLogsDataForUpdate && documentLogsDataForUpdate.length > 0) {
          // Get RARA response from uploadedFilesStateData using the correct key
          // RARA response is stored using document ID (id) or fileItem.id for other documents
          const responseKey = isOther ? fileItem?.id : id;
          const raraResponse =
            uploadedFilesStateData[responseKey]?.raraResponse || null;

          // Get expiry date from uploadedFilesStateData using the correct key
          const expiryDate =
            uploadedFilesStateData[responseKey]?.expiryDate || null;

          // Get extractionPercentage from uploadedFilesStateData using the correct key
          const extractionPercentage =
            uploadedFilesStateData[responseKey]?.extractionPercentage || null;

          const updateObject = errorMessage
            ? {
                status: DocumentLogsStatus.Error,
                error: { warning: raraMessage, error: fileProcessError, errorStack: fileProcessErrorStack || null },
                raraResponse: raraResponse,
                expiryDate: expiryDate,
                extractionPercentage: extractionPercentage,
              }
            : {
                fileName: fileProcessError
                  ? ""
                  : fileResult?.path.split("/").pop() || "",
                error: { warning: raraMessage, error: fileProcessError, errorStack: fileProcessError ? (fileProcessErrorStack || null) : null },
                status: fileProcessError
                  ? DocumentLogsStatus.Error
                  : parseFileSuccessFlag
                    ? DocumentLogsStatus.Processing
                    : DocumentLogsStatus.Uploaded,
                fileUrl: fileProcessError ? "" : fileResult?.path,
                raraResponse: raraResponse,
                expiryDate: expiryDate,
                extractionPercentage: extractionPercentage,
              };

          documentLogFiles_Updates.push({
            where: {
              id: { _eq: documentLogsDataForUpdate[0]?.id },
            },
            _set: updateObject,
          });

          // Only add to DocumentLogs if errorMessage is NOT present
          if (!errorMessage) {
            documentLogs_dates_payload.push({
              where: {
                id: { _eq: insertedData[0]?.id },
              },
              _set: {
                fileUrl: uploadedFilePath,
              },
            });
          }
        }
      });
      // Execute all uploads and validation in parallel
      await Promise.allSettled(uploadPromises);
      // allows all tasks to complete and reports success/failure individually.
      // Update dropzone configuration with new file data
      setDropzoneConfig((prevConfig) => {
        const dropzoneConfigData = prevConfig.map((items) => {
          return {
            ...items,
            sourceFileUrl: !!uploadedFilesStateData[items.id]
              ? uploadedFilesStateData[items.id].fileUrl
              : items?.sourceFileUrl,
            warning: !!uploadedFilesStateData[items.id]
              ? uploadedFilesStateData[items.id].warning
              : items?.warning,
            FileProcessingErrorMessage: !!uploadedFilesStateData[items.id]
              ? uploadedFilesStateData[items.id].FileProcessingErrorMessage
              : items?.FileProcessingErrorMessage,
          };
        });
        return dropzoneConfigData.sort((a, b) => a.seqIndex - b.seqIndex);
      });
      FilewithIdArray.forEach((items) => {
        removeProgressFromLocalStorage(`uploadProgress_${items?.id}`);
      });

      // Update the DocumentLogs into the DB
      const updatedData = await updateDocumentLogFiles({
        variables: { deletes: [], updates: documentLogFiles_Updates } as any,
      });

      if (!!updatedData?.data) {
        // POLLING REMOVED: Force polling refresh disabled
        // setForcePollingRefresh(true);
        console.log(
          `DB update completed for ${files.length} file(s) - polling disabled`
        );

        // Refetch document logs data to get the latest information including RARA ratings and document validity
          try {
            await pageLoadDocumentLogsData.refetch();
          } catch (refetchError) {
            console.error("Error refetching document logs data:", refetchError);
        }

        // Update the uploadedFiles state with the inserted data
        Object.keys(uploadedFilesStateData).forEach((uploadFileItem) => {
          // Filter the inserted data to find the corresponding file data
          const fileData = !!updatedData?.data?.update_result
            ? updatedData?.data?.update_result?.filter(
                (items) =>
                  items?.returning[0].fileUrl ==
                  uploadedFilesStateData[uploadFileItem]?.fileUrl
              )
            : [];

          // Update the uploadedFiles state with the new file data
          setUploadedFiles((prevFiles) => ({
            ...prevFiles,
            [uploadFileItem]: {
              file: uploadedFilesStateData[uploadFileItem]?.file,
              fileSize: uploadedFilesStateData[uploadFileItem]?.file?.size || 0,
              metadata: uploadedFilesStateData[uploadFileItem]?.metadata,
              fileUrl: uploadedFilesStateData[uploadFileItem]?.fileUrl,
              isDeleted: false,
              status: String(
                fileData.length > 0 ? fileData[0]?.returning[0]?.status : ""
              ),
              FileProcessingErrorMessage: "",
              documentLogsId: fileData[0]?.returning[0]?.id,
              expiryDate:
                uploadedFilesStateData[uploadFileItem]?.expiryDate || null,
              raraResponse: uploadedFilesStateData[uploadFileItem]
                ?.raraResponse as RaraResponse | null,
              extractionPercentage:
                uploadedFilesStateData[uploadFileItem]?.extractionPercentage ||
                null,
            },
          }));
        });

        // Track expired documents AFTER setUploadedFiles has been called
        // This ensures uploadedFiles has the expiryDate before we switch tabs
        // Count the number of expired documents in this upload batch
        let expiredCount = 0;
        Object.keys(uploadedFilesStateData).forEach((uploadFileItem) => {
          const expiryDate = uploadedFilesStateData[uploadFileItem]?.expiryDate;
          if (expiryDate) {
            const expiry = new Date(expiryDate);
            const current = new Date();
            if (expiry < current) {
              expiredCount++;
            }
          }
        });

        // Call trackExpiredDocument ONCE with the total count of expired documents
        // This prevents multiple increments from happening
        if (expiredCount > 0) {
          const popupResult = await trackExpiredDocument(
            expiredCount, // Number of expired documents in this batch
            files, // Pass original files array to know if it was single or bulk upload
            showExpiredDocuments
          );

          // Show popup if at least one file is expired
          if (popupResult.shouldShowPopup) {
            // Check if popup is already open
            if (isExpiredPopupOpenRef.current) {
              // Popup is already open - accumulate counts and send update message
              pendingExpiredCountsRef.current.expiredCount += popupResult.expiredCount;
              pendingExpiredCountsRef.current.totalCount += popupResult.totalCount;
          
              postParentMessage(
                documentRepositoryExpiredDocumentsPopup(
                  pendingExpiredCountsRef.current.expiredCount,
                  pendingExpiredCountsRef.current.totalCount,
                  true // isUpdate = true
                )
              );
            } else {
              // No popup currently open - mark as open and send new popup message
              isExpiredPopupOpenRef.current = true;
              pendingExpiredCountsRef.current.expiredCount = popupResult.expiredCount;
              pendingExpiredCountsRef.current.totalCount = popupResult.totalCount;
              
              postParentMessage(
                documentRepositoryExpiredDocumentsPopup(
                  popupResult.expiredCount,
                  popupResult.totalCount,
                  false // isUpdate = false
                )
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error inserting files and updating cards:", error);
    } finally {
      // Reset upload in progress flag using microtask queue instead of setTimeout
      // This allows React to batch and flush all state updates before polling resumes
      // Use Promise.resolve() to schedule in microtask queue (runs immediately after state updates)
      Promise.resolve().then(() => {
        isUploadInProgressRef.current = false;
        // POLLING REMOVED: Upload tracking disabled
        // endUploadTracking(id);
      });
    }
  };

  const handleDrop = async (
    id: string,
    files: File[],
    isOther: boolean,
    docTitle: string
  ) => {
    console.log("[DocumentRepository] handleDrop called for id:", id, {
      files,
      isOther,
      docTitle,
    });
    // Duplicate check before uploading
    // const dupResult = await findDuplicates(files);
    // if (
    //   dupResult.duplicateFiles &&
    //   dupResult.duplicateFiles.length > 0 &&
    //   dupResult.documentFilesData
    // ) {
    //   if (dupResult.duplicateFileInfo) {
    //     postParentMessage(
    //       documentRepositoryDuplicateDocumentModal(
    //         dupResult.duplicateFileInfo,
    //         dupResult.payloadFiles,
    //         id,
    //         isOther,
    //         docTitle
    //       )
    //     );
    //   }
    //   if ((dupResult.uniqueFiles || []).length === 0) return;
    //   // continue with unique files (if any)
    //   await processUniqueFiles(id, dupResult.uniqueFiles, isOther, docTitle);
    // } else {
    await processUniqueFiles(id, files, isOther, docTitle);
    // }
  };

  const handleDelete = useCallback(
    async (
      configId: string,
      documentLogsId: string,
      fileUrl: string,
      cardArray: AISuggestedDocumentType[],
      status: string
    ) => {
      if (!status) return;

      // Asynchronously delete embeddings in background - fire and forget
      if (documentLogsId) {
        console.log(
          `[DocumentRepository] Initiating background embedding deletion for document: ${documentLogsId}`
        );

        // Background deletion - don't await, let it run independently
        fetch("/api/AI/AIprocessing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            process: "deleteParsedDocument",
            data: {
              document_log_ids: [documentLogsId],
            },
          }),
        })
          .then(async (response) => {
            if (response.ok) {
              const result = await response.json();
            } else {
              const errorData = await response
                .json()
                .catch(() => ({ error: "Unknown error" }));
              console.warn(
                `[DocumentRepository] Background embedding deletion initiation failed for document ${documentLogsId}:`,
                {
                  status: response.status,
                  statusText: response.statusText,
                  error: errorData,
                }
              );
            }
          })
          .catch((error) => {
            console.warn(
              `[DocumentRepository] Background embedding deletion request failed for document ${documentLogsId}:`,
              error
            );
          });
      }

      // Update the uploaded files state to mark the file as deleted
      setUploadedFiles((prevFiles) => ({
        ...prevFiles,
        [configId]: {
          ...prevFiles[configId],
          isDeleted: true,
        },
      }));

      // Prepare the update object for marking the document as deleted
      const deleteUpdateObject = {
        status: DocumentLogsStatus.Deleted,
        deletedBy: userSession?.user?.id,
        // deletedBy: userContext.userId,
        deletedAt: new Date().toISOString(),
      };

      const documentLogFiles_Updates: DocumentLogs_Updates[] = [
        {
          where: {
            id: { _eq: documentLogsId },
            companyId: { _eq: userContext.companyId },
          },
          _set: deleteUpdateObject,
        },
      ];

      // Always update the database to mark the document as deleted, regardless of URL validity or status
      try {
        const result = await updateDocumentLogFiles({
          variables: {
            deletes: [],
            updates: documentLogFiles_Updates,
          },
        });
      } catch (error) {
        console.error("Error updating document log files:", error);
      }

      localRefreshUI(cardArray, configId);
    },
    [
      localRefreshUI,
      updateDocumentLogFiles,
      userContext.companyId,
      userSession?.user?.id,
    ]
  );

  // --- helpers for duplicate handling (keeps handleDuplicate small) ---
  const reconstructActualFile = async (file: any): Promise<File | null> => {
    try {
      if (file instanceof File) return file;
      if (file && typeof file.arrayBuffer === "function") {
        try {
          const ab = await file.arrayBuffer();
          try {
            return new File([ab], file.name || "file", {
              type: file.type || "",
              lastModified: file.lastModified || Date.now(),
            });
          } catch (e) {
            const blob = new Blob([ab], { type: file.type || "" });
            return new File([blob], file.name || "file", {
              type: file.type || "",
              lastModified: file.lastModified || Date.now(),
            });
          }
        } catch (e) {
          console.warn("reconstructActualFile: cannot read arrayBuffer", e);
          return null;
        }
      }

      // handle typed-array wrappers / raw buffer shapes
      if (file && file.buffer) {
        let ab: ArrayBuffer | null = null;
        try {
          if (file.buffer instanceof ArrayBuffer)
            ab = file.buffer as ArrayBuffer;
          else if (file.buffer.data && file.buffer.data.buffer)
            ab = file.buffer.data.buffer as ArrayBuffer;
        } catch (e) {
          /* ignore */
        }
        if (ab) {
          try {
            return new File([ab], file.name || "file", {
              type: file.type || "",
              lastModified: file.lastModified || Date.now(),
            });
          } catch (e) {
            const blob = new Blob([ab], { type: file.type || "" });
            return new File([blob], file.name || "file", {
              type: file.type || "",
              lastModified: file.lastModified || Date.now(),
            });
          }
        }
      }
    } catch (e) {
      console.warn("reconstructActualFile: unexpected error", e);
    }
    return null;
  };

  const insertDocumentLog = async (file: File, id: string) => {
    const payload: DocumentLogs_Insert_Input[] = [];
    const uniqueId = `${crypto.randomUUID()}-0`;
    payload.push({
      originalFileName: file.name,
      fileUrl: uniqueId,
      fileName: uniqueId,
      aiSuggestedDocumentId: id,
      createdBy: userContext.userId,
      fileSize: String(file.size),
      error: { warning: "", error: "" },
      status: DocumentLogsStatus.Uploading,
      companyId: userContext.companyId,
    });
    try {
      const insertResult = await insertDocumentsLogsFiles({
        variables: { data: payload },
      });
      const inserted = insertResult?.data?.insert_DocumentLogs?.returning || [];
      return inserted[0] || null;
    } catch (e) {
      console.error("insertDocumentLog failed:", e);
      return null;
    }
  };

  const uploadAndPersist = async (
    newDoc: DocumentLogs,
    actualFile: File,
    id: string,
    isOther: boolean
  ) => {
    const folderName = `AI_SOURCES/${userContext.companyId}`;
    const { fileInfo: fileResult, error: errorMessage } = await uploadFile(
      isOther ? id : id,
      actualFile,
      false,
      folderName
    );

    const updateObject = errorMessage
      ? {
          status: DocumentLogsStatus.Error,
          error: {
            warning: "",
            error: "File upload failed. Please try again later.",
          },
        }
      : {
          fileName: fileResult?.path.split("/").pop() || "",
          fileUrl: fileResult?.path || "",
          status: DocumentLogsStatus.Uploaded,
          error: { warning: "", error: "" },
        };

    try {
      await updateDocumentLogFiles({
        variables: {
          deletes: [],
          updates: [{ where: { id: { _eq: newDoc.id } }, _set: updateObject }],
        },
      });
    } catch (e) {
      console.error("uploadAndPersist: failed to update DocumentLogs:", e);
    }

    const uploadedPath = fileResult?.path || "";
    return { fileResult, errorMessage, uploadedPath };
  };

  const updateUIAfterDuplicate = (
    oldDocId: string | undefined,
    newDoc: DocumentLogs,
    isOther: boolean,
    id: string,
    actualFile: File,
    fileResult: any,
    errorMessage: any
  ) => {
    const uploadedPath = fileResult?.path || "";
    const newCardId = isOther ? newDoc.id : id;

    // Try derive old card key from pageLoadDocumentLogsData first
    let computedOldCardKey: string | undefined = undefined;
    try {
      const oldRecord = pageLoadDocumentLogsData?.data?.DocumentLogs?.find(
        (d: any) => d?.id === oldDocId
      );
      if (oldRecord) computedOldCardKey = oldRecord.id; // Use document log ID for consistency
    } catch (e) {
      /* ignore */
    }

    setUploadedFiles((prevFiles) => {
      const next = { ...prevFiles };
      const currentOldCardKey =
        computedOldCardKey ||
        Object.keys(prevFiles).find(
          (k) => prevFiles[k]?.documentLogsId === oldDocId
        );

      setDropzoneConfig((prevConfig) => {
        let newConfig = prevConfig.slice();
        if (currentOldCardKey) {
          const oldCard = newConfig.find((c) => c.id === currentOldCardKey);
          if (oldCard && oldCard.isOther)
            newConfig = newConfig.filter(
              (item) => item.id !== currentOldCardKey
            );
          else if (oldCard)
            newConfig = newConfig.map((item) =>
              item.id === currentOldCardKey
                ? { ...item, sourceFileUrl: "", FileProcessingErrorMessage: "" }
                : item
            );
        }

        if (isOther) {
          const otherTemplateIndex = newConfig.findIndex(
            (c) => c.isOther && c.title === "Other Documents"
          );

          // Find all existing "Other" cards to calculate proper sequence index
          const allOtherCards = newConfig.filter((c) => c.isOther);
          const maxOtherSeqIndex =
            allOtherCards.length > 0
              ? Math.max(...allOtherCards.map((card) => card.seqIndex))
              : newConfig[otherTemplateIndex]?.seqIndex || 0;

          // Find first non-other card after all other cards to calculate gap
          const regularCards = newConfig
            .filter((c) => !c.isOther)
            .sort((a, b) => a.seqIndex - b.seqIndex);
          const nextRegularCardSeqIndex =
            regularCards.length > 0
              ? regularCards[0].seqIndex
              : maxOtherSeqIndex + 2;

          const newCard: AISuggestedDocumentType = {
            id: newDoc.id,
            maxSize: newConfig[otherTemplateIndex]?.maxSize || 0,
            sampleFileUrl: newConfig[otherTemplateIndex]?.sampleFileUrl || "",
            seqIndex: maxOtherSeqIndex + 1,
            title: formatFileName(
              String(newDoc.originalFileName || actualFile.name)
            ),
            acceptedFormats: newConfig[otherTemplateIndex]?.acceptedFormats || {
              acceptedFormats: [],
            },
            isOther: true,
            warning: "",
            FileProcessingErrorMessage: "",
            sourceFileUrl: uploadedPath,
          };

          // Insert the new card after all existing other cards
          const lastOtherCardIndex =
            otherTemplateIndex >= 0
              ? Math.max(
                  ...allOtherCards.map((card) =>
                    newConfig.findIndex((c) => c.id === card.id)
                  )
                )
              : -1;

          if (lastOtherCardIndex >= 0) {
            newConfig.splice(lastOtherCardIndex + 1, 0, newCard);
          } else {
            newConfig = [newCard, ...newConfig];
          }

          // Update sequence indices for regular cards to ensure they come after all other cards
          const updatedRegularCards = regularCards.map((card, idx) => ({
            ...card,
            seqIndex:
              Math.max(maxOtherSeqIndex + 2, nextRegularCardSeqIndex) + idx,
          }));

          // Update the config with new sequence indices for regular cards
          newConfig = newConfig.map((card) => {
            if (!card.isOther) {
              const updatedCard = updatedRegularCards.find(
                (rc) => rc.id === card.id
              );
              return updatedCard || card;
            }
            return card;
          });
        } else {
          newConfig = newConfig.map((item) =>
            item.id === id
              ? {
                  ...item,
                  sourceFileUrl: uploadedPath,
                  FileProcessingErrorMessage: "",
                }
              : item
          );
        }

        return newConfig.sort((a, b) => a.seqIndex - b.seqIndex);
      });

      try {
        if (currentOldCardKey && currentOldCardKey !== newCardId) {
          const oldCardConfig = dropzoneConfig.find(
            (c) => c.id === currentOldCardKey
          );
          if (oldCardConfig && oldCardConfig.isOther)
            delete next[currentOldCardKey];
          else
            next[currentOldCardKey] = {
              file: null,
              fileSize: 0,
              metadata: null,
              fileUrl: "",
              documentLogsId: "",
              isDeleted: false,
              status: "",
              FileProcessingErrorMessage: "",
              expiryDate: null,
              raraResponse: null,
              extractionPercentage: null,
            };
        }
      } catch (e) {
        console.warn(
          "updateUIAfterDuplicate: failed clearing old uploadedFiles entry",
          e
        );
      }

      next[newCardId] = {
        file: actualFile,
        fileSize: actualFile?.size || 0,
        metadata: fileResult?.metadata || undefined,
        fileUrl: uploadedPath,
        documentLogsId: newDoc.id,
        isDeleted: false,
        status: errorMessage
          ? DocumentLogsStatus.Error
          : DocumentLogsStatus.Uploaded,
        FileProcessingErrorMessage: String(errorMessage || ""),
        expiryDate: null,
        raraResponse: (fileResult?.raraResponse as RaraResponse) || null,
        extractionPercentage: null,
      };

      setUploadStatus((prev) => {
        const nextStatus = { ...prev } as any;
        nextStatus[newCardId] = errorMessage
          ? (DropzoneStatus.error as UploadStatus)
          : (DropzoneStatus.uploaded as UploadStatus);
        if (
          typeof currentOldCardKey !== "undefined" &&
          currentOldCardKey &&
          currentOldCardKey !== newCardId
        )
          nextStatus[currentOldCardKey] = DropzoneStatus.idle as UploadStatus;
        return nextStatus;
      });

      return next;
    });
  };

  const handleDuplicate = useCallback(
    async (
      duplicateFilesData: any,
      filesData: any[],
      id: string,
      isOther: boolean,
      docTitle: string
    ) => {
      if (!duplicateFilesData) return;

      // duplicateFilesData may be an array of DuplicateFileInfo when bulk
      const duplicatesArray: DuplicateFileInfo[] = Array.isArray(
        duplicateFilesData
      )
        ? duplicateFilesData
        : [duplicateFilesData];

      // If user cancelled, the modal won't call this handler â€” but if called with empty array, just return
      if (duplicatesArray.length === 0) return;

      // POLLING REMOVED: Upload tracking disabled
      // startUploadTracking(id);

      // Build payload to soft-delete all existing DocumentLogs for the duplicates
      const deletePayload: DocumentLogs_Updates[] = duplicatesArray
        .filter((d) => d.documentLogsId)
        .map((d) => ({
          where: { id: { _eq: d.documentLogsId } },
          _set: {
            status: DocumentLogsStatus.Deleted,
            deletedBy: userContext.userId,
            deletedAt: new Date().toISOString(),
          },
        }));

      if (deletePayload.length > 0) {
        try {
          const deleteRes = await updateDocumentLogFiles({
            variables: { deletes: [], updates: deletePayload },
          });
        } catch (err) {
          console.error(
            "handleDuplicate: failed to mark old docs Deleted:",
            err
          );
        }
      }

      // For each fileData, find matching duplicate info by originalFileName
      for (const fileWrapper of filesData || []) {
        const file = fileWrapper as any;
        if (!file) continue;

        // set uploading status for non-other
        if (!isOther)
          setUploadStatus((prev) => ({
            ...prev,
            [id]: DropzoneStatus.uploading as UploadStatus,
          }));

        const actualFile = await reconstructActualFile(file);
        if (!actualFile) {
          console.warn(
            "handleDuplicate (bulk): no File object available for upload",
            { file }
          );
          continue;
        }

        // Insert db row
        const newDoc = await insertDocumentLog(actualFile, id);
        if (!newDoc) continue;

        // Upload and persist update
        const { fileResult, errorMessage } = await uploadAndPersist(
          newDoc,
          actualFile,
          id,
          isOther
        );

        // Try to find the oldDocId for UI update
        const matched = duplicatesArray.find(
          (d) =>
            formatFileName(String(d.originalFileName || "")) ===
            formatFileName(String(actualFile.name || ""))
        );
        const oldDocId = matched?.documentLogsId;

        // Update UI per replaced file
        updateUIAfterDuplicate(
          oldDocId,
          newDoc,
          isOther,
          id,
          actualFile,
          fileResult,
          errorMessage
        );

        // cleanup per-file progress key
        try {
          const key = `uploadProgress_${isOther ? id : id}`;
          if (typeof window !== "undefined") {
            const progress = localStorage.getItem(key);
            if (progress === "100") {
              localStorage.removeItem(key);
              window.dispatchEvent(new Event("storage"));
            }
          }
        } catch (e) {}
      }

      // Ensure the duplicate-processing guard is removed and return.
      cleanupDuplicateProcessing(duplicateFilesData);
      // POLLING REMOVED: Upload tracking disabled
      // endUploadTracking(id);
      return;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  );

  const [showAll, setShowAll] = useState(false);
  const [viewClick, setViewClick] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllExpired, setShowAllExpired] = useState(false);

  // Wrapper for isDocumentExpired from hook
  const localIsDocumentExpired = useCallback(
    (configId: string) => {
      return isDocumentExpired(configId, uploadedFiles);
    },
    [isDocumentExpired, uploadedFiles]
  );

  // Check if there are any expired documents to show/hide the button
  const hasExpiredDocuments = useMemo(() => {
    return dropzoneConfig.some((config) => localIsDocumentExpired(config.id));
  }, [dropzoneConfig, localIsDocumentExpired]);

  // Get filtered expired documents count
  const expiredDocumentsCount = useMemo(() => {
    return dropzoneConfig.filter((config) => {
      const matchesSearch =
        searchTerm === "" ||
        config.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (uploadedFiles[config.id]?.file?.name &&
          uploadedFiles[config.id].file?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      return matchesSearch && localIsDocumentExpired(config.id);
    }).length;
  }, [dropzoneConfig, uploadedFiles, searchTerm, localIsDocumentExpired]);

  // Get filtered non-expired documents count
  const nonExpiredDocumentsCount = useMemo(() => {
    return dropzoneConfig.filter((config) => {
      const matchesSearch =
        searchTerm === "" ||
        config.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (uploadedFiles[config.id]?.file?.name &&
          uploadedFiles[config.id].file?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const isExpired = localIsDocumentExpired(config.id);
      // Check if this is a system-generated document
      const isSystemGenerated = uploadedFiles[config.id]?.createdBy === null;

      // Include non-expired documents AND all system-generated documents
      return matchesSearch && (!isExpired || isSystemGenerated);
    }).length;
  }, [dropzoneConfig, uploadedFiles, searchTerm, localIsDocumentExpired]);

  useEffect(() => {
    setShowAll(
      viewClick
        ? true
        : dropzoneConfig.length > NumberOfDatainFirstRow
          ? false
          : true
    );
  }, [dropzoneConfig.length, viewClick]);

  // Reset showAllExpired when switching between tabs
  useEffect(() => {
    setShowAllExpired(false);
  }, [showExpiredDocuments]);

  const toggleShowAll = () => {
    setShowAll((prev) => !prev);
    setViewClick((prev) => !prev);
  };

  const handleOnDeleteClick = async (
    id: string,
    fileUrl: string,
    documentLogsId: string,
    dropzoneConfig: AISuggestedDocumentType[],
    status: string
  ) => {
    const alreadyDeletedData =
      await localHandleToCheckFileIsAlreadyDeleted(documentLogsId);
    const userDetail = await getUserDetailsById({
      variables: { id: alreadyDeletedData?.deletedByUserId },
    });

    const formatedDate = formatDate(alreadyDeletedData?.deletedAt);
    const originalFileName =
      uploadedFiles[id]?.file?.name ||
      dropzoneConfig.find((config) => config.id === id)?.title ||
      "Unknown File";

    if (alreadyDeletedData && alreadyDeletedData.deletedByUserId) {
      postParentMessage(
        rejectAlreadyDeletedFileMessageModal(
          userDetail.data?.User?.[0]?.name ?? "",
          formatedDate,
          id,
          dropzoneConfig
        )
      );
      return;
    }
    postParentMessage(
      documentRepositoryDeleteFileModal(
        id,
        fileUrl,
        documentLogsId,
        dropzoneConfig,
        status,
        originalFileName
      )
    );
  };

  // Wrapper for handleToCheckFileIsAlreadyDeleted from hook
  const localHandleToCheckFileIsAlreadyDeleted = async (
    documentLogsId: string
  ) => {
    return handleToCheckFileIsAlreadyDeleted(
      documentLogsId,
      userContext,
      getDocumentLogs
    );
  };

  // Wrapper for handleInsertRejectedFiles from hook
  const localHandleInsertRejectedFiles = async (
    id: string,
    files: rejectedFiles[],
    anyotherDocuments: boolean
  ) => {
    return handleInsertRejectedFiles(
      id,
      files,
      anyotherDocuments,
      userContext,
      dropzoneConfig,
      uploadStatus,
      uploadedFiles,
      insertDocumentsLogsFiles,
      setDropzoneConfig,
      setUploadStatus,
      setUploadedFiles
    );
  };

  return dropzoneConfig.length === 0 ? (
    <Box className="popup_spinner">
      <Spinner visible={true} />
    </Box>
  ) : (
    <>
      <Container fluid px={5} bg="transparent">
        <Box>
          <InfoItem
            c="#122F47"
            fz="30px"
            lh="normal"
            fw={400}
            label={headingTextData?.mainHeading}
            align="left"
          />
          <Space h={28} />
          <Flex align="center" justify="space-between" wrap="nowrap">
            <InfoItem
              c="#122F47"
              fz="20px"
              lh="normal"
              fw={400}
              label={headingTextData?.subHeading}
              align="left"
            />
            <Flex align="center" justify="flex-end" gap={30} wrap="nowrap">
              <TextInput
                placeholder="Search Documents..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                w={320}
                h={36}
                onFocus={() => setisfocused(true)}
                onBlur={() => setisfocused(false)}
                icon={<SearchInputIcon color={isfocused ? "#005C81" : "#666666"} />}
                rightSection={
                  searchTerm && (
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      onClick={() => setSearchTerm("")}
                    >
                      <IconX size={16} color={isfocused ? "#005C81" : "#666666"} />
                    </ActionIcon>
                  )
                }
                styles={{
                  input: {
                    border: `1px solid ${isfocused ? "#005C81" : "#F1F3F6"}`,
                    borderRadius: 30,
                    fontSize: "14px",
                    backgroundColor: "#F1F3F6",
                    color: "#495057",
                    paddingRight: 30,
                    "&::placeholder": { color: "#666666" },
                    "&:hover": {
                      borderColor: "#005C81 !important",
                    },
                  },
                  icon: { marginLeft: 5 },
                }}
              />
              {hasExpiredDocuments && (
                <Button
                  color="outlineBtn"
                  onClick={() => {
                    const isViewingExpired = !showExpiredDocuments;
                    setShowExpiredDocuments(isViewingExpired);
                    setSearchTerm("");

                    // When viewing expired documents tab, mark as viewed
                    // The hook will handle clearing the database count via its own useEffect
                    if (isViewingExpired) {
                      setHasViewedExpiredTab(true);
                    }
                  }}
                >
                  {showExpiredDocuments
                    ? "View All Documents"
                    : "View Expired Documents"}

                  {!hasViewedExpiredTab && newExpiredDocumentsCount !== 0 && (
                    <Box
                      bg="#DD3E3E"
                      px={5}
                      ml={5}
                      h={18}
                      miw={18}
                      sx={{
                        borderRadius: 22,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 10,
                        letterSpacing: 0,
                        lineHeight: "22px",
                      }}
                    >
                      {newExpiredDocumentsCount}
                    </Box>
                  )}
                </Button>
              )}
            </Flex>
          </Flex>
          <Space h={28} />
          {(() => {
            const filteredConfigs = dropzoneConfig.filter((config) => {
              // Search filter - search in both title and filename
              const matchesSearch =
                searchTerm === "" ||
                config.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (uploadedFiles[config.id]?.file?.name &&
                  uploadedFiles[config.id].file?.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()));

              // Use the helper function to check if document is expired
              const isExpired = localIsDocumentExpired(config.id);

              // Check if this is a system-generated document
              const isSystemGenerated =
                uploadedFiles[config.id]?.createdBy === null;

              if (showExpiredDocuments) {
                // In expired documents tab: Show only expired documents that match search
                // System-generated documents should only appear if they are actually expired
                return matchesSearch && isExpired;
              } else {
                // In all documents tab: Show non-expired documents AND all system-generated documents
                // System-generated documents should always appear in "All Documents" tab
                return matchesSearch && (!isExpired || isSystemGenerated);
              }
            });
            if (filteredConfigs.length === 0) {
              return (
                <Center h={300}>
                  <Text c="#666" fz={18} my={40}>
                    No Result Found
                  </Text>
                </Center>
              );
            }
            return (
              <SimpleGrid
                spacing="sm"
                m="0"
                breakpoints={[
                  {
                    minWidth: "xs",
                    cols: 1,
                    spacing: "xl",
                    verticalSpacing: "xl",
                  },
                  {
                    minWidth: "sm",
                    cols: 2,
                    spacing: "xl",
                    verticalSpacing: "xl",
                  },
                  {
                    minWidth: "md",
                    cols: 4,
                    spacing: 32,
                    verticalSpacing: 32,
                  },
                ]}
              >
                {filteredConfigs
                  .sort((a, b) => {
                    // Sort expired documents by creation date (most recent first) when in expired tab
                    if (showExpiredDocuments) {
                      const getCreatedAt = (configId: string) => {
                        // POLLING REMOVED: No longer checking polledDocumentLogs for real-time data
                        // const polledDoc = polledDocumentLogs?.find(
                        //   (log: any) =>
                        //     log.id === configId ||
                        //     log.id === uploadedFiles[configId]?.documentLogsId
                        // );
                        // if (polledDoc?.createdAt) {
                        //   return new Date(polledDoc.createdAt);
                        // }
                        
                        // Use pageLoadDocumentLogsData instead

                        // Fall back to pageLoadDocumentLogsData
                        const documentLog =
                          pageLoadDocumentLogsData?.data?.DocumentLogs?.find(
                            (log) =>
                              log.id === configId ||
                              log.id === uploadedFiles[configId]?.documentLogsId
                          );
                        if (documentLog?.createdAt) {
                          return new Date(documentLog.createdAt);
                        }

                        // For newly uploaded files not yet in any data source,
                        // check if the file exists in uploadedFiles (just uploaded)
                        // Use current time so it appears at the top
                        if (
                          uploadedFiles[configId]?.file &&
                          !uploadedFiles[configId]?.isDeleted
                        ) {
                          return new Date(); // Newly uploaded, show at top
                        }

                        return new Date(0);
                      };

                      const dateA = getCreatedAt(a.id);
                      const dateB = getCreatedAt(b.id);

                      // Sort by most recent first (descending order)
                      return dateB.getTime() - dateA.getTime();
                    }
                    // For non-expired documents, keep original order (by seqIndex)
                    return a.seqIndex - b.seqIndex;
                  })
                  .slice(
                    0,
                    showExpiredDocuments
                      ? showAllExpired
                        ? expiredDocumentsCount
                        : 8
                      : showAll
                        ? nonExpiredDocumentsCount
                        : NumberOfDatainFirstRow
                  )
                  .map((config) => (
                    <DropzoneCard
                      key={config.id}
                      id={config.id}
                      heading={config.title}
                      sampleLink={config?.sampleFileUrl!}
                      files={
                        uploadedFiles[config.id]?.file
                          ? [
                              {
                                name: uploadedFiles[config.id]?.file?.name!,
                                size: uploadedFiles[config.id]?.fileSize || 0,
                                status: uploadStatus[config.id],
                                metadata: uploadedFiles[config.id].metadata,
                                documentLogsId:
                                  uploadedFiles[config.id]?.documentLogsId,
                              },
                            ]
                          : []
                      }
                      maxSize={config.maxSize}
                      acceptedFormats={config.acceptedFormats.acceptedFormats}
                      uploadStatus={uploadStatus[config.id] || "idle"}
                      onDrop={(files: any) =>
                        handleDrop(
                          config.id,
                          files,
                          config.isOther,
                          config.title
                        )
                      }
                      onStatusChange={(status) => {
                        setUploadStatus(prev => ({
                          ...prev,
                          [config.id]: status as UploadStatus
                        }));
                      }}
                      onComplete={() => {
                        localSetFileStatus(config.id);
                      }}
                      onProcessWithAI={localHandleProcessWithAI}
                      onDelete={() => {
                        handleOnDeleteClick(
                          config.id,
                          uploadedFiles[config.id]?.fileUrl,
                          uploadedFiles[config.id]?.documentLogsId,
                          dropzoneConfig,
                          uploadedFiles[config.id]?.status
                        );
                      }}
                      isDeleting={uploadedFiles[config.id]?.isDeleted}
                      anyotherDocuments={config.isOther}
                      dataPoint={config.dataPoints || 0}
                      warningMessage={config.warning}
                      FileProcessingErrorMessage={
                        uploadedFiles[config.id]?.FileProcessingErrorMessage
                          ? uploadedFiles[config.id]?.FileProcessingErrorMessage
                          : config.FileProcessingErrorMessage
                      }
                      insertRejectedFiles={(file, anyotherDocuments) => {
                        localHandleInsertRejectedFiles(
                          config.id,
                          file,
                          anyotherDocuments
                        );
                      }}
                      expiryDate={(() => {
                        // Check if document validity check is enabled for the company
                        const isDocumentValidityCheckEnabled =
                          companyDetails?.Company?.[0]?.metadata
                            ?.isDocumentValidityCheckEnabled === true;

                        // If document validity check is not enabled, return null
                        if (!isDocumentValidityCheckEnabled) {
                          return null;
                        }

                        // Otherwise return the original expiryDate
                        return uploadedFiles[config.id]?.expiryDate || null;
                      })()}
                      raraResponse={(() => {
                        // Check if RARA is enabled for document repository in company metadata
                        const isRARAEnabled =
                          companyDetails?.Company?.[0]?.metadata
                            ?.isRARAEnabled === true;

                        // If RARA is not enabled, return null
                        if (!isRARAEnabled) {
                          return null;
                        }

                        // Get the correct AI suggested document ID
                        // For uploaded files, we need to use the aiSuggestedDocumentId from the uploadedFiles data
                        // For template cards, we can use config.id directly
                        let aiSuggestedDocumentId = config.id;

                        // Check if this is an uploaded file (has documentLogsId)
                        const uploadedFileData = uploadedFiles[config.id];
                        if (uploadedFileData?.documentLogsId) {
                          // This is an uploaded file, find the AI suggested document ID from document logs
                          const documentLog =
                            pageLoadDocumentLogsData?.data?.DocumentLogs?.find(
                              (log) =>
                                log.id === uploadedFileData.documentLogsId
                            );
                          // Use aiSuggestedDocumentId if available, otherwise fallback to config.id
                          aiSuggestedDocumentId =
                            documentLog?.aiSuggestedDocumentId;
                        }
                        // Get masterDocumentKey from AISuggestedDocuments using the correct ID
                        const aiSuggestedDoc =
                          AISuggestedDocumentData?.AISuggestedDocuments?.find(
                            (doc: any) => doc.id === aiSuggestedDocumentId
                          );
                        const masterDocumentKey =
                          aiSuggestedDoc?.masterDocumentKey;

                        // If masterDocumentKey is null, empty, or blank, return raraResponse with document_rating: null
                        if (
                          !masterDocumentKey ||
                          masterDocumentKey === null ||
                          masterDocumentKey.trim() === ""
                        ) {
                          return {
                            document_rating: null,
                            recommendations: [],
                            reason_for_rating: "",
                          };
                        }

                        // Otherwise return the original raraResponse
                        return uploadedFiles[config.id]?.raraResponse || null;
                      })()}
                      extractionPercentage={
                        uploadedFiles[config.id]?.extractionPercentage || null
                      }
                      isChatSubscriptionActive={isChatSubscriptionActive}
                      isSystemGenerated={
                        uploadedFiles[config.id]?.createdBy === null || false
                      }
                      companyId={userContext.companyId}
                    />
                  ))}
              </SimpleGrid>
            );
          })()}
          {showExpiredDocuments ? (
            // Show "Show More" button for expired documents if there are more than 8
            expiredDocumentsCount > 8 ? (
              <Center>
                <Button
                  color="outlineBtn"
                  my="xl"
                  onClick={() => setShowAllExpired(!showAllExpired)}
                >
                  {showAllExpired
                    ? "SHOW LESS"
                    : `SHOW MORE (${
                        expiredDocumentsCount - 8
                      } MORE EXPIRED DOCUMENTS)`}
                </Button>
              </Center>
            ) : null
          ) : // Show "VIEW ALL SUGGESTED DOCUMENTS" button for non-expired documents
          nonExpiredDocumentsCount > NumberOfDatainFirstRow ? (
            <Center>
              <Button
                color="outlineBtn"
                my="xl"
                onClick={toggleShowAll}
              >
                {showAll
                  ? "SHOW LESS"
                  : `VIEW ALL ${nonExpiredDocumentsCount} SUGGESTED DOCUMENTS`}
              </Button>
            </Center>
          ) : null}
        </Box>
      </Container>
    </>
  );
};

export default DocumentRepository;

//ADD: Function to filter latest system-generated documents per unique form
//[CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]: Implementation --> Added groupby logic to get latest system-generated documents per unique form
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
      const { data: invitationData } = await getFormInvitationDetailsCallback({
        variables: {
          invitationId: invitationId,
          sourceType: SourcesType.Uploaded?.dbTittle,
        },
        fetchPolicy: "network-only",
      });

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
