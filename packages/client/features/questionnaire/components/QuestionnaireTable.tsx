import {
  ActionIcon,
  Alert,
  Autocomplete,
  Box,
  Center,
  CloseButton,
  createStyles,
  Flex,
  Group,
  Loader,
  Paper,
  Table,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { IconAlertCircle, IconFilter, IconUserPlus } from "@tabler/icons-react";
import React, { useEffect, useMemo, useState } from "react";
import SortIcons from "../../../components/SortIcons";
import { TextWithTooltip } from "../../../components/TooltipUtils";
import DownloadIcon from "../../../icons/DownloadIcon";
import EyeIcon from "../../../icons/EyeIcon";
import UploadIcon from "../../../icons/UploadIcon";
import { invitationFormStartMessage } from "../../../services/platform-window-message.service";
import { postParentMessage } from "../../form/common-functions";
import { useQuestionnaireModalContext } from "../context/QuestionnaireModalProvider";
import { useQuestionnaireFilters, useQuestionnaireList } from "../hooks";
import type { QuestionnaireListItem } from "../types/questionnaire.types";

type THPropsType = {
  title: string;
  isSortable: boolean;
  field?: string;
  sortField?: string | null;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
  filterValue?: string;
  onFilter?: (column: string, value: string) => void;
  tableData?: any;
  filteredData?: any;
};

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
      width: "280px" + "!important",
    },
    "&:nth-child(2)": {
      width: "280px",
    },
    "&:nth-child(3)": {
      width: "140px",
    },
    "&:last-of-type": {
      width: "180px",
      borderTopRightRadius: "10px" + "!important",
    },
  },
  active: {
    color: theme.colors.orange[5] + "!important",
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
      width: "300px" + "!important",
    },
  },
  tableParent: {
    overflowX: "auto",
  },
  actionTd: {
    display: "flex",
    gap: "10px",
  },
  iconHoverStyle: {
    color: "#fff",
    "&:hover": {
      backgroundColor: "transparent" + "!important",
    },
  },
  commonMargin: {
    margin: "10px 0",
  },

  // Table row and cell styles
  tableRow: {
    "&:hover": {
      backgroundColor: "#F7F9FB",
    },
  },
  tableCell: {
    padding: "12px 16px",
    borderBottom: "1px solid #E5E7E9",
    verticalAlign: "top",
    fontSize: "14px",
  },

  primaryText: {
    color: "#003B52",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: 1.4,
  },

  secondaryText: {
    color: "#7F8B95",
    fontSize: "12px",
    lineHeight: 1.3,
    marginTop: "4px",
  },

  actionGroup: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },

  // Header styles for TH component
  tableHeader: {
    padding: "16px",
    backgroundColor: "#F7F9FB",
    borderBottom: "2px solid #E5E7E9",
    position: "relative" as const,
  },

  headerButton: {
    padding: 0,
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "transparent",
    },
  },

  headerText: {
    color: "#003B52",
    fontSize: "14px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },

  filterButton: {
    padding: "4px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#E5E7E9",
    },
  },

  filterDropdown: {
    position: "absolute" as const,
    top: "100%",
    right: 0,
    zIndex: 1000,
    minWidth: "200px",
    padding: "12px",
    backgroundColor: "#FFFFFF",
  },

  filterApplyButton: {
    padding: "4px 8px",
    backgroundColor: "#005C81",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    "&:hover": {
      backgroundColor: "#003B52",
    },
  },

  filterClearButton: {
    padding: "4px 8px",
    backgroundColor: "transparent",
    color: "#7F8B95",
    border: "1px solid #E5E7E9",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    "&:hover": {
      backgroundColor: "#F7F9FB",
    },
  },

  // States header styles
  statesHeader: {
    padding: "16px 24px",
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #E5E7E9",
  },

  statesHeaderTitle: {
    color: "#003B52",
    fontSize: "18px",
    fontWeight: 600,
  },

  searchContainer: {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#F7F9FB",
    borderRadius: "6px",
    border: "1px solid #E5E7E9",
  },

  // Main table container styles
  tableContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    border: "1px solid #E5E7E9",
    overflow: "hidden",
  },

  tableWrapper: {
    overflow: "auto",
  },

  tableHead: {
    backgroundColor: "#F7F9FB",
  },

  tableBody: {
    "& tr:last-child td": {
      borderBottom: "none",
    },
  },
}));

const TH: React.FC<THPropsType> = ({
  title,
  isSortable,
  field,
  sortField,
  sortDirection,
  onSort,
  filterValue,
  onFilter,
  tableData,
  filteredData,
}) => {
  const { classes } = useStyles();
  const [filterOpened, setFilterOpened] = useState(false);
  const [filterValue_copy, setFilterValue_copy] = useState(filterValue || "");
  const ref = useClickOutside(() => setFilterOpened(false));

  const hasFilter = isSortable && field && onFilter;

  const uniqueValues = useMemo(() => {
    if (!hasFilter || !filteredData) return [];
    return Array.from(
      new Set(
        filteredData
          .map((item: any) => {
            const value = field.includes(".")
              ? field.split(".").reduce((obj, key) => obj?.[key], item)
              : item[field];
            return value?.toString() || "";
          })
          .filter(Boolean)
      )
    ).sort() as string[];
  }, [filteredData, field, hasFilter]);

  const handleSort = () => {
    if (isSortable && field && onSort) {
      onSort(field);
    }
  };

  const handleFilter = (value: string) => {
    if (hasFilter) {
      onFilter(field, value);
      setFilterValue_copy(value);
      setFilterOpened(false);
    }
  };

  const clearFilter = () => {
    if (hasFilter) {
      onFilter(field, "");
      setFilterValue_copy("");
      setFilterOpened(false);
    }
  };

  useEffect(() => {
    setFilterValue_copy(filterValue || "");
  }, [filterValue]);

  return (
    <th className={classes.tableHeadingBorder}>
      <Group style={{ position: "relative", width: "max-content" }} spacing={0}>
        <UnstyledButton onClick={handleSort} className={classes.tableHeading}>
          {title}
          {isSortable && (
            <SortIcons
              sortState={sortField === field ? sortDirection || false : false}
              color="#ffffff"
              size={16}
            />
          )}
        </UnstyledButton>

        {hasFilter && (
          <div style={{ position: "relative" }} ref={ref}>
            <UnstyledButton
              onClick={() => setFilterOpened(!filterOpened)}
              className={classes.filterButton}
            >
              <IconFilter size={14} color="#7F8B95" />
            </UnstyledButton>

            {filterOpened && (
              <Paper className={classes.filterDropdown} shadow="md" withBorder>
                <Flex direction="column" gap={8}>
                  <Flex justify="space-between" align="center">
                    <Text size="sm" weight={500}>
                      Filter by {title}
                    </Text>
                    <CloseButton
                      size="sm"
                      onClick={() => setFilterOpened(false)}
                    />
                  </Flex>

                  <Autocomplete
                    placeholder={`Search ${title.toLowerCase()}...`}
                    data={uniqueValues}
                    value={filterValue_copy}
                    onChange={setFilterValue_copy}
                    onItemSubmit={(item) =>
                      handleFilter(typeof item === "string" ? item : item.value)
                    }
                    size="xs"
                    styles={{
                      input: {
                        fontSize: "12px",
                        padding: "6px 8px",
                      },
                    }}
                  />

                  <Flex gap={4}>
                    <UnstyledButton
                      onClick={() => handleFilter(filterValue_copy)}
                      className={classes.filterApplyButton}
                    >
                      <Text size="xs">Apply</Text>
                    </UnstyledButton>
                    <UnstyledButton
                      onClick={clearFilter}
                      className={classes.filterClearButton}
                    >
                      <Text size="xs">Clear</Text>
                    </UnstyledButton>
                  </Flex>
                </Flex>
              </Paper>
            )}
          </div>
        )}
      </Group>
    </th>
  );
};

interface QuestionnaireRowProps {
  questionnaire: QuestionnaireListItem;
  onUpload: (questionnaire: QuestionnaireListItem) => void;
  onDownload: (questionnaire: QuestionnaireListItem) => void;
  onAssign: (questionnaire: QuestionnaireListItem) => void;
}

const QuestionnaireRow: React.FC<QuestionnaireRowProps> = ({
  questionnaire,
  onUpload,
  onDownload,
  onAssign,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const { classes } = useStyles();

  return (
    <tr className={classes.trStyle}>
      <td className={classes.tdStyle}>
        <TextWithTooltip text={questionnaire.title}>
          {questionnaire.title}
        </TextWithTooltip>
      </td>
      <td className={classes.tdStyle}>
        <Text>{questionnaire.formtype}</Text>
      </td>
      <td className={classes.tdStyle}>
        <Text>{formatDate(questionnaire.created_at)}</Text>
      </td>
      <td className={classes.tdStyle}>
        <TextWithTooltip text={questionnaire.companyNames || "Unassigned"}>
          <Text tt="capitalize">
            {questionnaire.companyNames || "Unassigned"}
          </Text>
        </TextWithTooltip>
      </td>
      <td className={classes.tdStyle}>
        <Group spacing="xs" className={classes.actionGroup}>
          <Tooltip position="bottom" label="Upload Excel File">
            <ActionIcon
              variant="transparent"
              onClick={() => onUpload(questionnaire)}
            >
              <UploadIcon color="#003b52" />
            </ActionIcon>
          </Tooltip>
          <Tooltip position="bottom" label="Download Template">
            <ActionIcon
              variant="transparent"
              onClick={() => onDownload(questionnaire)}
            >
              <DownloadIcon color="#003b52" />
            </ActionIcon>
          </Tooltip>
          <Tooltip position="bottom" label="Assign (UI Only)">
            <ActionIcon
              variant="transparent"
              onClick={() => onAssign(questionnaire)}
            >
              <IconUserPlus color="#003b52" size={24} />
            </ActionIcon>
          </Tooltip>
          <Tooltip position="bottom" label="Preview">
            <ActionIcon
              onClick={() => {
                console.log(questionnaire);
                console.log("Preview clicked");
                debugger;
                postParentMessage(
                  invitationFormStartMessage(
                    false,
                    0,
                    questionnaire.FormInvitationId?.[0].id || "",
                    questionnaire.title,
                    false,
                    false,
                    false,
                    "",
                    "",
                    "",
                    "",
                    questionnaire.formtype
                  )
                );
              }}
            >
              <EyeIcon />
            </ActionIcon>
          </Tooltip>
        </Group>
      </td>
    </tr>
  );
};

const EmptyState: React.FC = () => (
  <Center py="xl">
    <Box ta="center">
      <Text size="lg" c="dimmed" mb="sm">
        No questionnaires found
      </Text>
      <Text size="sm" c="dimmed">
        Try adjusting your filters or check back later
      </Text>
    </Box>
  </Center>
);

const LoadingState: React.FC = () => (
  <Center py="xl">
    <Loader size="md" />
  </Center>
);

const ErrorState: React.FC<{ error: Error; onRetry: () => void }> = ({
  error,
  onRetry,
}) => (
  <Alert
    icon={<IconAlertCircle size="1rem" />}
    title="Error loading questionnaires"
    color="red"
    variant="light"
    my="md"
  >
    <Text size="sm" mb="sm">
      {error.message}
    </Text>
    <Text
      size="sm"
      c="blue"
      style={{ cursor: "pointer", textDecoration: "underline" }}
      onClick={onRetry}
    >
      Try again
    </Text>
  </Alert>
);

export const QuestionnaireTable: React.FC = () => {
  const { classes } = useStyles();
  const { filters, setSorting } = useQuestionnaireFilters();
  const { questionnaires, totalCount, loading, error, refetch } =
    useQuestionnaireList(filters);
  const { openUploadModal, openDownloadModal, openAssignModal } =
    useQuestionnaireModalContext();

  // Optimized sorting handler with three-click behavior (asc -> desc -> reset)
  const handleSort = (field: string) => {
    if (filters.sortBy === field) {
      if (filters.sortDirection === "asc") {
        setSorting({ column: field, direction: "desc" });
      } else if (filters.sortDirection === "desc") {
        setSorting({ column: "", direction: "asc" }); // Reset sorting
      }
    } else {
      setSorting({ column: field, direction: "asc" });
    }
  };

  if (loading && questionnaires.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!loading && questionnaires.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={classes.tableContainer}>
      <Table className={`${classes.table} defaultTabale`} verticalSpacing="md">
        <thead className={classes.tableHead}>
          <tr>
            <TH
              title="Questionnaire Name"
              isSortable={true}
              field="title"
              sortField={filters.sortBy}
              sortDirection={filters.sortDirection}
              onSort={handleSort}
            />
            <TH
              title="Reporting Framework/Assessment"
              isSortable={true}
              field="formtype"
              sortField={filters.sortBy}
              sortDirection={filters.sortDirection}
              onSort={handleSort}
            />
            <TH title="Created On" isSortable={false} field="createdAt" />
            <TH
              title="Assigned To"
              isSortable={true}
              field="companyNames"
              sortField={filters.sortBy}
              sortDirection={filters.sortDirection}
              onSort={handleSort}
            />
            <TH title="Actions" isSortable={false} />
          </tr>
        </thead>
        <tbody className={classes.tableBody}>
          {questionnaires.map((questionnaire: QuestionnaireListItem) => (
            <QuestionnaireRow
              key={questionnaire.id}
              questionnaire={questionnaire}
              onUpload={openUploadModal}
              onDownload={openDownloadModal}
              onAssign={openAssignModal}
            />
          ))}
        </tbody>
      </Table>

      {loading && questionnaires.length > 0 && (
        <Center py="sm">
          <Loader size="sm" />
        </Center>
      )}
    </div>
  );
};
