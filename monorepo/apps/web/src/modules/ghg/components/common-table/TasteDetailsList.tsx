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
  Flex,
  Group,
  MantineProvider,
  Popover,
  Text,
  createTheme,
} from "@mantine/core";
import { IconInfoCircleFilled } from "@tabler/icons-react";
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
import { useEffect, useMemo, useState } from "react";
import { useGetGhgWasteLazyQuery } from "@/modules/ghg/graphql/queries/get-ghgform-waste-tabledata.generated";
import classes from "./CSS.module.css";

config.autoAddCss = false;
type ListOfWasteDetails = {
  type_of_waste: string;
  disposal_managed_by: string;
  third_party_name: string;
  qty_of_waste: string;
  disposal_mechanism: string;
};
const faIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => <FontAwesomeIcon icon={faSort} {...props} />,
  IconSortAscending: (props: any) => (
    <FontAwesomeIcon icon={faSortUp} {...props} />
  ),
  IconSortDescending: (props: any) => (
    <FontAwesomeIcon icon={faSortDown} {...props} />
  ),
};
//nested data is ok, see accessorKeys in ColumnDef below
const data: ListOfWasteDetails[] = [
  {
    type_of_waste: "Bio-degradable",
    disposal_managed_by: "Self",
    third_party_name: "ABC Company",
    qty_of_waste: "600 kg",
    disposal_mechanism: "Landfilled",
  },
  {
    type_of_waste: "Bio-degradable",
    disposal_managed_by: "Self",
    third_party_name: "ABC Company",
    qty_of_waste: "600 kg",
    disposal_mechanism: "Landfilled",
  },
];

const ListOfWasteDetailsTable = () => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState<ListOfWasteDetails[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [fetchData] = useGetGhgWasteLazyQuery();

  useEffect(() => {
    const fetchDataFn = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      let activityFilter: object = {};
      if (columnFilters?.length > 0 || !!globalFilter) {
        let type_of_waste = columnFilters.filter(
          (d) => d.id === "type_of_waste"
        )[0]?.value as string;
        let disposal_managed_by = columnFilters.filter(
          (d) => d.id === "disposal_managed_by"
        )[0]?.value as string;
        let third_party_name = columnFilters.filter(
          (d) => d.id === "third_party_name"
        )[0]?.value as string;
        let qty_of_waste = columnFilters.filter(
          (d) => d.id === "qty_of_waste"
        )[0]?.value as number;
        let disposal_mechanism = columnFilters.filter(
          (d) => d.id === "disposal_mechanism"
        )[0]?.value as string;
        let isValueNumeric = false;
        if (!isNaN(qty_of_waste)) {
          isValueNumeric = true;
        }
        let qty_of_waste_global = globalFilter;
        let isValueNumeric_global = false;
        if (!isNaN(qty_of_waste_global as unknown as number)) {
          isValueNumeric_global = true;
        }

        activityFilter = {
          _and: {
            // For Section column filter
            ...(!!type_of_waste &&
              type_of_waste !== "" && {
                ...{
                  Types_of_Waste_Generated: {
                    _ilike: `%${type_of_waste.trim()}%`,
                  },
                },
              }),
            // For Section column filter
            ...(!!disposal_managed_by &&
              disposal_managed_by !== "" && {
                ...{
                  Waste_Disposal_Managed_by: {
                    _ilike: `%${disposal_managed_by.trim()}%`,
                  },
                },
              }),
            // For Section column filter
            ...(!!third_party_name &&
              third_party_name !== "" && {
                ...{
                  Name_of_Third_Party: {
                    _ilike: `%${third_party_name.trim()}%`,
                  },
                },
              }),
            // For Numeric column filter
            ...(!!qty_of_waste && {
              ...{
                Quantity_of_Waste: {
                  _eq: isValueNumeric ? Number(`${qty_of_waste}`) : 0,
                },
              },
            }),
            // For Section column filter
            ...(!!disposal_mechanism &&
              disposal_mechanism !== "" && {
                ...{
                  Disposal_Mechanism: {
                    _ilike: `%${disposal_mechanism.trim()}%`,
                  },
                },
              }),
            // For Import method column filter
            // For Global search
            ...(!!globalFilter &&
              globalFilter !== "" && {
                _or: [
                  {
                    Types_of_Waste_Generated: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  {
                    Waste_Disposal_Managed_by: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  {
                    Name_of_Third_Party: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  {
                    Disposal_Mechanism: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  isValueNumeric_global === true
                    ? {
                        Quantity_of_Waste: {
                          _eq: Math.floor(Number(`${globalFilter.trim()}`)),
                        },
                      }
                    : {
                        Types_of_Waste_Generated: {
                          _ilike: `%${globalFilter.trim()}%`,
                        },
                      },
                ],
              }),
          },
        };
      }
      let orderBy: object = { created_at: "desc" };
      if (sorting?.length > 0) {
        const sort = sorting[0];
        const { desc } = sort;
        orderBy = { [sort.id]: desc === true ? "desc" : "asc" };
        if (sort.id === "type_of_waste") {
          orderBy = {
            Types_of_Waste_Generated: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "disposal_managed_by") {
          orderBy = {
            Waste_Disposal_Managed_by: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "third_party_name") {
          orderBy = {
            Name_of_Third_Party: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "qty_of_waste") {
          orderBy = {
            Quantity_of_Waste: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "disposal_mechanism") {
          orderBy = {
            Disposal_Mechanism: desc === true ? "desc" : "asc",
          };
        }
      }
      try {
        await fetchData({
          variables: {
            activityFilter: activityFilter,
            start: parseInt(`${pagination.pageIndex * pagination.pageSize}`),
            size: parseInt(`${pagination.pageSize}`),
            orderBy: orderBy,
          },
        }).then(async (response: any) => {
          if (!!response.data) {
            const GHGWaste: any = [];
            response?.data?.GHGWaste?.map((dbDetail: any) => {
              GHGWaste.push({
                type_of_waste: dbDetail?.Types_of_Waste_Generated,
                disposal_managed_by: dbDetail?.Waste_Disposal_Managed_by,
                third_party_name: dbDetail?.Name_of_Third_Party,
                qty_of_waste: dbDetail?.Quantity_of_Waste,
                disposal_mechanism: dbDetail?.Disposal_Mechanism,
              });
            });
            setData(GHGWaste);
            setRowCount(response?.data?.totalCount?.aggregate?.count ?? 0);
          }
        });
      } catch (error) {
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
    };
    fetchDataFn();
  }, [
    columnFilters, //refetch when column filters change
    globalFilter, //refetch when global filter changes
    pagination.pageIndex, //refetch when page index changes
    pagination.pageSize, //refetch when page size changes
    sorting, //refetch when sorting changes
  ]);

  //should be memoized or stable

  const columns = useMemo<MRT_ColumnDef<ListOfWasteDetails>[]>(
    () => [
      {
        accessorKey: "type_of_waste",
        header: "Type of Waste",
      },
      {
        accessorKey: "disposal_managed_by",
        header: "Disposal Managed By",
      },
      {
        accessorKey: "third_party_name",
        header: "Third Party Name",
      },
      {
        accessorKey: "qty_of_waste",
        header: "Qty of Waste",
      },
      {
        accessorKey: "disposal_mechanism",
        header: "Disposal Mechanism",
      },
    ],
    []
  );
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const table = useMantineReactTable({
    renderTopToolbarCustomActions: () => (
      <Group className="sora-font " pt={6} gap={10} mt={5}>
        <Text
          fw="600"
          c="#FFA93C"
          m="0"
          classNames={{
            root: `${classes.textFontSize}`,
          }}
        >
          List of Waste Details
        </Text>
        <Popover width={200} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon style={{ minWidth: "max-content" }}>
              <IconInfoCircleFilled color="#CDCDCD" width={18} height={18} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Text size="xs">
              This is uncontrolled popover, it is opened when button is clicked
            </Text>
          </Popover.Dropdown>
        </Popover>
      </Group>
    ),
    columns,
    data,
    icons: faIcons,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: true,
    enableHiding: false,
    enableMultiRowSelection: false,
    enableRowSelection: true,
    initialState: { showColumnFilters: true, showGlobalFilter: true },
    columnFilterDisplayMode: "popover",
    manualFiltering: true,
    manualPagination: true,
    enableFilterMatchHighlighting: false,
    enableColumnFilters: true,
    paginationDisplayMode: "pages",
    mantinePaginationProps: {
      style: {
        border: 0,
      },
    },
    getRowId: (row) => row.type_of_waste, //give each row a more useful id
    mantineTableBodyRowProps: ({ row }) => ({
      //add onClick to row to select upon clicking anywhere in the row
      onClick: row.getToggleSelectedHandler(),
      style: { cursor: "pointer" },
    }),
    onRowSelectionChange: setRowSelection, //connect internal row selection state to your own
    mantineSelectCheckboxProps: { color: "#72D0C6", size: "xs" },
    positionToolbarAlertBanner: "none",
    mantinePaperProps: { className: classes.FormTablestyle },
    mantineSearchTextInputProps: {
      style: {
        borderRadius: 20,
      },
      placeholder: "Search...",
      leftSection: (
        <FontAwesomeIcon
          icon={faSearch}
          style={{ marginLeft: 15, fill: "#666" }}
        />
      ),
    },

    mantineProgressProps: ({ isTopToolbar }) => ({
      color: "#72D0C6",
      style: { display: isTopToolbar ? "block" : "none" }, //only show top toolbar progress bar
      value: 100, //show precise real progress value if you so desire
    }),
    manualSorting: true,
    rowCount,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      rowSelection,
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    enableGlobalFilter: true,
    displayColumnDefOptions: {
      "mrt-row-actions": { size: 50, Header: "" },
      "mrt-row-select": { size: 20, Header: "" },
    },
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
            backgroundColor: "#f6f8fb",
          },
          td: {
            color: "#666",
            fontWeight: 400,
          },
          tr: {
            TextInput: {
              input: {
                borderRadius: 0,
              },
            },
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
            marginRight: "15px",
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
      <MantineProvider theme={theme}>
        <MantineReactTable table={table} />
      </MantineProvider>
    </Flex>
  );
};

export default ListOfWasteDetailsTable;
