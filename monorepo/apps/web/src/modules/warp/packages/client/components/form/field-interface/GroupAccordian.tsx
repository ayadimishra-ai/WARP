import { Accordion, Stack, Text } from "@mantine/core";
import { ReactNode } from "react";

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
  children: ReactNode;
};
const GroupAccordian = ({
  fieldOptions,
  interfaceOptions,
  children,
}: Props) => {
  return (
    <Stack gap={3}>
      <Accordion variant="contained" defaultValue="customization">
        <Accordion.Item value={interfaceOptions?.title}>
          <Accordion.Control>{interfaceOptions?.title}</Accordion.Control>
          <Accordion.Panel>{children}</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Text size="xs" c="red">
        Red text required
      </Text>
    </Stack>
  );
};
export default GroupAccordian;
