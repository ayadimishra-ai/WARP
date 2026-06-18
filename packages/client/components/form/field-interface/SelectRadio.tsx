import { Box, Radio } from "@mantine/core";
type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    placeholder: string;
    allowNoSelection: boolean;
    choices: any;
  };
  display: string;
  displayOptions: {
    orientation: "horizontal" | "vertical";
  };
};
const SelectRadio = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Box>
      {fieldOptions?.enable && (
        <Radio.Group
          label={interfaceOptions?.placeholder}
          error="Radio is required"
          withAsterisk={fieldOptions?.required}
          orientation={displayOptions?.orientation}
          classNames={{ label: "labelStyle", error: "mantine-Radio-error" }}
        >
          <Radio
            disabled={fieldOptions?.readonly}
            value="react"
            label="React"
          />
          <Radio
            disabled={fieldOptions?.readonly}
            value="svelte"
            label="Svelte"
          />
          <Radio disabled={fieldOptions?.readonly} value="ng" label="Angular" />
          <Radio disabled={fieldOptions?.readonly} value="vue" label="Vue" />
        </Radio.Group>
      )}
    </Box>
  );
};
export default SelectRadio;
