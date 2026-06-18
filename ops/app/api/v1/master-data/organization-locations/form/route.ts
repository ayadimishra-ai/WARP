import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  InsertAddressesMutation,
  UpdateAddressMutation,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import {
  GetAddressDetail,
  SaveAddressDetail,
  UpdateAddressDetail,
} from "~/lib/master-data/organization-location.service";
import {
  validateInsertRequestData,
  validateOrganizationFormInput,
  validateUpdateRequestData,
} from "~/lib/master-data/organization-location.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { Activitylist } from "~/shared/constants/input.constant";
import { CustomError } from "~/shared/error/custom-error";

const GetLocationDetailsRequestSchema = z.object({
  address_id: z.string().uuid("Invalid address id"),
});

const GET_Handler = async (req: NextRequest, session: TUserSession) => {
  const addressid = String(req.headers.get("address_id"));

  const validationResult = GetLocationDetailsRequestSchema.safeParse({
    address_id: addressid,
  });

  const errors = validationResult.error?.flatten()?.fieldErrors;

  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: validationResult.success,
        errors: errors,
        data: null,
        message: "Invalid request",
      },
      { status: 400 }
    );
  }

  const addressDetails = await GetAddressDetail(
    addressid,
    session.organizationId
  );

  if (addressDetails) {
    addressDetails.code = addressDetails.code || "";
  }

  return NextResponse.json({
    success: true,
    data: addressDetails,
    errors: null,
  });
};

const POST_Handler = async (req: NextRequest, session: TUserSession) => {
  const organization_id = session.organizationId;
  const sessionUserId = session.userId;
  const requestBody = await req.json();
  // const requestBody = sanitiseObjectValues<insertAddressBodytype>(bodyData);

  const sdk = await getGraphQlServerSDK();

  const organizationDetails = await sdk.getMyOrganizationDetails({
    organizationId: session.organizationId,
  });
  const orgActivities = await sdk.getActivitiesByOrganization({
    OrgId: session.organizationId,
  });

  let hasWWTP = false;

  if (
    organizationDetails.Organization &&
    organizationDetails.Organization.length > 0
  ) {
    hasWWTP =
      !!organizationDetails.Organization[0].hasWasteWaterTreatmentPlant &&
      orgActivities?.OrganizationActivityMapping?.filter(
        (item) => item.Activity.code === Activitylist.water
      ).length > 0;
  }

  if (requestBody.code === "undefined") delete requestBody.code;

  const validationResult = validateOrganizationFormInput(requestBody, hasWWTP);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: validationResult.success,
        errors: validationResult.errors,
        data: null,
      },
      { status: 400 }
    );
  }

  const dataValidationResult = await validateInsertRequestData(
    requestBody,
    organization_id
  );

  if (!dataValidationResult.success) {
    return NextResponse.json(
      {
        success: dataValidationResult.success,
        errors: dataValidationResult.errors,
        data: null,
      },
      { status: 400 }
    );
  }

  if (validationResult.success && dataValidationResult.success) {
    let response: InsertAddressesMutation | null = await SaveAddressDetail(
      requestBody,
      sessionUserId,
      organization_id
    );
    if (response?.insert_Addresses?.affected_rows ?? 0 > 0) {
      return NextResponse.json({
        success: true,
        data: response?.insert_Addresses?.returning,
      });
    } else {
      throw CustomError({
        statusCode: 500,
        message: "Some error occurred please try again",
      });
    }
  } else {
    throw CustomError({
      statusCode: 404,
      message: "Some error occurred please try again",
    });
  }
};

const PUT_Handler = async (req: NextRequest, session: TUserSession) => {
  const sessionUserId = session.userId;
  const requestBody = await req.json();
  // const requestBody = sanitiseObjectValues<insertAddressBodytype>(bodyData);

  const sdk = await getGraphQlServerSDK();

  const organizationDetails = await sdk.getMyOrganizationDetails({
    organizationId: session.organizationId,
  });

  let hasWWTP = false;

  if (
    organizationDetails.Organization &&
    organizationDetails.Organization.length > 0
  ) {
    hasWWTP = !!organizationDetails.Organization[0].hasWasteWaterTreatmentPlant;
  }

  const validationResult = validateOrganizationFormInput(
    requestBody,
    hasWWTP,
    requestBody.address_id
  );

  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: validationResult.success,
        errors: validationResult.errors,
        data: null,
      },
      { status: 400 }
    );
  }

  const dataValidationResult = await validateUpdateRequestData(
    requestBody,
    session.organizationId
  );

  if (dataValidationResult.success === false) {
    return NextResponse.json(
      {
        success: dataValidationResult.success,
        errors: dataValidationResult.errors,
        data: null,
      },
      { status: 400 }
    );
  }

  if (validationResult.success && dataValidationResult.success) {
    let response: UpdateAddressMutation = await UpdateAddressDetail(
      requestBody,
      sessionUserId,
      session.organizationId
    );
    if (!!response) {
      return NextResponse.json({
        success: true,
        data: response?.update_Addresses?.returning,
      });
    } else {
      throw CustomError({
        statusCode: 500,
        message: "Some error occurred.",
      });
    }
  } else {
    throw CustomError({
      statusCode: 500,
      message: "Failed to update address details.",
    });
  }
};

export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(GET_Handler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POST_Handler), {
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
