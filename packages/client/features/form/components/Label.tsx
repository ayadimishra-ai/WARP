import { Stack, Text } from "@mantine/core";
import { useFormFieldControl } from "../store";
import { FormFieldControl } from "../types";

const LabelField: FormFieldControl<"label"> = ({ formField }) => {
  const fieldState = useFormFieldControl<"label">(formField);
  return (
    <Stack spacing={3}>
      {fieldState?.fieldOptions?.enable && (
        <Text
          style={{ fontSize: "12px" }}
          {...(fieldState.interfaceOptions.textComponentProps ?? {})}
        >
          {fieldState.fieldOptions.label}
        </Text>
      )}
    </Stack>
  );
};
export default LabelField;
