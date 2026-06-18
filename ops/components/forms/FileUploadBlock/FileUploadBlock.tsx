import { useState } from "react";
import {
  Text,
  Flex,
  Stack,
  Card,
  Group,
  FileButton,
  Button,
  List,
  Progress,
  Popover,
} from "@mantine/core";
import {
  IconAlertCircleFilled,
  IconCloudUpload,
  IconFileText,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";
import classes from "./FileButton.module.css";

interface FilesChangeHandler {
  onFilesChange?: any;
}
const FileUploadBlock: React.FC<FilesChangeHandler> = ({ onFilesChange }) => {
  const [files, setFiles] = useState<{ file: File; progress: number }[]>([]);
  const alertIcon = <IconAlertCircleFilled color="#CDCDCD" size={16} />;
  const fileText = "#333333";
  const uploadPercentText = "#B3B3B6";
  const uploadIconColor = "#FF9B1E";
  const fileIconColor = "#1A1A1A";

  const handleFileChange = (uploadedFiles: File[]) => {
    const updatedFiles = uploadedFiles.map((file) => ({
      file,
      progress: 100,
    }));
    // setFiles(updatedFiles);
    setFiles((prevFiles) => [...prevFiles, ...updatedFiles]);
    onFilesChange((prevFiles: any) => [...prevFiles, ...updatedFiles]);
  };

  // const updateFileProgress = (file: File, progress: number) => {
  //   setFiles((prevFiles) =>
  //     prevFiles.map((item) =>
  //       item.file === file ? { ...item, progress } : item
  //     )
  //   );
  // };

  const removeFile = (fileToRemove: File) => {
    setFiles((prevFiles) =>
      prevFiles.filter((item) => item.file !== fileToRemove)
    );
  };
  // const getFileNames = () => {
  //   return files.map((fileItem) => fileItem.file.name);
  // };

  // const resetFiles = () => {
  //   setFiles([]);
  // };
  // Function to convert bytes to megabytes
  const bytesToMB = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  return (
    <Card p="0">
      <Card
        py="xl"
        px="xs"
        ta="center"
        classNames={{
          root: classes.FileuploadBlockCardRoot,
        }}
      >
        <Stack gap="sm">
          <Flex align="center" justify="center">
            <IconCloudUpload color={uploadIconColor} size={64} />
          </Flex>
          <Stack gap="xs">
            <Flex align="center" justify="center" gap="xs">
              <Text size="12px" fw="600">
                Upload Documents
              </Text>
              <Popover
                width={200}
                trapFocus
                position="bottom"
                withArrow
                shadow="md"
              >
                <Popover.Target>{alertIcon}</Popover.Target>
                <Popover.Dropdown>
                  <Text size="xs" c="#666666">
                    Upload Documents
                  </Text>
                </Popover.Dropdown>
              </Popover>
            </Flex>
            <Stack gap="xs" mb="xs">
              <Text size="12px" ta="center">
                We recommend you to upload all the documents relevant for this
                section.
              </Text>
              <Flex justify="center">
                <Text size="12px">Documents relevant to this section are:</Text>
                <Text size="12px" fw="600">
                  document #1, document 2,
                </Text>
              </Flex>
            </Stack>
          </Stack>
          <Group justify="center">
            <FileButton
              onChange={(files) => handleFileChange(files)}
              accept=".xlsx,.pdf,image/png,image/jpeg"
              multiple
            >
              {(props) => (
                <Button
                  {...props}
                  size="xs"
                  variant="filled"
                  color="#72D0C6"
                  radius="xl"
                  classNames={{
                    root: classes.root,
                    inner: classes.inner,
                    label: classes.label,
                  }}
                >
                  Select Files
                </Button>
              )}
            </FileButton>
          </Group>
        </Stack>
      </Card>

      {/* List of picked files with progress */}
      <List
        spacing="xs"
        size="md"
        my="xs"
        classNames={{
          item: classes.item,
        }}
      >
        {files.map((fileItem, index) => (
          <List.Item
            key={index}
            classNames={{
              itemWrapper: classes.itemWrapper,
              itemLabel: classes.itemLabel,
            }}
          >
            <Card
              p="xs"
              classNames={{
                root: classes.cardRoot,
              }}
            >
              <Flex align="center" gap="md">
                <IconFileText size={48} color={fileIconColor} stroke="1" />
                <Stack
                  gap="4px"
                  classNames={{
                    root: classes.StackRoot,
                  }}
                >
                  <Flex justify="space-between">
                    <Text size="sm" fw="600" c={fileText} ta="left">
                      {fileItem.file.name} (
                      {`${bytesToMB(fileItem.file.size)} MB`} /{" "}
                      {`${bytesToMB(fileItem.file.size)} MB`})
                    </Text>
                    <Flex gap="md">
                      <Button size="24" p="0" bg="none">
                        <IconCheck size={24} color="green" stroke="1" />
                      </Button>
                      <Button size="24" p="0" bg="none">
                        <IconTrash
                          size={24}
                          color="red"
                          stroke="1"
                          onClick={() => removeFile(fileItem.file)}
                        />
                      </Button>
                    </Flex>
                  </Flex>
                  <Progress value={fileItem.progress} color="cyan" size="xs" />
                  <Text size="xs" c={uploadPercentText} ta="left">
                    {fileItem.progress}% uploaded
                  </Text>
                </Stack>
              </Flex>
            </Card>
          </List.Item>
        ))}
      </List>
      {/* <Text size="sm" mt="sm">
        Uploaded files: {getFileNames().join(", ")}
      </Text> */}
    </Card>
  );
};

export default FileUploadBlock;
