import { emailEncrypt } from "@/util/emailEncrypt";
import { getSdkInstance } from "@/graphql/server/sdk";
import { checkUserForRegistration } from "@/util/checkUserForRegistration";
import { generateOTP } from "@/util/otpGenerator";
import { SendEmail } from "@/util/email";
import { getServerEnv } from "@/lib/env/env.server";

export interface UserRegistrationData {
  Mobile: string | null;
  MobileCode: string | null;
  Email: string;
  RoleGuid: string | null;
  Message: string | null; // Can be string or null
  OTP: string | null;
  IsExist: boolean;
  GSTNumber: string | null;
  IsCPanelUser: boolean;
}

export const sendEmailOTP = async (
  email: string
): Promise<UserRegistrationData> => {
  const userRegistrationData: UserRegistrationData = {
    Mobile: null,
    MobileCode: null,
    Email: email,
    RoleGuid: null,
    Message: null,
    OTP: null,
    IsExist: false,
    GSTNumber: null,
    IsCPanelUser: false
  };

  const { data } = await checkUserForRegistration(email, "");
  const sdk = await getSdkInstance();

  if (data?.userExists) {
    // Handle existing user
    if (data?.isEligible) {
      // User exists but can register (e.g., resend OTP)
      let encryptedEmailId: string | undefined;

      if (email) {
        const env = await getServerEnv();
        encryptedEmailId = emailEncrypt(
          {
            encryptionKey: env.ENCRYPTION_KEY,
            encryptionIV: env.ENCRYPTION_IV
          },
          email
        );
      }

      if (!encryptedEmailId) {
        throw new Error("Failed to encrypt email");
      }

      // Get user company mappings
      const userResponse = await sdk.GetUserCompanyMappingsDetailsByEmail({
        email: encryptedEmailId
      });

      if (!userResponse?.Tbl_Users?.[0]) {
        return userRegistrationData;
      }

      if (
        !userResponse.Tbl_Users[0].Tbl_UserCompanyMappings?.[0]?.CompanyGuid
      ) {
        throw new Error("User has no company mappings");
      }

      const companyGuid =
        userResponse.Tbl_Users[0].Tbl_UserCompanyMappings[0].CompanyGuid;

      // Get company role mappings
      const roleResponse = await sdk.GetCompanyRoleMapping({
        companyGuid
      });

      const hasCreatedStatus =
        roleResponse.Tbl_CompanyRoleMapping[0].Tbl_CompanyStatusMaster?.CompanyStatusName.toUpperCase() ===
        "CREATED";
      const cPanelCompanyId =
        userResponse.Tbl_Users[0].Tbl_UserCompanyMappings[0].Tbl_Company
          ?.CPanelCompanyId;

      if (hasCreatedStatus && cPanelCompanyId) {
        userRegistrationData.IsCPanelUser = true;
        return userRegistrationData;
      }
    } else {
      // User exists and cannot register again
      return {
        Mobile: null,
        MobileCode: null,
        Email: email,
        RoleGuid: "00000000-0000-0000-0000-000000000000",
        Message: null,
        OTP: null,
        IsExist: false,
        GSTNumber: null,
        IsCPanelUser: false
      };
    }
  }

  // Generate and set OTP
  const otp = generateOTP();
  if (!otp) {
    throw new Error("Failed to generate OTP");
  }

  // Update user registration data with the new OTP
  userRegistrationData.OTP = otp;
  userRegistrationData.IsExist = false; // Mark as new user

  // Get email template
  const emailTemplate = await (async (templateName: string) => {
    try {
      const response = await sdk.GetEmailTemplateByName({ templateName });
      if (!response.Tbl_EmailTemplate?.[0]) {
        throw new Error("Email template not found");
      }
      return response.Tbl_EmailTemplate[0];
    } catch (error) {
      console.error("Failed to fetch email template:", error);
      throw error;
    }
  })("Email OTP Verification");

  if (!emailTemplate?.Body) {
    throw new Error("Email template body is empty");
  }

  const copyrightYear = new Date().getFullYear().toString();
  const getEmailDetail = async () => {
    if (!emailTemplate?.Body) {
      throw new Error("Email template body is empty");
    }

    let headerFooter:
      | {
        EmailHeaderFooterGUID: string;
        HTML?: string | null;
      }
      | undefined;

    if (emailTemplate.EmailHeaderFooterGUID) {
      const headerFooterResponse = await sdk.GetEmailHeaderFooterByGuid({
        emailHeaderFooterGuid: emailTemplate.EmailHeaderFooterGUID
      });

      if (headerFooterResponse.Tbl_EmailHeaderFooter?.[0]) {
        headerFooter = headerFooterResponse.Tbl_EmailHeaderFooter[0];
      }
    }

    let emailBody = headerFooter?.HTML
      ? headerFooter?.HTML?.replace("@body", emailTemplate?.Body)
      : emailTemplate?.Body;

    emailBody = emailBody.replace("@copyrightYear", copyrightYear);

    const ccEmailId = emailTemplate.CCEmailId
      ? emailTemplate.CCEmailId.split(",")
      : [];
    const bccEmailId = emailTemplate.BCCEmailId
      ? emailTemplate.BCCEmailId.split(",")
      : [];

    // Get SMTP configuration
    const smtpResponse = await sdk.GetSMTPDetail();

    const smtpSettings = smtpResponse.Tbl_GlobalSettings?.reduce(
      (acc, setting) => {
        if (setting.SettingsKey && setting.SettingsValue) {
          acc[setting.SettingsKey] = setting.SettingsValue;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    if (!smtpSettings || !smtpSettings["SMTPHOST"]) {
      throw new Error("SMTP configuration not found or incomplete");
    }

    return {
      EmailTemplateGuid: emailTemplate.EmailTemplateGUID,
      FromMail: "chandra.panwar@powerweave.com", //emailTemplate.FromEmailId,
      ToMail: emailTemplate.ToEmailId,
      MessageBody: emailBody,
      Subject: emailTemplate.Subject,
      Host: smtpSettings["SMTPHOST"],
      Port: parseInt(smtpSettings["SMTPPORT"]),
      UserId: smtpSettings["SMTPUSERID"],
      Password: smtpSettings["SMTPPASSWORD"],
      Header: headerFooter?.HTML,
      CCMail: ["cp@yopmail.com"], //ccEmailId
      BCCMail: [""] //bccEmailId
    };
  };

  const emailConfig = await getEmailDetail();

  if (!userRegistrationData.OTP) {
    throw new Error("OTP is required for email template");
  }

  const messageBody = emailConfig.MessageBody.replace(
    "@EmailOTP",
    userRegistrationData.OTP
  ).replace("@UserName", email).replace("@copyrightYear", copyrightYear);

  // Prepare email options with proper formatting
  const emailOptions = {
    EmailTemplateGuid: emailConfig.EmailTemplateGuid,
    FromMail: emailConfig.FromMail || "no-reply@example.com",
    ToMail: email, // Set recipient to the provided email
    MessageBody: messageBody,
    Subject: emailConfig.Subject || "OTP Verification",
    Host: emailConfig.Host,
    Port: emailConfig.Port,
    UserId: emailConfig.UserId,
    Password: emailConfig.Password,
    Header: emailConfig.Header || undefined,
    CCMail: emailConfig.CCMail?.filter(Boolean) || [],
    BCCMail: emailConfig.BCCMail?.filter(Boolean) || []
  };

  // Send email using common utility
  const emailSended = await SendEmail(emailOptions);

  if (!emailSended) {
    throw new Error("Failed to send email");
  }

  return userRegistrationData;
};
