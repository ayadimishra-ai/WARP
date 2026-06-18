import { getGraphQlServerSDK } from "~/graphql/server";
import {
  AIEmailTemplateCodes,
  AIFileUploadStatus,
} from "~/shared/constants/ai-constant";
import { CustomError } from "~/shared/error/custom-error";
import { HeaderEmailTemplateTypes } from "~/utils/const";
import {
  fetchEmailTemplate,
  saveEmailLog,
  sendEmail,
} from "~/utils/email.util";
import { getServerEnv } from "~/utils/env/env.server";
import { logger } from "~/utils/logger";
import { EmailTemplate } from "~/utils/types";

interface UploadedFile {
  id: string;
  name: string;
  status: string;
  [key: string]: any;
}

export const prepareEmailTemplate = (
  emailTemplate: EmailTemplate,
  uploadedFiles: UploadedFile[],
  userName: string,
  uploadSummaryLink: string,
  emailHeader: string
) => {
  if (!emailTemplate || !uploadedFiles) {
    throw new Error("Email template or uploaded files data is missing.");
  }

  // Use the HTML template from emailTemplate.template
  let content = emailTemplate.template;

  // Calculate counts
  const totalFiles = uploadedFiles.length;
  const successfullyProcessed = uploadedFiles.filter(
    (file) => file.status === AIFileUploadStatus.VerificationPending
  ).length;
  const processingFailedFiles = uploadedFiles.filter(
    (file) => file.status === AIFileUploadStatus.ProcessingError
  ).length;
  const uploadingFailedFiles = uploadedFiles.filter(
    (file) => file.status === AIFileUploadStatus.UploadError
  ).length;

  // Replace placeholders
  content = content.replace(/{{userName}}/g, userName || "");
  content = content.replace(/{{subject}}/g, emailTemplate.subject || "");
  content = content.replace(/{{totalFiles}}/g, String(totalFiles));
  content = content.replace(
    /{{successfullyProcessed}}/g,
    String(successfullyProcessed)
  );
  content = content.replace(
    /{{processingFailedFiles}}/g,
    String(processingFailedFiles)
  );
  content = content.replace(
    /{{uploadingFailedFiles}}/g,
    String(uploadingFailedFiles)
  );
  content = content.replace(/{{uploadSummaryLink}}/g, uploadSummaryLink || "#");
  content = content.replace(
    /{{copyrightYear}}/g,
    new Date().getFullYear().toString()
  );
  content = content.replace(/{{HeaderContent}}/g, emailHeader || "");

  return {
    subject: emailTemplate.subject,
    content,
  };
};

export async function sendAIFileProcessingEmail(
  userId: string,
  organizationId: string
) {
  try {
    logger.info("Starting sendAIFileProcessingEmail for userId:", userId);
    const sdk = await getGraphQlServerSDK();
    if (!userId) {
      throw CustomError({
        statusCode: 400,
        message: "User ID is required to send AI file processing email.",
      });
    }
    // 1. Fetch uploaded files
    const uploadedFiles = await sdk.GetAIFileUploadsByUser({
      where: {
        created_by: { _eq: userId },
        status: {
          _in: [
            AIFileUploadStatus.VerificationPending,
            AIFileUploadStatus.ProcessingError,
            AIFileUploadStatus.UploadError,
          ],
        },
        email_send_at: { _is_null: true },
        is_deleted: { _eq: false },
      },
    });

    if (!uploadedFiles?.AIFileUploads?.length) {
      logger.warn("No files found for email send for userId:", userId);
      return;
    }

    // 2. Fetch email template
    const emailTemplate = await fetchEmailTemplate(
      AIEmailTemplateCodes.AIFileProcessingCompleted
    );
    const template = emailTemplate.EmailTemplates?.[0];
    if (!template) {
      logger.error("Email template not found for AIFileProcessingCompleted");
      throw CustomError({
        statusCode: 500,
        message: "Email template not found",
      });
    }
    //#region Email dynamic header
    const emailHeader = await dynamicEmailHeader(organizationId);
    //#endregion Email dynamic header

    // 3. Prepare & send email
    const files = uploadedFiles.AIFileUploads.map((file: any) => ({
      ...file,
      name: file.file_name || "",
      status: file.status || "",
    }));
    const env = await getServerEnv();
    const preparedTemplate = prepareEmailTemplate(
      template,
      files,
      uploadedFiles.AIFileUploads[0].AppUser?.name || "",
      `${env.NEXT_PUBLIC_SITE_URL}ghgactivity`,
      emailHeader
    );

    const result = await sendEmail({
      to: uploadedFiles.AIFileUploads[0].AppUser?.email || "",
      bcc: template?.bcc_emails || [],
      cc: template?.cc_emails || [],
      preparedEmaiTemplate: preparedTemplate,
    });

    if (!result?.success) {
      logger.error("Email sending failed", {
        error: result?.error,
        userId,
      });
      logger.error("Email sending failed", { error: result?.error });
    }

    // 4. Save email log regardless of send success
    const emailLogResult = await saveEmailLog([
      {
        emailTemplate: template,
        preparedEmaiTemplate: preparedTemplate,
        result: result?.data || null,
        userEmail: uploadedFiles.AIFileUploads[0].AppUser?.email || "",
        userId: userId,
      },
    ]);

    const emailLogId = emailLogResult?.insert_EmailLogs?.returning[0]?.id;
    if (!emailLogId) {
      throw CustomError({
        statusCode: 500,
        message: "Failed to insert email log",
      });
    }

    // 5. Update email_send_at in AIFileUploads
    const ids = uploadedFiles.AIFileUploads.map((file: any) => file.id).filter(
      Boolean
    );
    if (ids.length > 0) {
      const updateResult = await sdk.UpdateAIFileUploads({
        where: { id: { _in: ids } },
        set: {
          email_send_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      if (!updateResult?.update_AIFileUploads?.affected_rows) {
        throw CustomError({
          statusCode: 500,
          message: "Failed to update AIFileUploads records.",
        });
      }
    }

    return {
      success: true,
      emailLogId,
      emailLogCreated: true,
    };
  } catch (error: any) {
    logger.error("Exception in sendAIFileProcessingEmail", {
      error,
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw CustomError({
      statusCode: error.statusCode || 500,
      message: "Email processing failed",
      error: error?.message || error,
    });
  }
}

//#region prepare Template
const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
) => {
  return template.replace(
    /{{\s*([^}]+)\s*}}/g,
    (_, key) => variables[key.trim()] || ""
  );
};

//#region dynamic email header
export const dynamicEmailHeader = async (organizationId: string) => {
  try {
    console.log("organizationId", organizationId);
    // Email dynamic Header
    const sdk = await getGraphQlServerSDK();
    const companyDetail = await sdk.getOrgData({
      organizationId: organizationId,
    });

    const CompanyHeaderContent =
      companyDetail?.Organization?.[0]?.logo_metadata?.CompanyHeaderContent;

    // Get header email templates
    const headerEmailTemplate = await sdk.getAppGlobalMasterDetailsByType({
      key: [
        HeaderEmailTemplateTypes.HeaderWithClientDetails,
        HeaderEmailTemplateTypes.Header,
      ],
    });

    // Check if headerEmailTemplate data is available
    if (
      !headerEmailTemplate?.AppGlobalMaster ||
      headerEmailTemplate?.AppGlobalMaster?.length === 0
    ) {
      logger.warn("Header email template data not available", {
        organizationId,
      });
      return ""; // Return empty string as fallback
    }

    // Determine template type based on company header content
    const templateType = CompanyHeaderContent
      ? HeaderEmailTemplateTypes.HeaderWithClientDetails
      : HeaderEmailTemplateTypes.Header;

    // Filter templates by type
    const headerTemplateData = headerEmailTemplate?.AppGlobalMaster?.filter(
      (item) => item.key === templateType
    );

    // Check if filtered template data is available
    if (!headerTemplateData || headerTemplateData?.length === 0) {
      logger.warn("No header template found for the specified type", {
        organizationId,
        templateType,
      });
      return ""; // Return empty string as fallback
    }

    let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

    // Replace client logo placeholder if available
    if (headerTemplate && CompanyHeaderContent?.clientLogo) {
      const variables = {
        clientLogo: CompanyHeaderContent?.clientLogo,
        width: CompanyHeaderContent?.width,
        widthinpx: CompanyHeaderContent?.widthinpx,
        height: CompanyHeaderContent?.height,
        heightinpx: CompanyHeaderContent?.heightinpx,
        altText: CompanyHeaderContent?.altText,
      };
      headerTemplate = replaceTemplateVariables(headerTemplate, variables);
    }
    // Email dynamic Header end

    return headerTemplate;
  } catch (error) {
    throw new Error(`Failed to fetch email template: ${error}`);
  }
};
//#endregion
