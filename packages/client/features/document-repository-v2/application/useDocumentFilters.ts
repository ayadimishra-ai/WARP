/**
 * useDocumentFilters Hook - Filter state management
 * 
 * Responsibilities:
 * - Manage filter state (expired view, search)
 * - Provide filtered document list
 * - Track badge state for new expired documents with database persistence
 * - Load/save new expired count from/to database
 * 
 * Rules:
 * - useEffect allowed for database operations (side effects)
 * - State management for persistent badge count
 */

import { useUpdateUserDetailByIdMutation } from "@warp/graphql/mutations/generated/update-userdetail-by-id";
import { useGetUserDetailByIdLazyQuery } from "@warp/graphql/queries/generated/get-userdetail-by-id";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    countExpiredDocuments
} from "../domain/document.rules";
import {
    getFilteredDocuments,
} from "../domain/document.selectors";
import {
    Document,
    DocumentFilters,
    DocumentTemplate,
    UserContext,
} from "../domain/document.types";

interface UseDocumentFiltersProps {
    documents: Document[];
    templates: DocumentTemplate[];
    userContext: UserContext; // Required for database persistence
}

interface UseDocumentFiltersReturn {
    filters: DocumentFilters;
    filteredDocuments: Map<string, Document | null>;
    expiredCount: number;
    newExpiredCount: number;
    hasViewedExpiredTab: boolean;
    setShowExpiredOnly: (show: boolean) => void;
    setSearchTerm: (term: string) => void;
    toggleExpiredView: () => void;
    incrementNewExpiredCount: (count: number) => Promise<void>; // For tracking newly uploaded expired docs
}

export function useDocumentFilters({
    documents,
    templates,
    userContext,
}: UseDocumentFiltersProps): UseDocumentFiltersReturn {
    const [showExpiredOnly, setShowExpiredOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [hasViewedExpiredTab, setHasViewedExpiredTab] = useState(false);

    // Persistent badge count (stored in database)
    const [newExpiredCount, setNewExpiredCount] = useState<number>(0);
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

    // GraphQL hooks for database persistence
    const [getUserDetailsById] = useGetUserDetailByIdLazyQuery();
    const [updateUserDetailById] = useUpdateUserDetailByIdMutation();

    // Refs for tracking state
    const isUpdatingRef = useRef(false);
    const isLoadingInitialCountRef = useRef(true);

    /**
     * Load new expired count from database on mount
     * This persists the badge count across page refreshes
     */
    useEffect(() => {
        const loadUserExpiredDocumentsCount = async () => {
            try {
                const { data } = await getUserDetailsById({
                    variables: { id: userContext.userId },
                });

                const userDetails = data?.User?.[0]?.details;
                const storedCount = (userDetails as any)?.newExpiredDocumentsCount || 0;

                setNewExpiredCount(storedCount);
                setIsInitialLoadComplete(true);
                isLoadingInitialCountRef.current = false;

                console.log("[useDocumentFilters] Loaded expired count from database:", storedCount);
            } catch (error) {
                console.error("[useDocumentFilters] Failed to load expired count:", error);
                setIsInitialLoadComplete(true);
                isLoadingInitialCountRef.current = false;
            }
        };

        loadUserExpiredDocumentsCount();
    }, [userContext.userId, getUserDetailsById]);

    /**
     * Update new expired count in database whenever it changes
     * Skips update during initial load to prevent overwriting with 0
     */
    useEffect(() => {
        // Skip update during initial load
        if (isLoadingInitialCountRef.current || !isInitialLoadComplete) {
            return;
        }

        // Skip if update is already in progress
        if (isUpdatingRef.current) {
            return;
        }

        const updateDatabase = async () => {
            isUpdatingRef.current = true;

            try {
                // Get existing user details
                const { data } = await getUserDetailsById({
                    variables: { id: userContext.userId },
                });

                const existingDetails = data?.User?.[0]?.details || {};

                // Prepare updated details
                const updatedDetails = {
                    ...existingDetails,
                    newExpiredDocumentsCount: newExpiredCount,
                };

                // Update with new count
                await updateUserDetailById({
                    variables: {
                        input: [
                            {
                                where: { id: { _eq: userContext.userId } },
                                _set: { details: updatedDetails },
                            },
                        ],
                    },
                });

                console.log("[useDocumentFilters] Updated database with count:", newExpiredCount);
            } catch (error) {
                console.error("[useDocumentFilters] Failed to update database:", error);
            } finally {
                isUpdatingRef.current = false;
            }
        };

        updateDatabase();
    }, [newExpiredCount, userContext.userId, getUserDetailsById, updateUserDetailById, isInitialLoadComplete]);

    /**
     * Clear count when user views expired tab
     * This marks all expired documents as "seen"
     */
    useEffect(() => {
        // Skip during initial load
        if (isLoadingInitialCountRef.current || !isInitialLoadComplete) {
            return;
        }

        // When user switches to expired tab, clear the count
        if (showExpiredOnly && newExpiredCount > 0) {
            console.log("[useDocumentFilters] User viewed expired tab, clearing count");
            setNewExpiredCount(0);
            setHasViewedExpiredTab(true);
        }
    }, [showExpiredOnly, newExpiredCount, isInitialLoadComplete]);

    // Memoize filters object to prevent unnecessary re-creation
    const filters: DocumentFilters = useMemo(
        () => ({
            showExpiredOnly,
            searchTerm,
        }),
        [showExpiredOnly, searchTerm]
    );

    /**
     * Get filtered documents using domain selectors
     */
    const filteredDocuments = useMemo(() => {
        return getFilteredDocuments(documents, templates, filters);
    }, [documents, templates, filters]);

    /**
     * Count expired documents
     */
    const expiredCount = useMemo(() => {
        return countExpiredDocuments(documents);
    }, [documents]);

    /**
     * Increment new expired count
     * Called when newly uploaded documents are detected as expired
     * Resets hasViewedExpiredTab to ensure badge appears for new uploads
     */
    const incrementNewExpiredCount = async (count: number) => {
        console.log("[useDocumentFilters] Incrementing expired count by:", count);
        setNewExpiredCount((prev) => prev + count);

        // Reset viewed flag so badge appears for newly uploaded expired documents
        // This allows badge to show again even after user has previously viewed expired tab
        setHasViewedExpiredTab(false);

        console.log("[useDocumentFilters] Reset hasViewedExpiredTab to false - badge will show");
    };

    /**
     * Toggle expired view and mark as viewed
     * Count is cleared via useEffect when tab is viewed
     */
    const toggleExpiredView = () => {
        setShowExpiredOnly((prev) => {
            const newValue = !prev;
            // Count will be cleared via useEffect
            return newValue;
        });
    };

    return {
        filters,
        filteredDocuments,
        expiredCount,
        newExpiredCount,
        hasViewedExpiredTab,
        setShowExpiredOnly,
        setSearchTerm,
        toggleExpiredView,
        incrementNewExpiredCount,
    };
}
