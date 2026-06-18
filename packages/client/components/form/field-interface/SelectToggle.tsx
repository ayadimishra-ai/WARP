import { Stack, Switch, Text } from "@mantine/core";
type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    onLabel: string;
    offLabel: string;
    label: string;
    size: any;
  };
  display: string;
  displayOptions: {};
};
const SelectToggle = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Stack spacing={3}>
      {fieldOptions?.enable && (
        <Switch
          onLabel={interfaceOptions?.onLabel}
          offLabel={interfaceOptions?.offLabel}
          size={interfaceOptions?.size}
          label={interfaceOptions?.label}
          disabled={fieldOptions.readonly}
          classNames={{ label: "labelStyle", error: "mantine-Switch-error" }}
        />
      )}
      <Text size="xs" color="red">
        switch error
      </Text>
    </Stack>
  );
};
export default SelectToggle;
