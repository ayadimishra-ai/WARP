"use server";

import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { BuyerSupplierAddressMappings } from "@/modules/ghg/graphql/shared/types";
import { getAssociatedBuyerBySupplierAddressId } from "@/modules/ghg/lib/op-database/op-service.server";
import {
  buyerShareMethod,
  LocationDetails,
} from "@/modules/ghg/shared/constants/supplier-flow.constant";
import { buyerUpstreamDataType } from "../activity-data-records/types";
import { ResultType } from "./types";
export const getBuyerShareData = async (addressDetails: LocationDetails[]) => {
  const result: ResultType[] = [];
  const buyerUpstream: buyerUpstreamDataType[] = [];
  try {
    const sdk = await getGraphQlServerSDK();
    const buyers = (await getAssociatedBuyerBySupplierAddressId(
      addressDetails
    )) as BuyerSupplierAddressMappings[];
    // const Suppliersdk = await getGraphQlServerSDK();
    // const SupplierAddressData = (await Suppliersdk.getAddressDetail({
    //   organisationAddressId: SupplierOrganzationAddressId,
    // })) as SupplierAddressDataType;
    const SupplierAddressMapping = await sdk.GetSupplierAddressMapping({
      id: buyers.map((item) => item?.supplierOrgAddresId),
    });
    for (let k = 0; k < addressDetails.length; k++) {
      for (let i = 0; i < buyers.length; i++) {
        if (
          !!SupplierAddressMapping &&
          SupplierAddressMapping?.SupplierAddressMapping.filter(
            (data) => data?.id == buyers[i].supplierOrgAddresId
          ).length > 0
        ) {
          if (
            !buyerUpstream.find(
              (item) => item.buyer_org_id == buyers[i].buyerOrgid
            )
          ) {
            try {
              if (
                !result.find((buyer: any) => buyer.id == buyers[i].buyerOrgid)
              ) {
                const monthlyActivityData = await sdk.getbuyerShareDetails({
                  Buyer_Name: String(buyers[i].Organization?.name),
                  organizationAddressId: addressDetails[k].organizationaddress,
                  month: addressDetails[k].month,
                  year: Number(addressDetails[k].year),
                  organizationId: addressDetails[k].OrganizationId,
                });
                let allocationPercentage: number = 0;
                if (
                  !!monthlyActivityData &&
                  !!monthlyActivityData.TaskRequest.length &&
                  monthlyActivityData.TaskRequest[0]?.GHGBuyer_Shares.length
                ) {
                  const buyersharedata =
                    monthlyActivityData.TaskRequest[0]?.GHGBuyer_Shares.filter(
                      (items) =>
                        items.method ==
                        monthlyActivityData.Organization[0]?.metadata[0]
                          ?.BuyerShareMethod
                    );
                  if (buyersharedata.length > 0) {
                    switch (
                      monthlyActivityData.Organization[0]?.metadata[0]
                        ?.BuyerShareMethod
                    ) {
                      case buyerShareMethod.by_mass:
                        if (
                          buyersharedata[0]
                            ?.by_mass_Total_Mass_of_Products_Produced > 0
                        ) {
                          allocationPercentage =
                            (buyersharedata[0]
                              ?.by_mass_Mass_of_Products_Purchased /
                              buyersharedata[0]
                                ?.by_mass_Total_Mass_of_Products_Produced) *
                            100;
                        }
                        break;
                      case buyerShareMethod.by_number_of_units:
                        if (
                          buyersharedata[0]
                            ?.by_number_of_units_Total_Number_of_Units_Produced >
                          0
                        ) {
                          allocationPercentage =
                            (buyersharedata[0]
                              ?.by_number_of_units_Number_of_Units_Purchased /
                              buyersharedata[0]
                                ?.by_number_of_units_Total_Number_of_Units_Produced) *
                            100;
                        }
                        break;
                      case buyerShareMethod.by_revenue:
                        if (
                          buyersharedata[0]
                            ?.by_revenue_Total_Market_Value_of_Products_Produced >
                          0
                        ) {
                          allocationPercentage =
                            (buyersharedata[0]
                              ?.by_revenue_Market_Value_of_Products_Purchased /
                              buyersharedata[0]
                                ?.by_revenue_Total_Market_Value_of_Products_Produced) *
                            100;
                        }
                        break;
                      case buyerShareMethod.by_volume:
                        if (
                          buyersharedata[0]
                            ?.by_volume_Total_Volume_of_Products_Purchased > 0
                        ) {
                          allocationPercentage =
                            (buyersharedata[0]
                              ?.by_volume_Volume_of_Products_Purchased /
                              buyersharedata[0]
                                ?.by_volume_Total_Volume_of_Products_Purchased) *
                            100;
                        }
                        break;
                    }
                  }
                }
                result.push({
                  id: buyers[i].buyerOrgid,
                  name: String(buyers[i].Organization?.name) || "",
                  allocation_percentage: allocationPercentage,
                  status:
                    monthlyActivityData?.TaskRequest[0]?.GHGBuyer_Shares
                      .length > 0
                      ? ""
                      : "pending",
                });
              }
              // }
            } catch (err) {
              console.log("error in fetching upstream data", err);
            }
          }
        }
      }
    }
    return result;
  } catch (error) {
    console.error("Error fetching in buyers details:", error);
    return null;
  }
};
