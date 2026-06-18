import {
  Alert,
  Badge,
  Box,
  Button,
  FileButton,
  Group,
  Modal,
  Progress,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconFile,
  IconInfoCircle,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import React, { useState } from "react";

import { useBulkInsertFormFieldsMutation } from "../../../../graphql/mutations/generated/bulk-insert-form-fields";
import { useBulkInsertQuestionsMutation } from "../../../../graphql/mutations/generated/bulk-insert-questions";
import { useBulkInsertSectionsMutation } from "../../../../graphql/mutations/generated/bulk-insert-sections";
import { useInsertQuestionnaireMutation } from "../../../../graphql/mutations/generated/insert-questionnaire";
import {
  FormInvitationStatus,
  FormType,
} from "../../../../shared/constants/app.constants";
// import { generateFormFields } from "../../../../shared/utils/excel-form-fields-processor";
import { IconAlertCircle, IconCheck } from "@tabler/icons";
import {
  CreateParentCompanyMappingMutationVariables,
  FormInvitation_Insert_Input,
} from "@warp/graphql/generated/types";
import { useCreateParentCompanyMappingMutation } from "@warp/graphql/mutations/generated/create-ParentCompanyMapping";
import { useDeleteAnswersBySubmissionIdMutation } from "@warp/graphql/mutations/generated/delete-answers-by-submissionid";
import { useDeleteFormfieldByFormIdMutation } from "@warp/graphql/mutations/generated/delete-formfield-by-formId";
import { useDeleteQuestionsBySectionIdMutation } from "@warp/graphql/mutations/generated/delete-questions-by-sectionid";
import { useDeleteSectionsByFormIdMutation } from "@warp/graphql/mutations/generated/delete-sections-by-formid";
import { useInsertFormInvitationMutation } from "@warp/graphql/mutations/generated/insert-form-invitation";
import { useInsertFormDetailsOneMutation } from "@warp/graphql/mutations/generated/insert-formdetails";
import { useGetCompanyDetailByparentcompanyidLazyQuery } from "@warp/graphql/queries/generated/get-companydetail-by-parentcompanyid";
import { useGetParentCompanyByCompanyAndParentCompanyIdLazyQuery } from "@warp/graphql/queries/generated/get-parentcompany-by-company-and-parentcompany-id";
import { useGetQuestionnaireDetailsForDeletionLazyQuery } from "@warp/graphql/queries/generated/get-questionnaire-details-for-deletion";
import { generateFormFields_new } from "@warp/shared/utils/excel-form-fields-processor_new";
import {
  processQuestionData,
  readQuestionsFromExcel,
  validateQuestionsExcelFile,
} from "@warp/shared/utils/excel-questions-processor";
import {
  processSectionData,
  readSectionsFromExcel,
  validateSectionsExcelFile,
} from "@warp/shared/utils/excel-sections-processor";
import { useUserSession } from "../../../hooks/use-user-session";
import { useQuestionnaireModalContext } from "../context/QuestionnaireModalProvider";

export const UploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    closeUploadModal,
    selectedQuestionnaire,
    handleUpload,
    isCreateMode,
    handleCreateQuestionnaire,
  } = useQuestionnaireModalContext();
  const insertFormInvitation = useInsertFormInvitationMutation()[0];
  const useGetCompanyDetailByparentcompanyid =
    useGetCompanyDetailByparentcompanyidLazyQuery()[0];
  const getQuestionnaireDetailsForDeletion =
    useGetQuestionnaireDetailsForDeletionLazyQuery()[0];

  const deleteAnswersBySubmissionId =
    useDeleteAnswersBySubmissionIdMutation()[0];
  const deleteSectionsByFormId = useDeleteSectionsByFormIdMutation()[0];
  const deleteQuestionsBySectionId = useDeleteQuestionsBySectionIdMutation()[0];
  const deleteFormFieldsByFormId = useDeleteFormfieldByFormIdMutation()[0];

  const insertParentCompanyMapping = useCreateParentCompanyMappingMutation()[0];
  const insertFormDetails = useInsertFormDetailsOneMutation()[0];
  const session = useUserSession();

  const GetParentCompanyExists =
    useGetParentCompanyByCompanyAndParentCompanyIdLazyQuery()[0];
  const CompanyDetailByparentcompanyid = async (
    companyId: string,
    parentCompanyId: any
  ) => {
    const { data, error } = await useGetCompanyDetailByparentcompanyid({
      variables: {
        companyId: companyId,
        parentCompanyId: parentCompanyId,
      },
    });
    return data;
  };

  const checkParentCompanyExists = async (
    companyId: any,
    parentCompanyId: any
  ) => {
    const { data, error } = await GetParentCompanyExists({
      variables: {
        companyId:
          session?.company?.id ||
          companyId ||
          "7799dc10-8897-4017-b87c-71ac3d832899",
        parentCompanyId:
          session?.company?.id ||
          parentCompanyId ||
          "7799dc10-8897-4017-b87c-71ac3d832899",
      },
    });
    console.log("data", data);
    return data;
  };

  console.log(
    "UploadModal rendered with isUploadModalOpen:",
    isUploadModalOpen
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form fields for creating a new questionnaire
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTypeValue, setFormTypeValue] = useState<string>(
    FormType.Assessment
  );

  // Set up the mutation for inserting a questionnaire
  const [insertQuestionnaire, { loading: insertLoading }] =
    useInsertQuestionnaireMutation();

  // Set up the mutation for bulk inserting sections
  const [bulkInsertSections, { loading: insertingSections }] =
    useBulkInsertSectionsMutation();

  // Set up the mutation for bulk inserting questions
  const [bulkInsertQuestions, { loading: insertingQuestions }] =
    useBulkInsertQuestionsMutation();

  // Set up the mutation for bulk inserting form fields
  const [bulkInsertFormFields, { loading: insertingFormFields }] =
    useBulkInsertFormFieldsMutation();

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    const isExcelFile =
      file.type === "application/vnd.ms-excel" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (!isExcelFile) {
      showNotification({
        title: "Invalid File Type",
        message: "Please upload an Excel file (.xls or .xlsx)",
        color: "red",
        icon: <IconX size={16} />,
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      showNotification({
        title: "File Too Large",
        message: "Maximum file size is 10MB",
        color: "red",
        icon: <IconX size={16} />,
      });
      return;
    }

    setSelectedFile(file);
  };

  // Function to get S3 upload URL and upload the file
  const uploadFileToS3 = async (file: File, questionnaireName: string) => {
    try {
      // Get pre-signed URL for S3 upload
      const response = await fetch("/api/awss3/get-upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          isCustomName: false,
          folderPath: `questionnaire-uploads/${questionnaireName
            .replace(/\s+/g, "-")
            .toLowerCase()}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadInfo, fileInfo } = await response.json();

      // Prepare form data for upload
      const formData = new FormData();

      // Add all fields from the pre-signed URL
      Object.entries(uploadInfo.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      // Append the file as the last field
      formData.append("file", file);

      // Upload to S3 directly
      const uploadResponse = await fetch(uploadInfo.url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      return fileInfo.path; // Return the public URL of the uploaded file
    } catch (error) {
      console.error("Error uploading file:", error);
      // throw error;
    }
  };

  const handleSubmit = async () => {
    console.log("Submit button clicked");

    // Set uploading to true to show progress bar
    setUploading(true);

    // Start progress animation
    // const intervalId = setInterval(() => {
    //   setUploadProgress((prev) => {
    //     // Cap at 90% until actual upload completes
    //     return prev < 90 ? prev + Math.random() * 5 : 90;
    //   });
    // }, 300);
    // console.log("intervalId", intervalId);

    if (isCreateMode) {
      if (!formTitle || !formDescription || !selectedFile) {
        showNotification({
          title: "Missing Information",
          message: "Please provide a title, description, and upload a file",
          color: "red",
          icon: <IconX size={16} />,
          autoClose: 25000,
        });
        return;
      }
    }

    if (!selectedFile) {
      showNotification({
        title: "Missing Information",
        message: "Please upload a file",
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 25000,
      });
      return;
    }

    // create a constant to hold section code, section id, parent section id, section name, section key for each section
    const sectionIdToCodeMap: Record<
      string,
      {
        id: string;
        key: string;
        sectionId: string | null;
        sectionCode: any; // Using any for ExcelSectionData
        content: string;
        parentsectionCode: any | null;
        tags: string | null;
      }
    > = {};

    if (!selectedFile || !selectedFile.name.endsWith(".xlsx")) {
      showNotification({
        title: "Invalid File Type",
        message: "Please upload an Excel file (.xlsx)",
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 25000,
      });
      return;
    }

    try {
      // Validate the Excel file
      const { isValid, error } = await validateSectionsExcelFile(selectedFile);
      if (!isValid) {
        console.log("error", error);
        let errorMessage = "";
        error?.forEach((e) => {
          errorMessage += e.error + "\n";
        });
        showNotification({
          title: "Invalid File",
          message: errorMessage,
          color: "red",
          icon: <IconX size={16} />,
          autoClose: 25000,
        });
        return;
      }
    } catch (error) {
      showNotification({
        title: "Invalid File",
        message: "The Excel file does not contain any sections",
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 25000,
      });
      return;
    }

    // Read sections from Excel file
    const sections = await readSectionsFromExcel(selectedFile);
    if (sections.length === 0) {
      showNotification({
        title: "Invalid File",
        message: "The Excel file does not contain any sections",
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 25000,
      });
      return;
    }
    console.log("Sections extracted from Excel:", sections);
    setUploadProgress(10);

    try {
      // Validate the Excel file
      const { isValid, error } = await validateQuestionsExcelFile(selectedFile);
      if (!isValid) {
        console.log("error", error);
        let errorMessage = "";
        error?.forEach((e) => {
          errorMessage += e.error + "\n";
        });
        showNotification({
          title: "Invalid File",
          message: errorMessage,
          color: "red",
          icon: <IconX size={16} />,
          autoClose: 25000,
        });
        return;
      }
    } catch (error) {
      showNotification({
        title: "Invalid File",
        message: "The Excel file does not contain any questions",
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 25000,
      });
      return;
    }

    const questions = await readQuestionsFromExcel(selectedFile);
    if (questions.length === 0) {
      showNotification({
        title: "Invalid File",
        message: "The Excel file does not contain any questions",
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 25000,
      });
      return;
    }
    console.log("Questions extracted from Excel:", questions);

    setUploadProgress(20);
    try {
      console.log("Uploading file to S3");
      // First upload the file to S3
      const fileUrl = await uploadFileToS3(selectedFile, formTitle);

      console.log("File uploaded to S3");
    } catch (error) {
      console.error("Error uploading file to S3:", error);
    }
    setUploadProgress(30);

    // let questionnaireName = formTitle;
    // let questionnaireDescription = formDescription;
    // let questionnaireType = formTypeValue;
    // let questionnaireFileUrl = fileUrl;
    // let questionnaireFile = selectedFile;
    // let questionnaireSections = sections;
    // let questionnaireQuestions = questions;
    let questionnaireId = "";

    if (isCreateMode) {
      // Call the hook's handleCreateQuestionnaire method
      const newQuestionnaire = await handleCreateQuestionnaire(
        formTitle,
        formDescription,
        selectedFile,
        formTypeValue
      );
      // Start upload process
      setUploading(true);
      console.log("Upload started in create mode");
      questionnaireId = newQuestionnaire.id;
    } else {
      // Regular upload mode
      if (!selectedQuestionnaire || !selectedFile) {
        console.log("Missing questionnaire or file, returning");
        return;
      }
      questionnaireId = selectedQuestionnaire.id;
      console.log("Questionnaire ID:", questionnaireId);

      const { data: questionnaireDetails, error } =
        await getQuestionnaireDetailsForDeletion({
          variables: {
            formid: selectedQuestionnaire.id,
          },
        });

      console.log("data", questionnaireDetails);

      console.log("error", error);

      if (error) {
        showNotification({
          title: "Deletion Failed",
          message: error.message,
          color: "red",
          icon: <IconX size={16} />,
        });
        return;
      }

      setUploadProgress(40);
      // Get sections from the processed questions' section IDs
      const sectionIds = Array.from(
        new Set(
          questionnaireDetails?.Form?.flatMap(
            (form) => form.Sections?.map((section) => section.id) || []
          ) || []
        )
      ).filter((id): id is string => id != null);

      setUploadProgress(50);
      const submissionIds = Array.from(
        new Set(
          questionnaireDetails?.Form?.flatMap(
            (form) =>
              form.FormInvitations?.flatMap((invitation) =>
                (invitation.FormSubmissions || []).map(
                  (submission) => submission.id
                )
              ) || []
          ) || []
        )
      ).filter((id): id is string => id != null);

      setUploadProgress(60);

      console.log("submissionIds", submissionIds);
      console.log("sectionIds", sectionIds);
      submissionIds.flatMap((id) => {
        deleteAnswersBySubmissionId({
          variables: {
            SubmissionId: id,
          },
        });
      });

      await deleteFormFieldsByFormId({
        variables: {
          formid: selectedQuestionnaire.id,
        },
      });

      await deleteQuestionsBySectionId({
        variables: {
          SectionId: sectionIds,
        },
      });

      await deleteSectionsByFormId({
        variables: {
          formid: selectedQuestionnaire.id,
        },
      });
    }

    setUploadProgress(70);
    // Process sections for database insertion
    const processedSections = processSectionData(sections, questionnaireId);
    console.log("Processed sections:", processedSections);

    // Insert sections into the database
    const { data: sectionData, errors: sectionErrors } =
      await bulkInsertSections({
        variables: {
          objects: processedSections,
        },
      });
    console.log("Section data:", sectionData);
    console.log("Section errors:", sectionErrors);

    if (sectionErrors) {
      console.error("Error inserting sections:", sectionErrors);
      // Continue with the process, but show a warning
      showNotification({
        title: "Warning",
        message:
          "Questionnaire created but there was an issue importing sections",
        color: "yellow",
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }
    setUploadProgress(80);
    sections.forEach((code) => {
      const normalizedCode = code["Section Code"].replace(/\./g, "_");
      const section = processedSections.find((ps) => ps.key === normalizedCode);
      const sectionCode = code["Section Code"];
      if (section) {
        sectionIdToCodeMap[sectionCode] = {
          id: section.id,
          key: section.key,
          sectionId: section.sectionId,
          sectionCode: sectionCode,
          content: section.content,
          parentsectionCode: code["Parent Section Code"] || null,
          tags: section.tags || null,
        };
      } else {
        console.warn(
          `No processed section found for code: ${code} (normalized: ${normalizedCode})`
        );
      }
    });

    // Log sectionIdToCodeMap for debugging
    console.log("sectionIdToCodeMap:", sectionIdToCodeMap);

    // Validate if we have valid section data
    if (processedSections.length === 0) {
      console.warn("No processed sections found!");
      showNotification({
        title: "Warning",
        message:
          "Questionnaire created but there was an issue importing sections",
        color: "yellow",
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    // Validate if section ID to code map is populated
    if (Object.keys(sectionIdToCodeMap).length === 0) {
      console.error(
        "Section ID to code map is empty! This will cause all questions to have null sectionId."
      );
      showNotification({
        title: "Warning",
        message:
          "Questionnaire created but there was an issue importing sections",
        color: "yellow",
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }
    setUploadProgress(90);
    // Process questions for database insertion
    const processedQuestions = processQuestionData(
      questions,
      sectionIdToCodeMap
    );
    console.log("Processed questions:", processedQuestions);

    if (processedQuestions.processedQuestions.length > 0) {
      // Insert questions into the database
      const { data: questionData, errors: questionErrors } =
        await bulkInsertQuestions({
          variables: {
            objects: processedQuestions.processedQuestions,
          },
        });

      if (questionErrors) {
        console.error("Error inserting questions:", questionErrors);
        showNotification({
          title: "Warning",
          message: "There was an issue importing questions",
          color: "yellow",
          icon: <IconAlertCircle size={16} />,
        });
        return;
      }

      console.log("Question data:", questionData);
      console.log("Question errors:", questionErrors);

      // Generate form fields following the specified hierarchy
      const formFields = generateFormFields_new(
        questionnaireId,
        processedQuestions.questionsToInsert,
        sectionIdToCodeMap,
        processedSections,
        questions // Pass the raw questions from Excel
      );

      console.log("Form fields:", formFields);

      console.log(`Generated ${formFields.length} form fields`);

      if (formFields.length === 0) {
        console.error("No form fields generated!");
        showNotification({
          title: "Warning",
          message: "There was an issue importing form fields",
          color: "yellow",
          icon: <IconAlertCircle size={16} />,
        });
        return;
      }

      // Insert form fields into the database
      const { data: formFieldData, errors: formFieldErrors } =
        await bulkInsertFormFields({
          variables: {
            objects: formFields,
          },
        });

      if (formFieldErrors) {
        console.error("Error inserting form fields:", formFieldErrors);
        showNotification({
          title: "Warning",
          message: "There was an issue importing form fields",
          color: "yellow",
          icon: <IconAlertCircle size={16} />,
        });
        return;
      }

      console.log("Form field data:", formFieldData);
      console.log("Form field errors:", formFieldErrors);
    }

    if (isCreateMode) {
      // Insert new raw in FormInvitation and formSubmission table
      let formInvitationDataArray: FormInvitation_Insert_Input[] = [];

      const finalFromDate = new Date();
      const finalToDate = new Date();

      const getparentcompanydata = await checkParentCompanyExists(
        session?.company?.id,
        session?.company?.id
      );
      let ParentCompanyMappingId = "";

      if (
        !!getparentcompanydata &&
        getparentcompanydata?.ParentCompanyMapping?.length > 0
      ) {
        getparentcompanydata?.ParentCompanyMapping.forEach((mapping) => {
          ParentCompanyMappingId = mapping?.Id;
        });
      } else {
        let parentcompanymapping: CreateParentCompanyMappingMutationVariables =
          {
            input: [],
          };
        parentcompanymapping.input = {
          CompanyId: session?.company?.id,
          ParentCompanyId: session?.company?.id,
          UserId: session?.user?.id,
          ParentUserId: session?.user?.id,
        };

        insertFormDetails({
          variables: {
            formid: questionnaireId,
            framework: formTitle,
            focusArea: null,
            timeInMinutes: 0,
            bodyTemplate: formDescription,
            questions: 0,
          },
        });

        const result1 = await insertParentCompanyMapping({
          variables: parentcompanymapping,
        });

        if (result1 && result1?.data?.insert_ParentCompanyMapping?.returning) {
          ParentCompanyMappingId =
            result1?.data?.insert_ParentCompanyMapping?.returning[0].Id;
        }
      }

      formInvitationDataArray.push({
        companyId: session?.company?.id,
        formId: questionnaireId,
        email: session?.user?.email,
        status: FormInvitationStatus.Invited,
        created_by: session?.user?.id,
        updated_by: session?.user?.id,
        durationFrom: finalFromDate,
        durationTo: finalToDate,
        parentcompanyId: session?.company?.id,
        ParentCompanyMappingId: ParentCompanyMappingId,
      });

      const { data: insertFormInvitationResult } = await insertFormInvitation({
        variables: {
          object: formInvitationDataArray,
          companyId: session?.company?.id,
          // parentCompanyId: parentCompanyId,
          //userId: userId,
        },
      });

      if (
        insertFormInvitationResult &&
        insertFormInvitationResult?.insert_FormInvitation?.returning
      ) {
        console.log(
          "Form invitation inserted successfully:",
          insertFormInvitationResult?.insert_FormInvitation?.returning
        );
      }
    }
    setUploadProgress(100);
    showNotification({
      title: "Success",
      message: isCreateMode
        ? `Questionnaire Created Successfully`
        : `Questionnaire Updated Successfully`,
      color: "green",
      icon: <IconCheck size={16} />,
    });

    // Stop progress animation
    clearInterval(uploadProgress);
    setUploadProgress(100);
    setUploading(false);
    setSelectedFile(null);
    closeUploadModal();
  };

  const handleClose = () => {
    if (uploading) {
      // Ask for confirmation if upload is in progress
      if (
        window.confirm("Upload in progress. Are you sure you want to cancel?")
      ) {
        setUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        closeUploadModal();
      }
    } else {
      setSelectedFile(null);
      closeUploadModal();
    }
  };

  return (
    <Modal
      opened={isUploadModalOpen}
      onClose={handleClose}
      title={
        isCreateMode
          ? "Create New Questionnaire"
          : `Upload Questionnaire (Modal State: ${
              isUploadModalOpen ? "Open" : "Closed"
            })`
      }
      size="md"
      centered
      withCloseButton
    >
      <Stack spacing="md">
        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          <Text size="sm">
            {isCreateMode
              ? "Create a new questionnaire by providing a title, description, and uploading an Excel template."
              : "Upload your Excel questionnaire data file here. The system will process your data according to the template format."}
          </Text>
        </Alert>

        {isCreateMode ? (
          <Stack spacing="sm">
            <TextInput
              label="Questionnaire Title"
              placeholder="Enter title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.currentTarget.value)}
              required
              disabled={uploading}
            />
            <Textarea
              label="Description"
              placeholder="Enter a brief description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.currentTarget.value)}
              minRows={3}
              required
              disabled={uploading}
            />
            <Select
              label="Form Type"
              placeholder="Select form type"
              value={formTypeValue}
              onChange={(value) =>
                setFormTypeValue(value || FormType.Assessment)
              }
              data={[
                { value: FormType.Assessment, label: "Assessment" },
                { value: FormType.Report, label: "Report" },
              ]}
              required
              disabled={uploading}
            />
          </Stack>
        ) : (
          selectedQuestionnaire && (
            <Box p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
              <Text size="sm" weight={500} mb="xs">
                Selected Questionnaire:
              </Text>
              <Text size="sm">{selectedQuestionnaire.title}</Text>
              <Text size="xs" c="dimmed">
                {selectedQuestionnaire.description}
              </Text>
            </Box>
          )
        )}

        <Stack spacing="sm">
          <Text size="sm" weight={500}>
            Upload File
          </Text>

          <FileButton
            onChange={handleFileSelect}
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={uploading}
          >
            {(props) => (
              <Button
                leftIcon={<IconUpload size={16} />}
                {...props}
                disabled={uploading}
              >
                {selectedFile ? "Change File" : "Select Excel File"}
              </Button>
            )}
          </FileButton>

          {selectedFile && (
            <Box p="sm" style={{ backgroundColor: "#e7f5ff", borderRadius: 4 }}>
              <Group spacing="sm">
                <IconFile size={16} />
                <div>
                  <Text size="sm" weight={500}>
                    {selectedFile.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Text>
                </div>
                <Badge color="blue" variant="light" size="sm">
                  {selectedFile.type || "Excel file"}
                </Badge>
              </Group>
            </Box>
          )}

          {uploading && (
            <Box mt="md">
              <Text size="xs" mb="xs">
                Uploading... {Math.round(uploadProgress)}%
              </Text>
              <Progress value={uploadProgress} animate size="sm" />
            </Box>
          )}

          <Text size="xs" c="dimmed">
            Supported formats: Excel files (.xls, .xlsx) only (Max size: 10MB)
          </Text>
        </Stack>

        <Group position="right" spacing="sm">
          <Button variant="subtle" onClick={handleClose} disabled={uploading}>
            {uploading ? "Cancel Upload" : "Cancel"}
          </Button>
          <Button
            leftIcon={<IconUpload size={16} />}
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            loading={uploading}
          >
            {uploading ? "Uploading..." : isCreateMode ? "Create" : "Upload"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
