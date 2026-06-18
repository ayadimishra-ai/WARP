import { showNotification } from "@mantine/notifications";
import { useCallback, useState } from "react";
import { s3PublicUrl } from "@/modules/warp/packages/configs/s3bucket.config";
import { useInsertQuestionnaireMutation } from "../../../../graphql/mutations/generated/insert-questionnaire";
import { FormType } from "../../../../shared/constants/app.constants";
import type {
  ModalStates,
  QuestionnaireListItem,
} from "../types/questionnaire.types";

export const useQuestionnaireModals = () => {
  const [modalStates, setModalStates] = useState<ModalStates>({
    uploadModalOpen: false,
    downloadModalOpen: false,
    assignModalOpen: false,
    selectedQuestionnaire: undefined,
    isCreateMode: false,
  });

  // Set up GraphQL mutation
  const [insertQuestionnaire] = useInsertQuestionnaireMutation();
  const openUploadModal = useCallback(
    (questionnaire: QuestionnaireListItem) => {
      setModalStates((prevState) => ({
        ...prevState,
        uploadModalOpen: true,
        selectedQuestionnaire: questionnaire,
        isCreateMode: false,
      }));
    },
    []
  );

  // New method to open the upload modal in create mode
  const openCreateModal = useCallback(() => {
    setModalStates({
      uploadModalOpen: true,
      downloadModalOpen: false,
      assignModalOpen: false,
      selectedQuestionnaire: undefined,
      isCreateMode: true,
    });
  }, []);

  const closeUploadModal = useCallback(() => {
    console.log("closeUploadModal called in hook");
    // Directly set the state without depending on previous state
    setModalStates({
      uploadModalOpen: false,
      downloadModalOpen: false,
      assignModalOpen: false,
      selectedQuestionnaire: undefined,
      isCreateMode: false,
    });
  }, []);

  const openDownloadModal = useCallback(
    (questionnaire: QuestionnaireListItem) => {
      setModalStates((prevState) => ({
        ...prevState,
        downloadModalOpen: true,
        selectedQuestionnaire: questionnaire,
      }));
    },
    []
  );

  const closeDownloadModal = useCallback(() => {
    setModalStates((prevState) => ({
      ...prevState,
      downloadModalOpen: false,
      selectedQuestionnaire: undefined,
    }));
  }, []);

  const openAssignModal = useCallback(
    (questionnaire: QuestionnaireListItem) => {
      setModalStates((prevState) => ({
        ...prevState,
        assignModalOpen: true,
        selectedQuestionnaire: questionnaire,
      }));
    },
    []
  );

  const closeAssignModal = useCallback(() => {
    setModalStates((prevState) => ({
      ...prevState,
      assignModalOpen: false,
      selectedQuestionnaire: undefined,
    }));
  }, []);

  // UI-only handlers that show "coming soon" notifications
  const handleUpload = useCallback(
    (questionnaire: QuestionnaireListItem, file?: File) => {
      if (file) {
        showNotification({
          title: "Upload Successful",
          message: `${file.name} has been uploaded to ${questionnaire.title}`,
          color: "green",
        });

        // In a real implementation, you would store the file information in your database
        // or trigger a backend process to handle the uploaded file
        console.log(
          `File ${file.name} uploaded for questionnaire ${questionnaire.id}`
        );

        // Call any other required backend services here
      } else {
        showNotification({
          title: "Upload Cancelled",
          message: "No file was selected for upload",
          color: "yellow",
        });
      }
      // Don't close modal here as it's already closed in the component
      // closeUploadModal();
    },
    []
  );

  const handleDownload = useCallback(
    (
      questionnaire: QuestionnaireListItem,
      format: "pdf" | "excel" | "json" = "pdf"
    ) => {
      // Handle different download formats
      if (format === "excel") {
        // For Excel format, create a template download URL
        const templateDownloadUrl = s3PublicUrl(
          "Snowkap_WARP_Questionnaire_Template.xlsx"
        );

        // Open the template in a new tab
        window.open(templateDownloadUrl, "_blank");

        showNotification({
          title: "Download Started",
          message: `Downloading ${
            questionnaire.title
          } in ${format.toUpperCase()} format`,
          color: "green",
        });
      } else {
        // For other formats that might not be implemented yet
        showNotification({
          title: "Download Feature",
          message: `Download functionality for ${format.toUpperCase()} format is coming soon!`,
          color: "blue",
        });
      }

      closeDownloadModal();
    },
    [closeDownloadModal]
  );

  const handleAssign = useCallback(
    (
      questionnaire: QuestionnaireListItem,
      assigneeId: string,
      dueDate?: Date,
      notes?: string
    ) => {
      showNotification({
        title: "Assignment Feature",
        message: "Assignment functionality is coming soon!",
        color: "orange",
      });
      closeAssignModal();
    },
    [closeAssignModal]
  );

  // Method to handle creating a new questionnaire
  const handleCreateQuestionnaire = useCallback(
    async (
      title: string,
      description: string,
      file: File,
      formType: string = FormType.Assessment
    ) => {
      try {
        // First upload the file to S3
        const fileUrl = await uploadFileToS3(file, title);

        // Use Apollo mutation to insert the questionnaire data
        const { data, errors } = await insertQuestionnaire({
          variables: {
            title,
            description,
            type: "custom",
            formtype: formType,
          },
        });
        if (errors) {
          throw new Error(errors[0].message);
        }

        if (!data || !data.insert_Form_one) {
          throw new Error("Failed to create questionnaire");
        }

        const newQuestionnaire = data.insert_Form_one;

        showNotification({
          title: "Questionnaire Created",
          message: `${title} has been created successfully with template`,
          color: "green",
        });

        closeUploadModal();

        // In a real implementation, you would refresh the questionnaire list
        // or navigate to the new questionnaire

        return newQuestionnaire;
      } catch (error) {
        showNotification({
          title: "Error Creating Questionnaire",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          color: "red",
        });
        throw error;
      }
    },
    [closeUploadModal, insertQuestionnaire]
  );

  // Helper function to upload a file to S3
  const uploadFileToS3 = async (file: File, questionnaireName: string) => {
    try {
      // Get pre-signed URL for S3 upload
      const response = await fetch("/warp/api/awss3/get-upload-url", {
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
      throw error;
    }
  };

  return {
    modalStates,

    // Modal controls
    openUploadModal,
    openCreateModal,
    closeUploadModal,
    openDownloadModal,
    closeDownloadModal,
    openAssignModal,
    closeAssignModal,

    // UI-only action handlers
    handleUpload,
    handleCreateQuestionnaire,
    handleDownload,
    handleAssign,

    // Convenience getters
    selectedQuestionnaire: modalStates.selectedQuestionnaire,
    isUploadModalOpen: modalStates.uploadModalOpen,
    isDownloadModalOpen: modalStates.downloadModalOpen,
    isAssignModalOpen: modalStates.assignModalOpen,
    isCreateMode: modalStates.isCreateMode || false,
  };
};
