import { Box, MultiSelect } from "@mantine/core";

const data = [
  { value: "react", label: "React" },
  { value: "ng", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "vue", label: "Vue" },
  { value: "riot", label: "Riot" },
  { value: "next", label: "Next.js" },
  { value: "blitz", label: "Blitz.js" },
];
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
  displayOptions: any;
};
const SelectMultipleDropdown = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Box>
      {fieldOptions?.enable && (
        <MultiSelect
          data={data}
          placeholder={interfaceOptions?.placeholder}
          disabled={fieldOptions?.readonly}
          withAsterisk={fieldOptions?.required}
          error="multi error"
          clearable
          label={interfaceOptions?.placeholder}
          classNames={{
            label: "labelStyle",
            error: "mantine-MultiSelect-error",
          }}
        />
      )}
    </Box>
  );
};
export default SelectMultipleDropdown;
