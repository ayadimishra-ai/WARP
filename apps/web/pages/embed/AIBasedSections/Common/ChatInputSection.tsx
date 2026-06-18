import {
  Alert,
  Anchor,
  Box,
  Card,
  Checkbox,
  Flex,
  ScrollArea,
  Switch,
  Text
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import SendPaperPlaneIcon from "@warp/client/icons/SendPaperPlaneIcon";
import {
  AI_DATA_SOURCES,
  type AIDataSource,
} from "@warp/shared/constants/app.constants";
import {
  DocumentLog,
  SubscriptionFeatures,
  SubscriptionQuota,
} from "@warp/shared/types/ai.types";
import React, { useEffect, useRef } from "react";
import AISparkleIconHeading from "./AISparkleIconHeading";
import ChatQuotaStatus from "./ChatQuotaStatus";
import DocumentRepositoryPopover from "./DocumentRepositoryPopover";
import SubscriptionOverlay from "./SubscriptionOverlay";

interface ChatInputSectionProps {
  companyId?: string;
  companyName?: string;
  message: string;
  setMessage: (message: string) => void;
  enableGraphicalOutput: boolean;
  setEnableGraphicalOutput: (enabled: boolean) => void;
  handleSend: () => Promise<void>;
  quota: SubscriptionQuota;
  subscriptionLoading: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  onOpenDocumentRepository?: () => void;
  selectedDocuments: Array<{ id: string; fileName: string }>;
  setSelectedDocuments: (docs: Array<{ id: string; fileName: string }>) => void;
  documents: DocumentLog[];
  documentsLoading: boolean;
  onLoadMoreDocuments?: () => void;
  hasMoreDocuments?: boolean;
  loadingMoreDocuments?: boolean;
  searchDocuments?: (searchTerm: string) => void;
  documentSearchTerm?: string;
  features: SubscriptionFeatures;
  selectedDataSources: string[];
  setSelectedDataSources: (sources: string[]) => void;
  isChatEmpty: boolean;
  resetKey?: number; // Key to force reset of input
  onNewChat?: () => void;
  handleOpenChatHistory?: () => void;
  sidePanelOpen?: boolean;
}

const ChatInputSection: React.FC<ChatInputSectionProps> = ({
  companyId,
  companyName,
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
  onOpenDocumentRepository,
  selectedDocuments = [],
  setSelectedDocuments,
  documents = [],
  documentsLoading,
  onLoadMoreDocuments,
  hasMoreDocuments = false,
  loadingMoreDocuments = false,
  searchDocuments,
  documentSearchTerm = "",
  features,
  selectedDataSources = [],
  setSelectedDataSources,
  isChatEmpty,
  resetKey,
  onNewChat,
  handleOpenChatHistory,
  sidePanelOpen,
}) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const lastSelectedDocsRef = useRef<Array<{ id: string; fileName: string }>>(
    []
  );
  const lastMessageRef = useRef<string>("");
  const isPastingRef = useRef<boolean>(false);
  const isTypingRef = useRef<boolean>(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isInputHovered, setIsInputHovered] = React.useState(false);

  // Force clear when resetKey changes (e.g., new chat)
  useEffect(() => {
    if (resetKey !== undefined) {
      // Reset all refs and state
      isPastingRef.current = false;
      isTypingRef.current = false;
      lastSelectedDocsRef.current = [];
      lastMessageRef.current = "";
      setIsFocused(false);

      // Clear the editable div and remove focus
      if (editableRef.current) {
        editableRef.current.innerHTML = "";
        editableRef.current.blur();
      }
    }
  }, [resetKey]);
  // Wrapper to send message and clear input + selected documents
  const sendAndClear = async () => {
    // Then call the send handler
    // Clear the input immediately when user submits
    if (editableRef.current) {
      editableRef.current.innerHTML = "";
      editableRef.current.blur();
    }
    lastSelectedDocsRef.current = [];
    lastMessageRef.current = "";
    setIsFocused(false);
    try {
      await handleSend();
    } catch (err) {
      console.error("sendAndClear: handleSend failed", err);
      throw err;
    }
  };

    // Update contentEditable when message changes externally (e.g., from suggestions)
  useEffect(() => {
    if (
      message !== lastMessageRef.current &&
      editableRef.current &&
      !isPastingRef.current &&
      !isTypingRef.current
    ) {
      lastMessageRef.current = message;

      // Build content with current badges and new message
      let content = "";

      // Add badges for currently selected documents
      (selectedDocuments ?? []).forEach((selectedDoc) => {
        const displayName = selectedDoc.fileName;
        content += `<span class="document-badge" contenteditable="false">${displayName}<button data-doc="${selectedDoc.id}" type="button">×</button></span><span class="badge-space" contenteditable="false"></span>`;
      });

      // Add the message text
      content += message;

      editableRef.current.innerHTML = content;

      // Re-attach button event listeners
      const buttons = editableRef.current.querySelectorAll(
        ".document-badge button"
      );
      buttons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const doc = (e.target as HTMLButtonElement).dataset.doc;
          if (doc) {
            setSelectedDocuments(
              (selectedDocuments ?? []).filter((d) => d.id !== doc)
            );
          }
        });
      });

      // Place cursor at end of text
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && editableRef.current) {
          const range = document.createRange();
          range.selectNodeContents(editableRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          editableRef.current.focus();
        }
      }, 0);
    }
  }, [message, selectedDocuments, setSelectedDocuments]);

  // Only update when badges change, not when message changes from typing
  useEffect(() => {
    if (
      JSON.stringify(selectedDocuments) !==
      JSON.stringify(lastSelectedDocsRef.current)
    ) {
      lastSelectedDocsRef.current = [...selectedDocuments];

      if (editableRef.current) {
        // Build content using clean message state (not mixed textContent)
        let content = "";

        // Add badges for currently selected documents (no trailing text spaces)
        (selectedDocuments ?? []).forEach((selectedDoc) => {
          const displayName = selectedDoc.fileName;
          content += `<span class="document-badge" contenteditable="false">${displayName}<button data-doc="${selectedDoc.id}" type="button">×</button></span><span class="badge-space" contenteditable="false"></span>`;
        });

        // Add the clean message text (user input only)
        content += message;

        editableRef.current.innerHTML = content;

        // Re-attach button event listeners
        const buttons = editableRef.current.querySelectorAll(
          ".document-badge button"
        );
        buttons.forEach((button) => {
          button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const doc = (e.target as HTMLButtonElement).dataset.doc;
            if (doc) {
              setSelectedDocuments(
                (selectedDocuments ?? []).filter((d) => d.id !== doc)
              );
            }
          });
        });

        // Place cursor at end of text
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection && editableRef.current) {
            const range = document.createRange();
            range.selectNodeContents(editableRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            editableRef.current.focus();
          }
        }, 0);
      }
    }
  }, [selectedDocuments, setSelectedDocuments]);

  // Define available data sources based on subscription features
  const availableDataSources: AIDataSource[] = [
    {
      value: AI_DATA_SOURCES.COMPANY_DOCUMENTS.value,
      label: AI_DATA_SOURCES.COMPANY_DOCUMENTS.label,
      enabled: features?.hasDocumentRepo ?? false,
    },
    {
      value: AI_DATA_SOURCES.ESG_DOCUMENTS.value,
      label: AI_DATA_SOURCES.ESG_DOCUMENTS.label,
      enabled: features?.hasESG ?? false,
    },
    {
      value: AI_DATA_SOURCES.BRSR_DOCUMENTS.value,
      label: AI_DATA_SOURCES.BRSR_DOCUMENTS.label,
      enabled: features?.hasBRSR ?? false,
    },
  ].filter((source) => source.enabled);

  // Initialize selected data sources based on available ones
  useEffect(() => {
    if (
      (availableDataSources?.length ?? 0) > 0 &&
      (selectedDataSources?.length ?? 0) === 0
    ) {
      // Set all available sources as selected by default
      setSelectedDataSources(
        availableDataSources?.map((source) => source.value) ?? [],
      );
    }
  }, [
    availableDataSources?.length,
    selectedDataSources?.length,
    setSelectedDataSources,
  ]);

  // Handle checkbox change
  const handleDataSourceChange = (value: string, checked: boolean) => {
    if (!checked && (availableDataSources?.length ?? 0) === 1) {
      // Prevent unchecking if only one data source is available
      return;
    }

    if (!checked && (selectedDataSources?.length ?? 0) === 1) {
      // Prevent unchecking if it's the last selected data source
      return;
    }

    if (checked) {
      setSelectedDataSources([...(selectedDataSources || []), value]);
    } else {
      setSelectedDataSources(
        (selectedDataSources || []).filter((source) => source !== value),
      );
    }
  };

  const smallScreen = useMediaQuery("(max-width: 1282px)");
  const midScreen = useMediaQuery("(max-width: 1480px)");

  // Check if entire component should be disabled (both quotas exhausted)
  const isComponentDisabled = !quota?.canUseTextual && !quota?.canUseGraphical;

  // Determine graphical toggle state and disabled status
  const getGraphicalToggleState = () => {
    // If textual is exhausted but graphical is not, force graphical and disable toggle
    if (!quota?.canUseTextual && quota?.canUseGraphical) {
      return { checked: true, disabled: true };
    }

    // If graphical is exhausted but textual is not, force textual and disable toggle
    if (!quota?.canUseGraphical && quota?.canUseTextual) {
      return { checked: false, disabled: true };
    }

    // If both are available or both are exhausted, allow user control but disable during loading
    return {
      checked: enableGraphicalOutput,
      disabled: isLoading || !quota?.canUseGraphical,
    };
  };

  const graphicalToggleState = getGraphicalToggleState();

  // Auto-adjust enableGraphicalOutput based on quota availability
  useEffect(() => {
    // If textual is exhausted but graphical is available, automatically switch to graphical
    if (
      !quota?.canUseTextual &&
      quota?.canUseGraphical &&
      !enableGraphicalOutput
    ) {
      setEnableGraphicalOutput(true);
    }

    // If graphical is exhausted but textual is available, automatically switch to textual
    if (
      !quota?.canUseGraphical &&
      quota?.canUseTextual &&
      enableGraphicalOutput
    ) {
      setEnableGraphicalOutput(false);
    }
  }, [
    quota?.canUseTextual,
    quota?.canUseGraphical,
    enableGraphicalOutput,
    setEnableGraphicalOutput,
  ]);

  return (
    <Box mx={30} sx={{ position: "relative" }}>
      {/* Error Alert */}
      {error && (
        <Alert
          color="red"
          mb="md"
          withCloseButton
          onClose={clearError}
          sx={{
            borderRadius: 15,
          }}
        >
          {error}
        </Alert>
      )}
      {/* Chat Input Card Section*/}
      <Box sx={{ position: "relative" }} className="aiChatInputSection">
        <Card
          bg="#fff"
          px={0}
          pt={smallScreen ? 15 : 18}
          pb={smallScreen ? 5 : 18}
          radius={smallScreen ? 15 : 30}
        >
          {/* First line: + How can I assist you today | Enable Graphical Output */}
          <Flex
            align="flex-start"
            justify="flex-start"
            px={smallScreen ? 15 : 25}
            gap={0}
            style={{cursor:'text'}}
          >
            <AISparkleIconHeading />
            {/* Custom input field with inline document badges */}
            <ScrollArea
              w="100%"
              scrollbarSize={8}
              type="auto"
              offsetScrollbars
              onMouseEnter={() => setIsInputHovered(true)}
              onMouseLeave={() => setIsInputHovered(false)}
              styles={{
                scrollbar: {
                  "&, &:hover": {
                    background: "#fff",
                  },
                  '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                    backgroundColor: "#e4e4e4",
                    opacity: isInputHovered ? 1 : 0, // Show scrollbar when component is hovered
                    transition: "opacity 0.2s ease",
                  },
                  '&[data-orientation="vertical"] .mantine-ScrollArea-thumb:hover': {
                    backgroundColor: "#d1d1d1",
                  },
                },
                viewport: {
                  paddingBottom: 0,
                  maxHeight:94,
                  minHeight:30,
                  overflowX: 'hidden'
                },
              }}
            >
            <Box
            className={`aichatInputTextarea${
              (message?.length ?? 0) === 0 &&
              (selectedDocuments?.length ?? 0) === 0 &&
              !isFocused
                ? " show-placeholder"
                : ""
            }`}
            ref={editableRef}
            contentEditable={
              !isLoading && (quota?.canUseTextual || quota?.canUseGraphical)
            }
            suppressContentEditableWarning={true}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onBeforeInput={(event: any) => {
              const element = editableRef.current;
              if (!element) return;

              // Get current text content
              const fullText = element.textContent || "";

              // Remove badge text
              let cleanText = fullText;
              (selectedDocuments ?? []).forEach((selectedDoc) => {
                const displayName = selectedDoc.fileName;
                cleanText = cleanText
                  .replace(displayName + "×", "")
                  .replace(displayName, "");
              });
              cleanText = cleanText.replace(/^\s+/, "").replace(/\s+/g, " ");

              // Get the input data
              const inputData = event.data || "";

              // Check if adding this input would exceed the limit (block typing beyond 2000)
              if (cleanText.length + inputData.length > 2000) {
                event.preventDefault();
                return;
              }
            }}
            onInput={() => {
              const element = editableRef.current;
              if (!element) return;

              // Set typing flag to prevent useEffect interference
              isTypingRef.current = true;

              // Get only the text content that's NOT inside badge spans
              let cleanText = "";
              element.childNodes.forEach((node) => {
                // Skip badge spans - only get text nodes and other non-badge content
                if (node.nodeType === Node.TEXT_NODE) {
                  cleanText += node.textContent || "";
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                  const elem = node as HTMLElement;
                  if (!elem.classList.contains("document-badge")) {
                    cleanText += elem.textContent || "";
                  }
                }
              });

              // Clean up extra spaces
              cleanText = cleanText.replace(/^\s+/, "").replace(/\s+/g, " ");

              if (cleanText.length <= 2000) {
                // Set flag to prevent useEffect interference during paste
                if (isPastingRef.current) {
                  setTimeout(() => {
                    isPastingRef.current = false;
                  }, 100);
                }
                setMessage(cleanText);
              } else {
                // Truncate to 2000 for paste operations
                const truncated = cleanText.substring(0, 2000);
                if (isPastingRef.current) {
                  setTimeout(() => {
                    isPastingRef.current = false;
                  }, 100);
                }
                setMessage(truncated);

                // Update display with truncated content
                let content = "";
                (selectedDocuments ?? []).forEach((selectedDoc) => {
                  const displayName = selectedDoc.fileName;
                  content += `<span class="document-badge" contenteditable="false">${displayName}<button data-doc="${selectedDoc.id}" type="button">×</button></span><span class="badge-space" contenteditable="false"></span>`;
                });
                content += truncated;
                element.innerHTML = content;

                // Re-attach button event listeners
                const buttons = element.querySelectorAll(
                  ".document-badge button"
                );
                buttons.forEach((button) => {
                  button.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const doc = (e.target as HTMLButtonElement).dataset.doc;
                    if (doc) {
                      setSelectedDocuments(
                        (selectedDocuments ?? []).filter((d) => d.id !== doc)
                      );
                    }
                  });
                });

                // Place cursor at end
                setTimeout(() => {
                  const selection = window.getSelection();
                  if (selection && element) {
                    const range = document.createRange();
                    range.selectNodeContents(element);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                  }
                }, 0);
              }

              // Reset typing flag after a delay to allow for rapid typing
              setTimeout(() => {
                isTypingRef.current = false;
              }, 300);
            }}
            onSelect={() => {
              // Constrain selection/caret to message region (after last badge and trailing space)
              const root = editableRef.current;
              if (!root) return;
              const sel = window.getSelection();
              if (!sel || sel.rangeCount === 0) return;
              const badges = root.querySelectorAll(".document-badge");
              if (badges.length === 0) return;
              const lastBadge = badges[badges.length - 1] as Node;

              const current = sel.getRangeAt(0);
              const msgRange = document.createRange();
              msgRange.setStartAfter(lastBadge);
              msgRange.setEnd(root, root.childNodes.length);

              // If selection intersects a badge OR starts before message start, move it
              let intersects = false;
              badges.forEach((b) => {
                if (current.intersectsNode(b)) intersects = true;
              });

              const startsBeforeMessage =
                current.compareBoundaryPoints(Range.START_TO_START, msgRange) <
                0;

              // Check if cursor is in the trailing space after the last badge
              let isInTrailingSpace = false;
              const nextNode = lastBadge.nextSibling;
              if (
                nextNode &&
                nextNode.nodeType === Node.TEXT_NODE &&
                current.collapsed
              ) {
                if (
                  current.startContainer === nextNode &&
                  current.startOffset === 0
                ) {
                  isInTrailingSpace = true;
                }
              }

              if (intersects || startsBeforeMessage || isInTrailingSpace) {
                const caret = document.createRange();
                if (isInTrailingSpace && nextNode) {
                  // Skip the trailing space
                  caret.setStart(nextNode, 1);
                  caret.collapse(true);
                } else {
                  caret.setStartAfter(lastBadge);
                  caret.collapse(true);
                }
                sel.removeAllRanges();
                sel.addRange(caret);
              }
            }}
            onCopy={(event: React.ClipboardEvent<HTMLDivElement>) => {
              // Copy only the message (never badges or their spacing)
              event.clipboardData?.setData("text/plain", message);
              event.preventDefault();
            }}
            onPaste={(event: React.ClipboardEvent<HTMLDivElement>) => {
              event.preventDefault();
              const text = event.clipboardData?.getData("text/plain") || "";

              if (!text) return;

              // Set flag to prevent useEffect interference
              isPastingRef.current = true;

              // Use execCommand which handles cursor positioning correctly
              document.execCommand("insertText", false, text);

              // Reset flag after a delay
              setTimeout(() => {
                isPastingRef.current = false;
              }, 100);
            }}
            onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
              // Always ensure caret stays after last badge and trailing space when badges exist
              {
                const root = editableRef.current;
                if (root && (selectedDocuments?.length ?? 0) > 0) {
                  const sel = window.getSelection();
                  if (sel && sel.rangeCount > 0) {
                    const badges = root.querySelectorAll(".document-badge");
                    if (badges.length > 0) {
                      const lastBadge = badges[badges.length - 1] as Node;
                      const current = sel.getRangeAt(0);
                      const msgRange = document.createRange();
                      msgRange.setStartAfter(lastBadge);
                      msgRange.setEnd(root, root.childNodes.length);

                      const intersects = Array.from(badges).some((b) =>
                        current.intersectsNode(b)
                      );
                      const startsBeforeMessage =
                        current.compareBoundaryPoints(
                          Range.START_TO_START,
                          msgRange
                        ) < 0;

                      // Check if cursor is in the trailing space after the last badge
                      let isInTrailingSpace = false;
                      const nextNode = lastBadge.nextSibling;
                      if (
                        nextNode &&
                        nextNode.nodeType === Node.TEXT_NODE &&
                        current.collapsed
                      ) {
                        if (
                          current.startContainer === nextNode &&
                          current.startOffset === 0
                        ) {
                          isInTrailingSpace = true;
                        }
                      }

                      if (
                        intersects ||
                        startsBeforeMessage ||
                        isInTrailingSpace
                      ) {
                        const caret = document.createRange();
                        if (isInTrailingSpace && nextNode) {
                          // Skip the trailing space
                          caret.setStart(nextNode, 1);
                          caret.collapse(true);
                        } else {
                          caret.setStartAfter(lastBadge);
                          caret.collapse(true);
                        }
                        sel.removeAllRanges();
                        sel.addRange(caret);
                      }
                    }
                  }
                }
              }
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !isLoading &&
                (quota?.canUseTextual || quota?.canUseGraphical)
              ) {
                event.preventDefault();
                // Only send if there's actual message text (not just badges)
                if (message.trim().length > 0) {
                  sendAndClear();
                }
                return;
              }

              // Ctrl/Cmd + A: select only message (text after last badge and trailing space)
              if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "a"
              ) {
                const root = editableRef.current;
                if (!root) return;
                const badges = root.querySelectorAll(".document-badge");
                const sel = window.getSelection();
                if (!sel) return;
                event.preventDefault();
                const range = document.createRange();
                if (badges.length > 0) {
                  // Find the last badge-space span and start selection after it
                  const spaces = root.querySelectorAll(".badge-space");
                  const lastSpace =
                    spaces.length > 0
                      ? (spaces[spaces.length - 1] as Node)
                      : null;

                  if (lastSpace) {
                    range.setStartAfter(lastSpace);
                    range.setEnd(root, root.childNodes.length);
                  } else {
                    const lastBadge = badges[badges.length - 1] as Node;
                    range.setStartAfter(lastBadge);
                    range.setEnd(root, root.childNodes.length);
                  }
                } else {
                  // No badges, select all content
                  range.selectNodeContents(root);
                }
                sel.removeAllRanges();
                sel.addRange(range);
                return;
              }

              // If selection would delete badges, block backspace/delete
              if (
                (event.key === "Backspace" || event.key === "Delete") &&
                (selectedDocuments?.length ?? 0) > 0
              ) {
                const sel = window.getSelection();
                const root = editableRef.current;
                if (sel && sel.rangeCount > 0 && root) {
                  const r = sel.getRangeAt(0);
                  const badges = root.querySelectorAll(".document-badge");

                  // Check if selection intersects any badge
                  let intersectsBadge = false;
                  badges.forEach((b) => {
                    if (r.intersectsNode(b)) intersectsBadge = true;
                  });

                  if (intersectsBadge) {
                    event.preventDefault();
                    return;
                  }

                  // For backspace, check if cursor is right after the last badge
                  if (
                    event.key === "Backspace" &&
                    r.collapsed &&
                    badges.length > 0
                  ) {
                    const lastBadge = badges[badges.length - 1];

                    // Get the text node that comes after the last badge
                    let nextNode = lastBadge.nextSibling;

                    // Check if cursor is in this next node at position 0 (the &nbsp;)
                    if (
                      nextNode &&
                      r.startContainer === nextNode &&
                      r.startOffset === 0
                    ) {
                      event.preventDefault();
                      return;
                    }

                    // Also check if the cursor's container is the root and it's positioned right after the badge
                    if (r.startContainer === root) {
                      const children = Array.from(root.childNodes);
                      const lastBadgeIndex = children.indexOf(lastBadge);
                      if (
                        lastBadgeIndex !== -1 &&
                        r.startOffset <= lastBadgeIndex + 1
                      ) {
                        event.preventDefault();
                        return;
                      }
                    }
                  }
                }
              }
            }}
            sx={{
              border: "0px solid #fff",
              fontSize: midScreen ? "14px" : "16px",
              width: "100%",  
              color: "#003B52",
              lineHeight: "28px",
              cursor:
                isLoading || (!quota?.canUseTextual && !quota?.canUseGraphical)
                  ? "not-allowed"
                  : "text",
              outline: "none",
              wordWrap: "break-word",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
              opacity: !quota?.canUseTextual && !quota?.canUseGraphical ? 0.5 : 1,
              backgroundColor:
                !quota?.canUseTextual && !quota?.canUseGraphical
                  ? "#f5f5f5"
                  : "transparent",
             
              "&.show-placeholder:before": {
                content: `"${isChatEmpty ? "Chat with Snowkap AI" : "Have questions? Ask me more"}"`,
                color: "#9CA3AF",
                fontStyle: "normal",
                pointerEvents: "none",
              },
              "&.show-placeholder": {
                caretColor: "transparent",
              },
              "&.show-placeholder:focus": {
                caretColor: "auto",
              },
              "& .badges-container": {
                display: "inline",
              },
              "& .document-badge": {
                display: "inline-block",
                backgroundColor: "#fff",
                color: "#444444",
                borderRadius: "30px",
                border: "1px solid #EEEEEE",
                padding: "0px 12px",
                height:24,
                lineHeight: "24px",
                fontSize: "12px",
                fontWeight: 300,
                marginRight: "6px",
                verticalAlign: "middle",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                position: "relative",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                cursor: "default",
              },
              "& .badge-space": {
                display: "inline",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                minWidth: "0px",
                cursor: "none",
              },
              "& .document-badge button": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                border: "none",
                color: "#B7B7B7",
                cursor: "pointer",
                backgroundColor: "#EEEEEE",
                fontSize: "18px",
                position: "absolute",
                top: 2,
                right: 4,
                opacity: 0,
                visibility: "hidden",
                transition: "opacity 0.2s ease",
                pointerEvents: "auto",
              },
              "& .document-badge:hover button": {
                opacity: 1,
                visibility: "visible",
              },
              "& .text-content": {
                outline: "none",
                border: "none",
              },
            }}/>
            </ScrollArea>
          </Flex>
          {/* Submit button Icon */}
          <Flex
            justify="space-between"
            align="center"
            gap="md"
            px={smallScreen ? 15 : 25}
            pt={5}
          >
            {!sidePanelOpen && (
              <Flex gap={10} align="center">
                <Anchor
                  type="button"
                  onClick={!isLoading ? handleOpenChatHistory : undefined}
                  c="#99A7AD"
                  fz={smallScreen ? 12 : 14}
                  underline={false}
                  sx={{
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.5 : 1,
                    "&:hover": { color: "#003B52" },
                  }}
                >
                  All Chats
                </Anchor>
                <Text c="#99A7AD" fz={smallScreen ? 12 : 14}>
                  |
                </Text>
                <Anchor
                  type="button"
                  onClick={!isLoading ? onNewChat : undefined}
                  c="#99A7AD"
                  fz={smallScreen ? 12 : 14}
                  underline={false}
                  sx={{
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.5 : 1,
                    "&:hover": { color: "#003B52" },
                  }}
                >
                  Start New
                </Anchor>
              </Flex>
            )}

            {/* Data Source Checkboxes */}
            {(availableDataSources?.length ?? 0) > 0 && (
              <Flex align="center" gap={5} mt={4}>
                <Text fz={smallScreen ? 12 : 14} c="#626262" fw={500} mb={7}>
                  Data Source:
                </Text>
                {availableDataSources?.map((dataSource) => {
                  const isChecked = (selectedDataSources || []).includes(
                    dataSource.value,
                  );
                  const isDisabled =
                    isLoading ||
                    (availableDataSources?.length ?? 0) === 1 ||
                    ((selectedDataSources?.length ?? 0) === 1 && isChecked);

                  return (
                    <React.Fragment key={dataSource.value}>
                      <Checkbox
                        value={dataSource.value}
                        label={dataSource.label}
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={(event) =>
                          handleDataSourceChange(
                            dataSource.value,
                            event.currentTarget.checked,
                          )
                        }
                        size="xs"
                        styles={{
                          label: {
                            paddingLeft: 6,
                            fontSize: smallScreen ? 12 : 14,
                            color: isDisabled ? "#adb5bd" : "#626262",
                            cursor: isDisabled ? "not-allowed" : "pointer",
                          },
                          body: {
                            paddingLeft: 10,
                          },
                        }}
                      />
                      {dataSource.value ===
                        AI_DATA_SOURCES.COMPANY_DOCUMENTS.value && (
                        <Box mt={-7}>
                          <DocumentRepositoryPopover
                            selectedDocuments={selectedDocuments}
                            setSelectedDocuments={setSelectedDocuments}
                            documents={documents}
                            documentsLoading={documentsLoading}
                            onLoadMoreDocuments={onLoadMoreDocuments}
                            hasMoreDocuments={hasMoreDocuments}
                            loadingMoreDocuments={loadingMoreDocuments}
                            searchDocuments={searchDocuments}
                            documentSearchTerm={documentSearchTerm}
                            smallScreen={smallScreen}
                            disabled={isLoading}
                          />
                        </Box>
                      )}
                    </React.Fragment>
                  );
                })}
              </Flex>
            )}
            <Flex gap={15} align="center">
              <Flex align="center" gap="sm">
                <Text fz={smallScreen ? 13 : 15} c="#444444">
                  Graphical Output
                </Text>
                <Switch
                  checked={graphicalToggleState.checked}
                  disabled={graphicalToggleState.disabled}
                  onChange={(event) =>
                    setEnableGraphicalOutput(event.currentTarget.checked)
                  }
                  lh={0}
                  mt={-6}
                />
              </Flex>
              <Box
                p={0}
                component="button"
                onClick={
                  (message?.trim() ?? "") &&
                  !isLoading &&
                  quota?.hasActiveSubscription &&
                  (quota?.canUseTextual || quota?.canUseGraphical)
                    ? sendAndClear
                    : undefined
                }
                disabled={
                  !(message?.trim() ?? "") ||
                  isLoading ||
                  !quota?.hasActiveSubscription ||
                  (!quota?.canUseTextual && !quota?.canUseGraphical)
                }
                sx={{
                  backgroundColor: "#fff",
                  border: "none",
                  cursor:
                    (message?.trim() ?? "") &&
                    !isLoading &&
                    quota?.hasActiveSubscription &&
                    (quota?.canUseTextual || quota?.canUseGraphical)
                      ? "pointer"
                      : "not-allowed",
                  transition: "all 0.2s ease",
                  opacity:
                    !quota?.canUseTextual && !quota?.canUseGraphical ? 0.5 : 1,
                  "&:disabled": {
                    cursor: "not-allowed",
                  },
                }}
              >
                <SendPaperPlaneIcon
                  disabled={
                    !(message?.trim() ?? "") ||
                    isLoading ||
                    !quota?.hasActiveSubscription ||
                    (!quota?.canUseTextual && !quota?.canUseGraphical)
                  }
                  width={smallScreen ? 30 : 40}
                  height={smallScreen ? 30 : 40}
                />
              </Box>
            </Flex>
          </Flex>
        </Card>

        {/* Overlay for Quota Exhausted */}
        {isComponentDisabled && (
          <SubscriptionOverlay smallScreen={smallScreen} />
        )}
      </Box>
      {/* Remaining queries text at bottom */}
      <Flex align="center" justify="center">
        <ChatQuotaStatus
          quota={quota}
          subscriptionLoading={subscriptionLoading}
          smallScreen={smallScreen}
        />
        {(message?.length ?? 0) > 0 &&
          <Text
            right={0}
            pos="absolute"
            fz={smallScreen ? 12 : 14}
            c={(message?.length ?? 0) > 1800 ? "#F70D0D" : "#003B52"}
          >
            {message?.length ?? 0}/2000
          </Text>
        }
      </Flex>
    </Box>
  );
};

export default ChatInputSection;
