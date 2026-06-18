import { Divider, Stack, Text, Title } from "@mantine/core";

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    title: string;
  };
  display: string;
  displayOptions: {};
};

const PresentationDivider = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Stack gap={3}>
      <Title order={5}>{interfaceOptions?.title}</Title>
      <Divider />
      <Text size="xs" c="red">
        required
      </Text>
    </Stack>
  );
};
export default PresentationDivider;
