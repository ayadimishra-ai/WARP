import { getGraphQlServerSDK } from "~/graphql/server";
import { EmailLogs_Insert_Input } from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { CustomError } from "~/shared/error/custom-error";
import { getServerEnv } from "~/utils/env/env.server";
import { logger } from "~/utils/logger";
import { HeaderEmailTemplateTypes } from "./const";
import { EmailSendResult, EmailTemplate, SendEmailParams } from "./types";
const nodemailer = require("nodemailer");

export const fetchEmailTemplate = async (code: string) => {
  try {
    const sdk = await getGraphQlServerSDK();
    const emailTemplate = await sdk.GetEmailTemplateByCode({ code });
    return emailTemplate;
  } catch (error) {
    throw new Error(`Failed to fetch email template: ${error}`);
  }
};

export type saveEmailLogParam = {
  emailTemplate: EmailTemplate;
  preparedEmaiTemplate: { content: string };
  result: EmailSendResult["data"] | null;
  userEmail: string;
  userId: string;
  /** Populated when sendEmail returns success:false or throws, so the failure is debuggable later. */
  error?: string;
    /** Actual CC recipients sent — overrides emailTemplate.cc_emails when provided. */
  cc?: string[];
};
/**
 * Insert an email log using the provided SDK and email details.
 * Handles errors and returns the result or throws on failure.
 */
export const saveEmailLog = async (requestData: saveEmailLogParam[]) => {
  let emailLog: EmailLogs_Insert_Input[] = [];
  for (let i = 0; i < requestData.length; i++) {
    const resultAccepted = requestData[i]?.result?.accepted;
    emailLog.push({
      template_id: requestData[i]?.emailTemplate?.id,
      user_id: requestData[i]?.userId,
      subject: requestData[i]?.emailTemplate?.subject,
      body: requestData[i]?.preparedEmaiTemplate.content,
      email_response: requestData[i]?.result,
      recipient_email: (Array.isArray(requestData[i]?.userEmail)
        ? requestData[i]?.userEmail
        : [requestData[i]?.userEmail]) as string[],
      status: !!resultAccepted
        ? resultAccepted.length > 0
          ? "Success"
          : "Failed"
        : "Failed",
      error: requestData[i]?.error ?? null,
      cc_emails: requestData[i]?.cc ?? requestData[i]?.emailTemplate?.cc_emails ?? [],
      bcc_emails: requestData[i]?.emailTemplate?.bcc_emails || [],
      created_by: requestData[i]?.userId,
    });
  }

  let emailLogResult;
  try {
    const sdk = await getGraphQlServerSDK();
    emailLogResult = await sdk.InsertEmailLog({
      object: emailLog,
    });
    return emailLogResult;
  } catch (err) {
    logger.error("Failed to insert email log", {
      error: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
    });
    throw new Error("Failed to insert email log.");
  }
};

export const sendEmail = async ({
  to,
  cc,
  bcc,
  preparedEmaiTemplate,
}: SendEmailParams) => {
  try {
    const env = await getServerEnv();

    // Validate required environment variables
    if (
      !env.EMAIL_SMTP_HOST ||
      !env.EMAIL_SMTP_USER ||
      !env.EMAIL_SMTP_PASSWORD
    ) {
      throw new Error(
        "Missing required SMTP environment variables: EMAIL_SMTP_HOST, EMAIL_SMTP_USER, EMAIL_SMTP_PASSWORD"
      );
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_SMTP_HOST,
      port: Number(env.EMAIL_SMTP_PORT) || 465,
      secure: env.EMAIL_SMTP_SECURE,
      auth: {
        user: env.EMAIL_SMTP_USER,
        pass: env.EMAIL_SMTP_PASSWORD,
      },
    });
    // Send email
    const emailSended: any = await transporter.sendMail({
      from: env.EMAIL_FROM_EMAIL || "noreply@snowkap.com",
      to: to,
      cc: cc,
      bcc: bcc,
      subject: preparedEmaiTemplate.subject,
      html: preparedEmaiTemplate.content,
    });
    // Check for nodemailer response (accepted property)
    if (
      emailSended &&
      emailSended.accepted &&
      emailSended.accepted.length > 0
    ) {
      return { success: true, data: emailSended };
    } else {
      return { success: false, error: emailSended };
    }
  } catch (error) {
    logger.error("Email transporter error", {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, error };
  }
};

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

export const sendEmailWithTemplateReplacement = async (
  formData: Record<string, any>
) => {
  try {
    const sdk = await getGraphQlServerSDK();
    const emailTemplate = await sdk.GetEmailTemplateByCode({
      code: formData.get("template_code") as string,
    });
    if (emailTemplate?.EmailTemplates?.length > 0) {
      const rawVariables = formData.get("variables") as string;
      const variables = rawVariables ? JSON.parse(rawVariables) : {};
      const subject = replaceTemplateVariables(
        emailTemplate?.EmailTemplates[0]?.subject,
        variables
      );
      variables["subject"] = subject;
      const html = replaceTemplateVariables(
        emailTemplate?.EmailTemplates[0]?.template,
        variables
      );
      let ccEmails = emailTemplate?.EmailTemplates[0]?.cc_emails as string[];
      if (!!formData.get("cc") && JSON.parse(formData.get("cc")).length > 0) {
        ccEmails = [...ccEmails, ...JSON.parse(formData.get("cc"))];
      }
      let bccEmails = emailTemplate?.EmailTemplates[0]?.bcc_emails as string[];
      if (!!formData.get("bcc") && JSON.parse(formData.get("bcc")).length > 0) {
        bccEmails = [...bccEmails, ...JSON.parse(formData.get("bcc"))];
      }
      const emailResponse = [];
      let toEmail = JSON.parse(formData.get("to")) || [
        emailTemplate?.EmailTemplates[0]?.to,
      ];
      if (toEmail.length > 0) {
      } else {
        toEmail = emailTemplate?.EmailTemplates[0]?.to;
      }
      const result = await sendEmail({
        to: toEmail,
        cc: ccEmails,
        bcc: bccEmails,
        preparedEmaiTemplate: {
          content: html,
          subject: subject,
        },
      });
      emailResponse.push({
        data: {
          template: emailTemplate?.EmailTemplates[0],
          preparedEmailTemplate: {
            content: html,
            subject: subject,
          },
          data: result?.data || null,
          email: toEmail,
        },
      });
      return { emailResponse, success: true };
    } else {
      logger.error("Email template not found");
      throw CustomError({
        statusCode: 500,
        message: "Email template not found",
      });
    }
  } catch (error) {
    throw new Error(`Failed to fetch email template: ${error}`);
  }
};
//#endregion

export const sendEmailWithManipulateTemplate = async (
  userSession: TUserSession,
  variables: Record<string, any>,
  templateCode: string
) => {
  const formData = new FormData();
  formData.append("template_code", templateCode);
  formData.append("variables", JSON.stringify(variables));
  formData.append("cc", JSON.stringify([]));
  formData.append("bcc", JSON.stringify([]));
  const emailResponse = await sendEmailWithTemplateReplacement(formData);
  await saveEmailLog(
    emailResponse?.emailResponse.map((items) => {
      return {
        emailTemplate: items?.data?.template,
        preparedEmaiTemplate: items?.data?.preparedEmailTemplate,
        result: items?.data?.data || null,
        userEmail: items?.data?.email,
        userId: userSession?.userId,
      };
    })
  );
  return;
};

//#region dynamic email header
export const dynamicEmailHeader = async (organizationId: string) => {
  try {
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
