import { Stack, Text } from "@mantine/core";
import dynamic from "next/dynamic";
import { useState } from "react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

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
    <Stack gap={3}>
      {fieldOptions?.enable && (
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          readOnly={fieldOptions?.readonly}
          modules={{ toolbar: interfaceOptions?.controls ?? true }}
        />
      )}
      <Text size="xs" c="red">
        Red text
      </Text>
    </Stack>
  );
};
export default InputReachText;
