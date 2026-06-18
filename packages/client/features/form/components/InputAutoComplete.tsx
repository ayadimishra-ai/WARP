import { Autocomplete, Box } from "@mantine/core";

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    placeholder: string;
    autoComplete: boolean;
    autoCompleteData: any;
    isApi: boolean;
    api: { url: string; configureBody: string };
  };
  display: string;
  displayOptions: {
    bold: boolean;
    italic: boolean;
  };
};
const InputAutoComplete = ({
  fieldOptions,
  interfaceOptions,
  displayOptions,
  display,
}: Props) => {
  return (
    <Box>
      {fieldOptions?.enable && (
        <Autocomplete
          disabled={fieldOptions?.readonly}
          withAsterisk={fieldOptions?.required}
          placeholder={interfaceOptions?.placeholder}
          data={["react", "js", "java"]}
          error="required"
          label={interfaceOptions?.placeholder}
          classNames={{
            label: "labelStyle",
            error: "mantine-Autocomplete-error",
          }}
        />
      )}
    </Box>
  );
};
export default InputAutoComplete;
