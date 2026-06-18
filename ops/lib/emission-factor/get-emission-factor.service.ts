import { getGraphQlServerSDK } from "~/graphql/server";

export const getEmissionFactorsForDownload = async (organizationId: string) => {
  let finalEmissionFactorsData: any[] = [];
  try {
    const sdk = await getGraphQlServerSDK();

    //fetch data from organizations instance DB
    const emissionFactorsFromOrgInstance =
      await sdk.getCO2EmissionFactorsData();

    // Enable this code if you want keys as columns in metadata field..
    // finalEmissionFactorsData = combinedData.map((item: any) => {
    //   if (item.metadata && Array.isArray(item.metadata)) {
    //     item.metadata.forEach((meta: any) => {
    //       for (const [key, value] of Object.entries(meta)) {
    //         item[key] = value || "";
    //       }
    //     });
    //   }
    //   delete item.metadata;
    //   return item;
    // });

    return (finalEmissionFactorsData =
      emissionFactorsFromOrgInstance?.CO2EmissionFactorMaster);
  } catch (err) {
    console.log("Error : ", err);
  }
};
