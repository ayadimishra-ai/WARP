import {
  AIFeatureForInvitationIdByDB,
  getAIProcesingStats,
} from "@/modules/warp/packages/client/features/form/common-functions";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import {
  EmailNotifications_Insert_Input,
  EmailNotifications_Updates,
  FormField,
  GetformInvitationdatabycustomwhereQuery,
} from "@/modules/warp/packages/graphql/generated/types";
import {
  AIBulkProcessingCompleteEmail,
  AICurationCompleteEmail,
  AIDataCardsType,
  AIEmailInvitation,
  AIEmailTemplates,
  AppRoles,
  EmailStatus,
  HeaderEmailTemplateTypes,
  RecommendationStatus,
  SourceFilesStatus,
  emailSourceFileDetails,
} from "@/modules/warp/packages/shared/constants/app.constants";
import { buildTokenForKhaitan } from "@/modules/warp/packages/shared/utils/auth-session.util";
import { uuid } from "aws-sdk/clients/customerprofiles";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import { SentMessageInfo } from "nodemailer";
import { encryptionDecryption } from "../../client/hooks/encryption-decryption";
import emailUtil from "../util/email.util";
import { uploadError } from "./aws-s3.service";

const { choosemethod } = encryptionDecryption();

const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];
type sendCompanyInvitationEmailType = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  platformId: string
) => void;

type sendFormResponseMailType = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  platformId: string
) => Promise<void>;
type sendAssessmentReopenMailType = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  platformId: string
) => void;
type sendCommentSubmissionMailType = (
  invitationId: string,
  emailType: string,
  companyId: uuid,
  formId: uuid,
  userRole: string,
  platformId: string
) => void;
type sendCommentSubmissionMailUser2Type = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  userRole: string,
  platformId: string
) => void;
type sendAssessmentApprovedMailType = (
  invitationId: uuid,
  emailType: string,
  companyId: uuid,
  formId: uuid,
  platformId: string
) => void;

type khaitanInvitationEmailType = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  NewUser: boolean,
  platformId: string
) => void;

type reviewerReportingFormInvitationEmailType = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  NewUser: boolean,
  platformId: string
) => void;

type reviewerFormFirstDeclinedResponseEmailType = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  platformId: string,
  questionId?: string
) => void;

type reviewerResubmitResponseEmailType = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  platformId: string,
  questionId?: string,
  userRole?: string
) => void;

type reviewerApprovedEmailType = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  platformId: string,
  questionId?: string
) => void;

type questionAssignEmailInvitationType = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  userId: string,
  platformId: string
) => void;
type sendReviewerPendingEmailsCronType = (platformId: string) => Promise<void>;

type response = {
  response?: any;
  error?: any;
};

type assignedQuestionEmailInvitationType = (
  startDateTime: Date,
  endDateTime: Date,
  platformId: string
) => void;

type commentsOnQuestionBulkEmailType = (
  startDateTime: Date,
  endDateTime: Date,
  platformId: string
) => void;

type answerOnAssignedQuestionBulkEmailType = (
  startDateTime: Date,
  endDateTime: Date,
  platformId: string
) => void;

type newUserCreatedEmailInvitationType = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  userName: string,
  userEmail: string,
  userId: string,
  platformId: string
) => void;

type sendRecommenationReminderPreDueDate = (platformId: string) => void;
type sendRecommenationReminderPostDueDate = (
  emailType: string,
  platformId: string
) => void;
type emailOnManuallyRaisingTheRecommendations = (
  invitationId: string,
  questionId: string,
  emailType: string,
  companyId: string,
  formId: string,
  recommendation: string,
  dueDate: string,
  platformId: string
) => void;
type emailAfterActionsBeenTakenByThePortfolioCompanyOrAssessee = (
  invitationId: string,
  emailType: string,
  companyId: string,
  formId: string,
  recommendation: String,
  comments: String,
  platformId: string
) => void;
type emailWhenTheActionsTakenOnTheRecommendationsAreApproved = (
  invitationId: string,
  questionId: string,
  emailType: string,
  companyId: string,
  formId: string,
  dateAndTime: String,
  platformId: string
) => void;
type EmailWhenRecommendationReopened = (
  invitationId: string,
  questionId: string,
  emailType: string,
  companyId: string,
  formId: string,
  recommendation: String,
  comments: String,
  dateAndTime: String,
  platformId: string
) => void;

type CallBackType = (err: any, info: any) => void;

type sendingEmailFromDbType = (
  startDateTime: Date,
  endDateTime: Date,
  platformId: string
) => void;

type userData = {
  email: string;
  decryptedString: string;
};

export const emailOnManuallyRaisingTheRecommendations: emailOnManuallyRaisingTheRecommendations =
  async (
    invitationId,
    questionId,
    emailType,
    companyId,
    formId,
    recommendation,
    dueDate,
    platformId
  ) => {
    try {
      const result = await sdk.GetEmailTemplateDataByinvitationId({
        invitationId: invitationId,
        questionId: questionId,
        emailType: emailType,
        formId: formId,
        platformId: platformId,
      });
      if (result.FormInvitation.length > 0) {
        const EmailTemplatesResultData =
          result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
        const emailConfiguration =
          result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];

        if (
          EmailTemplatesResultData.length > 0 &&
          emailConfiguration.length > 0
        ) {
          let EmailTemplatesResult: any[] = [];
          //const ccEmail: string[] = EmailTemplatesResult[0].ccEmails ?? [];
          let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === companyId && item.formId === formId
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            checkEmailTemplatesExists = EmailTemplatesResultData.filter(
              (item) => item.companyId === null && item.formId === formId
            );
            if (checkEmailTemplatesExists.length > 0) {
              EmailTemplatesResult = checkEmailTemplatesExists;
              EmailTemplatesResult = checkEmailTemplatesExists;
            } else {
              checkEmailTemplatesExists = EmailTemplatesResultData.filter(
                (item) => item.companyId === companyId && item.formId === null
              );
              if (checkEmailTemplatesExists.length > 0) {
                EmailTemplatesResult = checkEmailTemplatesExists;
              } else {
                EmailTemplatesResult = EmailTemplatesResultData.filter(
                  (item) => item.companyId === null && item.formId === null
                );
              }
            }
          }

          let configdata = {
            fromEmail: emailConfiguration[0]?.fromEmail,
            port: emailConfiguration[0]?.port,
            host: emailConfiguration[0]?.host,
            user: emailConfiguration[0]?.user,
            password: emailConfiguration[0]?.password,
            isSecure: emailConfiguration[0]?.isSecure,
          };

          let remainingUserDetail: any = [];

          let pcDetails = result?.FormInvitation[0]?.Company?.Users?.filter(
            (x) => x.email === result?.FormInvitation[0].email
          );

          if (pcDetails !== undefined && pcDetails.length > 0) {
            remainingUserDetail.push(pcDetails[0]);
          }

          result?.AssesseeUserMappingRespnder?.forEach((mapping) => {
            mapping?.userByUserid?.UserRoles.forEach((role) => {
              remainingUserDetail.push(role?.User);
            });
          });

          if (!!remainingUserDetail?.length) {
            await Promise.all(
              remainingUserDetail?.map(async (finalUser: any) => {
                const ccEmail: string[] = [];

                let email = await choosemethod(finalUser.email, "decrypt");
                const toEmail = email ?? "";
                //const toEmail = "Vinayak.Zade@powerweave.com";
                const Subject = EmailTemplatesResult[0]?.subject ?? "";

                let body = EmailTemplatesResult[0]?.template ?? "";
                const UserName =
                  result.FormInvitation[0]?.Company?.primaryContact.name ?? "";

                const originArray: String[] =
                  result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
                const companyid = result.FormInvitation[0]?.companyId;
                let origin: any = originArray.filter(
                  (x) => !x.includes("localhost")
                );
                let isEmailOrigin: any = originArray.filter(
                  (x) => !x.includes("localhost")
                );

                //let isEmailSubscribed =
                //  result.FormInvitation[0]?.Company?.Users.filter(
                //    (item) => item.email === result.FormInvitation[0]?.email
                //  );
                const getPeriod = (date: any) => {
                  if (dayjs(date).isValid()) {
                    return dayjs(date).format("MMM YYYY");
                  }
                  return "";
                };
                let Period = `${getPeriod(result.FormInvitation[0]?.durationFrom) +
                  " - " +
                  getPeriod(result.FormInvitation[0]?.durationTo)
                  }`;
                const CompanyName = result.FormInvitation[0]?.Company?.name;
                if (origin.length > 0) {
                  origin = `${origin[0]}assessmentrecommendation/${invitationId}/${result.FormInvitation[0]?.Form.title}/${Period}/${CompanyName}/0/false/${result.FormSubmission[0]?.id}/0.0/${result.FormInvitation[0]?.Company?.Users[0]?.name}`;
                  //origin = `<a href='${origin[0]}companyOnBoarding?companyid=${companyid}'><span style='color:#DF5900'>here</span></a>`;
                }
                if (isEmailOrigin.length > 0) {
                  isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${finalUser?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
                }
                const FormName = result.FormInvitation[0]?.Form.title;
                const ParentCompanyName =
                  result.FormInvitation[0]?.companyByParentcompanyid?.name ??
                  "";
                const ParentCompanyName1 =
                  result.FormInvitation[0]?.companyByParentcompanyid?.name ??
                  "";
                const ParentCompanyEmail = await choosemethod(
                  //  result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email ?? "",
                  result.FormInvitation[0]?.ParentUser?.email ?? "",
                  "decrypt"
                );
                const ParentCompanyEmail1 = await choosemethod(
                  //  result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email ?? "",
                  result.FormInvitation[0]?.ParentUser?.email ?? "",
                  "decrypt",
                );
                const copyrightYear = new Date().getFullYear().toString();

                const CompanyHeaderContent =
                  result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
                    ?.CompanyHeaderContent;

                // Get header email templates
                const headerEmailTemplate = await sdk.getGlobalMasterByTypeList(
                  {
                    type: [
                      HeaderEmailTemplateTypes.HeaderWithClientDetails,
                      HeaderEmailTemplateTypes.Header,
                    ],
                  },
                );

                // Determine template type based on company header content
                const templateType = CompanyHeaderContent
                  ? HeaderEmailTemplateTypes.HeaderWithClientDetails
                  : HeaderEmailTemplateTypes.Header;

                // Filter templates by type
                const headerTemplateData =
                  headerEmailTemplate?.GlobalMaster.filter(
                    (item) => item.type === templateType,
                  );

                let headerTemplate =
                  headerTemplateData[0]?.data?.template ?? "";

                // Replace client logo placeholder if available
                if (headerTemplate && CompanyHeaderContent?.clientLogo) {
                  const headerTemplateContent = {
                    clientLogo: CompanyHeaderContent?.clientLogo,
                    width: CompanyHeaderContent?.width,
                    widthinpx: CompanyHeaderContent?.widthinpx,
                    height: CompanyHeaderContent?.height,
                    heightinpx: CompanyHeaderContent?.heightinpx,
                    altText: CompanyHeaderContent?.altText,
                  };
                  headerTemplate = renderTemplate(
                    headerTemplate,
                    headerTemplateContent,
                  );
                }

                const templateContext = {
                  AssesseeName: finalUser.name,
                  Recommendation: recommendation,
                  DueDate: dueDate,
                  QuestionnaireName: FormName,
                  AssessorCompanyName: ParentCompanyName,
                  Link: origin,
                  isEmailUnsubscribed: isEmailOrigin,
                  copyrightYear: copyrightYear,
                  HeaderContent: headerTemplate,
                };

                body = renderTemplate(body, templateContext);

                const platformId =
                  result.FormInvitation[0]?.Company?.platformId ?? "";
                if (finalUser?.isEmailSubscribed == true) {
                  return await emailUtil.Send(
                    toEmail,
                    ccEmail,
                    Subject,
                    body,
                    platformId,
                    configdata,
                    EmailTemplatesResult[0]?.bccEmails
                  );
                } else {
                  return "";
                }
              })
            );
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };
export const emailAfterActionsBeenTakenByThePortfolioCompanyOrAssessee: emailAfterActionsBeenTakenByThePortfolioCompanyOrAssessee =
  async (
    invitationId,
    emailType,
    companyId,
    formId,
    recommendation,
    comments,
    platformId
  ) => {
    let finaldataResult: response = { response: null, error: null };
    try {
      const result = await sdk.GetEmailTemplateDataByinvitationId({
        invitationId: invitationId,
        questionId: "00000000-0000-0000-0000-000000000000",
        emailType: emailType,
        formId: formId,
        platformId: platformId,
      });
      if (result.FormInvitation.length > 0) {
        const EmailTemplatesResultData =
          result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];

        const emailConfiguration =
          result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];

        if (
          EmailTemplatesResultData.length > 0 &&
          emailConfiguration.length > 0
        ) {
          let configdata = {
            fromEmail: emailConfiguration[0]?.fromEmail,
            port: emailConfiguration[0]?.port,
            host: emailConfiguration[0]?.host,
            user: emailConfiguration[0]?.user,
            password: emailConfiguration[0]?.password,
            isSecure: emailConfiguration[0]?.isSecure,
          };
          let EmailTemplatesResult: any[] = [];
          let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === companyId && item.formId === formId
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            checkEmailTemplatesExists = EmailTemplatesResultData.filter(
              (item) => item.companyId === null && item.formId === formId
            );
            if (checkEmailTemplatesExists.length > 0) {
              EmailTemplatesResult = checkEmailTemplatesExists;
              EmailTemplatesResult = checkEmailTemplatesExists;
            } else {
              checkEmailTemplatesExists = EmailTemplatesResultData.filter(
                (item) => item.companyId === companyId && item.formId === null
              );
              if (checkEmailTemplatesExists.length > 0) {
                EmailTemplatesResult = checkEmailTemplatesExists;
              } else {
                EmailTemplatesResult = EmailTemplatesResultData.filter(
                  (item) => item.companyId === null && item.formId === null
                );
              }
            }
          }
          //const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
          // let consultantemail = await choosemethod(
          //   result.FormInvitation[0]?.companyByParentcompanyid
          //     ?.AssessorConsultantMappings[0]?.companyByConsultantcompanyid
          //     ?.Users[0]?.email,
          //   "decrypt"
          // );
          //cc.push(consultantemail);
          //const toEmail = "Vinayak.Zade@powerweave.com";
          const Subject = EmailTemplatesResult[0]?.subject ?? "";

          const UserName =
            result.FormInvitation[0]?.companyByParentcompanyid?.Users ?? "";

          const originArray: String[] =
            result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
          const companyid = result.FormInvitation[0]?.companyId;
          let origin: any = originArray.filter((x) => !x.includes("localhost"));
          const isEmailOrigin: any = originArray.filter(
            (x) => !x.includes("localhost")
          );
          // let remainingUserDetail =
          //   result.FormInvitation[0]?.companyByParentcompanyid?.Users;

          let remainingUserDetail: any = [];
          //Inviter
          if (result?.FormInvitation[0]?.companyByParentcompanyid?.Users) {
            remainingUserDetail = [
              //...result?.FormInvitation[0]?.companyByParentcompanyid?.Users, /code commented for unwanted emails
              result?.FormInvitation[0]?.ParentUser,
            ];
          }
          //Consultant
          result?.FormInvitation[0]?.companyByParentcompanyid?.AssessorConsultantMappings.forEach(
            (mapping) => {
              mapping?.companyByConsultantcompanyid?.Users.forEach((user) => {
                if (
                  remainingUserDetail.filter(
                    (item: any) => item.email == user.email
                  ).length == 0
                ) {
                  remainingUserDetail.push(user);
                }
              });
            }
          );
          ///Group From For Consultant
          result?.FormInvitation[0]?.companyByParentcompanyid?.GroupForm.forEach(
            (mapping) => {
              mapping?.companyByConsultantcompanyid?.Users?.forEach((user) => {
                if (
                  remainingUserDetail.filter(
                    (item: any) => item.email == user.email
                  ).length == 0
                ) {
                  remainingUserDetail.push(user);
                }
              });
            }
          );
          const getPeriod = (date: any) => {
            if (dayjs(date).isValid()) {
              return dayjs(date).format("MMM YYYY");
            }
            return "";
          };
          let Period = `${getPeriod(result.FormInvitation[0]?.durationFrom) +
            " - " +
            getPeriod(result.FormInvitation[0]?.durationTo)
            }`;
          const CompanyName = result.FormInvitation[0]?.Company?.name;
          if (origin.length > 0) {
            origin = `${origin[0]}assessmentrecommendation/${invitationId}/${result.FormInvitation[0]?.Form?.title}/${Period}/${CompanyName}/0/false/${result.FormSubmission[0]?.id}/0.0/${result.FormInvitation[0]?.Company?.Users[0]?.name}`;
          }
          const FormName = result.FormInvitation[0]?.Form.title;
          const ParentCompanyName =
            result.FormInvitation[0]?.companyByParentcompanyid?.name ?? "";
          const PCCompanyName = result.FormInvitation[0]?.Company?.name ?? "";
          const ParentCompanyEmail = await choosemethod(
            //result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email ?? "",
            result.FormInvitation[0]?.ParentUser?.email ?? "",
            "decrypt"
          );
          const ParentCompanyEmail1 = await choosemethod(
            // result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email ?? "",
            result.FormInvitation[0]?.ParentUser?.email ?? "",
            "decrypt"
          );

          const copyrightYear = new Date().getFullYear().toString();

          const CompanyHeaderContent =
            result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
              ?.CompanyHeaderContent;

          // Get header email templates
          const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
            type: [
              HeaderEmailTemplateTypes.HeaderWithClientDetails,
              HeaderEmailTemplateTypes.Header,
            ],
          });

          // Determine template type based on company header content
          const templateType = CompanyHeaderContent
            ? HeaderEmailTemplateTypes.HeaderWithClientDetails
            : HeaderEmailTemplateTypes.Header;

          // Filter templates by type
          const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
            (item) => item.type === templateType,
          );

          let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

          // Replace client logo placeholder if available
          if (headerTemplate && CompanyHeaderContent?.clientLogo) {
            const headerTemplateContent = {
              clientLogo: CompanyHeaderContent?.clientLogo,
              width: CompanyHeaderContent?.width,
              widthinpx: CompanyHeaderContent?.widthinpx,
              height: CompanyHeaderContent?.height,
              heightinpx: CompanyHeaderContent?.heightinpx,
              altText: CompanyHeaderContent?.altText,
            };
            headerTemplate = renderTemplate(
              headerTemplate,
              headerTemplateContent,
            );
          }
          let emailSendedData: any = [];
          if (!!remainingUserDetail?.length) {
            await Promise.all(
              remainingUserDetail?.map(async (finalUser: any) => {
                let isEmailOriginLink = isEmailOrigin;
                if (isEmailOriginLink.length > 0) {
                  isEmailOriginLink = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${finalUser?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
                }
                let body = EmailTemplatesResult[0]?.template ?? "";
                let email = await choosemethod(finalUser.email, "decrypt");
                const toEmail = email ?? "";

                const templateContext = {
                  AssessorsName: finalUser.name,
                  Recommendation: recommendation,
                  Comments: comments,
                  QuestionnaireName: FormName,
                  AssesseeCompanyName: PCCompanyName,
                  Login: origin,
                  isEmailUnsubscribed: isEmailOriginLink,
                  copyrightYear: copyrightYear,
                  HeaderContent: headerTemplate,
                };

                body = renderTemplate(body, templateContext);

                const platformId =
                  result.FormInvitation[0]?.Company?.platformId ?? "";
                if (finalUser?.isEmailSubscribed == true) {
                  const emailSended = await emailUtil.Send(
                    toEmail,
                    EmailTemplatesResult[0]?.ccEmails ?? [],
                    Subject,
                    body,
                    platformId,
                    configdata,
                    EmailTemplatesResult[0]?.bccEmails
                  );

                  emailSendedData.push(emailSended);
                } else {
                  return "";
                }
              })
            );
          }
          finaldataResult.response = emailSendedData;
          finaldataResult.error = null;
          return finaldataResult;
        }
      }
    } catch (error) {
      throw error;
    }
  };
export const emailWhenTheActionsTakenOnTheRecommendationsAreApproved: emailWhenTheActionsTakenOnTheRecommendationsAreApproved =
  async (
    invitationId,
    questionId,
    emailType,
    companyId,
    formId,
    dateAndTime,
    platformId
  ) => {
    try {
      const result = await sdk.GetEmailTemplateDataByinvitationId({
        invitationId: invitationId,
        questionId: questionId,
        emailType: emailType,
        formId: formId,
        platformId: platformId,
      });

      if (result.FormInvitation.length > 0) {
        const EmailTemplatesResultData =
          result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
        const emailConfiguration =
          result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];

        if (
          EmailTemplatesResultData.length > 0 &&
          emailConfiguration.length > 0
        ) {
          let configdata = {
            fromEmail: emailConfiguration[0].fromEmail,
            port: emailConfiguration[0].port,
            host: emailConfiguration[0].host,
            user: emailConfiguration[0].user,
            password: emailConfiguration[0].password,
            isSecure: emailConfiguration[0].isSecure,
          };
          let EmailTemplatesResult: any[] = [];
          let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === companyId && item.formId === formId
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            checkEmailTemplatesExists = EmailTemplatesResultData.filter(
              (item) => item.companyId === null && item.formId === formId
            );
            if (checkEmailTemplatesExists.length > 0) {
              EmailTemplatesResult = checkEmailTemplatesExists;
              EmailTemplatesResult = checkEmailTemplatesExists;
            } else {
              checkEmailTemplatesExists = EmailTemplatesResultData.filter(
                (item) => item.companyId === companyId && item.formId === null
              );
              if (checkEmailTemplatesExists.length > 0) {
                EmailTemplatesResult = checkEmailTemplatesExists;
              } else {
                EmailTemplatesResult = EmailTemplatesResultData.filter(
                  (item) => item.companyId === null && item.formId === null
                );
              }
            }
          }

          let remainingUserDetail: any = [];

          let pcDetails = result?.FormInvitation[0]?.Company?.Users?.filter(
            (x) => x.email === result?.FormInvitation[0].email
          );

          if (pcDetails !== undefined && pcDetails.length > 0) {
            remainingUserDetail.push(pcDetails[0]);
          }

          result?.AssesseeUserMappingRespnder?.forEach((mapping) => {
            mapping?.userByUserid?.UserRoles.forEach((role) => {
              remainingUserDetail.push(role?.User);
            });
          });

          // let responderemail = await choosemethod(
          //   result.AssesseeUserMappingRespnder[0]?.userByUserid?.UserRoles[0]
          //     .User.email,
          //   "decrypt"
          // );

          if (!!remainingUserDetail?.length) {
            await Promise.all(
              remainingUserDetail?.map(async (finalUser: any) => {
                const cc: string[] = [];

                let email = await choosemethod(finalUser.email, "decrypt");

                const toEmail = email ?? "";
                //const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
                // let email = await choosemethod(
                //   result.FormInvitation[0]?.email,
                //   "decrypt"
                // );

                let responder: [] = [];
                cc.push(EmailTemplatesResult[0]?.ccEmails);
                // cc.push(responderemail ?? "");

                // const toEmail = email ?? "";
                //const toEmail = "Vinayak.Zade@powerweave.com";
                //const Subject = EmailTemplatesResult[0]?.subject ?? "";
                const Subject: any =
                  result.FormInvitation[0]?.Company?.Platform?.EmailTemplates[0]
                    ?.subject;

                const bccEmails: any =
                  result.FormInvitation[0]?.Company?.Platform?.EmailTemplates[0]
                    ?.bccEmails;

                //let body = EmailTemplatesResult[0]?.template ?? "";
                let body: any =
                  result.FormInvitation[0]?.Company?.Platform?.EmailTemplates[0]
                    ?.template;
                const UserName =
                  result.FormInvitation[0]?.Company?.primaryContact.name ?? "";
                const AssessorOrgName =
                  result.FormInvitation[0]?.companyByParentcompanyid?.name ??
                  "";

                const originArray: String[] =
                  result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
                const companyid = result.FormInvitation[0]?.companyId;
                let origin: any = originArray.filter(
                  (x) => !x.includes("localhost")
                );
                let isEmailOrigin: any = originArray.filter(
                  (x) => !x.includes("localhost")
                );
                let isEmailSubscribed =
                  result.FormInvitation[0]?.Company?.Users.filter(
                    (item) => item.email === result.FormInvitation[0]?.email
                  );
                const getPeriod = (date: any) => {
                  if (dayjs(date).isValid()) {
                    return dayjs(date).format("MMM YYYY");
                  }
                  return "";
                };
                let Period = `${getPeriod(result.FormInvitation[0]?.durationFrom) +
                  " - " +
                  getPeriod(result.FormInvitation[0]?.durationTo)
                  }`;
                const CompanyName = result.FormInvitation[0]?.Company?.name;
                if (origin.length > 0) {
                  origin = `${origin[0]}assessmentrecommendation/${invitationId}/${result.FormInvitation[0]?.Form?.title}/${Period}/${CompanyName}/0/false/${result.FormSubmission[0]?.id}/0.0/${result.FormInvitation[0]?.Company?.Users[0]?.name}`;
                }
                if (isEmailOrigin.length > 0) {
                  // isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${result.FormInvitation[0]?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
                  isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${finalUser?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
                }
                const FormName = result.FormInvitation[0]?.Form.title;
                const ParentCompanyName =
                  result.FormInvitation[0]?.companyByParentcompanyid?.name ??
                  "";
                const ParentCompanyName1 =
                  result.FormInvitation[0]?.companyByParentcompanyid?.name ??
                  "";
                const ParentCompanyEmail = await choosemethod(
                  // result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email ?? "",
                  result.FormInvitation[0]?.ParentUser?.email ?? "",
                  "decrypt"
                );
                const ParentCompanyEmail1 = await choosemethod(
                  // result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email ?? "",
                  result.FormInvitation[0]?.ParentUser?.email ?? "",
                  "decrypt",
                );
                const copyrightYear = new Date().getFullYear().toString();

                const CompanyHeaderContent =
                  result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
                    ?.CompanyHeaderContent;

                // Get header email templates
                const headerEmailTemplate = await sdk.getGlobalMasterByTypeList(
                  {
                    type: [
                      HeaderEmailTemplateTypes.HeaderWithClientDetails,
                      HeaderEmailTemplateTypes.Header,
                    ],
                  },
                );

                // Determine template type based on company header content
                const templateType = CompanyHeaderContent
                  ? HeaderEmailTemplateTypes.HeaderWithClientDetails
                  : HeaderEmailTemplateTypes.Header;

                // Filter templates by type
                const headerTemplateData =
                  headerEmailTemplate?.GlobalMaster.filter(
                    (item) => item.type === templateType,
                  );

                let headerTemplate =
                  headerTemplateData[0]?.data?.template ?? "";

                // Replace client logo placeholder if available
                if (headerTemplate && CompanyHeaderContent?.clientLogo) {
                  const headerTemplateContent = {
                    clientLogo: CompanyHeaderContent?.clientLogo,
                    width: CompanyHeaderContent?.width,
                    widthinpx: CompanyHeaderContent?.widthinpx,
                    height: CompanyHeaderContent?.height,
                    heightinpx: CompanyHeaderContent?.heightinpx,
                    altText: CompanyHeaderContent?.altText,
                  };
                  headerTemplate = renderTemplate(
                    headerTemplate,
                    headerTemplateContent,
                  );
                }

                const templateContext = {
                  AssesseeName: finalUser.name,
                  dateandtime: dateAndTime,
                  QuestionnaireName: FormName,
                  AssessorOrgName: ParentCompanyName,
                  Login: origin,
                  isEmailUnsubscribed: isEmailOrigin,
                  copyrightYear: copyrightYear,
                  HeaderContent: headerTemplate,
                };

                body = renderTemplate(body, templateContext);

                const platformId =
                  result.FormInvitation[0]?.Company?.platformId ?? "";
                if (
                  !!isEmailSubscribed &&
                  isEmailSubscribed[0]?.isEmailSubscribed == true
                ) {
                  return await emailUtil.Send(
                    toEmail,
                    cc,
                    Subject,
                    body,
                    platformId,
                    configdata,
                    bccEmails
                  );
                } else {
                  return "";
                }
              })
            );
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };
export const EmailWhenRecommendationReopened: EmailWhenRecommendationReopened =
  async (
    invitationId,
    questionId,
    emailType,
    companyId,
    formId,
    recommendation,
    comments,
    dateAndTime,
    platformId
  ) => {
    try {
      const result = await sdk.GetEmailTemplateDataByinvitationId({
        invitationId: invitationId,
        questionId: questionId,
        emailType: emailType,
        formId: formId,
        platformId: platformId,
      });

      if (result.FormInvitation.length > 0) {
        const EmailTemplatesResultData =
          result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
        const emailConfiguration =
          result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];
        if (
          EmailTemplatesResultData.length > 0 &&
          emailConfiguration.length > 0
        ) {
          let configdata = {
            fromEmail: emailConfiguration[0].fromEmail,
            port: emailConfiguration[0].port,
            host: emailConfiguration[0].host,
            user: emailConfiguration[0].user,
            password: emailConfiguration[0].password,
            isSecure: emailConfiguration[0].isSecure,
          };
          let EmailTemplatesResult: any[] = [];
          let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === companyId && item.formId === formId
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            checkEmailTemplatesExists = EmailTemplatesResultData.filter(
              (item) => item.companyId === null && item.formId === formId
            );
            if (checkEmailTemplatesExists.length > 0) {
              EmailTemplatesResult = checkEmailTemplatesExists;
              EmailTemplatesResult = checkEmailTemplatesExists;
            } else {
              checkEmailTemplatesExists = EmailTemplatesResultData.filter(
                (item) => item.companyId === companyId && item.formId === null
              );
              if (checkEmailTemplatesExists.length > 0) {
                EmailTemplatesResult = checkEmailTemplatesExists;
              } else {
                EmailTemplatesResult = EmailTemplatesResultData.filter(
                  (item) => item.companyId === null && item.formId === null
                );
              }
            }
          }

          let remainingUserDetail: any = [];

          let pcDetails = result?.FormInvitation[0]?.Company?.Users?.filter(
            (x) => x.email === result?.FormInvitation[0].email
          );

          if (pcDetails !== undefined && pcDetails.length > 0) {
            remainingUserDetail.push(pcDetails[0]);
          }

          result?.AssesseeUserMappingRespnder?.forEach((mapping) => {
            mapping?.userByUserid?.UserRoles.forEach((role) => {
              remainingUserDetail.push(role?.User);
            });
          });

          // let responderemail = await choosemethod(
          //   result.AssesseeUserMappingRespnder[0]?.userByUserid?.UserRoles[0]
          //     .User.email,
          //   "decrypt"
          // );
          //(item) =>
          // item.ques === questionId && item.invitationId === invitationId

          //const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];

          if (!!remainingUserDetail?.length) {
            await Promise.all(
              remainingUserDetail?.map(async (finalUser: any) => {
                const cc: string[] = [];
                let userEmail = finalUser.email;
                let email = await choosemethod(finalUser.email, "decrypt");

                const toEmail = email ?? "";

                // let email = await choosemethod(
                //   result.FormInvitation[0]?.email,
                //   "decrypt"
                // );

                let responder: [] = [];
                cc.push(EmailTemplatesResult[0]?.ccEmails);
                // cc.push(responderemail ?? "");

                //const toEmail = "Vinayak.Zade@powerweave.com";
                const Subject = EmailTemplatesResult[0]?.subject ?? "";

                let body = EmailTemplatesResult[0]?.template ?? "";
                const UserName =
                  result.FormInvitation[0]?.Company?.primaryContact.name ?? "";

                const originArray: String[] =
                  result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
                const companyid = result.FormInvitation[0]?.companyId;
                let origin: any = originArray.filter(
                  (x) => !x.includes("localhost")
                );
                let isEmailOrigin: any = originArray.filter(
                  (x) => !x.includes("localhost")
                );
                let isEmailSubscribed =
                  result.FormInvitation[0]?.Company?.Users.filter(
                    (item) => item.email === result.FormInvitation[0]?.email
                  );
                const getPeriod = (date: any) => {
                  if (dayjs(date).isValid()) {
                    return dayjs(date).format("MMM YYYY");
                  }
                  return "";
                };
                let Period = `${getPeriod(result.FormInvitation[0]?.durationFrom) +
                  " - " +
                  getPeriod(result.FormInvitation[0]?.durationTo)
                  }`;
                const CompanyName = result.FormInvitation[0]?.Company?.name;
                const isPasswordDetails = await sdk.CheckIsPasswordReset({
                  email: userEmail,
                });
                const encryptedEmail = email ?? "";
                let request = "IsInternalRequest";
                const jwtClaims = buildTokenForKhaitan(
                  encryptedEmail,
                  request,
                  formId
                );
                const accessToken = jwt.sign(
                  jwtClaims,
                  String(HASURA_GRAPHQL_JWT_SECRET),
                  {
                    algorithm: "HS256",
                    expiresIn: "24h",
                  }
                );
                let btntext = "";
                if (origin.length > 0) {
                  {
                    if (!isPasswordDetails?.User[0]?.IsPasswordReset) {
                      origin = `<a href='${origin[0]}setnewpassword?email=${accessToken}'><span style='color:#DF5900'>reset</span></a>`;
                      btntext = "set new password";
                    } else {
                      origin = `<a href='${origin[0]}assessmentrecommendation/${invitationId}/${result.FormInvitation[0]?.Form.title}/${Period}/${CompanyName}/0/false/${result.FormSubmission[0]?.id}/0.0/${result.FormInvitation[0]?.Company?.Users[0]?.name}'><span style='color:#DF5900'>Login</span></a>`;
                      btntext = "login to snowkap";
                    }
                    //origin = `<a href='${origin[0]}companyOnBoarding?companyid=${companyid}'><span style='color:#DF5900'>here</span></a>`;
                  }
                }
                if (isEmailOrigin.length > 0) {
                  // isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${result.FormInvitation[0]?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
                  isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${finalUser?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
                }
                const FormName = result.FormInvitation[0]?.Form.title;
                const ParentCompanyName =
                  result.FormInvitation[0]?.companyByParentcompanyid?.name ??
                  "";
                const ParentCompanyName1 =
                  result.FormInvitation[0]?.companyByParentcompanyid?.name ??
                  "";
                const ParentCompanyEmail = await choosemethod(
                  // result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email ?? "",
                  result.FormInvitation[0]?.ParentUser?.email ?? "",
                  "decrypt"
                );
                const ParentCompanyEmail1 = await choosemethod(
                  // result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email ?? "",
                  result.FormInvitation[0]?.ParentUser?.email ?? "",
                  "decrypt",
                );

                const copyrightYear = new Date().getFullYear().toString();

                const CompanyHeaderContent =
                  result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
                    ?.CompanyHeaderContent;

                // Get header email templates
                const headerEmailTemplate = await sdk.getGlobalMasterByTypeList(
                  {
                    type: [
                      HeaderEmailTemplateTypes.HeaderWithClientDetails,
                      HeaderEmailTemplateTypes.Header,
                    ],
                  },
                );

                // Determine template type based on company header content
                const templateType = CompanyHeaderContent
                  ? HeaderEmailTemplateTypes.HeaderWithClientDetails
                  : HeaderEmailTemplateTypes.Header;

                // Filter templates by type
                const headerTemplateData =
                  headerEmailTemplate?.GlobalMaster.filter(
                    (item) => item.type === templateType,
                  );

                let headerTemplate =
                  headerTemplateData[0]?.data?.template ?? "";

                // Replace client logo placeholder if available
                if (headerTemplate && CompanyHeaderContent?.clientLogo) {
                  const headerTemplateContent = {
                    clientLogo: CompanyHeaderContent?.clientLogo,
                    width: CompanyHeaderContent?.width,
                    widthinpx: CompanyHeaderContent?.widthinpx,
                    height: CompanyHeaderContent?.height,
                    heightinpx: CompanyHeaderContent?.heightinpx,
                    altText: CompanyHeaderContent?.altText,
                  };
                  headerTemplate = renderTemplate(
                    headerTemplate,
                    headerTemplateContent,
                  );
                }

                const templateContext = {
                  AssesseeName: finalUser.name,
                  Recommendation: recommendation,
                  Comments: comments,
                  btntext: btntext,
                  dateandtime: dateAndTime,
                  QuestionnaireName: FormName,
                  AssessorOrgName: ParentCompanyName,
                  Link: origin,
                  isEmailUnsubscribed: isEmailOrigin,
                  copyrightYear: copyrightYear,
                  HeaderContent: headerTemplate,
                };

                body = renderTemplate(body, templateContext);

                const platformId =
                  result.FormInvitation[0]?.Company?.platformId ?? "";
                if (finalUser?.isEmailSubscribed == true) {
                  return await emailUtil.Send(
                    toEmail,
                    cc,
                    Subject,
                    body,
                    platformId,
                    configdata,
                    EmailTemplatesResult[0]?.bccEmails
                  );
                } else {
                  return "";
                }
              })
            );
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };
export const sendRecommenationReminderPreDueDate: sendRecommenationReminderPreDueDate =
  async (platformId) => {
    try {
      const currentDate = new Date();
      const currentTimestamp = currentDate;
      let rowsToUpdateAfterEmailSend: any[] = [];
      const reminderDays = await sdk.GetGlobalMasterDatabyCityStateCountry({
        type: "Recommendation_new",
      });
      // const globalMasterData11 = getLocalStorageData(
      //   window.localStorage,
      //   "warp_GlobalMasterData"
      // );
      // let globalMasterDataStorage: any = JSON.parse(globalMasterData11);
      // const reminderDays = globalMasterDataStorage?.GlobalMaster?.filter(
      //   (x: any) => x.type === "Recommendation_new"
      // );
      if (!!reminderDays.GlobalMaster?.length) {
        await Promise.all(
          reminderDays?.GlobalMaster[0]?.data
            .filter((x: any) => x.IsManualApproverer == true)
            .map(async (globalmasterItem: any) => {
              // const daysBeforeDueDate =
              //   reminderDays.GlobalMaster[0]?.data.filter(
              //     (x: any) => x.FormId == globalmasterItem.FormId
              //   )[0]?.ReminderemailBeforeDueDateInterval;

              let invitationList: any[] = [];
              await Promise.all(
                globalmasterItem.ReminderemailBeforeDueDateInterval.map(
                  async (daysBefore: any) => {
                    const reminderTimestamp1 = new Date();
                    reminderTimestamp1.setDate(
                      reminderTimestamp1.getDate() + daysBefore
                    );
                    const reminderTimestamp =
                      reminderTimestamp1.toLocaleDateString("fr-CA") +
                      " 00:00:00.000";
                    let statusList: any = [
                      RecommendationStatus.Open,
                      RecommendationStatus.Reopened,
                      RecommendationStatus.PendingForApproval,
                    ];

                    let listInvitationIds: any = [];
                    listInvitationIds = await sdk.getInvitationListByFormId({
                      formId: globalmasterItem.FormId,
                      expectedDaterecomm: reminderTimestamp,
                      recommendationStatus: statusList,
                    });
                    if (listInvitationIds.Interim_Recommendation?.length > 0) {
                      invitationList.push(listInvitationIds);
                    }
                  }
                )
              );
              if (!!invitationList && invitationList?.length > 0) {
                let RecommendationArray: any = [];
                let invitationIdList: any = [];
                await Promise.all(
                  invitationList.map(async (invItem: any) => {
                    await Promise.all(
                      invItem.Interim_Recommendation.map(
                        async (invitationlistItem: any) => {
                          let invId =
                            invitationlistItem?.Interim_Answer?.FormSubmission
                              ?.FormInvitation?.id;
                          RecommendationArray.push({
                            invitationId: invId,
                            recommendations: invitationlistItem.recommendations,
                            recommendationId: invitationlistItem.id,
                            expectedDate: invitationlistItem.expectedDate,
                          });
                          rowsToUpdateAfterEmailSend.push(
                            invitationlistItem.id
                          );

                          if (
                            !invitationIdList.some(
                              (el: any) => el.invitationId === invId
                            )
                          )
                            invitationIdList.push({
                              invitationId: invId,
                              parentcompanyId:
                                invitationlistItem?.Interim_Answer
                                  ?.FormSubmission?.FormInvitation
                                  ?.parentcompanyId,
                              companyId:
                                invitationlistItem?.Interim_Answer
                                  ?.FormSubmission?.FormInvitation?.companyId,
                              expectedDate: invitationlistItem.expectedDate,
                            });
                        }
                      )
                    );
                  })
                );
                await Promise.all(
                  invitationIdList.map(async (invIdItem: any) => {
                    const result = await sdk.GetEmailTemplateDataByinvitationId(
                      {
                        invitationId: invIdItem.invitationId,
                        questionId: "00000000-0000-0000-0000-000000000000",
                        emailType: "ReminderBeforeDueDate",
                        formId: globalmasterItem.FormId,
                        platformId: platformId,
                      }
                    );
                    let dueDate1 = dayjs(invIdItem.expectedDate).format(
                      "MMM D, YYYY"
                    );
                    const copyrightYear = new Date().getFullYear().toString();
                    const CompanyHeaderContent =
                      result?.FormInvitation[0]?.companyByParentcompanyid
                        ?.metadata?.CompanyHeaderContent;

                    // Get header email templates
                    const headerEmailTemplate =
                      await sdk.getGlobalMasterByTypeList({
                        type: [
                          HeaderEmailTemplateTypes.HeaderWithClientDetails,
                          HeaderEmailTemplateTypes.Header,
                        ],
                      });

                    // Determine template type based on company header content
                    const templateType = CompanyHeaderContent
                      ? HeaderEmailTemplateTypes.HeaderWithClientDetails
                      : HeaderEmailTemplateTypes.Header;

                    // Filter templates by type
                    const headerTemplateData =
                      headerEmailTemplate?.GlobalMaster.filter(
                        (item) => item.type === templateType,
                      );

                    let headerTemplate =
                      headerTemplateData[0]?.data?.template ?? "";

                    // Replace client logo placeholder if available
                    if (headerTemplate && CompanyHeaderContent?.clientLogo) {
                      const headerTemplateContent = {
                        clientLogo: CompanyHeaderContent?.clientLogo,
                        width: CompanyHeaderContent?.width,
                        widthinpx: CompanyHeaderContent?.widthinpx,
                        height: CompanyHeaderContent?.height,
                        heightinpx: CompanyHeaderContent?.heightinpx,
                        altText: CompanyHeaderContent?.altText,
                      };
                      headerTemplate = renderTemplate(
                        headerTemplate,
                        headerTemplateContent,
                      );
                    }
                    if (!!result) {
                      if (result.FormInvitation?.length > 0) {
                        const EmailTemplatesResultData =
                          result.FormInvitation[0]?.Company?.Platform
                            ?.EmailTemplateswithFormId ?? [];
                        const emailConfiguration =
                          result?.FormInvitation[0]?.Company?.Platform
                            ?.EmailConfigs ?? [];
                        if (
                          EmailTemplatesResultData?.length > 0 &&
                          emailConfiguration.length > 0
                        ) {
                          let configdata = {
                            fromEmail: emailConfiguration[0]?.fromEmail,
                            port: emailConfiguration[0]?.port,
                            host: emailConfiguration[0]?.host,
                            user: emailConfiguration[0]?.user,
                            password: emailConfiguration[0]?.password,
                            isSecure: emailConfiguration[0]?.isSecure,
                          };
                          let EmailTemplatesResult: any[] = [];
                          let checkEmailTemplatesExists =
                            EmailTemplatesResultData.filter(
                              (item) =>
                                item.companyId === invIdItem.parentcompanyId &&
                                item.formId === globalmasterItem.FormId
                            );
                          if (checkEmailTemplatesExists?.length > 0) {
                            EmailTemplatesResult = checkEmailTemplatesExists;
                          } else {
                            checkEmailTemplatesExists =
                              EmailTemplatesResultData.filter(
                                (item) =>
                                  item.companyId === null &&
                                  item.formId === globalmasterItem.FormId
                              );
                            if (checkEmailTemplatesExists?.length > 0) {
                              EmailTemplatesResult = checkEmailTemplatesExists;
                              EmailTemplatesResult = checkEmailTemplatesExists;
                            } else {
                              checkEmailTemplatesExists =
                                EmailTemplatesResultData.filter(
                                  (item) =>
                                    item.companyId ===
                                    invIdItem.parentcompanyId &&
                                    item.formId === null
                                );
                              if (checkEmailTemplatesExists?.length > 0) {
                                EmailTemplatesResult =
                                  checkEmailTemplatesExists;
                              } else {
                                EmailTemplatesResult =
                                  EmailTemplatesResultData.filter(
                                    (item) =>
                                      item.companyId === null &&
                                      item.formId === null
                                  );
                              }
                            }
                          }

                          if (
                            !!EmailTemplatesResult &&
                            EmailTemplatesResult?.length > 0
                          ) {
                            const cc: string[] =
                              EmailTemplatesResult[0]?.ccEmails ?? [];
                            let email = await choosemethod(
                              result.FormInvitation[0]?.email,
                              "decrypt"
                            );
                            const toEmail = email ?? "";
                            //const toEmail = "mailto:vinayak.zade@powerweave.com";
                            const Subject =
                              EmailTemplatesResult[0]?.subject ?? "";
                            let body = EmailTemplatesResult[0]?.template ?? "";
                            const UserName =
                              result.FormInvitation[0]?.Company?.primaryContact
                                .name ?? "";

                            const originArray: String[] =
                              result.FormInvitation[0]?.Company?.Platform
                                ?.origin ?? [];
                            const companyid =
                              result.FormInvitation[0]?.companyId;
                            const CompanyName =
                              result.FormInvitation[0]?.Company?.name;
                            let origin: any = originArray.filter(
                              (x) => !x.includes("localhost")
                            );
                            let isEmailOrigin: any = originArray.filter(
                              (x) => !x.includes("localhost")
                            );
                            let isEmailSubscribed =
                              result.FormInvitation[0]?.Company?.Users.filter(
                                (item) =>
                                  item.email === result.FormInvitation[0]?.email
                              );
                            const getPeriod = (date: any) => {
                              if (dayjs(date).isValid()) {
                                return dayjs(date).format("MMM YYYY");
                              }
                              return "";
                            };
                            let Period = `${getPeriod(
                              result.FormInvitation[0]?.durationFrom,
                            ) +
                              " - " +
                              getPeriod(result.FormInvitation[0]?.durationTo)
                              }`;
                            if (origin?.length > 0) {
                              // origin = `<a href='${origin[0]}companyOnBoarding?companyid=${companyid}'><span style='color:#DF5900'>Login</span></a>`;
                              origin = `${origin[0]}assessmentrecommendation/${invIdItem.invitationId}/${result.FormInvitation[0]?.Form.title}/${Period}/${CompanyName}/0/false/${result.FormSubmission[0]?.id}/0.0/${result.FormInvitation[0]?.Company?.Users[0]?.name}`;
                            }
                            if (isEmailOrigin.length > 0) {
                              isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${result.FormInvitation[0]?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
                            }
                            const FormName =
                              result.FormInvitation[0]?.Form.title;
                            const ParentCompanyName =
                              result.FormInvitation[0]?.companyByParentcompanyid
                                ?.name ?? "";
                            const ParentCompanyName1 =
                              result.FormInvitation[0]?.companyByParentcompanyid
                                ?.name ?? "";
                            const ParentCompanyEmail = await choosemethod(
                              result.FormInvitation[0]?.companyByParentcompanyid
                                ?.Users[0]?.email ?? "",
                              "decrypt"
                            );
                            const ParentCompanyEmail1 = await choosemethod(
                              result.FormInvitation[0]?.companyByParentcompanyid
                                ?.Users[0]?.email ?? "",
                              "decrypt"
                            );
                            let RecommendationList1 = "";
                            let RecommendationList2 = "";
                            let finalRecommendationsList: any = [];
                            let recommendationDate: any = [];

                            // if (RecommendationArray?.length == 1) {
                            //   RecommendationList1 =
                            //     RecommendationArray[0]?.recommendations;
                            // } else {
                            let filteredRecommendations =
                              RecommendationArray.filter(
                                (x: any) =>
                                  x.invitationId === invIdItem.invitationId
                              ).sort(
                                (a: any, b: any) =>
                                  Number(new Date(a.expectedDate)) -
                                  Number(new Date(b.expectedDate))
                              );

                            await Promise.all(
                              filteredRecommendations.map(async (fRec: any) => {
                                recommendationDate.push(fRec.expectedDate);
                              })
                            );

                            let filteredRecommendationDate =
                              recommendationDate.filter(
                                (val: any, i: any) =>
                                  recommendationDate.indexOf(val) === i
                              );

                            await Promise.all(
                              filteredRecommendationDate.map(
                                async (fDate: any) => {
                                  let recommendationDateList =
                                    filteredRecommendations.filter(
                                      (fRec: any) => fRec.expectedDate === fDate
                                    );
                                  await Promise.all(
                                    recommendationDateList.map(
                                      async (rec: any, i: any) => {
                                        if (
                                          recommendationDateList.length === 1
                                        ) {
                                          finalRecommendationsList.push(
                                            `<li>${rec.recommendations}</li>
                                            <span style='margin-bottom: 10pt;'>Due Date: ${dayjs(
                                              rec.expectedDate
                                            ).format("MMM D, YYYY")} </span>`
                                          );
                                        } else {
                                          recommendationDateList.length ===
                                            i + 1
                                            ? finalRecommendationsList.push(
                                              `<li  style="margin:5px 0;">${rec.recommendations}</li>` +
                                              `<span style='margin-bottom: 10pt;'>Due Date: ${dayjs(
                                                rec.expectedDate
                                              ).format(
                                                "MMM D, YYYY"
                                              )} </span>`
                                            )
                                            : finalRecommendationsList.push(
                                              `<li  style="margin:5px 0;">${rec.recommendations}</li>`
                                            );
                                        }
                                      }
                                    )
                                  );
                                }
                              )
                            );

                            RecommendationList2 =
                              "<ul style='font-family:'Trebuchet MS', sans-serif; list-style-type: decimal;font-size:14px;padding-left:0;'>\n" +
                              finalRecommendationsList
                                .map((fRec: any) => fRec)
                                .join("\n") +
                              "\n</ul>";
                            // }

                            const templateContext = {
                              AssesseeName: UserName,
                              QuestionnaireName: FormName,
                              AssessorCompanyName: ParentCompanyName,
                              Recommendation1: RecommendationList1,
                              Recommendation2: RecommendationList2,
                              Login: origin,
                              isEmailUnsubscribed: isEmailOrigin,
                              copyrightYear: copyrightYear,
                              HeaderContent: headerTemplate,
                            };

                            body = renderTemplate(body, templateContext);

                            const platformId =
                              result.FormInvitation[0]?.Company?.platformId ??
                              "";

                            await sdk.insertRecommendationReminderEmails({
                              emailId: toEmail,
                              ccEmailId: cc[0],
                              subject: Subject + " - PreDueDate",
                              invitationId: invIdItem.invitationId,
                              bccEmailId: EmailTemplatesResult[0]?.bccEmails,
                            });
                            console.log("toEmail", toEmail);
                            try {
                              if (
                                !!isEmailSubscribed &&
                                isEmailSubscribed[0]?.isEmailSubscribed == true
                              ) {
                                return await emailUtil.Send(
                                  toEmail,
                                  cc,
                                  Subject,
                                  body,
                                  platformId,
                                  configdata,
                                  EmailTemplatesResult[0]?.bccEmails
                                );
                              } else {
                                return "";
                              }
                            } catch (error) {
                              return error;
                            }
                          }
                        }
                      }
                    }
                  })
                );
              }
            })
        );
      }
    } catch (error) {
      throw error;
    }
  };

export const sendRecommenationReminderPostDueDate: sendRecommenationReminderPostDueDate =
  async (emailType, platformId) => {
    try {
      const currentDate = new Date();
      const currentTimestamp = currentDate;
      let toSendEmail = false;
      let dueDate = new Date().toLocaleDateString("fr-CA") + " 00:00:00.000";
      let RecommendationArray: any = [];
      let rowsToUpdateAfterEmailSend: any[] = [];
      let invitationList: any[] = [];
      const reminderDays = await sdk.GetGlobalMasterDatabyCityStateCountry({
        type: "Recommendation_new",
      });
      // const globalMasterData11 = getLocalStorageData(
      //   window.localStorage,
      //   "warp_GlobalMasterData"
      // );
      // let globalMasterDataStorage: any = JSON.parse(globalMasterData11);
      // const reminderDays = globalMasterDataStorage?.GlobalMaster?.filter(
      //   (x: any) => x.type === "Recommendation_new"
      // );
      if (!!reminderDays.GlobalMaster.length) {
        await Promise.all(
          reminderDays.GlobalMaster[0]?.data
            .filter((x: any) => x.IsManualApproverer == true)
            .map(async (globalmasterItem: any) => {
              // const daysAfterDueDate = reminderDays?.GlobalMaster[0]?.data.filter(
              //   (x: any) => x.FormId == globalmasterItem.FormId
              // )[0]?.ReminderemailAfterDueDateInterval;

              const TotalEmailCount = reminderDays.GlobalMaster[0]?.data.filter(
                (x: any) => x.FormId == globalmasterItem.FormId
              )[0]?.TotalEmailCount;

              const DaysInterval = reminderDays.GlobalMaster[0]?.data.filter(
                (x: any) => x.FormId == globalmasterItem.FormId
              )[0]?.DaysInterval;

              const reminderTimestamp1 = new Date();
              reminderTimestamp1.setDate(
                reminderTimestamp1.getDate() -
                globalmasterItem.ReminderemailAfterDueDateInterval[0]
              );
              const reminderTimestamp =
                reminderTimestamp1.toLocaleDateString("fr-CA") +
                " 00:00:00.000";
              let statusList: any = [
                RecommendationStatus.Open,
                RecommendationStatus.Reopened,
                RecommendationStatus.PendingForApproval,
              ];
              let listInvitationIds = await sdk.getInvitaionListByFormIdandDate(
                {
                  formId: globalmasterItem.FormId,
                  expectedDaterecomm: reminderTimestamp,
                  recommendationStatus: statusList,
                }
              );
              invitationList = [];
              invitationList.push(listInvitationIds);
              let invitationIdList: any = [];
              await Promise.all(
                invitationList[0]?.Interim_Recommendation.map(
                  async (invitationlistItem: any) => {
                    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                    const firstDate: any = new Date(
                      invitationlistItem.expectedDate
                    );
                    const secondDate: any =
                      invitationlistItem.ReminderIntervalAfterDueDate !== null
                        ? new Date(
                          invitationlistItem.ReminderIntervalAfterDueDate
                        )
                        : new Date();

                    const diffDays = Math.round(
                      Math.abs((firstDate - secondDate) / oneDay)
                    );

                    const weekCount = Math.floor(diffDays / DaysInterval);

                    let invId =
                      invitationlistItem?.Interim_Answer?.FormSubmission
                        ?.FormInvitation?.id;
                    RecommendationArray.push({
                      invitationId: invId,
                      recommendations: invitationlistItem.recommendations,
                      recommendationId: invitationlistItem.id,
                      weekCount,
                    });
                    rowsToUpdateAfterEmailSend.push(invitationlistItem.id);
                    if (
                      !invitationIdList.some(
                        (el: any) => el.invitationId === invId
                      )
                    )
                      invitationIdList.push({
                        invitationId: invId,
                        parentcompanyId:
                          invitationlistItem?.Interim_Answer?.FormSubmission
                            ?.FormInvitation?.parentcompanyId,
                        companyId:
                          invitationlistItem?.Interim_Answer?.FormSubmission
                            ?.FormInvitation?.companyId,
                        expectedDate: invitationlistItem.expectedDate,
                      });
                  }
                )
              );

              await Promise.all(
                invitationIdList.map(async (invIdItem: any) => {
                  const result = await sdk.GetEmailTemplateDataByinvitationId({
                    invitationId: invIdItem.invitationId,
                    questionId: "00000000-0000-0000-0000-000000000000",
                    emailType: emailType,
                    formId: globalmasterItem.FormId,
                    platformId: platformId,
                  });
                  let dueDate1 = dayjs(invIdItem.expectedDate).format(
                    "MMM D, YYYY"
                  );
                  if (result.FormInvitation.length > 0) {
                    const EmailTemplatesResultData =
                      result.FormInvitation[0]?.Company?.Platform
                        ?.EmailTemplateswithFormId ?? [];
                    const emailConfiguration =
                      result?.FormInvitation[0]?.Company?.Platform
                        ?.EmailConfigs ?? [];
                    if (
                      EmailTemplatesResultData.length > 0 &&
                      emailConfiguration.length > 0
                    ) {
                      let configdata = {
                        fromEmail: emailConfiguration[0]?.fromEmail,
                        port: emailConfiguration[0]?.port,
                        host: emailConfiguration[0]?.host,
                        user: emailConfiguration[0]?.user,
                        password: emailConfiguration[0]?.password,
                        isSecure: emailConfiguration[0]?.isSecure,
                      };
                      let EmailTemplatesResult: any[] = [];
                      let checkEmailTemplatesExists =
                        EmailTemplatesResultData.filter(
                          (item) =>
                            item.companyId === invIdItem.parentcompanyId &&
                            item.formId === globalmasterItem.FormId
                        );
                      if (checkEmailTemplatesExists.length > 0) {
                        EmailTemplatesResult = checkEmailTemplatesExists;
                      } else {
                        checkEmailTemplatesExists =
                          EmailTemplatesResultData.filter(
                            (item) =>
                              item.companyId === null &&
                              item.formId === globalmasterItem.FormId
                          );
                        if (checkEmailTemplatesExists.length > 0) {
                          EmailTemplatesResult = checkEmailTemplatesExists;
                          EmailTemplatesResult = checkEmailTemplatesExists;
                        } else {
                          checkEmailTemplatesExists =
                            EmailTemplatesResultData.filter(
                              (item) =>
                                item.companyId === invIdItem.parentcompanyId &&
                                item.formId === null
                            );
                          if (checkEmailTemplatesExists.length > 0) {
                            EmailTemplatesResult = checkEmailTemplatesExists;
                          } else {
                            EmailTemplatesResult =
                              EmailTemplatesResultData.filter(
                                (item) =>
                                  item.companyId === null &&
                                  item.formId === null
                              );
                          }
                        }
                      }

                      if (
                        !!EmailTemplatesResult &&
                        EmailTemplatesResult.length > 0
                      ) {
                        const cc: string[] =
                          EmailTemplatesResult[0]?.ccEmails ?? [];
                        let email = await choosemethod(
                          result.FormInvitation[0]?.email,
                          "decrypt"
                        );
                        const toEmail = email ?? "";
                        //const toEmail = "mailto:vinayak.zade@powerweave.com";
                        const Subject = EmailTemplatesResult[0]?.subject ?? "";
                        let body = EmailTemplatesResult[0]?.template ?? "";
                        const UserName =
                          result.FormInvitation[0]?.Company?.primaryContact
                            .name ?? "";

                        const originArray: String[] =
                          result.FormInvitation[0]?.Company?.Platform?.origin ??
                          [];
                        const CompanyName =
                          result.FormInvitation[0]?.Company?.name;
                        let origin: any = originArray.filter(
                          (x) => !x.includes("localhost")
                        );
                        let isEmailOrigin: any = originArray.filter(
                          (x) => !x.includes("localhost")
                        );
                        let isEmailSubscribed =
                          result.FormInvitation[0]?.Company?.Users.filter(
                            (item) =>
                              item.email === result.FormInvitation[0]?.email
                          );
                        const getPeriod = (date: any) => {
                          if (dayjs(date).isValid()) {
                            return dayjs(date).format("MMM YYYY");
                          }
                          return "";
                        };
                        let Period = `${getPeriod(result.FormInvitation[0]?.durationFrom) +
                          " - " +
                          getPeriod(result.FormInvitation[0]?.durationTo)
                          }`;
                        if (origin.length > 0) {
                          origin = `${origin[0]}assessmentrecommendation/${invIdItem.invitationId}/${result.FormInvitation[0]?.Form.title}/${Period}/${CompanyName}/0/false/${result.FormSubmission[0]?.id}/0.0/${result.FormInvitation[0]?.Company?.Users[0]?.name}`;
                          //origin = `<a href='${origin[0]}companyOnBoarding?companyid=${companyid}'><span style='color:#DF5900'>Login</span></a>`;
                        }
                        if (isEmailOrigin.length > 0) {
                          isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${result.FormInvitation[0]?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
                        }
                        const FormName = result.FormInvitation[0]?.Form.title;
                        const ParentCompanyName =
                          result.FormInvitation[0]?.companyByParentcompanyid
                            ?.name ?? "";
                        const ParentCompanyName1 =
                          result.FormInvitation[0]?.companyByParentcompanyid
                            ?.name ?? "";
                        const ParentCompanyEmail = await choosemethod(
                          result.FormInvitation[0]?.companyByParentcompanyid
                            ?.Users[0]?.email ?? "",
                          "decrypt"
                        );
                        const ParentCompanyEmail1 = await choosemethod(
                          result.FormInvitation[0]?.companyByParentcompanyid
                            ?.Users[0]?.email ?? "",
                          "decrypt"
                        );
                        let RecommendationList1 = "";
                        let RecommendationList2 = "";
                        if (RecommendationArray.length == 1) {
                          RecommendationList1 =
                            RecommendationArray[0]?.recommendations;
                        } else {
                          RecommendationList2 =
                            "<ul style='font-family:'Trebuchet MS', sans-serif; list-style-type: decimal;font-size:14px;padding-left:0;'>\n" +
                            (await RecommendationArray.filter(
                              (x: any) =>
                                x.invitationId === invIdItem.invitationId &&
                                x.weekCount <= TotalEmailCount - 1
                            )
                              .map(
                                (item: any) =>
                                  `<li style="margin:5px 0;">${item.recommendations}</li>`,
                              )
                              .join("\n")) +
                            "\n</ul>";
                        }
                        const copyrightYear = new Date()
                          .getFullYear()
                          .toString();
                        const CompanyHeaderContent =
                          result?.FormInvitation[0]?.companyByParentcompanyid
                            ?.metadata?.CompanyHeaderContent;

                        // Get header email templates
                        const headerEmailTemplate =
                          await sdk.getGlobalMasterByTypeList({
                            type: [
                              HeaderEmailTemplateTypes.HeaderWithClientDetails,
                              HeaderEmailTemplateTypes.Header,
                            ],
                          });

                        // Determine template type based on company header content
                        const templateType = CompanyHeaderContent
                          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
                          : HeaderEmailTemplateTypes.Header;

                        // Filter templates by type
                        const headerTemplateData =
                          headerEmailTemplate?.GlobalMaster.filter(
                            (item) => item.type === templateType,
                          );

                        let headerTemplate =
                          headerTemplateData[0]?.data?.template ?? "";

                        // Replace client logo placeholder if available
                        if (
                          headerTemplate &&
                          CompanyHeaderContent?.clientLogo
                        ) {
                          const headerTemplateContent = {
                            clientLogo: CompanyHeaderContent?.clientLogo,
                            width: CompanyHeaderContent?.width,
                            widthinpx: CompanyHeaderContent?.widthinpx,
                            height: CompanyHeaderContent?.height,
                            heightinpx: CompanyHeaderContent?.heightinpx,
                            altText: CompanyHeaderContent?.altText,
                          };
                          headerTemplate = renderTemplate(
                            headerTemplate,
                            headerTemplateContent,
                          );
                        }

                        const templateContext = {
                          AssesseeName: UserName,
                          QuestionnaireName: FormName,
                          AssessorCompanyName: ParentCompanyName,
                          DueDate: dueDate1,
                          Recommendation1: RecommendationList1,
                          Recommendation2: RecommendationList2,
                          Login: origin,
                          isEmailUnsubscribed: isEmailOrigin,
                          copyrightYear: copyrightYear,
                          HeaderContent: headerTemplate,
                        };

                        body = renderTemplate(body, templateContext);

                        let recommIdList: any = [];

                        await RecommendationArray.filter(
                          (x: any) =>
                            x.invitationId === invIdItem.invitationId &&
                            x.weekCount <= TotalEmailCount - 1
                        ).map((x: any) =>
                          recommIdList.push(x.recommendationId)
                        );
                        if (recommIdList.length > 0) {
                          await sdk.updateTimestampAfterEmailSend({
                            id: recommIdList, //rowsToUpdateAfterEmailSend,
                            reminderIntervalAfterDueDate: dueDate,
                          });
                          const platformId =
                            result.FormInvitation[0]?.Company?.platformId ?? "";
                          await sdk.insertRecommendationReminderEmails({
                            emailId: toEmail,
                            ccEmailId: cc[0],
                            subject: Subject + " - PostDueDate",
                            invitationId: invIdItem.invitationId,
                            bccEmailId: EmailTemplatesResult[0]?.bccEmails,
                          });

                          if (
                            !!isEmailSubscribed &&
                            isEmailSubscribed[0]?.isEmailSubscribed == true
                          ) {
                            return await emailUtil.Send(
                              toEmail,
                              cc,
                              Subject,
                              body,
                              platformId,
                              configdata,
                              EmailTemplatesResult[0]?.bccEmails
                            );
                          } else {
                            return "";
                          }
                        }
                      }
                    }
                  }
                })
              );
            })
        );
      }
    } catch (error) {
      throw error;
    }
  };
export const sendCompanyInvitationEmail = async (bodyObject: any) => {
  // const util = require('util');
  // let fromEmail = "", toEmail = "", subject = "", body = "";

  // cc.push("vinayak_zade@yahoo.com");
  // cc.push("vinayak.zade1988@gmail.com");
  // console.log("cc", cc);

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  try {
  } catch (error) {
    throw error;
  }

  const result = await sdk.GetEmailTemplateDataByinvitationId({
    invitationId: bodyObject.invitationId,
    questionId: "00000000-0000-0000-0000-000000000000",
    emailType: bodyObject.emailType,
    formId: bodyObject.formId,
    platformId: bodyObject.platformId,
  });

  if (result.FormInvitation.length > 0) {
    const EmailTemplatesResultData =
      result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
    const emailConfiguration =
      result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];

    if (EmailTemplatesResultData.length > 0 && emailConfiguration.length > 0) {
      let configdata = {
        fromEmail: emailConfiguration[0].fromEmail,
        port: emailConfiguration[0].port,
        host: emailConfiguration[0].host,
        user: emailConfiguration[0].user,
        password: emailConfiguration[0].password,
        isSecure: emailConfiguration[0].isSecure,
      };
      let EmailTemplatesResult: any[] = [];
      let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
        (item) =>
          item.companyId === bodyObject.companyId &&
          item.formId === bodyObject.formId
      );
      if (checkEmailTemplatesExists.length > 0) {
        EmailTemplatesResult = checkEmailTemplatesExists;
      } else {
        checkEmailTemplatesExists = EmailTemplatesResultData.filter(
          (item) => item.companyId === null && item.formId === bodyObject.formId
        );
        if (checkEmailTemplatesExists.length > 0) {
          EmailTemplatesResult = checkEmailTemplatesExists;
          EmailTemplatesResult = checkEmailTemplatesExists;
        } else {
          checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) =>
              item.companyId === bodyObject.companyId && item.formId === null
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            EmailTemplatesResult = EmailTemplatesResultData.filter(
              (item) => item.companyId === null && item.formId === null
            );
          }
        }
      }
      let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
        (item) => item.email === result.FormInvitation[0]?.email
      );
      const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
      let email = await choosemethod(
        result.FormInvitation[0]?.email,
        "decrypt"
      );
      const toEmail = email ?? "";
      //const toEmail = "Vinayak.Zade@powerweave.com";
      const Subject = EmailTemplatesResult[0]?.subject ?? "";

      let body = EmailTemplatesResult[0]?.template ?? "";
      const UserName =
        result.FormInvitation[0]?.Company?.primaryContact.name ?? "";
      const originArray: String[] =
        result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
      const companyid = result.FormInvitation[0]?.companyId;
      let origin: any = await Promise.all(
        originArray.filter((x) => !x.includes("localhost"))
      );
      let setorlogintext = "";
      let btntext = "";
      if (origin.length > 0) {
        if (
          bodyObject.emailType === "FormInvitation" ||
          bodyObject.emailType === "ExistingCompanyFormInvitation"
        ) {
          origin = `${origin[0]}companyOnBoarding?companyid=${companyid}`;
          setorlogintext = "set your password";
          btntext =
            bodyObject.emailType === "ExistingCompanyFormInvitation"
              ? "Access Questionnaire"
              : "set your password";
        } else {
          origin = `${origin[0]}`;
          setorlogintext = "login";
          btntext = "login to snowkap";
        }
      }
      let isEmailOrigin: any = await Promise.all(
        originArray.filter((x) => !x.includes("localhost"))
      );

      if (isEmailOrigin.length > 0) {
        isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${result?.FormInvitation[0]?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
      }
      const FormName = result.FormInvitation[0]?.Form.title;
      const ParentCompanyName =
        result.FormInvitation[0]?.companyByParentcompanyid?.name ?? "";
      const ParentCompanyName1 =
        result.FormInvitation[0]?.companyByParentcompanyid?.name ?? "";
      const ParentCompanyEmail = await choosemethod(
        // result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email ?? "",
        result.FormInvitation[0]?.ParentUser?.email ?? "",
        "decrypt"
      );

      const ParentCompanyEmail1 = await choosemethod(
        // result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email ?? "",
        result.FormInvitation[0]?.ParentUser?.email ?? "",
        "decrypt"
      );
      const copyrightYear = new Date().getFullYear().toString();
      const CompanyHeaderContent =
        result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
          ?.CompanyHeaderContent;

      // Get header email templates
      const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
        type: [
          HeaderEmailTemplateTypes.HeaderWithClientDetails,
          HeaderEmailTemplateTypes.Header,
        ],
      });

      // Determine template type based on company header content
      const templateType = CompanyHeaderContent
        ? HeaderEmailTemplateTypes.HeaderWithClientDetails
        : HeaderEmailTemplateTypes.Header;

      // Filter templates by type
      const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
        (item) => item.type === templateType,
      );

      let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

      // Replace client logo placeholder if available
      if (headerTemplate && CompanyHeaderContent?.clientLogo) {
        const headerTemplateContent = {
          clientLogo: CompanyHeaderContent?.clientLogo,
          width: CompanyHeaderContent?.width,
          widthinpx: CompanyHeaderContent?.widthinpx,
          height: CompanyHeaderContent?.height,
          heightinpx: CompanyHeaderContent?.heightinpx,
          altText: CompanyHeaderContent?.altText,
        };
        headerTemplate = renderTemplate(
          headerTemplate,
          headerTemplateContent,
        );
      }
      const templateContext = {
        UserName: UserName,
        Link: origin,
        setorlogintext: setorlogintext,
        btntext: btntext,
        FormName: FormName,
        ParentCompanyName: ParentCompanyName,
        ParentCompanyEmail: ParentCompanyEmail,
        ParentCompName: ParentCompanyName1,
        ParentCompmail: ParentCompanyEmail1,
        isEmailUnsubscribed: isEmailOrigin,
        copyrightYear: copyrightYear,
        HeaderContent: headerTemplate,
      };

      body = renderTemplate(body, templateContext);

      const platformId = result.FormInvitation[0]?.Company?.platformId ?? "";
      let userdata = result.FormInvitation[0]?.Company?.Users ?? "";

      if (userdata.length > 0) {
        if (
          !!isEmailSubscribed &&
          isEmailSubscribed[0]?.isEmailSubscribed == true
        ) {
          let emailSendedData: any = [];
          const EmailInsertData: EmailNotifications_Insert_Input[] = [];
          const emaildata: EmailNotifications_Updates[] = [];
          EmailInsertData.push({
            invitationId: bodyObject.invitationId,
            emailId: toEmail,
            subject: Subject || "",
            mailBody: body,
            ccEmails: EmailTemplatesResult[0]?.ccEmails,
            status: "",
            configData: configdata,
            bccEmailId: EmailTemplatesResult[0]?.bccEmails,
          });
          if (EmailInsertData.length > 0) {
            emailSendedData = await sdk.insert_EmailNotifications({
              emailData: EmailInsertData,
            });
            const emailSended: SentMessageInfo = await emailUtil.Send(
              toEmail,
              cc,
              Subject,
              body,
              platformId,
              configdata,
              EmailTemplatesResult[0]?.bccEmails
            );
            const isRejected =
              Array.isArray(emailSended?.rejected) &&
              emailSended.rejected.length > 0;
            emaildata.push({
              where: { id: { _eq: emailSendedData?.id } },
              _set: {
                status: isRejected ? EmailStatus.fail : EmailStatus.success,
                error: isRejected ? emailSended?.response : null,
              },
            });

            const updateEmaildata = await sdk.updateStatusOfEmail({
              emailData: emaildata,
            });
            return emailSended;
          }
        }
      } else {
        let emailSendedData: any = [];
        const EmailInsertData: EmailNotifications_Insert_Input[] = [];
        const emaildata: EmailNotifications_Updates[] = [];
        EmailInsertData.push({
          invitationId: bodyObject.invitationId,
          emailId: toEmail,
          subject: Subject || "",
          mailBody: body,
          ccEmails: EmailTemplatesResult[0]?.ccEmails,
          status: "",
          configData: configdata,
          bccEmailId: EmailTemplatesResult[0]?.bccEmails,
        });
        if (EmailInsertData.length > 0) {
          emailSendedData = await sdk.insert_EmailNotifications({
            emailData: EmailInsertData,
          });
          const emailSended: SentMessageInfo = await emailUtil.Send(
            toEmail,
            cc,
            Subject,
            body,
            platformId,
            configdata,
            EmailTemplatesResult[0]?.bccEmails
          );
          const isRejected =
            Array.isArray(emailSended?.rejected) &&
            emailSended.rejected.length > 0;
          emaildata.push({
            where: { id: { _eq: emailSendedData?.id } },
            _set: {
              status: isRejected ? EmailStatus.fail : EmailStatus.success,
              error: isRejected ? emailSended?.response : null,
            },
          });
          const updateEmaildata = await sdk.updateStatusOfEmail({
            emailData: emaildata,
          });
          return emailSended;
        }
      }
    }
  }
};
//export default sendCompanyInvitationEmail;

export const sendFormResponseMail: sendFormResponseMailType = async (
  invitationId,
  emailType,
  companyId,
  formId,
  platformId
) => {
  const result = await sdk.GetEmailTemplateDataByinvitationId({
    invitationId: invitationId,
    questionId: "00000000-0000-0000-0000-000000000000",
    emailType: emailType,
    formId: formId,
    platformId: platformId,
  });
  if (result.FormInvitation.length > 0) {
    let toEmailParentUser = result.FormInvitation[0].ParentUser?.email;
    const createdByuserRole =
      result.FormInvitation[0].ParentUser?.UserRoles[0]?.roleName;
    const EmailTemplatesResult =
      result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
    const emailConfiguration =
      result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];
    let toEmailParentUserName = result.FormInvitation[0].ParentUser?.name ?? "";

    if (EmailTemplatesResult.length > 0 && emailConfiguration.length > 0) {
      let configdata = {
        fromEmail: emailConfiguration[0]?.fromEmail,
        port: emailConfiguration[0]?.port,
        host: emailConfiguration[0]?.host,
        user: emailConfiguration[0]?.user,
        password: emailConfiguration[0]?.password,
        isSecure: emailConfiguration[0]?.isSecure,
      };
      const ccEmail: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
      let remainingUserDetail: any = [];
      if (result?.FormInvitation[0]?.companyByParentcompanyid?.Users) {
        if (!!toEmailParentUser) {
          remainingUserDetail.push(result?.FormInvitation[0]?.ParentUser);
        } else {
          remainingUserDetail = [
            ...result?.FormInvitation[0]?.companyByParentcompanyid?.Users,
          ];
        }

        // const Old_result = cloneDeep(result);
        //Consultant
        result?.FormInvitation[0]?.companyByParentcompanyid?.AssessorConsultantMappings.forEach(
          (mapping) => {
            mapping?.companyByConsultantcompanyid?.Users.forEach((user) => {
              let findItem = remainingUserDetail.find(
                (x: any) => x === user.email
              );
              if (!findItem) {
                remainingUserDetail.push(user);
              }
            });
          }
        );
      }
      ///Group From For Consultant
      result?.FormInvitation[0]?.companyByParentcompanyid?.GroupForm.forEach(
        (mapping) => {
          mapping?.companyByConsultantcompanyid?.Users?.forEach((user) => {
            if (
              remainingUserDetail.filter(
                (item: any) => item.email == user.email
              ).length == 0
            ) {
              remainingUserDetail.push(user);
            }
          });
        }
      );
      let cc = await choosemethod(
        result.FormInvitation[0]?.companyByParentcompanyid
          ?.AssessorConsultantMappings[0]?.companyByConsultantcompanyid
          ?.Users[0]?.email,
        "decrypt"
      );
      const Subject = EmailTemplatesResult[0].subject ?? "";
      const originArray: String[] =
        result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
      let origin: any = originArray.filter((x) => !x.includes("localhost"));
      const isEmailOrigin: any = originArray.filter(
        (x) => !x.includes("localhost")
      );
      const CompanyName = result.FormInvitation[0]?.Company?.name ?? "";
      const getPeriod = (date: any) => {
        if (dayjs(date).isValid()) {
          return dayjs(date).format("MMM YYYY");
        }
        return "";
      };
      let Period = `${getPeriod(result.FormInvitation[0]?.durationFrom) +
        " - " +
        getPeriod(result.FormInvitation[0]?.durationTo)
        }`;
      let getFormData: any = [];
      if (result.GlobalMaster?.length > 0) {
        result.GlobalMaster[0]?.data.map((item: any) => {
          if (item.FormId === formId) {
            getFormData.push(item);
          }
        });
      }
      if (origin.length > 0) {
        if (getFormData.length == 0) {
          origin = `${origin[0]}assessments/#/assessment_listing`;
        } else if (getFormData[0]?.IsAutoRecommendation) {
          origin = `${origin[0]}assessmentrecommendation/${invitationId}/${result.FormInvitation[0]?.Form.title}/${Period}/${CompanyName}/0/false/${result.FormSubmission[0]?.id}/0.0/${result.FormInvitation[0]?.Company?.Users[0]?.name}`;
        } else {
          origin = `${origin[0]}`;
        }
      }

      if (!!remainingUserDetail?.length) {
        await Promise.all(
          remainingUserDetail?.map(async (finalUser: any) => {
            let isEmailOriginLink = isEmailOrigin;
            if (isEmailOriginLink.length > 0) {
              if (finalUser?.UserRoles[0]?.roleName !== AppRoles.Consultant) {
                isEmailOriginLink = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${finalUser?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
              } else if (
                finalUser?.UserRoles[0]?.roleName === AppRoles.Consultant
              ) {
                isEmailOriginLink = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${finalUser?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
              } else {
                isEmailOriginLink = "";
              }
            }
            let body = EmailTemplatesResult[0]?.template ?? "";
            let email = await choosemethod(finalUser.email, "decrypt");
            const toEmail = email ?? "";

            const copyrightYear = new Date().getFullYear().toString();
            const CompanyHeaderContent =
              result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
                ?.CompanyHeaderContent;

            // Get header email templates
            const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
              type: [
                HeaderEmailTemplateTypes.HeaderWithClientDetails,
                HeaderEmailTemplateTypes.Header,
              ],
            });

            // Determine template type based on company header content
            const templateType = CompanyHeaderContent
              ? HeaderEmailTemplateTypes.HeaderWithClientDetails
              : HeaderEmailTemplateTypes.Header;

            // Filter templates by type
            const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
              (item) => item.type === templateType,
            );

            let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

            // Replace client logo placeholder if available
            if (headerTemplate && CompanyHeaderContent?.clientLogo) {
              const headerTemplateContent = {
                clientLogo: CompanyHeaderContent?.clientLogo,
                width: CompanyHeaderContent?.width,
                widthinpx: CompanyHeaderContent?.widthinpx,
                height: CompanyHeaderContent?.height,
                heightinpx: CompanyHeaderContent?.heightinpx,
                altText: CompanyHeaderContent?.altText,
              };
              headerTemplate = renderTemplate(
                headerTemplate,
                headerTemplateContent,
              );
            }

            const templateContext = {
              Link: origin,
              ReceiverName: toEmailParentUserName,
              PortfolioCompanyname: CompanyName,
              isEmailUnsubscribed: isEmailOriginLink,
              copyrightYear: copyrightYear,
              HeaderContent: headerTemplate,
            };

            body = renderTemplate(body, templateContext);
            const platformId =
              result.FormInvitation[0]?.Company?.platformId ?? "";
            if (finalUser?.isEmailSubscribed == true) {
              try {
                return await emailUtil.Send(
                  toEmail,
                  ccEmail,
                  Subject,
                  body,
                  platformId,
                  configdata,
                  EmailTemplatesResult[0]?.bccEmails || ""
                );
              } catch (error) { }
            } else {
              return "";
            }
          })
        );
      }
    }
  }
};
// Reviewer form submission email notification
export const sendReviewerFormResponseMail: sendFormResponseMailType = async (
  invitationId,
  emailType,
  companyId,
  formId,
  platformId
) => {
  const result = await sdk.GetEmailTemplateDataByinvitationId({
    invitationId: invitationId,
    questionId: "00000000-0000-0000-0000-000000000000",
    emailType: emailType,
    formId: formId,
    platformId: platformId,
  });
  if (result.FormInvitation.length > 0) {
    // Get reviewer details from the FormInvitation
    const reviewerDetails = (result.FormInvitation[0] as any)?.reviewerDetails;

    let toEmailParentUser = result.FormInvitation[0].ParentUser?.email;
    const createdByuserRole =
      result.FormInvitation[0].ParentUser?.UserRoles[0]?.roleName;
    const EmailTemplatesResult =
      result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
    const emailConfiguration =
      result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];
    let toEmailParentUserName = result.FormInvitation[0].ParentUser?.name ?? "";

    if (EmailTemplatesResult.length > 0 && emailConfiguration.length > 0) {
      let configdata = {
        fromEmail: emailConfiguration[0]?.fromEmail,
        port: emailConfiguration[0]?.port,
        host: emailConfiguration[0]?.host,
        user: emailConfiguration[0]?.user,
        password: emailConfiguration[0]?.password,
        isSecure: emailConfiguration[0]?.isSecure,
      };
      const ccEmail: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
      let remainingUserDetail: any = [];
      if (result?.FormInvitation[0]?.companyByParentcompanyid?.Users) {
        if (!!toEmailParentUser) {
          remainingUserDetail.push(result?.FormInvitation[0]?.ParentUser);
        } else {
          remainingUserDetail = [
            ...result?.FormInvitation[0]?.companyByParentcompanyid?.Users,
          ];
        }

        // const Old_result = cloneDeep(result);
        //Consultant
        result?.FormInvitation[0]?.companyByParentcompanyid?.AssessorConsultantMappings.forEach(
          (mapping) => {
            mapping?.companyByConsultantcompanyid?.Users.forEach((user) => {
              let findItem = remainingUserDetail.find(
                (x: any) => x === user.email
              );
              if (!findItem) {
                remainingUserDetail.push(user);
              }
            });
          }
        );
      }
      ///Group From For Consultant
      result?.FormInvitation[0]?.companyByParentcompanyid?.GroupForm.forEach(
        (mapping) => {
          mapping?.companyByConsultantcompanyid?.Users?.forEach((user) => {
            if (
              remainingUserDetail.filter(
                (item: any) => item.email == user.email
              ).length == 0
            ) {
              remainingUserDetail.push(user);
            }
          });
        }
      );
      let cc = await choosemethod(
        result.FormInvitation[0]?.companyByParentcompanyid
          ?.AssessorConsultantMappings[0]?.companyByConsultantcompanyid
          ?.Users[0]?.email,
        "decrypt"
      );
      const Subject = EmailTemplatesResult[0].subject ?? "";
      const originArray: String[] =
        result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
      let origin: any = originArray.filter((x) => !x.includes("localhost"));
      const isEmailOrigin: any = originArray.filter(
        (x) => !x.includes("localhost")
      );
      const CompanyName = result.FormInvitation[0]?.Company?.name ?? "";
      const FormName = result.FormInvitation[0]?.Form.title;
      const getPeriod = (date: any) => {
        if (dayjs(date).isValid()) {
          return dayjs(date).format("MMM YYYY");
        }
        return "";
      };
      let Period = `${getPeriod(result.FormInvitation[0]?.durationFrom) +
        " - " +
        getPeriod(result.FormInvitation[0]?.durationTo)
        }`;
      let getFormData: any = [];
      if (result.GlobalMaster?.length > 0) {
        result.GlobalMaster[0]?.data.map((item: any) => {
          if (item.FormId === formId) {
            getFormData.push(item);
          }
        });
      }
      if (origin.length > 0) {
        origin = `${origin[0]}`;
      }

      if (!!remainingUserDetail?.length) {
        await Promise.all(
          remainingUserDetail?.map(async (finalUser: any) => {
            let isEmailOriginLink = isEmailOrigin;
            if (isEmailOriginLink.length > 0) {
              if (finalUser?.UserRoles[0]?.roleName !== AppRoles.Consultant) {
                isEmailOriginLink = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${finalUser?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
              } else if (
                finalUser?.UserRoles[0]?.roleName === AppRoles.Consultant
              ) {
                isEmailOriginLink = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${finalUser?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
              } else {
                isEmailOriginLink = "";
              }
            }
            let body = EmailTemplatesResult[0]?.template ?? "";
            // Use reviewer's email (already decrypted in reviewerDetails)
            const reviewerEmailForDecrypt = await choosemethod(
              reviewerDetails.email,
              "decrypt"
            );
            // let email = await choosemethod(finalUser.email, "decrypt");
            const toEmail = reviewerEmailForDecrypt ?? "";

            const copyrightYear = new Date().getFullYear().toString();
            const CompanyHeaderContent =
              result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
                ?.CompanyHeaderContent;

            // Get header email templates
            const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
              type: [
                HeaderEmailTemplateTypes.HeaderWithClientDetails,
                HeaderEmailTemplateTypes.Header,
              ],
            });

            // Determine template type based on company header content
            const templateType = CompanyHeaderContent
              ? HeaderEmailTemplateTypes.HeaderWithClientDetails
              : HeaderEmailTemplateTypes.Header;

            // Filter templates by type
            const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
              (item) => item.type === templateType,
            );

            let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

            // Replace client logo placeholder if available
            if (headerTemplate && CompanyHeaderContent?.clientLogo) {
              const headerTemplateContent = {
                clientLogo: CompanyHeaderContent?.clientLogo,
                width: CompanyHeaderContent?.width,
                widthinpx: CompanyHeaderContent?.widthinpx,
                height: CompanyHeaderContent?.height,
                heightinpx: CompanyHeaderContent?.heightinpx,
                altText: CompanyHeaderContent?.altText,
              };
              headerTemplate = renderTemplate(
                headerTemplate,
                headerTemplateContent,
              );
            }

            const templateContext = {
              Link: origin,
              FormName: FormName,
              ReceiverName: toEmailParentUserName,
              PortfolioCompanyname: CompanyName,
              isEmailUnsubscribed: isEmailOriginLink,
              copyrightYear: copyrightYear,
              HeaderContent: headerTemplate,
            };

            body = renderTemplate(body, templateContext);
            const platformId =
              result.FormInvitation[0]?.Company?.platformId ?? "";
            if (finalUser?.isEmailSubscribed == true) {
              try {
                return await emailUtil.Send(
                  toEmail,
                  ccEmail,
                  Subject,
                  body,
                  platformId,
                  configdata,
                  EmailTemplatesResult[0]?.bccEmails || ""
                );
              } catch (error) { }
            } else {
              return "";
            }
          })
        );
      }
    }
  }
};
export const sendAssessmentReopenMail: sendAssessmentReopenMailType = async (
  invitationId,
  emailType,
  companyId,
  formId,
  platformId
) => {
  try {
  } catch (error) {
    throw error;
  }

  const result = await sdk.GetEmailTemplateDataByinvitationId({
    invitationId: invitationId,
    questionId: "00000000-0000-0000-0000-000000000000",
    emailType: emailType,
    formId: formId,
    platformId: platformId,
  });
  if (result.FormInvitation.length > 0) {
    const EmailTemplatesResultData =
      result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
    const emailConfiguration =
      result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];

    if (EmailTemplatesResultData.length > 0 && emailConfiguration.length > 0) {
      let configdata = {
        fromEmail: emailConfiguration[0]?.fromEmail,
        port: emailConfiguration[0]?.port,
        host: emailConfiguration[0]?.host,
        user: emailConfiguration[0]?.user,
        password: emailConfiguration[0]?.password,
        isSecure: emailConfiguration[0]?.isSecure,
      };
      let EmailTemplatesResult: any[] = [];
      let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
        (item) => item.companyId === companyId && item.formId === formId
      );
      if (checkEmailTemplatesExists.length > 0) {
        EmailTemplatesResult = checkEmailTemplatesExists;
      } else {
        checkEmailTemplatesExists = EmailTemplatesResultData.filter(
          (item) => item.companyId === null && item.formId === formId
        );
        if (checkEmailTemplatesExists.length > 0) {
          EmailTemplatesResult = checkEmailTemplatesExists;
        } else {
          checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === companyId && item.formId === null
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            EmailTemplatesResult = EmailTemplatesResultData.filter(
              (item) => item.companyId === null && item.formId === null
            );
          }
        }
      }
      const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
      let email = await choosemethod(
        result.FormInvitation[0]?.email,
        "decrypt"
      );
      const toEmail = email ?? "";
      const Subject = EmailTemplatesResult[0]?.subject ?? "";

      let body = EmailTemplatesResult[0]?.template ?? "";
      const ReceiverName =
        result.FormInvitation[0]?.Company?.primaryContact.name ?? "";
      const userName =
        // result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.name ?? "";
        result.FormInvitation[0]?.ParentUser?.name ?? "";

      const CommentSubmissionDate = Date.now();
      const AssessorOrgName =
        result.FormInvitation[0]?.companyByParentcompanyid?.name ?? "";
      const AssesseeOrgName = result.FormInvitation[0]?.Company?.name ?? "";
      const QuestionnaireNameTitle = result.FormInvitation[0]?.Form.title;
      const originArray: String[] =
        result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
      let origin: any = originArray.filter((x) => !x.includes("localhost"));
      let isEmailOrigin: any = originArray.filter(
        (x) => !x.includes("localhost")
      );
      let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
        (item) => item.email === result.FormInvitation[0]?.email
      );
      if (origin.length > 0) {
        origin = `${origin[0]}`;
      }
      if (isEmailOrigin.length > 0) {
        isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${result?.FormInvitation[0]?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
      }
      const copyrightYear = new Date().getFullYear().toString();
      const CompanyHeaderContent =
        result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
          ?.CompanyHeaderContent;

      // Get header email templates
      const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
        type: [
          HeaderEmailTemplateTypes.HeaderWithClientDetails,
          HeaderEmailTemplateTypes.Header,
        ],
      });

      // Determine template type based on company header content
      const templateType = CompanyHeaderContent
        ? HeaderEmailTemplateTypes.HeaderWithClientDetails
        : HeaderEmailTemplateTypes.Header;

      // Filter templates by type
      const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
        (item) => item.type === templateType,
      );

      let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

      // Replace client logo placeholder if available
      if (headerTemplate && CompanyHeaderContent?.clientLogo) {
        const headerTemplateContent = {
          clientLogo: CompanyHeaderContent?.clientLogo,
          width: CompanyHeaderContent?.width,
          widthinpx: CompanyHeaderContent?.widthinpx,
          height: CompanyHeaderContent?.height,
          heightinpx: CompanyHeaderContent?.heightinpx,
          altText: CompanyHeaderContent?.altText,
        };
        headerTemplate = renderTemplate(headerTemplate, headerTemplateContent);
      }

      const templateContext = {
        ReceiverName: ReceiverName,
        AssessorOrgName: AssessorOrgName,
        QuestionnaireNameTitle: QuestionnaireNameTitle,
        Login: origin,
        isEmailUnsubscribed: isEmailOrigin,
        copyrightYear: copyrightYear,
        HeaderContent: headerTemplate,
      };

      body = renderTemplate(body, templateContext);
      const platformId = result.FormInvitation[0]?.Company?.platformId ?? "";
      if (
        !!isEmailSubscribed &&
        isEmailSubscribed[0]?.isEmailSubscribed == true
      ) {
        return await emailUtil.Send(
          toEmail,
          cc,
          Subject,
          body,
          platformId,
          configdata,
          EmailTemplatesResult[0]?.bccEmails
        );
      } else {
        return "";
      }
    }
  }
};

export const sendCommentSubmissionMail: sendCommentSubmissionMailType = async (
  invitationId,
  emailType,
  companyId,
  formId,
  userRole,
  platformId
) => {
  try {
  } catch (error) {
    throw error;
  }

  const result = await sdk.GetEmailTemplateDataByinvitationId({
    invitationId: invitationId,
    questionId: "00000000-0000-0000-0000-000000000000",
    emailType: emailType,
    formId: formId,
    platformId: platformId,
  });

  if (result.FormInvitation.length > 0) {
    const EmailTemplatesResultData =
      result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
    const emailConfiguration =
      result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];
    if (EmailTemplatesResultData.length > 0 && emailConfiguration.length > 0) {
      let configdata = {
        fromEmail: emailConfiguration[0]?.fromEmail,
        port: emailConfiguration[0]?.port,
        host: emailConfiguration[0]?.host,
        user: emailConfiguration[0]?.user,
        password: emailConfiguration[0]?.password,
        isSecure: emailConfiguration[0]?.isSecure,
      };
      let EmailTemplatesResult: any[] = [];
      let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
        (item) => item.companyId === companyId && item.formId === formId
      );
      if (checkEmailTemplatesExists.length > 0) {
        EmailTemplatesResult = checkEmailTemplatesExists;
      } else {
        checkEmailTemplatesExists = EmailTemplatesResultData.filter(
          (item) => item.companyId === null && item.formId === formId
        );
        if (checkEmailTemplatesExists.length > 0) {
          EmailTemplatesResult = checkEmailTemplatesExists;
        } else {
          checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === companyId && item.formId === null
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            EmailTemplatesResult = EmailTemplatesResultData.filter(
              (item) => item.companyId === null && item.formId === null
            );
          }
        }
      }
      const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
      // let email = await choosemethod(result.FormInvitation[0]?.email, "decrypt");

      let AsseseeEmail = await choosemethod(
        //result.FormInvitation[0]?.Company?.primaryContact.email,
        result.FormInvitation[0]?.ParentUser?.email ?? "",
        "decrypt"
      );
      let AssessorEmail = await choosemethod(
        result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email,
        "decrypt"
      );
      let ConsultantEmail = await choosemethod(
        result.FormInvitation[0]?.companyByParentcompanyid
          ?.AssessorConsultantMappings[0]?.companyByConsultantcompanyid
          ?.Users[0]?.email,
        "decrypt"
      );

      let ReceiverName = null;
      let SenderName = null;
      let AsseseeName =
        result.FormInvitation[0]?.Company?.primaryContact.name ?? "";
      let AssessorName =
        result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.name ??
        "";
      let ConsultantName =
        result.FormInvitation[0]?.companyByParentcompanyid
          ?.AssessorConsultantMappings[0]?.companyByConsultantcompanyid
          ?.Users[0]?.name ?? "";
      let email = "";

      if (userRole === "Inviter") {
        email = ConsultantEmail;
        ReceiverName = ConsultantName;
        SenderName = AssessorName;
      } else if (userRole === "Consultant") {
        email = AsseseeEmail;
        ReceiverName = AsseseeName;
        SenderName = ConsultantName;
      } else if (userRole === "Invitee") {
        email = AssessorEmail;
        ReceiverName = AssessorName;
        SenderName = AsseseeName;
      }

      const toEmail = email ?? "";
      const Subject = EmailTemplatesResult[0]?.subject ?? "";

      let body = EmailTemplatesResult[0]?.template ?? "";
      const AssessorOrgName =
        result.FormInvitation[0]?.companyByParentcompanyid?.name ?? "";
      const AssesseeOrgName = result.FormInvitation[0]?.Company?.name ?? "";
      const QuestionnaireNameTitle = result.FormInvitation[0]?.Form.title;

      const Comments = result.FormInvitation[0]?.InvitationComments;
      const Commentscontent = Comments[Comments.length - 1].content;
      const CommentSubmissionDate = Comments[Comments.length - 1].created_at;
      const CommentSubmissionDate_String: string = dayjs(
        CommentSubmissionDate
      ).format("DD MMM, YYYY HH:mm:ss");
      const originArray: String[] =
        result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
      let origin: any = originArray.filter((x) => !x.includes("localhost"));
      let isEmailOrigin: any = originArray.filter(
        (x) => !x.includes("localhost")
      );
      let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
        (item) => item.email === result.FormInvitation[0]?.email
      );
      if (origin.length > 0) {
        origin = `${origin[0]}`;
      }
      if (isEmailOrigin.length > 0) {
        isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
      }
      const copyrightYear = new Date().getFullYear().toString();
      const CompanyHeaderContent =
        result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
          ?.CompanyHeaderContent;

      // Get header email templates
      const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
        type: [
          HeaderEmailTemplateTypes.HeaderWithClientDetails,
          HeaderEmailTemplateTypes.Header,
        ],
      });

      // Determine template type based on company header content
      const templateType = CompanyHeaderContent
        ? HeaderEmailTemplateTypes.HeaderWithClientDetails
        : HeaderEmailTemplateTypes.Header;

      // Filter templates by type
      const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
        (item) => item.type === templateType,
      );

      let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

      // Replace client logo placeholder if available
      if (headerTemplate && CompanyHeaderContent?.clientLogo) {
        const headerTemplateContent = {
          clientLogo: CompanyHeaderContent?.clientLogo,
          width: CompanyHeaderContent?.width,
          widthinpx: CompanyHeaderContent?.widthinpx,
          height: CompanyHeaderContent?.height,
          heightinpx: CompanyHeaderContent?.heightinpx,
          altText: CompanyHeaderContent?.altText,
        };
        headerTemplate = renderTemplate(headerTemplate, headerTemplateContent);
      }

      const templateContext = {
        ReceiverName: ReceiverName,
        UserName: SenderName,
        AssesseeOrgName: AssesseeOrgName,
        QuestionnaireNameTitle: QuestionnaireNameTitle,
        AssessorOrgName: AssessorOrgName,
        Commentscontent: Commentscontent,
        Login: origin,
        Datetimeofcommentssubmission: CommentSubmissionDate_String,
        isEmailUnsubscribed: isEmailOrigin,
        copyrightYear: copyrightYear,
        HeaderContent: headerTemplate,
      };

      body = renderTemplate(body, templateContext);
      const platformId = result.FormInvitation[0]?.Company?.platformId ?? "";
      return await emailUtil.Send(
        toEmail,
        cc,
        Subject,
        body,
        platformId,
        configdata,
        EmailTemplatesResult[0]?.bccEmails
      );
    }
  }
};
export const sendCommentSubmissionMailUser2: sendCommentSubmissionMailUser2Type =
  async (invitationId, emailType, companyId, formId, userRole, platformId) => {
    try {
    } catch (error) {
      throw error;
    }

    const result = await sdk.GetEmailTemplateDataByinvitationId({
      invitationId: invitationId,
      questionId: "00000000-0000-0000-0000-000000000000",
      emailType: emailType,
      formId: formId,
      platformId: platformId,
    });

    if (result.FormInvitation.length > 0) {
      const EmailTemplatesResultData =
        result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
      const emailConfiguration =
        result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];
      if (
        EmailTemplatesResultData.length > 0 &&
        emailConfiguration.length > 0
      ) {
        let configdata = {
          fromEmail: emailConfiguration[0]?.fromEmail,
          port: emailConfiguration[0]?.port,
          host: emailConfiguration[0]?.host,
          user: emailConfiguration[0]?.user,
          password: emailConfiguration[0]?.password,
          isSecure: emailConfiguration[0]?.isSecure,
        };
        let EmailTemplatesResult: any[] = [];
        let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
          (item) => item.companyId === companyId && item.formId === formId
        );
        if (checkEmailTemplatesExists.length > 0) {
          EmailTemplatesResult = checkEmailTemplatesExists;
        } else {
          checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === null && item.formId === formId
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            checkEmailTemplatesExists = EmailTemplatesResultData.filter(
              (item) => item.companyId === companyId && item.formId === null
            );
            if (checkEmailTemplatesExists.length > 0) {
              EmailTemplatesResult = checkEmailTemplatesExists;
            } else {
              EmailTemplatesResult = EmailTemplatesResultData.filter(
                (item) => item.companyId === null && item.formId === null
              );
            }
          }
        }
        const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
        // let email = await choosemethod(result.FormInvitation[0]?.email, "decrypt");

        let AsseseeEmail = await choosemethod(
          // result.FormInvitation[0]?.Company?.primaryContact.email,
          result.FormInvitation[0]?.ParentUser?.email ?? "",
          "decrypt"
        );
        let AssessorEmail = await choosemethod(
          result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.email,
          "decrypt"
        );
        let ConsultantEmail = await choosemethod(
          result.FormInvitation[0]?.companyByParentcompanyid
            ?.AssessorConsultantMappings[0]?.companyByConsultantcompanyid
            ?.Users[0]?.email,
          "decrypt"
        );

        let ReceiverName = null;
        let SenderName = null;
        let AsseseeName =
          result.FormInvitation[0]?.Company?.primaryContact.name ?? "";
        let AssessorName =
          result.FormInvitation[0]?.companyByParentcompanyid?.Users[0]?.name ??
          "";
        let ConsultantName =
          result.FormInvitation[0]?.companyByParentcompanyid
            ?.AssessorConsultantMappings[0]?.companyByConsultantcompanyid
            ?.Users[0]?.name ?? "";
        let email = "";

        if (userRole === "Inviter") {
          email = AsseseeEmail;
          ReceiverName = AsseseeName;
          SenderName = AssessorName;
        } else if (userRole === "Consultant") {
          email = AssessorEmail;
          ReceiverName = AssessorName;
          SenderName = ConsultantName;
        } else if (userRole === "Invitee") {
          email = ConsultantEmail;
          ReceiverName = ConsultantName;
          SenderName = AsseseeName;
        }

        const toEmail = email ?? "";
        const Subject = EmailTemplatesResult[0]?.subject ?? "";

        let body = EmailTemplatesResult[0]?.template ?? "";
        const AssessorOrgName =
          result.FormInvitation[0]?.companyByParentcompanyid?.name ?? "";
        const AssesseeOrgName = result.FormInvitation[0]?.Company?.name ?? "";
        const QuestionnaireNameTitle = result.FormInvitation[0]?.Form.title;

        const Comments = result.FormInvitation[0]?.InvitationComments;
        const Commentscontent = Comments[Comments.length - 1].content;
        const CommentSubmissionDate = Comments[Comments.length - 1].created_at;
        const CommentSubmissionDate_String: string = dayjs(
          CommentSubmissionDate
        ).format("DD MMM, YYYY HH:mm:ss");
        const originArray: String[] =
          result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
        let origin: any = originArray.filter((x) => !x.includes("localhost"));
        let isEmailOrigin: any = originArray.filter(
          (x) => !x.includes("localhost")
        );
        let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
          (item) => item.email === result.FormInvitation[0]?.email
        );
        if (origin.length > 0) {
          origin = `${origin[0]}`;
        }
        if (isEmailOrigin.length > 0) {
          isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
        }
        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
            ?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(
            headerTemplate,
            headerTemplateContent,
          );
        }

        const templateContext = {
          ReceiverName: ReceiverName,
          UserName: SenderName,
          AssesseeOrgName: AssesseeOrgName,
          QuestionnaireNameTitle: QuestionnaireNameTitle,
          AssessorOrgName: AssessorOrgName,
          Commentscontent: Commentscontent,
          Login: origin,
          Datetimeofcommentssubmission: CommentSubmissionDate_String,
          isEmailUnsubscribed: isEmailOrigin,
          copyrightYear: copyrightYear,
          HeaderContent: headerTemplate,
        };

        body = renderTemplate(body, templateContext);

        const platformId = result.FormInvitation[0]?.Company?.platformId ?? "";
        if (
          !!isEmailSubscribed &&
          isEmailSubscribed[0]?.isEmailSubscribed == true
        ) {
          return await emailUtil.Send(
            toEmail,
            cc,
            Subject,
            body,
            platformId,
            configdata,
            EmailTemplatesResult[0]?.bccEmails
          );
        } else {
          return "";
        }
      }
    }
  };
export const sendAssessmentApprovedMail: sendAssessmentApprovedMailType =
  async (invitationId, emailType, companyId, formId, platformId) => {
    try {
    } catch (error) {
      throw error;
    }

    const result = await sdk.GetEmailTemplateDataByinvitationId({
      invitationId: invitationId,
      questionId: "00000000-0000-0000-0000-000000000000",
      emailType: emailType,
      formId: formId,
      platformId: platformId,
    });
    if (result.FormInvitation.length > 0) {
      const EmailTemplatesResultData =
        result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
      const emailConfiguration =
        result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];
      if (
        EmailTemplatesResultData.length > 0 &&
        emailConfiguration.length > 0
      ) {
        let configdata = {
          fromEmail: emailConfiguration[0]?.fromEmail,
          port: emailConfiguration[0]?.port,
          host: emailConfiguration[0]?.host,
          user: emailConfiguration[0]?.user,
          password: emailConfiguration[0]?.password,
          isSecure: emailConfiguration[0]?.isSecure,
        };
        let EmailTemplatesResult: any[] = [];
        let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
          (item) => item.companyId === companyId && item.formId === formId
        );
        if (checkEmailTemplatesExists.length > 0) {
          EmailTemplatesResult = checkEmailTemplatesExists;
        } else {
          checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === null && item.formId === formId
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            checkEmailTemplatesExists = EmailTemplatesResultData.filter(
              (item) => item.companyId === companyId && item.formId === null
            );
            if (checkEmailTemplatesExists.length > 0) {
              EmailTemplatesResult = checkEmailTemplatesExists;
            } else {
              EmailTemplatesResult = EmailTemplatesResultData.filter(
                (item) => item.companyId === null && item.formId === null
              );
            }
          }
        }
        const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
        let email = await choosemethod(
          result.FormInvitation[0]?.email,
          "decrypt"
        );
        const toEmail = email ?? "";
        const Subject = EmailTemplatesResult[0]?.subject ?? "";

        let body = EmailTemplatesResult[0]?.template ?? "";
        const ReceiverName =
          result.FormInvitation[0]?.Company?.primaryContact.name;

        const AssessorOrgName =
          result.FormInvitation[0]?.companyByParentcompanyid?.name ?? "";
        const QuestionnaireNameTitle = result.FormInvitation[0]?.Form.title;

        const ApprovedDateAndTime = result.FormInvitation[0]?.updated_at;
        // const DateTime_String: string = dayjs(ApprovedDateAndTime).format(
        //   "DD MMM, YYYY HH:mm:ss"
        // );
        const DateTime_String: string =
          dayjs(ApprovedDateAndTime).format("DD MMM, YYYY");
        const originArray: String[] =
          result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
        let origin: any = originArray.filter((x) => !x.includes("localhost"));
        let isEmailOrigin: any = originArray.filter(
          (x) => !x.includes("localhost")
        );
        let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
          (item) => item.email === result.FormInvitation[0]?.email
        );
        if (origin.length > 0) {
          origin = `${origin[0]}`;
        }
        if (isEmailOrigin.length > 0) {
          isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${result.FormInvitation[0]?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
        }

        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
            ?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(
            headerTemplate,
            headerTemplateContent,
          );
        }

        const templateContext = {
          ReceiverName: ReceiverName,
          AssessorOrgName: AssessorOrgName,
          QuestionnaireNameTitle: QuestionnaireNameTitle,
          dateandtime: DateTime_String,
          Login: origin,
          isEmailUnsubscribed: isEmailOrigin,
          copyrightYear: copyrightYear,
          HeaderContent: headerTemplate,
        };

        body = renderTemplate(body, templateContext);

        const platformId = result.FormInvitation[0]?.Company?.platformId ?? "";
        if (
          !!isEmailSubscribed &&
          isEmailSubscribed[0]?.isEmailSubscribed == true
        ) {
          return await emailUtil.Send(
            toEmail,
            cc,
            Subject,
            body,
            platformId,
            configdata,
            EmailTemplatesResult[0]?.bccEmails
          );
        } else {
          return "";
        }
      }
    }
  };

export const khaitanInvitationEmail: khaitanInvitationEmailType = async (
  invitationId,
  emailType,
  companyId,
  formId,
  NewUser,
  platformId
) => {
  try {
  } catch (error) {
    throw error;
  }
  const result = await sdk.GetEmailTemplateDataByinvitationId({
    invitationId: invitationId,
    questionId: "00000000-0000-0000-0000-000000000000",
    emailType: emailType,
    formId: formId,
    platformId: platformId,
  });
  if (result.FormInvitation.length > 0) {
    const EmailTemplatesResultData =
      result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
    const emailConfiguration =
      result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];
    if (EmailTemplatesResultData.length > 0 && emailConfiguration.length > 0) {
      let configdata = {
        fromEmail: emailConfiguration[0]?.fromEmail,
        port: emailConfiguration[0]?.port,
        host: emailConfiguration[0]?.host,
        user: emailConfiguration[0]?.user,
        password: emailConfiguration[0]?.password,
        isSecure: emailConfiguration[0]?.isSecure,
      };
      let EmailTemplatesResult: any[] = [];
      let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
        (item) => item.companyId === companyId && item.formId === formId
      );
      if (checkEmailTemplatesExists.length > 0) {
        EmailTemplatesResult = checkEmailTemplatesExists;
      } else {
        checkEmailTemplatesExists = EmailTemplatesResultData.filter(
          (item) => item.companyId === null && item.formId === formId
        );
        if (checkEmailTemplatesExists.length > 0) {
          EmailTemplatesResult = checkEmailTemplatesExists;
        } else {
          checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === companyId && item.formId === null
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            EmailTemplatesResult = EmailTemplatesResultData.filter(
              (item) => item.companyId === null && item.formId === null
            );
          }
        }
      }
      //getExistingEmails
      const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
      let email = await choosemethod(
        result.FormInvitation[0]?.email,
        "decrypt"
      );
      const toEmail = email ?? "";
      //const toEmail = "Vinayak.Zade@powerweave.com";
      const getData = await sdk.CheckIsPasswordReset({
        email: result.FormInvitation[0]?.email,
      });

      const Subject = EmailTemplatesResult[0]?.subject ?? "";

      let body = EmailTemplatesResult[0]?.template ?? "";
      // code for Khaitan mail-- start
      const ParentUser = result.FormInvitation[0]?.ParentUser?.name ?? "";
      const UserName =
        result.FormInvitation[0]?.companyByParentcompanyid?.Users.filter(
          (user) => user.email == result.FormInvitation[0]?.email
        )[0]?.name ?? "";
      const originArray: String[] =
        result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
      const companyid = result.FormInvitation[0]?.companyId;
      let origin: any = originArray.filter((x) => !x.includes("localhost"));
      let isEmailOrigin: any = originArray.filter(
        (x) => !x.includes("localhost")
      );
      let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
        (item) => item.email === result.FormInvitation[0]?.email
      );

      const newResetPasswordToken = getData?.User?.[0]?.id
        ?.toString()
        ?.replace(/-/g, "");

      let url = `${newResetPasswordToken}&IsInternalRequest=true`;
      if (formId) {
        url += `&formId=${formId}`;
      }

      let setorlogintext = "";
      let btntext = "";
      if (!getData.User[0]?.IsPasswordReset) {
        origin = `${origin[0]}setnewpassword?email=${url}`;
        setorlogintext = "set your password";
        btntext = "set your password";
      } else {
        origin = `${origin[0]}`;
        setorlogintext = "login";
        btntext = "login to snowkap";
      }
      if (isEmailOrigin.length > 0) {
        isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${result.FormInvitation[0]?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
      }
      const FormName = result.FormInvitation[0]?.Form.title;
      const ParentCompanyName =
        result.FormInvitation[0]?.companyByParentcompanyid?.name ?? "";
      const ParentCompanyEmail = await choosemethod(
        // result.FormInvitation[0]?.Company?.primaryContact.email ?? "",
        result.FormInvitation[0]?.ParentUser?.email ?? "",
        "decrypt"
      );
      let subjecttext = "";
      if (
        emailType === "ExistingReportingFormInvitation" ||
        emailType === "ReportingFormInviation"
      ) {
        subjecttext = Subject + ": " + FormName;
      }
      const copyrightYear = new Date().getFullYear().toString();
      const CompanyHeaderContent =
        result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
          ?.CompanyHeaderContent;

      // Get header email templates
      const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
        type: [
          HeaderEmailTemplateTypes.HeaderWithClientDetails,
          HeaderEmailTemplateTypes.Header,
        ],
      });

      // Determine template type based on company header content
      const templateType = CompanyHeaderContent
        ? HeaderEmailTemplateTypes.HeaderWithClientDetails
        : HeaderEmailTemplateTypes.Header;

      // Filter templates by type
      const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
        (item) => item.type === templateType,
      );

      let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

      // Replace client logo placeholder if available
      if (headerTemplate && CompanyHeaderContent?.clientLogo) {
        const headerTemplateContent = {
          clientLogo: CompanyHeaderContent?.clientLogo,
          width: CompanyHeaderContent?.width,
          widthinpx: CompanyHeaderContent?.widthinpx,
          height: CompanyHeaderContent?.height,
          heightinpx: CompanyHeaderContent?.heightinpx,
          altText: CompanyHeaderContent?.altText,
        };
        headerTemplate = renderTemplate(headerTemplate, headerTemplateContent);
      }

      const templateContext = {
        UserName: UserName,
        ParentUserName: ParentUser,
        Link: origin,
        setorlogintext: setorlogintext,
        btntext: btntext,
        FormName: FormName,
        orgName: ParentCompanyName,
        ParentCompName: ParentCompanyName,
        ParentCompanyName: ParentCompanyName,
        ParentCompanyEmail: ParentCompanyEmail,
        ParentCompEmailID: ParentCompanyEmail,
        isEmailUnsubscribed: isEmailOrigin,
        copyrightYear: copyrightYear,
        HeaderContent: headerTemplate,
      };

      body = renderTemplate(body, templateContext);

      const platformId = result.FormInvitation[0]?.Company?.platformId ?? "";
      if (
        !!isEmailSubscribed &&
        isEmailSubscribed[0]?.isEmailSubscribed == true
      ) {
        let emailSendedData: any = [];
        const EmailInsertData: EmailNotifications_Insert_Input[] = [];
        const emaildata: EmailNotifications_Updates[] = [];
        EmailInsertData.push({
          invitationId: invitationId,
          emailId: toEmail,
          subject: subjecttext !== "" ? subjecttext : Subject || "",
          mailBody: body,
          ccEmails: EmailTemplatesResult[0]?.ccEmails,
          status: "",
          configData: configdata,
          bccEmailId: EmailTemplatesResult[0]?.bccEmails,
        });
        if (EmailInsertData.length > 0) {
          emailSendedData = await sdk.insert_EmailNotifications({
            emailData: EmailInsertData,
          });
          const emailSended: SentMessageInfo = await emailUtil.Send(
            toEmail,
            cc,
            subjecttext !== "" ? subjecttext : Subject || "",
            body,
            platformId,
            configdata,
            EmailTemplatesResult[0]?.bccEmails
          );
          const isRejected =
            Array.isArray(emailSended?.rejected) &&
            emailSended.rejected.length > 0;
          emaildata.push({
            where: { id: { _eq: emailSendedData?.id } },
            _set: {
              status: isRejected ? EmailStatus.fail : EmailStatus.success,
              error: isRejected ? emailSended?.response : null,
            },
          });
          const updateEmaildata = await sdk.updateStatusOfEmail({
            emailData: emaildata,
          });
          return emailSended;
        }
      } else {
        return "";
      }
    }
    // code for Khaitan mail-- end
  }
};

export const reviewerReportingFormInvitationEmail: reviewerReportingFormInvitationEmailType = async (
  invitationId,
  emailType,
  companyId,
  formId,
  NewUser,
  platformId
) => {
  try {
    const result = await sdk.GetEmailTemplateDataByinvitationId({
      invitationId: invitationId,
      questionId: "00000000-0000-0000-0000-000000000000",
      emailType: emailType,
      formId: formId,
      platformId: platformId,
    });

    if (result.FormInvitation.length > 0) {
      // Get reviewer details from the FormInvitation
      const reviewerDetails = (result.FormInvitation[0] as any)?.reviewerDetails;

      // If no reviewer exists, return early without sending email
      if (!reviewerDetails || !reviewerDetails.email) {
        console.log(`[Reviewer Email] No reviewer found for invitation ${invitationId}`);
        return "";
      }

      const EmailTemplatesResultData =
        result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
      const emailConfiguration =
        result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];

      if (EmailTemplatesResultData.length > 0 && emailConfiguration.length > 0) {
        let configdata = {
          fromEmail: emailConfiguration[0]?.fromEmail,
          port: emailConfiguration[0]?.port,
          host: emailConfiguration[0]?.host,
          user: emailConfiguration[0]?.user,
          password: emailConfiguration[0]?.password,
          isSecure: emailConfiguration[0]?.isSecure,
        };

        let EmailTemplatesResult: any[] = [];
        let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
          (item) => item.companyId === companyId && item.formId === formId
        );
        if (checkEmailTemplatesExists.length > 0) {
          EmailTemplatesResult = checkEmailTemplatesExists;
        } else {
          checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === null && item.formId === formId
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            checkEmailTemplatesExists = EmailTemplatesResultData.filter(
              (item) => item.companyId === companyId && item.formId === null
            );
            if (checkEmailTemplatesExists.length > 0) {
              EmailTemplatesResult = checkEmailTemplatesExists;
            } else {
              EmailTemplatesResult = EmailTemplatesResultData.filter(
                (item) => item.companyId === null && item.formId === null
              );
            }
          }
        }

        const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];

        // Use reviewer's email (already decrypted in reviewerDetails)
        const reviewerEmailForDecrypt = await choosemethod(
          reviewerDetails.email,
          "decrypt"
        );

        const toEmail = reviewerEmailForDecrypt ?? "";

        // Check if reviewer password is reset
        const getData = await sdk.CheckIsPasswordReset({
          email: reviewerDetails.email,
        });

        if (!getData?.User || getData.User.length === 0) {
          console.log(`[Reviewer Email] Reviewer user not found for ${toEmail}`);
          return "";
        }

        const Subject = EmailTemplatesResult[0]?.subject ?? "";
        let body = EmailTemplatesResult[0]?.template ?? "";

        // Get reviewer user name
        const UserName = result.FormInvitation[0]?.companyByParentcompanyid?.Users.filter(
          (user) => user.email == result.FormInvitation[0]?.email
        )[0]?.name ?? "";
        const ReviewerName = reviewerDetails?.name ?? "";
        const ParentUser = result.FormInvitation[0]?.ParentUser?.name ?? "";
        const originArray: String[] =
          result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
        let origin: any = originArray.filter((x) => !x.includes("localhost"));
        let isEmailOrigin: any = originArray.filter(
          (x) => !x.includes("localhost")
        );

        // Check if reviewer is email subscribed
        let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
          (item) => item.email === reviewerEmailForDecrypt
        );

        const newResetPasswordToken = getData?.User?.[0]?.id
          ?.toString()
          ?.replace(/-/g, "");

        let url = `${newResetPasswordToken}&IsInternalRequest=true`;
        if (formId) {
          url += `&formId=${formId}`;
        }

        let setorlogintext = "";
        let btntext = "";
        if (!getData.User[0]?.IsPasswordReset) {
          origin = `${origin[0]}setnewpassword?email=${url}`;
          setorlogintext = "set your password";
          btntext = "set your password";
        } else {
          origin = `${origin[0]}`;
          setorlogintext = "login";
          btntext = "login to snowkap";
        }

        if (isEmailOrigin.length > 0) {
          isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${reviewerEmailForDecrypt}'><span style='color:#DF5900'>unsubscribe</span></a>`;
        }

        const FormName = result.FormInvitation[0]?.Form.title;
        const ParentCompanyName =
          result.FormInvitation[0]?.companyByParentcompanyid?.name ?? "";
        const ParentCompanyEmail = await choosemethod(
          result.FormInvitation[0]?.Company?.primaryContact.email ?? "",
          "decrypt"
        );

        let subjecttext = "";
        if (emailType === "ExistingReviewerReportingFormInvitation" || emailType === "ReviewerReportingFormInvitation") {
          subjecttext = Subject + ": " + FormName;
        }

        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
            ?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(headerTemplate, headerTemplateContent);
        }

        const templateContext = {
          UserName: UserName,
          ReviewerName: ReviewerName,
          //ParentUserName: ParentUser,
          Link: origin,
          setorlogintext: setorlogintext,
          btntext: btntext,
          FormName: FormName,
          orgName: ParentCompanyName,
          // ParentCompName: ParentCompanyName,
          // ParentCompanyName: ParentCompanyName,
          // ParentCompanyEmail: ParentCompanyEmail,
          // ParentCompEmailID: ParentCompanyEmail,
          isEmailUnsubscribed: isEmailOrigin,
          copyrightYear: copyrightYear,
          HeaderContent: headerTemplate,
        };

        body = renderTemplate(body, templateContext);

        const platformIdFromInvitation = result.FormInvitation[0]?.Company?.platformId ?? "";

        // Send email only if reviewer is subscribed (or if no subscription info exists, send anyway)
        if (
          !isEmailSubscribed ||
          isEmailSubscribed.length === 0 ||
          isEmailSubscribed[0]?.isEmailSubscribed === true
        ) {
          let emailSendedData: any = [];
          const EmailInsertData: EmailNotifications_Insert_Input[] = [];
          const emaildata: EmailNotifications_Updates[] = [];

          EmailInsertData.push({
            invitationId: invitationId,
            emailId: toEmail,
            subject: subjecttext !== "" ? subjecttext : Subject || "",
            mailBody: body,
            ccEmails: EmailTemplatesResult[0]?.ccEmails,
            status: "",
            configData: configdata,
            bccEmailId: EmailTemplatesResult[0]?.bccEmails,
          });

          if (EmailInsertData.length > 0) {
            emailSendedData = await sdk.insert_EmailNotifications({
              emailData: EmailInsertData,
            });

            const emailSended: SentMessageInfo = await emailUtil.Send(
              toEmail,
              cc,
              subjecttext !== "" ? subjecttext : Subject || "",
              body,
              platformIdFromInvitation,
              configdata,
              EmailTemplatesResult[0]?.bccEmails
            );

            const isRejected =
              Array.isArray(emailSended?.rejected) &&
              emailSended.rejected.length > 0;

            emaildata.push({
              where: { id: { _eq: emailSendedData?.id } },
              _set: {
                status: isRejected ? EmailStatus.fail : EmailStatus.success,
                error: isRejected ? emailSended?.response : null,
              },
            });

            await sdk.updateStatusOfEmail({
              emailData: emaildata,
            });

            console.log(`[Reviewer Email] Successfully sent to ${toEmail} for invitation ${invitationId}`);
            return emailSended;
          }
        } else {
          console.log(`[Reviewer Email] Reviewer ${toEmail} is not subscribed to emails`);
          return "";
        }
      }
    }
    return "";
  } catch (error) {
    console.error(`[Reviewer Email] Error sending email for invitation ${invitationId}:`, error);
    // Return empty string to indicate graceful failure without throwing
    return "";
  }
};

export const reviewerFormDeclinedResponseEmail: reviewerFormFirstDeclinedResponseEmailType = async (
  invitationId,
  emailType,
  companyId,
  formId,
  platformId,
  questionId
) => {
  try {
    const result = await sdk.GetEmailTemplateDataByinvitationId({
      invitationId: invitationId,
      questionId: "00000000-0000-0000-0000-000000000000",
      emailType: emailType,
      formId: formId,
      platformId: platformId,
    });

    if (result.FormInvitation.length > 0) {
      // Get reviewer details from the FormInvitation
      const reviewerDetails = (result.FormInvitation[0] as any)?.reviewerDetails;

      // If no reviewer exists, return early without sending email
      if (!reviewerDetails || !reviewerDetails.email) {
        console.log(`[Reviewer Email] No reviewer found for invitation ${invitationId}`);
        return "";
      }

      const EmailTemplatesResultData =
        result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
      const emailConfiguration =
        result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];

      if (EmailTemplatesResultData.length > 0 && emailConfiguration.length > 0) {
        let configdata = {
          fromEmail: emailConfiguration[0]?.fromEmail,
          port: emailConfiguration[0]?.port,
          host: emailConfiguration[0]?.host,
          user: emailConfiguration[0]?.user,
          password: emailConfiguration[0]?.password,
          isSecure: emailConfiguration[0]?.isSecure,
        };

        let EmailTemplatesResult: any[] = [];
        let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
          (item) => item.companyId === companyId && item.formId === formId
        );
        if (checkEmailTemplatesExists.length > 0) {
          EmailTemplatesResult = checkEmailTemplatesExists;
        } else {
          checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === null && item.formId === formId
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            checkEmailTemplatesExists = EmailTemplatesResultData.filter(
              (item) => item.companyId === companyId && item.formId === null
            );
            if (checkEmailTemplatesExists.length > 0) {
              EmailTemplatesResult = checkEmailTemplatesExists;
            } else {
              EmailTemplatesResult = EmailTemplatesResultData.filter(
                (item) => item.companyId === null && item.formId === null
              );
            }
          }
        }
        const responderDetails = await sdk.getInvitationDetailsById({
          invitationId: invitationId,
          questionId: questionId
        });

        let responderemail = await choosemethod(
          responderDetails?.FormInvitation[0]?.AssesseeUserMappings[0]?.userByUserid?.UserRoles[0]
            .User.email,
          "decrypt"
        );

        const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];
        // Add responder email to CC if it exists
        if (responderemail) {
          cc.push(responderemail);
        }

        let email = await choosemethod(
          result.FormInvitation[0]?.email,
          "decrypt"
        );
        const toEmail = email ?? "";

        const Subject = EmailTemplatesResult[0]?.subject ?? "";
        let body = EmailTemplatesResult[0]?.template ?? "";

        // Get reviewer user name
        const UserName = result.FormInvitation[0]?.companyByParentcompanyid?.Users.filter(
          (user) => user.email == result.FormInvitation[0]?.email
        )[0]?.name ?? "";
        // const ReviewerName = reviewerDetails?.name ?? "";
        const originArray: String[] =
          result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
        let origin: any = originArray.filter((x) => !x.includes("localhost"));
        let isEmailOrigin: any = originArray.filter(
          (x) => !x.includes("localhost")
        );

        // Check if reviewer is email subscribed
        let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
          (item) => item.email === toEmail
        );

        let companyByParentcompanyid = result.FormInvitation[0]?.companyByParentcompanyid;
        let ParentCompanyName = companyByParentcompanyid?.name;

        let FormName = result.FormInvitation[0]?.Form.title;


        if (origin.length > 0) {
          origin = `${origin[0]}assessmentDetails/scoring_test/${invitationId}/review?questionid=${questionId}&assessmentname=${FormName}&companyname=${ParentCompanyName}`;
        }

        if (isEmailOrigin.length > 0) {
          isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${toEmail}'><span style='color:#DF5900'>unsubscribe</span></a>`;
        }

        let subjecttext = "";
        if (emailType === "ExistingReviewerReportingFormInvitation" || emailType === "ReviewerReportingFormInvitation") {
          subjecttext = Subject + ": " + FormName;
        }

        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
            ?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(headerTemplate, headerTemplateContent);
        }

        const templateContext = {
          UserName: UserName,
          //ReviewerName: ReviewerName,
          Link: origin,
          FormName: FormName,
          isEmailUnsubscribed: isEmailOrigin,
          copyrightYear: copyrightYear,
          HeaderContent: headerTemplate,
        };

        body = renderTemplate(body, templateContext);

        const platformIdFromInvitation = result.FormInvitation[0]?.Company?.platformId ?? "";

        // Send email only if reviewer is subscribed (or if no subscription info exists, send anyway)
        if (
          !isEmailSubscribed ||
          isEmailSubscribed.length === 0 ||
          isEmailSubscribed[0]?.isEmailSubscribed === true
        ) {
          let emailSendedData: any = [];
          const EmailInsertData: EmailNotifications_Insert_Input[] = [];
          const emaildata: EmailNotifications_Updates[] = [];

          EmailInsertData.push({
            invitationId: invitationId,
            emailId: toEmail,
            subject: subjecttext !== "" ? subjecttext : Subject || "",
            mailBody: body,
            ccEmails: EmailTemplatesResult[0]?.ccEmails,
            status: "",
            configData: configdata,
            bccEmailId: EmailTemplatesResult[0]?.bccEmails,
          });

          if (EmailInsertData.length > 0) {
            emailSendedData = await sdk.insert_EmailNotifications({
              emailData: EmailInsertData,
            });

            const emailSended: SentMessageInfo = await emailUtil.Send(
              toEmail,
              cc,
              subjecttext !== "" ? subjecttext : Subject || "",
              body,
              platformIdFromInvitation,
              configdata,
              EmailTemplatesResult[0]?.bccEmails
            );

            const isRejected =
              Array.isArray(emailSended?.rejected) &&
              emailSended.rejected.length > 0;

            emaildata.push({
              where: { id: { _eq: emailSendedData?.id } },
              _set: {
                status: isRejected ? EmailStatus.fail : EmailStatus.success,
                error: isRejected ? emailSended?.response : null,
              },
            });

            await sdk.updateStatusOfEmail({
              emailData: emaildata,
            });

            console.log(`[Reviewer Email] Successfully sent to ${toEmail} for invitation ${invitationId}`);
            return emailSended;
          }
        } else {
          console.log(`[Reviewer Email] Reviewer ${toEmail} is not subscribed to emails`);
          return "";
        }
      }
    }
    return "";
  } catch (error) {
    console.error(`[Reviewer Email] Error sending email for invitation ${invitationId}:`, error);
    // Return empty string to indicate graceful failure without throwing
    return "";
  }
};

export const reviewerResubmitResponseEmail: reviewerResubmitResponseEmailType = async (
  invitationId,
  emailType,
  companyId,
  formId,
  platformId,
  questionId,
  userRole
) => {
  try {
    const result = await sdk.GetEmailTemplateDataByinvitationId({
      invitationId: invitationId,
      questionId: "00000000-0000-0000-0000-000000000000",
      emailType: emailType,
      formId: formId,
      platformId: platformId,
    });

    if (result.FormInvitation.length > 0) {
      // Get reviewer details from the FormInvitation
      const reviewerDetails = (result.FormInvitation[0] as any)?.reviewerDetails;

      // If no reviewer exists, return early without sending email
      if (!reviewerDetails || !reviewerDetails.email) {
        console.log(`[Reviewer Email] No reviewer found for invitation ${invitationId}`);
        return "";
      }

      const EmailTemplatesResultData =
        result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
      const emailConfiguration =
        result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];

      if (EmailTemplatesResultData.length > 0 && emailConfiguration.length > 0) {
        let configdata = {
          fromEmail: emailConfiguration[0]?.fromEmail,
          port: emailConfiguration[0]?.port,
          host: emailConfiguration[0]?.host,
          user: emailConfiguration[0]?.user,
          password: emailConfiguration[0]?.password,
          isSecure: emailConfiguration[0]?.isSecure,
        };

        let EmailTemplatesResult: any[] = [];
        let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
          (item) => item.companyId === companyId && item.formId === formId
        );
        if (checkEmailTemplatesExists.length > 0) {
          EmailTemplatesResult = checkEmailTemplatesExists;
        } else {
          checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === null && item.formId === formId
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            checkEmailTemplatesExists = EmailTemplatesResultData.filter(
              (item) => item.companyId === companyId && item.formId === null
            );
            if (checkEmailTemplatesExists.length > 0) {
              EmailTemplatesResult = checkEmailTemplatesExists;
            } else {
              EmailTemplatesResult = EmailTemplatesResultData.filter(
                (item) => item.companyId === null && item.formId === null
              );
            }
          }
        }

        const responderDetails = await sdk.getInvitationDetailsById({
          invitationId: invitationId,
          questionId: questionId
        });

        let responderemail = await choosemethod(
          responderDetails?.FormInvitation[0]?.AssesseeUserMappings[0]?.userByUserid?.UserRoles[0]
            .User.email,
          "decrypt"
        );

        // Get maker's email (the person who created/sent the invitation)
        let makeremail = await choosemethod(
          result.FormInvitation[0]?.email,
          "decrypt"
        );

        const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];

        // Add emails to CC based on userRole:
        if (userRole === AppRoles.Invitee) {
          if (responderemail) {
            cc.push(responderemail);
          }
        } else if (userRole === AppRoles.Responder) {
          if (makeremail) {
            cc.push(makeremail);
          }
        }

        // Use reviewer's email (already decrypted in reviewerDetails)
        const reviewerEmailForDecrypt = await choosemethod(
          reviewerDetails.email,
          "decrypt"
        );

        const toEmail = reviewerEmailForDecrypt ?? "";

        const Subject = EmailTemplatesResult[0]?.subject ?? "";
        let body = EmailTemplatesResult[0]?.template ?? "";

        // Get reviewer user name
        const UserName = result.FormInvitation[0]?.companyByParentcompanyid?.Users.filter(
          (user) => user.email == result.FormInvitation[0]?.email
        )[0]?.name ?? "";
        // const ReviewerName = reviewerDetails?.name ?? "";
        const originArray: String[] =
          result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
        let origin: any = originArray.filter((x) => !x.includes("localhost"));
        let isEmailOrigin: any = originArray.filter(
          (x) => !x.includes("localhost")
        );

        // Check if reviewer is email subscribed
        let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
          (item) => item.email === reviewerEmailForDecrypt
        );

        let companyByParentcompanyid = result.FormInvitation[0]?.companyByParentcompanyid;
        let ParentCompanyName = companyByParentcompanyid?.name;

        const FormName = result.FormInvitation[0]?.Form.title;

        if (origin.length > 0) {
          origin = `${origin[0]}assessmentDetails/scoring_test/${invitationId}/review?questionid=${questionId}&assessmentname=${FormName}&companyname=${ParentCompanyName}`;
        }

        if (isEmailOrigin.length > 0) {
          isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${reviewerEmailForDecrypt}'><span style='color:#DF5900'>unsubscribe</span></a>`;
        }


        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
            ?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(headerTemplate, headerTemplateContent);
        }

        const templateContext = {
          UserName: UserName,
          //ReviewerName: ReviewerName,
          Link: origin,
          FormName: FormName,
          isEmailUnsubscribed: isEmailOrigin,
          copyrightYear: copyrightYear,
          HeaderContent: headerTemplate,
        };

        body = renderTemplate(body, templateContext);

        const platformIdFromInvitation = result.FormInvitation[0]?.Company?.platformId ?? "";

        // Send email only if reviewer is subscribed (or if no subscription info exists, send anyway)
        if (
          !isEmailSubscribed ||
          isEmailSubscribed.length === 0 ||
          isEmailSubscribed[0]?.isEmailSubscribed === true
        ) {
          let emailSendedData: any = [];
          const EmailInsertData: EmailNotifications_Insert_Input[] = [];
          const emaildata: EmailNotifications_Updates[] = [];

          EmailInsertData.push({
            invitationId: invitationId,
            emailId: toEmail,
            subject: Subject,
            mailBody: body,
            ccEmails: EmailTemplatesResult[0]?.ccEmails,
            status: "",
            configData: configdata,
            bccEmailId: EmailTemplatesResult[0]?.bccEmails,
          });

          if (EmailInsertData.length > 0) {
            emailSendedData = await sdk.insert_EmailNotifications({
              emailData: EmailInsertData,
            });

            const emailSended: SentMessageInfo = await emailUtil.Send(
              toEmail,
              cc,
              Subject,
              body,
              platformIdFromInvitation,
              configdata,
              EmailTemplatesResult[0]?.bccEmails
            );

            const isRejected =
              Array.isArray(emailSended?.rejected) &&
              emailSended.rejected.length > 0;

            emaildata.push({
              where: { id: { _eq: emailSendedData?.id } },
              _set: {
                status: isRejected ? EmailStatus.fail : EmailStatus.success,
                error: isRejected ? emailSended?.response : null,
              },
            });

            await sdk.updateStatusOfEmail({
              emailData: emaildata,
            });

            console.log(`[Reviewer Email] Successfully sent to ${toEmail} for invitation ${invitationId}`);
            return emailSended;
          }
        } else {
          console.log(`[Reviewer Email] Reviewer ${toEmail} is not subscribed to emails`);
          return "";
        }
      }
    }
    return "";
  } catch (error) {
    console.error(`[Reviewer Email] Error sending email for invitation ${invitationId}:`, error);
    // Return empty string to indicate graceful failure without throwing
    return "";
  }
};

export const reviewerApprovedEmail: reviewerApprovedEmailType = async (
  invitationId,
  emailType,
  companyId,
  formId,
  platformId,
) => {
  try {
    // debugger
    const result = await sdk.GetEmailTemplateDataByinvitationId({
      invitationId: invitationId,
      questionId: "00000000-0000-0000-0000-000000000000",
      emailType: emailType,
      formId: formId,
      platformId: platformId,
    });

    if (result.FormInvitation.length > 0) {
      // Get reviewer details from the FormInvitation
      const reviewerDetails = (result.FormInvitation[0] as any)?.reviewerDetails;

      // If no reviewer exists, return early without sending email
      if (!reviewerDetails || !reviewerDetails.email) {
        console.log(`[Reviewer Email] No reviewer found for invitation ${invitationId}`);
        return "";
      }

      const EmailTemplatesResultData =
        result.FormInvitation[0]?.Company?.Platform?.EmailTemplates ?? [];
      const emailConfiguration =
        result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];

      if (EmailTemplatesResultData.length > 0 && emailConfiguration.length > 0) {
        let configdata = {
          fromEmail: emailConfiguration[0]?.fromEmail,
          port: emailConfiguration[0]?.port,
          host: emailConfiguration[0]?.host,
          user: emailConfiguration[0]?.user,
          password: emailConfiguration[0]?.password,
          isSecure: emailConfiguration[0]?.isSecure,
        };

        let EmailTemplatesResult: any[] = [];
        let checkEmailTemplatesExists = EmailTemplatesResultData.filter(
          (item) => item.companyId === companyId && item.formId === formId
        );
        if (checkEmailTemplatesExists.length > 0) {
          EmailTemplatesResult = checkEmailTemplatesExists;
        } else {
          checkEmailTemplatesExists = EmailTemplatesResultData.filter(
            (item) => item.companyId === null && item.formId === formId
          );
          if (checkEmailTemplatesExists.length > 0) {
            EmailTemplatesResult = checkEmailTemplatesExists;
          } else {
            checkEmailTemplatesExists = EmailTemplatesResultData.filter(
              (item) => item.companyId === companyId && item.formId === null
            );
            if (checkEmailTemplatesExists.length > 0) {
              EmailTemplatesResult = checkEmailTemplatesExists;
            } else {
              EmailTemplatesResult = EmailTemplatesResultData.filter(
                (item) => item.companyId === null && item.formId === null
              );
            }
          }
        }
        const responderDetails = await sdk.getInvitationDetailsByInviationId({
          invitationId: invitationId
        });

        const cc: string[] = EmailTemplatesResult[0]?.ccEmails ?? [];

        // Add responder emails to CC (avoiding duplicates)
        for (const mapping of responderDetails?.FormInvitation[0]?.AssesseeUserMappings ?? []) {
          const email = await choosemethod(mapping.userByUserid?.UserRoles[0].User.email, "decrypt");
          if (email && !cc.includes(email)) {
            cc.push(email);
          }
        }

        let email = await choosemethod(
          result.FormInvitation[0]?.email,
          "decrypt"
        );
        const toEmail = email ?? "";

        const Subject = EmailTemplatesResult[0]?.subject ?? "";
        let body = EmailTemplatesResult[0]?.template ?? "";

        // Get reviewer user name
        const UserName = result.FormInvitation[0]?.companyByParentcompanyid?.Users.filter(
          (user) => user.email == result.FormInvitation[0]?.email
        )[0]?.name ?? "";
        // const ReviewerName = reviewerDetails?.name ?? "";
        const originArray: String[] =
          result.FormInvitation[0]?.Company?.Platform?.origin ?? [];
        let origin: any = originArray.filter((x) => !x.includes("localhost"));
        let isEmailOrigin: any = originArray.filter(
          (x) => !x.includes("localhost")
        );

        // Check if reviewer is email subscribed
        let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
          (item) => item.email === toEmail
        );

        if (origin.length > 0) {
          origin = `${origin[0]}`;
        }

        if (isEmailOrigin.length > 0) {
          isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${toEmail}'><span style='color:#DF5900'>unsubscribe</span></a>`;
        }

        const FormName = result.FormInvitation[0]?.Form.title;
        let subjecttext = "";
        if (emailType === "ExistingReviewerReportingFormInvitation" || emailType === "ReviewerReportingFormInvitation") {
          subjecttext = Subject + ": " + FormName;
        }

        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
            ?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(headerTemplate, headerTemplateContent);
        }

        const templateContext = {
          UserName: UserName,
          //ReviewerName: ReviewerName,
          Link: origin,
          FormName: FormName,
          isEmailUnsubscribed: isEmailOrigin,
          copyrightYear: copyrightYear,
          HeaderContent: headerTemplate,
        };

        body = renderTemplate(body, templateContext);

        const platformIdFromInvitation = result.FormInvitation[0]?.Company?.platformId ?? "";

        // Send email only if reviewer is subscribed (or if no subscription info exists, send anyway)
        if (
          !isEmailSubscribed ||
          isEmailSubscribed.length === 0 ||
          isEmailSubscribed[0]?.isEmailSubscribed === true
        ) {
          let emailSendedData: any = [];
          const EmailInsertData: EmailNotifications_Insert_Input[] = [];
          const emaildata: EmailNotifications_Updates[] = [];

          EmailInsertData.push({
            invitationId: invitationId,
            emailId: toEmail,
            subject: subjecttext !== "" ? subjecttext : Subject || "",
            mailBody: body,
            ccEmails: EmailTemplatesResult[0]?.ccEmails,
            status: "",
            configData: configdata,
            bccEmailId: EmailTemplatesResult[0]?.bccEmails,
          });

          if (EmailInsertData.length > 0) {
            emailSendedData = await sdk.insert_EmailNotifications({
              emailData: EmailInsertData,
            });

            const emailSended: SentMessageInfo = await emailUtil.Send(
              toEmail,
              cc,
              subjecttext !== "" ? subjecttext : Subject || "",
              body,
              platformIdFromInvitation,
              configdata,
              EmailTemplatesResult[0]?.bccEmails
            );

            const isRejected =
              Array.isArray(emailSended?.rejected) &&
              emailSended.rejected.length > 0;

            emaildata.push({
              where: { id: { _eq: emailSendedData?.id } },
              _set: {
                status: isRejected ? EmailStatus.fail : EmailStatus.success,
                error: isRejected ? emailSended?.response : null,
              },
            });

            await sdk.updateStatusOfEmail({
              emailData: emaildata,
            });

            console.log(`[Reviewer Email] Successfully sent to ${toEmail} for invitation ${invitationId}`);
            return emailSended;
          }
        } else {
          console.log(`[Reviewer Email] Reviewer ${toEmail} is not subscribed to emails`);
          return "";
        }
      }
    }
    return "";
  } catch (error) {
    console.error(`[Reviewer Email] Error sending email for invitation ${invitationId}:`, error);
    // Return empty string to indicate graceful failure without throwing
    return "";
  }
};

export const questionAssignEmailInvitation: questionAssignEmailInvitationType =
  async (invitationId, emailType, companyId, formId, userId, platformId) => {
    try {
      const result = await sdk.GetEmailTemplateDataByinvitationId({
        invitationId: invitationId,
        questionId: "00000000-0000-0000-0000-000000000000",
        emailType: emailType,
        formId: formId,
        platformId: platformId,
      });

      const userData = await sdk.getUserDetailById({ id: userId });
      const emailConfiguration =
        result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];
      if (
        !!result?.FormInvitation?.length &&
        !!userData?.User?.length &&
        emailConfiguration.length > 0
      ) {
        let configdata = {
          fromEmail: emailConfiguration[0]?.fromEmail,
          port: emailConfiguration[0]?.port,
          host: emailConfiguration[0]?.host,
          user: emailConfiguration[0]?.user,
          password: emailConfiguration[0]?.password,
          isSecure: emailConfiguration[0]?.isSecure,
        };
        const templateData =
          result?.FormInvitation[0]?.Company?.Platform?.EmailTemplates;

        const userDetail = userData.User[0];
        const formName = result?.FormInvitation[0]?.Form?.title;
        const parentCompanyName =
          result?.FormInvitation[0]?.Company?.name || "";
        const parentCompanyEmail = await choosemethod(
          // result.FormInvitation[0]?.Company?.primaryContact?.email ?? "",
          result.FormInvitation[0]?.ParentUser?.email ?? "",
          "decrypt"
        );
        const toEmail = await choosemethod(userDetail?.email, "decrypt");

        const originArray =
          result?.FormInvitation[0]?.Company?.Platform?.origin ?? [];
        let origin: any = originArray.filter(
          (x: any) => !x?.includes("localhost")
        );
        let isEmailOrigin: any = originArray.filter(
          (x: any) => !x.includes("localhost")
        );
        let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
          (item) => item.email === userDetail?.email
        );
        origin = `<a href='${origin[0]}'><span style='color:#DF5900'>login</span></a>`;
        if (isEmailOrigin.length > 0) {
          isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${userDetail?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
        }
        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
            ?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(
            headerTemplate,
            headerTemplateContent,
          );
        }
        if (!!templateData) {
          let body = templateData[0]?.template;

          const templateContext = {
            UserName: userDetail?.name,
            reset: origin,
            title: formName,
            orgName: parentCompanyName,
            ParentCompName: parentCompanyName,
            ParentCompanyEmail: parentCompanyEmail,
            isEmailUnsubscribed: isEmailOrigin,
            copyrightYear: copyrightYear,
            HeaderContent: headerTemplate,
          };

          body = renderTemplate(body, templateContext);

          const platformId =
            result.FormInvitation[0]?.Company?.platformId ?? "";
          if (
            !!isEmailSubscribed &&
            isEmailSubscribed[0]?.isEmailSubscribed == true
          ) {
            return await emailUtil.Send(
              toEmail,
              templateData[0]?.ccEmails,
              templateData[0]?.subject || "",
              body,
              platformId,
              configdata,
              templateData[0]?.bccEmails || ""
            );
          } else {
            return "";
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };

export const newUserCreatedEmailInvitation: newUserCreatedEmailInvitationType =
  async (
    invitationId,
    emailType,
    companyId,
    formId,
    userName,
    userEmail,
    userId,
    platformId
  ) => {
    try {
      const result = await sdk.GetEmailTemplateDataByinvitationId({
        invitationId: invitationId,
        questionId: "00000000-0000-0000-0000-000000000000",
        emailType: emailType,
        formId: formId,
        platformId: platformId,
      });

      if (!!result?.FormInvitation?.length) {
        const templateData =
          result?.FormInvitation[0]?.Company?.Platform?.EmailTemplates;
        const emailConfiguration =
          result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ?? [];
        const formName = result?.FormInvitation[0]?.Form?.title;
        const parentCompanyName =
          result?.FormInvitation[0]?.Company?.name || "";
        const parentCompanyEmail = await choosemethod(
          // result.FormInvitation[0]?.Company?.primaryContact?.email ?? "",
          result.FormInvitation[0]?.ParentUser?.email ?? "",
          "decrypt"
        );
        const toEmail = await choosemethod(userEmail, "decrypt");

        const originArray =
          result?.FormInvitation[0]?.Company?.Platform?.origin ?? [];
        let origin: any = originArray.filter(
          (x: any) => !x?.includes("localhost")
        );
        let isEmailOrigin: any = originArray.filter(
          (x: any) => !x.includes("localhost")
        );
        let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
          (item) => item.email === result.FormInvitation[0]?.email
        );
        const userData = await sdk.getUserDetailById({ id: userId });
        const userDetail = userData?.User[0];

        const isPasswordDetails = await sdk.CheckIsPasswordReset({
          email: userEmail, // result.FormInvitation[0]?.email,
        });

        const newResetPasswordToken = isPasswordDetails?.User?.[0]?.id
          ?.toString()
          ?.replace(/-/g, "");

        let url = `${newResetPasswordToken}&IsInternalRequest=true`;
        if (formId) {
          url += `&formId=${formId}`;
        }

        if (!isPasswordDetails?.User[0]?.IsPasswordReset) {
          origin = `${origin[0]}setnewpassword?email=${url}`;
        } else {
          origin = `${origin[0]}`;
        }
        if (isEmailOrigin.length > 0) {
          isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${userEmail}'><span style='color:#DF5900'>unsubscribe</span></a>`;
        }

        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
            ?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(
            headerTemplate,
            headerTemplateContent,
          );
        }
        if (!!templateData && !!emailConfiguration) {
          let body = templateData[0]?.template;

          const templateContext = {
            UserName: userName,
            AssignerName: userDetail?.name,
            set: origin,
            title: formName,
            orgName: parentCompanyName,
            //ParentCompName: parentCompanyName,
            //ParentCompanyEmail: parentCompanyEmail,
            isEmailUnsubscribed: isEmailOrigin,
            copyrightYear: copyrightYear,
            HeaderContent: headerTemplate,
          };

          body = renderTemplate(body, templateContext);

          const platformId =
            result.FormInvitation[0]?.Company?.platformId ?? "";
          let configdata = {
            fromEmail: emailConfiguration[0]?.fromEmail,
            port: emailConfiguration[0]?.port,
            host: emailConfiguration[0]?.host,
            user: emailConfiguration[0]?.user,
            password: emailConfiguration[0]?.password,
            isSecure: emailConfiguration[0]?.isSecure,
          };
          if (
            !!isEmailSubscribed &&
            isEmailSubscribed[0]?.isEmailSubscribed == true
          ) {
            let emailSendedData: any = [];
            const EmailInsertData: EmailNotifications_Insert_Input[] = [];
            const emaildata: EmailNotifications_Updates[] = [];
            EmailInsertData.push({
              invitationId: invitationId,
              emailId: toEmail,
              subject: templateData[0]?.subject || "",
              mailBody: body,
              ccEmails: templateData[0]?.ccEmails,
              status: "",
              configData: configdata,
              bccEmailId: templateData[0]?.bccEmails,
            });
            if (EmailInsertData.length > 0) {
              emailSendedData = await sdk.insert_EmailNotifications({
                emailData: EmailInsertData,
              });
              const emailSended: SentMessageInfo = await emailUtil.Send(
                toEmail,
                templateData[0]?.ccEmails,
                templateData[0]?.subject || "",
                body,
                platformId,
                configdata,
                templateData?.[0]?.bccEmails || ""
              );
              const isRejected =
                Array.isArray(emailSended?.rejected) &&
                emailSended.rejected.length > 0;
              emaildata.push({
                where: { id: { _eq: emailSendedData?.id } },
                _set: {
                  status: isRejected ? EmailStatus.fail : EmailStatus.success,
                  error: isRejected ? emailSended?.response : null,
                },
              });
              const updateEmaildata = await sdk.updateStatusOfEmail({
                emailData: emaildata,
              });
              return emailSended;
            } else {
              return "";
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };

export const assignedQuestionBulkEmailInvitation: assignedQuestionEmailInvitationType =
  async (startDateTime, endDateTime, platformId) => {
    let finaldataResult: response = { response: null, error: null };

    try {
      const todaysData = await sdk.getAssesseeUserMappingByDate({
        startDate: startDateTime,
        endDate: endDateTime,
      });

      if (!!todaysData.AssesseeUserMapping.length) {
        const uniqueUserIds = todaysData.AssesseeUserMapping.map(
          (rec) => rec.userId
        ).filter(
          (value, index, currentVal) => currentVal.indexOf(value) === index
        );

        const questionAssigner = todaysData.AssesseeUserMapping[0]?.User;

        let filteredUserData: any = [];

        uniqueUserIds?.map((userId) => {
          let userData = todaysData.AssesseeUserMapping.filter(
            (rec) => rec.userId === userId
          );
          filteredUserData.push({ key: userId, value: userData });
        });

        let emailSendedData: any = [];
        // Promise.all(filteredUserData).then(async (result) => {

        // });
        if (!!filteredUserData?.length) {
          const finalData = await filteredUserData.map(async (rec: any) => {
            // const userEmail = async () => {
            const result = await sdk
              .GetEmailTemplateDataByinvitationId({
                invitationId: rec.value[0]?.InvitationId,
                questionId: "00000000-0000-0000-0000-000000000000",
                emailType: "AssignedQuestionNotification",
                formId: rec.value[0]?.formId,
                platformId: platformId,
              })
              .then((data) => {
                return data;
              })
              .catch((err) => {
                console.log({ err });
              });

            const userResponse = await sdk.getUserDetailById({
              id: rec.value[0]?.userId,
            });

            if (
              !!result?.FormInvitation?.length &&
              !!userResponse?.User?.length
            ) {
              const templateData =
                result?.FormInvitation[0]?.Company?.Platform?.EmailTemplates;
              const emailConfiguration =
                result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs ??
                [];
              const userDetail = userResponse.User[0];
              const formName = result?.FormInvitation[0]?.Form?.title;
              const parentCompanyName =
                result?.FormInvitation[0]?.Company?.name || "";
              const toEmail = await choosemethod(userDetail?.email, "decrypt");
              const originArray =
                result?.FormInvitation[0]?.Company?.Platform?.origin ?? [];
              let origin: any = originArray.filter(
                (x: any) => !x?.includes("localhost")
              );
              let isEmailOrigin: any = originArray.filter(
                (x: any) => !x.includes("localhost")
              );
              let isEmailSubscribed =
                result.FormInvitation[0]?.Company?.Users.filter(
                  (item) => item.email === userDetail?.email
                );
              let isPasswordDetails = await sdk.CheckIsPasswordReset({
                // email: result.FormInvitation[0]?.email,
                email: userDetail?.email,
              });

              const newResetPasswordToken = isPasswordDetails?.User?.[0]?.id
                ?.toString()
                ?.replace(/-/g, "");

              let url = `${newResetPasswordToken}&IsInternalRequest=true`;
              if (rec.value[0]?.formId) {
                url += `&formId=${rec.value[0]?.formId}`;
              }

              let formFields: any = [];
              let questionnaireDetails: any = [...rec.value];

              questionnaireDetails.map((queData: any, i: any) => {
                queData.Question.FormFields?.sort((a: any, b: any) =>
                  a?.field > b?.field ? 1 : -1
                );

                formFields.push(queData);
              });

              const finalQuestions = formFields.map((field: any) => {
                return `<li style="margin:5px 0;"> ${!!field?.Question?.Section?.ParentSection
                  ? field?.Question?.Section?.ParentSection?.content +
                  ` - ` +
                  field?.Question?.Section?.content
                  : field?.Question?.Section?.content
                  } - ${field?.Question?.FormFields[0]?.interfaceOptions?.title
                  }: ${field?.Question?.FormFields[0]?.fieldOptions?.label ||
                  field?.Question?.content
                  }`;
              });

              const questionsDetail = `<ul style="font-size:14px; font-family:'Trebuchet MS', sans-serif; list-style-type: decimal;padding-left:24px;">
                ${finalQuestions.map((rec: any) => rec)}
              </ul> `;

              let btntext = "";
              let setorlogintext = "";
              if (!isPasswordDetails.User[0]?.IsPasswordReset) {
                origin = `${origin[0]}setnewpassword?email=${url}`;
                setorlogintext = "set your password";
                btntext = "set your password";
              } else {
                origin = `${origin[0]}`;
                setorlogintext = "login";
                btntext = "login to snowkap";
              }
              if (isEmailOrigin.length > 0) {
                isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${userDetail?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
              }
              const copyrightYear = new Date().getFullYear().toString();

              const CompanyHeaderContent =
                result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
                  ?.CompanyHeaderContent;

              // Get header email templates
              const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
                type: [
                  HeaderEmailTemplateTypes.HeaderWithClientDetails,
                  HeaderEmailTemplateTypes.Header,
                ],
              });

              // Determine template type based on company header content
              const templateType = CompanyHeaderContent
                ? HeaderEmailTemplateTypes.HeaderWithClientDetails
                : HeaderEmailTemplateTypes.Header;

              // Filter templates by type
              const headerTemplateData =
                headerEmailTemplate?.GlobalMaster.filter(
                  (item) => item.type === templateType,
                );

              let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

              // Replace client logo placeholder if available
              if (headerTemplate && CompanyHeaderContent?.clientLogo) {
                const headerTemplateContent = {
                  clientLogo: CompanyHeaderContent?.clientLogo,
                  width: CompanyHeaderContent?.width,
                  widthinpx: CompanyHeaderContent?.widthinpx,
                  height: CompanyHeaderContent?.height,
                  heightinpx: CompanyHeaderContent?.heightinpx,
                  altText: CompanyHeaderContent?.altText,
                };
                headerTemplate = renderTemplate(
                  headerTemplate,
                  headerTemplateContent,
                );
              }

              if (!!templateData && !!emailConfiguration) {
                let configdata = {
                  fromEmail: emailConfiguration[0]?.fromEmail,
                  port: emailConfiguration[0]?.port,
                  host: emailConfiguration[0]?.host,
                  user: emailConfiguration[0]?.user,
                  password: emailConfiguration[0]?.password,
                  isSecure: emailConfiguration[0]?.isSecure,
                };
                let body = templateData[0]?.template;
                // let title = templateData[0]?.subject || "";

                const templateContext = {
                  UserName: userDetail?.name,
                  formName: formName,
                  set: origin,
                  btntext: btntext,
                  setorlogintext: setorlogintext,
                  orgName: parentCompanyName,
                  questionsDetail: questionsDetail,
                  assignerName: questionAssigner?.name || "",
                  isEmailUnsubscribed: isEmailOrigin,
                  copyrightYear: copyrightYear,
                  HeaderContent: headerTemplate,
                };

                body = renderTemplate(body, templateContext);

                const platformId =
                  result.FormInvitation[0]?.Company?.platformId ?? "";
                if (
                  !!isEmailSubscribed &&
                  isEmailSubscribed[0]?.isEmailSubscribed == true
                ) {
                  const emailSended = await emailUtil.Send(
                    toEmail,
                    templateData[0]?.ccEmails,
                    templateData[0]?.subject || "",
                    body,
                    platformId,
                    configdata,
                    templateData[0]?.bccEmails || ""
                  );

                  emailSendedData.push(emailSended);
                } else {
                  return "";
                }
              }
            }
            // };
            // await userEmail();
          });
          await Promise.all(finalData);
          finaldataResult.response = emailSendedData;
          finaldataResult.error = null;

          return finaldataResult;
        }
      }
    } catch (error) {
      throw error;
    }
  };

export const commentsOnQuestionBulkEmail: commentsOnQuestionBulkEmailType =
  async (startDateTime, endDateTime, platformId) => {
    try {
      const todaysData = await sdk.getInvitationCommentsByDate({
        startDate: startDateTime,
        endDate: endDateTime,
      });
      if (!!todaysData.InvitationComment.length) {
        const whereCondition: Record<string, any>[] = [];
        const where1Condition: Record<string, any>[] = [];
        const where2Condition: Record<string, any>[] = [];
        todaysData?.InvitationComment?.forEach((item) => {
          whereCondition.push({
            _and: {
              InvitationId: { _eq: item.invitationId },
              questionId: { _eq: item?.FormField?.Question?.id },
            },
          });
          where1Condition.push({
            _and: {
              formId: { _eq: item.FormField?.Form?.id },
              assessorCompanyId: {
                _eq: !!item?.FormInvitation?.ParentCompanyMapping
                  ?.ParentCompanyId
                  ? item?.FormInvitation?.ParentCompanyMapping?.ParentCompanyId
                  : item?.FormInvitation?.parentcompanyId,
              },
            },
          });
          where2Condition.push({
            _and: {
              Form: {
                GroupForms: { formId: { _eq: item.FormField?.Form?.id } },
              },
              assessorCompanyId: {
                _eq: !!item?.FormInvitation?.ParentCompanyMapping
                  ?.ParentCompanyId
                  ? item?.FormInvitation?.ParentCompanyMapping?.ParentCompanyId
                  : item?.FormInvitation?.parentcompanyId,
              },
            },
          });
        });
        const asessemappingdatabydate = await sdk.getAssesseeUserMappings({
          where: { _or: whereCondition },
        });
        const consultantdatabydate = await sdk.getConsultantDataByFormId({
          where1: { _or: where1Condition },
          where2: { _or: where2Condition },
        });

        const to_email_user = todaysData.InvitationComment.map((rec) => {
          const responderData =
            !!asessemappingdatabydate?.AssesseeUserMapping?.filter(
              (items) =>
                items.InvitationId == rec.invitationId &&
                items.questionId == rec?.FormField?.Question?.id
            )
              ? asessemappingdatabydate?.AssesseeUserMapping?.filter(
                (items) =>
                  items.InvitationId == rec.invitationId &&
                  items.questionId == rec?.FormField?.Question?.id
              )[0]?.userByUserid
              : [];

          return {
            User: rec.User,
            questionId: rec?.FormField?.Question?.id,
            origin: rec.Company?.Platform?.origin,
            consultantData:
              !!consultantdatabydate?.AssessorConsultantMapping?.filter(
                (item) => item.formId == rec.FormField?.Form?.id
              ).length
                ? consultantdatabydate?.AssessorConsultantMapping?.filter(
                  (item) => item.formId == rec.FormField?.Form?.id
                )[0]?.companyByConsultantcompanyid?.Users
                : !!consultantdatabydate?.GroupForm?.filter(
                  (item) =>
                    item.formId ==
                    rec.FormField?.Form?.FormsIds.filter(
                      (items) => items.formId == rec.FormField?.Form?.id
                    )[0]?.groupFormId
                ).length
                  ? consultantdatabydate?.GroupForm?.filter(
                    (item) =>
                      item.formId ==
                      rec.FormField?.Form?.FormsIds.filter(
                        (items) => items.formId == rec.FormField?.Form?.id
                      )[0]?.groupFormId
                  )[0]?.companyByConsultantcompanyid?.Users
                  : [],
            companyName: !!rec?.FormInvitation?.ParentCompanyMapping
              ?.companyByParentcompanyid?.name
              ? rec?.FormInvitation?.ParentCompanyMapping
                ?.companyByParentcompanyid?.name
              : rec?.FormInvitation?.companyByParentcompanyid?.name,
            formName: rec?.FormField?.Form?.name,
            responderData:
              !!asessemappingdatabydate?.AssesseeUserMapping?.filter(
                (items) =>
                  items.InvitationId == rec.invitationId &&
                  items.questionId == rec?.FormField?.Question?.id
              )
                ? asessemappingdatabydate?.AssesseeUserMapping?.filter(
                  (items) =>
                    items.InvitationId == rec.invitationId &&
                    items.questionId == rec?.FormField?.Question?.id
                )[0]?.userByUserid
                : [],
            vcUserData: !!rec.FormInvitation?.ParentCompanyMapping?.ParentUserId
              ? [rec.FormInvitation?.ParentCompanyMapping?.VCuser]
              : rec.FormInvitation?.ParentCompanyMapping?.VCCompanyUser?.Users,
            //vcUserData: !!rec?.FormInvitation?.ParentCompanyMapping
            //   ?.companyByParentcompanyid?.Users
            //   ? rec?.FormInvitation?.ParentCompanyMapping
            //       ?.companyByParentcompanyid?.Users
            //   : rec?.FormInvitation?.companyByParentcompanyid?.Users,
            questionnaireDetail: rec.FormField,
            pcUserData: !!rec.FormInvitation?.ParentCompanyMapping?.UserId
              ? [rec.FormInvitation?.ParentCompanyMapping?.PCUser]
              : rec.FormInvitation?.ParentCompanyMapping?.PCCompanyUser?.Users,
            // pcUserData: rec.FormInvitation?.Company?.Users.filter(
            //   (items) => items.email == rec.FormInvitation?.email
            // ),
          };
        });
        const emailTemplates = await sdk.getEmailTemplateByType({
          emailType: "CommentsOnQuestionNotification",
          platformId: platformId,
        });

        const configdata = {
          fromEmail:
            emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
              ?.fromEmail,
          port: emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
            ?.port,
          host: emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
            ?.host,
          user: emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
            ?.user,
          password:
            emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
              ?.password,
          isSecure:
            emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
              ?.isSecure,
        };
        const uniqueUserId = to_email_user
          .map((item) => item.User?.id)
          .filter(
            (item, index, self) => index === self.findIndex((t) => t === item)
          );
        let emailSendedData: any = [];
        const EmailInsertData: EmailNotifications_Insert_Input[] = [];
        for (let i = 0; i < uniqueUserId.length; i++) {
          const userData = to_email_user.filter(
            (item) => item?.User?.id == uniqueUserId[i]
          );
          const uniquequestionId = userData
            .map((item) => item.questionId)
            .filter(
              (item, index, self) => index === self.findIndex((t) => t === item)
            );
          for (let j = 0; j < uniquequestionId.length; j++) {
            const questionData = userData?.filter(
              (item) => item.questionId == uniquequestionId[j]
            );
            if (!!questionData && questionData.length > 0) {
              let finalQuestions: any = [];
              let hierarchyLevel =
                questionData[0]?.questionnaireDetail?.Form?.FormFields[0]
                  ?.interfaceOptions?.hierarchyLevel;

              const field = questionData?.[0].questionnaireDetail;
              let subthemeConditional: string = "";
              if (!!field?.subtheme) {
                if (
                  String(field?.Section?.content).toLowerCase().trim() !=
                  String(field?.subtheme).toLowerCase().trim()
                ) {
                  subthemeConditional = " > " + field?.subtheme;
                }
              }
              let breadcrum: string = "";
              if (!!hierarchyLevel) {
                breadcrum = !!field?.Section?.ParentSection
                  ? field?.Section?.ParentSection?.content!
                  : field?.Section?.content!;
              } else {
                if (!!field?.interfaceOptions?.breadcrumb) {
                  breadcrum =
                    field?.interfaceOptions?.breadcrumb + subthemeConditional;
                } else {
                  breadcrum = !!field?.Section?.ParentSection
                    ? field?.Section?.ParentSection?.content! +
                    " > " +
                    field?.Section?.content! +
                    subthemeConditional!
                    : field?.Section?.content!;
                }
              }
              const questionDataRow = field?.Question?.FormFields?.sort(
                function (a: any, b: any) {
                  const aNums = a.field.match(/\d+/g).map(Number);
                  const bNums = b.field.match(/\d+/g).map(Number);
                  const maxLength = Math.max(aNums.length, bNums.length);
                  for (let i = 0; i < maxLength; i++) {
                    if (aNums[i] !== bNums[i]) {
                      return aNums[i] - bNums[i]; // sort by number value
                    }
                  }
                  return a.field.localeCompare(b.field); // if numbers are equal, sort alphabetically
                }
              )!;
              let Questionfield_id = "";
              if (questionDataRow.length > 0) {
                Questionfield_id = questionDataRow[0]?.interfaceOptions?.title;
                if (
                  Questionfield_id == null ||
                  Questionfield_id == undefined ||
                  Questionfield_id == ""
                ) {
                  const parentdata = field?.Question?.FormFields?.filter(
                    (c: any) => c.field == questionDataRow[0]?.groupField
                  )!;
                  Questionfield_id = parentdata[0]?.interfaceOptions?.title;
                }
              }
              let questionContent = !!field?.Question?.content
                ? field?.Question?.content
                : field?.fieldOptions?.label;

              if (!!Questionfield_id) {
                breadcrum =
                  breadcrum +
                  " - " +
                  Questionfield_id +
                  " : " +
                  questionContent;
              } else {
                breadcrum = breadcrum + " - " + questionContent;
              }

              if (!!breadcrum) {
                breadcrum = "<li style='margin:5px 0'>" + breadcrum + "</li>";
                finalQuestions.push({
                  listItem: breadcrum
                });
              }
              const questionsDetail = `<ul style="font-size:14px; font-family:'Trebuchet MS', sans-serif; list-style-type: decimal;padding-left:24px;">${finalQuestions
                .filter((items: any) => !!items.listItem)
                .map((rec: any) => rec.listItem)}</ul> `;
              const ccEmails: string[] =
                emailTemplates?.EmailTemplate[0]?.ccEmails;
              let allmails: Record<string, any>[] = [];
              console.log("questionData", questionData);
              questionData.forEach((questionItem) => {
                switch (
                String(questionItem?.User?.UserRoles[0]?.roleName)
                  .toLowerCase()
                  .trim()
                ) {
                  case String(AppRoles.Invitee).toLowerCase().trim():
                    (questionItem?.vcUserData as any[])?.forEach((item) => {
                      if (item?.isEmailSubscribed) {
                        allmails.push({
                          email: item.email,
                          userName: item.name,
                          companyName: questionItem?.companyName,
                        });
                      }
                    });
                    questionItem?.consultantData?.forEach((item: any) => {
                      if (item.isEmailSubscribed) {
                        allmails.push({
                          email: item.email,
                          userName: item.name,
                          companyName: questionItem?.companyName,
                        });
                      }
                    });
                    if (!!questionItem?.responderData) {
                      if (
                        (questionItem?.responderData as any)?.isEmailSubscribed
                      ) {
                        allmails.push({
                          email: (questionItem?.responderData as any)?.email,
                          userName: (questionItem?.responderData as any)?.name,
                          companyName: questionItem?.companyName,
                        });
                      }
                    }
                    break;
                  case String(AppRoles.Responder).toLowerCase().trim():
                    (questionItem?.vcUserData as any[])?.forEach((item) => {
                      if (item.isEmailSubscribed) {
                        allmails.push({
                          email: item.email,
                          userName: item.name,
                          companyName: questionItem?.companyName,
                        });
                      }
                    });

                    (questionItem?.pcUserData as any[])?.forEach(
                      (item: any) => {
                        if (item.isEmailSubscribed) {
                          allmails.push({
                            email: item.email,
                            userName: item.name,
                            companyName: questionItem?.companyName,
                          });
                        }
                      }
                    );
                    questionItem?.consultantData?.forEach((item: any) => {
                      if (item.isEmailSubscribed) {
                        allmails.push({
                          email: item.email,
                          userName: item.name,
                          companyName: questionItem?.companyName,
                        });
                      }
                    });
                    break;
                  case String(AppRoles.Consultant).toLowerCase().trim():
                    (questionItem?.pcUserData as any[])?.forEach((item) => {
                      if (item.isEmailSubscribed) {
                        allmails.push({
                          email: item.email,
                          userName: item.name,
                          companyName: questionItem?.companyName,
                        });
                      }
                    });
                    (questionItem?.vcUserData as any[])?.forEach(
                      (item: any) => {
                        if (item.isEmailSubscribed) {
                          allmails.push({
                            email: item.email,
                            userName: item.name,
                            companyName: questionItem?.companyName,
                          });
                        }
                      }
                    );

                    if (!!questionItem?.responderData) {
                      if (
                        (questionItem?.responderData as any)?.isEmailSubscribed
                      ) {
                        allmails.push({
                          email: (questionItem.responderData as any)?.email,
                          userName: (questionItem?.responderData as any)?.name,
                          companyName: questionItem?.companyName,
                        });
                      }
                    }
                    break;
                  case String(AppRoles.Inviter).toLowerCase().trim():
                    (questionItem?.pcUserData as any[])?.forEach(
                      (item: any) => {
                        if (item.isEmailSubscribed) {
                          allmails.push({
                            email: item.email,
                            userName: item.name,
                            companyName: questionItem?.companyName,
                          });
                        }
                      }
                    );
                    questionItem?.consultantData?.forEach((item: any) => {
                      if (item.isEmailSubscribed) {
                        allmails.push({
                          email: item.email,
                          userName: item.name,
                          companyName: questionItem?.companyName,
                        });
                      }
                    });
                    if (!!questionItem?.responderData) {
                      if (
                        (questionItem?.responderData as any)?.isEmailSubscribed
                      ) {
                        allmails.push({
                          email: (questionItem.responderData as any)?.email,
                          userName: (questionItem?.responderData as any)?.name,
                          companyName: questionItem?.companyName,
                        });
                      }
                    }
                    break;
                }
              });
              let origin: any = questionData[0]?.origin.filter(
                (x: any) => !x?.includes("localhost")
              );
              let loginlink = `${origin[0]}`;

              const copyrightYear = new Date().getFullYear().toString();
              const CompanyHeaderContent =
                todaysData?.InvitationComment[0]?.FormInvitation
                  ?.companyByParentcompanyid?.metadata?.CompanyHeaderContent;

              // Get header email templates
              const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
                type: [
                  HeaderEmailTemplateTypes.HeaderWithClientDetails,
                  HeaderEmailTemplateTypes.Header,
                ],
              });

              // Determine template type based on company header content
              const templateType = CompanyHeaderContent
                ? HeaderEmailTemplateTypes.HeaderWithClientDetails
                : HeaderEmailTemplateTypes.Header;

              // Filter templates by type
              const headerTemplateData =
                headerEmailTemplate?.GlobalMaster.filter(
                  (item) => item.type === templateType,
                );

              let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

              // Replace client logo placeholder if available
              if (headerTemplate && CompanyHeaderContent?.clientLogo) {
                const headerTemplateContent = {
                  clientLogo: CompanyHeaderContent?.clientLogo,
                  width: CompanyHeaderContent?.width,
                  widthinpx: CompanyHeaderContent?.widthinpx,
                  height: CompanyHeaderContent?.height,
                  heightinpx: CompanyHeaderContent?.heightinpx,
                  altText: CompanyHeaderContent?.altText,
                };
                headerTemplate = renderTemplate(
                  headerTemplate,
                  headerTemplateContent,
                );
              }
              if (!!emailTemplates?.EmailTemplate.length) {
                let TempEmailtemplate = emailTemplates;
                // console.log("allmails", allmails);
                for (let k = 0; k < allmails.length; k++) {
                  let body = TempEmailtemplate?.EmailTemplate[0]?.template;
                  // .replace("@formName", (questionData as any[])[0]?.formName)
                  // .replace("@loginLink", loginlink)
                  // .replace("@questionsDetail", questionsDetail);
                  // console.log("allmails", allmails[k]);
                  let toemail = await choosemethod(
                    allmails[k].email,
                    "decrypt"
                  );
                  let isEmailOriginLink = `<a href='${origin[0]}isemailsubscribed?id=${allmails[k].email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
                  // body = body
                  //   .replace("@UserName", allmails[k].userName)
                  //   .replace("@orgName", allmails[k].companyName)
                  //   .replace("@isEmailUnsubscribed", isEmailOriginLink)
                  //   .replace("@copyrightYear", copyrightYear)
                  //   .replace("@HeaderContent", headerTemplate);

                  const templateContext = {
                    formName: (questionData as any[])[0]?.formName,
                    loginLink: loginlink,
                    questionsDetail: questionsDetail,
                    UserName: allmails[k].userName,
                    orgName: allmails[k].companyName,
                    isEmailUnsubscribed: isEmailOriginLink,
                    copyrightYear: copyrightYear,
                    HeaderContent: headerTemplate,
                  };

                  body = renderTemplate(body, templateContext);
                  console.log("toemail", toemail);
                  EmailInsertData.push({
                    emailId: toemail,
                    subject: TempEmailtemplate?.EmailTemplate[0]?.subject || "",
                    mailBody: body,
                    ccEmails: {
                      ccEmails: ccEmails,
                    },
                    bccEmailId: String(
                      !!(TempEmailtemplate?.EmailTemplate[0] as any)?.bccEmails
                        ? (TempEmailtemplate?.EmailTemplate[0] as any)
                          ?.bccEmails
                        : ""
                    ),
                    configData: configdata,
                    ccEmailId: null,
                  });
                }
              }
            }
          }
        }
        if (EmailInsertData.length > 0) {
          emailSendedData = await sdk.insert_EmailNotifications({
            emailData: EmailInsertData,
          });
        }
        return { response: emailSendedData, error: null };
      }
    } catch (error) {
      throw error;
    }
  };

export const answerOnAssignedQuestionBulkEmail: answerOnAssignedQuestionBulkEmailType =
  async (startDateTime, endDateTime, platformId) => {
    try {
      const todaysData = await sdk.getAnswerByDate({
        startDate: startDateTime,
        endDate: endDateTime,
      });
      const whereCondition: Record<string, any>[] = todaysData?.Answer?.map(
        (item) => {
          return {
            _and: {
              InvitationId: { _eq: item.FormSubmission?.FormInvitation?.id },
              questionId: { _eq: item.questionId },
            },
          };
        }
      );
      const asessemappingdatabydate = await sdk.getAssesseeUserMappings({
        where: { _or: whereCondition },
      });
      if (!!asessemappingdatabydate?.AssesseeUserMapping.length) {
        //#region new code
        const to_email_user = asessemappingdatabydate?.AssesseeUserMapping.map(
          (rec) => ({
            User: rec.User,
            questionId: rec.questionId,
            InvitationId: rec.InvitationId,
            responderName: rec.userByUserid?.name,
            responderid: rec.userByUserid?.id,
            vcUserData: rec.ParentCompanyMapping,
            questionFormFields: rec.Question,
            questionnaireDetail: todaysData?.Answer?.filter(
              (item) =>
                item.FormSubmission?.FormInvitation?.id == rec.InvitationId &&
                item.questionId == rec.questionId
            ),
          })
        );
        const emailTemplates = await sdk.getEmailTemplateByType({
          emailType: "AnswerOnQuestionNotification",
          platformId: platformId,
        });

        const configdata = {
          fromEmail:
            emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
              ?.fromEmail,
          port: emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
            ?.port,
          host: emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
            ?.host,
          user: emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
            ?.user,
          password:
            emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
              ?.password,
          isSecure:
            emailTemplates?.EmailTemplate[0]?.Platform?.EmailConfigs[0]
              ?.isSecure,
        };
        const uniqueUserId = to_email_user
          .map((item) => item.User?.id)
          .filter(
            (item, index, self) => index === self.findIndex((t) => t === item)
          );

        let emailSendedData: any = [];
        const EmailInsertData: EmailNotifications_Insert_Input[] = [];
        for (let i = 0; i < uniqueUserId.length; i++) {
          const UserDetails = to_email_user.filter(
            (item) => item.User?.id == uniqueUserId[i]
          );
          const uniqueresponderid = UserDetails.map(
            (item) => item.responderid
          ).filter(
            (item, index, self) => index === self.findIndex((t) => t === item)
          );
          for (let j = 0; j < uniqueresponderid.length; j++) {
            const UserDetailswithresponder = UserDetails.filter(
              (item) => item.responderid == uniqueresponderid[j]
            );
            if (
              !!UserDetailswithresponder[0]?.User?.isEmailSubscribed &&
              UserDetailswithresponder[0]?.User?.isEmailSubscribed == true
            ) {
              let origin = "";
              const templateData = emailTemplates?.EmailTemplate;

              let hierarchyLevel =
                UserDetailswithresponder[0]?.questionnaireDetail[0].FormField
                  ?.Form?.FormFields[0]?.interfaceOptions?.hierarchyLevel;

              let isEmailOrigin =
                emailTemplates?.EmailTemplate[0]?.Platform?.origin.filter(
                  (x: string) => !x.includes("localhost")
                ) ?? [];

              const toEmail = await choosemethod(
                UserDetailswithresponder[0]?.User?.email,
                "decrypt"
              );
              let finalQuestions: any = [];

              UserDetailswithresponder.forEach((userdetailItem) => {
                if (userdetailItem?.questionnaireDetail.length > 0) {
                  userdetailItem?.questionnaireDetail.forEach((field: any) => {
                    let questiondetails = userdetailItem?.questionFormFields;
                    let subthemeConditional: string = "";
                    if (!!field?.FormField?.subtheme) {
                      if (
                        String(field?.FormField?.Section?.content)
                          .toLowerCase()
                          .trim() !=
                        String(field?.FormField?.subtheme).toLowerCase().trim()
                      ) {
                        subthemeConditional =
                          " > " + field?.FormField?.subtheme;
                      }
                    }
                    let breadcrum: string = "";
                    if (!!hierarchyLevel) {
                      breadcrum = !!field?.FormField?.Section?.ParentSection
                        ? field?.FormField?.Section?.ParentSection?.content
                        : field?.FormField?.Section?.content;
                    } else {
                      if (!!field?.FormField?.interfaceOptions?.breadcrumb) {
                        breadcrum =
                          field?.FormField?.interfaceOptions?.breadcrumb +
                          subthemeConditional;
                      } else {
                        breadcrum = !!field?.FormField?.Section?.ParentSection
                          ? field?.FormField?.Section?.ParentSection?.content +
                          " > " +
                          field?.FormField?.Section?.content +
                          subthemeConditional
                          : field?.FormField?.Section?.content;
                      }
                    }
                    const questionDataRow =
                      userdetailItem?.questionFormFields?.FormFields.sort(
                        function (a: any, b: any) {
                          const aNums = a.field.match(/\d+/g).map(Number);
                          const bNums = b.field.match(/\d+/g).map(Number);
                          const maxLength = Math.max(
                            aNums.length,
                            bNums.length
                          );
                          for (let i = 0; i < maxLength; i++) {
                            if (aNums[i] !== bNums[i]) {
                              return aNums[i] - bNums[i]; // sort by number value
                            }
                          }
                          return a.field.localeCompare(b.field); // if numbers are equal, sort alphabetically
                        }
                      ) as FormField[];
                    let Questionfield_id = "";
                    if (questionDataRow.length > 0) {
                      Questionfield_id =
                        questionDataRow[0]?.interfaceOptions?.title;
                      if (
                        Questionfield_id == null ||
                        Questionfield_id == undefined ||
                        Questionfield_id == ""
                      ) {
                        const parentdata =
                          userdetailItem?.questionFormFields?.FormFields.filter(
                            (c: any) =>
                              c.field == questionDataRow[0]?.groupField
                          ) as FormField[];
                        Questionfield_id =
                          parentdata[0]?.interfaceOptions?.title;
                      }
                    }
                    if (!!Questionfield_id) {
                      breadcrum =
                        breadcrum +
                        " - " +
                        Questionfield_id +
                        " : " +
                        userdetailItem?.questionFormFields?.content;
                    } else {
                      breadcrum =
                        breadcrum +
                        " - " +
                        userdetailItem?.questionFormFields?.content;
                    }

                    if (!!breadcrum) {
                      breadcrum = "<li style='margin:5px 0'>" + breadcrum + "</li>";
                      finalQuestions.push({
                        listItem: breadcrum
                      });
                    }
                  });
                }
              });
              finalQuestions = finalQuestions
                .map((item: any) => item.listItem)
                .filter(
                  (item: any, index: any, self: any) =>
                    index === self.findIndex((t: any) => t === item)
                );

              const questionsDetail = `<ul style="font-size:14px; font-family:'Trebuchet MS', sans-serif; list-style-type: decimal;padding-left:24px;">${finalQuestions
                .filter((items: any) => !!items)
                .map((rec: any) => rec)
                .join('')}</ul> `;

              if (isEmailOrigin.length > 0) {
                origin = `${isEmailOrigin[0]}`;
                isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${UserDetailswithresponder[0]?.User?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
              }
              const copyrightYear = new Date().getFullYear().toString();
              let CompanyHeaderContent: any = undefined;
              const formInvitation =
                asessemappingdatabydate?.AssesseeUserMapping.find(
                  (item) =>
                    item.userId == uniqueresponderid[j],
                )?.FormInvitation;
              if (formInvitation) {
                if (Array.isArray(formInvitation)) {
                  CompanyHeaderContent =
                    formInvitation[0]?.companyByParentcompanyid?.metadata
                      ?.CompanyHeaderContent;
                } else {
                  CompanyHeaderContent =
                    formInvitation?.companyByParentcompanyid?.metadata
                      ?.CompanyHeaderContent;
                }
              }

              // Get header email templates
              const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
                type: [
                  HeaderEmailTemplateTypes.HeaderWithClientDetails,
                  HeaderEmailTemplateTypes.Header,
                ],
              });

              // Determine template type based on company header content
              const templateType = CompanyHeaderContent
                ? HeaderEmailTemplateTypes.HeaderWithClientDetails
                : HeaderEmailTemplateTypes.Header;

              // Filter templates by type
              const headerTemplateData =
                headerEmailTemplate?.GlobalMaster.filter(
                  (item) => item.type === templateType,
                );

              let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

              // Replace client logo placeholder if available
              if (headerTemplate && CompanyHeaderContent?.clientLogo) {
                const headerTemplateContent = {
                  clientLogo: CompanyHeaderContent?.clientLogo,
                  width: CompanyHeaderContent?.width,
                  widthinpx: CompanyHeaderContent?.widthinpx,
                  height: CompanyHeaderContent?.height,
                  heightinpx: CompanyHeaderContent?.heightinpx,
                  altText: CompanyHeaderContent?.altText,
                };
                headerTemplate = renderTemplate(
                  headerTemplate,
                  headerTemplateContent,
                );
              }
              if (!!templateData) {
                let body = templateData[0].template;
                // body = body
                //   .replace(
                //     "@parentUserName",
                //     String(UserDetailswithresponder[0]?.User?.name)
                //   )
                //   .replace(
                //     "@userName",
                //     String(UserDetailswithresponder[0]?.responderName)
                //   )
                //   .replace("@loginLink", origin)
                //   .replace("@questionsDetail", questionsDetail)
                //   .replace("@isEmailUnsubscribed", isEmailOrigin)
                //   .replace("@copyrightYear", copyrightYear)
                //   .replace("@HeaderContent", headerTemplate);

                const templateContext = {
                  parentUserName: String(
                    UserDetailswithresponder[0]?.User?.name,
                  ),
                  userName: String(UserDetailswithresponder[0]?.responderName),
                  loginLink: origin,
                  questionsDetail: questionsDetail,
                  isEmailUnsubscribed: isEmailOrigin,
                  copyrightYear: copyrightYear,
                  HeaderContent: headerTemplate,
                };

                body = renderTemplate(body, templateContext);

                EmailInsertData.push({
                  emailId: toEmail,
                  subject: templateData[0]?.subject || "",
                  mailBody: body,
                  ccEmails: { ccEmails: templateData[0].ccEmails },
                  configData: configdata,
                  ccEmailId: null,
                });
              }
            }
          }
          ///
        }
        if (EmailInsertData.length > 0) {
          emailSendedData = await sdk.insert_EmailNotifications({
            emailData: EmailInsertData,
          });
        }
        return {
          response: emailSendedData,
          error: null,
        };
        //#endregion
      }
    } catch (error) {
      throw error;
    }
  };

export const questionResponseEmailInvitation: questionAssignEmailInvitationType =
  async (invitationId, emailType, companyId, formId, userId, platformId) => {
    try {
      const result = await sdk.GetEmailTemplateDataByinvitationId({
        invitationId: invitationId,
        questionId: "00000000-0000-0000-0000-000000000000",
        emailType: emailType,
        formId: formId,
        platformId: platformId,
      });

      const userData = await sdk.getUserDetailById({ id: userId });

      if (!!result?.FormInvitation?.length && !!userData?.User?.length) {
        const templateData =
          result?.FormInvitation[0]?.Company?.Platform?.EmailTemplates;
        const emailConfiguration =
          result?.FormInvitation[0]?.Company?.Platform?.EmailConfigs[0];

        const userDetail = userData.User[0];
        const formName = result?.FormInvitation[0]?.Form?.title;
        const parentCompanyName =
          result?.FormInvitation[0]?.Company?.name || "";
        const parentCompanyEmail = await choosemethod(
          //result.FormInvitation[0]?.Company?.primaryContact?.email ?? "",
          result.FormInvitation[0]?.ParentUser?.email ?? "",
          "decrypt"
        );
        const toEmail = await choosemethod(userDetail?.email, "decrypt");

        const originArray =
          result?.FormInvitation[0]?.Company?.Platform?.origin ?? [];
        let origin: any = originArray.filter(
          (x: any) => !x?.includes("localhost")
        );
        let isEmailOrigin: any = originArray.filter(
          (x: any) => !x.includes("localhost")
        );
        let isEmailSubscribed = result.FormInvitation[0]?.Company?.Users.filter(
          (item) => item.email === userDetail?.email
        );
        origin = `<a href='${origin[0]}'><span style='color:#DF5900'>login</span></a>`;

        if (isEmailOrigin.length > 0) {
          isEmailOrigin = `<a href='${isEmailOrigin[0]}isemailsubscribed?id=${userDetail?.email}'><span style='color:#DF5900'>unsubscribe</span></a>`;
        }
        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          result?.FormInvitation[0]?.companyByParentcompanyid?.metadata
            ?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(
            headerTemplate,
            headerTemplateContent,
          );
        }
        if (!!templateData && !!emailConfiguration) {
          let body = templateData[0]?.template;

          const templateContext = {
            UserName: userDetail?.name,
            reset: origin,
            title: formName,
            orgName: parentCompanyName,
            ParentCompName: parentCompanyName,
            ParentCompanyEmail: parentCompanyEmail,
            isEmailUnsubscribed: isEmailOrigin,
            copyrightYear: copyrightYear,
            HeaderContent: headerTemplate,
          };

          body = renderTemplate(body, templateContext);

          const platformId =
            result.FormInvitation[0]?.Company?.platformId ?? "";
          const configdata = {
            fromEmail: emailConfiguration?.fromEmail,
            port: emailConfiguration?.port,
            host: emailConfiguration?.host,
            user: emailConfiguration?.user,
            password: emailConfiguration?.password,
            isSecure: emailConfiguration?.isSecure,
          };

          if (
            !!isEmailSubscribed &&
            isEmailSubscribed[0]?.isEmailSubscribed == true
          ) {
            return await emailUtil.Send(
              toEmail,
              templateData[0]?.ccEmails,
              templateData[0]?.subject || "",
              body,
              platformId,
              configdata,
              templateData[0]?.bccEmails || ""
            );
          } else {
            return "";
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };
export const sendingEmailFromDb: sendingEmailFromDbType = async (
  startDateTime,
  endDateTime,
  platformId
) => {
  const emaildata: EmailNotifications_Updates[] = [];
  try {
    const todaysData = await sdk.getTodayEmailData({
      startDate: startDateTime,
      endDate: endDateTime,
      status: EmailStatus.pending,
      limit: 15,
    });
    for (let i = 0; i < todaysData?.EmailNotifications?.length; i++) {
      try {
        const emailSended: SentMessageInfo = await emailUtil.Send(
          todaysData?.EmailNotifications[i].emailId,
          todaysData?.EmailNotifications[i].ccEmails?.ccEmails,
          todaysData?.EmailNotifications[i].subject,
          String(todaysData?.EmailNotifications[i].mailBody),
          "",
          todaysData?.EmailNotifications[i].configData,
          !!(todaysData?.EmailNotifications[i] as any)?.bccEmailId
            ? (todaysData?.EmailNotifications[i] as any)?.bccEmailId
            : ""
        );
        console.log("emailSended", emailSended);

        emaildata.push({
          where: { id: { _eq: todaysData?.EmailNotifications[i].id } },
          _set: {
            status:
              emailSended?.rejected.length > 0
                ? EmailStatus.fail
                : EmailStatus.success,
            error:
              emailSended?.rejected.length > 0 ? emailSended?.response : null,
          },
        });
      } catch (error: any) {
        const currentDate = new Date();
        const errorContent = JSON.stringify({
          datetime: currentDate.toISOString(),
          message: error.message,
          stack: error.stack,
        });
        await uploadError("exception-logs", "exception-logs", errorContent);
      }
    }

    const updateEmaildata = await sdk.updateStatusOfEmail({
      emailData: emaildata,
    });
    return updateEmaildata;
  } catch (error) {
    if (!!emaildata) {
      let updateEmaildata = await sdk.updateStatusOfEmail({
        emailData: emaildata,
      });
      return updateEmaildata;
    }
    throw error;
  }
};

export const sendCompanyAIInvitationEmail = async (
  CompanyInvitationEmail: AIEmailInvitation[]
) => {
  try {
    const invitationTemplateData = await sdk.getEmailtemplateForOnboarding({
      invitationId: CompanyInvitationEmail.map((items) => items.invitationId),
      emailType: CompanyInvitationEmail[0].emailType,
    });
    const emailResult: any[] = [];
    if (invitationTemplateData?.FormInvitation?.length > 0) {
      const whereCondition: Record<string, any>[] =
        invitationTemplateData.FormInvitation.map((items) => {
          return {
            _and: {
              companyId: { _eq: items.companyId },
              formId: { _neq: items.Form?.id },
            },
          };
        });
      let forminvitationUSerData: GetformInvitationdatabycustomwhereQuery = {
        FormInvitation: [],
      };
      if (!!whereCondition && whereCondition.length > 0) {
        forminvitationUSerData = await sdk.getformInvitationdatabycustomwhere({
          where: { _or: whereCondition },
        });
      }
      let configdata =
        !!invitationTemplateData?.FormInvitation[0]?.Company?.Platform &&
          invitationTemplateData?.FormInvitation[0]?.Company?.Platform
            ?.EmailConfigs.length > 0
          ? {
            fromEmail:
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].fromEmail,
            port: invitationTemplateData?.FormInvitation[0]?.Company?.Platform
              ?.EmailConfigs[0].port,
            host: invitationTemplateData?.FormInvitation[0]?.Company?.Platform
              ?.EmailConfigs[0].host,
            user: invitationTemplateData?.FormInvitation[0]?.Company?.Platform
              ?.EmailConfigs[0].user,
            password:
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].password,
            isSecure:
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].isSecure,
          }
          : {
            fromEmail: "",
            port: 1111,
            host: "",
            user: "",
            password: "",
            isSecure: false,
          };
      const AIDataParameter = invitationTemplateData.FormInvitation.map(
        (items) => {
          return {
            id: items.id,
            formId: items?.Form?.id,
            isInvitedByConsultant: !!items?.ParentUser?.UserRoles
              ? items?.ParentUser?.UserRoles?.filter(
                (dataItems) => dataItems?.roleName === AppRoles.Consultant,
              )?.length > 0
              : false,
            created_by: items?.created_by,
            companyId: items?.companyId,
            userRole: String(items?.ParentUser?.UserRoles[0]?.roleName),
          };
        }
      );
      const AIData = await AIFeatureForInvitationIdByDB(AIDataParameter);
      for (let i = 0; i < invitationTemplateData.FormInvitation.length; i++) {
        let isInternalUSer = false;
        if (
          !!CompanyInvitationEmail.filter(
            (dataItem) =>
              dataItem.invitationId ==
              invitationTemplateData.FormInvitation[i].id
          ) &&
          CompanyInvitationEmail.filter(
            (dataItem) =>
              dataItem.invitationId ==
              invitationTemplateData.FormInvitation[i].id
          ).length > 0
        ) {
          isInternalUSer = CompanyInvitationEmail.filter(
            (dataItem) =>
              dataItem.invitationId ==
              invitationTemplateData.FormInvitation[i].id
          )[0].isInternalUSer;
        }
        let toEmail = await choosemethod(
          invitationTemplateData.FormInvitation[i].email,
          "decrypt"
        );
        const AIcardData: AIDataCardsType = await getAIProcesingStats(
          invitationTemplateData.FormInvitation[i].Form?.id,
          invitationTemplateData.FormInvitation[i].id
        );
        const dataPointPercent =
          !!AIcardData.dataCapturedUsingAI && !!AIcardData.totalInputsRequired
            ? AIcardData.dataCapturedUsingAI == 0 ||
              AIcardData.totalInputsRequired == 0
              ? 0
              : Math.ceil(
                (Number(AIcardData.dataCapturedUsingAI) * 100) /
                Number(AIcardData.totalInputsRequired)
              )
            : 0;
        let datapointsectionContent = "";
        let uploadsectionContent = "";

        //#region for setting datapoint and upload section content
        if (!!AIData && AIData.length > 0) {
          if (
            AIData.filter(
              (dataItem) =>
                dataItem.invitationId ==
                invitationTemplateData?.FormInvitation[i].id
            )[0].AIDetail.docWithAI
          ) {
            if (dataPointPercent == 0) {
              uploadsectionContent =
                "To complete the assessment, please have the following documents ready for upload:";
            } else {
              datapointsectionContent =
                "Good news is that about " +
                dataPointPercent +
                "% of the data points needed to respond are already gathered as a suggestions by using our Al bot through your company’s publicly available data.";
              uploadsectionContent =
                dataPointPercent == 100
                  ? "Uploading the below listed documents will further enhance assessment accuracy. Hence we request you to keep these documents handy."
                  : "Uploading the below listed documents will improve the completion Up to 100%. Hence we request you to keep these documents handy.";
            }
          } else if (
            AIData.filter(
              (dataItem) =>
                dataItem.invitationId ==
                invitationTemplateData?.FormInvitation[i].id
            )[0]?.AIDetail?.onlyDoc
          ) {
            uploadsectionContent =
              "To complete the assessment, please have the following documents ready for upload :";
          }
        }
        //#endregion
        let clickLink = invitationTemplateData.FormInvitation[
          i
        ].Company?.Platform?.origin.filter(
          (x: string) => !x.includes("localhost")
        )[0];
        if (isInternalUSer) {
          const getData = await sdk.CheckIsPasswordReset({
            email: invitationTemplateData.FormInvitation[i].email,
          });

          const newResetPasswordToken = getData?.User?.[0]?.id
            ?.toString()
            ?.replace(/-/g, "");

          let url = `${newResetPasswordToken}&IsInternalRequest=true`;
          if (invitationTemplateData.FormInvitation[i].Form?.id) {
            url += `&formId=${invitationTemplateData.FormInvitation[i].Form?.id}`;
          }

          if (!getData?.User[0]?.IsPasswordReset) {
            clickLink = clickLink + "setnewpassword?email=" + url;
          }
        }
        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          invitationTemplateData?.FormInvitation[0]?.companyByParentcompanyid
            ?.metadata?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(
            headerTemplate,
            headerTemplateContent,
          );
        }
        if (
          forminvitationUSerData?.FormInvitation?.filter(
            (items) =>
              items.companyId ==
              invitationTemplateData.FormInvitation[i].companyId
          ).length > 0
        ) {
          const newEmailInvitationEMail =
            invitationTemplateData.FormInvitation[0]?.Company?.Platform?.EmailTemplates.filter(
              (items) => items.type == "AINewFormInvitation"
            );
          let newEmailInvitationEmailBody = !!newEmailInvitationEMail
            ? newEmailInvitationEMail[0]?.template
            : "";

          const subject = !!newEmailInvitationEMail
            ? renderTemplate(newEmailInvitationEMail[0]?.subject ?? "", {
              formName:
                invitationTemplateData?.FormInvitation?.[i]?.Form?.title ??
                "",
            })
            : "";
          if (!!newEmailInvitationEmailBody) {
            newEmailInvitationEmailBody = newEmailInvitationEmailBody;
            const templateContext = {
              userName: String(
                invitationTemplateData.FormInvitation[i].Company?.name,
              ),
              subject: String(subject),
              vcCompany: String(
                invitationTemplateData.FormInvitation[i].ParentUser?.Company
                  ?.name,
              ),
              formName: String(
                invitationTemplateData.FormInvitation[i].Form?.title,
              ),
              supportLinkEmail: String(
                invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                  ?.EmailConfigs[0].fromEmail,
              ),
              supportEmail: String(
                invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                  ?.EmailConfigs[0].fromEmail,
              ),
              datapointsection: datapointsectionContent,
              uploadsection: uploadsectionContent,
              clicklink: String(clickLink),
              copyrightYear: String(copyrightYear),
              HeaderContent: headerTemplate,
            };

            newEmailInvitationEmailBody = renderTemplate(
              newEmailInvitationEmailBody,
              templateContext,
            );
          }
          const newInvitationEmailResult = await emailUtil.Send(
            toEmail,
            !!newEmailInvitationEMail
              ? newEmailInvitationEMail[0]?.ccEmails
              : [],
            String(
              !!newEmailInvitationEMail
                ? renderTemplate(newEmailInvitationEMail[0]?.subject ?? "", {
                  formName:
                    invitationTemplateData?.FormInvitation?.[i]?.Form
                      ?.title ?? "",
                })
                : "",
            ),
            newEmailInvitationEmailBody,
            invitationTemplateData?.FormInvitation[i]?.Company?.platformId,
            configdata,
            newEmailInvitationEMail?.[0]?.bccEmails || ""
          );
          emailResult.push({
            result: newInvitationEmailResult,
            type: "newInvitation",
          });
        } else {
          const newOnboardingEmail =
            invitationTemplateData.FormInvitation[0]?.Company?.Platform?.EmailTemplates.filter(
              (items) => items.type == AIEmailTemplates.AINewOnboarding
            );
          let newOnboardingEmailBody = !!newOnboardingEmail
            ? newOnboardingEmail[0]?.template
            : "";
          if (!!newOnboardingEmailBody) {
            newOnboardingEmailBody = newOnboardingEmailBody;

            const templateContext = {
              userName: String(
                invitationTemplateData.FormInvitation[i].Company?.name,
              ),
              subject: String(
                !!newOnboardingEmail ? newOnboardingEmail[0]?.subject : "",
              ),
              vcCompany: String(
                invitationTemplateData.FormInvitation[i].ParentUser?.Company
                  ?.name,
              ),
              formName: String(
                invitationTemplateData.FormInvitation[i].Form?.title,
              ),
              supportLinkEmail: String(
                invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                  ?.EmailConfigs[0].fromEmail,
              ),
              supportEmail: String(
                invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                  ?.EmailConfigs[0].fromEmail,
              ),
              datapointsection: datapointsectionContent,
              uploadsection: uploadsectionContent,
              clicklink: isInternalUSer
                ? clickLink
                : String(
                  clickLink +
                  "companyOnBoarding?companyid=" +
                  invitationTemplateData.FormInvitation[i].companyId,
                ),
              copyrightYear: String(copyrightYear),
              HeaderContent: headerTemplate,
            };

            newOnboardingEmailBody = renderTemplate(
              newOnboardingEmailBody,
              templateContext,
            );
          }
          const onboardingEmailResult = await emailUtil.Send(
            toEmail,
            !!newOnboardingEmail ? newOnboardingEmail[0]?.ccEmails : [],
            String(!!newOnboardingEmail ? newOnboardingEmail[0]?.subject : ""),
            newOnboardingEmailBody,
            invitationTemplateData?.FormInvitation[i]?.Company?.platformId,
            configdata,
            newOnboardingEmail?.[0]?.bccEmails || ""
          );
          emailResult.push({
            result: onboardingEmailResult,
            type: "onBoarding",
          });
        }
      }
    }
    return emailResult;
  } catch (error) {
    throw error;
  }
};

export const sendFileCurationCompletionEmail = async (
  AIBulkProcessingCompletionEmail: AIBulkProcessingCompleteEmail[]
) => {
  const emailResult: any[] = [];
  try {
    const invitationTemplateData =
      await sdk.getEmailtemplateForBulkProcessingDocs({
        invitationId: AIBulkProcessingCompletionEmail.map(
          (items) => items.invitationId
        ),
        emailType: AIBulkProcessingCompletionEmail[0].emailType,
      });
    if (invitationTemplateData?.FormInvitation?.length > 0) {
      const whereCondition: Record<string, any>[] =
        invitationTemplateData.FormInvitation.map((items) => {
          return {
            _and: {
              companyId: { _eq: items.companyId },
              formId: { _neq: items.Form?.id },
            },
          };
        });
      let forminvitationUSerData: GetformInvitationdatabycustomwhereQuery = {
        FormInvitation: [],
      };
      if (!!whereCondition && whereCondition.length > 0) {
        forminvitationUSerData = await sdk.getformInvitationdatabycustomwhere({
          where: { _or: whereCondition },
        });
      }
      let configdata =
        !!invitationTemplateData?.FormInvitation[0]?.Company?.Platform &&
          invitationTemplateData?.FormInvitation[0]?.Company?.Platform
            ?.EmailConfigs.length > 0
          ? {
            fromEmail:
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].fromEmail,
            port: invitationTemplateData?.FormInvitation[0]?.Company?.Platform
              ?.EmailConfigs[0].port,
            host: invitationTemplateData?.FormInvitation[0]?.Company?.Platform
              ?.EmailConfigs[0].host,
            user: invitationTemplateData?.FormInvitation[0]?.Company?.Platform
              ?.EmailConfigs[0].user,
            password:
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].password,
            isSecure:
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].isSecure,
          }
          : {
            fromEmail: "",
            port: 1111,
            host: "",
            user: "",
            password: "",
            isSecure: false,
          };
      for (let i = 0; i < invitationTemplateData.FormInvitation.length; i++) {
        const DocumentList = (
          AIBulkProcessingCompletionEmail.filter(
            (items) =>
              items?.invitationId == invitationTemplateData.FormInvitation[i].id
          ).length > 0
            ? AIBulkProcessingCompletionEmail.filter(
              (items) =>
                items?.invitationId ==
                invitationTemplateData.FormInvitation[i].id
            )[0]?.FileDetails
            : []
        ) as emailSourceFileDetails[];
        let toEmail = await choosemethod(
          invitationTemplateData.FormInvitation[i].email,
          "decrypt"
        );
        let docList = "";
        DocumentList?.forEach((items, index) => {
          const colorName =
            items?.Status == SourceFilesStatus.Error ? "#FC4E4E" : "#42AF8E";
          docList =
            docList +
            `<p class="MsoNormal" style="font-family: Calibri, sans-serif; margin-top: 0; margin-bottom: 0px; font-size: 14px; line-height: 22px; font-weight: 400; color: #1a1a1a; margin-left: 10px;">${index + 1
            }. ${items?.documentName} : <a style="color:#038FC7" href="${items?.fileUrl
            }">${items?.fileName}</a> - <span style="color:${colorName};">${items?.Status == SourceFilesStatus.Error
              ? "Processing Failed"
              : "Processed Successfully"
            }</span></p>`;
        });
        const AIcardData: AIDataCardsType = await getAIProcesingStats(
          invitationTemplateData.FormInvitation[i].Form?.id,
          invitationTemplateData.FormInvitation[i].id
        );
        let userMessage =
          '<p class="MsoNormal" style="font-family:Calibri, sans-serif; margin:0; margin-bottom:15px; font-size: 14px; line-height: 22px; font-weight: 400; color: #1a1a1a;">We`ve completed processing your uploaded documents using AI on Snowkap.</p>';
        let anyFailMessage = "";
        let UploadDocumentsText = "UPLOAD MORE DOCUMENTS";
        //We've completed processing your uploaded documents for the BRSR Assessment on Snowkap. Unfortunately, your documents failed to process.
        if (
          DocumentList.length ==
          DocumentList.filter(
            (items) => items.Status == SourceFilesStatus.Error
          ).length
        ) {
          userMessage =
            '<p class="MsoNormal" style="font-family:Calibri, sans-serif; margin:0; margin-bottom:15px; font-size: 14px; line-height: 22px; font-weight: 400; color: #1a1a1a;">We`ve completed processing your uploaded documents for the ' +
            String(invitationTemplateData.FormInvitation[i].Form?.title) +
            ' Assessment on Snowkap.</p><p class="MsoNormal" style="font-family:Calibri, sans-serif; margin:0; margin-bottom:15px; font-size: 14px; line-height: 22px; font-weight: 400; color: #1a1a1a;">Unfortunately, your documents failed to process.</p>';
          anyFailMessage =
            '<p class="MsoNormal" style="font-family:Calibri, sans-serif; margin:0; font-size: 14px; line-height: 22px; font-weight: 400; color: #1a1a1a;  margin-top:20px">Re-uploading these documents will help you automatically capture more data points.</p>';
          UploadDocumentsText = "UPLOAD FAILED DOCUMENTS";
        } else if (
          DocumentList.filter(
            (items) => items.Status == SourceFilesStatus.Error
          ).length > 0
        ) {
          userMessage =
            '<p class="MsoNormal" style="font-family:Calibri, sans-serif; margin:0; margin-bottom:15px; font-size: 14px; line-height: 22px; font-weight: 400; color: #1a1a1a;">We`ve completed processing your uploaded documents using AI on Snowkap.</p><p class="MsoNormal" style="font-family:Calibri, sans-serif; margin:0; margin-bottom:15px; font-size: 14px; line-height: 22px; font-weight: 400; color: #1a1a1a;">However, some of your documents failed to process.</p>';
          anyFailMessage =
            '<p class="MsoNormal" style="font-family:Calibri, sans-serif; margin:0; font-size: 14px; line-height: 22px; font-weight: 400; color: #1a1a1a;  margin-top:20px">Re-uploading failed documents can help you get closer to assessment completion.</p>';
          UploadDocumentsText = "UPLOAD FAILED DOCUMENTS";
        }
        //#region for setting datapoint and upload section content
        //#endregion
        let clickLink = invitationTemplateData.FormInvitation[
          i
        ].Company?.Platform?.origin.filter(
          (x: string) => !x.includes("localhost")
        )[0];
        const newEmailInvitationEmail =
          invitationTemplateData.FormInvitation[0]?.Company?.Platform
            ?.EmailTemplates;
        let newEmailInvitationEmailBody = !!newEmailInvitationEmail
          ? newEmailInvitationEmail[0]?.template
          : "";
        let mandatoryparameter =
          "(" +
          AIcardData.mandatoryFieldsCount +
          " Mandatory, " +
          AIcardData.optionalFieldsCount +
          " optional)";
        if (
          AIcardData.mandatoryFieldsCount > 0 &&
          AIcardData.optionalFieldsCount == 0
        ) {
          mandatoryparameter =
            "(" + AIcardData.mandatoryFieldsCount + " Mandatory)";
        } else if (
          AIcardData.optionalFieldsCount > 0 &&
          AIcardData.mandatoryFieldsCount == 0
        ) {
          mandatoryparameter =
            "(" + AIcardData.optionalFieldsCount + " optional)";
        } else if (
          AIcardData.optionalFieldsCount == 0 &&
          AIcardData.mandatoryFieldsCount == 0
        ) {
          mandatoryparameter = "";
        }
        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          invitationTemplateData?.FormInvitation[0]?.companyByParentcompanyid
            ?.metadata?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(
            headerTemplate,
            headerTemplateContent,
          );
        }
        const subject = !!newEmailInvitationEmail
          ? renderTemplate(newEmailInvitationEmail[0]?.subject ?? "", {
            assesmentName: String(
              invitationTemplateData.FormInvitation[i].Form?.title,
            ),
          })
          : "";
        if (!!newEmailInvitationEmailBody) {
          newEmailInvitationEmailBody = newEmailInvitationEmailBody;

          const templateContext = {
            userName: String(
              invitationTemplateData.FormInvitation[i].Company?.name,
            ),
            subject: String(subject),
            vcCompany: String(
              invitationTemplateData.FormInvitation[i].ParentUser?.Company
                ?.name,
            ),
            assesmentName: String(
              invitationTemplateData.FormInvitation[i].Form?.title,
            ),
            userMessage: String(userMessage),
            documentList: String(docList),
            anyFailFileMessage: String(anyFailMessage),
            totalInput: String(AIcardData.totalInputsRequired),
            dataCaptured: String(AIcardData.dataCapturedUsingAI),
            dataInputMultipleValue: String(
              AIcardData.dataInputsWithMultipleValues,
            ),
            totalTimeSaved:
              String(AIcardData.totalTimeSaved) + AIcardData.timeSavedUnit,
            mandatory: String(mandatoryparameter),
            pendingDataPoint: String(AIcardData.pendingDataPoints),
            supportEmail: String(
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].fromEmail,
            ),
            supportLinkEmail: String(
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].fromEmail,
            ),
            continueLink: String(
              clickLink +
              "AssessmentIntroDetails/scoring_test/" +
              invitationTemplateData?.FormInvitation[0]?.id +
              "/intro?assessmentname=" +
              invitationTemplateData?.FormInvitation[0]?.Form?.title +
              "&companyname=" +
              invitationTemplateData?.FormInvitation[0]?.Company?.name,
            ),
            UploadDocuments: String(UploadDocumentsText),
            phone: "1800 200 9999",
            uploadDocLink: String(
              clickLink +
              "ai-statistics/" +
              invitationTemplateData?.FormInvitation[0]?.id +
              "/" +
              invitationTemplateData?.FormInvitation[0]?.Form?.title +
              "/" +
              invitationTemplateData?.FormInvitation[0]?.Company?.name +
              "?action=upload-documents",
            ),
            copyrightYear: String(copyrightYear),
            HeaderContent: headerTemplate,
          };

          newEmailInvitationEmailBody = renderTemplate(
            newEmailInvitationEmailBody,
            templateContext,
          );
        }
        const newInvitationEmailResult = await emailUtil.Send(
          toEmail,
          !!newEmailInvitationEmail ? newEmailInvitationEmail[0]?.ccEmails : [],
          String(
            !!newEmailInvitationEmail
              ? newEmailInvitationEmail[0]?.subject?.replace(
                "@assesmentName",
                String(invitationTemplateData.FormInvitation[i].Form?.title),
              )
              : "",
          ),
          newEmailInvitationEmailBody,
          invitationTemplateData?.FormInvitation[i]?.Company?.platformId,
          configdata,
          newEmailInvitationEmail?.[0]?.bccEmails || ""
        );
        emailResult.push({
          result: newInvitationEmailResult,
          type: "Process Document",
        });
      }
    }
  } catch (error) {
    throw error;
  }
  return emailResult;
};

export const sendAICurationCompletionEmail = async (
  AIBulkProcessingCompletionEmail: AICurationCompleteEmail[]
) => {
  const emailResult: any[] = [];
  try {
    const invitationTemplateData =
      await sdk.getEmailtemplateForBulkProcessingDocs({
        invitationId: AIBulkProcessingCompletionEmail.map(
          (items) => items.invitationId
        ),
        emailType: AIBulkProcessingCompletionEmail[0].emailType,
      });
    if (invitationTemplateData?.FormInvitation?.length > 0) {
      const whereCondition: Record<string, any>[] =
        invitationTemplateData.FormInvitation.map((items) => {
          return {
            _and: {
              companyId: { _eq: items.companyId },
              formId: { _neq: items.Form?.id },
            },
          };
        });
      let forminvitationUSerData: GetformInvitationdatabycustomwhereQuery = {
        FormInvitation: [],
      };
      if (!!whereCondition && whereCondition.length > 0) {
        forminvitationUSerData = await sdk.getformInvitationdatabycustomwhere({
          where: { _or: whereCondition },
        });
      }
      let configdata =
        !!invitationTemplateData?.FormInvitation[0]?.Company?.Platform &&
          invitationTemplateData?.FormInvitation[0]?.Company?.Platform
            ?.EmailConfigs.length > 0
          ? {
            fromEmail:
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].fromEmail,
            port: invitationTemplateData?.FormInvitation[0]?.Company?.Platform
              ?.EmailConfigs[0].port,
            host: invitationTemplateData?.FormInvitation[0]?.Company?.Platform
              ?.EmailConfigs[0].host,
            user: invitationTemplateData?.FormInvitation[0]?.Company?.Platform
              ?.EmailConfigs[0].user,
            password:
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].password,
            isSecure:
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].isSecure,
          }
          : {
            fromEmail: "",
            port: 1111,
            host: "",
            user: "",
            password: "",
            isSecure: false,
          };
      for (let i = 0; i < invitationTemplateData.FormInvitation.length; i++) {
        let toEmail = await choosemethod(
          invitationTemplateData.FormInvitation[i].email,
          "decrypt"
        );
        let docList = "";

        const AIcardData: AIDataCardsType = await getAIProcesingStats(
          invitationTemplateData.FormInvitation[i].Form?.id,
          invitationTemplateData.FormInvitation[i].id
        );
        let userMessage =
          '<p class="MsoNormal" style="font-family:Calibri, sans-serif; margin:0; margin-bottom:15px; font-size: 14px; line-height: 22px; font-weight: 400; color: #1a1a1a;">We`ve completed processing your uploaded documents using AI on Snowkap.</p>';
        let anyFailMessage = "";
        let UploadDocumentsText = "UPLOAD MORE DOCUMENTS";

        let clickLink = invitationTemplateData.FormInvitation[
          i
        ].Company?.Platform?.origin.filter(
          (x: string) => !x.includes("localhost")
        )[0];
        const newEmailInvitationEmail =
          invitationTemplateData.FormInvitation[0]?.Company?.Platform
            ?.EmailTemplates;
        let newEmailInvitationEmailBody = !!newEmailInvitationEmail
          ? newEmailInvitationEmail[0]?.template
          : "";
        let mandatoryparameter =
          "(" +
          AIcardData.mandatoryFieldsCount +
          " Mandatory, " +
          AIcardData.optionalFieldsCount +
          " optional)";
        if (
          AIcardData.mandatoryFieldsCount > 0 &&
          AIcardData.optionalFieldsCount == 0
        ) {
          mandatoryparameter =
            "(" + AIcardData.mandatoryFieldsCount + " Mandatory)";
        } else if (
          AIcardData.optionalFieldsCount > 0 &&
          AIcardData.mandatoryFieldsCount == 0
        ) {
          mandatoryparameter =
            "(" + AIcardData.optionalFieldsCount + " optional)";
        } else if (
          AIcardData.optionalFieldsCount == 0 &&
          AIcardData.mandatoryFieldsCount == 0
        ) {
          mandatoryparameter = "";
        }
        const copyrightYear = new Date().getFullYear().toString();
        const CompanyHeaderContent =
          invitationTemplateData?.FormInvitation[0]?.companyByParentcompanyid
            ?.metadata?.CompanyHeaderContent;

        // Get header email templates
        const headerEmailTemplate = await sdk.getGlobalMasterByTypeList({
          type: [
            HeaderEmailTemplateTypes.HeaderWithClientDetails,
            HeaderEmailTemplateTypes.Header,
          ],
        });

        // Determine template type based on company header content
        const templateType = CompanyHeaderContent
          ? HeaderEmailTemplateTypes.HeaderWithClientDetails
          : HeaderEmailTemplateTypes.Header;

        // Filter templates by type
        const headerTemplateData = headerEmailTemplate?.GlobalMaster.filter(
          (item) => item.type === templateType,
        );

        let headerTemplate = headerTemplateData[0]?.data?.template ?? "";

        // Replace client logo placeholder if available
        if (headerTemplate && CompanyHeaderContent?.clientLogo) {
          const headerTemplateContent = {
            clientLogo: CompanyHeaderContent?.clientLogo,
            width: CompanyHeaderContent?.width,
            widthinpx: CompanyHeaderContent?.widthinpx,
            height: CompanyHeaderContent?.height,
            heightinpx: CompanyHeaderContent?.heightinpx,
            altText: CompanyHeaderContent?.altText,
          };
          headerTemplate = renderTemplate(
            headerTemplate,
            headerTemplateContent,
          );
        }

        const subject = !!newEmailInvitationEmail
          ? renderTemplate(newEmailInvitationEmail[0]?.subject ?? "", {
            formName: String(
              invitationTemplateData.FormInvitation[i].Form?.title,
            ),
          })
          : "";
        if (!!newEmailInvitationEmailBody) {
          newEmailInvitationEmailBody = newEmailInvitationEmailBody;

          const templateContext = {
            userName: String(
              invitationTemplateData.FormInvitation[i].Company?.name,
            ),

            subject: String(subject),
            vcCompany: String(
              invitationTemplateData.FormInvitation[i].ParentUser?.Company
                ?.name,
            ),

            formName: String(
              invitationTemplateData.FormInvitation[i].Form?.title,
            ),

            userMessage: String(userMessage),

            documentList: String(docList),

            anyFailFileMessage: String(anyFailMessage),

            totalInput: String(AIcardData.totalInputsRequired),

            dataCaptured: String(AIcardData.dataCapturedUsingAI),

            dataInputMultipleValue: String(
              AIcardData.dataInputsWithMultipleValues,
            ),

            totalTimeSaved:
              String(AIcardData.totalTimeSaved) + AIcardData.timeSavedUnit,

            mandatory: String(mandatoryparameter),

            pendingDataPoint: String(AIcardData.pendingDataPoints),

            supportEmail: String(
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].fromEmail,
            ),

            supportLinkEmail: String(
              invitationTemplateData?.FormInvitation[0]?.Company?.Platform
                ?.EmailConfigs[0].fromEmail,
            ),

            continueLink: String(
              clickLink +
              "AssessmentIntroDetails/scoring_test/" +
              invitationTemplateData?.FormInvitation[0]?.id +
              "/intro?assessmentname=" +
              invitationTemplateData?.FormInvitation[0]?.Form?.title +
              "&companyname=" +
              invitationTemplateData?.FormInvitation[0]?.Company?.name,
            ),

            UploadDocuments: String(UploadDocumentsText),

            phone: "1800 200 9999",

            uploadDocLink: String(clickLink + "document-repository"),
            copyrightYear: String(copyrightYear),

            HeaderContent: headerTemplate,
          };

          newEmailInvitationEmailBody = renderTemplate(
            newEmailInvitationEmailBody,
            templateContext,
          );
        }
        // Insert EmailNotification record before sending (status set to 'pending' for reconciliation)
        let emailNotificationId: string | null = null;
        let newInvitationEmailResult: any;
        try {
          // Redact SMTP credentials - only store config identifier or non-secret fields
          const redactedConfig = configdata ? {
            host: configdata.host,
            port: configdata.port,
            fromEmail: configdata.fromEmail,
            // Explicitly omit: user, password (secrets)
          } : null;

          const emailNotificationInsert = await sdk.insert_EmailNotifications({
            emailData: [
              {
                invitationId: invitationTemplateData.FormInvitation[i].id,
                emailId: toEmail,
                subject: subject || "",
                mailBody: newEmailInvitationEmailBody,
                ccEmails: newEmailInvitationEmail?.[0]?.ccEmails ?? [],
                status: EmailStatus.pending,
                configData: redactedConfig,
                bccEmailId: newEmailInvitationEmail?.[0]?.bccEmails || "",
              },
            ],
          });
          // Handle response shape: insert_EmailNotifications.returning[0].id
          emailNotificationId =
            emailNotificationInsert?.insert_EmailNotifications?.returning?.[0]?.id ??
            null;
        } catch (notifInsertError) {
          console.error("sendAICurationCompletionEmail: failed to insert EmailNotification record", {
            invitationId: invitationTemplateData.FormInvitation[i].id,
            error: notifInsertError instanceof Error ? notifInsertError.message : String(notifInsertError),
          });
          // Non-blocking: continue to send email regardless
        }

        // Send email with proper error handling and status updates
        try {
          newInvitationEmailResult = await emailUtil.Send(
            toEmail,
            !!newEmailInvitationEmail ? newEmailInvitationEmail[0]?.ccEmails : [],
            String(
              !!newEmailInvitationEmail
                ? newEmailInvitationEmail[0]?.subject?.replace(
                  "@formName",
                  String(invitationTemplateData.FormInvitation[i].Form?.title),
                )
                : "",
            ),
            newEmailInvitationEmailBody,
            invitationTemplateData?.FormInvitation[i]?.Company?.platformId,
            configdata,
            newEmailInvitationEmail?.[0]?.bccEmails || ""
          );

          // Update status to success
          if (emailNotificationId) {
            try {
              const isRejected =
                Array.isArray(newInvitationEmailResult?.rejected) &&
                newInvitationEmailResult.rejected.length > 0;
              await sdk.updateStatusOfEmail({
                emailData: [
                  {
                    where: { id: { _eq: emailNotificationId } },
                    _set: {
                      status: isRejected ? EmailStatus.fail : EmailStatus.success,
                      error: isRejected ? newInvitationEmailResult?.response : null,
                    },
                  },
                ],
              });
            } catch (notifUpdateError) {
              console.error("sendAICurationCompletionEmail: failed to update EmailNotification status", {
                emailNotificationId,
                error: notifUpdateError instanceof Error ? notifUpdateError.message : String(notifUpdateError),
              });
            }
          }
        } catch (sendError) {
          // Update status to failed on error
          if (emailNotificationId) {
            try {
              await sdk.updateStatusOfEmail({
                emailData: [
                  {
                    where: { id: { _eq: emailNotificationId } },
                    _set: {
                      status: EmailStatus.fail,
                      error: sendError instanceof Error ? sendError.message : String(sendError),
                    },
                  },
                ],
              });
            } catch (notifUpdateError) {
              console.error("sendAICurationCompletionEmail: failed to update EmailNotification status after send error", {
                emailNotificationId,
                error: notifUpdateError instanceof Error ? notifUpdateError.message : String(notifUpdateError),
              });
            }
          }
          // Re-throw to maintain existing error handling behavior
          throw sendError;
        }

        emailResult.push({
          result: newInvitationEmailResult,
          type: "Process Document",
        });
      }
    }
  } catch (error) {
    throw error;
  }
  return emailResult;
};

export const renderTemplate = (
  template: string,
  context: Record<string, any>,
) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = context[key.trim()];
    return typeof value === "string" ? value : "";
  });
};

export const sendReviewerPendingEmailsCron: sendReviewerPendingEmailsCronType = async (platformId) => {
  try {
    const now = new Date();
    // Create start and end times for 24-hour period in UTC
    const startTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 1, 0)); // 00:01:00 UTC
    const endTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 0)); // 23:59:00 UTC

    const startTimeStr = startTime.toISOString();
    const endTimeStr = endTime.toISOString();

    const { MakerCheckerRemarks } = await sdk.GetPendingMakerCheckerRemarks({
      where: {
        Ismailsent: { _eq: false },
        created_at: {
          _gte: startTimeStr,
          _lt: endTimeStr
        }
      }
    });

    if (MakerCheckerRemarks.length === 0) return;

    // Group remarks by invitationId
    const pendingByInvitation = MakerCheckerRemarks.reduce((acc: any, remark: any) => {
      const invId = remark.ReviewerDetailsMapping?.FormInvitation?.id;
      if (!invId) return acc;
      if (!acc[invId]) {
        acc[invId] = {
          invitation: remark.ReviewerDetailsMapping.FormInvitation,
          remarks: []
        };
      }
      acc[invId].remarks.push(remark);
      return acc;
    }, {});

    for (const invId in pendingByInvitation) {
      const item = pendingByInvitation[invId];
      const inv = item.invitation;
      const remarks = item.remarks;

      const hasDeclined = remarks.some((r: any) => r.status === "Declined");
      const hasResubmitted = remarks.some((r: any) => r.status === "Re-Submitted");

      // Send appropriate emails
      if (hasDeclined) {
        await reviewerFormDeclinedResponseEmail(inv.id, "ReviewerFormCollatedDeclinedResponse", inv.companyId, inv.formId, inv.Company?.platformId, item.remarks[0].ReviewerDetailsMapping?.questionId);
      }
      if (hasResubmitted) {
        const resubmittedRemark = remarks.filter((r: any) => r.status === "Re-Submitted").sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),)[0];
        const inviteeUserId =
          resubmittedRemark?.ReviewerDetailsMapping?.FormInvitation?.ParentCompanyMapping?.UserId;
        const submittedBy = resubmittedRemark?.created_by;
        const userRole =
          inviteeUserId && submittedBy
            ? submittedBy === inviteeUserId
              ? AppRoles.Invitee
              : AppRoles.Responder
            : undefined;
        await reviewerResubmitResponseEmail(
          inv.id,
          "ResubmitResponsesByReviewer",
          inv.companyId,
          inv.formId,
          inv.Company?.platformId,
          resubmittedRemark?.ReviewerDetailsMapping?.questionId,
          userRole,
        );
      }

      // Mark all remarks for this invitation as sent
      await sdk.UpdateMakerCheckerRemarks({
        where: { id: { _in: remarks.map((r: any) => r.id) } },
        _set: { Ismailsent: true }
      });
    }
  } catch (error) {
    console.error("[Cron Job] sendReviewerPendingEmailsCron failed:", error);
    throw error;
  }
};
