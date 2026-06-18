import { Box, TextInput } from "@mantine/core";

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    placeholder: string;
  };
  display: string;
  displayOptions: {
    bold: boolean;
    italic: boolean;
  };
};

const InputField = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Box>
      {fieldOptions?.enable && (
        <TextInput
          label="Username"
          placeholder={interfaceOptions?.placeholder}
          // error="username is requiree"
          disabled={fieldOptions?.readonly}
          withAsterisk={fieldOptions?.required}
          classNames={{
            label: "labelStyle",
            error: "mantine-TextInput-error",
            input: "mantine-TextInput-input",
          }}
        />
      )}
    </Box>
  );
};
export default InputField;
