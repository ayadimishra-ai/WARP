import {
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Radio,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconDownload,
  IconFileTypePdf,
  IconFileTypeXls,
  IconInfoCircle,
  IconTemplate,
} from "@tabler/icons-react";
import React, { useState } from "react";
import { useQuestionnaireModalContext } from "../context/QuestionnaireModalProvider";

export const DownloadModal: React.FC = () => {
  const {
    isDownloadModalOpen,
    closeDownloadModal,
    selectedQuestionnaire,
    handleDownload,
  } = useQuestionnaireModalContext();
  const [selectedFormat, setSelectedFormat] = useState<
    "pdf" | "excel" | "json"
  >("pdf");

  // Template download URL from S3
  const templateDownloadUrl =
    "https://s3.amazonaws.com/snowkap-staging/public/Snowkap_WARP_Questionnaire_Template.xlsx";

  const handleSubmit = () => {
    if (selectedQuestionnaire) {
      handleDownload(selectedQuestionnaire, selectedFormat);
    }
  };

  // Function to download the template
  const handleTemplateDownload = () => {
    window.open(templateDownloadUrl, "_blank");
  };
  const formatOptions = [
    {
      value: "pdf" as const,
      label: "PDF Format",
      description: "Download as a formatted PDF document",
      icon: <IconFileTypePdf size={20} color="#e03131" />,
    },
    {
      value: "excel" as const,
      label: "Excel Format",
      description: "Download as an Excel spreadsheet",
      icon: <IconFileTypeXls size={20} color="#087f5b" />,
    },
    {
      value: "json" as const,
      label: "JSON Format",
      description: "Download as structured JSON data",
      icon: (
        <Text size="lg" weight={700} c="dimmed">
          {}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      opened={isDownloadModalOpen}
      onClose={closeDownloadModal}
      title="Download Questionnaire"
      size="md"
      centered
    >
      <Stack spacing="md">
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="green"
          variant="light"
        >
          <Text size="sm">
            The questionnaire export is a UI mockup, but you can download the
            template using the button at the bottom of this dialog.
          </Text>
        </Alert>

        {selectedQuestionnaire && (
          <Box p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
            <Text size="sm" weight={500} mb="xs">
              Selected Questionnaire:
            </Text>
            <Text size="sm">{selectedQuestionnaire.title}</Text>
            <Text size="xs" c="dimmed">
              {selectedQuestionnaire.description}
            </Text>
          </Box>
        )}

        <Divider />

        <Stack spacing="sm">
          <Text size="sm" weight={500}>
            Choose Export Format
          </Text>

          <Radio.Group
            value={selectedFormat}
            onChange={(value) =>
              setSelectedFormat(value as "pdf" | "excel" | "json")
            }
          >
            <Stack spacing="sm">
              {formatOptions.map((option) => (
                <Box
                  key={option.value}
                  p="sm"
                  style={{
                    border:
                      selectedFormat === option.value
                        ? "2px solid #339af0"
                        : "1px solid #e9ecef",
                    borderRadius: 6,
                    backgroundColor:
                      selectedFormat === option.value
                        ? "#f0f8ff"
                        : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedFormat(option.value)}
                >
                  <Group spacing="sm" noWrap>
                    <Radio value={option.value} />
                    {option.icon}
                    <div style={{ flex: 1 }}>
                      <Text size="sm" weight={500}>
                        {option.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {option.description}
                      </Text>
                    </div>
                  </Group>
                </Box>
              ))}
            </Stack>
          </Radio.Group>
        </Stack>

        <Divider />

        <Box>
          <Text size="sm" weight={500} mb="xs">
            Need a Template?
          </Text>
          <Alert
            icon={<IconTemplate size={16} />}
            color="blue"
            variant="light"
            mb="sm"
          >
            <Text size="sm">
              Download our questionnaire template to help you prepare your data
              before uploading.
            </Text>
          </Alert>
          <Button
            variant="outline"
            color="blue"
            leftIcon={<IconDownload size={16} />}
            onClick={handleTemplateDownload}
            fullWidth
          >
            Download Template
          </Button>
        </Box>

        <Group position="right" spacing="sm">
          <Button variant="subtle" onClick={closeDownloadModal}>
            Cancel
          </Button>
          <Button
            leftIcon={<IconDownload size={16} />}
            onClick={handleSubmit}
            color="green"
          >
            Download {selectedFormat.toUpperCase()}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
