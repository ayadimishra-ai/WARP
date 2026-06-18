"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendar,
  IconFilter,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useGetQuestionnaireLogsQuery } from "@/modules/warp/packages/graphql/queries/generated/get-questionnaire-logs";
import { useRouter } from "@/modules/warp/packages/client/compat/next-router-shim";
import React, { useEffect, useState } from "react";
import SortIcons from "@/modules/warp/packages/client/components/SortIcons";
import { TextWithTooltip } from "@/modules/warp/packages/client/components/TooltipUtils";
import type {
  QuestionnaireLog,
  QuestionnaireLogsFilters,
} from "./types/questionnaire-logs.types";
import { DateRangePicker } from "@/modules/warp/packages/client/compat/mantine-v8-compat";

// Reuse the same styles from QuestionnaireListingPage
const useStyles = createStyles((theme) => ({
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
    },
    "&:last-of-type": {
      borderTopRightRadius: "10px" + "!important",
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
    "& div": {
      whitespace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  tableContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    border: "1px solid #E5E7E9",
    overflow: "hidden",
  },
  tableHead: {
    backgroundColor: "#F7F9FB",
  },
  tableBody: {
    "& tr:last-of-type td": {
      borderBottom: "none",
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
  filterSection: {
    padding: "16px",
    backgroundColor: "#F7F9FB",
    borderRadius: "8px",
    marginBottom: "16px",
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
}));

// Real data hook using GraphQL query
const useQuestionnaireLogsData = (filters: QuestionnaireLogsFilters) => {
  // Build where clause for filtering
  const buildWhereClause = () => {
    const conditions: any = {};

    if (filters.event_type) {
      conditions.event_type = { _eq: filters.event_type };
    }

    if (filters.searchTerm) {
      conditions._or = [
        { form_title: { _ilike: `%${filters.searchTerm}%` } },
        { form_description: { _ilike: `%${filters.searchTerm}%` } },
      ];
    }

    if (filters.dateFrom) {
      conditions.created_at = {
        ...conditions.created_at,
        _gte: filters.dateFrom.toISOString(),
      };
    }

    if (filters.dateTo) {
      conditions.created_at = {
        ...conditions.created_at,
        _lte: filters.dateTo.toISOString(),
      };
    }

    return conditions;
  };

  // Build order by clause for sorting
  const buildOrderBy = () => {
    if (!filters.sortBy) {
      return [{ created_at: "desc" }];
    }

    return [
      {
        [filters.sortBy]: filters.sortDirection === "desc" ? "desc" : "asc",
      },
    ];
  };

  const { data, loading, error, refetch } = useGetQuestionnaireLogsQuery({
    variables: {
      formid: filters.formid,
      limit: filters.limit,
      offset: filters.offset,
      where: buildWhereClause(),
      orderBy: buildOrderBy() as any,
    },
    skip: !filters.formid,
    fetchPolicy: "cache-and-network",
  });

  return {
    logs: data?.newformslogs || [],
    totalCount: data?.newformslogs_aggregate?.aggregate?.count || 0,
    loading,
    error,
    refetch,
  };
};

interface LogRowProps {
  log: QuestionnaireLog;
  index: number;
}

const LogRow: React.FC<LogRowProps> = ({ log, index }) => {
  const { classes } = useStyles();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserName = () => {
    if (log.User) {
      return log.User.name || log.User.email || "Unknown User";
    }
    return "Unknown User";
  };

  const eventType = log.event_type || "N/A";

  return (
    <tr className={classes.trStyle}>
      <td className={classes.tdStyle}>
        <Badge
          color={eventType === "insert" ? "green" : "blue"}
          variant="filled"
          size="sm"
        >
          {eventType.toUpperCase()}
        </Badge>
      </td>
      <td className={classes.tdStyle}>
        <TextWithTooltip text={log.form_title || "N/A"}>
          {log.form_title || "N/A"}
        </TextWithTooltip>
      </td>
      <td className={classes.tdStyle}>
        <Text>{log.number_of_questions || "N/A"}</Text>
      </td>
      <td className={classes.tdStyle}>
        <Text>{log.time_in_minutes || "N/A"}</Text>
      </td>
      <td className={classes.tdStyle}>
        <Text>{log.form_type || "N/A"}</Text>
      </td>
      <td className={classes.tdStyle}>
        <TextWithTooltip text={getUserName()}>
          <Text>{getUserName()}</Text>
        </TextWithTooltip>
      </td>
      <td className={classes.tdStyle}>
        <Text>{log.created_at ? formatDate(log.created_at) : "N/A"}</Text>
      </td>
    </tr>
  );
};

const EmptyState: React.FC = () => (
  <Center py="xl">
    <Box ta="center">
      <Text size="lg" c="dimmed" mb="sm">
        No logs found
      </Text>
      <Text size="sm" c="dimmed">
        No activity has been recorded for this questionnaire yet
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
    title="Error loading logs"
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

export const QuestionnaireLogsPage: React.FC = () => {
  const router = useRouter();
  const { formid } = router.query;
  const { classes } = useStyles();

  // Filters state
  const [filters, setFilters] = useState<QuestionnaireLogsFilters>({
    formid: (formid as string) || "",
    event_type: "",
    searchTerm: "",
    limit: 10,
    offset: 0,
    sortBy: "created_at",
    sortDirection: "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  // Update formid when router query changes
  useEffect(() => {
    if (formid) {
      setFilters((prev) => ({ ...prev, formid: formid as string }));
    }
  }, [formid]);

  // Fetch logs data
  const { logs, totalCount, loading, error, refetch } =
    useQuestionnaireLogsData(filters);

  const handleSort = (field: string) => {
    setFilters((prev) => {
      if (prev.sortBy === field) {
        if (prev.sortDirection === "asc") {
          return { ...prev, sortBy: field, sortDirection: "desc" };
        } else if (prev.sortDirection === "desc") {
          return { ...prev, sortBy: "", sortDirection: "asc" };
        }
      }
      return { ...prev, sortBy: field, sortDirection: "asc" };
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
  };

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      dateFrom: dateRange[0] || undefined,
      dateTo: dateRange[1] || undefined,
      offset: 0,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      formid: (formid as string) || "",
      event_type: "",
      searchTerm: "",
      limit: 10,
      offset: 0,
      sortBy: "created_at",
      sortDirection: "desc",
    });
    setDateRange([null, null]);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / filters.limit);
  const activeFilterCount = [
    filters.event_type,
    filters.searchTerm,
    filters.dateFrom || filters.dateTo ? "date" : null,
  ].filter(Boolean).length;

  if (!formid) {
    return (
      <Container fluid>
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Invalid Request"
          color="red"
        >
          No questionnaire ID provided
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid style={{ minHeight: "91vh" }}>
      <Stack gap="lg">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={() => router.push("/warp/questionnaires")}
              size="lg"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>Questionnaire Activity Logs</Title>
          </Group>
        </Flex>

        {/* Filters Section */}
        <Paper className={classes.filterSection}>
          <Stack gap="md">
            <Flex justify="space-between" align="center">
              <Text fw={600} size="sm">
                Filters{" "}
                {activeFilterCount > 0 && `(${activeFilterCount} active)`}
              </Text>
              {activeFilterCount > 0 && (
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconX size={14} />}
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
              )}
            </Flex>

            <Group grow>
              <TextInput
                placeholder="Search by title..."
                leftSection={<IconSearch size={16} />}
                styles={{ input: { paddingLeft: "36px !important" } }}
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                    offset: 0,
                  }))
                }
              />

              <Select
                placeholder="Event Type"
                leftSection={<IconFilter size={16} />}
                styles={{ input: { paddingLeft: "36px !important" } }}
                data={[
                  { value: "", label: "All Events" },
                  { value: "insert", label: "Insert" },
                  { value: "update", label: "Update" },
                ]}
                value={filters.event_type}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    event_type: value as any,
                    offset: 0,
                  }))
                }
                clearable
              />

              <DateRangePicker
                placeholder="Filter by date range"
                leftSection={<IconCalendar size={16} />}
                styles={{ input: { paddingLeft: "36px !important" } }}
                value={dateRange}
                onChange={setDateRange}
                clearable
              />

              <Button
                leftSection={<IconFilter size={16} />}
                onClick={handleApplyFilters}
                color="solidBtn"
              >
                Apply Filters
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Table */}
        {loading && logs.length === 0 ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : logs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={classes.tableContainer}>
            <Table className={classes.table} verticalSpacing="md">
              <thead className={classes.tableHead}>
                <tr>
                  <th className={classes.tableHeadingBorder}>
                    <Group className={classes.tableHeading} gap={0}>
                      Event Type
                    </Group>
                  </th>
                  <th className={classes.tableHeadingBorder}>
                    <Group
                      style={{ position: "relative", width: "max-content" }}
                      gap={0}
                    >
                      <UnstyledButton
                        onClick={() => handleSort("form_title")}
                        className={classes.tableHeading}
                      >
                        Form Title
                        <SortIcons
                          sortState={
                            filters.sortBy === "form_title"
                              ? filters.sortDirection || false
                              : false
                          }
                          color="#ffffff"
                          size={16}
                        />
                      </UnstyledButton>
                    </Group>
                  </th>
                  <th className={classes.tableHeadingBorder}>
                    <Group className={classes.tableHeading} gap={0}>
                      Questions
                    </Group>
                  </th>
                  <th className={classes.tableHeadingBorder}>
                    <Group className={classes.tableHeading} gap={0}>
                      Time (min)
                    </Group>
                  </th>
                  <th className={classes.tableHeadingBorder}>
                    <Group className={classes.tableHeading} gap={0}>
                      Form Type
                    </Group>
                  </th>
                  <th className={classes.tableHeadingBorder}>
                    <Group className={classes.tableHeading} gap={0}>
                      Modified By
                    </Group>
                  </th>
                  <th className={classes.tableHeadingBorder}>
                    <Group
                      style={{ position: "relative", width: "max-content" }}
                      gap={0}
                    >
                      <UnstyledButton
                        onClick={() => handleSort("created_at")}
                        className={classes.tableHeading}
                      >
                        Modified At
                        <SortIcons
                          sortState={
                            filters.sortBy === "created_at"
                              ? filters.sortDirection || false
                              : false
                          }
                          color="#ffffff"
                          size={16}
                        />
                      </UnstyledButton>
                    </Group>
                  </th>
                </tr>
              </thead>
              <tbody className={classes.tableBody}>
                {logs.map((log, index) => (
                  <LogRow key={log.id} log={log} index={index} />
                ))}
              </tbody>
            </Table>

            {loading && logs.length > 0 && (
              <Center py="sm">
                <Loader size="sm" />
              </Center>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <Flex justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Showing {filters.offset + 1} to{" "}
              {Math.min(filters.offset + filters.limit, totalCount)} of{" "}
              {totalCount} logs
            </Text>
            <Group gap="xs">
              <Button
                variant="default"
                size="xs"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "filled" : "default"}
                    size="xs"
                    onClick={() => handlePageChange(page)}
                    className={classes.paginationItem}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="default"
                size="xs"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </Group>
          </Flex>
        )}
      </Stack>
    </Container>
  );
};

export default QuestionnaireLogsPage;
