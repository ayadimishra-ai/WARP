import { NumberInput } from "@mantine/core";
import { Widget } from "@rjsf/core";

const NumberInputWidget: Widget = ({ value, onChange }) => {
  return (
    <NumberInput
      hideControls
      onChange={(value) => onChange(value)}
      value={value}
      color="violet"
    />
  );
};

export default NumberInputWidget;
