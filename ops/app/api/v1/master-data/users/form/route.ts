import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  AppUser,
  InsertAppUserMutation,
  UpdateAppUserMutation,
} from "~/graphql/shared/types";
import { encryptionDecryption } from "~/hooks/encryption-decryption";
import { TUserSession } from "~/lib/auth/auth.client";
import { getSnowkapServicesApiClient } from "~/lib/fetcher/server";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import {
  SaveAppUserDetail,
  UpdateAppUserDetail,
  userDetailsType,
} from "~/lib/user/form/user.service";
import {
  apiReturnMessage,
  validateAppUserData,
  validateGetAppUsersSchema,
} from "~/lib/user/form/user.validation";
import { CustomError } from "~/shared/error/custom-error";
import {
  dynamicEmailHeader,
  saveEmailLog,
  saveEmailLogParam,
  sendEmailWithTemplateReplacement,
} from "~/utils/email.util";
import { clientEnv } from "~/utils/env/env.client";
import { getServerEnv } from "~/utils/env/env.server";
import { logger } from "~/utils/logger";
export type spaUserCreationRequest = {
  CreatedBy: string;
  name: string;
  email: string;
  mobile: string;
  companyGuid: string;
  userGuid: string;
  userRole: string;
};

const { choosemethod } = encryptionDecryption();
const POST_Handler = async (req: NextRequest, session: TUserSession) => {
  const snowkapServicesApiClient = await getSnowkapServicesApiClient();
  const sdk = await getGraphQlServerSDK();
  const env = await getServerEnv();
  try {
    // Use session values from the validated JWT to avoid privilege escalation via
    // client-supplied headers.
    const organization_id = session.organizationId;
    const userId = session.userId;
    let requestBody = await req.json();

    requestBody = requestBody.map((item: userDetailsType) => {
      if (!!item.email) {
        return {
          ...item,
          email: item.email.trim().toLocaleLowerCase(),
        };
      }
      return item;
    });

    // schema validation
    const validateAppUsersSchema: apiReturnMessage[] =
      await validateGetAppUsersSchema(requestBody, false);
    if (
      validateAppUsersSchema?.filter((items) => items?.sucess == false)
        ?.length > 0
    ) {
      return NextResponse.json({
        success: false,
        statusCode: 300,
        data: validateAppUsersSchema
          ?.filter((items) => items?.sucess == false)
          .map((item) => item?.message),
      });
    }
    //data validation
    const validateAppUsersData: apiReturnMessage[] = await validateAppUserData(
      requestBody,
      organization_id,
      userId,
      false
    );
    if (
      validateAppUsersData?.filter((items) => items?.sucess == false)?.length >
      0
    ) {
      return NextResponse.json({
        success: false,
        statusCode: 300,
        data: validateAppUsersData
          ?.filter((items) => items?.sucess == false)
          .map((item) => item?.message),
      });
    }

    // Get organization pan number if not founfd then return error as PAN number is mandatory to create user in SPA
    const _organization = await sdk.getMyOrganizationDetails({
      organizationId: organization_id,
    });
    const organization = _organization.Organization[0];
    if (!organization) {
      throw CustomError({
        statusCode: 404,
        message: "Organization not found",
      });
    }

    const organizationName = organization?.name || "";

    let organizationPanNumber = null;
    if (organization?.metadata && organization?.metadata[0]) {
      organizationPanNumber = organization.metadata.find(
        (m: any) => !!m.cin_pan_gst
      )?.cin_pan_gst;
    }

    // if (!organizationPanNumber) {
    //   return NextResponse.json({
    //     success: false,
    //     statusCode: 300,
    //     data: [{ email: "Organization PAN/License number is missing" }],
    //     message: {
    //       email: "Organization PAN/License number is missing",
    //     },
    //   });
    // }

    //if both sucess then save user
    if (
      validateAppUsersSchema?.filter((items) => items?.sucess == false)
        ?.length == 0 &&
      validateAppUsersData?.filter((items) => items?.sucess == false)?.length ==
        0
    ) {
      const reqData = requestBody;
      const newUserId = randomUUID();

      const spauserData = {
        name: reqData[0]?.name,
        email: String(
          choosemethod(reqData[0]?.email, "encrypt")
        ).toLocaleUpperCase(),
        mobile: reqData[0]?.mobile,
        companyGuid: organization_id,
        userGuid: newUserId,
        userRole: reqData[0]?.role,
        companyPanNumber: organizationPanNumber,
        companyName: organizationName,
      };

      const response1 = await snowkapServicesApiClient.post(
        "api/common/GetUserDetailsByEmailId",
        JSON.stringify({
          data: spauserData,
        })
      );

      if (!!response1) {
        if (response1.data[0].message.email === "New User") {
          let response: InsertAppUserMutation = await SaveAppUserDetail(
            requestBody,
            userId,
            organization_id
          );

          if (
            !!response?.insert_AppUser &&
            response?.insert_AppUser?.returning?.length > 0
          ) {
            const spauserCreateData = response?.insert_AppUser?.returning.map(
              (item) => ({
                CreatedBy: userId,
                name: item?.name,
                email: String(
                  choosemethod(item?.email, "encrypt")
                ).toLocaleUpperCase(),
                mobile: item?.metadata?.mobile,
                companyGuid: item?.organization_id,
                userGuid: item?.id,
                userRole: item?.role,
                setNewPasswordToken: item?.id?.toString()?.replaceAll("-", ""),
              })
            );

            const userResponse = await snowkapServicesApiClient.post(
              "/api/common/CreateUser",
              JSON.stringify({
                process: "INSERT",
                data: spauserCreateData,
              })
            );
            if (userResponse?.status == 200) {
              if (userResponse?.data?.code == 200) {
                const emailResponses: saveEmailLogParam[] = [];
                //#region Email dynamic header
                const emailHeader = await dynamicEmailHeader(organization_id);
                //#endregion Email dynamic header
                for (let index = 0; index < requestBody.length; index++) {
                  const detail = response?.insert_AppUser.returning.filter(
                    (items) =>
                      items?.email == requestBody[index].email.toLowerCase()
                  );
                  if (
                    !!detail &&
                    detail.length > 0 &&
                    detail[0]?.role === "OrganizationAdmin"
                  ) {
                    const newPasswordToken = userResponse?.data?.data?.find(
                      (item: any) => item?.opsUserId === detail[0]?.id
                    )?.setPasswordToken;

                    const resetPasswordLink =
                      process.env.NEXT_PUBLIC_SITE_URL +
                      "setnewpassword?email=" +
                      newPasswordToken +
                      "&IsInternalRequest=true";
                    const formData = new FormData();
                    formData.append("template_code", "Welcome_Email");
                    formData.append(
                      "to",
                      JSON.stringify([requestBody[index].email.toLowerCase()])
                    );
                    formData.append(
                      "variables",
                      JSON.stringify({
                        userName: requestBody[index].name,
                        organizationName:
                          detail.length > 0
                            ? detail[0]?.Organization?.name
                            : "",
                        email: requestBody[index].email.toLowerCase(),
                        setPasswordLink: resetPasswordLink,
                        copyrightYear: new Date().getFullYear().toString(),
                        HeaderContent: emailHeader,
                      })
                    );
                    const emailResponse =
                      await sendEmailWithTemplateReplacement(formData);
                    emailResponse?.emailResponse.forEach((items) => {
                      emailResponses.push({
                        emailTemplate: items?.data?.template,
                        preparedEmaiTemplate:
                          items?.data?.preparedEmailTemplate,
                        result: items?.data?.data || null,
                        userEmail: items?.data?.email,
                        userId: detail[0]?.id,
                      });
                    });
                    //#endregion
                  }
                }
                if (emailResponses.length > 0) {
                  await saveEmailLog(emailResponses);
                }
              } else {
                await sdk.deleteAppUser({
                  where: {
                    id: {
                      _eq: requestBody?.map(
                        (item: userDetailsType) => item?.id
                      ),
                    },
                  },
                });
                return NextResponse.json({
                  success: false,
                  statusCode: 300,
                  data: [userResponse?.data?.message],
                });
              }
            }
          }
          if (!!response) {
            return NextResponse.json({
              success: true,
              data: response?.insert_AppUser?.returning,
            });
          }
        } else if (
          response1.data[0].message.email === "OP Permissions Updated"
        ) {
          requestBody[0].id = newUserId;
          requestBody[0].isRegistered = true;

          let response: InsertAppUserMutation = await SaveAppUserDetail(
            requestBody,
            userId,
            organization_id
          );

          const emailResponses: saveEmailLogParam[] = [];
          //#region Email dynamic header
          const emailHeader = await dynamicEmailHeader(organization_id);
          //#endregion Email dynamic header
          for (let index = 0; index < requestBody.length; index++) {
            const detail = response?.insert_AppUser?.returning.filter(
              (items) => items?.email == requestBody[index].email.toLowerCase()
            );
            if (
              !!detail &&
              detail.length > 0 &&
              detail[0]?.role === "OrganizationAdmin"
            ) {
              const resetPasswordLink = clientEnv.NEXT_PUBLIC_SITE_URL;
              const formData = new FormData();
              formData.append("template_code", "Welcome_Email");
              formData.append(
                "to",
                JSON.stringify([requestBody[index].email.toLowerCase()])
              );
              formData.append(
                "variables",
                JSON.stringify({
                  userName: requestBody[index].name,
                  organizationName:
                    detail.length > 0 ? detail[0]?.Organization?.name : "",
                  email: requestBody[index].email.toLowerCase(),
                  setPasswordLink: resetPasswordLink,
                  copyrightYear: new Date().getFullYear().toString(),
                  HeaderContent: emailHeader,
                })
              );
              const emailResponse =
                await sendEmailWithTemplateReplacement(formData);
              emailResponse?.emailResponse.forEach((items) => {
                emailResponses.push({
                  emailTemplate: items?.data?.template,
                  preparedEmaiTemplate: items?.data?.preparedEmailTemplate,
                  result: items?.data?.data || null,
                  userEmail: items?.data?.email,
                  userId: detail[0]?.id,
                });
              });
              //#endregion
            }
          }
          if (emailResponses.length > 0) {
            await saveEmailLog(emailResponses);
          }

          return NextResponse.json({
            success: true,
            data: response?.insert_AppUser?.returning,
          });
        } else {
          return NextResponse.json({
            success: false,
            data: response1.data,
          });
        }
      }
    } else {
      throw CustomError({
        statusCode: 500,
        message: "Some error occurred please try again",
      });
    }
  } catch (err) {
    logger.error("Failed to add user", {
      error: err,
      errorStack: err instanceof Error ? err.stack : undefined,
    });
    throw CustomError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
  return NextResponse.json({
    success: true,
    data: [],
  });
};

const PUT_Handler = async (req: NextRequest, session: TUserSession) => {
  try {
    const snowkapServicesApiClient = await getSnowkapServicesApiClient();
    const env = await getServerEnv();
    // Use session values from the validated JWT instead of client-supplied headers
    // to prevent privilege escalation.
    const organization_id = session.organizationId;
    const userId = session.userId;
    const sessionUserId = session.userId;
    const requestBody = await req.json();
    // const requestBody = sanitiseServerSideValues<userDetailsType>(bodyData);
    //schema validation
    const validateAppUsersSchema: apiReturnMessage[] =
      await validateGetAppUsersSchema(requestBody, true);
    if (
      validateAppUsersSchema?.filter((items) => items?.sucess == false)
        ?.length > 0
    ) {
      return NextResponse.json({
        success: false,
        statusCode: 300,
        data: validateAppUsersSchema
          ?.filter((items) => items?.sucess == false)
          .map((item) => item?.message),
      });
    }
    //data validation
    const validateAppUsersData: apiReturnMessage[] = await validateAppUserData(
      requestBody,
      organization_id,
      userId,
      true
    );
    if (
      validateAppUsersData?.filter((items) => items?.sucess == false)?.length >
      0
    ) {
      return NextResponse.json({
        success: false,
        statusCode: 300,
        data: validateAppUsersData
          ?.filter((items) => items?.sucess == false)
          .map((item) => item?.message),
      });
    }
    //if both sucess then update user
    if (
      validateAppUsersSchema?.filter((items) => items?.sucess == false)
        ?.length == 0 &&
      validateAppUsersData?.filter((items) => items?.sucess == false)?.length ==
        0
    ) {
      let response: {
        updateUser: UpdateAppUserMutation;
        emailUsers: AppUser[];
      } = await UpdateAppUserDetail(
        requestBody,
        sessionUserId,
        organization_id
      );
      if (!!response) {
        const spauserCreateData =
          response?.updateUser?.update_AppUser_many?.map((item) => ({
            CreatedBy: userId,
            name: item?.returning[0]?.name,
            email: String(
              choosemethod(item?.returning[0]?.email, "encrypt")
            ).toLocaleUpperCase(),
            mobile: item?.returning[0]?.metadata?.mobile,
            mobileCountryCode: item?.returning[0]?.metadata?.mobileCountryCode,
            companyGuid: item?.returning[0]?.organization_id,
            userGuid: item?.returning[0]?.id,
            userRole: item?.returning[0]?.role,
            setNewPasswordToken: item?.returning[0]?.id
              ?.toString()
              ?.replaceAll("-", ""),
          }));
        const userResponse = await snowkapServicesApiClient.post(
          "/api/common/CreateUser",
          JSON.stringify({
            process: "UPDATE",
            data: spauserCreateData,
          })
        );

        if (userResponse?.status == 200) {
          if (userResponse?.data?.code == 200) {
            //#region Email dynamic header
            const emailHeader = await dynamicEmailHeader(organization_id);
            //#endregion Email dynamic header
            const emailResponses: saveEmailLogParam[] = [];
            for (let index = 0; index < response?.emailUsers?.length; index++) {
              const detail = response?.emailUsers?.filter(
                (items) => items?.email == response?.emailUsers[index].email
              );
              const newPasswordToken = userResponse?.data?.data?.find(
                (item: any) => item?.opsUserId === detail[0]?.id
              )?.setPasswordToken;

              const resetPasswordLink =
                env.NEXT_PUBLIC_SITE_URL +
                "setnewpassword?email=" +
                newPasswordToken +
                "&IsInternalRequest=true";
              const formData = new FormData();
              formData.append("template_code", "Welcome_Email");
              formData.append(
                "to",
                JSON.stringify([response?.emailUsers[index].email])
              );
              formData.append(
                "variables",
                JSON.stringify({
                  userName: response?.emailUsers[index].name,
                  organizationName:
                    detail.length > 0 ? detail[0]?.Organization?.name : "",
                  email: response?.emailUsers[index].email,
                  setPasswordLink: resetPasswordLink,
                  copyrightYear: new Date().getFullYear().toString(),
                  HeaderContent: emailHeader,
                })
              );
              const emailResponse =
                await sendEmailWithTemplateReplacement(formData);
              emailResponse?.emailResponse.forEach((items) => {
                emailResponses.push({
                  emailTemplate: items?.data?.template,
                  preparedEmaiTemplate: items?.data?.preparedEmailTemplate,
                  result: items?.data?.data || null,
                  userEmail: items?.data?.email,
                  userId: detail[0]?.id,
                });
              });
              //#endregion
            }
            if (emailResponses.length > 0) {
              await saveEmailLog(emailResponses);
            }
          }
        }
        return NextResponse.json({
          success: true,
          data: response?.updateUser?.update_AppUser_many,
        });
      }
    }
  } catch (err) {
    logger.error("Failed to update user", {
      error: err,
      errorStack: err instanceof Error ? err.stack : undefined,
    });
    throw CustomError({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
  return NextResponse.json({
    success: true,
    data: [],
  });
};
// Insert
export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POST_Handler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
// Update
export const PUT = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(PUT_Handler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
