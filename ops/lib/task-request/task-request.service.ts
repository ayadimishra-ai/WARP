import { getGraphQlServerSDK } from "~/graphql/server";
import { ActivityTaskRequest_Insert_Input } from "~/graphql/shared/types";
import { TUserSession } from "../auth/auth.client";
import { getOrganizationAddressAllowedActivities } from "../organization-address/organization-address.service";

const getInsertActivityTaskRequestObjects = async (
  userSession: TUserSession,
  organizationId: string,
  organizationAddressId: string
): Promise<ActivityTaskRequest_Insert_Input[]> => {
  const organizationAddressActivities =
    await getOrganizationAddressAllowedActivities(
      organizationId,
      organizationAddressId
    );

  const insertInputs =
    organizationAddressActivities.map<ActivityTaskRequest_Insert_Input>(
      (m) => ({
        organization_address_id: organizationAddressId,
        activity_id: m.activity_id,
        created_by: userSession.userId,
        updated_by: userSession.userId,
      })
    );

  return insertInputs;
};

export const getOrCreateTaskRequestIfNotExist = async (
  userSession: TUserSession,
  organizationId: string,
  organizationAddressId: string,
  month: string,
  year: number
) => {
  const sdk = await getGraphQlServerSDK();

  // Get task request
  let result = await sdk.getTaskRequestV2({
    organizationAddressId,
    month,
    year,
  });

  // If task request do not exist
  // Create new task request along with Activity task requests
  const taskRequestExists = !!result.TaskRequest.length;

  if (!taskRequestExists) {
    const newActivityTaskRequests = await getInsertActivityTaskRequestObjects(
      userSession,
      organizationId,
      organizationAddressId
    );

    let insertResult = await sdk.insertTaskRequestWithActivities({
      year,
      month,
      organizationAddressId,
      activityTaskRequests: { data: newActivityTaskRequests },
      userId: userSession.userId,
    });

    return insertResult.insert_TaskRequest_one as (typeof result.TaskRequest)[number];
  }

  return result.TaskRequest[0];
};
