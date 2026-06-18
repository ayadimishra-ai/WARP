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
import { showNotification } from "@mantine/notifications";
import { downloadUpdatedTemplate, loadOriginalTemplate, sortFormFieldsNumerically, updateOriginalTemplate } from "@/modules/warp/packages/shared/utils/excel-template-updater.util";
import { FormTemplateData } from "@/modules/warp/packages/shared/utils/excel-template-generator.util";
import { useGetFormTemplateDataLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-template-data";
import { s3PublicUrl } from "@/modules/warp/packages/configs/s3bucket.config";

export const DownloadModal: React.FC = () => {
  const {
    isDownloadModalOpen,
    closeDownloadModal,
    selectedQuestionnaire,
    handleDownload,
  } = useQuestionnaireModalContext();
  const [selectedFormat, setSelectedFormat] = useState<"excel" | "json">(
    "excel"
  );
  const [isDownloading, setIsDownloading] = useState(false);

  // GraphQL query to fetch form template data
  const [getFormTemplateData, { loading: templateLoading }] =
    useGetFormTemplateDataLazyQuery();

  const templateDownloadUrl = s3PublicUrl("templates/questionnaire_template.xlsx");

  const handleSubmit = async () => {
    if (selectedQuestionnaire) {
      setIsDownloading(true);

      try {
        // Step 1: Fetch form data from database (Common for both Excel and JSON)
        console.log("Fetching form data for ID:", selectedQuestionnaire.id);
        const { data, error: queryError } = await getFormTemplateData({
          variables: { formId: selectedQuestionnaire.id },
        });

        if (queryError) {
          console.error("GraphQL Query Error:", queryError);
          throw new Error(`GraphQL Error: ${queryError.message}`);
        }

        if (!data) {
          throw new Error("No data returned from GraphQL query");
        }

        if (!data.Form || data.Form.length === 0) {
          throw new Error(`No form found with ID: ${selectedQuestionnaire.id}`);
        }

        const formData: FormTemplateData = {
          id: data.Form[0].id,
          title: data.Form[0].title,
          description: data.Form[0].description,
          name: data.Form[0].name,
          formtype: data.Form[0].formtype || "",
          tags: data.Form[0].tags || [],
          Sections: data.Form[0].Sections.map((section) => ({
            ...section,
            ParentSection: section.ParentSection || undefined,
            Questions: section.Questions || undefined,
          })),
          FormFields: data.Form[0].FormFields.map((field) => ({
            ...field,
            dataPoint: field.dataPoint || undefined,
            Section: field.Section || undefined,
            Question: field.Question || undefined,
          })),
        };

        if (selectedFormat === "excel") {
          // Load the original template and update it with database data
          // This preserves the original structure, Guidelines, Masters, etc.

          // Step 2: Load the original template from S3
          console.log(
            "Loading original template from S3:",
            templateDownloadUrl
          );
          const originalWorkbook = await loadOriginalTemplate(
            templateDownloadUrl
          );
          console.log("Original template loaded successfully");

          // Step 3: Update the original template with new data
          // This preserves Guidelines, Masters, section codes (S10.1), column headers ("Guidence")
          const updatedWorkbook = updateOriginalTemplate(
            originalWorkbook,
            formData
          );

          // Step 4: Download the updated template
          downloadUpdatedTemplate(
            updatedWorkbook,
            `${selectedQuestionnaire.title}_template.xlsx`
          );

          showNotification({
            title: "Download Successful",
            message: `Excel template for "${selectedQuestionnaire.title}" has been downloaded`,
            color: "green",
          });
        } else if (selectedFormat === "json") {
          // JSON Download Logic
          // Apply the same numerical sorting as Excel to ensure consistent order
          const sortedFormFields = sortFormFieldsNumerically(formData.FormFields);
          const dataToExport = { ...formData, FormFields: sortedFormFields };

          const jsonString = JSON.stringify(dataToExport, null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${selectedQuestionnaire.title}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          showNotification({
            title: "Download Successful",
            message: `JSON file for "${selectedQuestionnaire.title}" has been downloaded`,
            color: "green",
          });
        }
      } catch (error) {
        console.error("Error downloading template:", error);
        showNotification({
          title: "Download Failed",
          message: "Failed to generate file. Please try again.",
          color: "red",
        });
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // Function to download the template
  const handleTemplateDownload = () => {
    window.open(templateDownloadUrl, "_blank");
  };

  const formatOptions = [
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
        <Text size="lg" fw={700} c="dimmed">
          {"{ }"}
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
      <Stack gap="md">
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="green"
          variant="light"
        >
          <Text size="sm">
            You can download the questionnaire in your preferred format (Excel
            or JSON) below.
          </Text>
        </Alert>

        {selectedQuestionnaire && (
          <Box p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
            <Text size="sm" fw={500} mb="xs">
              Selected Questionnaire:
            </Text>
            <Text size="sm">{selectedQuestionnaire.title}</Text>
            <Text size="xs" c="dimmed">
              {selectedQuestionnaire.description}
            </Text>
          </Box>
        )}

        <Divider />

        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Choose Export Format
          </Text>

          <Radio.Group
            value={selectedFormat}
            onChange={(value) => setSelectedFormat(value as "excel" | "json")}
          >
            <Stack gap="sm">
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
                  <Group gap="sm" wrap="nowrap">
                    <Radio value={option.value} />
                    {option.icon}
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>
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
          <Text size="sm" fw={500} mb="xs">
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
            leftSection={<IconDownload size={16} />}
            onClick={handleTemplateDownload}
            fullWidth
          >
            Download Template
          </Button>
        </Box>

        <Group justify="right" gap="sm">
          <Button variant="subtle" onClick={closeDownloadModal}>
            Cancel
          </Button>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleSubmit}
            color="green"
            loading={isDownloading || templateLoading}
            disabled={isDownloading || templateLoading}
          >
            {isDownloading || templateLoading
              ? "Generating..."
              : `Download ${selectedFormat.toUpperCase()}`}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
