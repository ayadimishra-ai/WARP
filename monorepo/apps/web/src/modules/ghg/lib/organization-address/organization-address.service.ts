import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { AppGlobalMasterConstant } from "@/modules/ghg/shared/constants/app-global-master.constant";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";

export const getOrganizationAddressAllowedActivities = async (
  organizationId: string,
  organizationAddressId: string
) => {
  const sdk = await getGraphQlServerSDK();

  const organizationAcitiviesAndAddress =
    await sdk.getOrganizationActivitiesAndAddress({
      organizationAddressId,
      organizationId,
    });

  const organizationActivities =
    organizationAcitiviesAndAddress.OrganizationActivityMapping.map((m) => ({
      activity_id: m.Activity.id,
      activity_code: m.Activity.code,
    }));

  if (!organizationActivities?.length) {
    throw CustomError({
      message: "No organization activity mappings found.",
      statusCode: 400,
    });
  }

  const address =
    organizationAcitiviesAndAddress.Organization[0]?.OrganizationAddresses[0]
      ?.Address;

  if (!address) {
    throw CustomError({
      message: "Invalid organization address id",
      statusCode: 400,
    });
  }

  const organizationActivitieCodes = organizationActivities.map(
    (act) => act.activity_code
  );

  const addressActivities =
    AppGlobalMasterConstant.address_activity_mappings.find(
      (m) =>
        m.address_type === address.type &&
        m.ownership_type === address.ownership_type
    )?.activities;

  if (!!!addressActivities?.length)
    throw CustomError({
      message: "Invalid organization address type and ownership type",
    });

  const allowedOrganizationAddressActivities = addressActivities
    .filter((m) => organizationActivitieCodes.includes(m))
    .map(
      (actCode) =>
        organizationActivities.find((act) => act.activity_code === actCode)!
    );

  if (!allowedOrganizationAddressActivities?.length) {
    throw CustomError({
      message: "No organization address activity mappings found",
    });
  }

  return allowedOrganizationAddressActivities;
};
