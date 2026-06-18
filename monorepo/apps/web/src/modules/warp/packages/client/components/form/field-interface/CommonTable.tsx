import { Box, Table } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import React, { Children, ReactElement } from "react";

const useStyles = createStyles((theme) => ({
  heading: {
    color: "#000 !important",
    fontSize: theme.fontSizes.md + "px !important",
    padding: "10px !important",
    fontWeight: 700,
    borderBottom: "2px solid #ff9e1b !important",
    borderTop: "0.5px solid #cdcdcd !important",
    backgroundColor: "#fff !important",
    textAlign: "left",
  },
  table: {
    width: "100%",
  },
}));

type Props = {
  headers: Array<string>;
  children: ReactElement;
};
const CommonTable = ({ headers, children }: Props) => {
  const { classes } = useStyles();
  const tableheaders = headers.map((element) => (
    <th className={classes.heading} key={element}>
      {element}
    </th>
  ));

  return (
    <Box className={classes.table}>
      <Table>
        <thead>
          <tr>{tableheaders}</tr>
        </thead>
        <tbody>
          {Children.map(children, (data: any, index: number) => (
            <React.Fragment key={index}>{data}</React.Fragment>
          ))}
        </tbody>
      </Table>
    </Box>
  );
};
export default CommonTable;
