"use server";

import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { calculateEmission, saveEmissionDashboard } from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import type { TActivityCodes } from "@/modules/ghg/shared/constants/activity.constant";

export interface RetriggerEmissionsPayload {
  organizationId: string;
  locationId: string;
  activityId: string;
  month?: string;
  year?: number;
}

export interface RetriggerEmissionsResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const getOrganizationList = async () => {
  const sdk = await getGraphQlServerSDK();
  return await sdk.getOrganizationList();
};

export const getLocationsByOrganization = async (organizationId: string) => {
  const sdk = await getGraphQlServerSDK();
  return await sdk.GetAddressByOrgAddressId({ organizationId });
};

export const getActivitiesByOrganization = async (organizationId: string) => {
  const sdk = await getGraphQlServerSDK();
  return await sdk.getActivitiesByOrganization({ OrgId: organizationId });
};

/**
 * Retrigger emissions calculations for the specified filters
 *
 * Fetches task requests based on filters and triggers emission recalculation.
 * - Organization, Location, and Activity are mandatory
 * - Month and Year are optional
 * - If Month/Year are not provided, fetches ALL task requests for the location
 * - Pattern follows activity-data-removal implementation
 *
 * @param payload - The retrigger payload containing organizationId, locationId, activityId, and optionally month and year
 * @returns Response indicating success or failure
 */
export const retriggerEmissions = async (
  payload: RetriggerEmissionsPayload
): Promise<RetriggerEmissionsResponse> => {
  console.log("\n🔄 EMISSION RETRIGGER STARTED");
  console.log("📦 Payload:", payload);
  
  try {
    const sdk = await getGraphQlServerSDK();
    
    // Build the where condition for TaskRequest query (following activity-data-removal pattern)
    const whereCondition: any = {
      organization_address_id: { _eq: payload.locationId },
      is_deleted: { _eq: false },
    };

    // Add month condition if provided
    if (payload.month) {
      whereCondition.month = { _eq: payload.month };
      console.log("📅 Filtering by month:", payload.month);
    }

    // Add year condition if provided
    if (payload.year) {
      whereCondition.year = { _eq: payload.year };
      console.log("📆 Filtering by year:", payload.year);
    }

    if (!payload.month && !payload.year) {
      console.log("⚠️  No month/year filter - fetching ALL task requests for location");
    }

    console.log("🔍 Where condition:", JSON.stringify(whereCondition, null, 2));

    // Fetch task requests based on the conditions (same pattern as activity-data-removal)
    const taskRequestsData = await sdk.getTaskRequestbycondition({
      where: whereCondition,
    });

    const taskRequests = taskRequestsData?.TaskRequest || [];
    console.log(`✅ Found ${taskRequests.length} task request(s)`);

    // Extract task request IDs
    const taskRequestIds = taskRequests
      .map((taskRequest) => taskRequest?.id)
      .filter(Boolean) as string[];

    console.log("📋 Task Request IDs:", taskRequestIds.join(", "));

    // Check if any task requests were found
    if (!taskRequestIds.length) {
      console.log("⚠️  No task requests found for criteria");
      return {
        success: false,
        message: "No task requests found for the selected criteria. Please verify the filters and try again.",
        data: {
          payload,
          taskRequests: [],
          taskRequestIds: [],
        },
      };
    }

    console.log(`⚡ Calling emission calculation for activity: ${payload.activityId}`);
    console.log(`🏢 Organization ID: ${payload.organizationId}`);
    console.log(`📊 Processing ${taskRequestIds.length} task request(s)`);

    // Call the emission calculation service (same as activity-data-removal does after deletion)
    await calculateEmission(
      payload.organizationId,
      payload.activityId as TActivityCodes,
      taskRequestIds
    );

    const response: any = await saveEmissionDashboard(
        taskRequestIds,
        payload.organizationId
      );
    console.log("✅ Emission calculation completed successfully");

    return {
      success: true,
      message: `Emission retrigger completed successfully for ${payload.activityId}. Processed ${taskRequestIds.length} month year combination(s).`,
      data: {
        payload,
        taskRequests,
        taskRequestIds,
      },
    };
  } catch (error) {
    console.error("❌ ERROR in retriggerEmissions:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to retrigger emissions. Please try again.",
      data: null,
    };
  }
};
