import { sdk } from "@warp/graphql/generated/server";
import { upload } from "@warp/server/services/aws-s3.service";
import {
  DocumentLogsStatus,
  FORM_NAMES,
} from "@warp/shared/constants/app.constants";
import htmlToPdfmake from "html-to-pdfmake";
import { JSDOM } from "jsdom";
import jsonata from "jsonata";
import { nanoid } from "nanoid";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Readable } from "stream";
/**
 * Server-side compatible htmlToPdfmake function using JSDOM
 * This function works without requiring a browser window object
 */
const htmlToPdfmakeServer = (htmlString: string): any => {
  try {
    if (!htmlString || typeof htmlString !== "string") {
      return htmlString;
    }

    // Handle empty or whitespace-only strings
    if (htmlString.trim() === "") {
      return htmlString;
    }

    // Create a virtual DOM using JSDOM
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body>${htmlString}</body></html>`
    );
    const window = dom.window;

    // Set global window object temporarily for htmlToPdfmake
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;

    global.window = window as any;
    global.document = window.document as any;

    // Use the original htmlToPdfmake function with the virtual DOM
    const result = htmlToPdfmake(htmlString, { window: window as any });

    // Restore original global references
    if (originalWindow) {
      (global as any).window = originalWindow;
    } else {
      delete (global as any).window;
    }

    if (originalDocument) {
      (global as any).document = originalDocument;
    } else {
      delete (global as any).document;
    }

    return result;
  } catch (error) {
    console.error("[SERVER] Error converting HTML to pdfMake:", error);
    console.error(
      "[SERVER] Input HTML:",
      htmlString?.substring(0, 200) + "..."
    );
    // Return the original string if conversion fails
    return htmlString;
  }
};

// Server-side interfaces (copied from client-side for independence)
interface DocumentLogWithAISuggested {
  id: string;
  originalFileName: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  createdBy: string;
  deletedAt?: string;
  deletedBy?: string;
  aiSuggestedDocumentId?: string;
  AISuggestedDocuments?: {
    title: string;
    isOther: boolean;
  };
  CreatedByUser?: {
    name: string;
  };
  DeletedByUser?: {
    name: string;
  };
}

interface DocumentLogWithVersion extends DocumentLogWithAISuggested {
  calculatedVersion: number;
}

/**
 * Server-side version calculation function (independent implementation)
 */
const calculateVersionsOnServer = (
  documentLogs: DocumentLogWithAISuggested[]
): DocumentLogWithVersion[] => {
  // Group documents by AISuggestedDocument ID
  const groupedByDocument = documentLogs.reduce((acc, log) => {
    const docId = log.aiSuggestedDocumentId || "unknown";
    if (!acc[docId]) {
      acc[docId] = [];
    }
    acc[docId].push(log);
    return acc;
  }, {} as Record<string, DocumentLogWithAISuggested[]>);

  const result: DocumentLogWithVersion[] = [];

  Object.entries(groupedByDocument).forEach(([docId, logs]) => {
    // Sort by creation date (oldest first) to get chronological order
    const sortedLogs = logs.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Count upload attempts chronologically
    let uploadCount = 0;

    sortedLogs.forEach((log) => {
      // Increment version for each new file entry (upload or delete action)
      uploadCount++;

      result.push({
        ...log,
        calculatedVersion: uploadCount,
      });
    });
  });

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Server-side answer conversion function (match client-side implementation)
 */
export const convertDBAnswersToStoreAnswersOnServer = (
  formFields: any[],
  answers: any[]
): any => {
  console.log(
    `[SERVER] Converting ${answers?.length || 0} answers with ${formFields?.length || 0
    } fields`
  );

  const result = answers.reduce((acc, curr) => {
    const formField = formFields.find((m) => m.id === curr.formFieldId);
    if (!formField) return acc;

    acc[formField.field] = {
      questionId: curr.questionId,
      field: formField.field,
      formFieldId: curr.formFieldId,
      value: curr.data?.value, // Match client-side: use curr.data?.value instead of curr.value
    };

    return acc;
  }, {} as any);

  console.log(
    `[SERVER] Converted answer object has ${Object.keys(result).length} fields`
  );
  return result;
};

/**
 * Dynamically fetch the "Any Other Document" ID from AI suggested documents
 */
export const getAnyOtherDocumentId = async (): Promise<string | null> => {
  try {
    const aiSuggestedDocumentsData = await sdk.GetAISuggestedDocuments();

    const otherDocument = aiSuggestedDocumentsData?.AISuggestedDocuments?.find(
      (doc: any) => doc.isOther === true
    );

    return otherDocument?.id || null;
  } catch (error) {
    console.error("Error fetching AI suggested documents:", error);
    return null;
  }
};

/**
 * Generate Core Checklist PDF blob on server (similar to client-side logic)
 */
export const generateCoreChecklistPDFBlobOnServer = async (
  formFielddata: any
): Promise<Blob | null> => {
  try {
    // Use the Core Checklist template URL
    const templateUrl =
      "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/templates/BRSR_Comprehensive_Core_Template.txt";

    const htmlContent = await fetch(templateUrl).then((response) =>
      response.text()
    );

    if (!htmlContent || !formFielddata) {
      throw new Error("Missing Core Checklist template content or form data");
    }

    // Convert DB answers to store format using server-side function
    const AnswerObject = convertDBAnswersToStoreAnswersOnServer(
      formFielddata?.FormSubmission?.[0]?.FormInvitation?.Form?.FormFields,
      formFielddata?.FormSubmission?.[0]?.Answers ?? []
    );

    // Process advanced fields (server-side compatible with JSDOM)
    formFielddata?.FormSubmission?.[0]?.FormInvitation?.Form?.FormFields.forEach(
      (rec: any) => {
        if (rec?.interfaceOptions?.isAdvance === true) {
          // Use server-side htmlToPdfmake conversion
          const pdfMakeContent = htmlToPdfmakeServer(
            AnswerObject[rec?.field]?.value
          );
          if (AnswerObject[rec?.field]) {
            AnswerObject[rec?.field].value = pdfMakeContent;
          }
        }

        // Handle scientific notation (same as client-side logic)
        if (/e[-+]?\d+/i.test(String(AnswerObject[rec?.field]?.value))) {
          AnswerObject[rec?.field].value = AnswerObject[
            rec?.field
          ]?.value?.toLocaleString("fullwide", { useGrouping: false });
        }
      }
    );

    // Process template
    const newtemplate = await jsonata(htmlContent).evaluate(AnswerObject);
    const _ = require("lodash");
    const clonedTemplate = _.cloneDeep(newtemplate);

    // Configure PDF make for server-side use (match client-side font configuration)
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs;

    // Use same fonts configuration as client-side
    pdfMake.fonts = {
      OpenSans: {
        normal: "Roboto-Regular.ttf",
        bold: "Roboto-Medium.ttf",
        italics: "Roboto-Italic.ttf",
        bolditalics: "Roboto-Italic.ttf",
      },
      Roboto: {
        normal: "Roboto-Regular.ttf",
        bold: "Roboto-Medium.ttf",
      },
    };

    // Generate PDF blob using callback approach for server-side
    return new Promise<Blob>((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(clonedTemplate);
        pdfDoc.getBuffer((buffer: Buffer) => {
          // Convert Buffer to Blob for compatibility
          const uint8Array = new Uint8Array(buffer);
          const blob = new Blob([uint8Array], { type: "application/pdf" });
          resolve(blob);
        });
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.error("Error generating Core Checklist PDF blob:", error);
    return null;
  }
};

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
 * Server-side AI background report generation service
 * This runs independently of the client browser and won't be interrupted
 */
export const generateAIBackgroundReportOnServer = async (
  invitationId: string,
  questionaryName: string,
  userId: string,
  companyId?: string,
  authToken?: string,
): Promise<void> => {
  console.log(
    `[SERVER] Starting background report generation for invitation: ${invitationId}`
  );

  try {
    // Step 1: Fetch form field data using SDK
    let formFielddata;
    try {
      formFielddata = await sdk.getFormfieldAndAnswersByinvitationId({
        invitationId: invitationId,
      });

      if (!formFielddata?.FormSubmission?.[0]) {
        console.error(
          `[SERVER] No FormSubmission found for invitationId: ${invitationId}`
        );
        throw new Error("Failed to fetch form field data - no data returned");
      }
    } catch (sdkError) {
      console.error(`[SERVER] SDK Error:`, sdkError);
      throw new Error(
        `Failed to fetch form field data: ${sdkError instanceof Error ? sdkError.message : "Unknown SDK error"
        }`
      );
    }

    // Step 2: Generate PDF blob - choose the right function based on form type
    let pdfBlob;
    if (questionaryName === FORM_NAMES.BRSR_COMPREHENSIVE_CORE) {
      // ONLY BRSR Comprehensive Core uses Core Checklist
      pdfBlob = await generateCoreChecklistPDFBlobOnServer(formFielddata);
      console.log(
        `[SERVER] Using Core Checklist generation for: ${questionaryName}`
      );
    } else if (
      questionaryName === FORM_NAMES.BRSR_CORE ||
      questionaryName === FORM_NAMES.BRSR_QUESTIONNAIRE
    ) {
      // BOTH BRSR Core and BRSR Questionnaire use regular BRSR Report template
      pdfBlob = await generatePDFBlobOnServer(formFielddata, questionaryName);
      console.log(
        `[SERVER] Using BRSR Report template for: ${questionaryName}`
      );
    } else {
      // Other forms use regular PDF generation
      pdfBlob = await generatePDFBlobOnServer(formFielddata, questionaryName);
      console.log(
        `[SERVER] Using regular PDF generation for: ${questionaryName}`
      );
    }

    if (!pdfBlob) {
      throw new Error("Failed to generate PDF blob");
    }
    const financialYear = getFinancialYearFromFormData(formFielddata);

    // Step 3: Upload to S3 - adjust filename based on report type
    const fileName =
      questionaryName === FORM_NAMES.BRSR_QUESTIONNAIRE
        ? `BRSR_Questionnaire_${financialYear}.pdf`
        : questionaryName === FORM_NAMES.BRSR_COMPREHENSIVE_CORE
          ? `BRSR_Comprehensive_Core_${financialYear}.pdf`
          : `${questionaryName.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )}_Report_${financialYear}.pdf`;
    const uploadResult = await uploadFileToS3(pdfBlob, fileName, companyId);

    // Step 4: Dynamically fetch "Any Other Document" ID
    const anyOtherDocumentId = await getAnyOtherDocumentId();
    if (!anyOtherDocumentId) {
      console.warn(
        `[SERVER] Could not fetch "Any Other Document" ID, using fallback`
      );
    }

    // Step 5: Calculate version using calculateVersionsOnServer
    let nextVersion = 1;
    try {
      const documentLogsData =
        await sdk.GetDocumentLogsWithAISuggestedDocuments({
          where: {
            companyId: { _eq: companyId },
          },
        });

      if (
        documentLogsData?.DocumentLogs &&
        documentLogsData.DocumentLogs.length > 0
      ) {
        const versionsCalculated = calculateVersionsOnServer(
          documentLogsData.DocumentLogs as any
        );

        const logsForDocument = versionsCalculated.filter(
          (log) => log.aiSuggestedDocumentId === anyOtherDocumentId
        );

        if (logsForDocument.length > 0) {
          const maxVersion = logsForDocument.reduce((max, log) => {
            return Math.max(max, log.calculatedVersion);
          }, 0);
          nextVersion = maxVersion + 1;
        }
      }
    } catch (versionError) {
      console.error("Error calculating version:", versionError);
      // Continue with version 1 as fallback
    }

    // Step 6: Insert document log entry using SDK
    const documentLogEntry = {
      originalFileName: fileName,
      fileUrl: uploadResult.error ? "" : uploadResult.fileUrl || "",
      fileName: uploadResult.error
        ? fileName
        : uploadResult.fileName || fileName,
      aiSuggestedDocumentId:
        anyOtherDocumentId || "66a97632-5bfe-4865-8079-c26dff1f745b", // Dynamic ID with fallback
      createdBy: null, // System generated
      fileSize: String(pdfBlob.size),
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
      uploadedFromInvitationId: invitationId,
      uploadedFromFormfieldId: null, // System generated
      cardName: `${questionaryName} Report`,
      version: `V${nextVersion}`,
    };

    console.log(`[SERVER] Calculated version for new report: V${nextVersion}`);
    console.log(
      `[SERVER] Using aiSuggestedDocumentId: ${anyOtherDocumentId || "fallback"
      }`
    );

    const insertedDocs = await sdk.bulk_insert_document_logFiles({
      data: [documentLogEntry],
    });

    // Query for active subscription using data from client's localStorage
    const subscriptionData = await sdk.GetActiveSubscriptionByCompanyId({
      companyId,
      userId,
    });

    // Check if there are active user allocations
    const hasActiveSubscription =
      subscriptionData?.AIChatSubscription &&
      subscriptionData.AIChatSubscription.length > 0 &&
      subscriptionData.AIChatSubscription[0]?.AIChatUserAllocations &&
      subscriptionData.AIChatSubscription[0].AIChatUserAllocations.length > 0;

    // Step 7: Call AI Server API to parse document and generate embeddings
    // Only attempt to parse if user has AIChatSubscription 
    if (!uploadResult.error && insertedDocs?.insert_DocumentLogs?.returning?.[0] && hasActiveSubscription) {
      try {
        const insertedDoc = insertedDocs.insert_DocumentLogs.returning[0];

        // Prepare payload for parse-file API (same format as AIProcessing.ts fileParsing case)
        const parseFilePayload = [
          {
            url: uploadResult.fileUrl,
            document_log_id: insertedDoc.id,
            company_id: companyId,
            user_id: userId,
          },
        ];

        console.log(`[SERVER] Calling AI Server API to parse document:`, parseFilePayload);

        // Make API request to parse-file endpoint
        const { apiRequest } = await import("../../../packages/client/libs/api-request");
        const parseResponse = await apiRequest.post(
          process.env["NEXT_PUBLIC_AIAPI_BASE_URL"] + "parse-document",
          parseFilePayload
        );

        // Axios responses don't have an `ok` property (that's from fetch); check status code range instead.
        if (parseResponse?.statusText === "OK" || (typeof parseResponse?.status === "number" && parseResponse.status >= 200 && parseResponse.status < 300)) {
          console.log(`[SERVER] Successfully initiated document parsing for document ID: ${insertedDoc.id}`);

          // Update document logs status to Processing and set extractionPercentage to 0
          try {
            await sdk.bulk_update_document_logFiles({
              deletes: [],
              updates: [
                {
                  where: { id: { _eq: insertedDoc.id } },
                  _set: {
                    status: "Processing",
                    extractionPercentage: "0",
                  },
                },
              ],
            });
            console.log(`[SERVER] Updated document status to Processing for document ID: ${insertedDoc.id}`);
          } catch (updateError) {
            console.error(`[SERVER] Error updating document status to Processing:`, updateError);
          }
        } else {
          console.warn(`[SERVER] Document parsing API returned non-OK status:`, parseResponse?.status);
        }
      } catch (parseError) {
        console.error(`[SERVER] Error calling AI Server API for document parsing:`, parseError);
        // Don't throw error here - document upload was successful, parsing is supplementary
      }
    }

    if (uploadResult.error) {
      console.error(
        `[SERVER] Failed to upload AI generated report:`,
        uploadResult.error
      );
    } else {
      console.log(
        `[SERVER] Successfully generated and uploaded AI report:`,
        uploadResult.fileUrl
      );
    }
  } catch (error) {
    console.error(`[SERVER] Error in background report generation:`, error);

    // Insert error record to database for tracking using SDK
    try {
      // Try to get the dynamic ID, but use fallback if it fails
      const errorAnyOtherDocumentId = await getAnyOtherDocumentId().catch(
        () => "66a97632-5bfe-4865-8079-c26dff1f745b"
      );

      const errorDocumentLog = {
        originalFileName: `${questionaryName.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}_${invitationId}_${Date.now()}.pdf`,
        fileUrl: "",
        fileName: "",
        aiSuggestedDocumentId: errorAnyOtherDocumentId,
        createdBy: null,
        fileSize: "0",
        error: {
          warning: "",
          error:
            "Report generation failed: " +
            (error instanceof Error ? error.message : "Unknown error"),
        },
        status: DocumentLogsStatus.UploadError,
        companyId: companyId,
        updatedBy: null,
        uploadedFromInvitationId: invitationId,
        uploadedFromFormfieldId: null,
        cardName: `${questionaryName} Report (Failed)`,
        version: null,
      };

      await sdk.bulk_insert_document_logFiles({
        data: [errorDocumentLog],
      });
    } catch (errorLogError) {
      console.error(`[SERVER] Failed to log error to database:`, errorLogError);
    }
  }
};

/**
 * Generate PDF blob on server
 */
export const generatePDFBlobOnServer = async (
  formFielddata: any,
  questionaryName: string
): Promise<Blob | null> => {
  try {
    // Fetch template content - match client-side logic exactly
    const templateUrl =
      questionaryName === FORM_NAMES.BRSR_CORE
        ? "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/templates/BRSR_Core_Template.txt"
        : questionaryName === FORM_NAMES.BRSR_QUESTIONNAIRE
          ? "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/templates/brsr2_template_5.txt" // BRSR Questionnaire also uses BRSR Report template
          : questionaryName === FORM_NAMES.BRSR_COMPREHENSIVE_CORE
            ? "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/templates/BRSR_Comprehensive_Core_Template.txt"
            : "https://s3.ap-south-1.amazonaws.com/snowkap.warplive.files/public/templates/brsr2_template_5.txt";
    console.log(
      `[SERVER] Using template for ${questionaryName}: ${templateUrl}`
    );

    const htmlContent = await fetch(templateUrl).then((response) =>
      response.text()
    );

    if (!htmlContent || !formFielddata) {
      throw new Error("Missing template content or form data");
    }

    // Convert DB answers to store format using server-side function
    const AnswerObject = convertDBAnswersToStoreAnswersOnServer(
      formFielddata?.FormSubmission?.[0]?.FormInvitation?.Form?.FormFields,
      formFielddata?.FormSubmission?.[0]?.Answers ?? []
    );

    // Process advanced fields using server-side htmlToPdfmake
    formFielddata?.FormSubmission?.[0]?.FormInvitation?.Form?.FormFields.forEach(
      (rec: any) => {
        if (rec?.interfaceOptions?.isAdvance === true) {
          console.log(
            `[SERVER] Processing htmlToPdfmake for advanced field: ${rec?.field} using JSDOM`
          );
          const pdfMakeContent = htmlToPdfmakeServer(
            AnswerObject[rec?.field]?.value
          );
          if (AnswerObject[rec?.field]) {
            AnswerObject[rec?.field].value = pdfMakeContent;
          }
        }

        // Handle scientific notation
        if (/e[-+]?\d+/i.test(String(AnswerObject[rec?.field]?.value))) {
          AnswerObject[rec?.field].value = AnswerObject[
            rec?.field
          ]?.value?.toLocaleString("fullwide", { useGrouping: false });
        }
      }
    );

    // Process template
    const newtemplate = await jsonata(htmlContent).evaluate(AnswerObject);
    const _ = require("lodash");
    const clonedTemplate = _.cloneDeep(newtemplate);

    // Configure PDF make for server-side use (match client-side font configuration)
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs;

    // Use same fonts configuration as client-side
    pdfMake.fonts = {
      OpenSans: {
        normal: "Roboto-Regular.ttf",
        bold: "Roboto-Medium.ttf",
        italics: "Roboto-Italic.ttf",
        bolditalics: "Roboto-Italic.ttf",
      },
      Roboto: {
        normal: "Roboto-Regular.ttf",
        bold: "Roboto-Medium.ttf",
      },
    };

    // Generate PDF blob using callback approach for server-side
    return new Promise<Blob>((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(clonedTemplate);
        pdfDoc.getBuffer((buffer: Buffer) => {
          // Convert Buffer to Blob for compatibility
          const uint8Array = new Uint8Array(buffer);
          const blob = new Blob([uint8Array], { type: "application/pdf" });
          resolve(blob);
        });
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.error("Error generating PDF blob:", error);
    return null;
  }
};

/**
 * Upload file to S3 using existing AWS S3 service
 */
const uploadFileToS3 = async (
  blob: Blob,
  fileName: string,
  companyId?: string
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
      forceInlineViewing: true, //  Flag to enable PDF inline viewing
      ContentType: "application/pdf", //  Set proper content type
      ContentDisposition: `inline; filename="${fileName}"`, //  Force inline viewing
    };
    // Upload to S3 using existing service
    const result = await upload(uploadFileName, "", stream, uploadOptions);

    return {
      fileUrl: result.Location,
      fileName: result.Key?.split("/").pop() || fileName,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return {
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};
