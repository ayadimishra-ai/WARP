import { sdk } from "@warp/graphql/generated/server";
import {
  DocumentLogsStatus,
  FORM_NAMES,
  SourceFilesStatus,
  SourcesType,
} from "@warp/shared/constants/app.constants";
import { nanoid } from "nanoid";
import { Readable } from "stream";
import {
  generatePDFBlobOnServer,
  getAnyOtherDocumentId,
} from "./ai-report.service";
import { upload } from "./aws-s3.service";

const getFinancialYearFromFormData = (formFielddata: any): string => {
  try {
    const formInvitation = formFielddata?.FormSubmission?.[0]?.FormInvitation;

    if (formInvitation?.durationFrom && formInvitation?.durationTo) {
      const fromDate = new Date(formInvitation.durationFrom);
      const toDate = new Date(formInvitation.durationTo);

      const startYear = fromDate.getFullYear();
      const endYear = toDate.getFullYear();

      // If assessment spans two years, use format "2024-25"
      if (startYear !== endYear) {
        return `${startYear}-${endYear.toString().slice(-2)}`;
      } else {
        return startYear.toString();
      }
    }
  } catch (error) {
    console.error("Error extracting financial year from form data:", error);
  }

  // Fallback to current year
  return new Date().getFullYear().toString();
};

/**
 * Generate PDF from previous answers using existing PDF generation service
 * Only handles BRSR forms with specific templates - all other forms use client-provided PDFs
 */
const generatePDFFromPreviousAnswers = async (
  formFieldData: any,
  questionaryName?: string
): Promise<Blob | null> => {
  try {
    // Only handle BRSR forms with specific templates on server-side
    const isBRSRForm =
      questionaryName === FORM_NAMES.BRSR_CORE ||
      questionaryName === FORM_NAMES.BRSR_QUESTIONNAIRE ||
      questionaryName === FORM_NAMES.BRSR_COMPREHENSIVE_CORE;

    if (isBRSRForm) {
      // Use template-based generation for BRSR questionnaire types
      const pdfBlob = await generatePDFBlobOnServer(
        formFieldData,
        questionaryName || "Report"
      );
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Generated PDF from previous answers using ${
          questionaryName || "default"
        } template`
      );
      return pdfBlob;
    } else {
      // Non-BRSR forms are handled client-side - no PDF generation on server
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Non-BRSR form ${questionaryName} is handled client-side. Server-side PDF generation skipped.`
      );
      return null;
    }
  } catch (error) {
    console.error(`[CARRY-FORWARD-SUGGESTIONS] Error generating PDF:`, error);
    return null;
  }
};

/**
 * Upload file to S3 using existing AWS S3 service
 */
const uploadFileToS3 = async (
  blob: Blob,
  fileName: string,
  companyId: string
): Promise<{ fileUrl?: string; fileName?: string; error?: string }> => {
  try {
    const folderName = `AI_SOURCES/${companyId}`;

    // Generate unique filename
    const fileExt = ".pdf";
    const uploadFileName = `${folderName}/${nanoid(32)}${fileExt}`;

    // Convert blob to buffer for Node.js stream
    const buffer = Buffer.from(await blob.arrayBuffer());
    const stream = Readable.from(buffer);
    const uploadOptions = {
      forceInlineViewing: true,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="${fileName}"`,
    };

    // Upload to S3 using existing service
    const result = await upload(uploadFileName, "", stream, uploadOptions);

    return {
      fileUrl: result.Location,
      fileName: result.Key?.split("/").pop() || fileName,
    };
  } catch (error) {
    console.error(
      "Error uploading carry-forward suggestions file to S3:",
      error
    );
    return {
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};

/**
 * Calculate the next version number for carry-forward suggestions documents
 */
const calculateDocumentVersion = async (companyId: string): Promise<number> => {
  let nextVersion = 1;
  try {
    const documentLogsData = await sdk.GetDocumentLogsWithAISuggestedDocuments({
      where: {
        companyId: { _eq: companyId },
      },
    });

    if (
      documentLogsData?.DocumentLogs &&
      documentLogsData.DocumentLogs.length > 0
    ) {
      // Count existing versions for carry-forward suggestions
      const existingVersions = documentLogsData.DocumentLogs.map((log: any) => {
        const versionMatch = log.version?.match(/V(\d+)/);
        return versionMatch ? parseInt(versionMatch[1]) : 0;
      }).filter((v: number) => v > 0);

      if (existingVersions.length > 0) {
        nextVersion = Math.max(...existingVersions) + 1;
      }
    }
  } catch (versionError) {
    console.error("Error calculating version:", versionError);
    // Continue with version 1 as fallback
  }
  return nextVersion;
};

/**
 * Create DocumentLogs entry for the generated PDF
 */
const createDocumentLogEntry = async (
  fileName: string,
  uploadResult: any,
  pdfBlob: Blob | null,
  companyId: string,
  currentInvitationId: string,
  nextVersion: number,
  questionaryName?: string
): Promise<string | null> => {
  try {
    const anyOtherDocumentId = await getAnyOtherDocumentId();
    if (!anyOtherDocumentId) {
      console.warn(
        `[SERVER] Could not fetch "Any Other Document" ID, using fallback`
      );
    }

    const documentLogEntry = {
      originalFileName: fileName,
      fileUrl: uploadResult.fileUrl || "",
      fileName: uploadResult.fileName || fileName,
      aiSuggestedDocumentId:
        anyOtherDocumentId || "66a97632-5bfe-4865-8079-c26dff1f745b",
      createdBy: null, // System generated
      fileSize: pdfBlob ? String(pdfBlob.size) : "0", // Handle null blob for client PDFs
      error: uploadResult.error
        ? {
            warning: "",
            error: "Failed to upload generated report to storage",
          }
        : { warning: "", error: "" },
      status: uploadResult.error
        ? DocumentLogsStatus.UploadError
        : DocumentLogsStatus.Uploaded,
      companyId: companyId,
      updatedBy: null, // System generated
      uploadedFromInvitationId: currentInvitationId,
      uploadedFromFormfieldId: null, // System generated
      cardName: `${questionaryName} Report`,
      version: `V${nextVersion}`,
    };

    const documentLogResult = await sdk.bulk_insert_document_logFiles({
      data: [documentLogEntry],
    });

    const documentLogId =
      documentLogResult.insert_DocumentLogs?.returning?.[0]?.id;

    if (documentLogId) {
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] DocumentLog entry created: ${documentLogId}`
      );
    }

    return documentLogId || null;
  } catch (error) {
    console.error(
      `[CARRY-FORWARD-SUGGESTIONS] Error creating DocumentLog entry:`,
      error
    );
    return null;
  }
};

/**
 * Create Sources entry linking the document to the system
 */
const createSourceEntry = async (
  documentLogId: string,
  formInvitationId: string,
  uploadResult: any
): Promise<string | null> => {
  try {
    const sourceEntry = {
      formInvitationId: formInvitationId,
      sourceOrigin: "system",
      documentLogsId: documentLogId,
      type: SourcesType.Uploaded.dbTittle,
      sourceFilesId: null, // Will be updated after SourceFiles creation
      url: uploadResult.fileUrl, // S3 URL
      sourceOriginId: null,
    };

    const sourceResult = await sdk.BulkInsertSources({
      data: sourceEntry,
    });

    const sourceId = sourceResult.insert_Sources?.returning?.[0]?.id;

    if (sourceId) {
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Sources entry created: ${sourceId}`
      );
    }

    return sourceId || null;
  } catch (error) {
    console.error(
      `[CARRY-FORWARD-SUGGESTIONS] Error creating Sources entry:`,
      error
    );
    return null;
  }
};

/**
 * Create SourceFiles entry for the uploaded PDF
 */
const createSourceFileEntry = async (
  sourceId: string,
  fileName: string,
  uploadResult: any,
  pdfBlob: Blob | null
): Promise<string | null> => {
  try {
    const anyOtherDocumentId = await getAnyOtherDocumentId();
    if (!anyOtherDocumentId) {
      console.warn(
        `[SERVER] Could not fetch "Any Other Document" ID, using fallback`
      );
    }
    const sourceFileEntry = {
      fileName: fileName,
      filePath: uploadResult.fileUrl, // S3 URL serves as file path
      originalFileName: fileName,
      originalFileUrl: uploadResult.fileUrl,
      fileSize: pdfBlob ? String(pdfBlob.size) : "0", // Handle null blob for client PDFs
      totalDataPointsAdded: 0, // No data points for PDF documents
      ingestionStartAt: new Date().toISOString(),
      ingestionEndAt: new Date().toISOString(),
      currentPage: 1,
      totalPages: 1, // PDF is treated as single unit
      status: SourceFilesStatus.Uploaded,
      uploadedByUserId: null, // System generated
      currentDataPointsCurated: 0,
      error: { warning: "", error: "" },
      aiSuggestedDocumentId:
        anyOtherDocumentId || "66a97632-5bfe-4865-8079-c26dff1f745b",
    };

    const sourceFileResult = await sdk.bulk_insert_sourceFiles({
      data: [sourceFileEntry],
    });

    const sourceFileId =
      sourceFileResult.insert_SourceFiles?.returning?.[0]?.id;

    if (sourceFileId) {
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] SourceFiles entry created: ${sourceFileId}`
      );
    }

    return sourceFileId || null;
  } catch (error) {
    console.error(
      `[CARRY-FORWARD-SUGGESTIONS] Error creating SourceFiles entry:`,
      error
    );
    return null;
  }
};

/**
 * Update Sources entry with the created SourceFiles ID
 */
const updateSourceWithFileId = async (
  sourceId: string,
  sourceFileId: string
): Promise<void> => {
  try {
    // Update the Sources entry to link it with the SourceFiles
    await sdk.updateSourcesById({
      id: sourceId,
      _set: { sourceFilesId: sourceFileId },
    });

    console.log(
      `[CARRY-FORWARD-SUGGESTIONS] Updated Sources entry ${sourceId} with SourceFiles ID: ${sourceFileId}`
    );
  } catch (error) {
    console.error(
      `[CARRY-FORWARD-SUGGESTIONS] Error updating Sources with file ID:`,
      error
    );
  }
};

/**
 * Create Suggestions entries and their source mappings
 */
const createSuggestionsWithMapping = async (
  previousAnswers: any[],
  currentInvitationId: string,
  sourceId: string | null, // Can be null if no PDF was generated
  previousFormSubmission: any,
  previousFormInvitation: any
): Promise<void> => {
  try {
    // Helper function to strip HTML tags from text
    const stripHtmlTags = (html: string): string => {
      if (typeof html !== "string") return html;

      // Remove HTML tags using regex - safe for server-side processing
      return html
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
        .replace(/&amp;/g, "&") // Replace HTML entities
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .trim(); // Remove leading/trailing whitespace
    };

    // Helper function to check if a value is empty/blank
    const isEmptyValue = (value: any): boolean => {
      if (value === null || value === undefined) return true;
      if (value === "") return true;
      if (Array.isArray(value) && value.length === 0) return true;
      if (typeof value === "object" && Object.keys(value).length === 0)
        return true;

      // Check nested value property (common pattern in answers)
      if (typeof value === "object" && value.hasOwnProperty("value")) {
        return isEmptyValue(value.value);
      }

      return false;
    };

    // Filter out answers with empty/blank values and clean HTML content
    const validAnswers = previousAnswers.filter((answer: any) => {
      const answerValue = answer.data?.value || answer.data;
      const isEmpty = isEmptyValue(answerValue);

      if (isEmpty) {
        console.log(
          `[CARRY-FORWARD-SUGGESTIONS] Skipping empty answer for formFieldId: ${answer.formFieldId}`
        );
      }

      return !isEmpty;
    });

    // Step 9: Insert Suggestions entries for each valid previous answer
    const suggestionEntries = validAnswers.map((answer: any) => {
      let cleanValue = answer.data?.value || answer.data || "Previous answer";

      // Clean HTML tags from the value if it's a string
      if (typeof cleanValue === "string") {
        cleanValue = stripHtmlTags(cleanValue);
      }

      return {
        formFieldId: answer.formFieldId,
        formInvitationId: currentInvitationId,
        suggestion: {
          value: cleanValue, // Store cleaned value without HTML tags
        },
        isSelected: false, // Default to not selected
        selectedByUserId: null, // No user selected initially
      };
    });

    if (suggestionEntries.length > 0) {
      // Use our bulk insert mutation for Suggestions
      const suggestionsResult = await sdk.bulkInsertSuggestions({
        objects: suggestionEntries,
      });

      const insertedSuggestions =
        suggestionsResult.insert_Suggestions?.returning || [];
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Created ${insertedSuggestions.length} suggestions from ${validAnswers.length} valid answers`
      );

      // Step 10: Link suggestions to their source via SuggestionSourceMapping (only if we have a sourceId)
      if (insertedSuggestions.length > 0 && sourceId) {
        const suggestionSourceMappingEntries = insertedSuggestions.map(
          (suggestion) => ({
            suggestionId: suggestion.id,
            sourceId: sourceId,
            suggestionInfoContent: JSON.stringify({
              source: "carry-forward",
              previousSubmissionId: previousFormSubmission.id,
              previousInvitationId: previousFormInvitation.id,
            }),
          })
        );

        const mappingResult = await sdk.bulkInsertSuggestionSourceMapping({
          objects: suggestionSourceMappingEntries,
        });

        console.log(
          `[CARRY-FORWARD-SUGGESTIONS] Created ${
            mappingResult.insert_SuggestionSourceMapping?.affected_rows || 0
          } suggestion-source mappings`
        );
      } else if (insertedSuggestions.length > 0 && !sourceId) {
        console.log(
          `[CARRY-FORWARD-SUGGESTIONS] Created ${insertedSuggestions.length} suggestions without source mapping (no PDF source available)`
        );
      }
    } else {
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] No valid suggestions to create - all ${previousAnswers.length} answers were empty`
      );
    }
  } catch (error) {
    console.error(
      `[CARRY-FORWARD-SUGGESTIONS] Error creating suggestions:`,
      error
    );
  }
};

/**
 * Log processing errors to database for tracking
 */
const logProcessingError = async (
  error: any,
  currentInvitationId: string,
  companyId: string,
  questionaryName?: string
): Promise<void> => {
  try {
    const errorLogEntry = {
      originalFileName: `CarryForward_Error_${currentInvitationId}_${Date.now()}.txt`,
      fileUrl: "",
      fileName: "",
      aiSuggestedDocumentId: null,
      createdBy: null,
      fileSize: "0",
      error: {
        warning: "",
        error:
          "Carry-forward suggestions processing failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      status: DocumentLogsStatus.UploadError,
      companyId: companyId,
      updatedBy: null,
      uploadedFromInvitationId: currentInvitationId,
      uploadedFromFormfieldId: null,
      cardName: `${questionaryName} Report (Failed)`,
      version: null,
    };

    await sdk.bulk_insert_document_logFiles({
      data: [errorLogEntry],
    });
  } catch (errorLogError) {
    console.error(
      `[CARRY-FORWARD-SUGGESTIONS] Failed to log error to database:`,
      errorLogError
    );
  }
};

/**
 * Core processing service for carry-forward-as-suggestions
 * Handles all business logic for processing previous form answers into suggestions
 */
export const processCarryForwardSuggestions = async (
  currentInvitationId: string,
  formId: string,
  companyId: string,
  authToken: string,
  questionaryName?: string,
  pdfUrl?: string,
  pdfFileName?: string
): Promise<void> => {
  console.log(
    `[CARRY-FORWARD-SUGGESTIONS] Starting processing for invitation: ${currentInvitationId}`
  );

  try {
    // Step 1: Get the most recent successfully submitted FormSubmission with its FormInvitation and Answers
    const lastSubmissionData = await sdk.getLastSubmittedInvitation({
      formId: formId,
      companyId: companyId,
      currentInvitationId: currentInvitationId,
    });

    if (
      !lastSubmissionData?.FormSubmission ||
      lastSubmissionData.FormSubmission.length === 0
    ) {
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] No previous successful submissions found for company: ${companyId}, form: ${formId}, invitation: ${currentInvitationId}`
      );
      return;
    }

    // Get the last successful FormSubmission (query returns exactly 1 result due to limit: 1)
    const lastFormSubmission = lastSubmissionData.FormSubmission[0];
    const previousFormInvitation = lastFormSubmission.FormInvitation;
    const previousAnswers = lastFormSubmission.Answers || [];

    if (!previousFormInvitation) {
      console.error(
        `[CARRY-FORWARD-SUGGESTIONS] No FormInvitation found for submission: ${lastFormSubmission.id}`
      );
      return;
    }

    if (previousAnswers.length === 0) {
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] No previous answers found for submission: ${lastFormSubmission.id}`
      );
      return;
    }

    console.log(
      `[CARRY-FORWARD-SUGGESTIONS] Found ${previousAnswers.length} previous answers from last successful submission (${lastFormSubmission.id})`
    );

    // Step 1.1: Update current FormInvitation metadata with source information (append to existing metadata)
    try {
      // First get the current invitation to retrieve existing metadata
      const currentInvitationData = await sdk.getFormInvitationDetailsbyId({
        invitationId: currentInvitationId,
        sourceType: "form",
      });

      const existingMetadata =
        currentInvitationData?.FormInvitation?.[0]?.metadata || {};

      // Merge existing metadata with carry-forward source information
      const updatedMetadata = {
        ...existingMetadata,
        carryForwardSource: {
          sourceSubmissionId: lastFormSubmission.id,
          sourceInvitationId: previousFormInvitation.id,
        },
      };

      await sdk.updateFormInvitation({
        invitationId: currentInvitationId,
        set: {
          metadata: updatedMetadata,
        },
      });

      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Updated current invitation metadata with source: ${lastSubmissionData}`
      );
    } catch (metadataError) {
      console.error(
        `[CARRY-FORWARD-SUGGESTIONS] Failed to update current invitation metadata:`,
        metadataError
      );
      // Continue processing even if metadata update fails
    }

    // Step 2: Get form field data for PDF generation
    const formFieldData = await sdk.getFormfieldAndAnswersByinvitationId({
      invitationId: previousFormInvitation.id,
    });

    if (!formFieldData?.FormSubmission?.[0]) {
      console.error(
        `[CARRY-FORWARD-SUGGESTIONS] No form field data found for previous invitation: ${previousFormInvitation.id}`
      );
      return;
    }

    // Step 3: Handle PDF processing based on form type
    let pdfBlob: Blob | null = null;
    let uploadResult: any = null;
    let fileName: string = "";

    // Check if this is a BRSR form
    const isBRSRForm =
      questionaryName === FORM_NAMES.BRSR_CORE ||
      questionaryName === FORM_NAMES.BRSR_QUESTIONNAIRE ||
      questionaryName === FORM_NAMES.BRSR_COMPREHENSIVE_CORE;

    if (pdfUrl && pdfFileName) {
      // Non-BRSR forms: Use client-provided PDF (already uploaded to S3)
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Using client-provided PDF: ${pdfUrl}`
      );
      uploadResult = {
        fileUrl: pdfUrl,
        fileName: pdfFileName,
        error: null,
      };
      fileName = pdfFileName;
    } else if (isBRSRForm) {
      // BRSR forms: Generate PDF on server using templates
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Generating PDF on server for BRSR form: ${questionaryName}`
      );

      pdfBlob = await generatePDFFromPreviousAnswers(
        formFieldData,
        questionaryName
      );

      if (!pdfBlob) {
        console.error(
          `[CARRY-FORWARD-SUGGESTIONS] Failed to generate PDF from previous answers for BRSR form`
        );
        return;
      }

      // Get financial year and generate filename for BRSR forms
      const financialYear = getFinancialYearFromFormData(formFieldData);
      fileName =
        questionaryName === FORM_NAMES.BRSR_QUESTIONNAIRE
          ? `BRSR_Questionnaire_${financialYear}.pdf`
          : questionaryName === FORM_NAMES.BRSR_COMPREHENSIVE_CORE
          ? `BRSR_Comprehensive_Core_${financialYear}.pdf`
          : `BRSR_Core_${financialYear}.pdf`;

      // Upload BRSR PDF to S3
      uploadResult = await uploadFileToS3(pdfBlob, fileName, companyId);

      if (uploadResult.error) {
        console.error(
          `[CARRY-FORWARD-SUGGESTIONS] Failed to upload BRSR PDF to S3:`,
          uploadResult.error
        );
        return;
      }
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] BRSR PDF uploaded successfully: ${uploadResult.fileUrl}`
      );
    } else {
      // Non-BRSR forms without client-provided PDF: Continue without PDF
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Non-BRSR form ${questionaryName} - continuing without PDF processing`
      );
      uploadResult = {
        fileUrl: "",
        fileName: "",
        error: null,
      };
      fileName = `${
        questionaryName?.replace(/[^a-zA-Z0-9]/g, "_") || "Report"
      }_Report.pdf`;
    }

    // Step 5: Calculate version number
    const nextVersion = await calculateDocumentVersion(companyId);

    // Step 6: Create DocumentLogs entry (only if we have a valid PDF file URL)
    let documentLogId: string | null = null;
    if (uploadResult.fileUrl) {
      documentLogId = await createDocumentLogEntry(
        fileName,
        uploadResult,
        pdfBlob,
        companyId,
        currentInvitationId,
        nextVersion,
        questionaryName
      );

      if (!documentLogId) {
        console.error(
          `[CARRY-FORWARD-SUGGESTIONS] Failed to create DocumentLog entry`
        );
        // Continue processing even if DocumentLog fails
      }
    } else {
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Skipping DocumentLog creation - no PDF file available`
      );
    }

    // Step 7: Create Sources entry (only if we have a DocumentLog)
    let sourceId: string | null = null;
    if (documentLogId) {
      sourceId = await createSourceEntry(
        documentLogId,
        currentInvitationId,
        uploadResult
      );

      if (!sourceId) {
        console.error(
          `[CARRY-FORWARD-SUGGESTIONS] Failed to create Sources entry`
        );
        // Continue processing even if Sources creation fails
      }
    } else {
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Skipping Sources creation - no DocumentLog available`
      );
    }

    // Step 8: Create SourceFiles entry (only if we have a Sources entry)
    let sourceFileId: string | null = null;
    if (sourceId) {
      sourceFileId = await createSourceFileEntry(
        sourceId,
        fileName,
        uploadResult,
        pdfBlob
      );

      if (!sourceFileId) {
        console.error(
          `[CARRY-FORWARD-SUGGESTIONS] Failed to create SourceFiles entry`
        );
        // Continue processing even if SourceFiles creation fails
      }

      // Step 8.1: Update Sources entry with sourceFilesId
      if (sourceFileId) {
        await updateSourceWithFileId(sourceId, sourceFileId);
      }
    } else {
      console.log(
        `[CARRY-FORWARD-SUGGESTIONS] Skipping SourceFiles creation - no Sources entry available`
      );
    }

    // Step 9: Create Suggestions and SuggestionSourceMapping entries
    await createSuggestionsWithMapping(
      previousAnswers,
      currentInvitationId,
      sourceId, // May be null if no PDF was generated/provided
      lastFormSubmission,
      previousFormInvitation
    );

    console.log(
      `[CARRY-FORWARD-SUGGESTIONS] Successfully completed processing for invitation: ${currentInvitationId}`
    );
  } catch (error) {
    console.error(`[CARRY-FORWARD-SUGGESTIONS] Error in processing:`, error);

    // Log error to database for tracking
    await logProcessingError(
      error,
      currentInvitationId,
      companyId,
      questionaryName
    );
  }
};
