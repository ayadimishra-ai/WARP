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
import { useGetGhgTransportBusinessTravelDetailsLazyQuery } from "@/modules/ghg/graphql/queries/get-ghgform-transport-businesstraveldetails-tabledata.generated";
import classes from "./CSS.module.css";

config.autoAddCss = false;
type ListOfBusinessTravelDetails = {
  mode_of_transport: string;
  vehicle_type_road: string;
  vehicle_type_rail: string;
  vehicle_type_air: string;
  fuel_used_road: string;
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

const ListOfBusinessTravelDetailsTable = () => {
  //should be memoized or stable
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState<ListOfBusinessTravelDetails[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [fetchData] = useGetGhgTransportBusinessTravelDetailsLazyQuery();

  useEffect(() => {
    if (!data.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    const fetchDataFn = async () => {
      let activityFilter: object = {};
      if (columnFilters?.length > 0 || !!globalFilter) {
        let mode_of_transport = columnFilters.filter(
          (d) => d.id === "mode_of_transport"
        )[0]?.value as string;
        let vehicle_type_road = columnFilters.filter(
          (d: any) => d.id === "vehicle_type_road"
        )[0]?.value as string;
        let fuel_used_road = columnFilters.filter(
          (d) => d.id === "fuel_used_road"
        )[0]?.value as string;
        // let quantity = columnFilters.filter((d) => d.id === "quantity")[0]
        //   ?.value as number;

        // let isValueNumeric = false;
        // if (!isNaN(quantity)) {
        //   isValueNumeric = true;
        // }

        // let quantity_global = globalFilter;
        // let isValueNumeric_global = false;
        // if (!isNaN(quantity_global as unknown as number)) {
        //   isValueNumeric_global = true;
        // }

        activityFilter = {
          _and: {
            // For Section column filter
            ...(!!mode_of_transport &&
              mode_of_transport !== "" && {
                ...{
                  Mode_of_Transport: {
                    _ilike: `%${mode_of_transport.trim()}%`,
                  },
                },
              }),
            ...(!!vehicle_type_road &&
              vehicle_type_road !== "" && {
                ...{
                  Vehicle_Type_Used_for_Road_Transport: {
                    _ilike: `%${vehicle_type_road.trim()}%`,
                  },
                },
              }),
            // For Uploaded by column filter
            ...(!!fuel_used_road &&
              fuel_used_road !== "" && {
                ...{
                  Fuel_Used: {
                    _ilike: `%${fuel_used_road.trim()}%`,
                  },
                },
              }),

            // For Global search
            ...(!!globalFilter &&
              globalFilter !== "" && {
                _or: [
                  {
                    Mode_of_Transport: { _ilike: `%${globalFilter.trim()}%` },
                  },
                  {
                    Vehicle_Type_Used_for_Road_Transport: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  {
                    Fuel_Used: { _ilike: `%${globalFilter.trim()}%` },
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
        if (sort.id === "mode_of_transport") {
          orderBy = {
            Mode_of_Transport: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "vehicle_type_road") {
          orderBy = {
            Vehicle_Type_Used_for_Road_Transport:
              desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "fuel_used_road") {
          orderBy = {
            Fuel_Used: desc === true ? "desc" : "asc",
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
            const GHGTransport_BusinessTravel: any = [];
            // console.log(
            //   GHGTransport_BusinessTravel,
            //   "GHGTransport_BusinessTravel"
            // );
            response?.data?.GHGTransport_BusinessTravel?.map(
              (dbDetail: any) => {
                GHGTransport_BusinessTravel.push({
                  mode_of_transport: dbDetail?.Mode_of_Transport,
                  vehicle_type_road:
                    dbDetail?.Vehicle_Type_Used_for_Road_Transport,
                  fuel_used_road: dbDetail?.Fuel_Used,
                });
              }
            );
            setData(GHGTransport_BusinessTravel);
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

  const columns = useMemo<MRT_ColumnDef<ListOfBusinessTravelDetails>[]>(
    () => [
      {
        accessorKey: "mode_of_transport",
        header: "Mode of Transport",
      },
      {
        accessorKey: "vehicle_type_road",
        header: "Vehicle Type - Road",
      },
      // {
      //   accessorKey: "vehicle_type_rail",
      //   header: "Vehicle Type - Rail",
      // },
      // {
      //   accessorKey: "vehicle_type_air",
      //   header: "Vehicle Type - Air",
      // },
      {
        accessorKey: "fuel_used_road",
        header: "Fuel Used - Road",
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
          List of Business Travel Details
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
    getRowId: (row) => row.mode_of_transport, //give each row a more useful id
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

export default ListOfBusinessTravelDetailsTable;
