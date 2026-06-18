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
import { useGetGhgProductionDetailsLazyQuery } from "@/modules/ghg/graphql/queries/get-ghgform-productiondetails-tabledata.generated";
import classes from "./CSS.module.css";

config.autoAddCss = false;
type ListOfProductsManufactured = {
  process_employed: string;
  products: string;
  productID: string;
  sku_manufactured: string;
  sku_id: string;
  weight: number;
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
// const data: ListOfProductsManufactured[] = [
//   {
//     process_employed: "Mass Production1",
//     products: "Shampoo Bottle",
//     productID: "#124adv",
//     sku_manufactured: "SKU1",
//     sku_id: "#shgf37875",
//     weight: 40,
//   },
//   {
//     process_employed: "Mass Production2",
//     products: "Shampoo Bottle",
//     productID: "#124adv",
//     sku_manufactured: "SKU1",
//     sku_id: "#shgf37875",
//     weight: 40,
//   },
//   {
//     process_employed: "Mass Production3",
//     products: "Shampoo Bottle",
//     productID: "#124adv",
//     sku_manufactured: "SKU1",
//     sku_id: "#shgf37875",
//     weight: 40,
//   },
//   {
//     process_employed: "Mass Production4",
//     products: "Shampoo Bottle",
//     productID: "#124adv",
//     sku_manufactured: "SKU1",
//     sku_id: "#shgf37875",
//     weight: 40,
//   },
//   {
//     process_employed: "Mass Production5",
//     products: "Shampoo Bottle",
//     productID: "#124adv",
//     sku_manufactured: "SKU1",
//     sku_id: "#shgf37875",
//     weight: 40,
//   },
//   {
//     process_employed: "Mass Production6",
//     products: "Shampoo Bottle",
//     productID: "#124adv",
//     sku_manufactured: "SKU1",
//     sku_id: "#shgf37875",
//     weight: 40,
//   },
//   {
//     process_employed: "Mass Production7",
//     products: "Shampoo Bottle",
//     productID: "#124adv",
//     sku_manufactured: "SKU1",
//     sku_id: "#shgf37875",
//     weight: 40,
//   },
//   {
//     process_employed: "Mass Production8",
//     products: "Shampoo Bottle",
//     productID: "#124adv",
//     sku_manufactured: "SKU1",
//     sku_id: "#shgf37875",
//     weight: 40,
//   },
// ];
interface TableProps {
  tableData: any;
}
const ProductionTable: React.FC<TableProps> = ({ tableData }) => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState<ListOfProductsManufactured[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [fetchData] = useGetGhgProductionDetailsLazyQuery();
  // const [fetchDataImportHistoryList] = useGetDataImportHistoryLazyQuery();

  //should be memoized or stable

  const columns = useMemo<MRT_ColumnDef<ListOfProductsManufactured>[]>(
    () => [
      {
        accessorKey: "process_employed",
        header: "Processes Employed",
        size: 150,
      },
      {
        accessorKey: "products",
        header: "Products",
        size: 100,
      },
      {
        accessorKey: "productID",
        header: "Product ID",
        minSize: 100,
        maxSize: 300,
        size: 200,
      },
      {
        accessorKey: "sku_manufactured",
        header: "SKU Manufactured",
      },
      {
        accessorKey: "sku_id",
        header: "SKU ID",
      },
      {
        accessorKey: "weight",
        header: "Weight",
      },
    ],
    []
  );
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  useEffect(() => {
    const fetchDataFn = async () => {
      let activityFilter: object = {};
      if (columnFilters?.length > 0 || !!globalFilter) {
        let process_employed = columnFilters.filter(
          (d) => d.id === "process_employed"
        )[0]?.value as string;
        let products = columnFilters.filter((d) => d.id === "products")[0]
          ?.value as string;
        let Product_ID = columnFilters.filter((d) => d.id === "productID")[0]
          ?.value as string;
        let SKUs_Manufactured = columnFilters.filter(
          (d: any) => d.id === "sku_manufactured"
        )[0]?.value as string;
        let SKU_ID = columnFilters.filter((d) => d.id === "sku_id")[0]
          ?.value as string;
        let Total_Weight = columnFilters.filter((d) => d.id === "weight")[0]
          ?.value as number;
        let isValueNumeric = false;
        if (!isNaN(Total_Weight)) {
          isValueNumeric = true;
        }

        let Total_Weight_global = globalFilter;
        let isValueNumeric_global = false;
        if (!isNaN(Total_Weight_global as unknown as number)) {
          isValueNumeric_global = true;
        }

        activityFilter = {
          _and: {
            // For Section column filter
            ...(!!process_employed &&
              process_employed !== "" && {
                ...{
                  Processes_Employed: {
                    _cast: {
                      String: { _ilike: `%${process_employed.trim()}%` },
                    },
                  },
                },
              }),
            // For Filename column filter
            ...(!!products &&
              products !== "" && {
                ...{
                  Products_Manufactured_This_Month: {
                    _ilike: `%${products.trim()}%`,
                  },
                },
              }),
            ...(!!Product_ID &&
              Product_ID !== "" && {
                ...{ Product_ID: { _ilike: `%${Product_ID.trim()}%` } },
              }),
            // For Full address column filter
            ...(!!SKUs_Manufactured &&
              SKUs_Manufactured !== "" && {
                ...{
                  SKUs_Manufactured: {
                    _ilike: `%${SKUs_Manufactured.trim()}%`,
                  },
                },
              }),
            // For Uploaded by column filter
            ...(!!SKU_ID &&
              SKU_ID !== "" && {
                ...{
                  SKU_ID: { _ilike: `%${SKU_ID.trim()}%` },
                },
              }),
            // For Import method column filter
            ...(!!Total_Weight && {
              ...{
                Total_Weight: {
                  _eq: isValueNumeric ? Number(`${Total_Weight}`) : 0,
                },
              },
            }),

            // For Global search
            ...(!!globalFilter &&
              globalFilter !== "" && {
                _or: [
                  {
                    Processes_Employed: {
                      _cast: {
                        String: { _ilike: `%${globalFilter.trim()}%` },
                      },
                    },
                  },
                  {
                    Products_Manufactured_This_Month: {
                      _ilike: `%${globalFilter.trim()}%`,
                    },
                  },
                  {
                    Product_ID: { _ilike: `%${globalFilter.trim()}%` },
                  },
                  {
                    SKUs_Manufactured: { _ilike: `%${globalFilter.trim()}%` },
                  },
                  {
                    SKU_ID: { _ilike: `%${globalFilter.trim()}%` },
                  },
                  isValueNumeric_global === true
                    ? {
                        Total_Weight: { _eq: Number(`${globalFilter.trim()}`) },
                      }
                    : {
                        Product_ID: { _ilike: `%${globalFilter.trim()}%` },
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
        if (sort.id === "process_employed") {
          orderBy = {
            process_employed: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "products") {
          orderBy = {
            Products_Manufactured_This_Month: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "productID") {
          orderBy = { Product_ID: desc === true ? "desc" : "asc" };
        }

        if (sort.id === "skus_manufactured") {
          orderBy = {
            SKUs_Manufactured: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "sku_id") {
          orderBy = {
            SKU_ID: desc === true ? "desc" : "asc",
          };
        }
        if (sort.id === "weight") {
          orderBy = {
            Total_Weight: desc === true ? "desc" : "asc",
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
            const GHGProductionDetails: any = [];
            response?.data?.GHGProductionDetails?.map((dbDetail: any) => {
              GHGProductionDetails.push({
                process_employed: dbDetail?.Processes_Employed[0],
                productID: dbDetail?.Product_ID,
                products: dbDetail?.Products_Manufactured_This_Month,
                sku_manufactured: dbDetail?.SKUs_Manufactured,
                sku_id: dbDetail?.SKU_ID,
                weight: dbDetail?.Total_Weight,
              });
            });
            setData(GHGProductionDetails);
            setRowCount(response?.data?.totalCount?.aggregate?.count ?? 0);
          }
        });
      } catch (error) {
        console.error(error);
        return;
      }
    };
    fetchDataFn();
  }, [
    columnFilters, //refetch when column filters change
    globalFilter, //refetch when global filter changes
    pagination.pageIndex, //refetch when page index changes
    pagination.pageSize, //refetch when page size changes
    sorting, //refetch when sorting changes
  ]);

  const table = useMantineReactTable({
    renderTopToolbarCustomActions: () => (
      <Group className="sora-font " pt={6} gap={10} mt={0}>
        <Text
          fw="600"
          c="#FFA93C"
          m="0"
          classNames={{
            root: `${classes.textFontSize}`,
          }}
        >
          List of Products Manufactured
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
    getRowId: (row) => row.process_employed, //give each row a more useful id
    mantineTableBodyRowProps: ({ row }) => ({
      //add onClick to row to select upon clicking anywhere in the row
      onClick: row.getToggleSelectedHandler(),
      style: { cursor: "pointer" },
    }),
    onRowSelectionChange: setRowSelection, //connect internal row selection state to your own
    state: { rowSelection }, //pass our managed row selection state to the table to use
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
          width: "max-content" + "!important",
          minWidth: "max-content" + "!important",
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

export default ProductionTable;
