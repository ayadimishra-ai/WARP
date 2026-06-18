import { Badge, Group, Stack, Text } from "@mantine/core";
type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    api: { url: string; configureBody: string };
    presets: string[];
  };
  display: string;
  displayOptions: object;
};
const Badges = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Stack spacing={3}>
      <Group spacing={10}>
        {fieldOptions?.enable &&
          ["Tag1", "Tag2", "Tag3"].map((element: any, i: any) => (
            <Badge key={element} color="green" variant="filled">
              {element}
            </Badge>
          ))}
      </Group>
      <Text size="xs" color="red">
        Red text
      </Text>
    </Stack>
  );
};
export default Badges;
