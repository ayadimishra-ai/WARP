import {
  Anchor,
  Box,
  Button,
  Center,
  Flex,
  MantineProvider,
  Text,
  Tooltip,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconAlertTriangle, IconX } from "@tabler/icons";
import { IconUpload } from "@tabler/icons-react";
import SortIcons from "@warp/client/components/SortIcons";
import { isDocumentExpired } from "@warp/client/features/form/common-functions";
import {
  useUploadFilesPopup,
  type TableData,
} from "@warp/client/hooks/useUploadFilesPopup";
import UploadIcon from "@warp/client/icons/UploadIcon";
import Spinner from "@warp/client/layouts/Spinner";
import {
  MantineReactTable,
  MRT_Icons,
  MRT_VisibilityState,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useEffect, useMemo, useRef, useState } from "react";

const tableIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => (
    <SortIcons
      sortState={false}
      color={props.color || "#ffffff"}
      size={16}
      mrtTable
    />
  ),
  IconSortAscending: (props: any) => (
    <SortIcons
      sortState="asc"
      color={props.color || "#ffffff"}
      size={16}
      mrtTable
    />
  ),
  IconSortDescending: (props: any) => (
    <SortIcons
      sortState="desc"
      color={props.color || "#ffffff"}
      size={16}
      mrtTable
    />
  ),
};

const UploadFilesPopup = () => {
  // Use the custom hook for all business logic
  const {
    data,
    loading,
    error,
    selectedRowId,
    selectedRows,
    handleRowSelect,
    uploadStatus,
    handleFileUpload,
    handleSubmitSelectedDocuments,
    allowMultiple,
    formFieldId,
    acceptFiles,
    fileSize,
    isUploading, // New: for showing upload spinner
    isValidatingRARA, // New: for showing RARA validation spinner
  } = useUploadFilesPopup();

  // UI-only state for table configuration
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    { id: true }
  );

  // State for dangerous files notification
  const [dangerousFilesMessage, setDangerousFilesMessage] = useState<
    string | null
  >(null);

  // Ref to measure the notification section height
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notificationHeight, setNotificationHeight] = useState(0);

  // Dynamic text based on configuration
  const fileTypeText = useMemo(() => {
    return ".csv, .pdf, .xls";
  }, []);

  // Text content based on configuration
  const instructionText = allowMultiple
    ? `Please select the documents from below repository or upload multiple files for relevant documents you want to upload for this question.`
    : `Please select the document from below repository or upload another for relevant document you want to upload for this question.`;

  const buttonText =
    selectedRows.length > 1
      ? "Upload Selected Documents"
      : "Upload Selected Document";

  const dropzoneButtonText = allowMultiple
    ? "CHOOSE FILES TO UPLOAD"
    : "CHOOSE FILE TO UPLOAD";
  const dragDropText = allowMultiple ? "Drag & Drop Files" : "Drag & Drop File";

  // Get browser width from parent component via postMessage
  const [parentBrowserWidth, setParentBrowserWidth] = useState(1920); // Default fallback
  const [heightRequestSent, setHeightRequestSent] = useState(false);

  useEffect(() => {
    // Listen for messages from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === "object") {
        // Handle browser width response from parent
        if (
          event.data.type === "BROWSER_WIDTH_RESPONSE" &&
          typeof event.data.width === "number"
        ) {
          setParentBrowserWidth(event.data.width);
        }

        // Handle parent clicks to close popovers
        if (event.data.type === "PARENT_CLICK_OUTSIDE") {
          //  Trigger multiple event types on different elements
          const triggerCloseEvents = () => {
            const targets = [document.body, document.documentElement, window];
            const eventTypes = [
              "click",
              "mousedown",
              "mouseup",
              "pointerdown",
              "pointerup",
            ];

            targets.forEach((target) => {
              eventTypes.forEach((eventType) => {
                try {
                  const event = new MouseEvent(eventType, {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    detail: 1,
                    clientX: 0,
                    clientY: 0,
                  });

                  if (target === window) {
                    window.dispatchEvent(event);
                  } else {
                    (target as HTMLElement).dispatchEvent(event);
                  }
                } catch (e) {
                  console.log("Event dispatch failed:", e);
                }
              });
            });
          };

          setTimeout(triggerCloseEvents, 5);
        }
      }
    };

    // Request browser width from parent
    const requestBrowserWidth = () => {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            {
              type: "REQUEST_BROWSER_WIDTH",
              source: "upload-files-popup",
            },
            "*"
          );
          setHeightRequestSent(true);
        }
      } catch (e) {
        console.log("Cannot request browser width from parent:", e);
      }
    };

    // Set up click listener on parent window (if accessible)
    const setupParentClickListener = () => {
      try {
        if (window.parent && window.parent !== window) {
          // Request parent to setup click listener
          window.parent.postMessage(
            {
              type: "SETUP_CLICK_LISTENER",
              source: "upload-files-popup",
            },
            "*"
          );
        }
      } catch (e) {
        console.log("Cannot setup parent click listener:", e);
      }
    };

    // Set up message listener
    window.addEventListener("message", handleMessage);

    // Request browser width immediately and after a short delay
    requestBrowserWidth();
    const retryTimeout = setTimeout(requestBrowserWidth, 500);

    // Setup parent click listener
    setupParentClickListener();

    // Clean up
    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(retryTimeout);
    };
  }, []);

  // Effect to measure notification height dynamically
  useEffect(() => {
    if (notificationRef.current && dangerousFilesMessage) {
      const height = notificationRef.current.offsetHeight;
      setNotificationHeight(height + 16); // Add 16px for gap
    } else {
      setNotificationHeight(0);
    }
  }, [dangerousFilesMessage]);

  // Calculate table height based on parent browser width and actual notification height
  const isLargeScreen = parentBrowserWidth > 1366;
  const baseTableHeight = isLargeScreen ? 224 : 150;
  const adjustedTableHeight =
    notificationHeight > 0
      ? baseTableHeight - notificationHeight
      : baseTableHeight;
  const tableHeight = adjustedTableHeight;

  const columns = useMemo<MRT_ColumnDef<TableData>[]>(
    () => [
      {
        accessorKey: "originalFileName",
        header: "documents in your repository",
        Header: () => <Text>Documents in Your Repository</Text>,
        Cell: ({ row }) => {
          const ordinalSuffix = (day: number): string => {
            if (day >= 11 && day <= 13) {
              return "th";
            }
            switch (day % 10) {
              case 1:
                return "st";
              case 2:
                return "nd";
              case 3:
                return "rd";
              default:
                return "th";
            }
          };

          return (
            <Flex justify="space-between" align="center" gap={10}>
              <Anchor
                href={row.original.fileUrl}
                fz={12}
                c="#444444"
                td="none"
                underline={false}
                target="_blank"
                rel="noopener noreferrer"
                lineClamp={1}
              >
                {row.original.originalFileName}
              </Anchor>
              {isDocumentExpired(row.original.expiryDate) && (
                <Flex
                  h="18px"
                  px="12px"
                  bg="#DD3E3E"
                  align="center"
                  justify="center"
                  gap={5}
                  sx={{
                    borderRadius: "20px",
                  }}
                >
                  <Text c="#fff" fz={11}>
                    Expired
                  </Text>
                  <Tooltip
                    width={300}
                    multiline
                    withArrow
                    arrowSize={10}
                    openDelay={50}
                    closeDelay={50}
                    label={(() => {
                      if (!row.original.expiryDate) return "";
                      const expiryDate = new Date(row.original.expiryDate);
                      const day = expiryDate.getDate();
                      const month = expiryDate.toLocaleDateString("en-GB", {
                        month: "short",
                      });
                      const year = expiryDate.getFullYear();
                      return `This document has been expired on ${day}${ordinalSuffix(
                        day
                      )} ${month} ${year}. Kindly upload the latest document.`;
                    })()}
                    bg="#003B52"
                    fz={12}
                    withinPortal={true}
                  >
                    <Flex align="center" justify="center">
                      <IconAlertTriangle color="#fff" size={12} />
                    </Flex>
                  </Tooltip>
                </Flex>
              )}
            </Flex>
          );
        },
        size: 200,
      },
      {
        accessorKey: "uploadedOn",
        header: "uploaded on",
        Header: () => <Text ml="-0px">Uploaded On</Text>,
        Cell: ({ row }) => {
          const date = row.original.updatedAt
            ? new Date(row.original.updatedAt)
            : null;
          const formattedDate = date
            ? date
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                .replace(/ /g, " ")
                .replace(",", ",")
            : "Unknown";
          return (
            <Text fz={12} c="#444444" td="none">
              {formattedDate}
            </Text>
          );
        },
        size: 100,
      },
      {
        accessorKey: "updatedBy",
        header: "uploaded by",
        Header: () => <Text>Uploaded By</Text>,
        Cell: ({ row }) => {
          return (
            <Text fz={12} c="#444444" td="none">
              {row.original.uploadedBy || "-"}
            </Text>
          );
        },
        size: 100,
      },
      {
        accessorKey: "action",
        header: "ation",
        Header: () => <Text>Action</Text>,
        enableSorting: false,
        enableColumnFilter: false,
        size: 100,
        Cell: ({ row }) => {
          const isSelected = selectedRowId[row.original.id] || false;
          return (
            <Button
              variant="subtle"
              c={isSelected ? "#15AE49" : "#122F47"}
              className="btn"
              lts="0.15em"
              px="16px"
              fz="13px"
              onClick={() => {
                handleRowSelect(row.original.id);
              }}
              styles={{
                root: {
                  textAlign: "left",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                },
                inner: {
                  justifyContent: "flex-start",
                },
              }}
            >
              {isSelected ? "SELECTED" : "USE THIS"}
            </Button>
          );
        },
      },
    ],
    [selectedRowId, handleRowSelect]
  );

  const table = useMantineReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      // sorting,
    },
    // onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    icons: tableIcons,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    columnFilterDisplayMode: "popover",
    enableColumnActions: false,
    enableStickyHeader: false,
    enablePagination: false,
    // Add custom no records message that spans full table width
    renderEmptyRowsFallback: () => (
      <tr className="no-records">
        <td colSpan={columns.length}>
          <Center p="md" h="200px">
            <Text c="dimmed" fz="sm">
              No documents found in your repository
            </Text>
          </Center>
        </td>
      </tr>
    ),
    mantineTableContainerProps: {
      sx: {
        overflowX: "hidden", // Prevent horizontal scroll if not needed
        boxShadow: "0px 2px 2px 0px rgba(159, 162, 191, 0.32)",
        borderRadius: "10px",
        border: "1px solid #dee2e6",
      },
    },
    mantineTableProps: {
      sx: {
        borderCollapse: "separate", // Ensure proper table layout
        borderSpacing: 0,
        "& thead th": {
          position: "sticky", // Make header sticky
          top: 0, // Stick it to the top
          zIndex: 2,
          backgroundColor: "#162F4B", // Match header background
          color: "#ffffff",
          fontWeight: 600,
          height: "43px",
          fontSize: "12px",
          textAlign: "left",
        },
        "& thead th:first-of-type": {
          padding: "0 16px !important",
        },
        "& thead th:last-of-type": {
          paddingLeft: "27px !important",
        },
        "& tbody": {
          display: "block",
          overflowY: "auto",
          height: data.length > 0 ? `${tableHeight}px` : "265px",
          margin: "0",
          "::-webkit-scrollbar": {
            width: "5px",
            height: "5px",
            gap: "0px",
            borderRadius: "3px",
          },
          "::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.12)",
            borderRadius: "3px",
          },
          "::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: "3px",
          },
          "::-webkit-scrollbar-track": {
            background: "transparent",
          },
        },
        "& thead, & tbody tr": {
          display: "table",
          tableLayout: "fixed",
          width: "100%",
        },
        "& tbody tr": {
          cursor: "pointer",
          transition: "background-color 0.2s ease",
          "&:hover:not(.selected-row)": {
            backgroundColor: "#f1f3f6 !important",
          },
        },
      },
    },
    mantineTableBodyRowProps: ({ row }) => ({
      className: selectedRowId[row.original.id] ? "selected-row" : "",
      style: {
        backgroundColor: selectedRowId[row.original.id]
          ? "#D7FFE5" // Green for selected rows
          : !row.original.uploadedBy // Check if uploadedBy is null (system-generated)
          ? "rgba(106, 215, 233, 0.3)" // Light blue for system-generated files
          : isDocumentExpired(row.original.expiryDate)
          ? "rgba(255, 173, 173, 0.4)"
          : "transparent", // Default/transparent for user-uploaded rows
        transition: "background-color 0.3s ease",
        // Hover state
        "&:hover": {
          backgroundColor: selectedRowId[row.original.id]
            ? "#D7FFE5 !important" // Keep green for selected rows on hover
            : "#f8f9fa !important", // Gray color for all rows on hover (system-generated and user-uploaded)
        },
      },
    }),
    mantineTableHeadCellProps: {
      sx: {
        button: {
          color: "#ffffff",
          opacity: 1,
          "&:hover": {
            background: "none",
          },
        },
      },
      style: {
        color: "#ffffff",
        background: "#162F4B",
        height: "43px",
        fontSize: "12px",
        fontWeight: 600,
        verticalAlign: "middle",
        padding: "0px 12px",
        position: "sticky", // Sticky positioning
        top: 0, // Stick to the top
        zIndex: 2, // Ensure the header stays above content
      },
    },
    mantinePaperProps: {
      sx: {
        boxShadow: "none",
        border: "0px !important",
        borderRadius: "10px",
        "& > div:nth-of-type(2)": {
          padding: "5px 0px 0px",
        },
      },
    },
    mantineTableBodyCellProps: {
      style: {
        height: 32,
        fontWeight: 400,
        padding: "0px 16px",
        color: "#444444",
        border: "none",
        background: "transparent",
      },
    },
  });

  return (
    <Flex direction="column" gap="16px">
      <Text fz={14} lh="18px" c="#444444">
        {instructionText}
      </Text>

      {/* Custom notification for dangerous files */}
      {dangerousFilesMessage && (
        <Box
          ref={notificationRef}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "4px",
            padding: "4px 6px",
            backgroundColor: "#FFF4E6",
            border: "1px solid #FFD6A5",
            borderRadius: "8px",
            position: "relative",
          }}
        >
          {/* Warning Icon */}
          <IconAlertTriangle
            size={14}
            color="#F59E0B"
            style={{
              marginTop: "3px",
              flexShrink: 0,
            }}
          />

          {/* Message Content */}
          <Text
            fz={14}
            lh="20px"
            c="#92400E"
            style={{
              flex: 1,
              wordBreak: "break-word",
              fontSize: "12px",
            }}
          >
            {dangerousFilesMessage}
          </Text>

          {/* Close Button */}
          <Box
            onClick={() => setDangerousFilesMessage(null)}
            sx={{
              cursor: "pointer",
              padding: "2px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              "&:hover": {
                backgroundColor: "rgba(245, 158, 11, 0.1)",
              },
            }}
          >
            <IconX size={14} color="#92400E" />
          </Box>
        </Box>
      )}

      <Dropzone
        onDrop={(files) => {
          // Clear any previous dangerous files message
          setDangerousFilesMessage(null);

          // Call handleFileUpload with a callback to handle dangerous files
          handleFileUpload(files, (message: string) => {
            setDangerousFilesMessage(message);
          }).catch((error) => {
            console.error("File upload error:", error);
          });
        }}
        onReject={(files) => {
          // Analyze rejection reasons and create specific messages
          const sizeRejected = files.filter((f) =>
            f.errors.some((error) => error.code === "file-too-large")
          );
          const otherRejected = files.filter(
            (f) => !f.errors.some((error) => error.code === "file-too-large")
          );

          let message = "";

          if (sizeRejected.length > 0) {
            const sizeFileNames = sizeRejected
              .map((f) => f.file.name)
              .join(", ");
            const sizeCount = sizeRejected.length;
            message +=
              sizeCount === 1
                ? `File "${sizeFileNames}" is too large. Maximum allowed size is ${fileSize}MB.`
                : `${sizeCount} Files (${sizeFileNames}) are too large. Maximum allowed size is ${fileSize}MB per file.`;
          }
          if (otherRejected.length > 0) {
            const otherFileNames = otherRejected
              .map((f) => f.file.name)
              .join(", ");
            const otherCount = otherRejected.length;
            if (message) message += " ";
            message +=
              otherCount === 1
                ? `The file "${otherFileNames}" was rejected due to format restrictions.`
                : `${otherCount} files (${otherFileNames}) were rejected due to format restrictions.`;
          }

          setDangerousFilesMessage(message);
        }}
        maxSize={fileSize * 1024 * 1024} // Convert MB to bytes
        // No accept prop - allow all file types, security filtering happens in upload handler
        multiple={allowMultiple}
        radius="md"
        bg="#D4EDF6"
        pt={7}
        px="32px"
        disabled={isUploading} // Disable dropzone while uploading
        styles={{
          root: {
            borderWidth: "0px",
            backgroundColor: isUploading ? "#E0E0E0" : "#D4EDF6",
            "&:hover": {
              backgroundColor: isUploading ? "#E0E0E0" : "#BBDEFB",
            },
            "&[data-accept]": {
              backgroundColor: "#D4EDF6",
            },
          },
        }}
        h={95}
      >
        <Dropzone.Accept>
          <Flex align="center" justify="space-between" pt="15px">
            <IconUpload size={50} stroke={1.5} color="#005C81" />
            <Text c="#1A1A1A" fz={18}>
              Drop your {allowMultiple ? "files" : "file"} here
            </Text>
          </Flex>
        </Dropzone.Accept>
        <Dropzone.Reject>
          <Flex align="center" justify="space-between" pt="15px">
            <IconX size={50} color="#FC4E4E" />
            <Text c="#FC4E4E" fz={18}>
              Invalid file type or size. Please try again.
            </Text>
          </Flex>
        </Dropzone.Reject>
        <Dropzone.Idle>
          <Flex align="center" justify="space-between" gap="16px">
            <Flex align="center" justify="center" gap="20px">
              <UploadIcon />
              <Box>
                <Text fz={20} fw={500} c="#1A1A1A">
                  {dragDropText}
                </Text>
                {/* <Text fz={12} lh="18px" c="#1A1A1A">
                  Supported formats: {fileTypeText}
                </Text> */}
                <Text fz={12} lh="18px" c="#1A1A1A">
                  Max Size: {fileSize}MB
                </Text>
              </Box>
            </Flex>
            <Button
              variant="filled"
              sx={{
                background:
                  "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
              }}
              radius="xl"
              loading={isUploading} // Show loading state on button while uploading
            >
              {isUploading ? "Uploading" : dropzoneButtonText}
            </Button>
          </Flex>
        </Dropzone.Idle>
      </Dropzone>
      {/* Show loading spinner only when loading, otherwise always show table */}
      {loading ? (
        <Box h="150px">
          <Spinner visible={true} />
        </Box>
      ) : (
        <Box>
          <MantineProvider
            theme={{
              components: {
                Popover: {
                  styles: {
                    dropdown: {
                      zIndex: 9999,
                      padding: "8px",
                    },
                  },
                  defaultProps: {
                    withinPortal: false,
                    position: "bottom",
                    middlewares: {
                      flip: false,
                      shift: false,
                    },
                    offset: -85,
                  },
                },
                TextInput: {
                  styles: {
                    root: {
                      borderBottom: "0px !important",
                    },
                    input: {
                      padding: "0px 32px 2px 15px",
                      borderRadius: 30,
                      backgroundColor: "#f1f3f6",
                    },
                  },
                },
                Tooltip: {
                  defaultProps: {
                    offset: 10,
                    position: "bottom",
                  },
                },
              },
            }}
          >
            <MantineReactTable table={table} />
          </MantineProvider>
          {data.length > 0 && (
            <Button
              color="solidBtn"
              w="fit-content"
              ta="left"
              mt="16px"
              // disabled={selectedRows.length === 0 || isValidatingRARA} // Disable if no rows selected or validating
              disabled={selectedRows.length === 0} // Disable if no rows selected
              loading={isValidatingRARA} // Show loading spinner when validating RARA
              onClick={async () => {
                await handleSubmitSelectedDocuments();
              }}
            >
              {buttonText}
            </Button>
          )}
        </Box>
      )}
    </Flex>
  );
};

export default UploadFilesPopup;
