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
import { EmissionByCriticalFactor } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/types";
import { activeState } from "~/lib/ghg-dashboard/common-ghg-dashboard.service";
import ChartHeadBlock from "../common/ChartHeadBlock";
import { formattedNumber } from "../common/NumberFormat";
import classes from "./CSS.module.css";
type SupplierTable = {
  srNo?: number;
  id?: number;
  name: string;
  supplyCategory: string;
  emission: number;
  transportEmission: number;
  totalEmission: number;
  contribution: number;
  // change?: string;
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

interface EmissionTableProps {
  selectedShowData: any;
  emissionData: any;
  isDownload: any;
  unit: string;
}
enum GlobalFilters {
  THREEMONTHS,
  SIXMONTHS,
  THISQTR,
  THISYEAR,
  LASTYEAR,
  FROMBASELINE,
}
type TGlobalFilters = {
  duration: GlobalFilters;
};

function ScopeThreeEmissionTable({
  selectedShowData,
  emissionData,
  isDownload,
  unit,
}: EmissionTableProps) {
  const [isMonthly, setMonthlyClick] = useState<boolean>(false);
  const [isYearly, setYearlyClick] = useState<boolean>(false);
  const [isQuarterly, setIsQuarterly] = useState<boolean>(true);
  const [data, setTableData] = useState<Array<SupplierTable>>([]);
  const [isActive, setisActive] = useState<activeState>(
    activeState.isQuarterly
  );
  const [globalFilters, setGlobalFilters] = useState<TGlobalFilters>({
    duration: GlobalFilters.THISYEAR,
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, //customize the default page size
  });
  const getStoreData = useDashboardStore((store) => store.current);
  const dashboardDescription = useDashboardStore(
    (store) => store.dashboardDescription
  );

  const { totalEmissionValueBySuppliers = 0 } = emissionData || {};

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
    setTableData(calculateMonthlyData());
  }, [globalFilters, getStoreData]);

  const calculateMonthlyData = () => {
    const monthlyDataOutput = [];
    const monthlyData = emissionData?.contributionFromSuppliersTable;
    for (let i = 0; i < monthlyData?.length; i++) {
      const monthData = monthlyData[i];
      let change = (
        ((monthData?.emission - monthData?.prevYearChange) /
          monthData?.prevYearChange) *
        100
      )
        .toFixed(2)
        .toString();
      monthlyDataOutput.push({
        id: monthData?.id,
        supplyCategory: monthData?.supplyCategory,
        name: monthData?.name,
        emission: monthData?.emission,
        transportEmission: monthData?.transportEmission,
        contribution: monthData?.contribution,
        totalEmission: monthData?.totalEmission,
      });
    }
    return monthlyDataOutput.length === 0
      ? []
      : monthlyDataOutput.sort((a, b) => b.contribution - a.contribution);
  };

  const handleExportRows = (
    rows: MRT_Row<SupplierTable>[],
    exportType: "pdf" | "csv" = "pdf"
  ) => {
    const accessorKeys = columns.map((c) => c.accessorKey);
    const columnHeaders = columns.map((c) => c.header);

    const formatCSVValue = (value: any) =>
      value !== undefined ? `${String(value).replace(/"/g, '""')}` : "";

    const getTableData = (rows: MRT_Row<SupplierTable>[]) =>
      rows.map((row, index) => [
        index + 1, // Serial number
        ...accessorKeys.map((key) =>
          formatCSVValue(row.original[key as keyof SupplierTable])
        ),
      ]);

    const title = "Scope 3 Emission Details Contribution from Suppliers";
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

  const columns = useMemo<MRT_ColumnDef<SupplierTable>[]>(
    () => [
      {
        accessorKey: "id", //normal accessorKey
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "NAME",
      },
      {
        accessorKey: "supplyCategory",
        header: "SUPPLY CATEGORY",
      },
      {
        accessorKey: "emission",
        header: "MATERIAL EMISSION (tCO2e)",
      },
      {
        accessorKey: "transportEmission",
        header: "TRANSPORT EMISSION (tCO2e)",
      },
      {
        accessorKey: "totalEmission",
        header: "TOTAL EMISSION (tCO2e)",
      },
      {
        accessorKey: "contribution",
        header: "CONTRIBUTION (%)",
      },
      // {
      //   accessorKey: "change",
      //   header: "% CHANGE",
      //   Cell: ({ cell }) => (
      //     <>
      //       {console.log("cell value=", cell.getValue<number>())}
      //       <Text
      //         size="12px"
      //         style={() => ({
      //           color: cell.getValue<number>() > 0 ? "red" : "green",
      //         })}
      //       >
      //         {cell.getValue<number>() > 0 ? "+" : "-"}
      //         {Math.abs(cell.getValue<number>())}
      //       </Text>
      //     </>
      //   ),
      // },
    ],
    []
  );

  const table = useMantineReactTable({
    enablePagination: !isDownload,
    columns,
    icons: faIcons,
    data,
    onPaginationChange: setPagination, //hoist pagination state to your state when it changes internally
    state: { pagination }, //pass the pagination state to the table
    enableRowNumbers: true,
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
    //enableRowNumbers: true,
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
      className: classes.PaginationStyle,
      style: {
        "--pagination-control-fz": "10px",
        "--pagination-active-color": "#FF9907",
        "--pagination-active-bg": "#fff",
        "--pagination-bg": "#F7F9FB",
      },
    },
    // mantineTableProps: ({ table }) => ({
    //   striped: true,
    // }),
    mantineSearchTextInputProps: {
      placeholder: "Search",
      color: "#000000",
      size: "xs",
      leftSection: <IconSearch size="20px" color="#000000" />,
      pr: "xs",
    },
    mantineTableHeadCellProps: ({ table }) => ({
      style: {
        backgroundColor: "#7C8D9E" + "!important",
        color: "#fff" + "!important",
        height: 30,
        fontSize: "10px",
      },
    }),
    renderTopToolbarCustomActions: ({ table }) => (
      <Flex gap="sm">
        <Text fz={14} pos="absolute" left={0} bottom={-2}>
          <Text span fw={600} fz={14}>
            {data ? data.length : 0}
          </Text>{" "}
          Suppliers | Total Emissions:{" "}
          <Text span fw={600} fz={14}>
            {formattedNumber(totalEmissionValueBySuppliers, 1)}
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

  // This code is to get description and popover content from global master table
  // Data will be from store
  let totalEmissionDescription: string = "",
    totalEmissionPopoverContent: string = "";

  const { kpiDescription } = dashboardDescription || {};
  const { emission_by_critical_factors } = kpiDescription || {};
  if (emission_by_critical_factors && emission_by_critical_factors.length > 0) {
    // For Scope 3 Emission Details Contribution from Suppliers
    const totalEmissionSnapshot: EmissionByCriticalFactor | undefined =
      emission_by_critical_factors.find(
        (desc: EmissionByCriticalFactor) =>
          desc.category ===
          "Scope 3 Emission Details Contribution from Suppliers"
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
        title="Scope 3 Emission Details Contribution from Suppliers"
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

export default ScopeThreeEmissionTable;
