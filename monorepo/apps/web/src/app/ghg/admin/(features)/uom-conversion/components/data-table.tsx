"use client";

import { ActionIcon, Button, Flex, Stack, Tooltip } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import {
  MantineReactTable,
  MRT_GlobalFilterTextInput,
  useMantineReactTable,
} from "mantine-react-table";
import { useDataTable } from "../hooks/use-data-table";

const DataTable = () => {
  const {
    columns,
    handleCreateNewUomConversion,
    handleEditRowSave,
    setValidationErrors,
    data,
    loading,
    isSaving,
  } = useDataTable();

  const table = useMantineReactTable({
    columns,
    data: data?.uomConversionFactors || [],
    mantinePaginationProps: {
      showRowsPerPage: false,
    },
    enableColumnFilters: true,
    createDisplayMode: "row",
    editDisplayMode: "row",
    enableEditing: true,
    getRowId: (row) => row.id,
    paginationDisplayMode: "pages",
    enableTopToolbar: false,
    enableStickyHeader: true,
    enableColumnActions: false,
    enableRowActions: true,
    positionActionsColumn: "last",
    initialState: {
      isLoading: true,
      pagination: { pageSize: 10, pageIndex: 0 },
      showGlobalFilter: true,
      columnVisibility: { id: false },
      showColumnFilters: true,
    },
    columnFilterDisplayMode: "popover",
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateNewUomConversion,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleEditRowSave,
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit color="#333333" />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    state: {
      isLoading: loading,
      isSaving: isSaving,
    },
  });

  return (
    <Stack gap={10}>
      <Flex direction="row" justify="flex-end" px={10} gap={10}>
        <MRT_GlobalFilterTextInput table={table} />
        <Button onClick={() => table.setCreatingRow(true)}>Add New</Button>
      </Flex>
      <MantineReactTable table={table} />
    </Stack>
  );
};

export default DataTable;
