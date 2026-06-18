import { getSdkInstance } from "@/graphql/server/sdk";
import { SendEmail } from "@/util/email";
import { emailEncrypt } from "@/util/emailEncrypt";
import {
  ResetPasswordEmailResponse,
  EmailConfig
} from "@/types/interface.types";
import { v4 as uuidv4 } from "uuid";
import { getServerEnv } from "@/lib/env/env.server";

export const sendResetPasswordEmail = async (
  email: string
): Promise<ResetPasswordEmailResponse> => {
  try {
    // Get server environment variables
    const env = await getServerEnv();

    // Encrypt the email
    const encryptedEmail = emailEncrypt(
      {
        encryptionKey: env.ENCRYPTION_KEY,
        encryptionIV: env.ENCRYPTION_IV
      },
      email
    );

    if (!encryptedEmail) {
      return {
        success: false,
        status200OK: 400,
        saveresult: "Failed to encrypt email"
      };
    }

    // Call the GraphQL mutation
    const sdk = await getSdkInstance();
    const response = await sdk.GetUserByEmailAndRoles({
      email: encryptedEmail
    });

    if (!response?.Tbl_Users?.[0]) {
      return {
        success: false,
        status200OK: 400,
        saveresult:
          "This Email Id is not registered with us. Please enter a valid Email Id"
      };
    }

    if (!response?.Tbl_Users?.[0].IsActive) {
      return {
        success: false,
        status200OK: 403,
        saveresult:
          "You are no longer operational in the business. Please contact admin for next steps"
      };
    }

    // Get email template
    const templateResponse = await sdk.GetEmailTemplateByName({
      templateName: "Password Reset Template"
    });

    const emailTemplate = templateResponse?.Tbl_EmailTemplate?.[0];
    if (!emailTemplate) {
      return {
        success: false,
        status200OK: 500,
        saveresult: "Email template not found"
      };
    }

    // Get user details for personalization
    const userDetails = await sdk.GetUserByEmail({ email: encryptedEmail });
    const userName =
      `${userDetails?.Tbl_Users?.[0]?.FirstName || ""} ${userDetails?.Tbl_Users?.[0]?.LastName || ""}`.trim();
    const user = userDetails?.Tbl_Users?.[0];

    const setPasswordToken = uuidv4().replaceAll("-", "");
    const updateResponse = await sdk.updateUser({
      input: [
        {
          where: { UserGuid: { _eq: user.UserGuid } },
          _set: {
            isResetPasswordDone: false,
            SetPasswordToken: setPasswordToken
          }
        }
      ]
    });

    const copyrightYear = new Date().getFullYear().toString();
    let MessageBody: string | undefined;

    MessageBody = emailTemplate.Body ?? undefined;
    const templateContext = {
      UserName: userName,
      Link: env.WEBSITE_URL + "setnewpassword?email=" + updateResponse?.update_Tbl_Users_many?.[0]?.returning?.[0]?.SetPasswordToken + "&IsInternalRequest=false",
      CompanyName: env.COMPANY_NAME || "",
      copyrightYear: copyrightYear,
    };

    MessageBody = MessageBody ? renderTemplate(MessageBody, templateContext) : undefined;

    const ccEmailId = emailTemplate.CCEmailId
      ? emailTemplate.CCEmailId.split(",")
      : [];
    const bccEmailId = emailTemplate.BCCEmailId
      ? emailTemplate.BCCEmailId.split(",")
      : [];

    emailTemplate.Body = MessageBody;
    emailTemplate.ToEmailId = email;

    const smtpResponse = await sdk.GetSMTPDetail();

    const smtpSettings = smtpResponse?.Tbl_GlobalSettings?.reduce(
      (acc, setting) => {
        if (setting.SettingsKey && setting.SettingsValue) {
          acc[setting.SettingsKey] = setting.SettingsValue;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    if (!smtpSettings || !smtpSettings["SMTPHOST"]) {
      return {
        success: false,
        status200OK: 500,
        saveresult: "SMTP configuration not found or incomplete"
      };
    }

    // Ensure required fields are present
    if (!emailTemplate?.FromEmailId) {
      return {
        success: false,
        status200OK: 500,
        saveresult: "From email address is required"
      };
    }

    const emailConfig: EmailConfig = {
      FromMail: emailTemplate.FromEmailId,
      ToMail: emailTemplate.ToEmailId,
      MessageBody: emailTemplate.Body || "",
      Subject: emailTemplate.Subject || "Password Reset",
      Host: smtpSettings["SMTPHOST"],
      Port: parseInt(smtpSettings["SMTPPORT"] || "", 10),
      UserId: smtpSettings["SMTPUSERID"] || "",
      Password: smtpSettings["SMTPPASSWORD"] || "",
      Header: "",
      CCMail: ccEmailId.length > 0 ? ccEmailId : [],
      BCCMail: bccEmailId.length > 0 ? bccEmailId : []
    };

    // Send email
    await SendEmail(emailConfig);

    return {
      success: true,
      status200OK: 200,
      saveresult: "Success"
    };
  } catch (error) {
    console.error("Error in sendResetPasswordEmail:", error);
    return {
      success: false,
      status200OK: 500,
      saveresult: "An error occurred while sending reset password email"
    };
  }
};

export const renderTemplate = (template: string, context: Record<string, any>) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = context[key.trim()];
    return typeof value === "string" ? value : "";
  });
};