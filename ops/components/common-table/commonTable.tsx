"use client";
import { createTheme, Flex, MantineProvider } from "@mantine/core";
import {
  MantineReactTable,
  MRT_RowSelectionState,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_RowData,
} from "mantine-react-table";
import { useState } from "react";

interface CommonTableProps<T extends MRT_RowData> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  tableConfig: any;
}

const CommonTable = <T extends MRT_RowData>({
  data,
  columns,
  tableConfig,
}: CommonTableProps<T>) => {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const table = useMantineReactTable({
    ...tableConfig,
    columns,
    data,
    state: { 
      rowSelection,
      ...tableConfig.state, // Include any state from tableConfig (like pagination)
    },
    onRowSelectionChange: setRowSelection,
  });

  const theme = createTheme({
    components: {
      Table: {
        styles: {
          thead: {
            backgroundColor: "#003b52 !important",
          },
          th: {
            maxHeight: 43,
            backgroundColor: "#003b52 !important",
            color: "white",
            fontWeight: 600,
          },
        },
      },
    },
  });

  return (
    <Flex direction="column" wrap="nowrap" gap={7}>
      <MantineProvider theme={theme}>
        <MantineReactTable table={table} />
      </MantineProvider>
    </Flex>
  );
};

export default CommonTable;
