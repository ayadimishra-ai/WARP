import { FileInput } from "@mantine/core";
import { Widget } from "@rjsf/core";
import { IconUpload } from "@tabler/icons-react";

const FileWidget: Widget = ({ onChange, value }) => {
  return (
    <FileInput
      classNames={{ input: "mantine-FileInput-input" }}
      onChange={(value) => onChange(value)}
      value={value}
      accept="application/pdf"
      icon={<IconUpload size={14} />}
    />
  );
};

export default FileWidget;
