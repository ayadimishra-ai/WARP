import { formatFileName, getUserContext, isUserAllowedAIFeature } from "@/modules/warp/packages/client/features/form/common-functions";
import * as GQLTypes from "@/modules/warp/packages/graphql/generated/types";
import { DocumentLogs_Insert_Input } from "@/modules/warp/packages/graphql/generated/types";
import { useBulk_Update_Document_LogFilesMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-document-logFiles";
import { useUpdateUserDetailByIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-userdetail-by-id";
import { useGetActiveSubscriptionByCompanyIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-active-subscription-by-company-id";
import { useGetDocumentLogsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-document-logs";
import { useGetUserDetailByIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-userdetail-by-id";
import { DocumentLogsStatus, DropzoneStatus, rejectedFiles, SourcesType, UploadStatus } from "@/modules/warp/packages/shared/constants/app.constants";
import { isSubscriptionActive } from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserSession } from "./use-user-session";

interface UseDocumentRepositoryProps {
    accessToken?: string;
    showExpiredDocuments: boolean;
    setShowExpiredDocuments: (show: boolean) => void;
    // Optional UI state passed from consuming component to allow hook-driven navigation
    dropzoneConfig?: any;
    uploadedFiles?: any;
    setShowAll?: (show: boolean) => void;
    setViewClick?: (v: boolean) => void;
}

interface RaraResponse {
    document_rating: number | null;
    recommendations: string[];
    reason_for_rating: string;
}

interface AISuggestedDocumentType {
    id: string;
    title: string;
    sampleFileUrl?: string;
    acceptedFormats: any;
    maxSize: number;
    isOther: boolean;
    seqIndex: number;
    warning: string;
    FileProcessingErrorMessage: string;
    sourceFileUrl: string;
}

interface HeadingTextData {
    mainHeading: string;
    subHeading: string;
}

interface UploadFileStatData {
    file: File;
    fileSize?: number;
    metadata: any;
    fileUrl: string;
    isDeleted: boolean;
    documentLogsId: string;
    status: string;
    FileProcessingErrorMessage?: string;
    expiryDate?: string | null;
    raraResponse?: RaraResponse | null;
}

interface DuplicateFileInfo {
    title: string;
    originalFileName: string;
    documentLogsId: string;
}

interface UseDocumentRepositoryReturn {
    setNewExpiredDocumentsCount: (count: number) => void;
    newExpiredDocumentsCount: number;
    hasViewedExpiredTab: boolean;
    setHasViewedExpiredTab: (value: boolean) => void;
    trackExpiredDocument: (
        expiredCount: number,
        files: File[],
        showExpiredDocuments: boolean
    ) => Promise<{ shouldShowPopup: boolean; expiredCount: number; totalCount: number }>;
    headingTextData: HeadingTextData;
    refreshUI: (cardArray: AISuggestedDocumentType[], configId: string, uploadStatus: any, uploadedFiles: any, setDropzoneConfig: any, setUploadStatus: any, setUploadedFiles: any) => void;
    handleProcessWithAI: (fileData: { documentLogsId: string; fileUrl: string; fileName: string }, userContext: any, pageLoadDocumentLogsData: any, updateDocumentLogFiles: any, refetchPollingData: any, uploadedFiles: any, setUploadedFiles: any, setUploadStatus: any, setForcePollingRefresh: any) => Promise<void>;
    setFileStatus: (configId: string, userContext: any, getDocumentLogs: any, setDropzoneConfig: any) => Promise<void>;
    handleInsertRejectedFiles: (id: string, files: rejectedFiles[], anyotherDocuments: boolean, userContext: any, dropzoneConfig: any, uploadStatus: any, uploadedFiles: any, insertDocumentsLogsFiles: any, setDropzoneConfig: any, setUploadStatus: any, setUploadedFiles: any) => Promise<void>;
    findDuplicates: (files: File[], userContext: any, getDocumentLogs: any) => Promise<any>;
    createTempOtherDocEntry: (file: File, index: number, otherDocTemplate: AISuggestedDocumentType, prefix?: string) => { tempOtherDocId: string; entry: AISuggestedDocumentType };
    handleToCheckFileIsAlreadyDeleted: (documentLogsId: string, userContext: any, getDocumentLogs: any) => Promise<any>;
    isDocumentExpired: (configId: string, uploadedFiles: any) => boolean;
    getLatestSystemGeneratedDocuments: (documentLogs: any[], getFormInvitationDetailsCallback: any) => Promise<any[]>;
    insertDocumentLog: (file: File, id: string, userContext: any, insertDocumentsLogsFiles: any) => Promise<any>;
    uploadAndPersist: (newDoc: any, actualFile: File, id: string, isOther: boolean, userContext: any, uploadFile: any, updateDocumentLogFiles: any, setUploadedFiles: any) => Promise<any>;
    updateUIAfterDuplicate: (oldDocId: string | undefined, newDoc: any, isOther: boolean, id: string, actualFile: File, fileResult: any, errorMessage: string, userContext: any, setUploadedFiles: any, setDropzoneConfig: any, formatFileName: any) => void;
}

/**
 * Custom hook to manage expired documents tracking
 * Handles:
 * - Loading count from database on mount
 * - Updating count in database when it changes
 * - Clearing count when user views expired documents tab
 * - Tracking expired documents during upload
 * - Automatic navigation for single file uploads
 */
export const useDocumentRepository = ({
    accessToken,
    showExpiredDocuments,
    setShowExpiredDocuments,
    dropzoneConfig,
    uploadedFiles,
    setShowAll,
    setViewClick,
}: UseDocumentRepositoryProps): UseDocumentRepositoryReturn => {
    const userSession = useUserSession();
    const userContext = getUserContext(accessToken || "");
    const [getUserDetailsById] = useGetUserDetailByIdLazyQuery();
    const [updateUserDetailById] = useUpdateUserDetailByIdMutation();
    const [getDocumentLogs] = useGetDocumentLogsLazyQuery();
    const updateDocumentLogFiles = useBulk_Update_Document_LogFilesMutation()[0];

    // Track newly uploaded expired documents - stored in database (user->details->newExpiredDocumentsCount)
    const [newExpiredDocumentsCount, setNewExpiredDocumentsCount] =
        useState<number>(0);
    // Track if user has viewed the expired documents tab in this session
    // Used to hide the count in the button while keeping it in the message
    const [hasViewedExpiredTab, setHasViewedExpiredTab] = useState<boolean>(false);
    // Track if initial load from database is complete
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState<boolean>(false);

    // Use a ref to track if we're clearing the count (to prevent infinite loops)
    const isClearingCountRef = useRef<boolean>(false);
    // Track if we've already cleared the count for the current showExpiredDocuments state
    const hasClearedForCurrentTabRef = useRef<boolean>(false);
    // Track the last showExpiredDocuments value to detect changes
    const lastShowExpiredDocumentsRef = useRef<boolean>(showExpiredDocuments);
    // Track if update is in progress to prevent concurrent updates
    const isUpdatingRef = useRef<boolean>(false);
    // Track if we're still loading the initial count from database (to prevent update during load)
    const isLoadingInitialCountRef = useRef<boolean>(true);
    // Track if we just switched to expired view to prevent immediate auto-close
    const justSwitchedToExpiredRef = useRef<boolean>(false);
    // Track if we're currently tracking expired documents to prevent duplicate DB updates
    const isTrackingExpiredRef = useRef<boolean>(false);
    // Ref to track the current newExpiredDocumentsCount to avoid stale closures
    const newExpiredDocumentsCountRef = useRef<number>(0);

    // Clean up stale uploading documents on page refresh/initial load
    useEffect(() => {
        const cleanupStaleUploadingDocuments = async () => {
            // Only run if we have the required context
            if (!userContext.companyId || !userContext.userId) {
                console.warn('CLEANUP: Skipping - missing userContext');
                return;
            }

            try {
                const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString();

                // Single optimized query to clean up stale uploading documents
                // Use the existing bulk update mutation with a conditional where clause
                const result = await updateDocumentLogFiles({
                    variables: {
                        deletes: [
                            {
                                where: {
                                    companyId: { _eq: userContext.companyId },
                                    status: { _eq: DocumentLogsStatus.Uploading },
                                    createdAt: { _lt: sixtySecondsAgo },
                                },
                                _set: {
                                    status: DocumentLogsStatus.Deleted,
                                    deletedBy: userContext.userId,
                                    deletedAt: new Date().toISOString(),
                                },
                            }
                        ],
                        updates: [], // No updates needed for cleanup
                    },
                });

                const affectedRows = result.data?.delete_result?.[0]?.affected_rows || 0;
                if (affectedRows > 0) {
                    console.log(
                        `CLEANUP: Successfully cleaned up ${affectedRows} stale uploading documents`
                    );
                } else {
                    console.log('CLEANUP: No stale documents found to clean up');
                }
            } catch (error) {
                console.error("CLEANUP: Error cleaning up stale uploading documents:", error);
            }
        };

        // Run cleanup only on component mount (which happens on page refresh)
        cleanupStaleUploadingDocuments();

        // Also run cleanup when the page becomes visible again (handles cases where tab was in background)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                cleanupStaleUploadingDocuments();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []); // Empty dependency array - runs only on mount and unmount

    // Heading text data state
    const [headingTextData, setHeadingTextData] = useState<HeadingTextData>({
        mainHeading: "",
        subHeading: "",
    });

    // Function to update newExpiredDocumentsCount in the database
    const updateNewExpiredDocumentsCount = useCallback(
        async (count: number, updateState: boolean = true) => {
            // Prevent concurrent updates
            if (isUpdatingRef.current) {
                return;
            }

            try {
                isUpdatingRef.current = true;
                const userId = userSession?.user?.id || userContext.userId;
                if (!userId) return;

                // Get current user details to preserve existing data
                const currentUserData = await getUserDetailsById({
                    variables: { id: userId },
                    fetchPolicy: "network-only",
                });

                const currentDetails = currentUserData.data?.User?.[0]?.details || {};

                const storedCount = currentDetails.newExpiredDocumentsCount || 0;

                // If the stored value already matches the new count, skip the mutation to avoid duplicate calls
                if (storedCount === count) {
                    if (updateState) setNewExpiredDocumentsCount(count);
                    return;
                }

                // Update the newExpiredDocumentsCount while preserving other details
                const updatedDetails = {
                    ...currentDetails,
                    newExpiredDocumentsCount: count,
                };

                await updateUserDetailById({
                    variables: {
                        input: [
                            {
                                where: { id: { _eq: userId } },
                                _set: { details: updatedDetails },
                            },
                        ],
                    },
                });

                // Only update state if updateState is true (default behavior)
                if (updateState) {
                    setNewExpiredDocumentsCount(count);
                }
            } catch (error) {
                console.error("Error updating new expired documents count:", error);
            } finally {
                isUpdatingRef.current = false;
            }
        },
        [
            userSession?.user?.id,
            userContext.userId,
            getUserDetailsById,
            updateUserDetailById,
        ]
    );

    // Load user's expired documents count on mount
    useEffect(() => {
        const loadUserExpiredDocumentsCount = async () => {
            try {
                isLoadingInitialCountRef.current = true;
                const userId = userSession?.user?.id || userContext.userId;
                if (!userId) {
                    isLoadingInitialCountRef.current = false;
                    setIsInitialLoadComplete(true);
                    return;
                }

                const userData = await getUserDetailsById({
                    variables: { id: userId },
                    fetchPolicy: "network-only",
                });

                const userDetails = userData.data?.User?.[0]?.details || {};
                const storedNewExpiredCount = userDetails.newExpiredDocumentsCount || 0;

                // Set the count first
                setNewExpiredDocumentsCount(storedNewExpiredCount);
                // Mark loading as complete - this will allow updates after initial load
                // Use a small delay to ensure state update has been processed
                setTimeout(() => {
                    isLoadingInitialCountRef.current = false;
                    setIsInitialLoadComplete(true);
                }, 50);
            } catch (error) {
                console.error("Error loading user expired documents count:", error);
                isLoadingInitialCountRef.current = false;
                setIsInitialLoadComplete(true);
            }
        };

        loadUserExpiredDocumentsCount();
    }, [userSession?.user?.id, userContext.userId, getUserDetailsById]);

    // Sync the ref with the state
    useEffect(() => {
        newExpiredDocumentsCountRef.current = newExpiredDocumentsCount;
    }, [newExpiredDocumentsCount]);

    // Update newExpiredDocumentsCount in database whenever it changes
    useEffect(() => {
        // Skip update if we're still loading the initial count from database
        // This prevents the update from running when the count is first loaded after page refresh
        // Use both ref and state check for reliability
        if (isLoadingInitialCountRef.current || !isInitialLoadComplete) {
            return;
        }

        // Skip update if we're in the process of clearing the count
        if (isClearingCountRef.current) {
            isClearingCountRef.current = false;
            return;
        }

        // Skip if we're currently tracking expired documents (DB update handled manually)
        if (isTrackingExpiredRef.current) {
            return;
        }

        // Skip if update is already in progress
        if (isUpdatingRef.current) {
            return;
        }

        // Only update if count is valid and not already being cleared
        if (newExpiredDocumentsCount >= 0) {
            updateNewExpiredDocumentsCount(newExpiredDocumentsCount);
        }
    }, [newExpiredDocumentsCount, updateNewExpiredDocumentsCount, isInitialLoadComplete]);

    // Update heading text data based on AI features and expired documents
    useEffect(() => {
        const isAIUser = isUserAllowedAIFeature(accessToken || "");
        let HeadingTextData = {
            mainHeading: "",
            subHeading: "",
        };
        if (isAIUser) {
            if (showExpiredDocuments) {
                HeadingTextData.mainHeading =
                    "Uploaded documents are no longer valid. Please upload an updated version so our AI can continue providing suggestions and pre-filled responses.";
                HeadingTextData.subHeading =
                    newExpiredDocumentsCount > 0
                        ? `${newExpiredDocumentsCount} new expired documents detected`
                        : "";
            } else {
                HeadingTextData.mainHeading =
                    "Upload your company documents here. Our AI will use them to automatically provide suggestions and pre-fill your responses in all AI-enabled reports and assessments.";
                HeadingTextData.subHeading =
                    "AI can process .csv, .pdf, .xls, and .xlsx files. Please upload the recommended documents below.";
            }
        } else {
            if (showExpiredDocuments) {
                HeadingTextData.mainHeading =
                    "Review and manage all your company documents, including expired ones. Easily reference current documents while completing your responses.";
                HeadingTextData.subHeading =
                    "Upload fresh documents to replace expired ones. Both current and expired documents are shown for your review.";
            } else {
                HeadingTextData.mainHeading =
                    "Upload your company documents here. Easily reference them while completing your responses.";
                HeadingTextData.subHeading = "Recommended documents to upload.";
            }
        }

        setHeadingTextData(HeadingTextData);
    }, [accessToken, showExpiredDocuments, newExpiredDocumentsCount]);

    // Clear newExpiredDocumentsCount in database when user views the expired documents tab
    // The message will still show in current session, but will disappear on next refresh
    useEffect(() => {
        // Don't clear during initial load - wait until count is loaded from database
        if (isLoadingInitialCountRef.current || !isInitialLoadComplete) {
            return;
        }

        // Detect when showExpiredDocuments changes from false to true
        const tabJustOpened =
            showExpiredDocuments &&
            !lastShowExpiredDocumentsRef.current;

        // Reset the cleared flag when tab is closed
        if (!showExpiredDocuments && lastShowExpiredDocumentsRef.current) {
            hasClearedForCurrentTabRef.current = false;
        }

        // Update the ref to track current state
        lastShowExpiredDocumentsRef.current = showExpiredDocuments;

        // Only clear if:
        // 1. Tab just opened (transitioned from false to true)
        // 2. Count is greater than 0
        // 3. We haven't already cleared for this tab opening
        if (tabJustOpened && newExpiredDocumentsCount > 0 && !hasClearedForCurrentTabRef.current) {
            // Mark that we've cleared for this tab opening
            hasClearedForCurrentTabRef.current = true;
            // Mark tab as viewed so count disappears from button
            setHasViewedExpiredTab(true);
            // Set flag to prevent the update useEffect from running
            isClearingCountRef.current = true;
            // Clear the count in database AND state so next upload starts from 0
            updateNewExpiredDocumentsCount(0, true);
        }
    }, [
        showExpiredDocuments,
        newExpiredDocumentsCount,
        updateNewExpiredDocumentsCount,
        isInitialLoadComplete,
    ]);

    /**
     * Track expired documents during upload
     * Handles incrementing count and returns popup data for display
     * @param expiredCount - Number of expired documents in this upload batch
     * @param files - Original files array to determine if single or bulk upload
     * @param showExpiredDocuments - Current state of expired documents view
     * @returns Object with shouldShowPopup flag and popup data (expiredCount, totalCount)
     */
    const trackExpiredDocument = useCallback(
        async (
            expiredCount: number,
            files: File[],
            showExpiredDocuments: boolean
        ): Promise<{ shouldShowPopup: boolean; expiredCount: number; totalCount: number }> => {
            // Only track if there are expired documents
            if (expiredCount > 0) {
                // Mark that we're tracking to prevent duplicate DB updates
                isTrackingExpiredRef.current = true;

                // Reset the flag so the count shows in the button for new uploads
                setHasViewedExpiredTab(false);

                const newCount = newExpiredDocumentsCountRef.current + expiredCount;
                setNewExpiredDocumentsCount(newCount);

                // Manually update the database with the new count
                await updateNewExpiredDocumentsCount(newCount);

                // Show popup if at least one file is expired
                // Scenarios:
                // 1. Single file upload that is expired → show popup
                // 2. Multiple files where at least one is expired → show popup
                // 3. All files are valid (expiredCount = 0) → no popup (handled by outer if condition)
                const shouldShowPopup = true; // Always show if there are expired documents

                // Reset tracking flag
                isTrackingExpiredRef.current = false;

                return {
                    shouldShowPopup,
                    expiredCount,
                    totalCount: files.length,
                };
            }

            return {
                shouldShowPopup: false,
                expiredCount: 0,
                totalCount: files.length,
            };
        },
        [setShowExpiredDocuments, updateNewExpiredDocumentsCount]
    );

    /**
     * Refresh UI - Reset dropzone configurations and upload states
     */
    const refreshUI = useCallback((
        cardArray: AISuggestedDocumentType[],
        configId: string,
        uploadStatus: any,
        uploadedFiles: any,
        setDropzoneConfig: any,
        setUploadStatus: any,
        setUploadedFiles: any
    ) => {
        const cardDetail = cardArray.filter((item) => item.id == configId);
        // Remove the custom dropzone configuration if it exists
        if (cardDetail[0]?.isOther) {
            setDropzoneConfig(
                cardArray
                    .filter((item) => item.id != configId)
                    .sort((a, b) => a.seqIndex - b.seqIndex) as AISuggestedDocumentType[]
            );
            delete uploadStatus[configId];
            delete uploadedFiles[configId];
        }
        // Reset the upload status and uploaded files state
        setUploadStatus((prevStatus: any) => ({
            ...prevStatus,
            [configId]: "idle",
        }));

        setDropzoneConfig((prevStatus: any) =>
            prevStatus.map((item: any) =>
                item.id === configId ? { ...item, warning: "" } : item
            )
        );
        setUploadedFiles((prevFiles: any) => ({
            ...prevFiles,
            [configId]: {
                file: null,
                metadata: null,
                fileUrl: "",
                documentLogsId: "",
                isDeleted: false,
                status: "",
                FileProcessingErrorMessage: "",
                expiryDate: null,
                raraResponse: null as RaraResponse | null,
                extractionPercentage: null,
            },
        }));
    }, []);

    /**
     * Handle AI Processing - Process documents with AI
     */
    const handleProcessWithAI = useCallback(async (
        fileData: { documentLogsId: string; fileUrl: string; fileName: string },
        userContext: any,
        pageLoadDocumentLogsData: any,
        updateDocumentLogFiles: any,
        refetchPollingData: any,
        uploadedFiles: any,
        setUploadedFiles: any,
        setUploadStatus: any,
        setForcePollingRefresh: any
    ) => {
        const { documentLogsId, fileUrl, fileName } = fileData;

        try {
            // use the same rara warning message if available, remove error if any
            const existingErrorObject =
                pageLoadDocumentLogsData?.data?.DocumentLogs?.filter(
                    (log: any) => log.id === documentLogsId
                )?.[0]?.error;
            const updatedErrorObject = existingErrorObject
                ? { ...existingErrorObject, error: "" }
                : null;

            // STEP 1: Immediately update the database with status "Processing" and extraction percentage "0"
            await updateDocumentLogFiles({
                variables: {
                    deletes: [],
                    updates: [
                        {
                            where: {
                                id: { _eq: documentLogsId },
                                companyId: { _eq: userContext.companyId },
                            },
                            _set: {
                                status: DocumentLogsStatus.Processing,
                                extractionPercentage: "0",
                                error: updatedErrorObject,
                            },
                        },
                    ],
                },
            });

            // Store extraction progress in localStorage
            const configId = Object.keys(uploadedFiles).find(
                (key) => uploadedFiles[key]?.documentLogsId === documentLogsId
            );

            if (configId) {
                // Update the uploaded files state with extraction percentage
                setUploadedFiles((prev: any) => ({
                    ...prev,
                    [configId]: {
                        ...prev[configId],
                        extractionPercentage: "0",
                    },
                }));

                // Update status to processing
                setUploadStatus((prev: any) => ({
                    ...prev,
                    [configId]: DropzoneStatus.processing as UploadStatus,
                }));
            }

            // Force polling refresh to start checking for progress updates (if polling is enabled)
            if (setForcePollingRefresh && typeof setForcePollingRefresh === 'function') {
                setForcePollingRefresh((prev: boolean) => !prev);
            }

            // STEP 3: Make the API call to actually start AI processing
            const parseFilePayload: {
                url: string;
                document_log_id: string;
                company_id: string;
                user_id: string;
            } = {
                url: fileUrl,
                document_log_id: documentLogsId,
                company_id: userContext.companyId,
                user_id: userContext.userId,
            };

            const parseFileResponse = await axios({
                method: "POST",
                url: "/warp/api/AI/AIprocessing",
                data: {
                    process: "fileParsing",
                    data: parseFilePayload,
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: accessToken || "",
                },
            });

            // Handle API response
            if (
                parseFileResponse.data?.data?.success ||
                parseFileResponse.data?.success
            ) {
                // API call was successful, polling will handle further updates
            } else {
                console.error(
                    "AI processing API failed:",
                    parseFileResponse.data?.error
                );
                // Handle API failure by updating status back to uploaded
                if (configId) {
                    setUploadStatus((prev: any) => ({
                        ...prev,
                        [configId]: DropzoneStatus.uploaded as UploadStatus,
                    }));
                }
            }
        } catch (error: any) {
            console.error("Error during AI processing:", {
                message: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
            });
            throw error;
        }
    }, []);

    /**
     * Set File Status - Update file status and dropzone config
     */
    const setFileStatus = useCallback(async (
        configId: string,
        userContext: any,
        getDocumentLogs: any,
        setDropzoneConfig: any
    ) => {
        const payload = {
            where: {
                companyId: { _eq: userContext.companyId },
                status: { _neq: DocumentLogsStatus.Deleted },
            },
        };
        const loaddata = await getDocumentLogs({
            variables: payload,
            fetchPolicy: "no-cache",
        });

        // Update the card data with the total data points added from the source data
        setDropzoneConfig((prevConfig: any) => {
            const dropzoneConfigData = prevConfig.map((items: any) => {
                if (items?.id == configId) {
                    const sourceData = loaddata?.data?.DocumentLogs.filter(
                        (item: any) => item.fileUrl == items?.sourceFileUrl
                    );
                    return {
                        ...items,
                    };
                } else {
                    return {
                        ...items,
                    };
                }
            });
            return dropzoneConfigData.sort((a: any, b: any) => a.seqIndex - b.seqIndex);
        });
    }, []);

    /**
     * Handle Insert Rejected Files - Insert rejected files with error status
     */
    const handleInsertRejectedFiles = useCallback(async (
        id: string,
        files: rejectedFiles[],
        anyotherDocuments: boolean,
        userContext: any,
        dropzoneConfig: any,
        uploadStatus: any,
        uploadedFiles: any,
        insertDocumentsLogsFiles: any,
        setDropzoneConfig: any,
        setUploadStatus: any,
        setUploadedFiles: any
    ) => {
        const otherDocumentData: any[] = [];
        const specificCardData = dropzoneConfig.filter((items: any) => items?.id == id);
        const documentLogs_Insert_Input = files.map((rejectedfile, index) => {
            return {
                originalFileName: rejectedfile?.file.name,
                fileName: rejectedfile?.file?.name,
                aiSuggestedDocumentId: id,
                createdBy: userContext.userId,
                fileSize: String(rejectedfile?.file?.size),
                error: { warning: "", error: rejectedfile?.rejectionMessage },
                status: rejectedfile?.rejectionMessage
                    ? DocumentLogsStatus.UploadError
                    : DocumentLogsStatus.Uploaded,
                companyId: userContext.companyId,
            };
        });

        try {
            const insertedFiles = await insertDocumentsLogsFiles({
                variables: { data: documentLogs_Insert_Input },
            });

            const updatedUploadStatus = { ...uploadStatus };
            const updatedUploadedFiles = { ...uploadedFiles };

            (insertedFiles?.data?.insert_DocumentLogs?.returning || [])?.forEach(
                (fileData: any, index: number) => {
                    const fileDetails = files.find(
                        (items) =>
                            formatFileName(items?.file?.name) ==
                            formatFileName(fileData?.originalFileName)
                    );
                    const stableDocId = fileData.id; // Using backend id as stable id
                    if (anyotherDocuments) {
                        otherDocumentData.push({
                            title: formatFileName(String(fileData?.fileName)),
                            sampleFileUrl: specificCardData[0].sampleFileUrl,
                            acceptedFormats: specificCardData[0].acceptedFormats,
                            maxSize: specificCardData[0].maxSize,
                            isOther: anyotherDocuments,
                            id: stableDocId,
                            seqIndex: specificCardData[0].seqIndex + index,
                            warning: "",
                            FileProcessingErrorMessage: "",
                            sourceFileUrl: "",
                        });
                    }
                    updatedUploadStatus[anyotherDocuments ? stableDocId : id] =
                        DropzoneStatus.error as UploadStatus;
                    updatedUploadedFiles[anyotherDocuments ? stableDocId : id] = {
                        file: fileDetails?.file as File,
                        metadata: "",
                        fileUrl: String(fileData?.fileUrl),
                        isDeleted: false,
                        documentLogsId: fileData.id,
                        status: DocumentLogsStatus.UploadError,
                        FileProcessingErrorMessage: fileData?.error?.error,
                        expiryDate: null,
                        raraResponse: fileData?.raraResponse as RaraResponse | null,
                    };
                }
            );

            if (anyotherDocuments) {
                setDropzoneConfig((prevConfig: any) => {
                    const otherDocCard = prevConfig.find(
                        (item: any) => item.isOther && item.title === "Other Documents"
                    );
                    const uploadedOtherFiles = [
                        ...prevConfig.filter(
                            (item: any) => item.isOther && item.title !== "Other Documents"
                        ),
                        ...otherDocumentData,
                    ];
                    const rest = prevConfig.filter((item: any) => !item.isOther);
                    const newConfig = [];
                    if (otherDocCard) newConfig.push(otherDocCard);
                    newConfig.push(...uploadedOtherFiles);
                    newConfig.push(...rest);
                    return newConfig;
                });
            }
            setUploadStatus(updatedUploadStatus);
            setUploadedFiles(updatedUploadedFiles);
        } catch (error) {
            console.error("Error inserting source files:", error);
        }
    }, []);

    /**
     * Find Duplicates - Find duplicate files by name and size
     */
    const findDuplicates = useCallback(async (
        files: File[],
        userContext: any,
        getDocumentLogs: any
    ) => {
        const duplicateFiles: File[] = [];
        const uniqueFiles: File[] = [];
        let documentFilesData: GQLTypes.GetDocumentLogsQuery["DocumentLogs"] | undefined;
        const fileDataArray: any[] = [];

        for (const file of files) {
            fileDataArray.push(file);
            const { data } = await getDocumentLogs({
                variables: {
                    where: {
                        originalFileName: { _ilike: file.name },
                        fileSize: { _eq: String(file.size) },
                        companyId: { _eq: userContext.companyId },
                        status: { _eq: DocumentLogsStatus.Uploaded },
                    },
                },
                fetchPolicy: "network-only",
            });
            if ((data?.DocumentLogs || []).length > 0) {
                documentFilesData = data?.DocumentLogs;
                duplicateFiles.push(file);
            } else {
                uniqueFiles.push(file);
            }
        }

        if (duplicateFiles.length > 0) {
            const buffers = await Promise.all(
                duplicateFiles.map((f) => f.arrayBuffer())
            );
            const payloadFiles = duplicateFiles.map((f, i) => ({
                name: f.name,
                size: f.size,
                type: f.type,
                lastModified: f.lastModified,
                buffer: buffers[i],
            }));

            const duplicateInfos: DuplicateFileInfo[] = [];
            for (const file of duplicateFiles) {
                const { data } = await getDocumentLogs({
                    variables: {
                        where: {
                            originalFileName: { _ilike: file.name },
                            fileSize: { _eq: String(file.size) },
                            companyId: { _eq: userContext.companyId },
                            status: { _eq: DocumentLogsStatus.Uploaded },
                        },
                    },
                    fetchPolicy: "network-only",
                });
                const docs = data?.DocumentLogs || [];
                if (docs.length > 0) {
                    const d = docs[0];
                    duplicateInfos.push({
                        title: d?.AISuggestedDocuments?.title ?? "",
                        originalFileName: d?.originalFileName ?? file.name,
                        documentLogsId: d?.id ?? "",
                    });
                } else {
                    duplicateInfos.push({
                        title: "",
                        originalFileName: file.name,
                        documentLogsId: "",
                    });
                }
            }

            return {
                duplicateFiles,
                uniqueFiles,
                documentFilesData,
                payloadFiles,
                duplicateFileInfo: duplicateInfos,
            };
        }

        return { duplicateFiles, uniqueFiles, documentFilesData };
    }, []);

    /**
     * Create Temp Other Doc Entry - Helper for creating temporary "Other" document entries
     */
    const createTempOtherDocEntry = useCallback((
        file: File,
        index: number,
        otherDocTemplate: AISuggestedDocumentType,
        prefix: string = "customDropzone-temp-"
    ) => {
        const tempOtherDocId = `${prefix}temp-${Date.now()}-${index}`;
        const entry: AISuggestedDocumentType = {
            title: formatFileName(String(file.name)),
            sampleFileUrl: otherDocTemplate.sampleFileUrl,
            acceptedFormats: otherDocTemplate.acceptedFormats,
            maxSize: otherDocTemplate.maxSize,
            isOther: true,
            id: tempOtherDocId,
            seqIndex: otherDocTemplate.seqIndex + index,
            warning: "",
            FileProcessingErrorMessage: "",
            sourceFileUrl: "",
        };
        return { tempOtherDocId, entry };
    }, []);

    /**
     * Handle To Check File Is Already Deleted - Check if a file is already deleted
     */
    const handleToCheckFileIsAlreadyDeleted = useCallback(async (
        documentLogsId: string,
        userContext: any,
        getDocumentLogs: any
    ) => {
        try {
            const latest = await getDocumentLogs({
                variables: { where: { companyId: { _eq: userContext.companyId } } },
                fetchPolicy: "network-only",
            });
            const existing = latest?.data?.DocumentLogs?.find(
                (d: any) => d?.id === documentLogsId
            );
            if (existing && existing.status === DocumentLogsStatus.Deleted) {
                const alreadyDeletedData = {
                    deletedByUserId: existing.deletedBy,
                    deletedAt: existing.deletedAt,
                };
                return alreadyDeletedData;
            }
            return undefined;
        } catch (error) {
            console.error("Error fetching document logs:", error);
            return undefined;
        }
    }, []);

    /**
     * Is Document Expired - Helper function to check if a document is expired
     */
    const isDocumentExpired = useCallback((
        configId: string,
        uploadedFiles: any
    ) => {
        const expiryDate = uploadedFiles[configId]?.expiryDate;
        if (!expiryDate) return false;

        const expiry = new Date(expiryDate);
        const current = new Date();
        const timeDiff = expiry.getTime() - current.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Document is expired only if past expiry date (daysDiff < 0)
        return daysDiff < 0;
    }, []);

    // Auto-close expired tab: when there are no expired documents left while
    // the Expired tab is open, switch back to All Documents.
    useEffect(() => {
        try {
            if (!showExpiredDocuments) return; // only run when expired view is active

            // Skip auto-close if we just switched to expired view
            if (justSwitchedToExpiredRef.current) return;

            // guard: require dropzoneConfig and uploadedFiles to be passed in
            if (!dropzoneConfig || !uploadedFiles) return;

            const expiredCount = dropzoneConfig.reduce((acc: number, config: any) => {
                const entry = uploadedFiles[config.id] || {};
                if (entry && entry.isDeleted) return acc;
                try {
                    return acc + (isDocumentExpired(config.id, uploadedFiles) ? 1 : 0);
                } catch (e) {
                    return acc;
                }
            }, 0);

            if (expiredCount === 0) {
                // close expired view and show all documents
                setShowExpiredDocuments(false);
                if (typeof setShowAll === "function") setShowAll(true);
                if (typeof setViewClick === "function") setViewClick(true);
            }
        } catch (e) {
            console.warn("Auto-close expired tab useEffect failed:", e);
        }
    }, [dropzoneConfig, uploadedFiles, showExpiredDocuments, isDocumentExpired, setShowExpiredDocuments, setShowAll, setViewClick]);

    /**
     * Get Latest System Generated Documents - Filters and processes system-generated documents
     */
    const getLatestSystemGeneratedDocuments = useCallback(async (
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
    }, []);

    /**
     * Insert Document Log - Creates document log entries in database
     */
    const insertDocumentLog = useCallback(async (
        file: File,
        id: string,
        userContext: any,
        insertDocumentsLogsFiles: any
    ) => {
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
    }, []);

    /**
     * Upload and Persist - Handles file upload and persistence
     */
    const uploadAndPersist = useCallback(async (
        newDoc: any,
        actualFile: File,
        id: string,
        isOther: boolean,
        userContext: any,
        uploadFile: any,
        updateDocumentLogFiles: any,
        setUploadedFiles: any
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
                status: DocumentLogsStatus.UploadError,
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
                    where: { id: { _eq: newDoc.id } },
                    _set: updateObject,
                },
            });

            // Update UI state
            setUploadedFiles((prev: any) => ({
                ...prev,
                [isOther ? newDoc.id : id]: {
                    file: actualFile,
                    metadata: fileResult || {},
                    fileUrl: fileResult?.path || "",
                    isDeleted: false,
                    documentLogsId: newDoc.id,
                    status: errorMessage ? DocumentLogsStatus.UploadError : DocumentLogsStatus.Uploaded,
                    FileProcessingErrorMessage: errorMessage || "",
                    expiryDate: null,
                    raraResponse: null,
                },
            }));

            return { fileResult, errorMessage };
        } catch (updateError) {
            console.error("Error updating document log:", updateError);
            return { fileResult: null, errorMessage: "Database update failed" };
        }
    }, []);

    /**
     * Update UI After Duplicate - Updates UI state after handling duplicates
     */
    const updateUIAfterDuplicate = useCallback((
        oldDocId: string | undefined,
        newDoc: any,
        isOther: boolean,
        id: string,
        actualFile: File,
        fileResult: any,
        errorMessage: string,
        userContext: any,
        setUploadedFiles: any,
        setDropzoneConfig: any,
        formatFileName: any
    ) => {
        const finalConfigId = isOther ? newDoc.id : id;

        // Update uploaded files state
        setUploadedFiles((prev: any) => ({
            ...prev,
            [finalConfigId]: {
                file: actualFile,
                metadata: fileResult?.fileInfo || {},
                fileUrl: fileResult?.fileInfo?.path || "",
                isDeleted: false,
                documentLogsId: newDoc.id,
                status: errorMessage ? DocumentLogsStatus.UploadError : DocumentLogsStatus.Uploaded,
                FileProcessingErrorMessage: errorMessage || "",
                expiryDate: null,
                raraResponse: null,
            },
        }));

        // If it's an "Other" document, add a new card to the config
        if (isOther) {
            setDropzoneConfig((prevConfig: any) => {
                const newCard = {
                    id: newDoc.id,
                    title: formatFileName(actualFile.name),
                    isOther: true,
                    maxSize: 10, // default
                    sampleFileUrl: "",
                    acceptedFormats: [],
                    seqIndex: prevConfig.length,
                    warning: "",
                    FileProcessingErrorMessage: "",
                    sourceFileUrl: fileResult?.fileInfo?.path || "",
                };

                return [...prevConfig, newCard];
            });
        }
    }, []);

    return {
        setNewExpiredDocumentsCount,
        newExpiredDocumentsCount,
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
        getLatestSystemGeneratedDocuments,
        insertDocumentLog,
        uploadAndPersist,
        updateUIAfterDuplicate,
    };
};
/**
 * Custom hook to fetch active subscription status for a user
 */
export const useFetchActiveSubscription = (companyId: string, userId: string) => {
    // Fetch active subscription for the company
    const { data: subscriptionData } = useGetActiveSubscriptionByCompanyIdQuery({
        variables: {
            companyId,
            userId
        },
        skip: !companyId,
    });

    const isChatSubscriptionActive = isSubscriptionActive(
        subscriptionData?.AIChatSubscription?.[0]
    );

    return { isChatSubscriptionActive };
}
