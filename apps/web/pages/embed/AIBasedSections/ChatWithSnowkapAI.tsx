import { Box, Flex } from "@mantine/core";
import { getUserContext } from "@warp/client/features/form/common-functions";
import { useWarpContentSize } from "@warp/client/hooks/use-warp-content-size";
import Spinner from "@warp/client/layouts/Spinner";
import { NextPageType } from "@warp/client/types/page-types";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";
import { CHAT_WITH_SNOWKAP_AI } from "@warp/shared/constants/app.constants";
import {
  type Message,
  MessageRole,
  MessageType,
} from "@warp/shared/types/ai.types";
import { useChatAI } from "@warp/web/hooks/use-chat-ai";
import {
  clearActiveConversationId,
  getActiveConversationId,
  setActiveConversationId,
} from "@warp/web/utils/session-storage.utils";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import ChatInputSection from "./Common/ChatInputSection";
import ChatMessages from "./Common/ChatMessages";
import InitialChatLoader from "./Common/InitialChatLoader";
import SidePanel from "./Common/SidePanel";

const ChatWithSnowkapAI: NextPageType = () => {
  useWarpContentSize();
  const { query } = useRouter();
  const { accessToken } = query;

  // Get company ID from user context
  const userContext = getUserContext(accessToken as string);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const lastUserMessageRef = useRef<Message | null>(null); // Track the last user message we created locally
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [selectedDocuments, setSelectedDocuments] = useState<
    Array<{ id: string; fileName: string }>
  >([]);
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [isNewChat, setIsNewChat] = useState(false); // Flag to track new chat state
  const [inputResetKey, setInputResetKey] = useState(0); // Key to force reset of input
  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTimePassed(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => console.log(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Use the chat hook to get the latest response
  const {
    message,
    setMessage,
    enableGraphicalOutput,
    setEnableGraphicalOutput,
    handleSend,
    quota,
    subscriptionLoading,
    isLoading,
    error,
    clearError,
    lastResponse,
    features,
    conversationList,
    refreshConversations,
    searchConversations,
    loadMoreConversations,
    loadConversation,
    clearConversation,
    conversation,
    conversationLoading,
    conversationMessages,
    loadMoreMessages,
    documents,
    documentsLoading,
    documentsState,
    loadMoreDocuments,
    refreshDocuments,
    searchDocuments,
    effectiveCompanyName,
  } = useChatAI({
    companyId: userContext.companyId,
    userId: userContext.userId,
    selectedDocuments: selectedDocuments,
    selectedDataSources: selectedDataSources,
  });

  // Effect to handle new responses from the hook
  useEffect(() => {
    // Only use lastResponse if there's no conversation yet (like for the first message)
    if (lastResponse && (!conversation || conversation.length === 0)) {
      // Create AI response message with sources
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: lastResponse.queryOutput,
        sources: lastResponse.sources,
        conversationId: lastResponse.conversationId,
        type: MessageType.AI,
        timestamp: lastResponse.timestamp,
        responseType: lastResponse.queryType,
      };

      setMessages((prev) => [...prev, aiMessage]);
    }
  }, [lastResponse, conversation]);

  // Effect to save conversationId to session storage when a new conversation is created
  useEffect(() => {
    if (lastResponse?.conversationId && !selectedConversationId) {
      // A new conversation was just created, save it as the active one
      setSelectedConversationId(lastResponse.conversationId);
      setActiveConversationId(lastResponse.conversationId);
    }
  }, [lastResponse, selectedConversationId]);

  /**
   * Effect to handle conversation history when a conversation is loaded
   * 
   * CRITICAL: Uses msg.messageId (stable UUID) instead of array index for message IDs
   * 
   * Issue: When infinite scroll prepends old messages, array indices shift causing ALL message IDs to change.
   * This made the auto-scroll effect think a new message arrived (last message ID changed), triggering
   * unwanted scroll-to-bottom while user was viewing history at the top.
   * 
   * Cause: Previously used `id: \`conversation-\${index}\`` which changes when array order changes:
   *   - Initial: [..., { id: "conversation-25", content: "msg45" }]  // last message
   *   - After prepending 6: [..., { id: "conversation-31", content: "msg45" }]  // same message, different ID!
   * 
   * Solution: Use stable messageId UUID from database. Now prepending old messages keeps last message ID unchanged,
   * so auto-scroll correctly distinguishes between prepended history vs new messages at the end.
   */
  useEffect(() => {
    if (conversation && conversation.length > 0) {
      // Convert conversation messages to Message format
      const conversationMessages: Message[] = conversation.map((msg, index) => {
        const baseMessage = {
          id: msg.messageId || `conversation-${index}`, // Use actual messageId instead of index
          content: msg.content,
          type:
            msg.role === MessageRole.USER ? MessageType.USER : MessageType.AI,
          timestamp: new Date(), // We don't have timestamp in conversation data
          sources: msg.role === MessageRole.ASSISTANT ? msg.sources : undefined, // Use actual sources from the message
          responseType: msg.responseType, // Use actual responseType from the message - "textual/graphical"
          metadata: (msg as any).metadata || undefined, // Preserve any existing metadata (cast to any for backward compatibility)
        };

        // If this is a user message and we have a recent local user message with metadata,
        // and the content matches, preserve the local message's metadata
        if (
          baseMessage.type === MessageType.USER &&
          lastUserMessageRef.current &&
          lastUserMessageRef.current.content === msg.content &&
          lastUserMessageRef.current.metadata?.selectedDocuments?.length > 0
        ) {
          console.log(
            "Preserving metadata for user message:",
            lastUserMessageRef.current.metadata,
          );
          return {
            ...baseMessage,
            metadata: lastUserMessageRef.current.metadata,
          };
        }

        return baseMessage;
      });
      setMessages(conversationMessages);
    } else if (conversation && conversation.length === 0) {
      setMessages([]);
    }
  }, [conversation]);

  // Auto-select and load the active conversation from session storage or most recent conversation
  useEffect(() => {
    if (
      conversationList.conversations.length > 0 &&
      !selectedConversationId &&
      !conversationLoading &&
      !isNewChat // Don't auto-load if user explicitly started a new chat
    ) {
      // First, check if there's an active conversation in session storage
      const activeConversationId = getActiveConversationId();
      
      // Verify that the active conversation still exists in the conversation list
      const activeConversationExists = activeConversationId
        ? conversationList.conversations.some(
            (conv) => conv.conversationId === activeConversationId
          )
        : false;

      // Load the active conversation if it exists, otherwise load the most recent one
      const conversationToLoad = activeConversationExists
        ? activeConversationId
        : conversationList.conversations[0].conversationId;

      setSelectedConversationId(conversationToLoad);
      loadConversation(conversationToLoad as string).catch((error: any) => {
        console.error("Failed to load conversation on initial effect:", error);
      });
    }
  }, [
    conversationList.conversations,
    selectedConversationId,
    conversationLoading,
    loadConversation,
    isNewChat,
  ]);

  // Handle send message and add user message to the list
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Capture selected documents before they get cleared
    const selectedDocumentDetails = selectedDocuments.map((selectedDoc) => {
      return {
        id: selectedDoc.id,
        name: selectedDoc.fileName,
      };
    });

    // Add user message to the list first
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      type: MessageType.USER,
      timestamp: new Date(),
      metadata: {
        selectedDocuments: selectedDocumentDetails,
      },
    };

    // Store reference to this message so we can preserve it during conversation updates
    lastUserMessageRef.current = userMessage;

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Call the hook's handleSend to trigger the API call
      await handleSend();

      // Only reset new chat flag if API call succeeds
      if (isNewChat) {
        setIsNewChat(false);
      }

      // Clear selected documents after successful send
      setSelectedDocuments([]); // Clear selected documents

      // Clear the reference after successful API call
      lastUserMessageRef.current = null;
    } catch (error) {
      // If API call fails, keep the isNewChat flag as is
      // This prevents auto-loading of previous conversations
      console.error("Failed to send message:", error);
      // Keep the reference in case we need to retry
    }
  };

  const handleOpenChatHistory = () => {
    setSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setSidePanelOpen(false);
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      setSelectedConversationId(conversationId);
      setIsNewChat(false); // Reset new chat flag when selecting an existing conversation
      
      // Save this conversation as the active one in session storage
      setActiveConversationId(conversationId);
      
      await loadConversation(conversationId);
      // Close side panel after loading conversation
      setSidePanelOpen(false);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleNewChat = () => {
    // Clear the hook's internal state first
    clearConversation();
    // Clear local component state
    setSelectedConversationId(null);
    setMessages([]);
    setSelectedDocuments([]); // Clear selected documents
    setSelectedDataSources([]); // Clear selected data sources
    setIsNewChat(true); // Set flag to indicate this is a new chat
    setSidePanelOpen(false);
    setInputResetKey((prev) => prev + 1); // Force reset of input (clear text and remove focus)
    setEnableGraphicalOutput(false);
    
    // Clear the active conversation from session storage
    clearActiveConversationId();
  };

  // Show main loader while essential data is loading
  const isMainLoading = subscriptionLoading || (!features && !error) || !minLoadingTimePassed;

  return (
    <Flex direction="column" className="aiChatModuleClass" h="100vh">
      {/* Main Content Area */}
      {isMainLoading ? (
        <Spinner visible={true} />
      ) : (
        <Flex h="calc(100vh - 68px)" sx={{ flex: 1, zIndex: 4 }}>
          {/* Side Panel */}
          <Box
            pos="relative"
            w={sidePanelOpen ? "238px" : "0px"}
            sx={{
              flexShrink: 0,
              transition: "width 0.3s ease-in-out",
              overflow: "hidden",
            }}
          >
            {sidePanelOpen && (
              <SidePanel
                isOpen={sidePanelOpen}
                onClose={handleCloseSidePanel}
                conversationList={conversationList.conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                onNewChat={handleNewChat}
                onLoadMoreConversations={loadMoreConversations}
                hasMoreConversations={conversationList.hasMoreConversations}
                conversationsLoading={conversationList.loadingConversations}
                searchConversations={searchConversations}
                searchTerm={conversationList.searchTerm}
              />
            )}
          </Box>
          {/* Chat Area */}
          <Flex
            pt="25px"
            direction="column"
            pos="relative"
            sx={{
              flex: 1,
              overflow: "hidden",
              transition: "margin-right 0.3s ease-in-out",
            }}
          >
            {/* Chat Messages Area - Scrollable */}
            <Box p="0 30px" sx={{ flex: 1, overflow: "hidden" }}>
              {subscriptionLoading || (!features && messages.length === 0) ? (
                <Spinner visible={true} />
              ) : messages.length > 0 ? (
                <ChatMessages
                  messages={messages}
                  sidePanelOpen={sidePanelOpen}
                  features={features}
                  onLoadMoreMessages={loadMoreMessages}
                  hasMoreMessages={conversationMessages.hasMoreMessages}
                  loadingMoreMessages={conversationMessages.loadingMoreMessages}
                />
              ) : (!selectedConversationId &&
                  !conversationList.loadingConversations &&
                  conversationList.conversations.length === 0) ||
                isNewChat ? (
                <InitialChatLoader
                  onSuggestionClick={(text) => setMessage(text)}
                  features={features}
                />
              ) : (
                <Spinner visible={true} />
              )}
            </Box>

            {/* Fixed Chat Input at bottom of chat area */}
            <Box sx={{ position: "relative", zIndex: 10 }}>
              <ChatInputSection
                companyId={userContext.companyId}
                companyName={effectiveCompanyName}
                message={message}
                setMessage={setMessage}
                enableGraphicalOutput={enableGraphicalOutput}
                setEnableGraphicalOutput={setEnableGraphicalOutput}
                handleSend={handleSendMessage}
                quota={quota}
                subscriptionLoading={subscriptionLoading}
                isLoading={isLoading}
                error={error}
                clearError={clearError}
                selectedDocuments={selectedDocuments}
                setSelectedDocuments={setSelectedDocuments}
                documents={documentsState.documents}
                documentsLoading={documentsState.loadingDocuments}
                onLoadMoreDocuments={loadMoreDocuments}
                hasMoreDocuments={documentsState.hasMoreDocuments}
                loadingMoreDocuments={documentsState.loadingMoreDocuments}
                searchDocuments={refreshDocuments}
                documentSearchTerm=""
                features={features}
                selectedDataSources={selectedDataSources}
                setSelectedDataSources={setSelectedDataSources}
                isChatEmpty={messages.length === 0}
                resetKey={inputResetKey}
                onNewChat={handleNewChat}
                handleOpenChatHistory={handleOpenChatHistory}
                sidePanelOpen={sidePanelOpen}
              />
            </Box>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default ChatWithSnowkapAI;

ChatWithSnowkapAI.getLayout = (page) => page;

ChatWithSnowkapAI.title = CHAT_WITH_SNOWKAP_AI;

ChatWithSnowkapAI.auth = true;

export const getServerSideProps: GetServerSideProps = embeddedAuthGuard;
