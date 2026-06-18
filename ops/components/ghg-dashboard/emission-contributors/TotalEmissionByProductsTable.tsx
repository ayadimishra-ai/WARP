import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Box,
  createTheme,
  Divider,
  Flex,
  Menu,
  Text,
} from "@mantine/core";
import { IconDownload, IconSearch } from "@tabler/icons-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import _ from "lodash";
import {
  MantineReactTable,
  MRT_TablePagination,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Icons,
  type MRT_Row,
} from "mantine-react-table";
import { useEffect, useMemo, useState } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { EmissionContributor } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import { activeState } from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import ChartHeadBlock from "../common/ChartHeadBlock";
import { formattedNumber } from "../common/NumberFormat";
import classes from "../critical-factors/CSS.module.css";
type Products = {
  id: number;
  name: string;
  supplyCategory: string;
  emission: number;
  contribution: number;
  change: string;
};
const faIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => (
    <FontAwesomeIcon width={6.5} icon={faSort} {...props} />
  ),
  IconSortAscending: (props: any) => (
    <FontAwesomeIcon width={6.5} icon={faSortUp} {...props} />
  ),
  IconSortDescending: (props: any) => (
    <FontAwesomeIcon width={6.5} icon={faSortDown} {...props} />
  ),
};
interface Props {
  isDownload?: boolean;
}
//const TotalEmissionProductsTable: React.FC<Props> = ({ isDownload }) => {
function TotalEmissionProductsTable(props: any) {
  const [isMonthly, setMonthlyClick] = useState<boolean>(false);
  const [isYearly, setYearlyClick] = useState<boolean>(false);
  const [isQuarterly, setIsQuarterly] = useState<boolean>(true);
  const [isActive, setisActive] = useState<activeState>(
    activeState.isQuarterly
  );
  const [data, setTableData] = useState<Array<Products>>([]);
  const [totalEmissionValueByProducts, setTotalEmissionValueByProducts] =
    useState<number>(0);
  const getStoreData = useDashboardStore((store: any) => store.current);

  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, //customize the default page size
  });
  const handleQuarterly = () => {
    setIsQuarterly(true);
    setYearlyClick(false);
    setMonthlyClick(false);
  };

  const handleYearly = () => {
    setYearlyClick(true);
    setIsQuarterly(false);
    setMonthlyClick(false);
  };

  const handleMonthly = () => {
    setYearlyClick(false);
    setIsQuarterly(false);
    setMonthlyClick(true);
  };

  useEffect(() => {
    const emissionByProducts =
      getStoreData?.currentYear?.emissionByProducts ?? [];

    const totalWeight = emissionByProducts.reduce(
      (acc: number, m: any) => acc + m?.kpi_weight || 0,
      0
    );

    const totalEmission =
      getStoreData?.currentYear?.main?.reduce(
        (acc: number, m: any) => acc + m.kpi_em_Total_Emission,
        0
      ) ?? 0;

    const totalEmissionByProds =
      emissionByProducts?.reduce(
        (acc: number, m: any) =>
          acc + totalEmission * (m.kpi_weight / totalWeight),
        0
      ) ?? 0;

    const createMainData: any = _(emissionByProducts)
      .groupBy((item) => `${item.product_id}-${item.product_name}`)
      .map((items, key) => {
        return {
          id: items[0].product_id,
          name: items[0].product_name,
          supplyCategory: items[0].brand_name,
          emission: (
            totalEmission *
            (_.sumBy(items, "kpi_weight") / totalWeight)
          ).toFixed(1),
          contribution: (
            (_.sumBy(items, "kpi_weight") / totalWeight) *
            100
          ).toFixed(2),
          total_weight: _.sumBy(items, "kpi_weight"),
        };
      })
      .value();

    setTotalEmissionValueByProducts(totalEmissionByProds);
    setTableData(createMainData);
  }, [isYearly, isMonthly, isQuarterly, getStoreData]);

  const handleExportRows = (
    rows: MRT_Row<Products>[],
    exportType: "pdf" | "csv" = "pdf"
  ) => {
    const accessorKeys = columns.map((c) => c.accessorKey);
    const columnHeaders = columns.map((c) => c.header);

    const formatCSVValue = (value: any) =>
      value !== undefined ? `${String(value).replace(/"/g, '""')}` : "";

    const getTableData = (rows: MRT_Row<Products>[]) =>
      rows.map((row, index) => [
        index + 1, // Serial number
        ...accessorKeys.map((key) =>
          formatCSVValue(row.original[key as keyof Products])
        ),
      ]);

    const title = "Contribution in Total Emission by Products";
    const titleText = unit
      ? `${title} (in ${unit === "tco2e" ? "tCO2e" : unit})`
      : title;

    const generatePDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(11);
      doc.text(titleText, 14, 15);
      autoTable(doc, {
        startY: 18,
        head: [["SN", ...columnHeaders]], // Include serial number in PDF
        body: getTableData(rows),
        headStyles: {
          fillColor: "#2c9e92",
        },
        styles: {
          fontSize: 9,
        },
      });
      doc.save(`${title}.pdf`);
    };

    const cleanAndCapitalizeHeader = (header: string): string => {
      const words = header.split(" ");

      return words
        .map((word) => {
          return word.toUpperCase();
        })
        .join(" ")
        .replace(/tco2e/gi, "tCO2e"); // Ensure tCO2e is correctly formatted
    };

    const generateCSV = () => {
      const cleanedHeaders = [
        "SN",
        ...columnHeaders.map(cleanAndCapitalizeHeader),
      ]; // Include serial number in CSV header
      const csvData = getTableData(rows);
      const csvContentArray = [
        cleanedHeaders.join(","), // CSV header
        ...csvData.map((row) => row.join(",")), // CSV rows
      ].join("\n");
      const blob = new Blob([csvContentArray], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Revoke the object URL to free up memory
    };

    // Trigger export based on type
    exportType === "pdf" ? generatePDF() : generateCSV();
  };

  const columns = useMemo<MRT_ColumnDef<Products>[]>(
    () => [
      {
        accessorKey: "id", //normal accessorKey
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "PRODUCT NAME",
      },
      {
        accessorKey: "supplyCategory",
        header: "BRANDS",
      },
      {
        accessorKey: "emission",
        header: "EMISSION (tCO2e)",
      },
      {
        accessorKey: "contribution",
        header: "CONTRIBUTION (%)",
      },
      // {
      //   accessorKey: "change",
      //   header: "% CHANGE",
      //   Cell: ({ cell }) => (
      //     <Text
      //       size="12px"
      //       style={() => ({
      //         color: cell.getValue<number>() > 0 ? "red" : "green",
      //       })}
      //     >
      //       {cell.getValue<number>() > 0 ? "+" : "-"}
      //       {Math.abs(cell.getValue<number>())}
      //     </Text>
      //   ),
      // },
    ],
    []
  );

  const table = useMantineReactTable({
    enablePagination: !props.isDownload,
    columns,
    icons: faIcons,
    data,
    onPaginationChange: setPagination, //hoist pagination state to your state when it changes internally
    state: { pagination }, //pass the pagination state to the table
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableTopToolbar: true,
    enableHiding: false,
    enableRowSelection: false,
    initialState: { showColumnFilters: true, showGlobalFilter: true },
    //columnFilterDisplayMode: "popover",
    //manualFiltering: true,
    //manualPagination: true,
    paginationDisplayMode: "pages",
    enableGlobalFilter: true,
    enableFilterMatchHighlighting: false,
    enableFilters: true,
    enableSorting: true,
    //manualSorting: true,
    enableRowNumbers: true,
    enableColumnFilters: false,
    mantinePaperProps: { className: classes.emissionTableStyling },
    // mantineTopToolbarProps: ({ table }) => ({
    //   style: {
    //     display: "flex",
    //     justifyDontent: "end",
    //     alignItems: "center",
    //     flexDirection: "row-reverse",
    //   },
    // }),
    mantineProgressProps: ({ isTopToolbar }) => ({
      color: "#72D0C6",
      sx: { display: isTopToolbar ? "block" : "none" }, //only show top toolbar progress bar
      value: 100, //show precise real progress value if you so desire
    }),
    mantineTableContainerProps: {
      style: {
        padding: 0,
      },
    },
    mantinePaginationProps: {
      style: {
        "--pagination-control-fz": "10px",
        "--pagination-active-color": "#FF9907",
        "--pagination-active-bg": "#fff",
        "--pagination-bg": "#F7F9FB",
      },
    },
    mantineBottomToolbarProps: {
      style: {
        Text: {
          fontSize: "1px" + "!important",
        },
      },
    },
    // mantineTableProps: ({ table }) => ({
    //   striped: true,
    // }),
    mantineSearchTextInputProps: {
      placeholder: "Enter Product ID, Name",
      color: "#000000",
      size: "xs",
      leftSection: <IconSearch size="20px" color="#000000" />,
      pr: "xs",
    },
    mantineTableHeadCellProps: {
      style: {
        backgroundColor: "#7C8D9E" + "!important",
        color: "#fff" + "!important",
        height: 30,
        fontSize: "10px",
      },
    },

    renderTopToolbarCustomActions: ({ table }) => (
      <Flex gap="sm">
        <Text fz={14} pos="absolute" left={0} bottom={-2}>
          <Text span fw={600} fz={14}>
            {data ? data.length : 0}
          </Text>{" "}
          Products | Total Emissions:{" "}
          <Text span fw={600} fz={14}>
            {formattedNumber(totalEmissionValueByProducts, 1)}
          </Text>{" "}
          {unit === "tco2e" ? "tCO2e" : unit}
        </Text>
        <Menu shadow="md" width={130} position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="transparent"
              color="#101828"
              size="1.875rem"
              disabled={table.getPrePaginationRowModel().rows.length === 0}
            >
              <IconDownload size="20px" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown className="pdfCsvDownload">
            <Menu.Label>Download as</Menu.Label>
            <Divider />
            <Menu.Item
              onClick={() =>
                handleExportRows(table.getPrePaginationRowModel().rows, "pdf")
              }
            >
              PDF
            </Menu.Item>
            <Menu.Item
              onClick={() =>
                handleExportRows(table.getPrePaginationRowModel().rows, "csv")
              }
            >
              CSV
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    ),

    renderBottomToolbar: ({ table }) => (
      <Flex gap="sm">
        {table.getPrePaginationRowModel().rows.length != 0 && (
          <MRT_TablePagination table={table} />
        )}
      </Flex>
    ),

    displayColumnDefOptions: {
      "mrt-row-numbers": { Header: "SN" },
      "mrt-row-actions": { size: 50 },
    },
  });

  const theme = createTheme({
    components: {
      Text: {
        styles: {
          root: {
            fontSize: "12px",
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
            maxHeight: "30px !important",
            backgroundColor: "#7C8D9E" + "!important",
            color: "#fff" + "!important",
          },
          tr: {
            height: "26px" + "!important",
          },
          td: {
            height: "26px" + "!important",
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
          input: {
            "--input-bd-focus": "transparent",
            borderRadius: 20,
          },
        },
      },
      ActionIcon: {
        styles: {},
      },
      Pagination: {
        styles: {
          control: {
            borderColor: "#fff",
            fontSize: "12px" + "!important",
          },
          root: {
            "--pagination-active-color": "#fff",
            "--pagination-active-bg": "#72D0C6",
            "--pagination-bg": "#F7F9FB",
            "--pagination-control-radius": "20px",
          },
        },
      },
    },
  });

  const { currentYear } = getStoreData || {};
  const { main: mainArray } = currentYear || {};
  const [main] = mainArray || [];
  const { kpi_em_uom: unit = "tco2e" } = main || {};

  // This code is to get description and popover content from global master table
  // Data will be from store
  let totalEmissionDescription: string = "",
    totalEmissionPopoverContent: string = "";

  const { kpiDescription } = dashboardDescription || {};
  const { emission_contributors } = kpiDescription || {};
  if (emission_contributors && emission_contributors.length > 0) {
    // For Contribution in Total Emission by Products
    const totalEmissionSnapshot: EmissionContributor | undefined =
      emission_contributors.find(
        (desc: EmissionContributor) =>
          desc.category === "Contribution in Total Emission by Products"
      );
    if (totalEmissionSnapshot) {
      const { description: desc = "", info = "" } = totalEmissionSnapshot || {};
      totalEmissionDescription = desc;
      totalEmissionPopoverContent = info;
    }
  }

  return (
    <Box className="DashboardTable">
      <ChartHeadBlock
        title="Contribution in Total Emission by Products"
        unit={`in ${unit}`}
        description={totalEmissionDescription}
        popoverContent={totalEmissionPopoverContent}
        tabs={false}
        yearlyData={handleYearly}
        quarterlyData={handleQuarterly}
        monthlyData={handleMonthly}
        isShow={isActive}
        istable
        singleBlock
      />
      <MantineReactTable table={table} />
    </Box>
  );
}

export default TotalEmissionProductsTable;
