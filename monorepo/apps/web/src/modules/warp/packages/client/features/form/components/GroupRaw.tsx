import { Box, SimpleGrid, Stack } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { Children, ReactNode } from "react";

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
  children: ReactNode;
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    horizontal: boolean;
    spacing: number;
    columns: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
    };
  };
  display: string;
  displayOptions: object;
};
const GroupRaw = ({
  children,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Box>
      {interfaceOptions?.horizontal ? (
        <SimpleGrid
          cols={{
            xs: interfaceOptions?.columns?.xs,
            sm: interfaceOptions?.columns?.sm,
            md: interfaceOptions?.columns?.md,
            lg: interfaceOptions?.columns?.lg,
          }}
          spacing={interfaceOptions?.spacing}
        >
          {Children.map(children, (data, index) => (
            <div key={index}>{data}</div>
          ))}
        </SimpleGrid>
      ) : (
        <Stack>
          {Children.map(children, (data, index) => (
            <div key={index}>{data}</div>
          ))}
        </Stack>
      )}
    </Box>
  );
};
export default GroupRaw;
