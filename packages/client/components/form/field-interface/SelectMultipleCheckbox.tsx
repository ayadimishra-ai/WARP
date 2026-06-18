import { Box, Checkbox } from "@mantine/core";
import { useState } from "react";

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    placeholder: string;
    allowNoSelection: boolean;
    choices: { label: string; value: string }[];
  };
  display: string;
  displayOptions: {
    orientation: "horizontal" | "vertical";
  };
};
const SelectMultipleCheckbox = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Box>
      {fieldOptions?.enable && (
        <Checkbox.Group
          label={interfaceOptions?.placeholder}
          error="checkbox is required"
          withAsterisk={fieldOptions?.required}
          value={value}
          onChange={setValue}
          orientation={displayOptions?.orientation}
          classNames={{ label: "labelStyle", error: "mantine-Checkbox-error" }}
        >
          <Checkbox
            disabled={fieldOptions?.readonly}
            value="react"
            label="React"
          />
          <Checkbox
            disabled={fieldOptions?.readonly}
            value="svelte"
            label="Svelte"
          />
          <Checkbox
            disabled={fieldOptions?.readonly}
            value="ng"
            label="Angular"
          />
          <Checkbox disabled={fieldOptions?.readonly} value="vue" label="Vue" />
        </Checkbox.Group>
      )}
    </Box>
  );
};
export default SelectMultipleCheckbox;
