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
  Card,
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
import { useGetGhgEnergyCaptivePowerRenewableLazyQuery } from "@/modules/ghg/graphql/queries/get-ghgform-energycaptivepowerrenewable-tabledata.generated";
import classes from "./CSS.module.css";
config.autoAddCss = false;
type EnergyCaptivePowerRenewable = {
  type_of_technology_used: string;
  year_of_installation: number;
  unit_of_energy_generated: number;
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

const EnergyCaptivePowerDetailsRenewable = () => {
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
  const [data, setData] = useState<EnergyCaptivePowerRenewable[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [fetchData] = useGetGhgEnergyCaptivePowerRenewableLazyQuery();

  useEffect(() => {
    const fetchDataFn = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      let activityFilter: object = {};
      if (columnFilters?.length > 0 || !!globalFilter) {
        let type_of_technology_used = columnFilters.filter(
          (d) => d.id === "type_of_technology_used"
        )[0]?.value as string;
        let year_of_installation = columnFilters.filter(
          (d) => d.id === "year_of_installation"
        )[0]?.value as number;
        let unit_of_energy_generated = columnFilters.filter(
          (d: any) => d.id === "unit_of_energy_generated"
        )[0]?.value as number;
        let isValueNumeric = false;
        if (!isNaN(year_of_installation) || !isNaN(unit_of_energy_generated)) {
          isValueNumeric = true;
        }

        let year_of_installation_global = globalFilter;
        let unit_of_energy_generated_global = globalFilter;
        let isValueNumeric_global = false;
        if (
          !isNaN(year_of_installation_global as unknown as number) ||
          !isNaN(unit_of_energy_generated_global as unknown as number)
        ) {
          isValueNumeric_global = true;
        }

        activityFilter = {
          _and: {
            // For Section column filter
            ...(!!type_of_technology_used &&
              type_of_technology_used !== "" && {
                ...{
                  Type_of_Technology_Used: {
                    _ilike: `%${type_of_technology_used.trim()}%`,
                  },
                },
              }),
            // For Filename column filter
            ...(!!year_of_installation && {
              ...{
                Year_of_installation: {
                  _eq: isValueNumeric ? Number(`${year_of_installation}`) : 0,
                },
              },
            }),
            // For Full address column filter
            ...(!!unit_of_energy_generated && {
              ...{
                Unit_of_Energy_Generated_in_Kwh: {
                  _eq: isValueNumeric
                    ? Number(`${unit_of_energy_generated}`)
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
                    Type_of_Technology_Used: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  isValueNumeric_global === true
                    ? {
                        Year_of_installation: {
                          _eq: Math.floor(Number(`${globalFilter.trim()}`)),
                        },
                      }
                    : {
                        Type_of_Technology_Used: {
                          _ilike: `%${globalFilter.trim()}%`,
                        },
                      },

                  isValueNumeric_global === true
                    ? {
                        Unit_of_Energy_Generated_in_Kwh: {
                          _eq: Number(`${globalFilter.trim()}`),
                        },
                      }
                    : {
                        Type_of_Technology_Used: {
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
        if (sort.id === "type_of_technology_used") {
          orderBy = {
            Type_of_Technology_Used: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "year_of_installation") {
          orderBy = {
            Year_of_installation: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "unit_of_energy_generated") {
          orderBy = {
            Unit_of_Energy_Generated_in_Kwh: desc === true ? "desc" : "asc",
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
            const GHGEnergy_CaptivePower_Renewable: any = [];
            response?.data?.GHGEnergy_CaptivePower_Renewable?.map(
              (dbDetail: any) => {
                GHGEnergy_CaptivePower_Renewable.push({
                  type_of_technology_used: dbDetail?.Type_of_Technology_Used,
                  year_of_installation: dbDetail?.Year_of_installation,
                  unit_of_energy_generated:
                    dbDetail?.Unit_of_Energy_Generated_in_Kwh,
                });
              }
            );
            setData(GHGEnergy_CaptivePower_Renewable);
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

  const columns = useMemo<MRT_ColumnDef<EnergyCaptivePowerRenewable>[]>(
    () => [
      {
        accessorKey: "type_of_technology_used",
        header: "Type of Technology Used",
      },
      {
        accessorKey: "year_of_installation",
        header: "Year of Installation",
      },
      {
        accessorKey: "unit_of_energy_generated",
        header: "Unit of Energy Generated",
      },
    ],
    []
  );
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const table = useMantineReactTable({
    renderTopToolbarCustomActions: () => (
      <Group className="sora-font " pt={0} gap={10} mt={0}>
        <Text
          fw="600"
          c="#FFA93C"
          m="0"
          classNames={{
            root: `${classes.textFontSize}`,
          }}
        >
          Captive Power Generated using Different Sources
        </Text>
        <Card bg={"#00B41D"} p="4" radius="xs">
          <h6
            className="smallFont"
            style={{ margin: 0, color: "#fff", lineHeight: "15px" }}
          >
            Renewable
          </h6>
        </Card>
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
    getRowId: (row) => row.type_of_technology_used, //give each row a more useful id
    mantineTableBodyRowProps: ({ row }) => ({
      //add onClick to row to select upon clicking anywhere in the row
      onClick: row.getToggleSelectedHandler(),
      style: { cursor: "pointer" },
    }),
    onRowSelectionChange: setRowSelection,
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

export default EnergyCaptivePowerDetailsRenewable;
