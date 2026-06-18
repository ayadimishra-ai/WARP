import { Stack, Text } from "@mantine/core";
import { RichTextEditor } from "@mantine/rte";
import { useState } from "react";

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    placeholder: string;
    maxLength: number;
    directortPath: string;
    allowMultiple: boolean;
    allowFileType: any;
    maxSizeAllowed: string;
    maxFilesAllowed: string;
    controls: any;
  };
  display: string;
  displayOptions: {};
};
const InputReachText = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  const [value, onChange] = useState(
    "<p>Your initial <b>html value</b> or an empty string to init editors without value</p>"
  );
  return (
    <Stack spacing={3}>
      {fieldOptions?.enable && (
        <RichTextEditor value={value} onChange={onChange} id="rte" />
      )}
      <Text size="xs" color="red">
        Red text
      </Text>
    </Stack>
  );
};
export default InputReachText;
