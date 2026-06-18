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
  Textarea,
} from "@mantine/core";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Icons,
} from "mantine-react-table";
import { useMemo } from "react";
import TrashIcon from "../icons/TrashIcon";
import classes from "./CSS.module.css";
config.autoAddCss = false;
type ListOfCompaniesThatProvideGridPower = {
  type_of_fuel_used: string;
  quantity_of_fuel_consumed: number;
  quality_of_fuel: string;
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
//nested data is ok, see accessorKeys in ColumnDef below
const data: ListOfCompaniesThatProvideGridPower[] = [
  {
    type_of_fuel_used: "Coal",
    quantity_of_fuel_consumed: 1999,
    quality_of_fuel: "High-Grade",
    unit_of_energy_generated: 1000,
  },
  {
    type_of_fuel_used: "Coal",
    quantity_of_fuel_consumed: 1999,
    quality_of_fuel: "High-Grade",
    unit_of_energy_generated: 1000,
  },
  {
    type_of_fuel_used: "Coal",
    quantity_of_fuel_consumed: 1999,
    quality_of_fuel: "High-Grade",
    unit_of_energy_generated: 1000,
  },
  {
    type_of_fuel_used: "Coal",
    quantity_of_fuel_consumed: 1999,
    quality_of_fuel: "High-Grade",
    unit_of_energy_generated: 1000,
  },
  {
    type_of_fuel_used: "Coal",
    quantity_of_fuel_consumed: 1999,
    quality_of_fuel: "High-Grade",
    unit_of_energy_generated: 1000,
  },
  {
    type_of_fuel_used: "Coal",
    quantity_of_fuel_consumed: 1999,
    quality_of_fuel: "High-Grade",
    unit_of_energy_generated: 1000,
  },
  {
    type_of_fuel_used: "Coal",
    quantity_of_fuel_consumed: 1999,
    quality_of_fuel: "High-Grade",
    unit_of_energy_generated: 1000,
  },
  {
    type_of_fuel_used: "Coal",
    quantity_of_fuel_consumed: 1999,
    quality_of_fuel: "High-Grade",
    unit_of_energy_generated: 1000,
  },
];

const Input_EnergyCaptivePowerDetailsNonRenewable = () => {
  //should be memoized or stable

  const columns = useMemo<MRT_ColumnDef<ListOfCompaniesThatProvideGridPower>[]>(
    () => [
      {
        accessorKey: "type_of_fuel_used",
        header: "Type of Fuel Used",
      },
      {
        accessorKey: "quantity_of_fuel_consumed",
        header: "Quantity of Fuel Consumed",
      },
      {
        accessorKey: "quality_of_fuel",
        header: "Quality of Fuel",
        Cell: ({ cell }) => <Textarea placeholder="Textarea" autosize />,
      },
      {
        accessorKey: "unit_of_energy_generated",
        header: "Unit of Energy Generated",
        Cell: ({ cell }) => <Textarea placeholder="Textarea" autosize />,
      },
    ],
    []
  );

  const table = useMantineReactTable({
    renderTopToolbarCustomActions: () => (
      <Group className="sora-font " pt={6} gap={10} mt={5}>
        <Text
          classNames={{
            root: `${classes.textFontSize}`,
          }}
          fw="600"
          c="#FFA93C"
          m="0"
        >
          Captive Power Generated using Different Sources
        </Text>
        <Card bg={"#E9525B"} p="4" radius="xs">
          <h6
            className="smallFont"
            style={{ margin: 0, color: "#fff", lineHeight: "15px" }}
          >
            Non-Renewable
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
    displayColumnDefOptions: {
      "mrt-row-actions": { size: 50, Header: "" },
    },
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => (
      <ActionIcon>
        <TrashIcon />
      </ActionIcon>
    ),
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

export default Input_EnergyCaptivePowerDetailsNonRenewable;
