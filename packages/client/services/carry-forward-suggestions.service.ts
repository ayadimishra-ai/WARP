import { convertDBAnswersToStoreAnswers } from "@warp/client/features/form/store";
import { useGetFormfieldAndAnswersByinvitationIdLazyQuery } from "@warp/graphql/queries/generated/get-formfield-and-answers-by-invitationId";
import { useGetLastSubmittedInvitationLazyQuery } from "@warp/graphql/queries/generated/get-last-submitted-invitation";
import { useGetSubmittedFormToDownloadAsPdfLazyQuery } from "@warp/graphql/queries/generated/get-submitted-form-to-download-as-pdf";
import { FORM_NAMES } from "@warp/shared/constants/app.constants";
import { generatePdfDocument } from "../hooks/use-download-assessment-pdf";

export interface CarryForwardSuggestionPayload {
  currentInvitationId: string;
  formId: string;
  companyId: string;
  questionaryName: string;
  pdfUrl?: string;
  pdfFileName?: string;
}

export interface CarryForwardProcessingOptions {
  accessToken: string;
  globalMasterData?: any;
}

/**
 * Check if a form requires client-side PDF generation
 */
const isNonBRSRForm = (formName: string): boolean => {
  return (
    formName !== FORM_NAMES.BRSR_CORE &&
    formName !== FORM_NAMES.BRSR_QUESTIONNAIRE &&
    formName !== FORM_NAMES.BRSR_COMPREHENSIVE_CORE
  );
};

/**
 * Generate filename for the PDF
 */
const generatePDFFileName = (formName: string): string => {
  const financialYear = new Date().getFullYear().toString();
  return `${
    formName?.replace(/[^a-zA-Z0-9]/g, "_") || "Report"
  }_Report_${financialYear}.pdf`;
};

/**
 * Upload PDF to S3 via API endpoint
 */
const uploadPDFToS3 = async (
  pdfBlob: Blob,
  fileName: string,
  companyId: string,
  invitationId: string,
  accessToken: string
): Promise<{ success: boolean; fileUrl?: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", pdfBlob, fileName);
    formData.append("companyId", companyId);
    formData.append("invitationId", invitationId);

    const uploadResponse = await fetch("/api/upload-carry-forward-pdf", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: accessToken,
      },
    });

    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] PDF uploaded successfully: ${uploadResult.fileUrl}`
      );
      return { success: true, fileUrl: uploadResult.fileUrl };
    } else {
      console.error(`[CARRY-FORWARD-SUGGESTIONS] PDF upload failed`);
      return { success: false };
    }
  } catch (error) {
    console.error(`[CARRY-FORWARD-SUGGESTIONS] PDF upload error:`, error);
    return { success: false };
  }
};

/**
 * Call the carry-forward-suggestions API
 */
const callCarryForwardAPI = async (
  payload: CarryForwardSuggestionPayload,
  accessToken: string
): Promise<boolean> => {
  try {
    console.log(
      `[CARRY-FORWARD-SUGGESTIONS] Calling background API for invitation: ${payload.currentInvitationId}`
    );

    await fetch("/api/carry-forward-suggestions", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },
    });

    return true;
  } catch (error) {
    console.error(
      `[CARRY-FORWARD-SUGGESTIONS] API call failed for invitation ${payload.currentInvitationId}:`,
      error
    );
    return false;
  }
};

/**
 * Custom hook for carry-forward suggestions functionality
 * Handles both BRSR and non-BRSR forms with appropriate PDF generation strategies
 */
export const useCarryForwardSuggestions = () => {
  // Initialize the GraphQL lazy queries here (in the hook context)
  const [getLastSubmissionData] = useGetLastSubmittedInvitationLazyQuery();
  const [refetchformfielddata] =
    useGetFormfieldAndAnswersByinvitationIdLazyQuery();
  const [refetch] = useGetSubmittedFormToDownloadAsPdfLazyQuery();
  /**
   * Generate PDF client-side for non-BRSR forms using previous submission data
   */
  const generateClientSidePDF = async (
    currentInvitationId: string,
    formId: string,
    companyId: string,
    formName: string,
    globalMasterData?: any
  ): Promise<Blob | null> => {
    try {
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Generating PDF client-side for non-BRSR form: ${formName}`
      );

      // Step 1: Get the most recent successfully submitted FormSubmission (same as server-side logic)
      const lastSubmissionResult = await getLastSubmissionData({
        variables: {
          formId: formId,
          companyId: companyId,
          currentInvitationId: currentInvitationId,
        },
      });

      if (
        !lastSubmissionResult?.data?.FormSubmission ||
        lastSubmissionResult.data.FormSubmission.length === 0
      ) {
        console.log(
          `[CARRY-FORWARD-SUGGESTIONS] No previous successful submissions found for company: ${companyId}, form: ${formId}`
        );
        return null;
      }

      // Get the last successful FormSubmission
      const lastFormSubmission = lastSubmissionResult.data.FormSubmission[0];
      const previousFormInvitation = lastFormSubmission.FormInvitation;

      if (!previousFormInvitation) {
        console.error(
          `[CARRY-FORWARD-SUGGESTIONS] No FormInvitation found for submission: ${lastFormSubmission.id}`
        );
        return null;
      }

      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Found previous submission: ${lastFormSubmission.id} from invitation: ${previousFormInvitation.id}`
      );

      // Step 2: Fetch form field data and answers for the previous invitation (like generateAndDownloadPdf)
      const formFielddata: any = await refetchformfielddata({
        variables: {
          invitationId: previousFormInvitation.id, // Use previous invitation ID
        },
      });

      // Convert answers to the expected format
      let AnswerObject: any = convertDBAnswersToStoreAnswers(
        formFielddata?.data?.FormSubmission[0]?.FormInvitation?.Form
          ?.FormFields,
        formFielddata?.data?.FormSubmission[0]?.Answers ?? []
      );

      // Step 3: Fetch the submitted form data for PDF generation
      const { data, error } = await refetch({
        variables: {
          invitationId: previousFormInvitation.id, // Use previous invitation ID
          submissionId: lastFormSubmission.id, // Use previous submission ID
        },
      });

      if (!!error) {
        console.error(
          `[CARRY-FORWARD-SUGGESTIONS] Error fetching data:`,
          error
        );
        return null;
      }

      if (!!data?.FormSubmission.length) {
        // Generate PDF using the same parameters as the hook
        const pdfBlob = await generatePdfDocument(
          data?.FormSubmission[0],
          formName,
          AnswerObject,
          formId,
          globalMasterData,
          true // fromCarryForwardSuggestion - don't save/download locally
        );

        console.log(
          `[CARRY-FORWARD-SUGGESTIONS] PDF generation completed for ${formName} using previous submission data`
        );

        return pdfBlob;
      } else {
        console.log(
          `[CARRY-FORWARD-SUGGESTIONS] No form submission data found for previous invitation: ${previousFormInvitation.id}`
        );
        return null;
      }
    } catch (error) {
      console.error(
        `[CARRY-FORWARD-SUGGESTIONS] PDF generation failed:`,
        error
      );
      return null;
    }
  };

  /**
   * Process a single invitation for carry-forward suggestions
   * Handles PDF generation, upload, and API call
   */
  const processInvitation = async (
    invitation: {
      id: string;
      formId: string;
      companyId: string;
      Form: { name: string };
    },
    options: CarryForwardProcessingOptions
  ): Promise<boolean> => {
    try {
      // Create base payload
      let carryForwardPayload: CarryForwardSuggestionPayload = {
        currentInvitationId: invitation.id,
        formId: invitation.formId,
        companyId: invitation.companyId,
        questionaryName: invitation.Form.name || "Report",
      };

      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Processing invitation ${invitation.id} for form ${invitation.Form.name}`,
        { options }
      );

      // Check if this is a non-BRSR form - generate PDF client-side
      const isNonBRSRFormType = isNonBRSRForm(invitation.Form.name);

      if (isNonBRSRFormType) {
        // Generate PDF client-side for non-BRSR forms using previous submission data
        const pdfBlob = await generateClientSidePDF(
          invitation.id, // Current invitation ID (to exclude from search)
          invitation.formId,
          invitation.companyId,
          invitation.Form.name,
          options.globalMasterData
        );

        if (pdfBlob) {
          // Upload PDF to S3
          const fileName = generatePDFFileName(invitation.Form.name);
          const uploadResult = await uploadPDFToS3(
            pdfBlob,
            fileName,
            invitation.companyId,
            invitation.id,
            options.accessToken
          );

          if (uploadResult.success && uploadResult.fileUrl) {
            // Add PDF URL to payload for non-BRSR forms
            carryForwardPayload.pdfUrl = uploadResult.fileUrl;
            carryForwardPayload.pdfFileName = fileName;
            console.log(
              `[CARRY-FORWARD-SUGGESTIONS] PDF uploaded and URL added to payload: ${uploadResult.fileUrl}`
            );
          }
        }
      } else {
        console.log(
          `[CARRY-FORWARD-SUGGESTIONS] BRSR form detected: ${invitation.Form.name}. Server will handle PDF generation.`
        );
      }

      // Call the carry-forward-suggestions API
      return await callCarryForwardAPI(
        carryForwardPayload,
        options.accessToken
      );
    } catch (error) {
      console.error(
        `[CARRY-FORWARD-SUGGESTIONS] Error processing invitation ${invitation.id}:`,
        error
      );
      return false;
    }
  };

  /**
   * Process multiple invitations for carry-forward suggestions
   * Convenience method for processing multiple invitations at once
   */
  const processMultipleInvitations = async (
    invitations: Array<{
      id: string;
      formId: string;
      companyId: string;
      Form: { name: string };
    }>,
    options: CarryForwardProcessingOptions
  ): Promise<{ processed: number; successful: number }> => {
    console.log(
      "[CARRY-FORWARD-SUGGESTIONS] Starting processing of multiple invitations: ",
      { invitations, options }
    );
    let successful = 0;
    const processed = invitations.length;

    for (const invitation of invitations) {
      const result = await processInvitation(invitation, options);
      if (result) {
        successful++;
      }
    }

    console.log(
      `[CARRY-FORWARD-SUGGESTIONS] Processed ${processed} invitations, ${successful} successful`
    );

    return { processed, successful };
  };

  return {
    generateClientSidePDF,
    processInvitation,
    processMultipleInvitations,
  };
};
