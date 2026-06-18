import { Box, createStyles } from "@mantine/core";

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
  children: JSX.Element;
};
const GroupGridRow = ({ children }: Props) => {
  return <Box>{children}</Box>;
};
export default GroupGridRow;
