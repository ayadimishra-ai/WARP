/**
 * Session Storage Utilities for Active Conversation Management
 * 
 * These utilities help maintain active conversation state per browser/tab session.
 * This prevents confusion when multiple users share the same credentials but
 * interact with different conversations from different systems.
 */

const ACTIVE_CONVERSATION_KEY = "snowkap_active_conversation_id";

/**
 * Get the active conversationId from session storage
 * @returns The active conversationId or null if not found
 */
export const getActiveConversationId = (): string | null => {
    if (typeof window === "undefined") return null;

    try {
        return sessionStorage.getItem(ACTIVE_CONVERSATION_KEY);
    } catch (error) {
        console.error("Error reading active conversationId from sessionStorage:", error);
        return null;
    }
};

/**
 * Save the active conversationId to session storage
 * @param conversationId - The conversationId to save as active
 */
export const setActiveConversationId = (conversationId: string): void => {
    if (typeof window === "undefined") return;

    try {
        sessionStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId);
    } catch (error) {
        console.error("Error saving active conversationId to sessionStorage:", error);
    }
};

/**
 * Clear the active conversationId from session storage
 */
export const clearActiveConversationId = (): void => {
    if (typeof window === "undefined") return;

    try {
        sessionStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    } catch (error) {
        console.error("Error clearing active conversationId from sessionStorage:", error);
    }
};
