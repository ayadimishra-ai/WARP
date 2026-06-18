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
import classes from "./CSS.module.css";

import { useGetGhgEnergyGridPowerDetailsLazyQuery } from "@/modules/ghg/graphql/queries/get-ghgform-energygridpowerdetails-tabledata.generated";

config.autoAddCss = false;
type ListOfCompaniesThatProvideGridPower = {
  distribution_company: string;
  power_consumed_grid: number;
  power_purchased_ppa: number;
  company_name_ppa: string;
  power_purchased_rec: number;
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
// const data: ListOfCompaniesThatProvideGridPower[] = [
//   {
//     distribution_company: "ABC Enterprise",
//     power_consumed_grid: 40,
//     power_purchased_ppa: 40,
//     company_name_ppa: "ABC Enterprise",
//     power_purchased_rec: 40,
//   },
//   {
//     distribution_company: "ABC Enterprise",
//     power_consumed_grid: 40,
//     power_purchased_ppa: 40,
//     company_name_ppa: "ABC Enterprise",
//     power_purchased_rec: 40,
//   },
//   {
//     distribution_company: "ABC Enterprise",
//     power_consumed_grid: 40,
//     power_purchased_ppa: 40,
//     company_name_ppa: "ABC Enterprise",
//     power_purchased_rec: 40,
//   },
//   {
//     distribution_company: "ABC Enterprise",
//     power_consumed_grid: 40,
//     power_purchased_ppa: 40,
//     company_name_ppa: "ABC Enterprise",
//     power_purchased_rec: 40,
//   },
//   {
//     distribution_company: "ABC Enterprise",
//     power_consumed_grid: 40,
//     power_purchased_ppa: 40,
//     company_name_ppa: "ABC Enterprise",
//     power_purchased_rec: 40,
//   },
//   {
//     distribution_company: "ABC Enterprise",
//     power_consumed_grid: 40,
//     power_purchased_ppa: 40,
//     company_name_ppa: "ABC Enterprise",
//     power_purchased_rec: 40,
//   },
//   {
//     distribution_company: "ABC Enterprise",
//     power_consumed_grid: 40,
//     power_purchased_ppa: 40,
//     company_name_ppa: "ABC Enterprise",
//     power_purchased_rec: 40,
//   },
//   {
//     distribution_company: "ABC Enterprise",
//     power_consumed_grid: 40,
//     power_purchased_ppa: 40,
//     company_name_ppa: "ABC Enterprise",
//     power_purchased_rec: 40,
//   },
// ];
interface TableProps {
  tableData: any;
}
const EnergyGridPowerDetailsTable: React.FC<TableProps> = ({ tableData }) => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState<ListOfCompaniesThatProvideGridPower[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [fetchData] = useGetGhgEnergyGridPowerDetailsLazyQuery();

  useEffect(() => {
    const fetchDataFn = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      let activityFilter: object = {};
      if (columnFilters?.length > 0 || !!globalFilter) {
        let distribution_company = columnFilters.filter(
          (d) => d.id === "distribution_company"
        )[0]?.value as string;
        let power_consumed_grid = columnFilters.filter(
          (d) => d.id === "power_consumed_grid"
        )[0]?.value as number;
        let power_purchased_ppa = columnFilters.filter(
          (d: any) => d.id === "power_purchased_ppa"
        )[0]?.value as number;
        let company_name_ppa = columnFilters.filter(
          (d) => d.id === "company_name_ppa"
        )[0]?.value as string;
        let power_purchased_rec = columnFilters.filter(
          (d) => d.id === "power_purchased_rec"
        )[0]?.value as number;

        let isValueNumeric = false;
        if (
          !isNaN(power_consumed_grid) ||
          !isNaN(power_purchased_ppa) ||
          !isNaN(power_purchased_rec)
        ) {
          isValueNumeric = true;
        }

        let power_consumed_grid_global = globalFilter;
        let power_purchased_ppa_global = globalFilter;
        let power_purchased_rec_global = globalFilter;
        let isValueNumeric_global = false;
        if (
          !isNaN(power_consumed_grid_global as unknown as number) ||
          !isNaN(power_purchased_ppa_global as unknown as number) ||
          !isNaN(power_purchased_rec_global as unknown as number)
        ) {
          isValueNumeric_global = true;
        }

        activityFilter = {
          _and: {
            // For Section column filter
            ...(!!distribution_company &&
              distribution_company !== "" && {
                ...{
                  Name_of_Distribution_Company: {
                    _ilike: `%${distribution_company.trim()}%`,
                  },
                },
              }),
            // For Filename column filter
            ...(!!power_consumed_grid && {
              ...{
                PowerConsumed_through_Grid_Kwh: {
                  _eq: isValueNumeric ? Number(`${power_consumed_grid}`) : 0,
                },
              },
            }),
            // For Full address column filter
            ...(!!power_purchased_ppa && {
              ...{
                PowerPurchased_through_PPA_Kwh_Renewable: {
                  _eq: isValueNumeric ? Number(`${power_purchased_ppa}`) : 0,
                },
              },
            }),
            // For Uploaded by column filter
            ...(!!company_name_ppa &&
              company_name_ppa !== "" && {
                ...{
                  NameOfCompany_PPA_Renewable: {
                    _ilike: `%${company_name_ppa.trim()}%`,
                  },
                },
              }),
            // For Import method column filter
            ...(!!power_purchased_rec && {
              ...{
                PowerPurchased_through_REC_Kwh: {
                  _eq: isValueNumeric ? Number(`${power_purchased_rec}`) : 0,
                },
              },
            }),

            // For Global search
            ...(!!globalFilter &&
              globalFilter !== "" && {
                _or: [
                  {
                    Name_of_Distribution_Company: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  isValueNumeric_global === true
                    ? {
                        PowerConsumed_through_Grid_Kwh: {
                          _eq: Number(`${globalFilter.trim()}`),
                        },
                      }
                    : {
                        Name_of_Distribution_Company: {
                          _ilike: `%${globalFilter.trim()}%`,
                        },
                      },

                  isValueNumeric_global === true
                    ? {
                        PowerPurchased_through_PPA_Kwh_Renewable: {
                          _eq: Number(`${globalFilter.trim()}`),
                        },
                      }
                    : {
                        Name_of_Distribution_Company: {
                          _ilike: `%${globalFilter.trim()}%`,
                        },
                      },
                  {
                    NameOfCompany_PPA_Renewable: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  isValueNumeric_global === true
                    ? {
                        PowerPurchased_through_REC_Kwh: {
                          _eq: Number(`${globalFilter.trim()}`),
                        },
                      }
                    : {
                        Name_of_Distribution_Company: {
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
        if (sort.id === "distribution_company") {
          orderBy = {
            Name_of_Distribution_Company: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "power_consumed_grid") {
          orderBy = {
            PowerConsumed_through_Grid_Kwh: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "power_purchased_ppa") {
          orderBy = {
            PowerPurchased_through_PPA_Kwh_Renewable:
              desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "company_name_ppa") {
          orderBy = {
            NameOfCompany_PPA_Renewable: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "power_purchased_rec") {
          orderBy = {
            PowerPurchased_through_REC_Kwh: desc === true ? "desc" : "asc",
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
            const GHGEnergyConsumption_GridPower: any = [];
            response?.data?.GHGEnergyConsumption_GridPower?.map(
              (dbDetail: any) => {
                GHGEnergyConsumption_GridPower.push({
                  distribution_company: dbDetail?.Name_of_Distribution_Company,
                  power_consumed_grid: dbDetail?.PowerConsumed_through_Grid_Kwh,
                  power_purchased_ppa:
                    dbDetail?.PowerPurchased_through_PPA_Kwh_Renewable,
                  company_name_ppa: dbDetail?.NameOfCompany_PPA_Renewable,
                  power_purchased_rec: dbDetail?.PowerPurchased_through_REC_Kwh,
                });
              }
            );
            setData(GHGEnergyConsumption_GridPower);
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

  const columns = useMemo<MRT_ColumnDef<ListOfCompaniesThatProvideGridPower>[]>(
    () => [
      {
        accessorKey: "distribution_company",
        header: "Distribution Company",
      },
      {
        accessorKey: "power_consumed_grid",
        header: "Power Consumed Grid",
      },
      {
        accessorKey: "power_purchased_ppa",
        header: "Power Purchased PPA",
      },
      {
        accessorKey: "company_name_ppa",
        header: "Company Name PPA",
      },
      {
        accessorKey: "power_purchased_rec",
        header: "Power Purchased REC",
      },
    ],
    []
  );
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const table = useMantineReactTable({
    renderTopToolbarCustomActions: () => (
      <Group className="sora-font " pt={6} gap={10} mt={5} px={0}>
        <Text
          fw="600"
          c="#FFA93C"
          m="0"
          classNames={{
            root: `${classes.textFontSize}`,
          }}
        >
          List of Companies that Provided Grid Power
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

    getRowId: (row) => row.distribution_company, //give each row a more useful id
    mantineTableBodyRowProps: ({ row }) => ({
      //add onClick to row to select upon clicking anywhere in the row
      onClick: row.getToggleSelectedHandler(),
      style: { cursor: "pointer" },
    }),
    onRowSelectionChange: setRowSelection, //connect internal row selection state to your own
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
    enableGlobalFilter: true,
    displayColumnDefOptions: {
      "mrt-row-actions": { size: 50, Header: "" },
      "mrt-row-select": { size: 20, Header: "" },
    },
  });
  useEffect(() => {
    tableData(table.getSelectedRowModel().rows);
    // console.log("this is console", table.getSelectedRowModel().rows);
  }, [rowSelection, table, tableData]);

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
          width: "max-content",
          minWidth: "max-content",
          icon: {
            width: "max-content",
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

export default EnergyGridPowerDetailsTable;
