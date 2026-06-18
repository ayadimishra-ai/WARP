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
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Icons,
} from "mantine-react-table";
import { useMemo } from "react";
import classes from "./CSS.module.css";
config.autoAddCss = false;
type TransportDetailsOfUpstreamActivities = {
  material_procured: string;
  supplier_of_material: string;
  supplier_location: string;
  transport_managed_by: string;
  mode_of_transport: string;
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
const data: TransportDetailsOfUpstreamActivities[] = [
  {
    material_procured: "Material 1",
    supplier_of_material: "ABC Company",
    supplier_location: "Kalyan, Mumbai",
    transport_managed_by: "XYZ Company",
    mode_of_transport: "Road",
  },
  {
    material_procured: "Material 1",
    supplier_of_material: "ABC Company",
    supplier_location: "Kalyan, Mumbai",
    transport_managed_by: "XYZ Company",
    mode_of_transport: "Road",
  },
];

const TransportDetailsOfUpstreamActivitiesTable = () => {
  //should be memoized or stable

  const columns = useMemo<
    MRT_ColumnDef<TransportDetailsOfUpstreamActivities>[]
  >(
    () => [
      {
        accessorKey: "material_procured",
        header: "Material Procured",
      },
      {
        accessorKey: "supplier_of_material",
        header: "Supplier of Material",
      },
      {
        accessorKey: "supplier_location",
        header: "Supplier Location",
      },
      {
        accessorKey: "transport_managed_by",
        header: "Transport Managed By",
      },
      {
        accessorKey: "mode_of_transport",
        header: "Mode of Transport",
      },
    ],
    []
  );

  const table = useMantineReactTable({
    renderTopToolbarCustomActions: () => (
      <Group className="sora-font " pt={6} gap={10} mt={5}>
        <h3
          style={{ fontSize: 14, fontWeight: 600, color: "#FFA93C", margin: 0 }}
        >
          Transport Details of Upstream Activities
        </h3>
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
    enableRowSelection: false,
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
    enableGlobalFilter: true,
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
            backgroundColor: "#fff",
            background: "#fff",
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

export default TransportDetailsOfUpstreamActivitiesTable;
