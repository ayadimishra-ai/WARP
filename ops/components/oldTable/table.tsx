import {
  ActionIcon,
  Group,
  Paper,
  Table,
  TableTbody,
  TableTd,
  TableThead,
  TableTr,
  Text,
  useMantineTheme,
} from "@mantine/core";
import TableHeadingFilterIcon from "../icons/TableHeadingFilterIcon";
import TableSortIcon from "../icons/TableSortIcon";

export interface TableProps {
  data: any;
  tableData: any;
  tableHeadings: any;
}

const OldTables: React.FC<TableProps> = (props: any) => {
  const theme = useMantineTheme();
  const rows = props.tableData.map((element: any) => (
    <TableTr key={element.name}>
      <TableTd fw={400} fz={12} c={"#666"}>
        {element.position}
      </TableTd>
      <TableTd fw={400} fz={12} c={"#666"}>
        {element.name}
      </TableTd>
      <TableTd fw={400} fz={12} c={"#666"}>
        {element.symbol}
      </TableTd>
      <TableTd fw={400} fz={12} c={"#666"}>
        {element.mass}
      </TableTd>
      <TableTd fw={400} fz={12} c={"#666"}>
        {element.name1}
      </TableTd>
      <TableTd fw={400} fz={12} c={"#666"}>
        <Text c={theme.colors.primary[5]}>{element.symbol1}</Text>
      </TableTd>
      <TableTd fw={400} fz={12} c={"#666"}>
        {element.mass1}
      </TableTd>
    </TableTr>
  ));
  const heading = props.tableHeadings.map((element: any) => (
    <TableTd fw={600} key={element}>
      <Group gap={10}>
        <Text c={"#1A1A1A"} fw={600} fz={12}>
          {element}
        </Text>
        <Group gap={0}>
          <ActionIcon mr={-10} variant="transparent">
            <TableSortIcon />
          </ActionIcon>
          <ActionIcon variant="transparent">
            <TableHeadingFilterIcon />
          </ActionIcon>
        </Group>
      </Group>
    </TableTd>
  ));
  return (
    <Paper p={0}>
      <Table p={0} highlightOnHover withRowBorders={false}>
        <TableThead bg={"#F6F8FB"}>
          <TableTr>{heading} </TableTr>
        </TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>
    </Paper>
  );
};

export default OldTables;
