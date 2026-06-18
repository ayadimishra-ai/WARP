import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";

export async function GetSupplierLocationMasterTemplateUrl() {
  try {
    const sdk = await getGraphQlServerSDK();
    const res = await sdk.getActivitybycode({
      activitycode: ["supplier_location_master"],
    });
    const url = res?.Activity?.[0]?.metadata?.download_url_template;

    // Return download URL
    return { url: url };
  } catch (error) {
    console.error(
      "Error fetching supplier location master template URL:",
      error
    );
    return { url: null };
  }
}
