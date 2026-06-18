import { Select } from "@mantine/core";
import { Widget } from "@rjsf/core";

const SelectWidget: Widget = ({ schema, onChange, value, ...props }) => {
  return (
    <Select
      label={props?.label}
      placeholder="Select One"
      data={(schema?.enum as any) ?? []}
      onChange={(val) => {
        onChange(val);
      }}
      value={value}
      color="violet"
    />
  );
};

export default SelectWidget;
