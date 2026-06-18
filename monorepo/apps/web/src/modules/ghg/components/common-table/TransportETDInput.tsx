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
  Radio,
  Text,
  Textarea,
} from "@mantine/core";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import {
  MantineReactTable,
  MRT_RowSelectionState,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Icons,
} from "mantine-react-table";
import { useMemo, useState } from "react";
import classes from "./CSS.module.css";
config.autoAddCss = false;
type ListOfEmployeeTravelDetailsInput = {
  employees_travelled_by: string;
  percentage_of_employees: string;
  average_daily_distance: string;
  UoM: string;
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
const data: ListOfEmployeeTravelDetailsInput[] = [
  {
    employees_travelled_by: "Company Owned Bus",
    percentage_of_employees: "",
    average_daily_distance: "",
    UoM: "",
  },
  {
    employees_travelled_by: "Company Owned Bus",
    percentage_of_employees: "",
    average_daily_distance: "",
    UoM: "",
  },
];

const ListOfEmployeeTravelDetailsTableInput = () => {
  //should be memoized or stable

  const columns = useMemo<MRT_ColumnDef<ListOfEmployeeTravelDetailsInput>[]>(
    () => [
      {
        accessorKey: "employees_travelled_by",
        header: "Employees Travelled by",
      },
      {
        accessorKey: "percentage_of_employees",
        header: "% of Employees",
        Cell: ({ cell }) => <Textarea placeholder="Enter Value" autosize />,
      },
      {
        accessorKey: "average_daily_distance",
        header: "Average Daily Distance (in Kms)",
        Cell: ({ cell }) => <Textarea placeholder="Enter Value" autosize />,
      },
      {
        accessorKey: "UoM",
        header: "UoM",
        Cell: ({ cell }) => (
          <Flex>
            <Radio.Group>
              <Group mt={0}>
                <Radio color="#72D0C6" value="km" label="km" />
                <Radio color="#72D0C6" value="mi" label="mi" />
              </Group>
            </Radio.Group>
          </Flex>
        ),
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
          Employee Travel Details
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
    getRowId: (row) => row.employees_travelled_by, //give each row a more useful id
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

export default ListOfEmployeeTravelDetailsTableInput;
