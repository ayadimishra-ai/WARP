import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgEnergyConsumptionFuelPurchasedDataQueryVariables = Types.Exact<{
  where: Types.GhgEnergyConsumption_FuelPurchased_Bool_Exp;
}>;


export type GetGhgEnergyConsumptionFuelPurchasedDataQuery = { __typename?: 'query_root', GHGEnergyConsumption_FuelPurchased: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased', task_request_id: any, organization_address_id: any, id: any, activity_task_request_id: any, TaskRequest: { __typename?: 'TaskRequest', id: any, month: string, year?: number | null }, GHGEnergyConsumption_FuelPurchased_Generals_aggregate: { __typename?: 'GHGEnergyConsumption_FuelPurchased_General_aggregate', aggregate?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_General_aggregate_fields', count: number } | null }, GHGEnergyConsumption_FuelPurchased_Auxiliaries_aggregate: { __typename?: 'GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate', aggregate?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_Auxiliary_aggregate_fields', count: number } | null }, GHGEnergyConsumption_FuelPurchased_HeatingWaters_aggregate: { __typename?: 'GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate', aggregate?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_HeatingWater_aggregate_fields', count: number } | null } }> };


export const GetGhgEnergyConsumptionFuelPurchasedDataDocument = gql`
    query getGHGEnergyConsumptionFuelPurchasedData($where: GHGEnergyConsumption_FuelPurchased_bool_exp!) {
  GHGEnergyConsumption_FuelPurchased(where: $where) {
    task_request_id
    organization_address_id
    id
    activity_task_request_id
    TaskRequest {
      id
      month
      year
    }
    GHGEnergyConsumption_FuelPurchased_Generals_aggregate {
      aggregate {
        count
      }
    }
    GHGEnergyConsumption_FuelPurchased_Auxiliaries_aggregate {
      aggregate {
        count
      }
    }
    GHGEnergyConsumption_FuelPurchased_HeatingWaters_aggregate {
      aggregate {
        count
      }
    }
  }
}
    `;

/**
 * __useGetGhgEnergyConsumptionFuelPurchasedDataQuery__
 *
 * To run a query within a React component, call `useGetGhgEnergyConsumptionFuelPurchasedDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEnergyConsumptionFuelPurchasedDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEnergyConsumptionFuelPurchasedDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetGhgEnergyConsumptionFuelPurchasedDataQuery(baseOptions: Apollo.QueryHookOptions<GetGhgEnergyConsumptionFuelPurchasedDataQuery, GetGhgEnergyConsumptionFuelPurchasedDataQueryVariables> & ({ variables: GetGhgEnergyConsumptionFuelPurchasedDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgEnergyConsumptionFuelPurchasedDataQuery, GetGhgEnergyConsumptionFuelPurchasedDataQueryVariables>(GetGhgEnergyConsumptionFuelPurchasedDataDocument, options);
      }
export function useGetGhgEnergyConsumptionFuelPurchasedDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgEnergyConsumptionFuelPurchasedDataQuery, GetGhgEnergyConsumptionFuelPurchasedDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgEnergyConsumptionFuelPurchasedDataQuery, GetGhgEnergyConsumptionFuelPurchasedDataQueryVariables>(GetGhgEnergyConsumptionFuelPurchasedDataDocument, options);
        }
export function useGetGhgEnergyConsumptionFuelPurchasedDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgEnergyConsumptionFuelPurchasedDataQuery, GetGhgEnergyConsumptionFuelPurchasedDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgEnergyConsumptionFuelPurchasedDataQuery, GetGhgEnergyConsumptionFuelPurchasedDataQueryVariables>(GetGhgEnergyConsumptionFuelPurchasedDataDocument, options);
        }
export type GetGhgEnergyConsumptionFuelPurchasedDataQueryHookResult = ReturnType<typeof useGetGhgEnergyConsumptionFuelPurchasedDataQuery>;
export type GetGhgEnergyConsumptionFuelPurchasedDataLazyQueryHookResult = ReturnType<typeof useGetGhgEnergyConsumptionFuelPurchasedDataLazyQuery>;
export type GetGhgEnergyConsumptionFuelPurchasedDataSuspenseQueryHookResult = ReturnType<typeof useGetGhgEnergyConsumptionFuelPurchasedDataSuspenseQuery>;
export type GetGhgEnergyConsumptionFuelPurchasedDataQueryResult = Apollo.QueryResult<GetGhgEnergyConsumptionFuelPurchasedDataQuery, GetGhgEnergyConsumptionFuelPurchasedDataQueryVariables>;