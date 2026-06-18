import { Box, Checkbox, Group, Stack } from "@mantine/core";
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
  const ChoicesWrapper = displayOptions?.orientation === "horizontal" ? Group : Stack;
  return (
    <Box>
      {fieldOptions?.enable && (
        <Checkbox.Group
          label={interfaceOptions?.placeholder}
          error="checkbox is required"
          withAsterisk={fieldOptions?.required}
          value={value}
          onChange={setValue}
          classNames={{ label: "labelStyle", error: "mantine-Checkbox-error" }}
        >
          <ChoicesWrapper gap="sm">
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
          </ChoicesWrapper>
        </Checkbox.Group>
      )}
    </Box>
  );
};
export default SelectMultipleCheckbox;
