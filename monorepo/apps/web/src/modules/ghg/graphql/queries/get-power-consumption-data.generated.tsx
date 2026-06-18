import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPowerConsumptionDataQueryVariables = Types.Exact<{
  task_request_id?: Types.InputMaybe<
    Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"]
  >;
}>;

export type GetPowerConsumptionDataQuery = {
  __typename?: "query_root";
  GHGEnergyConsumption_GridPower: Array<{
    __typename?: "GHGEnergyConsumption_GridPower";
    id: any;
    organization_address_id: any;
    task_request_id: any;
    activity_task_request_id: any;
    Name_of_Distribution_Company?: string | null;
    PowerConsumed_through_Grid_Kwh?: any | null;
    PowerPurchased_through_PPA_Kwh_Renewable?: any | null;
    NameOfCompany_PPA_Renewable?: string | null;
    PowerPurchased_through_PPA_Kwh_NonRenewable?: any | null;
    NameOfCompany_PPA_NonRenewable?: string | null;
    PowerPurchased_through_REC_Kwh?: any | null;
    Name_of_company_for_REC?: string | null;
    supporting_docs?: any | null;
    kpi_em_Emission_PowerPurchased_PPA_Renewable?: any | null;
    kpi_emf_Emission_PowerPurchased_PPA_Renewable?: any | null;
    kpi_em_Emission_PowerPurchased_REC?: any | null;
    kpi_emf_Emission_PowerPurchased_REC?: any | null;
    kpi_em_Emission_PowerPurchased_RenewableSources?: any | null;
    kpi_emf_Emission_PowerPurchased_RenewableSources?: any | null;
    kpi_em_Emission_PowerPurchased_NonRenewableSources?: any | null;
    kpi_emf_Emission_PowerPurchased_NonRenewableSources?: any | null;
    kpi_em_Emission_TotalPowerPurchased?: any | null;
    kpi_em_Emission_PowerPurchased_PPA_NonRenewable?: any | null;
    kpi_emf_Emission_PowerPurchased_PPA_NonRenewable?: any | null;
    created_at: any;
    updated_at: any;
    created_by?: any | null;
    updated_by?: any | null;
    metadata?: any | null;
    OrganizationAddress: {
      __typename?: "OrganizationAddress";
      Address: {
        __typename?: "Addresses";
        country_id?: any | null;
        Country?: {
          __typename?: "Country";
          region_code?: string | null;
        } | null;
      };
    };
    TaskRequest: {
      __typename?: "TaskRequest";
      year?: number | null;
      month: string;
    };
  }>;
  GHGEnergy_CaptivePower: Array<{
    __typename?: "GHGEnergy_CaptivePower";
    OrganizationAddress: {
      __typename?: "OrganizationAddress";
      Address: {
        __typename?: "Addresses";
        country_id?: any | null;
        Country?: {
          __typename?: "Country";
          region_code?: string | null;
        } | null;
      };
    };
    TaskRequest: {
      __typename?: "TaskRequest";
      year?: number | null;
      month: string;
    };
    GHGEnergy_CaptivePower_NonRenewables: Array<{
      __typename?: "GHGEnergy_CaptivePower_NonRenewable";
      id: any;
      GHGEnergyConsumption_CaptivePower_id: any;
      Type_of_Fuel_Used?: string | null;
      Quantity_of_fuel_consumed?: any | null;
      Quantity_of_fuel_consumed_uom?: string | null;
      Quality_of_fuel?: any | null;
      Unit_of_Energy_Generated_in_Kwh?: any | null;
      supporting_docs?: any | null;
      kpi_em_Emission_EnergyGenerated_kwh?: any | null;
      kpi_emf_Emission_EnergyGenerated_kwh?: any | null;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
    GHGEnergy_CaptivePower_Renewable_Fuels: Array<{
      __typename?: "GHGEnergy_CaptivePower_Renewable_Fuel";
      id: any;
      GHGEnergyConsumption_CaptivePower_id: any;
      Type_of_Fuel_Used?: string | null;
      Quantity_of_fuel_consumed?: any | null;
      Quantity_of_fuel_consumed_uom?: string | null;
      Quality_of_fuel?: any | null;
      Unit_of_Energy_Generated_in_Kwh?: any | null;
      supporting_docs?: any | null;
      kpi_em_Emission_EnergyGenerated_kwh?: any | null;
      kpi_emf_Emission_EnergyGenerated_kwh?: any | null;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
    GHGEnergy_CaptivePower_Renewables: Array<{
      __typename?: "GHGEnergy_CaptivePower_Renewable";
      id: any;
      GHGEnergyConsumption_CaptivePower_id: any;
      Type_of_Technology_Used?: string | null;
      Year_of_installation?: number | null;
      Unit_of_Energy_Generated_in_Kwh?: any | null;
      supporting_docs?: any | null;
      kpi_em_Emission_EnergyGenerated_kwh?: any | null;
      kpi_emf_Emission_EnergyGenerated_kwh?: any | null;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
    }>;
  }>;
};

export const GetPowerConsumptionDataDocument = gql`
  query getPowerConsumptionData($task_request_id: [uuid!]) {
    GHGEnergyConsumption_GridPower(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      OrganizationAddress {
        Address {
          country_id
          Country {
            region_code
          }
        }
      }
      TaskRequest {
        year
        month
      }
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Name_of_Distribution_Company
      PowerConsumed_through_Grid_Kwh
      PowerPurchased_through_PPA_Kwh_Renewable
      NameOfCompany_PPA_Renewable
      PowerPurchased_through_PPA_Kwh_NonRenewable
      NameOfCompany_PPA_NonRenewable
      PowerPurchased_through_REC_Kwh
      Name_of_company_for_REC
      supporting_docs
      kpi_em_Emission_PowerPurchased_PPA_Renewable
      kpi_emf_Emission_PowerPurchased_PPA_Renewable
      kpi_em_Emission_PowerPurchased_REC
      kpi_emf_Emission_PowerPurchased_REC
      kpi_em_Emission_PowerPurchased_RenewableSources
      kpi_emf_Emission_PowerPurchased_RenewableSources
      kpi_em_Emission_PowerPurchased_NonRenewableSources
      kpi_emf_Emission_PowerPurchased_NonRenewableSources
      kpi_em_Emission_TotalPowerPurchased
      kpi_em_Emission_PowerPurchased_PPA_NonRenewable
      kpi_emf_Emission_PowerPurchased_PPA_NonRenewable
      created_at
      updated_at
      created_by
      updated_by
      metadata
    }
    GHGEnergy_CaptivePower(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      OrganizationAddress {
        Address {
          country_id
          Country {
            region_code
          }
        }
      }
      TaskRequest {
        year
        month
      }
      GHGEnergy_CaptivePower_NonRenewables {
        id
        GHGEnergyConsumption_CaptivePower_id
        Type_of_Fuel_Used
        Quantity_of_fuel_consumed
        Quantity_of_fuel_consumed_uom
        Quality_of_fuel
        Unit_of_Energy_Generated_in_Kwh
        supporting_docs
        kpi_em_Emission_EnergyGenerated_kwh
        kpi_emf_Emission_EnergyGenerated_kwh
        created_at
        updated_at
        created_by
        updated_by
      }
      GHGEnergy_CaptivePower_Renewable_Fuels {
        id
        GHGEnergyConsumption_CaptivePower_id
        Type_of_Fuel_Used
        Quantity_of_fuel_consumed
        Quantity_of_fuel_consumed_uom
        Quality_of_fuel
        Unit_of_Energy_Generated_in_Kwh
        supporting_docs
        kpi_em_Emission_EnergyGenerated_kwh
        kpi_emf_Emission_EnergyGenerated_kwh
        created_at
        updated_at
        created_by
        updated_by
      }
      GHGEnergy_CaptivePower_Renewables {
        id
        GHGEnergyConsumption_CaptivePower_id
        Type_of_Technology_Used
        Year_of_installation
        Unit_of_Energy_Generated_in_Kwh
        supporting_docs
        kpi_em_Emission_EnergyGenerated_kwh
        kpi_emf_Emission_EnergyGenerated_kwh
        created_at
        updated_at
        created_by
        updated_by
      }
    }
  }
`;

/**
 * __useGetPowerConsumptionDataQuery__
 *
 * To run a query within a React component, call `useGetPowerConsumptionDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPowerConsumptionDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPowerConsumptionDataQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetPowerConsumptionDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetPowerConsumptionDataQuery,
    GetPowerConsumptionDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPowerConsumptionDataQuery,
    GetPowerConsumptionDataQueryVariables
  >(GetPowerConsumptionDataDocument, options);
}
export function useGetPowerConsumptionDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPowerConsumptionDataQuery,
    GetPowerConsumptionDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPowerConsumptionDataQuery,
    GetPowerConsumptionDataQueryVariables
  >(GetPowerConsumptionDataDocument, options);
}
// @ts-ignore
export function useGetPowerConsumptionDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPowerConsumptionDataQuery,
    GetPowerConsumptionDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetPowerConsumptionDataQuery,
  GetPowerConsumptionDataQueryVariables
>;
export function useGetPowerConsumptionDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPowerConsumptionDataQuery,
        GetPowerConsumptionDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPowerConsumptionDataQuery | undefined,
  GetPowerConsumptionDataQueryVariables
>;
export function useGetPowerConsumptionDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPowerConsumptionDataQuery,
        GetPowerConsumptionDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPowerConsumptionDataQuery,
    GetPowerConsumptionDataQueryVariables
  >(GetPowerConsumptionDataDocument, options);
}
export type GetPowerConsumptionDataQueryHookResult = ReturnType<
  typeof useGetPowerConsumptionDataQuery
>;
export type GetPowerConsumptionDataLazyQueryHookResult = ReturnType<
  typeof useGetPowerConsumptionDataLazyQuery
>;
export type GetPowerConsumptionDataSuspenseQueryHookResult = ReturnType<
  typeof useGetPowerConsumptionDataSuspenseQuery
>;
export type GetPowerConsumptionDataQueryResult = Apollo.QueryResult<
  GetPowerConsumptionDataQuery,
  GetPowerConsumptionDataQueryVariables
>;
