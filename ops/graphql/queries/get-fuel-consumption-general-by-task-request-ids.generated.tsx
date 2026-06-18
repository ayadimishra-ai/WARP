import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetFuelConsumptionGeneralByTaskRequestIdsQueryVariables = Types.Exact<{
  taskRequestIds: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type GetFuelConsumptionGeneralByTaskRequestIdsQuery = { __typename?: 'query_root', GHGEnergyConsumption_FuelPurchased_General: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', id: any, Type_of_Fuel_Purchased?: string | null, Quantity_of_fuel_Consumed?: any | null, Quantity_of_fuel_Consumed_uom?: string | null, Quality_of_fuel?: any | null, Point_of_Consumption?: string | null, GHGEnergyConsumption_FuelPurchased_id: any, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', task_request_id: any } }> };


export const GetFuelConsumptionGeneralByTaskRequestIdsDocument = gql`
    query getFuelConsumptionGeneralByTaskRequestIds($taskRequestIds: [uuid!]!) {
  GHGEnergyConsumption_FuelPurchased_General(
    where: {GHGEnergyConsumption_FuelPurchased: {task_request_id: {_in: $taskRequestIds}}}
  ) {
    id
    Type_of_Fuel_Purchased
    Quantity_of_fuel_Consumed
    Quantity_of_fuel_Consumed_uom
    Quality_of_fuel
    Point_of_Consumption
    GHGEnergyConsumption_FuelPurchased_id
    GHGEnergyConsumption_FuelPurchased {
      task_request_id
    }
  }
}
    `;

/**
 * __useGetFuelConsumptionGeneralByTaskRequestIdsQuery__
 *
 * To run a query within a React component, call `useGetFuelConsumptionGeneralByTaskRequestIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFuelConsumptionGeneralByTaskRequestIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFuelConsumptionGeneralByTaskRequestIdsQuery({
 *   variables: {
 *      taskRequestIds: // value for 'taskRequestIds'
 *   },
 * });
 */
export function useGetFuelConsumptionGeneralByTaskRequestIdsQuery(baseOptions: Apollo.QueryHookOptions<GetFuelConsumptionGeneralByTaskRequestIdsQuery, GetFuelConsumptionGeneralByTaskRequestIdsQueryVariables> & ({ variables: GetFuelConsumptionGeneralByTaskRequestIdsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFuelConsumptionGeneralByTaskRequestIdsQuery, GetFuelConsumptionGeneralByTaskRequestIdsQueryVariables>(GetFuelConsumptionGeneralByTaskRequestIdsDocument, options);
      }
export function useGetFuelConsumptionGeneralByTaskRequestIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFuelConsumptionGeneralByTaskRequestIdsQuery, GetFuelConsumptionGeneralByTaskRequestIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFuelConsumptionGeneralByTaskRequestIdsQuery, GetFuelConsumptionGeneralByTaskRequestIdsQueryVariables>(GetFuelConsumptionGeneralByTaskRequestIdsDocument, options);
        }
export function useGetFuelConsumptionGeneralByTaskRequestIdsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFuelConsumptionGeneralByTaskRequestIdsQuery, GetFuelConsumptionGeneralByTaskRequestIdsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFuelConsumptionGeneralByTaskRequestIdsQuery, GetFuelConsumptionGeneralByTaskRequestIdsQueryVariables>(GetFuelConsumptionGeneralByTaskRequestIdsDocument, options);
        }
export type GetFuelConsumptionGeneralByTaskRequestIdsQueryHookResult = ReturnType<typeof useGetFuelConsumptionGeneralByTaskRequestIdsQuery>;
export type GetFuelConsumptionGeneralByTaskRequestIdsLazyQueryHookResult = ReturnType<typeof useGetFuelConsumptionGeneralByTaskRequestIdsLazyQuery>;
export type GetFuelConsumptionGeneralByTaskRequestIdsSuspenseQueryHookResult = ReturnType<typeof useGetFuelConsumptionGeneralByTaskRequestIdsSuspenseQuery>;
export type GetFuelConsumptionGeneralByTaskRequestIdsQueryResult = Apollo.QueryResult<GetFuelConsumptionGeneralByTaskRequestIdsQuery, GetFuelConsumptionGeneralByTaskRequestIdsQueryVariables>;