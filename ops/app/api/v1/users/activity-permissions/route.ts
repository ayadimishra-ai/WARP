import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { getUserRole } from "~/lib/op-database/op-service.server";
import { OPSOrgRole } from "~/lib/op-database/types";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import {
  excludeArray,
  excludeONLActivities,
} from "~/lib/shared/constants/dataimporthistory.constant";
import { WasteWaterTreatmentActivityConstant } from "~/shared/constants/activity.constant";
interface Location {
  id: string;
  label: string;
  value: string;
  type: string;
  locationCode: string;
  is_AI_enabled?: boolean;
}
interface ActivityMapping {
  main_activity: string;
  sub_activity: string;
  template_link: string;
  label: string;
  locations: Location[];
  is_AI_enabled?: boolean;
}

function getBuyerShareDownloadUrl(
  download_link: string,
  buyerShareMethod: any
) {
  let file = "";
  switch (buyerShareMethod) {
    case "by_volume":
      file = "/MonthlyBuyerShareAllocationByVolume.xlsx";
      break;
    case "by_revenue":
      file = "/MonthlyBuyerShareAllocationByRevenue.xlsx";
      break;
    case "by_number_of_units":
      file = "/MonthlyBuyerShareAllocationByUnits.xlsx";
      break;
    default:
      file = "/MonthlyBuyerShareAllocationByMass.xlsx";
      break;
  }
  return download_link + file;
}
function buildMainActivityData(mainActivityData: any) {
  const activitiesArray: {
    main_activity: string;
    sub_activity: string;
    label: string;
    template_link: string;
    is_AI_enabled?: boolean;
  }[] = [];

  mainActivityData?.forEach((mapping: any) => {
    // Check if the main activity has sub-activities
    if (mapping.Activity.Activities && mapping.Activity.Activities.length > 0) {
      mapping.Activity.Activities.forEach((subActivity: any) => {
        activitiesArray.push({
          main_activity: mapping?.Activity?.code,
          sub_activity: subActivity?.code,
          label: subActivity?.name,
          template_link: subActivity?.metadata?.download_url_template || "",
          is_AI_enabled: subActivity?.is_AI_enabled,
        });
      });
    } else {
      activitiesArray.push({
        main_activity: mapping?.Activity?.code,
        sub_activity: mapping?.Activity?.code,
        label: mapping?.Activity?.name || "",
        template_link:
          mapping?.Activity?.code === "buyer_share"
            ? getBuyerShareDownloadUrl(
                mapping?.Activity?.metadata?.download_url_template,
                mapping?.Organization?.metadata[0]?.BuyerShareMethod
              )
            : mapping?.Activity?.metadata?.download_url_template || "",
      });
    }
  });
  return activitiesArray;
}

function buildTemplate(
  role: keyof typeof OPSOrgRole,
  activityData: any[],
  activitiesArray: {
    main_activity: string;
    sub_activity: string;
    label: string;
    template_link: string;
    is_AI_enabled?: boolean;
  }[]
): ActivityMapping[] {
  const activityMap: { [key: string]: { [key: string]: Location[] } } = {};

  activityData.forEach((mapping: any) => {
    const { activities, OrganizationAddress } = mapping;

    if (!OrganizationAddress || !OrganizationAddress.Address) return;

    const locationId = OrganizationAddress.id;
    const locationName = OrganizationAddress.Address.name;
    const locationCode = OrganizationAddress.Address.client_master_id;
    const ownerShipType = OrganizationAddress.Address.type;
    const isONL = ownerShipType !== "Manufacturing";
    const iswwtp = mapping.Organization.hasWasteWaterTreatmentPlant;

    activities.forEach((activity: any) => {
      const matchedActivities = activitiesArray.filter(
        (item) => item.main_activity === activity
      );

      matchedActivities.forEach((matchedActivity) => {
        const { main_activity, sub_activity, is_AI_enabled } = matchedActivity;

        if (!activityMap[main_activity]) {
          activityMap[main_activity] = {};
        }
        if (!activityMap[main_activity][sub_activity]) {
          activityMap[main_activity][sub_activity] = [];
        }

        if (!(isONL && excludeONLActivities.includes(sub_activity))) {
          // Only add locations where is_wwtp is not 'no'
          if (
            iswwtp === false &&
            WasteWaterTreatmentActivityConstant.code === sub_activity
          ) {
          } else if (
            OrganizationAddress.Address.is_wwtp === "no" &&
            iswwtp === true &&
            WasteWaterTreatmentActivityConstant.code === sub_activity
          ) {
          } else {
            activityMap[main_activity][sub_activity].push({
              id: locationId,
              label: locationName,
              locationCode: locationCode,
              value: locationId,
              type: ownerShipType,
              is_AI_enabled: is_AI_enabled,
            });
          }
        }
      });
    });
  });

  const result: ActivityMapping[] = [];

  Object.keys(activityMap).forEach((main_activity) => {
    Object.keys(activityMap[main_activity]).forEach((sub_activity) => {
      const matchedActivity = activitiesArray.find(
        (item) =>
          item.main_activity === main_activity &&
          item.sub_activity === sub_activity
      );
      if (!(role === "SUPPLIER" && excludeArray.includes(sub_activity))) {
        result.push({
          main_activity,
          sub_activity,
          template_link: matchedActivity ? matchedActivity.template_link : "",
          label: matchedActivity ? matchedActivity.label : "",
          locations: activityMap[main_activity][sub_activity],
          is_AI_enabled: matchedActivity?.is_AI_enabled,
        });
      }
    });
  });

  return result;
}

function appendMissingActivities(
  role: keyof typeof OPSOrgRole,
  response: ActivityMapping[],
  activitiesArray: {
    main_activity: string;
    sub_activity: string;
    label: string;
    template_link: string;
    is_AI_enabled?: boolean;
  }[]
): ActivityMapping[] {
  const existingKeys = new Set(
    response.map((item) => `${item.main_activity}::${item.sub_activity}`)
  );

  const seenMissingKeys = new Set<string>();
  const missing = activitiesArray
    .filter((item) => {
      const key = `${item.main_activity}::${item.sub_activity}`;
      return (
        !existingKeys.has(key) &&
        !seenMissingKeys.has(key) &&
        !(role === "SUPPLIER" && excludeArray.includes(item.sub_activity))
      );
    })
    .map((item) => {
      const key = `${item.main_activity}::${item.sub_activity}`;
      seenMissingKeys.add(key);
      return {
        main_activity: item.main_activity,
        sub_activity: item.sub_activity,
        template_link: item.template_link,
        label: item.label,
        locations: [],
        is_AI_enabled: item.is_AI_enabled,
      };
    });

  return [...response, ...missing];
}

async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const isMasterActivityRequired =
      typeof body?.isMasterActivityRequired === "boolean"
        ? body.isMasterActivityRequired
        : String(body?.isMasterActivityRequired).toLowerCase() === "true";
    const orgId = String(body.organizationId);
    const userId = String(body.userId);
    const isPCFActivity =
      typeof body?.isPCFActivity === "boolean"
        ? body.isPCFActivity
        : String(body?.isPCFActivity).toLowerCase() === "true";

    // Validate that orgId is a string (UUID)
    if (typeof orgId !== "string") {
      return NextResponse.json(
        { error: "Invalid organization ID format." },
        { status: 400 }
      );
    }

    // Get the server SDK
    const sdk = await getGraphQlServerSDK();

    const activitiesByOrganization: any = await sdk.getActivitiesByOrganization(
      {
        OrgId: orgId,
      }
    );
    const allActivities = await sdk.getAllActivities();
    const masterActivities = await sdk.getMasterActivities();
    const filteredActivities = allActivities?.Activity?.filter(
      (activity: any) => {
        return (
          activity?.metadata?.download_url_template &&
          activity?.is_master === false
        );
      }
    );

    const masterActivityMappings = (masterActivities?.Activity || []).map(
      (activity: any) => ({
        Activity: activity,
        Organization: { metadata: [] },
      })
    );

    const mainActivity: any =
      isMasterActivityRequired === true
        ? buildMainActivityData(masterActivityMappings)
        : buildMainActivityData(
            activitiesByOrganization?.OrganizationActivityMapping || []
          );

    // Fetch mapped activities
    const locationsByOrganization: any =
      await sdk.getOrganizationAddressAndActivityMapping({
        userId: userId,
      });

    const role = (await getUserRole(orgId)) as keyof typeof OPSOrgRole;
    const response = buildTemplate(
      role,
      locationsByOrganization?.UserOrganizationAddressMapping || [],
      mainActivity
    );

    let hasPCFActivity = false;
    if (isPCFActivity) {
      const checkOrg = await sdk.CheckOrgForBuyerSupplierFeatures({
        orgId: orgId,
      });
      if (checkOrg?.BuyerSupplierMappings?.length) {
        if (checkOrg.BuyerSupplierMappings[0].buyerOrgid === orgId) {
          //role = "BUYER";
          const buyerFeaturesResponse = await sdk.GetBuyerFeatures({
            orgId: orgId,
          });
          const data = buyerFeaturesResponse.BuyerSupplierMappings;

          const hasPCF = data.some((mapping) =>
            mapping.Organization?.OrgSupplierMasters?.some((master) =>
              master.buyer_features?.includes("pcf")
            )
          );
          hasPCFActivity = hasPCF;
        } else if (
          checkOrg.BuyerSupplierMappings.filter(
            (mapping) => mapping.supplierOrgid === orgId
          ).length > 0
        ) {
          //role = "SUPPLIER";
          const buyerOrgIds =
            checkOrg.BuyerSupplierMappings?.filter(
              (m) => m.supplierOrgid === orgId
            )?.map((m) => m.buyerOrgid) || [];

          const supplierAddressCodes = await sdk.GetSupplierAddressMappings({
            orgId,
          });

          const supplierLocationCodes: string[] =
            supplierAddressCodes.Organization?.flatMap((org) =>
              org.OrganizationAddresses?.map((addr) => addr.Address?.code)
            ).filter((code): code is string => Boolean(code)) ?? [];

          const supplierFeaturesResponse = await sdk.getSupplierFeatures({
            Code: supplierLocationCodes,
            buyerOrgId: buyerOrgIds,
          });

          const hasPCF = supplierFeaturesResponse.OrgSupplierMaster.some(
            (master) => master.buyer_features?.includes("pcf")
          );
          hasPCFActivity = hasPCF;
        }
      }
    }

    const finalResponse = appendMissingActivities(role, response, mainActivity);

    return NextResponse.json({
      success: true,
      data: isMasterActivityRequired ? finalResponse : response,
      allActivities: filteredActivities || [],
      PCF: hasPCFActivity,
    });
  } catch (error) {
    console.error("Error in postHandler:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
