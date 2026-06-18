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
  createTheme,
  Flex,
  Group,
  MantineProvider,
  Popover,
  Text,
} from "@mantine/core";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import {
  MantineReactTable,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_RowSelectionState,
  MRT_SortingState,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Icons,
} from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { useGetGhgTransportUpstreamTransportDetailsLazyQuery } from "@/modules/ghg/graphql/queries/get-ghgform-transport-upstreamtransportdetails-tabledata.generated";
import classes from "./CSS.module.css";
config.autoAddCss = false;
type TripDetailsMovementUpstreamActivity = {
  material_procured: string;
  supplier_of_material: string;
  supplier_location: string;
  transport_managed_by: string;
  mode_of_transport: string;
  vehicle_type: string;
  fuel_used: string;
  quantity: number;
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
const TripDetailsMovementUpstreamActivityTable = () => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState<TripDetailsMovementUpstreamActivity[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [fetchData] = useGetGhgTransportUpstreamTransportDetailsLazyQuery();

  useEffect(() => {
    if (!data.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    const fetchDataFn = async () => {
      let activityFilter: object = {};
      if (columnFilters?.length > 0 || !!globalFilter) {
        let material_procured = columnFilters.filter(
          (d) => d.id === "material_procured"
        )[0]?.value as string;
        let supplier_of_material = columnFilters.filter(
          (d) => d.id === "supplier_of_material"
        )[0]?.value as string;
        let supplier_location = columnFilters.filter(
          (d: any) => d.id === "supplier_location"
        )[0]?.value as string;
        let transport_managed_by = columnFilters.filter(
          (d) => d.id === "transport_managed_by"
        )[0]?.value as string;
        let mode_of_transport = columnFilters.filter(
          (d) => d.id === "mode_of_transport"
        )[0]?.value as string;
        let vehicle_type = columnFilters.filter(
          (d: any) => d.id === "vehicle_type"
        )[0]?.value as string;
        let fuel_used = columnFilters.filter((d) => d.id === "fuel_used")[0]
          ?.value as string;
        let quantity = columnFilters.filter((d) => d.id === "quantity")[0]
          ?.value as number;

        let isValueNumeric = false;
        if (!isNaN(quantity)) {
          isValueNumeric = true;
        }

        let quantity_global = globalFilter;
        let isValueNumeric_global = false;
        if (!isNaN(quantity_global as unknown as number)) {
          isValueNumeric_global = true;
        }

        activityFilter = {
          _and: {
            // For Section column filter
            ...(!!material_procured &&
              material_procured !== "" && {
                ...{
                  Material_Procured: {
                    _ilike: `%${material_procured.trim()}%`,
                  },
                },
              }),
            // For Filename column filter
            ...(!!supplier_of_material &&
              supplier_of_material !== "" && {
                ...{
                  Third_Party_Suppliers_of_Material: {
                    _ilike: `%${supplier_of_material.trim()}%`,
                  },
                },
              }),
            // For Full address column filter
            ...(!!supplier_location &&
              supplier_location !== "" && {
                ...{
                  Locations_Procured_From: {
                    _ilike: `%${supplier_location.trim()}%`,
                  },
                },
              }),
            // For Uploaded by column filter
            ...(!!transport_managed_by &&
              transport_managed_by !== "" && {
                ...{
                  Transport_Managed_by: {
                    _ilike: `%${transport_managed_by.trim()}%`,
                  },
                },
              }),
            // For Import method column filter
            ...(!!mode_of_transport &&
              mode_of_transport !== "" && {
                ...{
                  Mode_of_Transport: {
                    _ilike: `%${mode_of_transport.trim()}%`,
                  },
                },
              }),
            ...(!!vehicle_type &&
              vehicle_type !== "" && {
                ...{
                  Vehicle_Type_Used_for_Road_Transport: {
                    _ilike: `%${vehicle_type.trim()}%`,
                  },
                },
              }),
            // For Uploaded by column filter
            ...(!!fuel_used &&
              fuel_used !== "" && {
                ...{
                  Fuel_Used: {
                    _ilike: `%${fuel_used.trim()}%`,
                  },
                },
              }),
            // For Import method column filter
            ...(!!quantity && {
              ...{
                Quantity_of_Fuel_Consumed: {
                  _eq: isValueNumeric ? Number(`${quantity}`) : 0,
                },
              },
            }),

            // For Global search
            ...(!!globalFilter &&
              globalFilter !== "" && {
                _or: [
                  {
                    Material_Procured: { _ilike: `%${globalFilter.trim()}%` },
                  },
                  {
                    Third_Party_Suppliers_of_Material: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  {
                    Locations_Procured_From: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  {
                    Transport_Managed_by: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
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
                  isValueNumeric_global === true
                    ? {
                        Quantity_of_Fuel_Consumed: {
                          _eq: Number(`${globalFilter.trim()}`),
                        },
                      }
                    : {
                        Vehicle_Type_Used_for_Road_Transport: {
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
        if (sort.id === "material_procured") {
          orderBy = {
            Material_Procured: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "supplier_of_material") {
          orderBy = {
            Third_Party_Suppliers_of_Material: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "supplier_location") {
          orderBy = {
            Locations_Procured_From: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "transport_managed_by") {
          orderBy = {
            Transport_Managed_by: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "mode_of_transport") {
          orderBy = {
            Mode_of_Transport: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "vehicle_type") {
          orderBy = {
            Vehicle_Type_Used_for_Road_Transport:
              desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "fuel_used") {
          orderBy = {
            Fuel_Used: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "quantity") {
          orderBy = {
            Quantity_of_Fuel_Consumed: desc === true ? "desc" : "asc",
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
            const GHGTransport_Upstream: any = [];
            response?.data?.GHGTransport_Upstream?.map((dbDetail: any) => {
              GHGTransport_Upstream.push({
                material_procured: dbDetail?.Material_Procured,
                supplier_of_material:
                  dbDetail?.Third_Party_Suppliers_of_Material,
                supplier_location: dbDetail?.Locations_Procured_From,
                transport_managed_by: dbDetail?.Transport_Managed_by,
                mode_of_transport: dbDetail?.Mode_of_Transport,
                vehicle_type: dbDetail?.Vehicle_Type_Used_for_Road_Transport,
                fuel_used: dbDetail?.Fuel_Used,
                quantity: dbDetail?.Quantity_of_Fuel_Consumed,
              });
            });
            setData(GHGTransport_Upstream);
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

  const columns = useMemo<MRT_ColumnDef<TripDetailsMovementUpstreamActivity>[]>(
    () => [
      {
        accessorKey: "material_procured",
        header: "Material Procured",
        size: 100,
      },
      {
        accessorKey: "supplier_of_material",
        header: "Supplier of Material",
        size: 100,
      },
      {
        accessorKey: "supplier_location",
        header: "Supplier Location",
        size: 100,
      },
      {
        accessorKey: "transport_managed_by",
        header: "Transport Managed By",
        size: 100,
      },
      {
        accessorKey: "mode_of_transport",
        header: "Mode of Transport",
        size: 100,
      },
      {
        accessorKey: "vehicle_type",
        header: "Vehicle Type",
        size: 80,
      },
      {
        accessorKey: "fuel_used",
        header: "Fuel Used",
        size: 100,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        size: 100,
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
          Trip Details for Movement of Goods and Material for all the Upstream
          Activity
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
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    getRowId: (row) => row.material_procured, //give each row a more useful id
    mantineTableBodyRowProps: ({ row }) => ({
      //add onClick to row to select upon clicking anywhere in the row
      onClick: row.getToggleSelectedHandler(),
      style: { cursor: "pointer" },
    }),
    onRowSelectionChange: setRowSelection, //connect internal row selection state to your own
    mantineSelectCheckboxProps: { color: "#72D0C6", size: "xs" },
    positionToolbarAlertBanner: "none",
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

export default TripDetailsMovementUpstreamActivityTable;
