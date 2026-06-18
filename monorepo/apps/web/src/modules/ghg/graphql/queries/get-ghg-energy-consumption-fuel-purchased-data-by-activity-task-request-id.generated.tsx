import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgEnergyConsumption_FuelPurchasedQueryVariables = Types.Exact<{
  task_request_id?: Types.InputMaybe<
    Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"]
  >;
}>;

export type GetGhgEnergyConsumption_FuelPurchasedQuery = {
  __typename?: "query_root";
  GHGEnergyConsumption_FuelPurchased: Array<{
    __typename?: "GHGEnergyConsumption_FuelPurchased";
    TaskRequest: {
      __typename?: "TaskRequest";
      month: string;
      year?: number | null;
    };
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
    GHGEnergyConsumption_FuelPurchased_Generals: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_General";
      id: any;
      GHGEnergyConsumption_FuelPurchased_id: any;
      Type_of_Fuel_Purchased?: string | null;
      Quantity_of_fuel_Consumed?: any | null;
      Quantity_of_fuel_Consumed_uom?: string | null;
      Quality_of_fuel?: any | null;
      Point_of_Consumption?: string | null;
      supporting_docs?: any | null;
      kpi_em_Emission_QuantityOfFuelConsumed?: any | null;
      kpi_emf_Emission_QuantityOfFuelConsumed?: any | null;
    }>;
    GHGEnergyConsumption_FuelPurchased_HeatingWaters: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater";
      id: any;
      GHGEnergyConsumption_FuelPurchased_id: any;
      Type_of_Fuel_Purchased?: string | null;
      Quantity_of_fuel_consumed?: any | null;
      Quantity_of_fuel_consumed_uom?: string | null;
      Quality_of_fuel?: any | null;
    }>;
    GHGEnergyConsumption_FuelPurchased_Auxiliaries: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary";
      id: any;
      GHGEnergyConsumption_FuelPurchased_id: any;
      Quantity_of_fuel_consumed?: any | null;
      Type_of_Auxiliary_Fuel_Purchased?: string | null;
      Quantity_of_fuel_consumed_uom?: string | null;
    }>;
  }>;
  GHGEnergyConsumption_FuelPurchased_Transportation: Array<{
    __typename?: "GHGEnergyConsumption_FuelPurchased_Transportation";
    id: any;
    task_request_id: any;
    organization_address_id: any;
    activity_task_request_id: any;
    Vehicle_Type_Used_for_Road_Transport?: string | null;
    Type_of_Fuel_Purchased?: string | null;
    Quantity_of_fuel_purchased: any;
    UoM_for_fuel_purchased: string;
    Distance_travelled?: any | null;
    Transportation_Type: string;
    TaskRequest: {
      __typename?: "TaskRequest";
      month: string;
      year?: number | null;
    };
  }>;
};

export const GetGhgEnergyConsumption_FuelPurchasedDocument = gql`
  query getGHGEnergyConsumption_FuelPurchased($task_request_id: [uuid!]) {
    GHGEnergyConsumption_FuelPurchased(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      TaskRequest {
        month
        year
      }
      OrganizationAddress {
        Address {
          country_id
          Country {
            region_code
          }
        }
      }
      GHGEnergyConsumption_FuelPurchased_Generals {
        id
        GHGEnergyConsumption_FuelPurchased_id
        Type_of_Fuel_Purchased
        Quantity_of_fuel_Consumed
        Quantity_of_fuel_Consumed_uom
        Quality_of_fuel
        Point_of_Consumption
        supporting_docs
        kpi_em_Emission_QuantityOfFuelConsumed
        kpi_emf_Emission_QuantityOfFuelConsumed
      }
      GHGEnergyConsumption_FuelPurchased_HeatingWaters {
        id
        GHGEnergyConsumption_FuelPurchased_id
        Type_of_Fuel_Purchased
        Quantity_of_fuel_consumed
        Quantity_of_fuel_consumed_uom
        Quality_of_fuel
      }
      GHGEnergyConsumption_FuelPurchased_Auxiliaries {
        id
        GHGEnergyConsumption_FuelPurchased_id
        Quantity_of_fuel_consumed
        Type_of_Auxiliary_Fuel_Purchased
        Quantity_of_fuel_consumed_uom
      }
    }
    GHGEnergyConsumption_FuelPurchased_Transportation(
      where: { task_request_id: { _in: $task_request_id } }
    ) {
      TaskRequest {
        month
        year
      }
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      Vehicle_Type_Used_for_Road_Transport
      Type_of_Fuel_Purchased
      Quantity_of_fuel_purchased
      UoM_for_fuel_purchased
      Distance_travelled
      Transportation_Type
    }
  }
`;

/**
 * __useGetGhgEnergyConsumption_FuelPurchasedQuery__
 *
 * To run a query within a React component, call `useGetGhgEnergyConsumption_FuelPurchasedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEnergyConsumption_FuelPurchasedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEnergyConsumption_FuelPurchasedQuery({
 *   variables: {
 *      task_request_id: // value for 'task_request_id'
 *   },
 * });
 */
export function useGetGhgEnergyConsumption_FuelPurchasedQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetGhgEnergyConsumption_FuelPurchasedQuery,
    GetGhgEnergyConsumption_FuelPurchasedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgEnergyConsumption_FuelPurchasedQuery,
    GetGhgEnergyConsumption_FuelPurchasedQueryVariables
  >(GetGhgEnergyConsumption_FuelPurchasedDocument, options);
}
export function useGetGhgEnergyConsumption_FuelPurchasedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgEnergyConsumption_FuelPurchasedQuery,
    GetGhgEnergyConsumption_FuelPurchasedQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgEnergyConsumption_FuelPurchasedQuery,
    GetGhgEnergyConsumption_FuelPurchasedQueryVariables
  >(GetGhgEnergyConsumption_FuelPurchasedDocument, options);
}
// @ts-ignore
export function useGetGhgEnergyConsumption_FuelPurchasedSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgEnergyConsumption_FuelPurchasedQuery,
    GetGhgEnergyConsumption_FuelPurchasedQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgEnergyConsumption_FuelPurchasedQuery,
  GetGhgEnergyConsumption_FuelPurchasedQueryVariables
>;
export function useGetGhgEnergyConsumption_FuelPurchasedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgEnergyConsumption_FuelPurchasedQuery,
        GetGhgEnergyConsumption_FuelPurchasedQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgEnergyConsumption_FuelPurchasedQuery | undefined,
  GetGhgEnergyConsumption_FuelPurchasedQueryVariables
>;
export function useGetGhgEnergyConsumption_FuelPurchasedSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgEnergyConsumption_FuelPurchasedQuery,
        GetGhgEnergyConsumption_FuelPurchasedQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgEnergyConsumption_FuelPurchasedQuery,
    GetGhgEnergyConsumption_FuelPurchasedQueryVariables
  >(GetGhgEnergyConsumption_FuelPurchasedDocument, options);
}
export type GetGhgEnergyConsumption_FuelPurchasedQueryHookResult = ReturnType<
  typeof useGetGhgEnergyConsumption_FuelPurchasedQuery
>;
export type GetGhgEnergyConsumption_FuelPurchasedLazyQueryHookResult =
  ReturnType<typeof useGetGhgEnergyConsumption_FuelPurchasedLazyQuery>;
export type GetGhgEnergyConsumption_FuelPurchasedSuspenseQueryHookResult =
  ReturnType<typeof useGetGhgEnergyConsumption_FuelPurchasedSuspenseQuery>;
export type GetGhgEnergyConsumption_FuelPurchasedQueryResult =
  Apollo.QueryResult<
    GetGhgEnergyConsumption_FuelPurchasedQuery,
    GetGhgEnergyConsumption_FuelPurchasedQueryVariables
  >;
