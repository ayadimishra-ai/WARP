import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  faSearch,
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  HoverCard,
  MantineProvider,
  Text,
  createTheme,
} from "@mantine/core";
import {
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_RowSelectionState,
  MRT_SortingState,
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Icons,
} from "mantine-react-table";
import { useMemo, useState } from "react";
import EyeIcon from "../icons/EyeIcon";
import GreenCheck from "../icons/GreenCheck";
import GreyCheck from "../icons/GreyCheck";
import classes from "./CSS.module.css";
config.autoAddCss = false;
type EmissionTableListingData = {
  id: number;
  facility: string;
  period: string;
  location_type: string;
  status: any;
  total_emission: string;
  submitted_on: string;
  address: string;
  invoice: any;
};
const faIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => <FontAwesomeIcon size="sm" icon={faSort} />,
  IconSortAscending: (props: any) => (
    <FontAwesomeIcon size="sm" icon={faSortUp} />
  ),
  IconSortDescending: (props: any) => (
    <FontAwesomeIcon size="sm" icon={faSortDown} />
  ),
};

const GhgEmissionTable = () => {
  //should be memoized or stable
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const data: any = [];
  const columns = useMemo<MRT_ColumnDef<EmissionTableListingData>[]>(
    () => [
      {
        accessorKey: "facility", //access nested data with dot notation
        header: "Facility",
        filterFn: "contains",
      },
      {
        accessorKey: "period",
        header: "Period",
        filterFn: "contains",
      },
      {
        accessorKey: "id",
        header: "Id",
        filterFn: "contains",
      },
      {
        accessorKey: "location_type", //normal accessorKey
        header: "Location type",
        filterFn: "contains",
      },
      {
        accessorKey: "status",
        header: "Status",
        filterFn: "contains",
        Cell: ({ cell }) => (
          <Flex>
            {/* <Box
              style={(theme: any) => ({
                backgroundColor: theme.colors.success[0],
                borderRadius: "20px",
                color: "#000",
                width: "max-content",
                height: "20px",
                padding: "3px 8px",
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
              })}
            >
              Submitted
            </Box> */}
            <HoverCard
              width={140}
              position="right"
              offset={5}
              withArrow
              arrowOffset={25}
              arrowSize={12}
              shadow="md"
            >
              <HoverCard.Target>
                <Box
                  style={(theme: any) => ({
                    backgroundColor: theme.colors.primary[0],
                    borderRadius: "20px",
                    color: "#000",
                    width: "max-content",
                    height: "20px",
                    padding: "3px 8px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "12px",
                    cursor: "pointer",
                  })}
                >
                  Pending
                </Box>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Flex gap={10} direction="column" wrap="nowrap">
                  <Flex gap={10}>
                    <GreenCheck />
                    <Text>General</Text>
                  </Flex>
                  <Flex gap={10}>
                    <GreenCheck />
                    <Text>Production</Text>
                  </Flex>
                  <Flex gap={10}>
                    <GreenCheck />
                    <Text>Energy</Text>
                  </Flex>
                  <Flex gap={10}>
                    <GreyCheck />
                    <Text>Transport</Text>
                  </Flex>
                  <Flex gap={10}>
                    <GreyCheck />
                    <Text>Waste</Text>
                  </Flex>
                </Flex>
              </HoverCard.Dropdown>
            </HoverCard>
          </Flex>
        ),
      },
      //   {
      //     accessorKey: "total_emission",
      //     header: "Total Emission",
      //   },
      //   {
      //     accessorKey: "change",
      //     header: "Change (in %)",
      //     Cell: ({ cell }) => (
      //       <Flex>
      //         <Box
      //           style={(theme: any) => ({
      //             color: theme.colors.failure[0],
      //             width: "max-content",
      //             height: "20px",
      //             padding: "3px 8px",
      //             display: "flex",
      //             alignItems: "center",
      //             fontSize: "12px",
      //           })}
      //         >
      //           <IconTrendingUp /> #.##
      //         </Box>
      //         <Box
      //           style={(theme: any) => ({
      //             color: theme.colors.success[1],
      //             width: "max-content",
      //             height: "20px",
      //             padding: "3px 8px",
      //             display: "flex",
      //             alignItems: "center",
      //             fontSize: "12px",
      //           })}
      //         >
      //           <IconTrendingDown /> #.##
      //         </Box>
      //       </Flex>
      //     ),
      //   },
      {
        accessorKey: "submitted_on",
        header: "Submitted On",
        filterFn: "contains",
      },
    ],
    []
  );
  const table = useMantineReactTable({
    renderTopToolbarCustomActions: () => (
      <Group className="sora-font " pt={6} gap={24} mt={5}>
        <Button
          variant="transparent listing-page-topper-title"
          p={0}
          h={20}
          fw={500}
          fz={16}
          c={"#FFA93C"}
        >
          All(35)
        </Button>
        <Button variant="transparent" p={0} h={20} fw={500} fz={16} c={"#666"}>
          Submitted (3)
        </Button>
        <Button variant="transparent" p={0} h={20} fw={500} fz={16} c={"#666"}>
          Pending (100)
        </Button>
      </Group>
    ),
    columns,
    data,
    icons: faIcons,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: true,
    enableHiding: false,
    // enableRowSelection: true,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableMultiRowSelection: false,
    state: {
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
      sorting,
    },
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      columnVisibility: { id: false },
    },
    columnFilterDisplayMode: "popover",
    manualFiltering: false,
    manualPagination: false,
    enableFilterMatchHighlighting: false,
    enableColumnFilters: true,
    paginationDisplayMode: "pages",
    mantinePaginationProps: {
      style: {
        border: 0,
      },
    },
    mantineTableBodyRowProps: ({ row }) => ({
      //add onClick to row to select upon clicking anywhere in the row
      onClick: () => {
        row.getToggleSelectedHandler();
        window.parent.postMessage(
          {
            name: "ghgForms",
            location: row.original.facility,
            date: row.original.period,
            id: row.original.id,
          },
          "*"
        );
      },
      sx: { cursor: "pointer" },
    }),
    mantinePaperProps: { className: classes.ghgemissiontablestyle },
    mantineSearchTextInputProps: {
      style: {
        borderRadius: 20,
      },
      placeholder: "Search...",
      leftSection: (
        <FontAwesomeIcon
          icon={faSearch}
          size="lg"
          style={{ marginLeft: 15, fill: "#666" }}
        />
      ),
    },

    mantineProgressProps: ({ isTopToolbar }) => ({
      color: "#72D0C6",
      style: { display: isTopToolbar ? "block" : "none" }, //only show top toolbar progress bar
      value: 100, //show precise real progress value if you so desire
    }),
    manualSorting: false,
    enableGlobalFilter: true,
    displayColumnDefOptions: {
      "mrt-row-actions": { size: 50, Header: "Action" },
    },
    globalFilterFn: "contains",
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => (
      <ActionIcon>
        <EyeIcon />
      </ActionIcon>
    ),
  });
  const theme = createTheme({
    components: {
      Text: {
        styles: {
          root: {
            fontSize: "14px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal",
            color: "rgba(34, 51, 84, 0.50)",
          },
        },
      },
      Table: {
        styles: {
          table: {
            boxShadow:
              "rgba(159, 162, 191, 0.18) 0px 9px 16px, rgba(159, 162, 191, 0.32) 0px 2px 2px",
            borderRadius: 10,
            marginBottom: 25,
          },
          tbody: {
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
          },
          th: {
            maxHeight: 43,
          },
          td: {
            color: "#666",
            fontWeight: 400,
          },
          tr: {
            backgroundColor: "#FFF0F0",
            background: "#FFF0F0",
          },
        },
      },
      Popover: {
        styles: {
          dropdown: {
            zIndex: 9999,
          },
        },
      },
      TextInput: {
        styles: {
          wrapper: {
            marginRight: "-15px",
          },
          input: {
            paddingLeft: 42,
            borderRadius: 20,
            "--input-bd-focus": "transparent",
            width: "250px",
          },
        },
      },
      ActionIcon: {
        styles: {
          color: "#454545",
          backgroundColor: "#000",
        },
      },
    },
  });

  return (
    <Flex direction="column" wrap="nowrap" gap={7}>
      <Text size="lg" fw={600} c="black" pl={7}>
        GHG Emission
      </Text>
      <MantineProvider theme={theme}>
        <MantineReactTable table={table} />
      </MantineProvider>
    </Flex>
  );
};

export default GhgEmissionTable;
