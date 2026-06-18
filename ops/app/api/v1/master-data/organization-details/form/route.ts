import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import {
  getOrganizationDetail,
  updateUserDetailsAndOrganizationDetails,
} from "~/lib/master-data/organization-details.service";
import {
  validateGetOrganizationSchema,
  validateUpdateAppUserData,
} from "~/lib/master-data/organization-details.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";

const GET_Handler = async (req: NextRequest, userSession: TUserSession) => {
  const validateUserDetails = await validateGetOrganizationSchema(userSession);

  if (validateUserDetails) {
    let response = await getOrganizationDetail(userSession);

    if (!!response) {
      if (response?.AppUser?.[0]?.role === "OrganizationAdmin") {
        //&& response?.AppUser?.[0]?.is_spoc === true) {
        return NextResponse.json({
          success: true,
          data: {
            user: response?.AppUser,
            industryType: response?.industryTypeMaster,
            stateCountry: response?.stateCountryMaster,
            countryList: response?.countryMaster,
            defaultCountryStateData: response?.defaultCountryStateData,
            OrgActivityDetails: response?.OrgActivityDetails,
          },
        });
      }

      return NextResponse.json({
        success: false,
        status: 403,
        message: "Only admin user can access this page.",
      });

      // throw CustomError({
      //   statusCode: 401, //throw unauthorized error if user is not organization admin.
      //   message: "Unauthorized request.",
      // });
    } else {
      return NextResponse.json({
        success: false,
        message: "No organization/user found for the provided user ID.",
      });

      // throw CustomError({
      //   statusCode: 404, //throw not found error.
      //   // message: "Invalid user id.",
      //   message: "No organization/user found for the provided user ID.",
      // });
    }
  } else {
    return NextResponse.json({
      success: false,
      message: "Validation failed: Invalid or missing input parameters.",
    });

    // throw CustomError({
    //   statusCode: 400, //throw bad request error
    //   message: "Validation failed: Invalid or missing input parameters.",
    // });
  }
};

// =========================================================================================================================================

const PUT_Handler = async (req: NextRequest, userSession: TUserSession) => {
  const requestBody = await req.json();
  // const requestBody = sanitiseObjectValues<TUserDetailsType>(bodyData);
  //validate entered data and user
  const validateAppUsersData: { success: boolean; message?: string } =
    await validateUpdateAppUserData(requestBody, userSession);

  if (!validateAppUsersData.success) {
    return NextResponse.json(validateAppUsersData);

    // throw CustomError({
    //   statusCode: 400, //bad request or validation failed.
    //   message: validateAppUsersData.message,
    // });
  }

  //if both sucess then update user
  if (validateAppUsersData.success) {
    let userResponse = await updateUserDetailsAndOrganizationDetails(
      requestBody,
      userSession
    );
    if (!!userResponse) {
      if (
        !userResponse?.organizationResponse?.success ||
        !userResponse?.userResponse?.success
      ) {
        return NextResponse.json({
          success:
            userResponse?.organizationResponse?.success ||
            userResponse?.userResponse?.success,
          message: {
            user: userResponse?.userResponse?.message,
            organization: userResponse?.organizationResponse?.message,
          },
        });
      }
      return NextResponse.json({
        success:
          userResponse?.organizationResponse?.success &&
          userResponse?.userResponse?.success,
        data: {
          userData: userResponse?.userResponse?.data,
          organization: userResponse?.organizationResponse?.data,
        },
      });
    }
  } else {
    // return NextResponse.json({
    //   success: false,
    //   message: validateAppUsersData.message,
    // });
    return NextResponse.json(validateAppUsersData);
  }
  return NextResponse.json(validateAppUsersData);
};
export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
export const PUT = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(PUT_Handler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
export const dynamic = "force-dynamic";
