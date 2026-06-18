import { Accordion, Stack, Text } from "@mantine/core";

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    isOpen: boolean;
    title: string;
  };
  display: string;
  displayOptions: {};
  children: JSX.Element;
};
const GroupAccordian = ({
  fieldOptions,
  interfaceOptions,
  children,
}: Props) => {
  return (
    <Stack spacing={3}>
      <Accordion variant="contained" defaultValue="customization">
        <Accordion.Item value={interfaceOptions?.title}>
          <Accordion.Control>{interfaceOptions?.title}</Accordion.Control>
          <Accordion.Panel>{children}</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Text size="xs" color="red">
        Red text required
      </Text>
    </Stack>
  );
};
export default GroupAccordian;
