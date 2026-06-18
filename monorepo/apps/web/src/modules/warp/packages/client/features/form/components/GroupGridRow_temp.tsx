import { Box, } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { ReactElement } from "react";

const useStyles = createStyles((theme) => ({
  fullWidth: {
    alignSelf: "stretch",
  },
  group: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
}));
type Props = {
  children: ReactElement;
};
const GroupGridRow = ({ children }: Props) => {
  return <Box>{children}</Box>;
};
export default GroupGridRow;
