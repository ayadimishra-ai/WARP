"use client";

import { Button, Flex, Select, Stack, Text, Box } from "@mantine/core";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { useAiFileRemoval } from "../hooks/use-ai-file-removal";
import { TABLE_PAGE_SIZE, EMPTY_STATE_MESSAGE } from "../constants";

/**
 * AI File Removal Table Component
 * Displays organization filter, load button, data table, and delete button
 */
const AiFileRemovalTable = () => {
  const {
    filters,
    organizationOptions,
    data,
    loading,
    deleting,
    isLoadButtonEnabled,
    columns,
    rowSelection,
    setRowSelection,
    selectedRowCount,
    handleFilterChange,
    handleLoadData,
    handleDelete,
    handleReset,
  } = useAiFileRemoval();

  const table = useMantineReactTable({
    columns,
    data,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableSorting: true,
    enableTopToolbar: false,
    enableStickyHeader: true,
    enableRowActions: false,
    enablePagination: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    paginationDisplayMode: "pages",
    getRowId: (row) => row.id,
    mantinePaginationProps: {
      showRowsPerPage: false,
    },
    initialState: {
      pagination: { pageSize: TABLE_PAGE_SIZE, pageIndex: 0 },
      columnVisibility: { id: false },
    },
    state: {
      isLoading: loading,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    mantineTableContainerProps: {
      style: { maxHeight: "600px" },
    },
  });

  return (
    <Stack gap={24} p={24}>
      {/* Header */}
      <Box>
        <Text c="dimmed" size="sm">
          Select an organization to load and manage AI file uploads
        </Text>
      </Box>

      {/* Filter Section */}
      <Box
        p={20}
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
        }}
      >
        <Text fw={600} size="sm" mb={16} c="#003b52">
          Filter
        </Text>

        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={16}
          wrap="wrap"
          align="flex-end"
        >
          <Select
            label="Organization"
            placeholder="Select organization"
            data={organizationOptions}
            value={filters.organizationId || null}
            onChange={(value) =>
              handleFilterChange("organizationId", value || "")
            }
            searchable
            clearable
            style={{ minWidth: 200, maxWidth: 300 }}
            required
            disabled={loading || deleting}
          />

          <Flex gap={8} align="flex-end">
            <Button
              onClick={handleLoadData}
              disabled={!isLoadButtonEnabled || loading || deleting}
              loading={loading}
              style={{ minWidth: 120 }}
            >
              Load Data
            </Button>

            <Button
              onClick={handleReset}
              disabled={loading || deleting}
              variant="outline"
              color="gray"
              style={{ minWidth: 120 }}
            >
              Reset
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Action Buttons Section */}
      <Flex justify="space-between" align="center" gap={12}>
        <Text size="sm" c="dimmed">
          {selectedRowCount > 0 ? (
            <>
              <Text component="span" fw={600} c="#003b52">
                {selectedRowCount}
              </Text>{" "}
              file{selectedRowCount > 1 ? "s" : ""} selected
            </>
          ) : (
            "Select files to delete"
          )}
        </Text>
        <Button
          color="red"
          onClick={handleDelete}
          disabled={selectedRowCount === 0 || loading || deleting}
          loading={deleting}
        >
          Delete Selected ({selectedRowCount})
        </Button>
      </Flex>

      {/* Data Table */}
      <Box
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {data.length === 0 && !loading ? (
          <Box
            p={40}
            style={{
              textAlign: "center",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Text c="dimmed" size="sm">
              {EMPTY_STATE_MESSAGE}
            </Text>
          </Box>
        ) : (
          <MantineReactTable table={table} />
        )}
      </Box>
    </Stack>
  );
};

export default AiFileRemovalTable;
