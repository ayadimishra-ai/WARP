import { getGraphQlServerSDK } from "~/graphql/server";

export const Buyersuppliermappingsdata = async (
  Organizationid: string,
  buyerorgid: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();
    const response = await sdk.GetBuyerSupplierMappingData({
      where: {
        buyerOrgid: { _eq: buyerorgid },
        supplierOrgid: { _eq: Organizationid },
      },
    });
    return response.BuyerSupplierMappings.length > 0 ? true : false;
  } catch (error) {}
};
