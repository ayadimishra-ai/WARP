"use client";

import { Button, Flex, Select, Stack, Title, Text, Box } from "@mantine/core";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { useActivityDataRemoval } from "../hooks/use-activity-data-removal";
import { SectionedDataTable } from "./sectioned-data-table";
import { TABLE_PAGE_SIZE, EMPTY_STATE_MESSAGE } from "../constants";

/**
 * Activity Data Removal Table Component
 * Displays filters, load button, data table, and delete button
 */
const ActivityDataRemovalTable = () => {
  const {
    filters,
    organizationOptions,
    locationOptions,
    activityOptions,
    monthOptions,
    yearOptions,
    data,
    sectionedData,
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
    toggleSectionVisibility,
    getTotalRecordCount,
  } = useActivityDataRemoval();

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
        {/* <Title order={2} c="#003b52" mb={8}>
          Activity Data Removal
        </Title> */}
        <Text c="dimmed" size="sm">
          Select filters to load and manage activity data records
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
          Filters
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
            style={{ flex: 1, minWidth: 200 }}
            required
            disabled={loading || deleting}
          />

          <Select
            label="Location"
            placeholder="Select location"
            data={locationOptions}
            value={filters.locationId || null}
            onChange={(value) => handleFilterChange("locationId", value || "")}
            searchable
            clearable
            disabled={!filters.organizationId || loading || deleting}
            style={{ flex: 1, minWidth: 200 }}
            required
          />

          <Select
            label="Activity"
            placeholder="Select activity"
            data={activityOptions}
            value={filters.activityId || null}
            onChange={(value) => handleFilterChange("activityId", value || "")}
            searchable
            clearable
            disabled={!filters.organizationId || loading || deleting}
            style={{ flex: 1, minWidth: 200 }}
            required
          />

          <Select
            label="Year"
            placeholder="Select year"
            data={yearOptions}
            value={filters.year || null}
            onChange={(value) => handleFilterChange("year", value || "")}
            searchable
            clearable
            style={{ flex: 1, minWidth: 200 }}
            required
            disabled={loading || deleting}
          />

          <Select
            label="Month"
            placeholder="Select month"
            data={monthOptions}
            value={filters.month || null}
            onChange={(value) => handleFilterChange("month", value || "")}
            searchable
            clearable
            style={{ flex: 1, minWidth: 200 }}
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
              record{selectedRowCount > 1 ? "s" : ""} selected
            </>
          ) : (
            "Select records to delete"
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

      {/* Data Display - Sectioned or Table */}
      {sectionedData.length > 0 ? (
        // Sectioned Data Display (for activities with multiple sub-tables)
        <Stack gap={16}>
          {sectionedData.map((section) => (
            <SectionedDataTable
              key={section.id}
              section={section}
              onToggleVisibility={toggleSectionVisibility}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              loading={loading}
              deleting={deleting}
            />
          ))}
        </Stack>
      ) : (
        // Traditional Single Table Display
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
      )}
    </Stack>
  );
};

export default ActivityDataRemovalTable;
