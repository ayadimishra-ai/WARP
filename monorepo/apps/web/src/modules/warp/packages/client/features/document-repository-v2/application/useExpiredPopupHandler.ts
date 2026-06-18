/**
 * useExpiredPopupHandler Hook - Expired documents popup management
 * 
 * Responsibilities:
 * - Listen for window messages (popup confirmation/close events)
 * - Track popup open/close state with refs
 * - Accumulate counts when multiple uploads occur
 * - Show popup when expired documents are uploaded
 * - Handle user actions (view expired tab, close popup)
 * 
 * Architecture: Application layer
 * - useEffect for DOM event listeners (side effects) - ALLOWED in application layer
 * - useRef for UI state tracking (doesn't trigger re-renders)
 * - Exposes handler function for page layer to call
 */

import {
    documentRepositoryExpiredDocumentsPopup,
    postParentMessage,
} from "@/modules/warp/packages/client/services/platform-window-message.service";
import { useEffect, useRef } from "react";

interface UseExpiredPopupHandlerProps {
    onNavigateToExpiredTab: () => void; // Callback when user clicks "View" in popup
    onIncrementExpiredCount: (count: number) => Promise<void>; // Callback to increment badge count
}

interface UseExpiredPopupHandlerReturn {
    handleExpiredDocumentUploaded: (count: number) => void;
}

export function useExpiredPopupHandler({
    onNavigateToExpiredTab,
    onIncrementExpiredCount,
}: UseExpiredPopupHandlerProps): UseExpiredPopupHandlerReturn {
    /**
     * Ref to track if expired documents popup is currently open
     * Used to accumulate counts when multiple uploads happen while popup is displayed
     */
    const isExpiredPopupOpenRef = useRef<boolean>(false);

    /**
     * Ref to accumulate expired document counts while popup is open
     * When multiple files are uploaded while popup is displayed, we update the popup with total counts
     */
    const pendingExpiredCountsRef = useRef<{
        expiredCount: number;
        totalCount: number;
    }>({
        expiredCount: 0,
        totalCount: 0,
    });

    /**
     * Handle expired document uploads
     * Shows popup to inform user about expired documents
     * Accumulates counts if multiple uploads happen while popup is open
     * Increments badge count in database
     * 
     * @param count - Number of expired documents uploaded (always 1 per call from useUploadManager)
     */
    const handleExpiredDocumentUploaded = (count: number) => {
        console.log(
            "[useExpiredPopupHandler] Expired document uploaded, count:",
            count
        );

        // Increment badge count in database
        onIncrementExpiredCount(count);

        // Check if popup is already open
        if (isExpiredPopupOpenRef.current) {
            // Popup is already open - accumulate counts and send update message
            pendingExpiredCountsRef.current.expiredCount += count;
            pendingExpiredCountsRef.current.totalCount += count; // In V2, count = 1 per upload, so totalCount = expiredCount

            console.log(
                "[useExpiredPopupHandler] Popup already open, updating with accumulated counts:",
                pendingExpiredCountsRef.current
            );

            postParentMessage(
                documentRepositoryExpiredDocumentsPopup(
                    pendingExpiredCountsRef.current.expiredCount,
                    pendingExpiredCountsRef.current.totalCount,
                    true // isUpdate = true (updating existing popup)
                )
            );
        } else {
            // No popup currently open - mark as open and send new popup message
            isExpiredPopupOpenRef.current = true;
            pendingExpiredCountsRef.current.expiredCount = count;
            pendingExpiredCountsRef.current.totalCount = count; // In V2, count = 1 per upload

            console.log(
                "[useExpiredPopupHandler] Opening new popup with counts:",
                pendingExpiredCountsRef.current
            );

            postParentMessage(
                documentRepositoryExpiredDocumentsPopup(
                    count,
                    count, // totalCount = expiredCount in V2 (single file uploads)
                    false // isUpdate = false (new popup)
                )
            );
        }
    };

    /**
     * Handle window messages for expired documents popup
     * Listens for:
     * - "document-repository-expired-documents-popup-true": User clicked "View" - navigate to expired tab
     * - "document-repository-expired-documents-popup-closed": User closed popup - reset tracking refs
     * 
     * Architecture: useEffect in application layer for event listeners is allowed
     * This is a side effect (DOM event listener) not data fetching
     */
    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            let messageData: any;

            // Parse message data (handle both string and object formats)
            const dataType = typeof event.data;
            if (dataType === "string") {
                try {
                    messageData = JSON.parse(event.data);
                } catch (error) {
                    return; // Not JSON, ignore
                }
            } else if (dataType === "object") {
                messageData = event.data;
            } else {
                return; // Unknown type, ignore
            }

            if (!messageData || !messageData.type) return;

            switch (messageData.type) {
                case "document-repository-expired-documents-popup-true":
                    // User confirmed viewing expired documents - navigate to expired tab
                    console.log(
                        "[useExpiredPopupHandler] User clicked View in popup, navigating to expired tab"
                    );
                    onNavigateToExpiredTab();

                    // Reset popup tracking refs
                    isExpiredPopupOpenRef.current = false;
                    pendingExpiredCountsRef.current = {
                        expiredCount: 0,
                        totalCount: 0,
                    };
                    break;

                case "document-repository-expired-documents-popup-closed":
                    // User closed popup without viewing - reset tracking refs
                    console.log(
                        "[useExpiredPopupHandler] User closed popup without viewing"
                    );
                    isExpiredPopupOpenRef.current = false;
                    pendingExpiredCountsRef.current = {
                        expiredCount: 0,
                        totalCount: 0,
                    };
                    break;

                default:
                    // Ignore other message types
                    break;
            }
        };

        // Add event listener
        window.addEventListener("message", messageHandler);

        // Cleanup
        return () => {
            window.removeEventListener("message", messageHandler);
        };
    }, [onNavigateToExpiredTab]); // Dependency: callback from parent

    return {
        handleExpiredDocumentUploaded,
    };
}
