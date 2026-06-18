import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";

export async function GetSupplierMaterialMappingTemplateUrl() {
  try {
    const sdk = await getGraphQlServerSDK();
    const res = await sdk.getActivitybycode({
      activitycode: ["supplier_material_mapping"],
    });
    const url = res?.Activity?.[0]?.metadata?.download_url_template;

    // Return download URL
    return { url: url };
  } catch (error) {
    console.error(
      "Error fetching supplier material mapping template URL:",
      error
    );
    return { url: null };
  }
}
