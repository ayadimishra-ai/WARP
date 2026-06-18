import { Box, createStyles, SimpleGrid, Stack } from "@mantine/core";

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
          cols={3}
          breakpoints={[
            {
              maxWidth: "lg",
              cols: interfaceOptions?.columns?.lg,
              spacing: interfaceOptions?.spacing,
            },
            {
              maxWidth: "md",
              cols: interfaceOptions?.columns?.md,
              spacing: interfaceOptions?.spacing,
            },
            {
              maxWidth: "sm",
              cols: interfaceOptions?.columns?.sm,
              spacing: interfaceOptions?.spacing,
            },
            {
              maxWidth: "xs",
              cols: interfaceOptions?.columns?.xs,
              spacing: interfaceOptions?.spacing,
            },
          ]}
        >
          {children.props.children.map((data: any, index: string) => (
            <div>{data}</div>
          ))}
        </SimpleGrid>
      ) : (
        <Stack>
          {children.props.children.map((data: any, index: string) => (
            <div>{data}</div>
          ))}
        </Stack>
      )}
    </Box>
  );
};
export default GroupRaw;
