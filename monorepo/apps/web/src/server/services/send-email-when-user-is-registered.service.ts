import { EmailDetailVM } from "@/types/interface.types";
import { emailDecrypt } from "@/util/emailDecrypt";
import nodemailer from "nodemailer";
import { getSdkInstance } from "@/graphql/server/sdk";
import { getServerEnv } from "@/lib/env/env.server";

export async function sendEmailWhenUserIsRegistered(
  SRMEmailTemplateName: string,
  SupplierEmailTemplateName: string,
  CompanyGuid: string,
  UserGuid: string
) {
  try {
     const env = await getServerEnv();
    const sdk = await getSdkInstance();
    // Fetch role name
    const userRoleMappingRes = await sdk.gettbluserrolemappingsdata({
      userguid: UserGuid
    });
    const userRoleMapping = userRoleMappingRes?.Tbl_UserRoleMapping?.[0];
    const roleRes = await sdk.GetRoleByName({
      roleName: userRoleMapping?.Tbl_Role.RoleName
    });
    const roleuser = roleRes?.Tbl_Roles?.[0]?.RoleName || "";

    // Fetch company status
    const companyRoleMappingRes = await sdk.GetCompanyRoleMapping({
      companyGuid: CompanyGuid
    });
    const companyRoleMapping =
      companyRoleMappingRes?.Tbl_CompanyRoleMapping?.[0];
    const companyStatusRes = await sdk.GetCompanyStatusMaster({
      companyStatusGuid: companyRoleMapping?.StatusGuid
    });
    const companystatus =
      companyStatusRes?.Tbl_CompanyStatusMaster?.[0]?.CompanyStatusName || "";

    // Fetch company details
    const companydetailRes = await sdk.GetCompanyDetails({
      companyGuid: CompanyGuid
    });
    const companydetail = companydetailRes?.Tbl_Companies?.[0];

    // Fetch user details
    const userDetailRes = await sdk.GetUserByGuid({ userGuid: UserGuid });
    const userDetail = userDetailRes?.Tbl_Users?.[0];
    const userName = `${userDetail?.FirstName || ""} ${userDetail?.LastName || ""}`;
    const emailId = userDetail?.EmailId || "";

    const copyrightYear = new Date().getFullYear().toString();
    // SRM Email
    if (SRMEmailTemplateName) {
      const srmEmailDetail = await getEmailDetail(SRMEmailTemplateName);
      if (!srmEmailDetail) return;

      // Find SRM user (last status log not by this user)
      const lastStatusLogRes = await sdk.GetCompanyStatusLog({
        companyGuid: CompanyGuid,
        excludeCreatedBy: UserGuid
      });
      const lastStatusLog = lastStatusLogRes?.Tbl_CompanyStatusLog?.[0];
      const srmdetailRes = lastStatusLog
        ? await sdk.GetUserByGuid({ userGuid: lastStatusLog.CreatedBy })
        : null;
      const srmdetail = srmdetailRes?.Tbl_Users?.[0];

      if (srmdetail) {
        const decryptedSRMEmail = emailDecrypt(
          {
            encryptionKey: env.ENCRYPTION_KEY!,
            encryptionIV: env.ENCRYPTION_IV!
          },
          srmdetail.EmailId
        );
        let messageBody = srmEmailDetail.MessageBody
        const templateContext = {
          UserName: userName,
          CompanyName: companydetail?.CompanyName || "",
          PartnerType: roleuser.toLowerCase(),
          SRM: srmdetail.FirstName || "",
          copyrightYear: copyrightYear,
          //HeaderContent: headerTemplate,
        };

        messageBody = messageBody ? renderTemplate(messageBody, templateContext) : "";   

        await sendMail({
          ...srmEmailDetail,
          MessageBody: messageBody,
          TOMail: decryptedSRMEmail ?? ""
        });
      } else {
        // Fallback: send to all SRMs
        const srmRoleRes = await sdk.GetRoleByName({
          roleName: "SUPPLIERRELATIONSHIPMANAGER"
        });
        const srmRole = srmRoleRes?.Tbl_Roles?.[0];
        const srmRoleMappingsRes = await sdk.getUserroleMappingsByRoleGuid({
          roleguid: srmRole?.RoleGuid
        });
        const srmRoleMappings = srmRoleMappingsRes?.Tbl_UserRoleMapping || [];
        for (const mapping of srmRoleMappings) {
          const SrmIdRes = await sdk.GetUserByGuid({
            userGuid: mapping.UserGuid
          });
          const SrmId = SrmIdRes?.Tbl_Users?.[0];
          const decryptedSrmEmail = emailDecrypt(
            {
              encryptionKey: env.ENCRYPTION_KEY!,
              encryptionIV: env.ENCRYPTION_IV!
            },
            SrmId?.EmailId || ""
          );
          let messageBody = srmEmailDetail.MessageBody          
          // .replace(
          //   "@UserName",
          //   userName
          // )
          //   .replace("@CompanyName", companydetail?.CompanyName || "")
          //   .replace("@PartnerType", roleuser.toLowerCase())
          //   .replace("@SRM", SrmId?.FirstName || "")
          //   .replace(
          //     "@HereClickSRM",
          //     process.env.WEBSITE_URL +
          //       `onboarding-account?Companyguid=${CompanyGuid}&Rolename=${roleuser}&StatusName=${companystatus}&UserGuid=${UserGuid}`
          //   )
          //   .replace("@copyrightYear", copyrightYear);

          const templateContext = {
            UserName: userName,
            CompanyName: companydetail?.CompanyName || "",
            PartnerType: roleuser.toLowerCase(),
            SRM: SrmId?.FirstName || "",
            HereClickSRM: process.env.WEBSITE_URL +
                  `onboarding-account?Companyguid=${CompanyGuid}&Rolename=${roleuser}&StatusName=${companystatus}&UserGuid=${UserGuid}`,
            copyrightYear: copyrightYear,
            //HeaderContent: headerTemplate,
          };

          messageBody = messageBody ? renderTemplate(messageBody, templateContext) : "";   

          await sendMail({
            ...srmEmailDetail,
            MessageBody: messageBody,
            TOMail: decryptedSrmEmail ?? ""
          });
        }
      }
    }

    // Supplier Email
    if (SupplierEmailTemplateName) {
      const decryptedEmailId = emailDecrypt(
        {
          encryptionKey: env.ENCRYPTION_KEY!,
          encryptionIV: env.ENCRYPTION_IV!
        },
        emailId
      );
      const supplierEmailDetail = await getEmailDetail(
        SupplierEmailTemplateName
      );
      if (!supplierEmailDetail) return;
      let supplierEmailBody = supplierEmailDetail.MessageBody;

      if (roleuser.toUpperCase() === "SUPPLIER") {
        supplierEmailBody = supplierEmailBody
          // .replace("@SupplierName", userName)
          // .replace("@CompanyName", companydetail?.CompanyName || "")
          // .replace("@PartnerType", roleuser.toLowerCase())
          // .replace("@ViewDetails", process.env.WEBSITE_URL + `myaccount`)
          // .replace(
          //   "@isEmailUnsubscribed",
          //   process.env.WEBSITE_URL +
          //     `isemailsubscribed?id=${emailId.toLowerCase()}`
          // )
          // .replace("@copyrightYear", copyrightYear);

          const templateContext = {
            SupplierName: userName,
            CompanyName: companydetail?.CompanyName || "",
            PartnerType: roleuser.toLowerCase(),
            ViewDetails: process.env.WEBSITE_URL + `myaccount`,
            isEmailUnsubscribed: process.env.WEBSITE_URL +
              `isemailsubscribed?id=${emailId.toLowerCase()}`,
            copyrightYear: copyrightYear,
            //HeaderContent: headerTemplate,
          };

          supplierEmailBody = supplierEmailBody ? renderTemplate(supplierEmailBody, templateContext) : ""; 
      } else if (roleuser.toUpperCase() === "BUYER") {
        supplierEmailBody = supplierEmailBody
          // .replace("@UserName", userName)
          // .replace("@LoginLink", process.env.WEBSITE_URL ?? "")
          // .replace(
          //   "@isEmailUnsubscribed",
          //   process.env.WEBSITE_URL +
          //     `isemailsubscribed?id=${emailId.toLowerCase()}`
          // )
          // .replace("@copyrightYear", copyrightYear);

          const templateContext = {
            UserName: userName,
            LoginLink: process.env.WEBSITE_URL ?? "",
            isEmailUnsubscribed: process.env.WEBSITE_URL +
              `isemailsubscribed?id=${emailId.toLowerCase()}`,
            copyrightYear: copyrightYear,
            //HeaderContent: headerTemplate,
          };

          supplierEmailBody = supplierEmailBody ? renderTemplate(supplierEmailBody, templateContext) : ""; 
      }

      await sendMail({
        ...supplierEmailDetail,
        MessageBody: supplierEmailBody,
        TOMail: decryptedEmailId ?? ""
      });
    }
  } catch (error) {
    // Log error
    console.error("Error in sendEmailWhenUserIsRegistered:", error);
  }
}

export async function getEmailDetail(
  templateName: string
): Promise<EmailDetailVM | null> {
  try {
    // 1. Get email template
    const sdk = await getSdkInstance();
    const emailTemplateRes = await sdk.GetEmailTemplateByName({ templateName });
    const emailTemplate = emailTemplateRes?.Tbl_EmailTemplate?.[0];
    if (!emailTemplate) return null;

    // 2. Get header/footer if present
    let emailHeader = "";
    if (emailTemplate.EmailHeaderFooterGUID) {
      const headerRes = await sdk.GetEmailHeaderFooterByGuid({
        emailHeaderFooterGuid: emailTemplate.EmailHeaderFooterGUID
      });
      emailHeader = headerRes?.Tbl_EmailHeaderFooter?.[0]?.HTML || "";
    }

    // 3. Compose message body
    const MessageBody = emailHeader
      ? emailHeader.replace("@body", emailTemplate.Body ?? "")
      : (emailTemplate.Body ?? "");

    // 4. Parse CC/BCC
    const CCMail = emailTemplate.CCEmailId
      ? emailTemplate.CCEmailId.split(",").map((s) => s.trim())
      : [];
    const BCCMail = emailTemplate.BCCEmailId
      ? emailTemplate.BCCEmailId.split(",").map((s) => s.trim())
      : [];

    // 5. Get SMTP settings
    const globalSettingsRes = await sdk.GetGlobalSettings();
    const settings = globalSettingsRes?.Tbl_GlobalSettings || [];
    const getSetting = (key: string) =>
      settings.find((s: any) => s.SettingsKey === key)?.SettingsValue || "";

    return {
      EmailTemplateGuid: emailTemplate.EmailTemplateGUID ?? "",
      FromMail: emailTemplate.FromEmailId ?? "",
      TOMail: emailTemplate.ToEmailId ?? "",
      MessageBody,
      Subject: emailTemplate.Subject ?? "",
      Host: getSetting("SMTPHOST"),
      Port: parseInt(getSetting("SMTPPORT"), 10),
      UserId: getSetting("SMTPUSERID"),
      Password: getSetting("SMTPPASSWORD"),
      Header: emailHeader,
      CCMail,
      BCCMail
    };
  } catch (error) {
    console.error("Error in getEmailDetail:", error);
    return null;
  }
}

export async function sendMail(emailDetail: EmailDetailVM): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      host: emailDetail.Host,
      port: emailDetail.Port,
      secure: emailDetail.Port === 465, // true for 465, false for others
      auth: {
        user: emailDetail.UserId,
        pass: emailDetail.Password
      }
    });

    // Support comma-separated or array for to/cc/bcc
    const to = Array.isArray(emailDetail.TOMail)
      ? emailDetail.TOMail
      : (emailDetail.TOMail || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

    const cc =
      emailDetail.CCMail && emailDetail.CCMail.length > 0
        ? emailDetail.CCMail
        : undefined;
    const bcc =
      emailDetail.BCCMail && emailDetail.BCCMail.length > 0
        ? emailDetail.BCCMail
        : undefined;

    const mailOptions: any = {
      from: emailDetail.FromMail,
      to,
      subject: emailDetail.Subject,
      html: emailDetail.MessageBody,
      cc,
      bcc
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    // Optionally log error to your logging system
  }
}

export const renderTemplate = (template: string, context: Record<string, any>) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = context[key.trim()];
    return typeof value === "string" ? value : "";
  });
};
