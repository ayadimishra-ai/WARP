import { useCreateAiChatUsageMutation } from "@/modules/warp/packages/graphql/mutations/generated/create-aichat-usage";
import { useUpdateAiChatUsageMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-aichat-usage";
import { useGetActiveSubscriptionByCompanyIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-active-subscription-by-company-id";
import { useGetConversationMessagesLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-conversation-messages";
import { useGetDocumentLogsQuery } from "@/modules/warp/packages/graphql/queries/generated/get-document-logs";
import { useGetDocumentLogsPaginatedLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-document-logs-paginated";
import { useGetUserConversationsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-user-conversations";
import { DATA_SOURCE_TYPES, DOCUMENT_FILTERS, QUERY_TYPES } from "@/modules/warp/packages/shared/constants/ai.constants";
import {
  type ChatAIState,
  type ChatResponse,
  type ConversationItem,
  type ConversationMessage,
  type DocumentLog,
  type QueryDocumentsPayload,
  type SubscriptionQuota,
  type UseChatAIProps,
  type UseChatAIReturn,
  MessageRole,
  QueryType
} from "@/modules/warp/packages/shared/types/ai.types";
import { getLocalStorageSession } from "@/modules/warp/packages/shared/utils/auth-session.util";
import {
  canUserPerformQuery,
  getSubscriptionFeatures,
  getUserAllocationInfo,
  isSubscriptionActive
} from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import { useCallback, useEffect, useState } from "react";


export const useChatAI = ({
  companyId,
  userId,
  companyName,
  selectedDocuments = [],
  selectedDataSources = [],
}: UseChatAIProps): UseChatAIReturn => {
  // State management
  const [state, setState] = useState<ChatAIState>({
    message: "",
    enableGraphicalOutput: false,
    isLoading: false,
    error: null,
    lastResponse: null,
    conversation: [],
    conversationId: null,
    conversationLoading: false,
    conversationList: {
      conversations: [],
      hasMoreConversations: true,
      loadingConversations: false,
      loadingMoreConversations: false,
      searchTerm: "",
    },
    conversationMessages: {
      messages: [],
      hasMoreMessages: false,
      loadingMessages: false,
      loadingMoreMessages: false,
    },
    documentsState: {
      documents: [],
      hasMoreDocuments: false,
      loadingDocuments: false,
      loadingMoreDocuments: false,
      searchTerm: "", // Initialize with empty search term
    },
  });

  // Fetch active subscription for the company with user allocation
  const {
    data: subscriptionData,
    loading: subscriptionLoading,
    refetch: refetchSubscription,
  } = useGetActiveSubscriptionByCompanyIdQuery({
    variables: {
      companyId: companyId || "",
      userId: userId || "",
    },
    skip: !companyId || !userId,
  });

  // Get subscription object and user allocation
  const subscription = subscriptionData?.AIChatSubscription?.[0];
  const userAllocation = subscription?.AIChatUserAllocations?.[0];
  const userUsage = userAllocation?.AIChatUsages?.[0];
  const subscriptionId = subscription?.id;

  // Fetch document logs with filters: status = "Uploaded", extractionPercentage is not null (0-100%)
  const { data: documentLogsData, loading: documentsLoading } =
    useGetDocumentLogsQuery({
      variables: {
        where: {
          companyId: { _eq: companyId },
          status: DOCUMENT_FILTERS.STATUS_PROCESSED_AND_PROCESSING,
          extractionPercentage: { _is_null: false },
        },
      },
      skip: !companyId,
    });

  // Mutations for updating and creating usage
  const [updateUsageMutation] = useUpdateAiChatUsageMutation();
  const [createUsageMutation] = useCreateAiChatUsageMutation();

  // Conversation queries
  const [getConversationMessages] = useGetConversationMessagesLazyQuery();
  const [getDocumentLogsPaginated] = useGetDocumentLogsPaginatedLazyQuery();
  const [getMoreConversations] = useGetUserConversationsLazyQuery();

  // Check if subscription is active
  const hasActiveSubscription = isSubscriptionActive(subscription);

  // Get subscription features
  const features = getSubscriptionFeatures(subscription);

  // Get user allocation information using the utility function
  const userAllocationInfo = getUserAllocationInfo(subscription, userId);


  // Default company name if not provided
  const effectiveCompanyName = subscription?.Company?.name || companyName || "";

  // Build quota object using the utility function results
  const quota: SubscriptionQuota = {
    textualRemaining: userAllocationInfo.textualRemaining,
    graphicalRemaining: userAllocationInfo.graphicalRemaining,
    textualTotal: userAllocationInfo.textualAllocated,
    graphicalTotal: userAllocationInfo.graphicalAllocated,
    hasActiveSubscription,
    canUseTextual:
      userAllocationInfo.hasAllocation &&
      hasActiveSubscription &&
      canUserPerformQuery(subscription, userId, QUERY_TYPES.TEXTUAL),
    canUseGraphical:
      userAllocationInfo.hasAllocation &&
      hasActiveSubscription &&
      canUserPerformQuery(subscription, userId, QUERY_TYPES.GRAPHICAL),
  };

  // Process document logs data
  const documents: DocumentLog[] =
    documentLogsData?.DocumentLogs?.map((doc) => ({
      id: doc.id,
      originalFileName: doc.originalFileName || doc.fileName || "Unknown",
      fileName: doc.fileName || doc.originalFileName || "Unknown",
      status: doc.status || "",
      extractionPercentage: parseInt(doc.extractionPercentage || "0"),
      fileUrl: doc.fileUrl || undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      AISuggestedDocuments: doc.AISuggestedDocuments ?? undefined,
    })) || [];

  // API call function
  const callQueryDocumentsAPI = async (
    query: string,
    queryType: QueryType,
    conversationId: string | null = null
  ): Promise<ChatResponse> => {
    // Get user session for userId
    const userSession =
      typeof window !== "undefined"
        ? getLocalStorageSession(window.localStorage)
        : null;

    const targetDocuments =
      selectedDocuments && selectedDocuments.length
        ? selectedDocuments
          .map((selectedDoc) => {
            const doc = documents.find(
              (d) => d.id === selectedDoc.id
            );
            return doc ? doc.id : null;
          })
          .filter((id): id is string => id !== null)
        : [];

    // Use selected data sources or default based on subscription features
    const documentsToSearchArray =
      selectedDataSources.length > 0
        ? selectedDataSources
        : [
          // Fallback to available features if no selection is provided
          ...(features.hasESG ? [DATA_SOURCE_TYPES.ESG_DOCUMENTS] : []),
          ...(features.hasBRSR ? [DATA_SOURCE_TYPES.BRSR_DOCUMENTS] : []),
          ...(features.hasDocumentRepo ? [DATA_SOURCE_TYPES.COMPANY_DOCUMENTS] : []),
        ];

    const payload: QueryDocumentsPayload = {
      query,
      queryType,
      companyId: companyId || "None",
      companyName: effectiveCompanyName,
      userId: userSession?.user?.id || "unknown",
      documentsToSearch: documentsToSearchArray,
      targetDocuments, //send documentLog id of company_docs
      // Only include conversationId if it exists and is not null/empty
      ...(conversationId &&
        conversationId.trim() && {
        conversationId: conversationId,
      }),
    };

    const response = await fetch("/warp/api/AI/AIprocessing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        process: "chatQuery",
        data: payload,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error || "API request failed");
    }

    return {
      queryOutput: data.data?.data?.queryOutput || "",
      sources: data.data?.data?.sources || [],
      conversationId: data.data?.data?.conversationId || null,
      queryType,
      timestamp: new Date(),
    };
  };

  // Helper function to notify server about quota exceeded
  const notifyQuotaExceeded = useCallback(
    async (
      queryType: QueryType,
      userId: string,
      platformId: string
    ) => {
      try {
        const payload = {
          companyId: companyId || "",
          userId: userId,
          queryType,
          platformId,
        };

        await fetch("/warp/api/AI/ai-chat-subscription-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Failed to send quota exceeded notification:", error);
        // Don't throw - this is a background notification
      }
    },
    [companyId]
  );

  // Helper function to check and notify quota exhaustion after usage update
  const checkAndNotifyPostQueryQuotaExhaustion = useCallback(
    async (queryType: QueryType, newTextualUsed: number, newGraphicalUsed: number) => {
      try {
        // Check if user quota is now exhausted after the query
        const isTextualExhausted =
          queryType === QueryType.TEXTUAL &&
          newTextualUsed >= userAllocationInfo.textualAllocated;
        const isGraphicalExhausted =
          queryType === QueryType.GRAPHICAL &&
          newGraphicalUsed >= userAllocationInfo.graphicalAllocated;

        if (isTextualExhausted || isGraphicalExhausted) {
          const userSession =
            typeof window !== "undefined"
              ? getLocalStorageSession(window.localStorage)
              : null;

          if (userSession?.user?.id) {
            console.log(
              `[AI-CHAT] Post-query quota exhaustion detected for ${queryType} queries. ` +
              `Usage: ${queryType === QueryType.TEXTUAL ? newTextualUsed : newGraphicalUsed}/${queryType === QueryType.TEXTUAL ? userAllocationInfo.textualAllocated : userAllocationInfo.graphicalAllocated}`
            );
            await notifyQuotaExceeded(
              queryType,
              userSession.user.id,
              userSession.platform?.id as string
            );
          }
        }
      } catch (error) {
        console.error("Failed to check post-query quota exhaustion:", error);
        // Don't throw - this is a background notification
      }
    },
    [userAllocationInfo, notifyQuotaExceeded]
  );

  // Action handlers
  const setMessage = useCallback((message: string) => {
    setState((prev) => ({ ...prev, message }));
  }, []);

  const setEnableGraphicalOutput = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, enableGraphicalOutput: enabled }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearLastResponse = useCallback(() => {
    setState((prev) => ({ ...prev, lastResponse: null }));
  }, []);

  // Load conversation messages using GraphQL
  const loadConversation = useCallback(
    async (conversationId: string) => {
      setState((prev) => ({
        ...prev,
        conversationLoading: true,
        conversationMessages: {
          ...prev.conversationMessages,
          loadingMessages: true,
        },
      }));

      try {
        const { data } = await getConversationMessages({
          variables: {
            conversationId,
            limit: 20,
            withCursor: false,
          },
          fetchPolicy: "network-only", // Always fetch fresh data
        });

        const messages = data?.AIMessagesAll || [];

        // Convert GraphQL messages to ConversationMessage format
        const conversationMessages: ConversationMessage[] = messages
          .map((msg: any) => ({
            role: msg.role as MessageRole,
            content: msg.metadata?.formattedContent || msg.content,
            messageId: msg.messageId,
            createdAt: msg.createdAt,
            sources: msg.sources,
            responseType: msg.type as QueryType,
          }))
          .reverse(); // Reverse to show oldest first

        setState((prev) => ({
          ...prev,
          conversation: conversationMessages,
          conversationId,
          conversationLoading: false,
          conversationMessages: {
            messages: conversationMessages,
            hasMoreMessages: messages.length === 20, // If we got exactly limit, there might be more
            loadingMessages: false,
            loadingMoreMessages: false,
          },
        }));
      } catch (error) {
        console.error("Failed to load conversation:", error);
        setState((prev) => ({
          ...prev,
          conversationLoading: false,
          error: "Failed to load conversation history",
          conversationMessages: {
            ...prev.conversationMessages,
            loadingMessages: false,
          },
        }));
      }
    },
    [getConversationMessages]
  );

  const clearConversation = useCallback(() => {
    // Force a complete reset of all conversation-related state
    setState((prev) => ({
      ...prev,
      message: "",
      conversation: [],
      conversationId: null,
      lastResponse: null,
      error: null,
      conversationLoading: false,
      conversationMessages: {
        messages: [],
        hasMoreMessages: false,
        loadingMessages: false,
        loadingMoreMessages: false,
      },
    }));
  }, []);

  // Load more messages for infinite scroll
  const loadMoreMessages = useCallback(async () => {
    if (
      !state.conversationId ||
      !state.conversationMessages.hasMoreMessages ||
      state.conversationMessages.loadingMoreMessages
    ) {
      return;
    }

    setState((prev) => ({
      ...prev,
      conversationMessages: {
        ...prev.conversationMessages,
        loadingMoreMessages: true,
      },
    }));

    try {
      // Get the oldest message timestamp as cursor
      const oldestMessage = state.conversationMessages.messages[0];
      const cursor = oldestMessage ? oldestMessage.createdAt : undefined;

      const { data } = await getConversationMessages({
        variables: {
          conversationId: state.conversationId,
          limit: 20,
          cursor,
          withCursor: true,
        },
        fetchPolicy: "network-only", // Always fetch fresh data
      });

      const newMessages = data?.AIMessages || [];

      // Convert GraphQL messages to ConversationMessage format
      const newConversationMessages: ConversationMessage[] = newMessages.map(
        (msg: any) => ({
          role: msg.role as MessageRole,
          content: msg.content,
          messageId: msg.messageId,
          createdAt: msg.createdAt,
          sources: msg.sources,
          responseType: msg.type as QueryType,
        })
      );

      // Reverse once to avoid double mutation
      const reversedNewMessages = [...newConversationMessages].reverse();

      setState((prev) => ({
        ...prev,
        conversation: [...reversedNewMessages, ...prev.conversation],
        conversationMessages: {
          messages: [
            ...reversedNewMessages,
            ...prev.conversationMessages.messages,
          ],
          hasMoreMessages: newMessages.length === 20,
          loadingMessages: false,
          loadingMoreMessages: false,
        },
      }));
    } catch (error) {
      console.error("Failed to load more messages:", error);
      setState((prev) => ({
        ...prev,
        conversationMessages: {
          ...prev.conversationMessages,
          loadingMoreMessages: false,
        },
      }));
    }
  }, [
    state.conversationId,
    state.conversationMessages.hasMoreMessages,
    state.conversationMessages.loadingMoreMessages,
    state.conversationMessages.messages,
    getConversationMessages,
  ]);

  // Load more documents for infinite scroll
  const loadMoreDocuments = async () => {
    // Early return if conditions aren't met
    if (
      !state.documentsState.hasMoreDocuments ||
      state.documentsState.loadingMoreDocuments ||
      state.documentsState.loadingDocuments
    ) {
      return;
    }

    setState((prev) => ({
      ...prev,
      documentsState: {
        ...prev.documentsState,
        loadingMoreDocuments: true,
      },
    }));

    try {
      // Get the last document timestamp as cursor
      const lastDocument =
        state.documentsState.documents[
        state.documentsState.documents.length - 1
        ];
      const cursor = lastDocument ? lastDocument.createdAt : undefined;

      // Preserve current search context during pagination
      const searchTerm = state.documentsState.searchTerm;
      const hasSearchTerm = searchTerm.trim().length > 0;
      const { data } = await getDocumentLogsPaginated({
        variables: {
          companyId,
          limit: 20,
          cursor,
          withCursor: true,
          searchTerm: hasSearchTerm ? `%${searchTerm.trim()}%` : "%",
        },
      });

      const rawDocuments = data?.DocumentLogs || [];
      const newDocuments: DocumentLog[] = rawDocuments.map((doc) => ({
        id: doc.id,
        originalFileName: doc.originalFileName || doc.fileName || "Unknown",
        fileName: doc.fileName || doc.originalFileName || "Unknown",
        status: doc.status || "",
        extractionPercentage: parseInt(doc.extractionPercentage || "0"),
        fileUrl: doc.fileUrl || undefined,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        AISuggestedDocuments: doc.AISuggestedDocuments ?? undefined,
      }));

      setState((prev) => ({
        ...prev,
        documentsState: {
          ...prev.documentsState,
          documents: [...prev.documentsState.documents, ...newDocuments],
          hasMoreDocuments: newDocuments.length === 20, // If we got fewer than 20, no more documents
          loadingDocuments: false,
          loadingMoreDocuments: false,
        },
      }));
    } catch (error) {
      console.error("Failed to load more documents:", error);
      setState((prev) => ({
        ...prev,
        documentsState: {
          ...prev.documentsState,
          loadingMoreDocuments: false,
        },
      }));
    }
  };

  // Load initial documents with optional search filtering
  const refreshDocuments = useCallback(
    async (searchTerm = "") => {
      setState((prev) => ({
        ...prev,
        documentsState: {
          ...prev.documentsState,
          loadingDocuments: true,
          documents: [],
          searchTerm,
        },
      }));

      try {
        // Check if we need to apply search filtering
        const hasSearchTerm = searchTerm.trim().length > 0;
        const { data } = await getDocumentLogsPaginated({
          variables: {
            companyId,
            limit: 20,
            withCursor: false,
            searchTerm: hasSearchTerm ? `%${searchTerm.trim()}%` : "%",
          },
        });

        const rawDocuments = data?.DocumentLogsAll || [];
        const documents: DocumentLog[] = rawDocuments.map((doc) => ({
          id: doc.id,
          originalFileName: doc.originalFileName || doc.fileName || "Unknown",
          fileName: doc.fileName || doc.originalFileName || "Unknown",
          status: doc.status || "",
          extractionPercentage: parseInt(doc.extractionPercentage || "0"),
          fileUrl: doc.fileUrl || undefined,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          AISuggestedDocuments: doc.AISuggestedDocuments ?? undefined,
        }));

        setState((prev) => ({
          ...prev,
          documentsState: {
            ...prev.documentsState,
            documents,
            hasMoreDocuments: documents.length === 20,
            loadingDocuments: false,
            loadingMoreDocuments: false,
          },
        }));
      } catch (error) {
        console.error("Failed to refresh documents:", error);
        setState((prev) => ({
          ...prev,
          documentsState: {
            ...prev.documentsState,
            loadingDocuments: false,
          },
        }));
      }
    },
    [companyId, getDocumentLogsPaginated]
  );

  // Load initial conversations
  const refreshConversations = useCallback(
    async (searchTerm = "") => {
      const userSession =
        typeof window !== "undefined"
          ? getLocalStorageSession(window.localStorage)
          : null;

      if (!userSession?.user?.id) return;

      setState((prev) => ({
        ...prev,
        conversationList: {
          ...prev.conversationList,
          loadingConversations: true,
          searchTerm,
        },
      }));

      try {
        const variables: any = {
          userId: userSession.user.id,
          limit: 20,
          withCursor: false,
          // Pass raw search term for FTS (Full-Text Search)
          searchTerm: searchTerm.trim(),
        };

        const { data } = await getMoreConversations({
          variables,
          fetchPolicy: "network-only", // Always fetch fresh
        });

        const conversations = data?.AIConversationsAll || [];

        setState((prev) => ({
          ...prev,
          conversationList: {
            conversations: conversations as ConversationItem[],
            hasMoreConversations: conversations.length === 20,
            loadingConversations: false,
            loadingMoreConversations: false,
            searchTerm,
          },
        }));

        // Auto-loading removed - user must explicitly select a conversation to prevent conflicts with clearConversation
      } catch (error) {
        console.error("Failed to load conversations:", error);
        setState((prev) => ({
          ...prev,
          conversationList: {
            ...prev.conversationList,
            loadingConversations: false,
            searchTerm,
          },
          error: "Failed to load conversations",
        }));
      }
    },
    [getMoreConversations, state.conversationId, loadConversation]
  );
  // Search conversations by title
  const searchConversations = useCallback(
    async (searchTerm: string) => {
      await refreshConversations(searchTerm);
    },
    [refreshConversations]
  );

  // Search documents by originalFileName or fileName using debounced input
  const searchDocuments = useCallback(
    async (searchTerm: string) => {
      // Trigger document refresh with search term
      await refreshDocuments(searchTerm);
    },
    [refreshDocuments]
  );

  // Load more conversations (infinite scroll)
  const loadMoreConversations = async () => {
    const userSession =
      typeof window !== "undefined"
        ? getLocalStorageSession(window.localStorage)
        : null;

    if (
      !userSession?.user?.id ||
      !state.conversationList.hasMoreConversations ||
      state.conversationList.loadingMoreConversations
    ) {
      return;
    }

    setState((prev) => ({
      ...prev,
      conversationList: {
        ...prev.conversationList,
        loadingMoreConversations: true,
      },
    }));

    try {
      const lastConversation =
        state.conversationList.conversations[
        state.conversationList.conversations.length - 1
        ];
      const cursor = lastConversation?.createdAt;

      const variables: any = {
        userId: userSession.user.id,
        limit: 20,
        cursor,
        withCursor: true,
        // Pass raw search term for FTS (Full-Text Search)
        searchTerm: state.conversationList.searchTerm.trim(),
      };

      const { data } = await getMoreConversations({
        variables,
        fetchPolicy: "network-only", // Always fetch fresh
      });

      const newConversations = data?.search_conversations_fts_cursor || [];

      setState((prev) => ({
        ...prev,
        conversationList: {
          conversations: [
            ...prev.conversationList.conversations,
            ...(newConversations as ConversationItem[]),
          ],
          hasMoreConversations: newConversations.length === 20,
          loadingConversations: false,
          loadingMoreConversations: false,
          searchTerm: prev.conversationList.searchTerm,
        },
      }));
    } catch (error) {
      console.error("Failed to load more conversations:", error);
      setState((prev) => ({
        ...prev,
        conversationList: {
          ...prev.conversationList,
          loadingMoreConversations: false,
        },
        error: "Failed to load more conversations",
      }));
    }
  };

  const handleSend = async () => {
    if (!state.message.trim()) return;
    if (!hasActiveSubscription) {
      setState((prev) => ({
        ...prev,
        error: "No active subscription available",
      }));
      return;
    }

    if (!userAllocationInfo.hasAllocation) {
      setState((prev) => ({
        ...prev,
        error: "No user allocation found. Please contact your administrator.",
      }));
      return;
    }

    const queryType: QueryType = state.enableGraphicalOutput
      ? QueryType.GRAPHICAL
      : QueryType.TEXTUAL;

    // Check quota using utility function
    if (!canUserPerformQuery(subscription, userId, queryType)) {
      const errorMessage = `${queryType.charAt(0).toUpperCase() + queryType.slice(1)
        } query limit exceeded`;

      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));

      // Trigger quota exceeded email notification
      try {
        const userSession =
          typeof window !== "undefined"
            ? getLocalStorageSession(window.localStorage)
            : null;
        if (userSession?.user?.email) {
          await notifyQuotaExceeded(
            queryType,
            userSession.user.id,
            userSession.platform?.id as string
          );
        }
      } catch (notificationError) {
        console.error("Failed to send quota notification:", notificationError);
        // Don't block the error display for the user
      }

      return;
    }

    // Get current state values at the time of execution to avoid stale closures
    const currentMessage = state.message;
    const currentConversationId = state.conversationId;

    setState((prev) => ({ ...prev, isLoading: true, error: null, message: "" }));

    try {
      // Add user message to conversation
      const userMessage: ConversationMessage = {
        role: MessageRole.USER,
        content: currentMessage,
      };

      setState((prev) => ({
        ...prev,
        conversation: [...prev.conversation, userMessage],
      }));

      // Call the actual AI API with current state values
      const response = await callQueryDocumentsAPI(
        currentMessage,
        queryType,
        currentConversationId
      );

      // Add assistant response to conversation
      const assistantMessage: ConversationMessage = {
        role: MessageRole.ASSISTANT,
        content: response.queryOutput,
        sources: response.sources,
        responseType: response.queryType,
      };

      // Update conversation ID if provided in response
      // For new conversations (when conversationId is null/empty), use the response conversationId
      // For existing conversations, keep the current conversationId unless a new one is provided
      const newConversationId =
        response.conversationId ||
        (currentConversationId && currentConversationId.trim()
          ? currentConversationId
          : null);

      setState((prev) => ({
        ...prev,
        conversation: [...prev.conversation, assistantMessage],
        conversationId: newConversationId,
        lastResponse: response,
        message: "", // Clear message after successful send
      }));

      // Update or create user usage tracking in database
      try {
        let usageUpdated = false;

        if (userUsage?.id) {
          // Update existing user usage record using the actual userUsage object
          const currentTextualUsed = userUsage.textualUsed || 0;
          const currentGraphicalUsed = userUsage.graphicalUsed || 0;

          const newTextualUsed =
            queryType === QueryType.TEXTUAL
              ? currentTextualUsed + 1
              : currentTextualUsed;
          const newGraphicalUsed =
            queryType === QueryType.GRAPHICAL
              ? currentGraphicalUsed + 1
              : currentGraphicalUsed;

          console.log(
            `[AI-CHAT-USAGE] Updating usage ID ${userUsage.id}: textual ${currentTextualUsed} -> ${newTextualUsed}, graphical ${currentGraphicalUsed} -> ${newGraphicalUsed}`
          );

          const updatePayload = {
            variables: {
              id: userUsage.id,
              textualUsed: newTextualUsed,
              graphicalUsed: newGraphicalUsed,
              metadata: {
                ...userUsage?.metadata,
                lastQuery: {
                  query: currentMessage,
                  type: queryType,
                  timestamp: new Date().toISOString(),
                },
              },
            },
          };

          console.log(`[AI-CHAT-USAGE] Update payload:`, updatePayload);

          await updateUsageMutation(updatePayload);

          console.log(
            `[AI-CHAT-USAGE] Successfully updated existing user usage record: ${userUsage.id}`
          );
          usageUpdated = true;

          // Check if quota is now exhausted after this query
          await checkAndNotifyPostQueryQuotaExhaustion(
            queryType,
            newTextualUsed,
            newGraphicalUsed
          );
        } else if (userAllocationInfo.allocationId) {
          // Create new user usage record for first-time allocation usage
          const initialTextualUsed = queryType === QueryType.TEXTUAL ? 1 : 0;
          const initialGraphicalUsed = queryType === QueryType.GRAPHICAL ? 1 : 0;

          console.log(
            `[AI-CHAT-USAGE] Creating new usage record for allocation ${userAllocationInfo.allocationId}: textual ${initialTextualUsed}, graphical ${initialGraphicalUsed}`
          );

          await createUsageMutation({
            variables: {
              subscriptionId: subscriptionId!,
              companyId: companyId!,
              allocationId: userAllocationInfo.allocationId,
              textualUsed: initialTextualUsed,
              graphicalUsed: initialGraphicalUsed,
              metadata: {
                firstQuery: {
                  query: currentMessage,
                  type: queryType,
                  timestamp: new Date().toISOString(),
                },
              },
            },
          });

          console.log(
            `[AI-CHAT-USAGE] Successfully created new user usage record for allocation: ${userAllocationInfo.allocationId}`
          );
          usageUpdated = true;

          // Check if quota is now exhausted after this query
          await checkAndNotifyPostQueryQuotaExhaustion(
            queryType,
            initialTextualUsed,
            initialGraphicalUsed
          );
        }

        // Refetch subscription data to update UI with new usage counts
        if (usageUpdated) {
          console.log(
            "[AI-CHAT-USAGE] Refetching subscription data to update UI"
          );
          await refetchSubscription();
        }
      } catch (usageError) {
        // Log usage tracking error but don't fail the AI query
        console.error(
          `[AI-CHAT-USAGE] Failed to track user usage, but allowing query to proceed:`,
          usageError
        );
        // Note: We don't throw here to allow the AI query to succeed
      }

      setState((prev) => ({
        ...prev,
        message: "", // Clear message after successful send
        isLoading: false,
      }));

      console.log("Query sent successfully:", response);
    } catch (error) {
      console.error("Error sending query:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to send query",
      }));
    }
  };

  // Auto-load conversations and documents when component mounts or company changes
  useEffect(() => {
    refreshConversations(); // Load conversation history
    refreshDocuments(); // Load documents without search filter
  }, [companyId, refreshConversations, refreshDocuments]);

  return {
    // State
    message: state.message,
    enableGraphicalOutput: state.enableGraphicalOutput,
    isLoading: state.isLoading,
    error: state.error,
    lastResponse: state.lastResponse,
    conversation: state.conversation,
    conversationId: state.conversationId,
    conversationLoading: state.conversationLoading,
    conversationList: state.conversationList,
    conversationMessages: state.conversationMessages,
    documentsState: state.documentsState,

    // Actions
    setMessage,
    setEnableGraphicalOutput,
    handleSend,
    clearError,
    clearLastResponse,
    loadConversation,
    clearConversation,
    loadMoreConversations,
    refreshConversations,
    searchConversations,
    searchDocuments,
    loadMoreMessages,
    loadMoreDocuments,
    refreshDocuments,

    // Subscription data
    subscription,
    subscriptionLoading,
    quota,
    features,

    // Documents data
    documents,
    documentsLoading,

    //Company name
    effectiveCompanyName
  };
};
