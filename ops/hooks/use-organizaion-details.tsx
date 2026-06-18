import { useGetActivitiesByOrganizationQuery } from "~/graphql/queries/get-activities-by-organization.generated";
import { useGetMyOrganizationDetailsQuery } from "~/graphql/queries/get-my-organization-details.generated";
import { Activitylist } from "~/shared/constants/input.constant";
import { useUserSession } from "./use-user-session";

export const useOrganizationDetails = () => {
  const session = useUserSession();
  const { data, loading, error } = useGetMyOrganizationDetailsQuery({
    variables: { organizationId: session?.organizationId },
    skip: !session?.organizationId,
  });
  const { data: dataOrgActivities } = useGetActivitiesByOrganizationQuery({
    variables: { OrgId: session?.organizationId },
  });

  const organization = data?.Organization ? data?.Organization[0] : null;
  const hasWWTP = organization?.hasWasteWaterTreatmentPlant;
  const isReviewed = organization?.is_review_saved;
  let orgActivities = dataOrgActivities?.OrganizationActivityMapping || [];
  // Check if any of the activities has code 'water'
  let waterActivityData = orgActivities.filter(
    (item) => item.Activity.code === Activitylist.water
  );
  const hasWaterActivity = waterActivityData.length > 0;
  return {
    data: organization,
    loading,
    error,
    hasWWTP,
    isReviewed,
    hasWaterActivity,
  };
};
