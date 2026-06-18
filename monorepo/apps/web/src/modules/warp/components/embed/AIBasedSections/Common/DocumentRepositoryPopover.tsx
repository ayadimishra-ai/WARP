import {
  ActionIcon,
  Checkbox,
  Popover,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import DocumentRepoIcon from "@/modules/warp/packages/client/icons/DocumentRepoIcon";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface AiSuggestedDocument {
  id: string;
  title: string;
  isOther: boolean;
}

interface DocumentLog {
  id: string;
  originalFileName: string;
  fileName: string;
  status: string;
  extractionPercentage: number;
  AISuggestedDocuments?: AiSuggestedDocument;
}

interface DocumentRepositoryPopoverProps {
  selectedDocuments: Array<{ id: string; fileName: string }>;
  setSelectedDocuments: (docs: Array<{ id: string; fileName: string }>) => void;
  documents: DocumentLog[];
  documentsLoading: boolean;
  onLoadMoreDocuments?: () => void;
  hasMoreDocuments?: boolean;
  loadingMoreDocuments?: boolean;
  searchDocuments?: (searchTerm: string) => void;
  documentSearchTerm?: string;
  smallScreen: boolean;
  disabled?: boolean;
}

const DocumentRepositoryPopover: React.FC<DocumentRepositoryPopoverProps> = ({
  selectedDocuments = [],
  setSelectedDocuments,
  documents = [],
  documentsLoading,
  onLoadMoreDocuments,
  hasMoreDocuments = false,
  loadingMoreDocuments = false,
  searchDocuments,
  documentSearchTerm = "",
  smallScreen,
  disabled = false,
}) => {
  const [opened, setOpened] = useState(false);
  const [localDocumentSearchTerm, setLocalDocumentSearchTerm] = useState(
    documentSearchTerm || "",
  );
  const [hasDocumentSearchInteracted, setHasDocumentSearchInteracted] =
    useState(false);

  const documentSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isScrollAreaHovered, setIsScrollAreaHovered] = useState(false);

  // Helper functions to work with the new selectedDocuments structure
  const getSelectedDocumentIds = () => selectedDocuments.map((doc) => doc.id);
  const isDocumentSelected = (docId: string) =>
    selectedDocuments.some((doc) => doc.id === docId);

  const handleDocumentSelectionChange = (selectedIds: string[]) => {
    const newSelectedDocuments = selectedIds.map((id) => {
      const existingSelected = selectedDocuments.find((doc) => doc.id === id);
      if (existingSelected) {
        return existingSelected;
      }
      const document = documents.find((doc) => doc.id === id);
      return {
        id: id,
        fileName: document?.originalFileName || document?.fileName || "Unknown",
      };
    });
    setSelectedDocuments(newSelectedDocuments);
  };

  // Debounced document search function
  const debouncedDocumentSearch = useCallback(
    (searchValue: string) => {
      if (!searchDocuments) return;

      if (documentSearchTimeoutRef.current) {
        clearTimeout(documentSearchTimeoutRef.current);
      }

      documentSearchTimeoutRef.current = setTimeout(() => {
        if (searchDocuments) {
          searchDocuments(searchValue);
        }
      }, 300);
    },
    [searchDocuments],
  );

  // Effect to handle document search term changes
  useEffect(() => {
    if (hasDocumentSearchInteracted) {
      debouncedDocumentSearch(localDocumentSearchTerm);
    }

    return () => {
      if (documentSearchTimeoutRef.current) {
        clearTimeout(documentSearchTimeoutRef.current);
      }
    };
  }, [
    localDocumentSearchTerm,
    debouncedDocumentSearch,
    hasDocumentSearchInteracted,
  ]);

  // Sync with external document search term changes
  useEffect(() => {
    setLocalDocumentSearchTerm(documentSearchTerm || "");
  }, [documentSearchTerm]);

  // Handle scroll to load more documents
  const handleScroll = useCallback(
    (position: { x: number; y: number }) => {
      const scrollElement = scrollAreaRef.current?.querySelector(
        ".mantine-ScrollArea-viewport",
      );
      if (!scrollElement) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold

      if (
        isNearBottom &&
        hasMoreDocuments &&
        !loadingMoreDocuments &&
        !documentsLoading &&
        onLoadMoreDocuments
      ) {
        onLoadMoreDocuments();
      }
    },
    [
      hasMoreDocuments,
      loadingMoreDocuments,
      documentsLoading,
      onLoadMoreDocuments,
    ],
  );

  const getDocumentTooltip = (doc: DocumentLog) => {
    if (doc.AISuggestedDocuments?.title && !doc.AISuggestedDocuments?.isOther) {
      return `${doc.originalFileName} (${doc.AISuggestedDocuments.title})`;
    }
    return doc.originalFileName;
  };

  return (
    <Popover
      opened={opened && !disabled}
      onChange={setOpened}
      position="top-start"
      withArrow
      shadow="md"
      width={250}
      offset={10}
    >
      <Popover.Target>
        <ActionIcon
          variant="transparent"
          styles={{
            root: {
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }
          }}
          onClick={disabled ? undefined : () => setOpened((o) => !o)}
        >
          <DocumentRepoIcon
            color={disabled ? "#adb5bd" : opened ? "#444444" : "#99A7AD"}
            width={smallScreen ? 20 : 24}
            height={smallScreen ? 20 : 24}
          />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown p={10} pr={2}>
        <TextInput
          variant="search"
          placeholder="Search Document..."
          value={localDocumentSearchTerm}
          onChange={(event) => {
            setLocalDocumentSearchTerm(event.currentTarget.value);
            setHasDocumentSearchInteracted(true);
          }}
          rightSection={
            localDocumentSearchTerm && (
              <ActionIcon
                size="xs"
                variant="transparent"
                onClick={() => setLocalDocumentSearchTerm("")}
              >
                <IconX size={16} color="#666666" />
              </ActionIcon>
            )
          }
          pr={8}
          styles={{
            input: {
              paddingLeft: 16,
              border: "0px solid #F1F3F6",
              borderRadius: 30,
              fontSize: "12px",
              backgroundColor: "#F1F3F6",
              color: "#555555",
              "&::placeholder": { color: "#8992A5" },
              "&:focus":{
                border: "1px solid #005C81",
              }
            },
          }}
          mb={10}
        />

        <ScrollArea
          scrollbarSize={8}
          type="hover"
          onScrollPositionChange={handleScroll}
          offsetScrollbars
          ref={scrollAreaRef}
          styles={{
            scrollbar: {
              "&, &:hover": {
                background: "#fff",
              },
              '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                backgroundColor: "#000",
                opacity: 0.12,
                transition: "opacity 0.2s ease",
              },
            },
            viewport: {
              paddingBottom: 0,
              maxHeight: 200,
            },
          }}
        >
          <Checkbox.Group
            value={getSelectedDocumentIds()}
            onChange={handleDocumentSelectionChange}
            size="xs"
            styles={{
              root: {
                "& .mantine-Stack-root": {
                  paddingTop: 0,
                },
              },
            }}
          >
            {documentsLoading ? (
              <Text fz={12} c="#555555" p="12px" pl={0}>
                Loading documents...
              </Text>
            ) : !documents || documents.length === 0 ? (
              <Text
                fz={12}
                c="#555555"
                p="12px"
                pl={0}
                styles={{ root: { wordBreak: "break-word" } }}
              >
                No results found
              </Text>
            ) : (
              documents.map((doc) => (
                <Checkbox
                  key={doc.id}
                  value={doc.id}
                  label={
                    <span title={getDocumentTooltip(doc)}>
                      {getDocumentTooltip(doc)}
                    </span>
                  }
                  title={getDocumentTooltip(doc)}
                  styles={{
                    root: {
                      paddingTop: "0px !important",
                      paddingBottom: "0px !important",
                    },
                    body: {
                      padding: "12px 5px",
                      width: "100%",
                      borderRadius: 4,
                      background: isDocumentSelected(doc.id)
                        ? "#E1F6FF"
                        : "transparent",
                      "&:hover": {
                        background: "#E1F6FF",
                      },
                    },
                    label: {
                      fontSize: 12,
                      color: isDocumentSelected(doc.id) ? "#003B52" : "#555555",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                      maxWidth: "200px",
                      lineHeight: "20px",
                    },
                  }}
                />
              ))
            )}
            {loadingMoreDocuments && (
              <Text fz={12} c="#666" ta="center" mt={10} p="10px">
                Loading more documents...
              </Text>
            )}
          </Checkbox.Group>
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
  );
};

export default DocumentRepositoryPopover;
