import { Checkbox } from "@mantine/core";
import { Widget } from "@rjsf/core";

const CheckboxWidget: Widget = ({ schema, onChange, value }) => {
  return (
    <Checkbox
      checked={value ? true : false}
      onChange={(e: any) => onChange(e?.target?.checked)}
      label={schema?.title}
      color="violet"
    />
  );
};

export default CheckboxWidget;
