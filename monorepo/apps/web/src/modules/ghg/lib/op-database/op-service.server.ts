import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { BuyerSupplierAddressMappings } from "@/modules/ghg/graphql/shared/types";
import { LocationDetails } from "@/modules/ghg/shared/constants/supplier-flow.constant";
import { GlobalMasterKeys, OPSOrgRole, companymappingList } from "./types";

export const getAssociatedBuyerBySupplierAddressId = async (
  addressDetails: LocationDetails[]
) => {
  try {
    const SuplierOrganizationId = addressDetails
      ?.map((item: any) => item.OrganizationId)
      .filter(
        (item: any, index: number, self: any) =>
          index === self.findIndex((t: any) => t === item)
      );
    const whereCondition: Record<string, any>[] = [];
    SuplierOrganizationId?.forEach((item: string) => {
      const supplierOrgAddress = addressDetails
        .filter((items) => items.OrganizationId == item)
        .map((items: any) => items.organizationaddress)
        .filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t === item)
        );
      if (supplierOrgAddress.length > 0) {
        supplierOrgAddress.forEach((items) => {
          whereCondition.push({
            _and: {
              supplierOrgid: { _eq: item },
              BuyerSupplierAddresId: {
                _eq: items,
              },
            },
          });
        });
      }
    });
    const sdk = await getGraphQlServerSDK();
    const BuyerSupplierAddressMappings =
      await sdk.GetBuyerSupplierAddressMappingData({
        where: { _or: whereCondition },
      });
    return BuyerSupplierAddressMappings?.BuyerSupplierAddressMappings || [];
  } catch (error) {
    console.error(
      "Error fetching buyerSupplierAddressMappings details:",
      error
    );

    return [];
  }
};

export const getModuleGlobalConfig = async () => {
  try {
    const sdk = await getGraphQlServerSDK();
    const res = await sdk.getAppGlobalMasterDetailsByType({
      key: GlobalMasterKeys?.KpiDescriptionDashboardKey,
    });
    return res;
  } catch (error) {
    console.error("Error fetching OP Get Module Emission Factor:", error);
    return { GlobalConfigs: [] };
  }
};

export const getUserRole = async (organizationId: string) => {
  try {
    const sdk = await getGraphQlServerSDK();
    const buyerSupplierRoleDetails = await sdk.getBuyerSupplierRole({
      organizationId: organizationId,
    });
    let role: String = "";
    if (
      buyerSupplierRoleDetails?.buyerOrgList?.length > 0 &&
      buyerSupplierRoleDetails?.supplierOrgList?.length === 0
    ) {
      role = OPSOrgRole?.SUPPLIER;
    } else if (
      buyerSupplierRoleDetails?.buyerOrgList?.length === 0 &&
      buyerSupplierRoleDetails?.supplierOrgList?.length > 0
    ) {
      role = OPSOrgRole?.BUYER;
    } else {
      role = OPSOrgRole?.BUYERSUPPLIER;
    }
    return role;
  } catch (err) {
    console.log(err);
    return "";
  }
};

export const getUserCompanyListData = async (organizationId: string) => {
  try {
    const sdk = await getGraphQlServerSDK();
    const buyerSupplierRoleDetails = await sdk.getBuyerSupplierRole({
      organizationId: organizationId,
    });
    let companymappingList: companymappingList = {
      buyerOrg:
        buyerSupplierRoleDetails?.buyerOrgList as BuyerSupplierAddressMappings[],
      supplierOrg:
        buyerSupplierRoleDetails?.supplierOrgList as BuyerSupplierAddressMappings[],
    };
    return companymappingList;
  } catch (err) {
    console.log(err);
    return "";
  }
};
