import { Card, Center, Flex, ScrollArea } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChatMessagesProps, MessageType } from "@/modules/warp/packages/shared/types/ai.types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AIResponse from "./AIResponse";
import ResponseChatLoader from "./ResponseChatLoader";
import UserMessage from "./UserMessage";

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages = [],
  sidePanelOpen,
  features,
  onLoadMoreMessages,
  hasMoreMessages = false,
  loadingMoreMessages = false,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lastMessageId = useRef<string | null>(null);
  const previousScrollTop = useRef<number>(0);
  const hasUserScrolled = useRef<boolean>(false);
  const [dynamicHeight, setDynamicHeight] = useState<number>(500);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const previousScrollHeight = useRef<number>(0);

  // Calculate dynamic height based on container size
  useEffect(() => {
    const updateHeight = () => {
      if (scrollAreaRef.current) {
        const availableHeight = scrollAreaRef.current.clientHeight;
        const calculatedHeight = Math.max(200, availableHeight - 0); // Minimum 200px, subtract space for padding/margins
        setDynamicHeight(calculatedHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [sidePanelOpen, messages?.length]);

  // Capture viewport ref after mount and reset scroll tracking on new conversation
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('.mantine-ScrollArea-viewport') as HTMLDivElement;
      viewportRef.current = viewport;
      // Reset scroll tracking for new conversation
      hasUserScrolled.current = false;
      previousScrollTop.current = viewport?.scrollTop || 0;
    }
  }, [messages.length > 0 ? messages[0]?.id : null]); // Reset when conversation changes

  // Handle scroll position change to detect when user scrolls to top
  const handleScrollPositionChange = useCallback(
    (position: { x: number; y: number }) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const scrollTop = viewport.scrollTop;
      const previousScroll = previousScrollTop.current;

      // Detect if user scrolled UP (intentional action to view older messages)
      if (scrollTop < previousScroll) {
        hasUserScrolled.current = true;
      }

      previousScrollTop.current = scrollTop;

      // Only trigger load more if:
      // 1. User has actually scrolled (not initial render)
      // 2. Scrolled near top (within 100px)
      // 3. More messages available
      if (
        hasUserScrolled.current &&
        scrollTop < 100 &&
        hasMoreMessages &&
        !loadingMoreMessages &&
        !isLoadingMore &&
        onLoadMoreMessages
      ) {
        setIsLoadingMore(true);
        previousScrollHeight.current = viewport.scrollHeight;
        onLoadMoreMessages();
      }
    },
    [hasMoreMessages, loadingMoreMessages, isLoadingMore, onLoadMoreMessages]
  );

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (loadingMoreMessages) {
      setIsLoadingMore(false);
    }

    if (!loadingMoreMessages && previousScrollHeight.current > 0) {
      const scrollArea = scrollAreaRef.current;
      if (scrollArea) {
        const viewport = scrollArea.querySelector('.mantine-ScrollArea-viewport');
        if (viewport) {
          // Maintain scroll position by calculating the difference
          const newScrollHeight = viewport.scrollHeight;
          const scrollDifference = newScrollHeight - previousScrollHeight.current;
          viewport.scrollTop = scrollDifference;
          previousScrollHeight.current = 0;
        }
      }
    }
  }, [loadingMoreMessages]);


  // Auto-scroll to bottom ONLY when a new message is added to the END (not when loading history at top)
  useEffect(() => {
    if (messages.length > 0) {
      const currentLastMessageId = messages[messages.length - 1]?.id;
      
      // Only scroll if the last message ID changed (indicates new message at end, not prepended history)
      // This naturally ignores prepended old messages since they don't change the last message ID
      if (currentLastMessageId && currentLastMessageId !== lastMessageId.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 100);
      }
      
      lastMessageId.current = currentLastMessageId;
    }
  }, [messages]); // Only depend on messages, not loadingMoreMessages
  const smallScreen = useMediaQuery("(max-width: 1282px)");

  return (
    <Card
      h={smallScreen ? "calc(100% - 15px)" : "calc(100% - 20px)"}
      bg="#fff"
      radius={smallScreen ? 15 : 30}
      p={smallScreen ? 15 : 24}
      pl={smallScreen ? 10 : 19}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ScrollArea
        ref={scrollAreaRef}
        type="auto"
        h="100%"
        pr={5}
        offsetScrollbars
        scrollbarSize={9}
        onScrollPositionChange={handleScrollPositionChange}
        styles={{
          scrollbar: {
          "&, &:hover": {
            background: "#fff",
          },
          '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
            backgroundColor: "#e4e4e4",
            transition: "opacity 0.2s ease",
          },
          '&[data-orientation="vertical"] .mantine-ScrollArea-thumb:hover': {
            backgroundColor: "#d1d1d1",
          },
        },
          viewport: {
            paddingBottom: 0,
          },
        }}
      >
        {/* Loading indicator at top */}
        {loadingMoreMessages && (
          <Center py={10}>
            <ResponseChatLoader isProcessing={true} />
          </Center>
        )}
        {(messages || []).reduce((pairs: React.ReactElement[], msg, index) => {
          // Group messages in pairs (user + AI response)
          if (msg.type === MessageType.USER) {
            const nextMessage = messages[index + 1];
            const isLastPair = index >= messages.length - 2;
            const hasAIResponse =
              nextMessage && nextMessage.type === MessageType.AI;
            pairs.push(
              <Flex
                key={`pair-${msg.id}`}
                mb={isLastPair ? 0 : 20}
                direction="column"
                h={
                  hasAIResponse
                    ? "auto"
                    : dynamicHeight - (smallScreen ? 15 : 20)
                }
              >
                <UserMessage message={msg} />
                {hasAIResponse ? (
                  <AIResponse
                    content={nextMessage.content}
                    sources={nextMessage.sources}
                    queryType={nextMessage.responseType} // determines textual/graphical
                    userQuery={msg.content} //user query to be shown in pdf generation
                    features={features}
                  />
                ) : (
                  <Center style={{ flex: 1 }} mt="md">
                    <ResponseChatLoader isProcessing={true} />
                  </Center>
                )}
              </Flex>
            );
          }
          return pairs;
        }, [])}
        {/* Invisible div at the bottom for scroll target */}
        <div ref={messagesEndRef} />
      </ScrollArea>
    </Card>
  );
};

export default ChatMessages;
