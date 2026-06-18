import { TextInput } from "@mantine/core";
import { Widget } from "@rjsf/core";

const TextInputWidget: Widget = ({ value, onChange }) => {
  return (
    <TextInput
      onChange={(event: any) => onChange(event?.currentTarget?.value)}
      value={value}
    />
  );
};

export default TextInputWidget;
