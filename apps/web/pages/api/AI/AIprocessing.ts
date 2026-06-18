import { apiRequest } from "@warp/client/libs/api-request";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import { OpsToIqCuration_Insert_Input, WebCuration_Insert_Input } from "@warp/graphql/generated/types";
import {
  AI_SUPPORTED_FILE_EXTENSIONS,
  bulkFileCurationStatus,
  DocumentLogsStatusServer,
  FormInvitationStatus,
  SourceFilesStatus,
  webCurationAPIDataType
} from "@warp/shared/constants/app.constants";
import { NextApiHandler } from "next";

// helper: do the ingesting flow (extracted from 'ingesting' case)
async function processIngestingSingle(data: {
  form_invitation_id: string;
  company_id?: string | null;
}): Promise<any> {
  const formInvitationId = data.form_invitation_id;
  // add into formSSubmission
  try {
    const formSubmissionData = {
      invitationId: formInvitationId,
      isActive: true,
    };

    await sdk.bulkInsertFormSubmission({
      formSubmissionInput: formSubmissionData,
    });
  } catch (error) {
    console.warn("FormSubmission insertion failed:", error);
  }
  // load page data (keep for form/submission ids)
  const pageLoadSourceFileData = (await sdk.getSourceDataByInvitationId?.({
    invitationId: formInvitationId,
  })) ?? { Sources: [], FormInvitation: [] };

  const companyId =
    data.company_id ??
    pageLoadSourceFileData?.FormInvitation?.[0]?.companyId ??
    null;

  // fetch document logs
  let documentLogs: any[] = [];
  try {
    const dlRes = (await sdk.GetDocumentLogsWithSources?.({
      where: {
        companyId: { _eq: companyId },
        status: { _in: [DocumentLogsStatusServer.Uploaded, DocumentLogsStatusServer.Processing, DocumentLogsStatusServer.Processed] },
        createdBy: { _is_null: false },
      },
      limit: 1000,
      offset: 0,
      order_by: [{ createdAt: "desc" as any }],
    })) ?? { DocumentLogs: [] };
    documentLogs = dlRes?.DocumentLogs ?? [];

    /**
     * Document Collection Strategy for AI Processing
     *
     * PURPOSE: Collect documents from two sources for comprehensive AI analysis
     *
     * SOURCE 1: Documents from DocumentLogs table, except system-generated (all)
     *
     * SOURCE 2: Previous Period System Report (1 file)
     * - Find immediate previous reporting period (e.g., if current is 25-26, look for 24-25)
     * - Search for FormInvitation from that period with same company/user
     * - If not found, skip historical report (no recursive search)
     * - Retrieve the system-generated report from that period
     *
     * RESULT: Merge both sources for AI processing
     */

    const currentFormInvitation = pageLoadSourceFileData?.FormInvitation?.[0];

    let historicalSystemReport: any[] = [];

    //If Form is AI enabled && currentFormInvitation exists
    if (
      currentFormInvitation.Form.isAIDataPointsAdded &&
      currentFormInvitation
    ) {
      try {
        // Extract current period dates
        const currentDurationFrom = new Date(
          currentFormInvitation.durationFrom
        );
        const currentDurationTo = new Date(currentFormInvitation.durationTo);

        // Calculate previous period (subtract 1 year from both dates)
        const previousDurationFrom = new Date(currentDurationFrom);
        previousDurationFrom.setFullYear(
          previousDurationFrom.getFullYear() - 1
        );

        const previousDurationTo = new Date(currentDurationTo);
        previousDurationTo.setFullYear(previousDurationTo.getFullYear() - 1);

        console.log(
          `[AIProcessing] current duration: ${currentDurationFrom.toISOString().split("T")[0]
          } to ${currentDurationTo.toISOString().split("T")[0]}`
        );
        console.log(
          `[AIProcessing] Searching for previous period report: ${previousDurationFrom.toISOString().split("T")[0]
          } to ${previousDurationTo.toISOString().split("T")[0]}`
        );

        // Search for ALL FormInvitations from previous period (there may be
        // multiple under the same company/form/period combination)
        const previousInvitationResult = await sdk.GetExistingFormInvitation({
          companyId: [companyId],
          formId: [currentFormInvitation.formId],
          durationFrom: previousDurationFrom.toISOString().split("T")[0],
          durationTo: previousDurationTo.toISOString().split("T")[0],
          parentcompanyId: [
            pageLoadSourceFileData?.FormInvitation?.[0]?.parentcompanyId,
          ],
        });

        // Collect ALL matching invitations — not just the first one
        const previousInvitations =
          previousInvitationResult?.FormInvitation ?? [];

        if (previousInvitations.length > 0) {
          console.log(
            `[AIProcessing] Found ${previousInvitations.length} previous invitation(s) for previous period`
          );

          // Gather every invitation ID from the previous period for this form
          const previousInvitationIds = previousInvitations.map(
            (inv: any) => inv.id
          );

          // Fetch system-generated reports across ALL previous-period invitations.
          // Business rule (mirrors document-repository.tsx selectLatestSystemGeneratedPerForm):
          // all these invitations share the same formId, so fetch all and pick the latest by createdAt.
          const previousReportResult = await sdk.GetDocumentLogsWithSources({
            where: {
              uploadedFromInvitationId: { _in: previousInvitationIds },
              createdBy: { _is_null: true }, // System-generated files have null createdBy
              status: { _in: [DocumentLogsStatusServer.Uploaded, DocumentLogsStatusServer.Processing, DocumentLogsStatusServer.Processed] },
            },
            order_by: [{ createdAt: "desc" as any }],
          });

          const allPreviousReports =
            previousReportResult?.DocumentLogs ?? [];

          // First result is the latest (desc order) — single report, same rule as document-repository.tsx
          const previousReport =
            allPreviousReports.length > 0 ? allPreviousReports[0] : null;

          if (previousReport) {
            console.log(
              `[AIProcessing] Found previous system report: ${previousReport.originalFileName}`
            );
            historicalSystemReport = [previousReport];
          } else {
            console.log(
              `[AIProcessing] No system-generated report found for previous period`
            );
          }
        } else {
          console.log(
            `[AIProcessing] No FormInvitation found for previous period`
          );
        }
      } catch (error) {
        console.warn(`[AIProcessing] Error fetching historical report:`, error);
      }
    }

    // Filter documents to only include supported file types for AI processing
    const filteredDocumentLogs = documentLogs.filter((log: any) => {
      const fileName = log.originalFileName || "";
      const fileExtension = fileName.split(".").pop()?.toLowerCase();
      const isSupported = AI_SUPPORTED_FILE_EXTENSIONS.includes(
        fileExtension as any
      );

      if (!isSupported) {
        console.warn(
          `Excluding file from AI processing - unsupported type: ${fileName} (extension: ${fileExtension})`
        );
      }

      return isSupported;
    });

    // Merge current documents with historical system report
    const mergedDocumentLogs = [...filteredDocumentLogs];
    if (historicalSystemReport.length > 0) {
      mergedDocumentLogs.push(...historicalSystemReport);
    }
    documentLogs = mergedDocumentLogs;
  } catch (err) {
    console.warn("GetDocumentLogsWithSources failed", err);
    documentLogs = [];
  }

  if (!documentLogs.length) {
    return { message: "No DocumentLogs to replicate", data: null };
  }

  // build SourceFiles payload first
  const sourceFilesToInsert = documentLogs.map((log: any) => ({
    originalFileUrl: log.originalFileUrl ?? log.fileUrl ?? null,
    originalFileName: log.originalFileName ?? log.name ?? null,
    uploadedByUserId: log.createdByUserId ?? log.createdBy ?? null,
    created_at: log.created_at ?? log.createdAt ?? new Date().toISOString(),
    fileName: log.fileName ?? null,
    filePath: log.fileUrl ?? null,
    fileSize: log.fileSize ?? null,
    status: SourceFilesStatus.Ingesting,
    ingestionStartAt: new Date().toISOString(),
  }));

  let insertedSourceFiles: any[] = [];
  try {
    const sfRes =
      (await sdk.bulk_insert_sourceFiles({
        data: sourceFilesToInsert,
      })) ?? {};
    insertedSourceFiles = sfRes?.insert_SourceFiles?.returning ?? [];
  } catch (err) {
    console.warn(
      "insert_SourceFiles failed, continuing with best-effort mapping",
      err
    );
    insertedSourceFiles = [];
  }

  const urlToSourceFile = new Map<string, any>();
  insertedSourceFiles.forEach((sf: any) => {
    const key = String(sf.originalFileUrl ?? "").trim();
    if (key) urlToSourceFile.set(key, sf);
  });

  const sourcesToInsert = documentLogs.map((log: any) => {
    const key = String(log.originalFileUrl ?? log.fileUrl ?? "").trim();
    const matchedSourceFile = urlToSourceFile.get(key);
    return {
      formInvitationId: formInvitationId,
      type: FormInvitationStatus.Uploaded as string,
      url: log.fileUrl ?? null,
      sourceFilesId: matchedSourceFile?.id ?? null,
      documentLogsId: log.id,
      created_at: log.createdAt ?? new Date().toISOString(),
    };
  });

  let insertedSourcesFromDb: any[] = [];
  try {
    const srcInsertRes =
      (await sdk.BulkInsertSources({
        data: sourcesToInsert,
      })) ?? {};
    insertedSourcesFromDb = srcInsertRes?.insert_Sources?.returning ?? [];
  } catch (err) {
    console.warn(
      "insert_Sources failed, continuing with best-effort mapping",
      err
    );
    insertedSourcesFromDb = [];
  }

  const processedDocuments = insertedSourcesFromDb.map((s: any) => ({
    sourceId: String(s.id),
    status: SourceFilesStatus.Ingesting,
  }));

  let AIBulkDocumentProcessingsData: any = null;
  try {
    AIBulkDocumentProcessingsData =
      await sdk.bulk_insert_AIBulkDocumentProcessing?.({
        data: [
          {
            formInvitationId: formInvitationId,
            processedDocuments,
            requestStatus: bulkFileCurationStatus.Processing,
          },
        ],
      });
  } catch (err) {
    console.warn("bulk_insert_AIBulkDocumentProcessing failed", err);
  }

  // mapping from sourceId to sourceFile data for efficient lookup
  const sourceIdToSourceFile = new Map<string, any>();
  insertedSourceFiles.forEach((sf: any) => {
    if (sf.id) {
      sourceIdToSourceFile.set(String(sf.id), sf);
    }
  });

  // mapping from documentLogsId to documentLog data for efficient lookup
  const documentLogsIdToDocumentLog = new Map<string, any>();
  documentLogs.forEach((log: any) => {
    if (log.id) {
      documentLogsIdToDocumentLog.set(String(log.id), log);
    }
  });

  // Update the files mapping to use data from insertedSourceFiles
  const finalIngestPayload = [
    {
      form_invitation_id: formInvitationId,
      form_id: pageLoadSourceFileData?.FormInvitation?.[0]?.formId,
      company_id: companyId,
      submission_id:
        pageLoadSourceFileData?.FormInvitation?.[0]?.FormSubmissions?.[0]?.id,
      request_id:
        AIBulkDocumentProcessingsData?.insert_AIBulkDocumentProcessing?.returning?.filter(
          (items: any) => items?.formInvitationId == formInvitationId
        )?.[0]?.id ?? null,
      files: insertedSourcesFromDb.map((s: any) => {
        // Get the corresponding sourceFile data using sourceFilesId
        const sourceFile = sourceIdToSourceFile.get(
          String(s?.sourceFilesId ?? "")
        );

        // Get the corresponding documentLog data using documentLogsId
        const documentLog = documentLogsIdToDocumentLog.get(
          String(s?.documentLogsId ?? "")
        );

        return {
          url: String(s?.url ?? ""),
          file_name: String(sourceFile?.fileName ?? s?.fileName ?? ""),
          original_filename: String(
            sourceFile?.originalFileName ?? s?.originalFileName ?? ""
          ),
          source_id: String(s?.id),
          document_logs_id: String(s?.documentLogsId ?? ""),
          is_processed: documentLog ? (documentLog.status === DocumentLogsStatusServer.Processed || documentLog.status === DocumentLogsStatusServer.Processing) : false,
        };
      }),
    },
  ];
  console.log("Ingest payload prepared:", JSON.stringify(finalIngestPayload));

  const resp = await apiRequest.post(
    process.env["NEXT_PUBLIC_AIAPI_BASE_URL"] + "embeddings/ingest-files",
    finalIngestPayload
  );

  return resp?.data ?? null;
}

// new helper: prepare payload and trigger web curation for a single invitation
// returns the payload that should be sent to external AI/web curation API (or null on failure)
const triggerWebCurationForInvitation = async (invitation: {
  invitationFormId: string;
  formId?: string;
  companyId?: string;
  created_by?: string;
}): Promise<webCurationAPIDataType[] | null> => {
  try {
    if (!invitation || !invitation.invitationFormId) return null;
    // prepare single-row WebCuration insert payload (API expects array)
    const webCurationInsertInput: WebCuration_Insert_Input[] = [
      {
        formInvitationId: invitation.invitationFormId,
        status: FormInvitationStatus.Processing as any,
        triggeredByUserId: invitation.created_by ?? "",
        startAt: new Date().toISOString(),
      },
    ];

    // insert WebCuration row and capture returned ids (if available)
    let webCurationInsertion: any = null;
    try {
      webCurationInsertion = await sdk.bulkinsertwebCuration({
        webCurationInsertInput: webCurationInsertInput,
      });
    } catch (err) {
      console.warn("webCuration insert failed:", err);
      webCurationInsertion = null;
    }

    // build payload for external web curation API
    const returningRows: any[] =
      webCurationInsertion?.insert_WebCuration?.returning || [];

    const matching = returningRows.find(
      (r) => String(r?.formInvitationId) === String(invitation.invitationFormId)
    );

    const formInvitationData: webCurationAPIDataType[] = [
      {
        company_id: invitation.companyId ?? "",
        form_id: invitation.formId ?? "",
        form_invitation_id: invitation.invitationFormId,
        web_curation_id: matching?.id ?? "",
        created_by: invitation.created_by ?? "",
      } as webCurationAPIDataType,
    ];

    return formInvitationData;
  } catch (error) {
    console.error("triggerWebCurationForInvitation error:", error);
    return null;
  }
};

// Helper: prepare payload and trigger OPS-to-IQ curation with tracking
const triggerOPSToIQCurationForInvitation = async (invitation: {
  invitationFormId: string;
  formId?: string;
  iqCompanyId?: string;
  opsCompanyId?: string;
  opsCompanyName?: string;
  submissionId?: string;
  created_by?: string;
}): Promise<{ payload: any; opsToIQId: string | null } | null> => {
  try {
    if (!invitation || !invitation.invitationFormId) return null;

    // Insert OPSToIQCuration tracking record
    const opsToIQCurationInsertInput: OpsToIqCuration_Insert_Input[] = [
      {
        formInvitationId: invitation.invitationFormId,
        status: FormInvitationStatus.Processing as any,
        triggeredByUserId: invitation.created_by ?? "",
        startAt: new Date().toISOString(),
      },
    ];

    let opsToIQInsertion: any = null;
    try {
      opsToIQInsertion = await sdk.bulkinsertOPSToIQCuration({
        opsToIQCurationInsertInput: opsToIQCurationInsertInput,
      });
    } catch (err) {
      console.warn("OPSToIQCuration insert failed:", err);
      opsToIQInsertion = null;
    }

    // Extract inserted ID
    const returningRows: any[] =
      opsToIQInsertion?.insert_OPSToIQCuration?.returning || [];

    const matching = returningRows.find(
      (r) => String(r?.formInvitationId) === String(invitation.invitationFormId)
    );

    // Fail fast — proceeding without a valid tracking id would enqueue
    // suggestion/generate with an empty request_id, making it untrackable.
    if (!matching?.id) {
      console.error(
        "[OPSToIQCuration] Tracking row not created or not returned for invitation",
        invitation.invitationFormId
      );
      return null;
    }

    // Build payload for AI service
    const opsToIQPayload = {
      form_invitation_id: invitation.invitationFormId,
      form_id: invitation.formId ?? "",
      iq_company_id: invitation.iqCompanyId ?? "",
      ops_company_id: invitation.opsCompanyId ?? "",
      ops_company_name: invitation.opsCompanyName ?? "",
      submission_id: invitation.submissionId ?? "",
      request_id: matching?.id ?? "",
      target_form_field_id_list: [],
    };

    return {
      payload: opsToIQPayload,
      opsToIQId: matching?.id ?? null,
    };
  } catch (error) {
    console.error("triggerOPSToIQCurationForInvitation error:", error);
    return null;
  }
};

// existing handler
const AIprocessing: NextApiHandler = async (req, res) => {
  const processType = req.body?.process;
  const requestBody = req.body?.body;

  let response: any = null;

  try {
    switch (processType) {
      case "newFormInvitation": {
        // support both array payload and single object
        const incoming = Array.isArray(req.body.data)
          ? req.body.data[0]
          : req.body.data;

        const invitationPayload = await triggerWebCurationForInvitation({
          invitationFormId: incoming?.form_invitation_id ?? "",
          formId: incoming?.form_id ?? "",
          companyId: incoming?.company_id ?? "",
          created_by: incoming?.created_by ?? "",
        });

        // prefer the prepared payload from helper; fallback to original body
        const payloadToSend = invitationPayload;
        response = await apiRequest.post(
          process.env["NEXT_PUBLIC_AIAPI_BASE_URL"] + "new-form-invitation",
          payloadToSend
        );
        break;
      }

      case "dataCurationStatus":
        response = await apiRequest.post(
          process.env["NEXT_PUBLIC_AIAPI_BASE_URL"] +
          "web-data-curation-status",
          req.body.data
        );
        break;

      case "ingesting": {
        // delegate to helper
        response = await processIngestingSingle(req.body.data);
        break;
      }

      case "deleteFile":
        response = await apiRequest.post(
          process.env["NEXT_PUBLIC_AIAPI_BASE_URL"] + "delete-upload-file",
          req.body.data
        );
        break;
      case "fileParsing": {
        const { url, document_log_id, company_id, user_id } = req.body.data;

        // Validate required parameters and collect all missing keys
        const requiredParams: Array<[string, any]> = [
          ["url", url],
          ["document_log_id", document_log_id],
          ["company_id", company_id],
          ["user_id", user_id],
        ];

        const missingKeys = requiredParams.reduce(
          (acc: string[], [key, value]) => {
            if (value === undefined || value === null || value === "")
              acc.push(key);
            return acc;
          },
          []
        );

        if (missingKeys.length > 0) {
          // Return combined error string listing all missing parameters
          const message = `Missing required parameter${missingKeys.length > 1 ? "s" : ""
            }: ${missingKeys.join(", ")}`;
          return res.status(400).json({ error: message });
        }

        // Prepare payload for parse-file API
        const parseFilePayload = [
          {
            url,
            document_log_id,
            company_id,
            user_id,
          },
        ];

        try {
          // Call the external parse-file API
          const parseFileResponse = await apiRequest.post(
            process.env["NEXT_PUBLIC_AIAPI_BASE_URL"] + "parse-document",
            parseFilePayload
          );

          // Return success response with parse-file API result
          response = {
            success: true,
            message: "File parsing completed successfully",
            data: parseFileResponse.data,
            extractionPercentage:
              parseFileResponse.data?.extractionPercentage || 0,
            timestamp: new Date().toISOString(),
          };
        } catch (parseError: any) {
          console.error("Parse-file API error:", parseError);

          // Handle parse-file API errors
          const errorMessage =
            parseError.response?.data?.message ||
            parseError.message ||
            "Parse-file API failed";
          const statusCode = parseError.response?.status || 500;

          return res.status(statusCode).json({
            success: false,
            error: "Parse-file API failed",
            message: errorMessage,
            timestamp: new Date().toISOString(),
          });
        }
        break;
      }
      case "chatQuery": {
        // Handle chat query requests
        const {
          query,
          queryType,
          companyId,
          companyName,
          documentsToSearch,
          targetDocuments,
          userId,
          conversationId,
        } = req.body.data;

        // Validate required fields
        if (!query || !queryType || !companyId || !companyName) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields",
            error: "query, queryType, companyId, and companyName are required",
          });
        }

        // Validate queryType
        if (!["textual", "graphical"].includes(queryType)) {
          return res.status(400).json({
            success: false,
            message: "Invalid query type",
            error: "queryType must be either 'textual' or 'graphical'",
          });
        }

        // Get AI service base URL from environment
        const aiServiceBaseUrl = process.env["NEXT_PUBLIC_AIAPI_BASE_URL"];
        if (!aiServiceBaseUrl) {
          console.error("NEXT_PUBLIC_AIAPI_BASE_URL not configured");
          return res.status(500).json({
            success: false,
            message: "AI service not configured",
            error: "AI service configuration missing",
          });
        }

        // Prepare payload for AI service
        const aiServicePayload = {
          query,
          query_type: queryType,
          company_id: companyId === "None" ? "None" : companyId,
          company_name: companyName,
          user_id: userId || "unknown",
          documents_to_search: documentsToSearch || [],
          target_documents: targetDocuments || [],
          // Include conversation_id only if provided
          ...(conversationId && { conversation_id: conversationId }),
        };

        console.log(
          "[AIprocessing] chatQuery payload:",
          JSON.stringify(aiServicePayload)
        );

        // Call AI service with authorization header (following api-request.ts pattern)
        const aiServiceUrl = `${aiServiceBaseUrl}query/document`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-ai-services-authorization":
            process.env.AI_SERVICES_AUTHORIZATION ?? "",
        };

        console.log(`Calling AI service at: ${aiServiceUrl}`);

        const aiResponse = await fetch(aiServiceUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(aiServicePayload),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(
            `AI service error: ${aiResponse.status} - ${errorText}`
          );
          return res.status(aiResponse.status).json({
            success: false,
            message: "AI service request failed",
            error: "AI Service is not available at present. Please try again after some time.",
          });
        }

        const aiData = await aiResponse.json();

        // Validate AI service response
        if (!aiData.success || aiData.status_code !== 200) {
          console.error("AI service returned error:", aiData);
          return res.status(500).json({
            success: false,
            message: "AI service processing failed",
            error: aiData.message || "Unknown error from AI service",
          });
        }

        // Return processed response
        response = {
          data: {
            queryOutput: aiData.data.query_output,
            sources: aiData.data.sources,
            conversationId: aiData.data.conversation_id,
          },
          success: true,
          message: "Query processed successfully",
        };
        break;
      }

      case "opsToIQCuration": {
        // Handle OPS-to-IQ data curation flow
        const { form_invitation_id, form_id, iq_company_id, ops_company_id, ops_company_name, submission_id, created_by } = req.body.data;

        // Validate required parameters
        const requiredParams: Array<[string, any]> = [
          ["form_invitation_id", form_invitation_id],
          ["form_id", form_id],
          ["iq_company_id", iq_company_id],
          ["ops_company_id", ops_company_id],
          ["submission_id", submission_id],
        ];

        const missingKeys = requiredParams.reduce(
          (acc: string[], [key, value]) => {
            if (value === undefined || value === null || value === "")
              acc.push(key);
            return acc;
          },
          []
        );

        if (missingKeys.length > 0) {
          const message = `Missing required parameter${missingKeys.length > 1 ? "s" : ""
            }: ${missingKeys.join(", ")}`;
          return res.status(400).json({ error: message });
        }

        // Get AI service base URL from environment
        const aiServiceBaseUrl = process.env["NEXT_PUBLIC_AIAPI_BASE_URL"];
        if (!aiServiceBaseUrl) {
          console.error("NEXT_PUBLIC_AIAPI_BASE_URL not configured");
          return res.status(500).json({
            success: false,
            message: "AI service not configured",
            error: "AI service configuration missing",
          });
        }

        // Insert OPSToIQCuration tracking record and prepare payload
        const curationData = await triggerOPSToIQCurationForInvitation({
          invitationFormId: form_invitation_id,
          formId: form_id,
          iqCompanyId: iq_company_id,
          opsCompanyId: ops_company_id,
          opsCompanyName: ops_company_name,
          submissionId: submission_id,
          created_by: created_by ?? "",
        });

        if (!curationData) {
          return res.status(500).json({
            success: false,
            message: "Failed to initialize OPS-to-IQ curation tracking",
            error: "Tracking record creation failed",
          });
        }

        const opsToIQPayload = curationData.payload;

        console.log(
          "[AIprocessing] OPS-to-IQ curation payload:",
          JSON.stringify(opsToIQPayload)
        );

        const aiServiceUrl = `${aiServiceBaseUrl}suggestion/generate-ops-to-iq`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-ai-services-authorization":
            process.env.AI_SERVICES_AUTHORIZATION ?? "",
        };

        console.log(`Calling OPS-to-IQ AI service at: ${aiServiceUrl}`);

        try {
          const aiResponse = await fetch(aiServiceUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(opsToIQPayload),
          });

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error(
              `OPS-to-IQ AI service error: ${aiResponse.status} - ${errorText}`
            );
            return res.status(aiResponse.status).json({
              success: false,
              message: "OPS-to-IQ curation request failed",
              error: "AI Service is not available at present. Please try again after some time.",
            });
          }

          const aiData = await aiResponse.json();

          // Validate AI service response
          if (!aiData.success) {
            console.error("OPS-to-IQ AI service returned error:", aiData);
            return res.status(500).json({
              success: false,
              message: "OPS-to-IQ curation processing failed",
              error: aiData.message || "Unknown error from AI service",
            });
          }

          // Return processed response
          response = {
            data: {
              ...aiData.data,
              ops_to_iq_curation_id: curationData.opsToIQId,
            },
            success: true,
            message: "OPS-to-IQ curation initiated successfully",
          };
        } catch (opsError: any) {
          console.error(
            "OPS-to-IQ AI service error:",
            opsError.message || opsError
          );
          return res.status(500).json({
            success: false,
            message: "OPS-to-IQ curation failed",
            error: opsError.message || "Unknown error occurred",
          });
        }
        break;
      }

      case "deleteParsedDocument": {
        // Handle deletion of parsed document embeddings in background
        const { document_log_ids } = req.body.data;

        // Validate required fields
        if (!document_log_ids || !Array.isArray(document_log_ids) || document_log_ids.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields",
            error: "document_log_ids array is required and must not be empty",
          });
        }

        // Get AI service base URL from environment
        const aiServiceBaseUrl = process.env["NEXT_PUBLIC_AIAPI_BASE_URL"];

        // Prepare payload for AI service
        const deleteEmbeddingsPayload = {
          document_log_ids,
          is_deleted: true,
        };

        // Call AI service with authorization header
        const aiServiceUrl = `${aiServiceBaseUrl}delete-parsed-document`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-ai-services-authorization":
            process.env.AI_SERVICES_AUTHORIZATION ?? "",
        };

        console.log(`[Background] Initiating AI delete embeddings service for documents: ${document_log_ids.join(', ')}`);

        // BACKGROUND PROCESSING: Fire and forget - don't await the response
        // This allows the client to receive immediate response while deletion happens in background
        const backgroundDeletion = async () => {
          try {
            const aiResponse = await fetch(aiServiceUrl, {
              method: "POST",
              headers,
              body: JSON.stringify(deleteEmbeddingsPayload),
            });

            if (!aiResponse.ok) {
              const errorText = await aiResponse.text();
              console.error(
                `[Background] AI delete embeddings service error: ${aiResponse.status} - ${errorText}`
              );
              return;
            }

            const aiData = await aiResponse.json();
            console.log(
              `[Background] AI delete embeddings completed successfully for documents: ${document_log_ids.join(', ')}`,
              aiData
            );
          } catch (error: any) {
            console.error(
              `[Background] AI delete embeddings service error for documents ${document_log_ids.join(', ')}:`,
              error.message || error
            );
          }
        };

        // Execute deletion in background without waiting
        backgroundDeletion();

        // Return immediate response to client
        response = {
          data: {
            document_log_ids,
            processing_status: "initiated",
          },
          success: true,
          message: "Document embeddings deletion initiated in background",
        };
        break;
      }
    }

    if (response?.statusText == "OK" || response?.ok) {
      return res
        .status(200)
        .send({ data: response.data ?? response, error: null });
    } else {
      return res.status(200).send({ data: response, error: null });
    }
  } catch (error: any) {
    return res
      .status(500)
      .send({ data: null, message: error.message, stack: error.stack });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(AIprocessing, {
  limitInterval: 1,
  maxRequestCount: 60,
  progressiveDelay: false,
});

export const dynamic = "force-dynamic";
