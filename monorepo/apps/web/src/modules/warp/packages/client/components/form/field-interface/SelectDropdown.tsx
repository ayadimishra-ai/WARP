import { Box, Select } from "@mantine/core";
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
    choices: any;
  };
  display: string;
  displayOptions: Object;
};
const SelectDropdown = ({
  fieldOptions,
  interfaceOptions,
  displayOptions,
  display,
}: Props) => {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Box>
      {fieldOptions?.enable && (
        <Select
          disabled={fieldOptions?.readonly}
          withAsterisk={fieldOptions?.required}
          placeholder={interfaceOptions?.placeholder}
          data={[
            { label: "tabler:address-book", value: "tabler:address-book" },
            { label: "tabler:alert-circle", value: "tabler:alert-circle" },
            { label: "tabler:ambulance", value: "tabler:ambulance" },
            { label: "alphabet-cyrillic", value: "alphabet-cyrillic" },
          ]}
          error="required"
          onChange={setValue}
          label={interfaceOptions?.placeholder}
          classNames={{ label: "labelStyle", error: "mantine-Select-error" }}
        />
      )}
    </Box>
  );
};

export default SelectDropdown;
