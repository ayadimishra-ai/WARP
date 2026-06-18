"use client";

import { Box, Button, Flex, Text, Collapse } from "@mantine/core";
import { IconChevronDown, IconChevronRight, IconEye, IconEyeOff } from "@tabler/icons-react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useMemo } from "react";
import type { ActivityDataSection } from "../types";
import { TABLE_PAGE_SIZE } from "../constants";

interface SectionedDataTableProps {
  section: ActivityDataSection;
  onToggleVisibility: (sectionId: string) => void;
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: (selection: Record<string, boolean>) => void;
  loading: boolean;
  deleting: boolean;
}

/**
 * Component to display a single section of activity data with collapsible table
 */
export const SectionedDataTable: React.FC<SectionedDataTableProps> = ({
  section,
  onToggleVisibility,
  rowSelection,
  onRowSelectionChange,
  loading,
  deleting,
}) => {
  // Generate columns dynamically based on data structure
  const columns = useMemo<MRT_ColumnDef<any>[]>(() => {
    if (!section.data || section.data.length === 0) {
      return [];
    }

    const firstItem = section.data[0];
    const keys = Object.keys(firstItem);

    console.log(`🔍 ${section.title} - All keys:`, keys);

    // Filter out nested objects and arrays, only keep primitive values
    // Also exclude 'id' and related ID columns from display
    const primitiveKeys = keys.filter((key) => {
      // Hide id and related ID columns
      if (
        key === "id" ||
        key === "task_request_id" ||
        key === "organization_address_id" ||
        key === "activity_task_request_id"
      ) {
        console.log(`  🚫 Hiding ID column: ${key}`);
        return false;
      }

      const value = firstItem[key];
      const isPrimitive =
        value === null ||
        value === undefined ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean";
      
      if (!isPrimitive) {
        console.log(`  ⏭️  Skipping nested field: ${key} (type: ${typeof value})`);
      }
      
      return isPrimitive;
    });

    console.log(`✅ ${section.title} - Primitive keys:`, primitiveKeys);

    return primitiveKeys.map((key) => ({
      accessorKey: key,
      header: key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      size: 150,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        // Handle null/undefined
        if (value === null || value === undefined) {
          return <Text c="dimmed" size="sm">-</Text>;
        }
        // Render primitive values
        return String(value);
      },
    }));
  }, [section.data, section.title]);

  const table = useMantineReactTable({
    columns,
    data: section.data,
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
    getRowId: (row) => `${section.id}-${row.id}`,
    mantinePaginationProps: {
      showRowsPerPage: false,
    },
    initialState: {
      pagination: { pageSize: TABLE_PAGE_SIZE, pageIndex: 0 },
    },
    state: {
      isLoading: loading,
      rowSelection,
    },
    onRowSelectionChange,
    mantineTableContainerProps: {
      style: { maxHeight: "500px" },
    },
  });

  return (
    <Box>
      {/* Section Header */}
      <Flex
        justify="space-between"
        align="center"
        p={16}
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px 8px 0 0",
          backgroundColor: "#f8f9fa",
          cursor: "pointer",
        }}
        onClick={() => onToggleVisibility(section.id)}
      >
        <Flex align="center" gap={12}>
          {section.isVisible ? (
            <IconChevronDown size={20} color="#003b52" />
          ) : (
            <IconChevronRight size={20} color="#003b52" />
          )}
          <Text fw={600} c="#003b52">
            {section.title}
          </Text>
          <Text size="sm" c="dimmed">
            ({section.data.length} records)
          </Text>
        </Flex>
        <Button
          variant="subtle"
          size="xs"
          leftSection={
            section.isVisible ? <IconEyeOff size={16} /> : <IconEye size={16} />
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(section.id);
          }}
        >
          {section.isVisible ? "Hide" : "Show"}
        </Button>
      </Flex>

      {/* Collapsible Table */}
      <Collapse in={section.isVisible}>
        <Box
          style={{
            border: "1px solid #e0e0e0",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
          }}
        >
          {section.data.length === 0 ? (
            <Box
              p={40}
              style={{
                textAlign: "center",
                backgroundColor: "#f9f9f9",
              }}
            >
              <Text c="dimmed" size="sm">
                No data available for this section
              </Text>
            </Box>
          ) : (
            <MantineReactTable table={table} />
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
