import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";

/**
 * Helper function to get buyer share download URL based on buyer share method
 * @param download_link - Base download URL template
 * @param buyerShareMethod - Method type (by_volume, by_revenue, by_number_of_units, by_mass)
 * @returns Complete download URL with appropriate file appended
 */
function getBuyerShareDownloadUrl(
  download_link: string,
  buyerShareMethod: string
): string {
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

/**
 * Generic function to get template download URL for any activity code
 * @param activityCode - The activity code (e.g., 'material_master', 'supplier_details', 'waste_master', 'buyer_share')
 * @param organizationId - Optional organization ID (required for buyer_share to determine correct template)
 * @returns Object containing the download URL
 */
export async function GetActivityTemplateDownloadUrl(
  activityCode: string,
  organizationId?: string
) {
  try {
    const sdk = await getGraphQlServerSDK();
    const res = await sdk.getActivitybycode({
      activitycode: [activityCode],
    });
    let url = res?.Activity?.[0]?.metadata?.download_url_template;

    // Special handling for buyer_share activity
    if (activityCode === "buyer_share" && url && organizationId) {
      // Fetch organization metadata to get BuyerShareMethod
      const orgRes = await sdk.getActivitiesByOrganization({
        OrgId: organizationId,
      });
      
      // Extract buyer share method from organization metadata
      const buyerShareMethod =
        orgRes?.OrganizationActivityMapping?.[0]?.Organization?.metadata?.[0]
          ?.BuyerShareMethod || "by_mass";
      
      // Append the correct file based on buyer share method
      url = getBuyerShareDownloadUrl(url, buyerShareMethod);
    }

    // Return download URL or S3 result
    return { url: url };
  } catch (error) {
    console.error(`Error downloading template for ${activityCode}:`, error);
    return { url: null };
  }
}

export async function GetActivityTemplateByCode(activityCode: string) {
  try {
    const sdk = await getGraphQlServerSDK();
    const res = await sdk.getActivitybycode({
      activitycode: [activityCode],
    });
    const url = res?.Activity?.[0]?.metadata?.download_url_template;

    // Return download URL or S3 result
    return { url: url };
  } catch (error) {
    console.error(`Error downloading template for ${activityCode}:`, error);
    return { url: null };
  }
}
// Legacy function name for backward compatibility
export async function GetActivityByCode(
  activityCode: string = "supplier_details"
) {
  return GetActivityTemplateDownloadUrl(activityCode);
}
