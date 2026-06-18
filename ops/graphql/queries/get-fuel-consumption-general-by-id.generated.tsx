import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetFuelConsumptionGeneralByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type GetFuelConsumptionGeneralByIdQuery = { __typename?: 'query_root', GHGEnergyConsumption_FuelPurchased_General: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', id: any, Type_of_Fuel_Purchased?: string | null, Quantity_of_fuel_Consumed?: any | null, Quantity_of_fuel_Consumed_uom?: string | null, Quality_of_fuel?: any | null, Point_of_Consumption?: string | null, GHGEnergyConsumption_FuelPurchased_id: any, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, TaskRequest: { __typename?: 'TaskRequest', id: any, month: string, year?: number | null, organization_address_id: any, metadata?: any | null } } }> };


export const GetFuelConsumptionGeneralByIdDocument = gql`
    query getFuelConsumptionGeneralById($id: uuid!) {
  GHGEnergyConsumption_FuelPurchased_General(where: {id: {_eq: $id}}) {
    id
    Type_of_Fuel_Purchased
    Quantity_of_fuel_Consumed
    Quantity_of_fuel_Consumed_uom
    Quality_of_fuel
    Point_of_Consumption
    GHGEnergyConsumption_FuelPurchased_id
    GHGEnergyConsumption_FuelPurchased {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      TaskRequest {
        id
        month
        year
        organization_address_id
        metadata
      }
    }
  }
}
    `;

/**
 * __useGetFuelConsumptionGeneralByIdQuery__
 *
 * To run a query within a React component, call `useGetFuelConsumptionGeneralByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFuelConsumptionGeneralByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFuelConsumptionGeneralByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetFuelConsumptionGeneralByIdQuery(baseOptions: Apollo.QueryHookOptions<GetFuelConsumptionGeneralByIdQuery, GetFuelConsumptionGeneralByIdQueryVariables> & ({ variables: GetFuelConsumptionGeneralByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFuelConsumptionGeneralByIdQuery, GetFuelConsumptionGeneralByIdQueryVariables>(GetFuelConsumptionGeneralByIdDocument, options);
      }
export function useGetFuelConsumptionGeneralByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFuelConsumptionGeneralByIdQuery, GetFuelConsumptionGeneralByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFuelConsumptionGeneralByIdQuery, GetFuelConsumptionGeneralByIdQueryVariables>(GetFuelConsumptionGeneralByIdDocument, options);
        }
export function useGetFuelConsumptionGeneralByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFuelConsumptionGeneralByIdQuery, GetFuelConsumptionGeneralByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFuelConsumptionGeneralByIdQuery, GetFuelConsumptionGeneralByIdQueryVariables>(GetFuelConsumptionGeneralByIdDocument, options);
        }
export type GetFuelConsumptionGeneralByIdQueryHookResult = ReturnType<typeof useGetFuelConsumptionGeneralByIdQuery>;
export type GetFuelConsumptionGeneralByIdLazyQueryHookResult = ReturnType<typeof useGetFuelConsumptionGeneralByIdLazyQuery>;
export type GetFuelConsumptionGeneralByIdSuspenseQueryHookResult = ReturnType<typeof useGetFuelConsumptionGeneralByIdSuspenseQuery>;
export type GetFuelConsumptionGeneralByIdQueryResult = Apollo.QueryResult<GetFuelConsumptionGeneralByIdQuery, GetFuelConsumptionGeneralByIdQueryVariables>;