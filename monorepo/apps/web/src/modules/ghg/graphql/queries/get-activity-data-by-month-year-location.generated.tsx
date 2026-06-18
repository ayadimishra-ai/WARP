import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActivityDataByMonthYearLocationQueryVariables = Types.Exact<{
  Month?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  year?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  orgAddressId?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
}>;

export type GetActivityDataByMonthYearLocationQuery = {
  __typename?: "query_root";
  TaskRequest: Array<{
    __typename?: "TaskRequest";
    month: string;
    year?: number | null;
    id: any;
    OrganizationAddress: {
      __typename?: "OrganizationAddress";
      Address: {
        __typename?: "Addresses";
        Country?: {
          __typename?: "Country";
          region_code?: string | null;
        } | null;
      };
    };
    GHGWastes: Array<{
      __typename?: "GHGWaste";
      id: any;
      Disposal_Mechanism?: string | null;
      Name_of_Third_Party?: string | null;
      Waste_Disposal_Managed_by?: string | null;
      Who_Managed_Transportation_of_Waste?: string | null;
    }>;
    GHGTransport_Upstreams: Array<{
      __typename?: "GHGTransport_Upstream";
      id: any;
      Material_Procured?: string | null;
      Material_ID?: string | null;
      Supplier_code?: string | null;
      Supplier_Status?: string | null;
    }>;
    GHGTransport_Downstreams: Array<{
      __typename?: "GHGTransport_Downstream";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
      Which_Products?: string | null;
      Which_SKUs?: string | null;
      Destination_Location_Name?: string | null;
      Destination_pin_or_zip_code?: string | null;
    }>;
    GHGTransport_BusinessTravels: Array<{
      __typename?: "GHGTransport_BusinessTravel";
      id: any;
      Fuel_Used?: string | null;
      Trip_From_Country?: string | null;
      Trip_From_Pincode?: string | null;
      Trip_To_Country?: string | null;
      Trip_To_Pincode?: string | null;
      Trip_Distance?: any | null;
      Mode_of_Transport?: string | null;
    }>;
    GHGTransport_EmployeeTravels: Array<{
      __typename?: "GHGTransport_EmployeeTravel";
      id: any;
      PercOfEmp_TravBy_RailSuburban?: any | null;
      PercOfEmp_TravBy_CompOwned_Bus?: any | null;
      PercOfEmp_TravBy_PvtVehicle_2Wheeler?: any | null;
      PercOfEmp_TravBy_PvtVehicle_4Wheeler?: any | null;
    }>;
    GHGEnergy_CaptivePowers: Array<{
      __typename?: "GHGEnergy_CaptivePower";
      id: any;
      Type_of_Captive_Power?: string | null;
      GHGEnergy_CaptivePower_Renewables: Array<{
        __typename?: "GHGEnergy_CaptivePower_Renewable";
        id: any;
        Type_of_Technology_Used?: string | null;
        Unit_of_Energy_Generated_in_Kwh?: any | null;
        Year_of_installation?: number | null;
      }>;
      GHGEnergy_CaptivePower_NonRenewables: Array<{
        __typename?: "GHGEnergy_CaptivePower_NonRenewable";
        id: any;
        Type_of_Fuel_Used?: string | null;
        Unit_of_Energy_Generated_in_Kwh?: any | null;
        Quantity_of_fuel_consumed_uom?: string | null;
      }>;
    }>;
    GHGEnergyConsumption_FuelPurchased_Transportations: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_Transportation";
      id: any;
      Transportation_Type: string;
      Distance_travelled?: any | null;
      Type_of_Fuel_Purchased?: string | null;
      Quantity_of_fuel_purchased: any;
      Vehicle_Type_Used_for_Road_Transport?: string | null;
    }>;
    GHGEnergyConsumption_FuelPurchaseds: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased";
      GHGEnergyConsumption_FuelPurchased_Generals: Array<{
        __typename?: "GHGEnergyConsumption_FuelPurchased_General";
        id: any;
        Type_of_Fuel_Purchased?: string | null;
        Quantity_of_fuel_Consumed?: any | null;
        Quantity_of_fuel_Consumed_uom?: string | null;
        Quality_of_fuel?: any | null;
      }>;
      GHGEnergyConsumption_FuelPurchased_Auxiliaries: Array<{
        __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary";
        id: any;
        Type_of_Auxiliary_Fuel_Purchased?: string | null;
        Quantity_of_fuel_consumed?: any | null;
        Quantity_of_fuel_consumed_uom?: string | null;
        Used_for_Which_SKUs?: string | null;
      }>;
      GHGEnergyConsumption_FuelPurchased_HeatingWaters: Array<{
        __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater";
        id: any;
        Type_of_Fuel_Purchased?: string | null;
        Quality_of_fuel?: any | null;
        Quantity_of_fuel_consumed?: any | null;
        Quantity_of_fuel_consumed_uom?: string | null;
        Used_for_Which_SKUs?: string | null;
      }>;
    }>;
    GHGEnergyConsumption_GridPowers: Array<{
      __typename?: "GHGEnergyConsumption_GridPower";
      id: any;
      Name_of_Distribution_Company?: string | null;
      PowerConsumed_through_Grid_Kwh?: any | null;
      PowerPurchased_through_PPA_Kwh_Renewable?: any | null;
      NameOfCompany_PPA_Renewable?: string | null;
      PowerPurchased_through_PPA_Kwh_NonRenewable?: any | null;
      NameOfCompany_PPA_NonRenewable?: string | null;
      PowerPurchased_through_REC_Kwh?: any | null;
      Name_of_company_for_REC?: string | null;
    }>;
  }>;
};

export const GetActivityDataByMonthYearLocationDocument = gql`
  query getActivityDataByMonthYearLocation(
    $Month: String
    $year: Int
    $orgAddressId: uuid
  ) {
    TaskRequest(
      where: {
        _and: [
          { year: { _eq: $year } }
          { month: { _eq: $Month } }
          { organization_address_id: { _eq: $orgAddressId } }
        ]
      }
    ) {
      month
      year
      id
      OrganizationAddress {
        Address {
          Country {
            region_code
          }
        }
      }
      GHGWastes {
        id
        Disposal_Mechanism
        Name_of_Third_Party
        Waste_Disposal_Managed_by
        Who_Managed_Transportation_of_Waste
      }
      GHGTransport_Upstreams {
        id
        Material_Procured
        Material_ID
        Supplier_code
        Supplier_Status
      }
      GHGTransport_Downstreams {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
        Which_Products
        Which_SKUs
        Destination_Location_Name
        Destination_pin_or_zip_code
      }
      GHGTransport_BusinessTravels {
        id
        Fuel_Used
        Trip_From_Country
        Trip_From_Pincode
        Trip_To_Country
        Trip_To_Pincode
        Trip_Distance
        Mode_of_Transport
      }
      GHGTransport_EmployeeTravels {
        id
        PercOfEmp_TravBy_RailSuburban
        PercOfEmp_TravBy_CompOwned_Bus
        PercOfEmp_TravBy_PvtVehicle_2Wheeler
        PercOfEmp_TravBy_PvtVehicle_4Wheeler
      }
      GHGEnergy_CaptivePowers {
        id
        Type_of_Captive_Power
        GHGEnergy_CaptivePower_Renewables {
          id
          Type_of_Technology_Used
          Unit_of_Energy_Generated_in_Kwh
          Year_of_installation
        }
        GHGEnergy_CaptivePower_NonRenewables {
          id
          Type_of_Fuel_Used
          Unit_of_Energy_Generated_in_Kwh
          Quantity_of_fuel_consumed_uom
        }
      }
      GHGEnergyConsumption_FuelPurchased_Transportations {
        id
        Transportation_Type
        Distance_travelled
        Type_of_Fuel_Purchased
        Quantity_of_fuel_purchased
        Vehicle_Type_Used_for_Road_Transport
      }
      GHGEnergyConsumption_FuelPurchaseds {
        GHGEnergyConsumption_FuelPurchased_Generals {
          id
          Type_of_Fuel_Purchased
          Quantity_of_fuel_Consumed
          Quantity_of_fuel_Consumed_uom
          Quality_of_fuel
        }
        GHGEnergyConsumption_FuelPurchased_Auxiliaries {
          id
          Type_of_Auxiliary_Fuel_Purchased
          Quantity_of_fuel_consumed
          Quantity_of_fuel_consumed_uom
          Used_for_Which_SKUs
        }
        GHGEnergyConsumption_FuelPurchased_HeatingWaters {
          id
          Type_of_Fuel_Purchased
          Quality_of_fuel
          Quantity_of_fuel_consumed
          Quantity_of_fuel_consumed_uom
          Used_for_Which_SKUs
        }
      }
      GHGEnergyConsumption_GridPowers {
        id
        Name_of_Distribution_Company
        PowerConsumed_through_Grid_Kwh
        PowerPurchased_through_PPA_Kwh_Renewable
        NameOfCompany_PPA_Renewable
        PowerPurchased_through_PPA_Kwh_NonRenewable
        NameOfCompany_PPA_NonRenewable
        PowerPurchased_through_REC_Kwh
        Name_of_company_for_REC
      }
    }
  }
`;

/**
 * __useGetActivityDataByMonthYearLocationQuery__
 *
 * To run a query within a React component, call `useGetActivityDataByMonthYearLocationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityDataByMonthYearLocationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityDataByMonthYearLocationQuery({
 *   variables: {
 *      Month: // value for 'Month'
 *      year: // value for 'year'
 *      orgAddressId: // value for 'orgAddressId'
 *   },
 * });
 */
export function useGetActivityDataByMonthYearLocationQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetActivityDataByMonthYearLocationQuery,
    GetActivityDataByMonthYearLocationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActivityDataByMonthYearLocationQuery,
    GetActivityDataByMonthYearLocationQueryVariables
  >(GetActivityDataByMonthYearLocationDocument, options);
}
export function useGetActivityDataByMonthYearLocationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActivityDataByMonthYearLocationQuery,
    GetActivityDataByMonthYearLocationQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActivityDataByMonthYearLocationQuery,
    GetActivityDataByMonthYearLocationQueryVariables
  >(GetActivityDataByMonthYearLocationDocument, options);
}
// @ts-ignore
export function useGetActivityDataByMonthYearLocationSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActivityDataByMonthYearLocationQuery,
    GetActivityDataByMonthYearLocationQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActivityDataByMonthYearLocationQuery,
  GetActivityDataByMonthYearLocationQueryVariables
>;
export function useGetActivityDataByMonthYearLocationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataByMonthYearLocationQuery,
        GetActivityDataByMonthYearLocationQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActivityDataByMonthYearLocationQuery | undefined,
  GetActivityDataByMonthYearLocationQueryVariables
>;
export function useGetActivityDataByMonthYearLocationSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActivityDataByMonthYearLocationQuery,
        GetActivityDataByMonthYearLocationQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActivityDataByMonthYearLocationQuery,
    GetActivityDataByMonthYearLocationQueryVariables
  >(GetActivityDataByMonthYearLocationDocument, options);
}
export type GetActivityDataByMonthYearLocationQueryHookResult = ReturnType<
  typeof useGetActivityDataByMonthYearLocationQuery
>;
export type GetActivityDataByMonthYearLocationLazyQueryHookResult = ReturnType<
  typeof useGetActivityDataByMonthYearLocationLazyQuery
>;
export type GetActivityDataByMonthYearLocationSuspenseQueryHookResult =
  ReturnType<typeof useGetActivityDataByMonthYearLocationSuspenseQuery>;
export type GetActivityDataByMonthYearLocationQueryResult = Apollo.QueryResult<
  GetActivityDataByMonthYearLocationQuery,
  GetActivityDataByMonthYearLocationQueryVariables
>;
