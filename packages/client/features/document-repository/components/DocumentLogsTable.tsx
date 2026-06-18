import {
  ActionIcon,
  Autocomplete,
  Badge,
  Box,
  CloseButton,
  createStyles,
  Flex,
  Group,
  Paper,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { IconFilter } from "@tabler/icons";
import PaginationFooter from "@warp/client/components/PaginationFooter";
import SortIcons from "@warp/client/components/SortIcons";
import SearchIcon from "@warp/client/components/svgIcons/SearchIcon";
import Spinner from "@warp/client/layouts/Spinner";
import { useGetDocumentLogsWithAiSuggestedDocumentsQuery } from "@warp/graphql/queries/generated/get-document-logs-with-ai-suggested-documents";
import { DocumentLogsStatus } from "@warp/shared/constants/app.constants";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import {
  AnchorWithTooltip,
  TextWithTooltip,
} from "../../../components/TooltipUtils";
import { getUserContext } from "../../form/common-functions";
import { formatDateAndTime } from "../utils/documentHelpers";

const useStyles = createStyles((theme) => ({
  textFieldFilter: {
    display: "flex",
    gap: "20px",
    width: "43%",
    "@media(max-width:1400px)": {
      width: "47%",
    },
  },
  searchInputWrapper: {
    flex: "0 0 235px",
    "&:hover": {
      borderColor: "#005c81 !important",
      color: "#424143 !important",
    },
    "&:focus": {
      borderColor: "#005c81 !important",
      background: "#ffffff !important",
      color: "#424143 !important",
      letterSpacing: "0.02em !important",
    },
  },
  innersrchbox: {
    position: "relative",
    width: "100%",
    paddingRight: "0px",
    display: "flex",
    justifyContent: "end",
  },
  searchresetcont: {
    position: "absolute",
    top: "4px",
    right: "5px",
  },
  topTableFilters: {
    gap: "72px",
    flexWrap: "wrap",
    "@media (max-width: 768px)": {
      gap: "10px",
    },
    button: {
      padding: "0 10px",
      "&:first-of-type": {
        paddingLeft: "0px",
      },
    },
  },
  table: {
    background: "#FFFFFF",
    boxShadow:
      "0px 9px 16px rgba(159, 162, 191, 0.18), 0px 2px 2px rgba(159, 162, 191, 0.32)",
    borderRadius: "10px",
  },
  tableHeading: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: 700,
    fontSize: "12px",
    color: "#fff",
    whiteSpace: "nowrap",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
  },
  tableHeadingBorder: {
    color: "#1A1A1A",
    background: "#003B52" + "!important",
    fontSize: "12px" + "!important",
    padding: "10px" + "!important",
    "&:first-of-type": {
      borderTopLeftRadius: "10px" + "!important",
      paddingLeft: "25px" + "!important",
      width: "200px" + "!important",
    },
    "&:nth-child(2)": {
      width: "220px",
    },
    "&:last-of-type": {
      borderTopRightRadius: "10px" + "!important",
    },
  },
  active: {
    color: theme.colors.orange[5] + "!important",
  },
  activeBtn: {
    fontWeight: "normal",
    "&>div": {
      color: "#ffffff !important",
      background: "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
      borderRadius: "5px",
      fontWeight: "normal",
    },
  },
  boxShadow: {
    boxShadow: "0 4px 6px rgb(0 0 0 / 10%)",
  },
  commonMargin: {
    margin: "10px 0",
  },
  tableParent: {
    overflowX: "auto",
  },
  statusTd: {
    display: "flex",
    gap: "10px",
  },
  actionTd: {
    display: "flex",
    gap: "10px",
  },
  filterBtn: {
    borderRight: "2px solif #cdcdcd",
    padding: "0 25px",
  },
  filterHoverBtn: {
    fontWeight: "normal",
    "&:hover": {
      color: "#ffffff !important",
      background: "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
      fontWeight: "normal",
    },
  },
  filterHover: {
    width: "max-content",
    "&:hover": {
      color: theme.colors.orange[5] + "!important",
    },
  },
  paginationItem: {
    borderRadius: "50%",
    border: "0",
    width: "32px",
    backgroundColor: "#F7F9FB",
    "&[data-active]": {
      backgroundColor: "#003b52",
      color: "#fff",
    },
    marginTop: 10,
    "&:hover": {
      backgroundColor: "#005C81",
      color: "#fff",
    },
  },
  trStyle: {
    height: 43,
    "&:hover": {
      backgroundColor: "#F1F3F6",
    },
  },
  trStyleNew: {
    //backgroundColor: "#FFF0F0",
  },
  tdStyle: {
    border: "0" + "!important",
    fontSize: "12px" + "!important",
    padding: "0 10px" + "!important",
    color: "#444444 !important",
    "&: div": {
      whitespace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "&:first-of-type > div": {
      paddingLeft: "10px" + "!important",
      width: "200px" + "!important",
    },
  },
  dropdown: {
    top: "40px" + "!important",
  },
  dropdownHoverCard: {
    top: "38px" + "!important",
    padding: "8px 10px !important",
    fontWeight: "normal",
  },
  InfoIconHover: {
    color: "#1C9689",
    // "&:hover": {
    //   color: "#1C9689",
    // },
  },
  iconHoverStyle: {
    color: "#fff",
    "&:hover": {
      backgroundColor: "transparent" + "!important",
    },
  },
}));

interface DocumentLogWithAISuggested {
  id: string;
  originalFileName: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  createdBy: string;
  deletedAt?: string;
  deletedBy?: string;
  aiSuggestedDocumentId?: string;
  version?: string; 
  AISuggestedDocuments?: {
    title: string;
    isOther: boolean;
  };
  CreatedByUser?: {
    name: string;
  };
  DeletedByUser?: {
    name: string;
  };
}

type DocumentLog = {
  id: string;
  cardName: string;
  fileName: string;
  version: string;
  fileSize: string;
  uploadedOn: string;
  uploadedBy: string;
  deletedOn: string;
  deletedBy: string;
  status: "Uploaded" | "Deleted" | "System Generated";
};

type THPropsType = {
  title: string;
  isSortable: boolean;
  field?: string;
  sortField?: string | null;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
  filterValue?: string;
  onFilter?: (column: string, value: string) => void;
  // Legacy props - keep for compatibility
  toggleSort?: (e: unknown) => void;
  statesfilter?: any;
  tableData?: any;
  filteredData?: any;
};

const TH: FC<THPropsType> = ({
  title,
  isSortable = false,
  field,
  sortField,
  sortDirection,
  onSort,
  filterValue = "",
  onFilter,
  toggleSort,
  statesfilter,
  tableData,
  filteredData,
}) => {
  const { classes } = useStyles();
  const [ascending, setAscending] = useState(false);
  const [opened, setOpened] = useState(false);
  const ref = useClickOutside(() => setOpened(false));

  // Generate unique values for autocomplete data based on the field
  const getFieldData = () => {
    if (!field) return [];

    // Use filteredData if available (for dynamic filtering), otherwise fall back to tableData
    const dataSource = filteredData || tableData;
    if (!dataSource) return [];

    const uniqueValues = Array.from(
      new Set(
        dataSource
          .map((item: any) => {
            const value = item[field];
            return value ? value.toString().trim() : "";
          })
          .filter((value: string) => value !== "")
      )
    ) as string[];
    uniqueValues.sort();

    return uniqueValues.map((value) => ({
      value: value,
      label: value,
    }));
  };

  const autocompleteData = getFieldData();

  const sortHandler = (e: any) => {
    if (!isSortable || !field || !onSort) return;
    onSort(field);
  };

  // Determine sort state for this column
  const isCurrentlySorted = sortField === field;
  const currentSortState = isCurrentlySorted
    ? sortDirection === "asc"
      ? "asc"
      : "desc"
    : false;

  return (
    <th className={classes.tableHeadingBorder}>
      <Group style={{ position: "relative", width: "max-content" }} spacing={0}>
        <UnstyledButton
          className={classes.tableHeading}
          onClick={(e: any) => {
            sortHandler(e);
            toggleSort?.(e);
          }}
        >
          {title}
          {isSortable && (
            <SortIcons sortState={currentSortState} color="#ffffff" size={16} />
          )}
        </UnstyledButton>
        {field !== "status" &&
          ["cardName", "fileName", "uploadedBy"].includes(field || "") && (
            <Box>
              <ActionIcon variant="transparent" onClick={() => setOpened(true)}>
                <IconFilter
                  className={classes.iconHoverStyle}
                  style={{ width: "18px" }}
                  color={filterValue ? "#FF9E1B" : "#fff"}
                />
              </ActionIcon>
              {opened && (
                <Paper
                  style={{
                    position: "absolute",
                    bottom: "-55px",
                    width: "300px",
                    padding: "8px",
                    left: "0",
                  }}
                  ref={ref}
                  shadow="sm"
                >
                  <Box className={`${classes.innersrchbox} searchBoxInner`}>
                    <Autocomplete
                      classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                      style={{
                        borderBottom: "0px",
                        width: "100%",
                        backgroundColor: "#F1F3F6",
                        borderRadius: "30px",
                        padding: "0px 10px",
                      }}
                      styles={(theme) => ({
                        input: {
                          backgroundColor: "#F1F3F6",
                          borderRadius: "30px",
                          padding: "0px 10px",
                          "&:focus": {
                            border: "none",
                            outline: "none",
                          },
                        },
                        item: {
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#666666",
                          "&[data-selected]": {
                            background:
                              "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                            color: "white",
                          },
                          "&:hover": {
                            background:
                              "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                            color: "white",
                          },
                        },
                      })}
                      radius={0}
                      variant="unstyled"
                      placeholder={`Search by ${title}`}
                      value={filterValue || ""}
                      onChange={(ev: any) => {
                        if (onFilter && field) {
                          onFilter(field, ev);
                        }
                      }}
                      onItemSubmit={(e: any) => {
                        if (onFilter && field) {
                          onFilter(field, e.value || "");
                        }
                      }}
                      data={autocompleteData}
                      limit={50}
                    />
                    <div
                      className={classes.searchresetcont}
                      onClick={() => {
                        if (onFilter && field) {
                          onFilter(field, "");
                        }
                        setOpened(false);
                      }}
                    >
                      <CloseButton
                        aria-label="Close modal"
                        variant="transparent"
                      />
                    </div>
                  </Box>
                </Paper>
              )}
            </Box>
          )}
      </Group>
    </th>
  );
};

const DocumentTable = ({
  tableHeaders,
  paginatedData,
  classes,
  sortField,
  sortDirection,
  onSort,
  columnFilters,
  onColumnFilter,
  processedData,
  getStatusBadge,
  handleDownload,
  fullData,
  filteredData,
  globalFilter,
}: {
  tableHeaders: any[];
  paginatedData: DocumentLog[];
  classes: any;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  columnFilters: Record<string, string>;
  onColumnFilter: (column: string, value: string) => void;
  processedData: DocumentLogWithAISuggested[];
  getStatusBadge: (status: string) => JSX.Element;
  handleDownload: (fileUrl: string, fileName: string) => void;
  fullData: DocumentLog[];
  filteredData: DocumentLog[];
  globalFilter: string;
}) => {
  return (
    <Table className={`${classes.table} defaultTabale`} verticalSpacing="md">
      <thead>
        <tr>
          {tableHeaders.map((header, index) => (
            <TH
              key={index}
              title={header.title}
              isSortable={true}
              sortField={sortField}
              sortDirection={sortDirection}
              field={header.field}
              onSort={onSort}
              filterValue={columnFilters[header.field] || ""}
              onFilter={onColumnFilter}
              tableData={fullData}
              filteredData={filteredData}
            />
          ))}
        </tr>
      </thead>
      <tbody>
        {paginatedData.length > 0 ? (
          paginatedData.map((item, index) => (
            <tr key={index} className={classes.trStyle}>
              <td className={classes.tdStyle}>
                <TextWithTooltip size={12} text={item.cardName}>
                  {item.cardName}
                </TextWithTooltip>
              </td>
              <td className={classes.tdStyle}>
                {(() => {
                  const originalItem = processedData.find(
                    (original) => original.id === item.id
                  );
                  return originalItem && originalItem.fileUrl ? (
                    <AnchorWithTooltip
                      href={originalItem.fileUrl}
                      target="_blank"
                      c="#444444"
                      underline={false}
                      text={item.fileName}
                      onClick={() =>
                        handleDownload(
                          originalItem.fileUrl,
                          originalItem.originalFileName || originalItem.fileName
                        )
                      }
                    >
                      {item.fileName}
                    </AnchorWithTooltip>
                  ) : (
                    <TextWithTooltip size={12} text={item.fileName}>
                      {item.fileName}
                    </TextWithTooltip>
                  );
                })()}
              </td>
              <td className={classes.tdStyle}>{item.version}</td>
              <td className={classes.tdStyle}>{item.fileSize}</td>
              <td className={classes.tdStyle}>{item.uploadedOn}</td>
              <td className={classes.tdStyle}>
                <TextWithTooltip size={12} text={item.uploadedBy}>
                  {item.uploadedBy}
                </TextWithTooltip>
              </td>
              <td className={classes.tdStyle}>{item.deletedOn}</td>
              <td className={classes.tdStyle}>
                <TextWithTooltip size={12} text={item.deletedBy}>
                  {item.deletedBy}
                </TextWithTooltip>
              </td>
              <td className={classes.tdStyle}>
                {/* Use the computed status from item instead of original status */}
                {getStatusBadge(item.status)}
              </td>
            </tr>
          ))
        ) : (
          <tr className={classes.trStyle}>
            <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
              <Text color="dimmed">
                {globalFilter ||
                Object.values(columnFilters).some((filter) => filter !== "")
                  ? "No documents matching your search."
                  : "No documents available"}
              </Text>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

const StatesHeader = ({
  activeTab,
  setActiveTab,
  documentLogData,
  globalFilter,
  setGlobalFilter,
  columnFilters,
  setColumnFilters,
}: {
  activeTab: string;
  setActiveTab: (
    tab: "All" | "Uploaded" | "Deleted" | "System Generated"
  ) => void;
  documentLogData: DocumentLog[];
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  columnFilters: Record<string, string>;
  setColumnFilters: (filters: Record<string, string>) => void;
}) => {
  const { classes } = useStyles();
  const [isShowClearAll, setShowClearAll] = useState(false);
  const [isfocused, setisfocused] = useState(false);

  const allCount = documentLogData.length;
  const uploadedCount = documentLogData.filter(
    (item) => item.status === "Uploaded"
  ).length;
  const deletedCount = documentLogData.filter(
    (item) => item.status === "Deleted"
  ).length;
  const systemGeneratedCount = documentLogData.filter(
    (item) => item.status === "System Generated"
  ).length;

  const statuses = ["All", "Uploaded", "Deleted", "System Generated"];

  const changeTab = (
    element: "All" | "Uploaded" | "Deleted" | "System Generated"
  ) => {
    setActiveTab(element);
  };

  const clearAllData = () => {
    setActiveTab("All");
    setGlobalFilter("");
    setColumnFilters({});
    setShowClearAll(false);
  };

  useEffect(() => {
    const hasColumnFilters = Object.values(columnFilters).some(
      (filter) => filter !== ""
    );
    if (globalFilter !== "" || hasColumnFilters) {
      setShowClearAll(true);
    } else {
      setShowClearAll(false);
    }
  }, [globalFilter, columnFilters]);

  return (
    <>
      <Flex
        align="center"
        justify="space-between"
        gap={20}
        wrap="wrap"
        sx={(theme) => ({
          "@media (max-width: 768px)": {
            flexDirection: "column",
            alignItems: "stretch",
            gap: 10,
          },
        })}
      >
        <Flex
          gap={24}
          mt={0}
          className={[classes.topTableFilters, classes.commonMargin].join(" ")}
          align="center"
          sx={{
            flex: "0 0 auto",
            "@media (max-width: 768px)": {
              justifyContent: "center",
            },
          }}
        >
          {statuses.map((element, index: number) => (
            <UnstyledButton
              key={index}
              onClick={() =>
                changeTab(
                  element as "All" | "Uploaded" | "Deleted" | "System Generated"
                )
              }
              pl={0}
              pr={12}
            >
              <Text
                size={14}
                color={"#444"}
                weight={600}
                className={
                  activeTab === element ? classes.active : classes.filterHover
                }
              >
                {element} (
                {element === "All"
                  ? allCount
                  : element === "Uploaded"
                  ? uploadedCount
                  : element === "Deleted"
                  ? deletedCount
                  : systemGeneratedCount}
                )
              </Text>
            </UnstyledButton>
          ))}
        </Flex>
        <Box className={classes.textFieldFilter}>
          <Box
            className={classes.innersrchbox}
            style={{ display: "flex", alignItems: "center", gap: "20px" }}
          >
            {isShowClearAll === true ? (
              <UnstyledButton
                style={{
                  color: "#666666",
                  padding: "3px 0px",
                  marginBottom: "15px",
                }}
                ml={10}
                onClick={clearAllData}
              >
                <Text
                  size={16}
                  className={classes.filterHover}
                  color={"#444"}
                  weight={500}
                >
                  Clear All
                </Text>
              </UnstyledButton>
            ) : (
              <></>
            )}
            <Autocomplete
              sx={{
                width: "100%",
                backgroundColor: "#F1F3F6",
                borderRadius: "30px",
                border: "1px solid #F1F3F6",
                padding: "0px",
                marginBottom: "18px",
                paddingRight: 22,
                paddingLeft: 10,
                color: "#424143",
              }}
              icon={<SearchIcon color={isfocused ? "#005C81" : "#666666"} />}
              radius={0}
              variant="unstyled"
              placeholder="Search..."
              value={globalFilter}
              onChange={(ev: any) => {
                setGlobalFilter(ev);
              }}
              classNames={{
                input: "searchInput",
                root: `${
                  isfocused
                    ? "SearchInputBoxFocus"
                    : "mantine-Autocomplete-root SearchInputBox"
                } `,
              }}
              className={`${classes.searchInputWrapper}`}
              onItemSubmit={(e: any) => {
                setGlobalFilter(e.value);
              }}
              onFocus={() => setisfocused(true)}
              onBlur={() => setisfocused(false)}
              data={[]}
            />
            {globalFilter !== "" && globalFilter !== undefined ? (
              <div
                className={classes.searchresetcont}
                onClick={() => {
                  setGlobalFilter("");
                }}
              >
                <CloseButton
                  aria-label="Close modal"
                  variant="transparent"
                  className={
                    isfocused ? "SearchInputCloseFocus" : "SearchInputClose"
                  }
                  color="#005C81"
                />
              </div>
            ) : (
              ""
            )}
          </Box>
        </Box>
      </Flex>
    </>
  );
};

const DocumentLogsTable: FC = ({}) => {
  const { classes } = useStyles();
  const { query } = useRouter();
  const { accessToken } = query;
  const userContext = getUserContext(accessToken as string);
  const [activeTab, setActiveTab] = useState<
    "All" | "Uploaded" | "Deleted" | "System Generated"
  >("All");
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter state for each column
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [globalFilter, setGlobalFilter] = useState("");

  // Add iframe outside click handling
  useEffect(() => {
    // Listen for messages from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === "object") {
        // Handle parent clicks to close popovers
        if (event.data.type === "PARENT_CLICK_OUTSIDE") {
          // Trigger multiple event types on different elements to close any open popovers
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

    // Set up click listener on parent window (if accessible)
    const setupParentClickListener = () => {
      try {
        if (window.parent && window.parent !== window) {
          // Request parent to setup click listener
          window.parent.postMessage(
            {
              type: "SETUP_CLICK_LISTENER",
              source: "document-logs-table",
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

    // Setup parent click listener
    setupParentClickListener();

    // Clean up
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
  useEffect(() => {
    // Reset to first page whenever tab, search, or filters change
    setActivePage(1);
  }, [activeTab, globalFilter, columnFilters]);

  // Fetch document logs with AI suggested documents
  const { data, loading, error } =
    useGetDocumentLogsWithAiSuggestedDocumentsQuery({
      variables: {
        where: {
          companyId: { _eq: userContext?.companyId },
        },
      },
    });

  // Get document logs directly from database (version already included)
  const processedData = useMemo(() => {
    if (!data?.DocumentLogs) return [];

    const rawLogs = data.DocumentLogs as DocumentLogWithAISuggested[];
    // Create a mutable copy and sort by creation date (newest first)
    return [...rawLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data?.DocumentLogs]);

  // Helper function to format file size - always show in MB for this page
  const formatFileSize = (sizeInBytes: string) => {
    const size = parseInt(sizeInBytes);
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      [DocumentLogsStatus.Uploaded]: { color: "#FFB961", label: "Uploaded" },
      [DocumentLogsStatus.Deleted]: { color: "#FF8080", label: "Deleted" },
      [DocumentLogsStatus.SystemGenerated]: {
        color: "#6AD7E9",
        label: "System Generated",
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "#444444",
      label: status,
    };
    return (
      <Badge
        bg={config.color}
        c="#444444"
        variant="filled"
        p="3px 8px"
        fz={12}
        tt="capitalize"
        fw={400}
        h={22}
      >
        {config.label}
      </Badge>
    );
  };

  // Helper function to handle file download
  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to handle document delete
  const handleDelete = (documentId: string) => {
    // Implement delete functionality
    console.log("Delete document:", documentId);
    // You can add mutation here for actual delete functionality
  };

  // Transform processed data to match existing table structure
  const documentLogData: DocumentLog[] = useMemo(() => {
    return processedData
      .filter(
        (item) =>
          item.status === DocumentLogsStatus.Uploaded ||
          item.status === DocumentLogsStatus.Processed ||
          item.status === DocumentLogsStatus.Deleted
      )
      .map((item) => ({
        id: item.id,
        cardName: item.AISuggestedDocuments?.title || "Unknown Document",
        fileName: item.originalFileName || item.fileName,
        version: item.version || "-",
        fileSize: item.fileSize ? formatFileSize(item.fileSize) : "0 B",
        uploadedOn: formatDateAndTime(item.createdAt),
        uploadedBy: item.CreatedByUser?.name || "-",
        deletedOn: item.deletedAt ? formatDateAndTime(item.deletedAt) : "-",
        deletedBy: item.DeletedByUser?.name || "-",
        status:
          item.status === DocumentLogsStatus.Deleted
            ? ("Deleted" as const)
            : !item.createdBy
            ? ("System Generated" as const) // Show "System Generated" only if not deleted and no creator
            : ("Uploaded" as const),
      }));
  }, [processedData, formatFileSize]);

  // Filter, search and sort data
  const filteredData = useMemo(() => {
    let filtered = documentLogData;

    // Filter by active tab
    if (activeTab === "Uploaded") {
      filtered = filtered.filter((item) => item.status === "Uploaded");
    } else if (activeTab === "Deleted") {
      filtered = filtered.filter((item) => item.status === "Deleted");
    } else if (activeTab === "System Generated") {
      filtered = filtered.filter((item) => item.status === "System Generated");
    }

    // Only search in these fields:
    const SEARCHABLE_FIELDS = [
      "cardName",
      "fileName",
      "version",
      "fileSize",
      "uploadedBy",
      "deletedBy",
    ];

    if (globalFilter) {
      const search = globalFilter.trim().toLowerCase();
      filtered = filtered.filter((item) =>
        SEARCHABLE_FIELDS.some((field) => {
          const value = item[field as keyof DocumentLog] as
            | string
            | number
            | undefined;
          if (typeof value === "string") {
            return value.toLowerCase().includes(search);
          }
          if (typeof value === "number") {
            return value.toString().includes(search);
          }
          return false;
        })
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter((item) => {
          const itemValue = item[column as keyof DocumentLog];
          return itemValue
            .toString()
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: string | number = a[sortField as keyof DocumentLog];
        let bValue: string | number = b[sortField as keyof DocumentLog];

        // Special handling for fileSize column
        if (sortField === "fileSize") {
          const parseSize = (val: string) => {
            const num = parseFloat(val);
            return isNaN(num) ? 0 : num;
          };
          aValue = parseSize(aValue as string);
          bValue = parseSize(bValue as string);
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    activeTab,
    documentLogData,
    globalFilter,
    columnFilters,
    sortField,
    sortDirection,
  ]);

  // Handler functions for sorting and filtering
  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        // Third click: reset sorting
        setSortField(null);
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Show loading spinner - moved after all hooks
  if (loading) return <Spinner visible={true} />;
  if (error) return <Text color="red">Error loading document logs</Text>;

  // Table headers with field mappings for sorting
  const tableHeaders = [
    { id: "cardName", title: "Card Name", field: "cardName" },
    { id: "fileName", title: "File Name", field: "fileName" },
    { id: "version", title: "Version", field: "version" },
    { id: "fileSize", title: "File Size", field: "fileSize" },
    { id: "uploadedOn", title: "Uploaded On", field: "uploadedOn" },
    { id: "uploadedBy", title: "Uploaded By", field: "uploadedBy" },
    { id: "deletedOn", title: "Deleted On", field: "deletedOn" },
    { id: "deletedBy", title: "Deleted By", field: "deletedBy" },
    { id: "status", title: "Status", field: "status" },
  ];

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Box>
      <StatesHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentLogData={documentLogData}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
      <DocumentTable
        tableHeaders={tableHeaders}
        paginatedData={paginatedData}
        classes={classes}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        columnFilters={columnFilters}
        onColumnFilter={handleColumnFilter}
        processedData={processedData}
        getStatusBadge={getStatusBadge}
        handleDownload={handleDownload}
        fullData={documentLogData}
        filteredData={filteredData}
        globalFilter={globalFilter}
      />
      <PaginationFooter
        activePage={activePage}
        setActivePage={setActivePage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        filteredDataLength={filteredData.length}
        itemsPerPageOptions={[5, 10, 15, 20]}
        paginationStyles={{ item: classes.paginationItem }}
      />
    </Box>
  );
};

export default DocumentLogsTable;
