import { Box, FileInput } from "@mantine/core";
import { useState } from "react";
import UploadFileSvgIcon from "../../../icons/UploadFileSvgIcon";
import CommonTable from "./CommonTable";
type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    placeholder: string;
    directoryPath: string;
    allowMultiple: boolean;
    allowFileType: any;
    maxSizeInMb: number;
    maxFilesCount: number;
  };
  display: string;
  displayOptions: {};
};
const FileField = ({ fieldOptions, interfaceOptions }: Props) => {
  const [singleValue, setSingleValue] = useState<File | null>(null);
  const [multiValue, setMultiValue] = useState<File[]>([]);
  // console.log(multiValue);
  return (
    <Box>
      {fieldOptions?.enable && (
        <FileInput
          classNames={{ input: "mantine-FileInput-input" }}
          placeholder={interfaceOptions?.placeholder}
          withAsterisk={fieldOptions?.required}
          disabled={fieldOptions?.readonly}
          multiple={interfaceOptions?.allowMultiple}
          // error={"File required"}
          rightSection={
            <UploadFileSvgIcon width={30} height={30} fill="#ffffff" />
          }
          clearable={true}
          rightSectionWidth={45}
          value={interfaceOptions?.allowMultiple ? multiValue : singleValue}
          onChange={(val: File | File[] | null) => {
            if (interfaceOptions?.allowMultiple) {
              setMultiValue(Array.isArray(val) ? val : val ? [val] : []);
            } else {
              setSingleValue(Array.isArray(val) ? (val[0] ?? null) : val);
            }
          }}
        />
      )}
      <CommonTable headers={["Document", "Descriptitiom", "Actions"]}>
        <>
          <tr>
            <td>Image.png</td>
            <td>qwerty</td>
            <td>Edit/Delete</td>
          </tr>
          <tr>
            <td>Image2.png</td>
            <td>qwerty2</td>
            <td>Edit/Delete</td>
          </tr>
        </>
      </CommonTable>
    </Box>
  );
};
export default FileField;
