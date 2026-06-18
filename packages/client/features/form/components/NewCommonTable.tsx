import { Box, Button, createStyles, Table, Text } from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";
import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons";
import { FC, PropsWithChildren } from "react";
const useStyles = createStyles((theme) => ({
  heading: {
    backgroundColor: "#F6F8FB",
    color: theme.colors.dark[9] + "!important",
    fontSize: theme.fontSizes.md + "px !important",
    padding: "10px !important",
    fontWeight: 700,
    borderBottom: "0",
    textAlign: "left",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    // whiteSpace: "nowrap",
  },
  table: {
    width: "100%",
    maxWidth: "calc(100vw - 452px)",
    overflowX: "auto",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow:
      "0px 9px 16px rgba(159, 162, 191, 0.18), 0px 2px 2px rgba(159, 162, 191, 0.32)",
  },
}));

type Props = {
  headers: Array<string>;
  sortedChildrenData: any;
};
const NewCommonTable: FC<PropsWithChildren<Props>> = ({
  headers,
  sortedChildrenData,
  children,
}) => {
  const { classes } = useStyles();
  const { ref, toggle, fullscreen } = useFullscreen();
  // Dynamic multi-level header logic
  let tableheaders: JSX.Element[] = [];

  if (sortedChildrenData) {
    // First row: GroupColumnName
    sortedChildrenData.map((item: any, index: number) => {
      tableheaders.push(
        <tr key={`group-header-row-${index}`}>
          {item.interfaceOptions.header[index].GroupColumnName.map(
            (col: any, idx: number) => (
              <th
                className={classes.heading}
                key={col.label + idx}
                rowSpan={col.rowspan || undefined}
                colSpan={col.colspan || undefined}
                style={{ textAlign: "center", width: col.width || "auto" }}
              >
                {col.label}
              </th>
            )
          )}
        </tr>
      );

      // Second row: ChildColumnName
      tableheaders.push(
        <tr key="child-header-row">
          {item.interfaceOptions.header[index].ChildColumnName.map(
            (col: any, idx: number) => (
              <th
                className={classes.heading}
                key={col.label + idx}
                rowSpan={col.rowspan || undefined}
                colSpan={col.colspan || undefined}
                style={{ textAlign: "center" }}
              >
                {col.label}
              </th>
            )
          )}
        </tr>
      );
      // Third row: SubChildColumnName
      tableheaders.push(
        <tr key="subchild-header-row">
          {item.interfaceOptions.header[index].SubChildColumnName.map(
            (col: any, idx: number) => (
              <th
                className={classes.heading}
                key={col.label + idx}
                style={{ textAlign: "center" }}
              >
                {col.label}
              </th>
            )
          )}
        </tr>
      );
    });
  }

  return (
    <>
      <Box
        ref={ref}
        className={classes.table + " " + (fullscreen ? "fullOn" : "fullOff")}
        style={{
          pointerEvents: "all",
          border: "1px solid #ced4da",
        }}
      >
        <Button mt={10} ml={10} mb={10} onClick={toggle} color="solidBtn">
          {fullscreen ? (
            <>
              <IconArrowsMinimize />
              <Text ml={5}>Click to close full view table</Text>
            </>
          ) : (
            <>
              <IconArrowsMaximize />{" "}
              <Text ml={5}>Click to full view table</Text>
            </>
          )}
        </Button>
        <Table>
          <thead>{tableheaders}</thead>
          <tbody>{children}</tbody>
        </Table>
      </Box>
    </>
  );
};
export default NewCommonTable;
