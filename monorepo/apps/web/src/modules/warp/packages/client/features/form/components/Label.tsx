import { Stack, Text } from "@mantine/core";
import { useFormFieldControl } from "../store";
import { FormFieldControl } from "../types";

const LabelField: FormFieldControl<"label"> = ({ formField }) => {
  const fieldState = useFormFieldControl<"label">(formField);
  return (
    <Stack gap={3}>
      {fieldState?.fieldOptions?.enable && (
        <Text fz={12}
          {...(fieldState.interfaceOptions.textComponentProps ?? {})}
        >
          {fieldState.fieldOptions.label}
        </Text>
      )}
    </Stack>
  );
};
export default LabelField;
