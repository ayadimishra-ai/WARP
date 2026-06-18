import { NextRequest, NextResponse } from "next/server";
import {
  GetUserActivityMappingsPaginatedQuery,
  UpsertAppUserActivityPermissionMutation,
  UserOrganizationAddressMapping,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { getSnowkapServicesApiClient } from "~/lib/fetcher/server";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import {
  GetAppUserPermissionDetail,
  SaveAppUserPermissionDetail,
} from "~/lib/user/form/user.service";
import {
  apiReturnMessage,
  validateGetAppUsersActivityPermissionSchema,
  validateInsertAppUserActivityPermissionData,
} from "~/lib/user/form/user.validation";
import { CustomError } from "~/shared/error/custom-error";
import {
  dynamicEmailHeader,
  saveEmailLog,
  saveEmailLogParam,
  sendEmailWithTemplateReplacement,
} from "~/utils/email.util";
import { getServerEnv } from "~/utils/env/env.server";
import { logger } from "~/utils/logger";

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  const organization_id = userSession.organizationId;

  // Get pagination and search params from request
  const searchParams = req.nextUrl.searchParams;
  const pageIndex = parseInt(searchParams.get("pageIndex") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const searchTerm = searchParams.get("search") || "";

  const pagination = {
    pageIndex,
    pageSize,
  };

  let response: {
    userActivityMappings: GetUserActivityMappingsPaginatedQuery["view_user_activity_mappings"];
    totalCount: number;
  } = await GetAppUserPermissionDetail(organization_id, pagination, searchTerm);

  return NextResponse.json({
    success: true,
    data: {
      userActivityMappings: response?.userActivityMappings,
      totalCount: response?.totalCount,
    },
  });
};

const POST_Handler = async (req: NextRequest, session: TUserSession) => {
  const env = await getServerEnv();
  const snowkapServicesApiClient = await getSnowkapServicesApiClient();
  // Use session values from the validated JWT to prevent privilege escalation
  // via client-supplied headers.
  const organization_id = session.organizationId;
  const sessionUserId = session.userId;
  const requestBody = await req.json();
  try {
    //schema validation
    const validateActivityPermissionSchema: apiReturnMessage[] =
      await validateGetAppUsersActivityPermissionSchema(requestBody);
    if (
      validateActivityPermissionSchema?.filter(
        (items) => items?.sucess == false
      )?.length > 0
    ) {
      return NextResponse.json({
        success: false,
        statusCode: 300,
        data: validateActivityPermissionSchema
          ?.filter((items) => items?.sucess == false)
          .map((item) => item?.message),
      });
    }
    //data validation
    const validateAppUsersData: {
      responseObject: apiReturnMessage[];
    } = await validateInsertAppUserActivityPermissionData(
      requestBody,
      organization_id
    );
    if (
      validateAppUsersData?.responseObject?.filter(
        (items) => items?.sucess == false
      )?.length > 0
    ) {
      return NextResponse.json({
        success: true,
        statusCode: 300,
        data: validateAppUsersData?.responseObject?.filter(
          (items) => items?.sucess == false
        )[0]?.message,
      });
    }
    //if both sucess then save user Permission
    if (
      validateActivityPermissionSchema?.filter(
        (items) => items?.sucess == false
      )?.length == 0 &&
      validateAppUsersData?.responseObject?.filter(
        (items) => items?.sucess == false
      ).length == 0
    ) {
      let response: {
        udpateActivityPermission: UpsertAppUserActivityPermissionMutation;
        alreadyHavePermissionUsers: UserOrganizationAddressMapping[];
        doNotHavePermissionUsers: UserOrganizationAddressMapping[];
      } = await SaveAppUserPermissionDetail(
        requestBody,
        sessionUserId,
        organization_id
      );

      // get user ids from both alreadyHavePermissionUsers and doNotHavePermissionUsers
      const userIds: any[] = [];
      response?.alreadyHavePermissionUsers?.forEach((item) => {
        if (
          item?.user_id &&
          !userIds.includes(item?.user_id) &&
          !item?.AppUser?.isRegistered
        ) {
          userIds.push({
            opsUserId: item?.user_id,
          });
        }
      });
      response?.doNotHavePermissionUsers?.forEach((item) => {
        if (
          item?.user_id &&
          !userIds.includes(item?.user_id) &&
          !item?.AppUser?.isRegistered
        ) {
          userIds.push({
            opsUserId: item?.user_id,
          });
        }
      });

      let userData = [];
      if (userIds?.length > 0) {
        // Monorepo function to generate set password token
        const userResponse = await snowkapServicesApiClient.post(
          "/api/reset-password/SetNewPasswordTokenMany",
          { opsUserIds: userIds }
        );
        userData = userResponse?.data?.data || [];
      }

      if (
        !!response?.udpateActivityPermission
          .insert_UserOrganizationAddressMapping
      ) {
        //#region Email dynamic header
        const emailHeader = await dynamicEmailHeader(organization_id);
        //#endregion Email dynamic header
        const emailResponses: saveEmailLogParam[] = [];
        //#region already have permissions
        for (
          let index = 0;
          index < response?.alreadyHavePermissionUsers?.length;
          index++
        ) {
          const newPasswordToken = userData?.find(
            (item: any) =>
              item?.OPSUserId ===
              response?.alreadyHavePermissionUsers[index]?.user_id
          )?.SetPasswordToken;

          const resetPasswordLink =
            env.NEXT_PUBLIC_SITE_URL +
            "setnewpassword?email=" +
            newPasswordToken +
            "&IsInternalRequest=true";

          const formData = new FormData();
          formData.append("template_code", "ActivityPermission_Email");
          formData.append(
            "to",
            JSON.stringify([
              response?.alreadyHavePermissionUsers[index].AppUser?.email,
            ])
          );
          formData.append(
            "variables",
            JSON.stringify({
              userName:
                response?.alreadyHavePermissionUsers[index].AppUser?.name,
              organizationName:
                response?.alreadyHavePermissionUsers[index].Organization?.name,
              setButtonLink: response?.alreadyHavePermissionUsers[index].AppUser
                ?.isRegistered
                ? env.NEXT_PUBLIC_SITE_URL
                : resetPasswordLink,
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
              userId: response?.alreadyHavePermissionUsers[index]?.user_id,
            });
          });
        }
        //#endregion already have permissions
        //#region do not have permissions

        for (
          let index = 0;
          index < response?.doNotHavePermissionUsers?.length;
          index++
        ) {
          const newPasswordToken = userData?.find(
            (item: any) =>
              item?.OPSUserId ===
              response?.doNotHavePermissionUsers[index]?.user_id
          )?.SetPasswordToken;

          const resetPasswordLink =
            env.NEXT_PUBLIC_SITE_URL +
            "setnewpassword?email=" +
            newPasswordToken +
            "&IsInternalRequest=true";

          const formData = new FormData();
          formData.append("template_code", "Welcome_Email");
          formData.append(
            "to",
            JSON.stringify([
              response?.doNotHavePermissionUsers[index].AppUser?.email,
            ])
          );
          formData.append(
            "variables",
            JSON.stringify({
              userName: response?.doNotHavePermissionUsers[index].AppUser?.name,
              organizationName:
                response?.doNotHavePermissionUsers[index].Organization?.name,
              email: response?.doNotHavePermissionUsers[index].AppUser?.email,
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
              userId: response?.alreadyHavePermissionUsers[index]?.user_id,
            });
          });
        }
        //#endregion do not have permissions

        await saveEmailLog(emailResponses);
        return NextResponse.json({
          success: true,
          data: response?.udpateActivityPermission
            ?.insert_UserOrganizationAddressMapping?.returning,
        });
      }
    } else {
      throw CustomError({
        statusCode: 500,
        message: "Some error occurred please try again",
      });
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

// Select
export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
// Upsert
export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POST_Handler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
