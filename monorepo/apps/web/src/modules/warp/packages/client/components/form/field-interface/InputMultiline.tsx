import { Box, Textarea } from "@mantine/core";

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    placeholder: string;
    maxLength: number;
    rows: number;
    columns: number;
  };
  display: string;
  displayOptions: {
    bold: boolean;
    italic: boolean;
  };
};
const InputMultiline = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Box>
      {fieldOptions?.enable && (
        <Textarea
          placeholder={interfaceOptions?.placeholder}
          error="textarea is required"
          disabled={fieldOptions?.readonly}
          withAsterisk={fieldOptions?.required}
          autosize
          // maxRows={interfaceOptions?.rows}
          label={interfaceOptions?.placeholder}
          classNames={{ label: "labelStyle", error: "mantine-Textarea-error" }}
        />
      )}
    </Box>
  );
};
export default InputMultiline;
