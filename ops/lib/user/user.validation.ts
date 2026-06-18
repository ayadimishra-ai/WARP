import { AppGlobalMasterConstant } from "~/shared/constants/app-global-master.constant";
import { CustomError } from "~/shared/error/custom-error";
import { TUserSession } from "../auth/auth.client";
import { getOrganizationAddressAllowedActivities } from "../organization-address/organization-address.service";

export const validateUserActivityAndOrganizationAddressPermissions = async (
  userSession: TUserSession,
  organizationAddressId: string,
  activityCode: (typeof AppGlobalMasterConstant.activities)[number]
) => {
  if (!userSession || !organizationAddressId)
    throw CustomError({ statusCode: 400, message: "Invalid request" });

  const userMapping = userSession.mappings.find(
    (m) =>
      m.organization_address_id === organizationAddressId &&
      m.activities.includes(activityCode)
  );

  if (!userMapping)
    throw CustomError({ statusCode: 401, message: "Permission denied" });

  const organizationAddress = await getOrganizationAddressAllowedActivities(
    userSession.organizationId,
    userMapping.organization_address_id
  );

  const isUserPermitted = organizationAddress.some(
    (m) => m.activity_code === activityCode
  );

  if (!isUserPermitted)
    throw CustomError({ statusCode: 401, message: "Permission denied" });
};
