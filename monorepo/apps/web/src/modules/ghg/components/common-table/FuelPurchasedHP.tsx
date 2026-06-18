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
import { useGetGhgEnergyFuelPurchasedHeatingWaterLazyQuery } from "@/modules/ghg/graphql/queries/get-ghgform-energyfuelpurchased-heatingwater-tabledata.generated";
import classes from "./CSS.module.css";
config.autoAddCss = false;
type FuelPurchasedToGenerateEnergyHP = {
  type_of_fuel_purchased: string;
  quality_of_fuel: string;
  used_for_which_SKUs: string;
  quantity_of_fuel_consumed: number;
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
const data: FuelPurchasedToGenerateEnergyHP[] = [
  {
    type_of_fuel_purchased: "CNG",
    quality_of_fuel: "Non-Corrosive",
    used_for_which_SKUs: "SKU",
    quantity_of_fuel_consumed: 100000,
  },
  {
    type_of_fuel_purchased: "CNG",
    quality_of_fuel: "Non-Corrosive",
    used_for_which_SKUs: "SKU",
    quantity_of_fuel_consumed: 100000,
  },
  {
    type_of_fuel_purchased: "CNG",
    quality_of_fuel: "Non-Corrosive",
    used_for_which_SKUs: "SKU",
    quantity_of_fuel_consumed: 100000,
  },
  {
    type_of_fuel_purchased: "CNG",
    quality_of_fuel: "Non-Corrosive",
    used_for_which_SKUs: "SKU",
    quantity_of_fuel_consumed: 100000,
  },
  {
    type_of_fuel_purchased: "CNG",
    quality_of_fuel: "Non-Corrosive",
    used_for_which_SKUs: "SKU",
    quantity_of_fuel_consumed: 100000,
  },
  {
    type_of_fuel_purchased: "CNG",
    quality_of_fuel: "Non-Corrosive",
    used_for_which_SKUs: "SKU",
    quantity_of_fuel_consumed: 100000,
  },
  {
    type_of_fuel_purchased: "CNG",
    quality_of_fuel: "Non-Corrosive",
    used_for_which_SKUs: "SKU",
    quantity_of_fuel_consumed: 100000,
  },
  {
    type_of_fuel_purchased: "CNG",
    quality_of_fuel: "Non-Corrosive",
    used_for_which_SKUs: "SKU",
    quantity_of_fuel_consumed: 100000,
  },
];

const FuelPurchasedGenerateEnergyHeatingPurposeTable = () => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState<FuelPurchasedToGenerateEnergyHP[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [fetchData] = useGetGhgEnergyFuelPurchasedHeatingWaterLazyQuery();

  useEffect(() => {
    const fetchDataFn = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      let activityFilter: object = {};
      if (columnFilters?.length > 0 || !!globalFilter) {
        let type_of_fuel_purchased = columnFilters.filter(
          (d) => d.id === "type_of_fuel_purchased"
        )[0]?.value as string;
        let quality_of_fuel = columnFilters.filter(
          (d) => d.id === "quality_of_fuel"
        )[0]?.value as string;
        let used_for_which_SKUs = columnFilters.filter(
          (d) => d.id === "used_for_which_SKUs"
        )[0]?.value as string;
        let quantity_of_fuel_consumed = columnFilters.filter(
          (d) => d.id === "quantity_of_fuel_consumed"
        )[0]?.value as number;
        let isValueNumeric = false;
        if (!isNaN(quantity_of_fuel_consumed)) {
          isValueNumeric = true;
        }
        let quantity_of_fuel_consumed_global = globalFilter;
        let isValueNumeric_global = false;
        if (!isNaN(quantity_of_fuel_consumed_global as unknown as number)) {
          isValueNumeric_global = true;
        }

        activityFilter = {
          _and: {
            // For Section column filter
            ...(!!type_of_fuel_purchased &&
              type_of_fuel_purchased !== "" && {
                ...{
                  Type_of_Fuel_Purchased: {
                    _ilike: `%${type_of_fuel_purchased.trim()}%`,
                  },
                },
              }),
            // For Section column filter
            ...(!!quality_of_fuel &&
              quality_of_fuel !== "" && {
                ...{
                  Quality_of_fuel: {
                    _ilike: `%${quality_of_fuel.trim()}%`,
                  },
                },
              }),
            // For Section column filter
            ...(!!used_for_which_SKUs &&
              used_for_which_SKUs !== "" && {
                ...{
                  Used_for_Which_SKUs: {
                    _ilike: `%${used_for_which_SKUs.trim()}%`,
                  },
                },
              }),
            // For Numeric column filter
            ...(!!quantity_of_fuel_consumed && {
              ...{
                Quantity_of_fuel_consumed: {
                  _eq: isValueNumeric
                    ? Number(`${quantity_of_fuel_consumed}`)
                    : 0,
                },
              },
            }),
            // For Import method column filter
            // For Global search
            ...(!!globalFilter &&
              globalFilter !== "" && {
                _or: [
                  {
                    Type_of_Fuel_Purchased: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  {
                    Quality_of_fuel: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  {
                    Used_for_Which_SKUs: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  isValueNumeric_global === true
                    ? {
                        Quantity_of_fuel_consumed: {
                          _eq: Math.floor(Number(`${globalFilter.trim()}`)),
                        },
                      }
                    : {
                        Type_of_Fuel_Purchased: {
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
        if (sort.id === "type_of_fuel_purchased") {
          orderBy = {
            Type_of_Fuel_Purchased: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "quality_of_fuel") {
          orderBy = {
            Quality_of_fuel: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "used_for_which_SKUs") {
          orderBy = {
            Used_for_Which_SKUs: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "quantity_of_fuel_consumed") {
          orderBy = {
            Quantity_of_fuel_consumed: desc === true ? "desc" : "asc",
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
            const GHGEnergyConsumption_FuelPurchased_HeatingWater: any = [];
            response?.data?.GHGEnergyConsumption_FuelPurchased_HeatingWater?.map(
              (dbDetail: any) => {
                GHGEnergyConsumption_FuelPurchased_HeatingWater.push({
                  type_of_fuel_purchased: dbDetail?.Type_of_Fuel_Purchased,
                  quality_of_fuel: dbDetail?.Quality_of_fuel,
                  used_for_which_SKUs: dbDetail?.Used_for_Which_SKUs,
                  quantity_of_fuel_consumed:
                    dbDetail?.Quantity_of_fuel_consumed,
                });
              }
            );
            setData(GHGEnergyConsumption_FuelPurchased_HeatingWater);
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

  const columns = useMemo<MRT_ColumnDef<FuelPurchasedToGenerateEnergyHP>[]>(
    () => [
      {
        accessorKey: "type_of_fuel_purchased",
        header: "Type of Fuel Purchased",
      },
      {
        accessorKey: "quality_of_fuel",
        header: "Quality of fuel",
      },
      {
        accessorKey: "used_for_which_SKUs",
        header: "Used for Which SKUs",
      },
      {
        accessorKey: "quantity_of_fuel_consumed",
        header: "Quantity of Fuel Consumed",
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
          Fuels Purchased to Generate Energy for Heating Water
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
    getRowId: (row) => row.type_of_fuel_purchased, //give each row a more useful id
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

export default FuelPurchasedGenerateEnergyHeatingPurposeTable;
