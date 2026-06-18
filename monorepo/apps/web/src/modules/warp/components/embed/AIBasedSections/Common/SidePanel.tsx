import {
  ActionIcon,
  Anchor,
  Flex,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import SearchInputIcon from "@/modules/warp/packages/client/components/svgIcons/SearchInputIcon";
import EditPenIcon from "@/modules/warp/packages/client/icons/EditPenIcon";
import { useCallback, useEffect, useRef, useState } from "react";
import DrawerHeader from "./DrawerHeader";
// Always call hooks at the top level
interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  conversationList?: Array<{
    conversationId: string;
    userId: string;
    companyId: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  }>;
  selectedConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  onNewChat?: () => void;
  onLoadMoreConversations?: () => void;
  hasMoreConversations?: boolean;
  conversationsLoading?: boolean;
  searchConversations?: (searchTerm: string) => void;
  searchTerm?: string;
}

const SidePanel = ({
  isOpen,
  onClose,
  conversationList = [],
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  onLoadMoreConversations,
  hasMoreConversations = false,
  conversationsLoading = false,
  searchConversations,
  searchTerm = "",
}: SidePanelProps) => {
  // Local search state for real-time input handling
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");
  const smallScreen = useMediaQuery("(max-width: 1282px)");
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const hasUserScrolled = useRef<boolean>(false);
  const previousScrollTop = useRef<number>(0);

  // Ref to store timeout ID to avoid recreating functions
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search function with stable reference
  const debouncedSearch = useCallback(
    (searchValue: string) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        if (searchConversations) {
          searchConversations(searchValue);
        }
      }, 300);
    },
    [searchConversations]
  );

  // Effect to handle search term changes
  useEffect(() => {
    debouncedSearch(localSearchTerm);

    // Cleanup function to clear timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localSearchTerm, debouncedSearch]);

  // Sync with external search term changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm || "");
  }, [searchTerm]);

  // Capture viewport ref after mount and reset scroll tracking
  useEffect(() => {
    if (scrollAreaRef.current && isOpen) {
      const viewport = scrollAreaRef.current.querySelector('.mantine-ScrollArea-viewport') as HTMLDivElement;
      viewportRef.current = viewport;
      // Reset scroll tracking when panel opens
      hasUserScrolled.current = false;
      previousScrollTop.current = 0;
    }
  }, [isOpen]);

  // Handle scroll position change to detect when user scrolls near bottom
  const handleScrollPositionChange = useCallback(
    (position: { x: number; y: number }) => {
      const viewport = viewportRef.current;
      if (!viewport || conversationsLoading) return;

      const scrollTop = viewport.scrollTop;
      const scrollHeight = viewport.scrollHeight;
      const clientHeight = viewport.clientHeight;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const previousScroll = previousScrollTop.current;

      // Detect if user scrolled DOWN (intentional action)
      if (scrollTop > previousScroll) {
        hasUserScrolled.current = true;
      }

      previousScrollTop.current = scrollTop;

      // Only trigger load more if:
      // 1. User has actually scrolled (not initial render)
      // 2. Scrolled near bottom (within 100px)
      // 3. More conversations available
      if (
        hasUserScrolled.current &&
        distanceFromBottom < 100 &&
        hasMoreConversations &&
        !isLoadingMore &&
        onLoadMoreConversations
      ) {
        setIsLoadingMore(true);
        onLoadMoreConversations();
      }
    },
    [hasMoreConversations, isLoadingMore, conversationsLoading, onLoadMoreConversations]
  );

  // Reset loading state when conversations finish loading
  useEffect(() => {
    if (!conversationsLoading && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [conversationsLoading, isLoadingMore]);

  if (!isOpen) return null;

  return (
    <Flex
      direction="column"
      w={238}
      bg="#fff"
      h="100%"
      p={smallScreen ? 15 : 20}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      styles={{
        root: {
          overflow: "hidden",
        },
      }}
    >
      {/* Chat History Header */}
      <DrawerHeader title="Chat History" onClose={onClose} />
      {/* New Chat Button */}
      <Anchor
        ta="center"
        py={9}
        underline="never"
        onClick={onNewChat}
        px={10}
        h={36}
        styles={{
          root: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            borderRadius: 6,
            "&:hover": {
              backgroundColor: "#E1F6FF",
            },
          }
        }}
      >
        <EditPenIcon />
        <Text fz={14} fw={500} c="#444444">
          Start New Chat
        </Text>
      </Anchor>

      {/* Chat History Section */}
      <Text fz={14} fw={500} c="#B7B7B7" mt={15}>
        Chats
      </Text>
      {/* Search Input for Conversations */}
      <TextInput
        variant="search"
        placeholder="Search Chats..."
        value={localSearchTerm}
        onChange={(event) => setLocalSearchTerm(event.currentTarget.value)}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        h={36}
        leftSection={<SearchInputIcon color={isSearchFocused ? "#005C81" : undefined} />}
        rightSection={
          localSearchTerm && (
            <ActionIcon
              size="xs"
              variant="transparent"
              onClick={() => setLocalSearchTerm("")}
            >
              <IconX size={16} color="#666666" />
            </ActionIcon>
          )
        }
        styles={{
          section: { marginLeft: 5 },
        }}
        my={10}
      />

      <ScrollArea
        ref={scrollAreaRef}
        type="auto"
        scrollbarSize={8}
        onScrollPositionChange={handleScrollPositionChange}
        styles={{
          root: { flex: 1 },
          scrollbar: {
            "&, &:hover": {
              background: "#fff",
            },
            '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
              backgroundColor: "#000",
              opacity: isHovered ? 0.12 : 0,
              transition: "opacity 0.2s ease",
            },
          },
          viewport: {
            paddingBottom: 0,
          },
        }}
      >
        {conversationsLoading ? (
          <Text fz={12} c="#555555" ta="center" mt={20}>
            Loading conversations...
          </Text>
        ) : conversationList.length === 0 ? (
          <Text
            fz={12}
            c="#555555"
            ta="center"
            mt={20}
            styles={{ root: { wordBreak: "break-word" } }}
          >
            No results found
            {/* {localSearchTerm.trim()
              ? `No conversations found for "${localSearchTerm.trim()}"`
              : "No conversations yet"} */}
          </Text>
        ) : (
          <>
            {conversationList.map((conversation, index) => {
              // Use title or create a default display text
              const displayText =
                conversation.title || `Conversation ${index + 1}`;
              const isSelected =
                conversation.conversationId === selectedConversationId;

              return (
                <Anchor
                  fz={14}
                  lh="26px"
                  c={isSelected ? "#003B52" : "#555555"}
                  type="button"
                  key={conversation.conversationId}
                  lineClamp={1}
                  underline="never"
                  p="5px 10px"
                  h="36px"
                  mb="2px"
                  onClick={() =>
                    onSelectConversation?.(conversation.conversationId)
                  }
                  styles={{
                    root:{
                      backgroundColor: isSelected
                        ? "#E1F6FF"
                        : "transparent",
                      borderRadius: "6px",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#E1F6FF",
                      },
                    }
                  }}
                  title={displayText}
                >
                  {displayText}
                </Anchor>
              );
            })}
            {hasMoreConversations && isLoadingMore && (
              <Text fz={11} c="#999999" ta="center" mt={10} mb={5}>
                Loading more...
              </Text>
            )}
          </>
        )}
      </ScrollArea>
    </Flex>
  );
};

export default SidePanel;
