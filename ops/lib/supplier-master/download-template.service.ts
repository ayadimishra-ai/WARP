import { getGraphQlServerSDK } from "~/graphql/server";

/**
 * Generic function to get template download URL for any activity code
 * @param activityCode - The activity code (e.g., 'material_master', 'supplier_details', 'waste_master')
 * @returns Object containing the download URL
 */
export async function GetActivityTemplateDownloadUrl(activityCode: string) {
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
