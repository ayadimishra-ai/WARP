import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgEnergyFuelPurchasedGeneralQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.GhgEnergyConsumption_FuelPurchased_General_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  size?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  orderBy?: Types.InputMaybe<Array<Types.GhgEnergyConsumption_FuelPurchased_General_Order_By> | Types.GhgEnergyConsumption_FuelPurchased_General_Order_By>;
}>;


export type GetGhgEnergyFuelPurchasedGeneralQuery = { __typename?: 'query_root', GHGEnergyConsumption_FuelPurchased_General: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', Type_of_Fuel_Purchased?: string | null, Quantity_of_fuel_Consumed?: any | null, Quality_of_fuel?: any | null, Point_of_Consumption?: string | null }>, totalCount: { __typename?: 'GHGEnergyConsumption_FuelPurchased_General_aggregate', aggregate?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_General_aggregate_fields', count: number } | null } };


export const GetGhgEnergyFuelPurchasedGeneralDocument = gql`
    query getGHGEnergyFuelPurchasedGeneral($activityFilter: GHGEnergyConsumption_FuelPurchased_General_bool_exp, $start: Int, $size: Int, $orderBy: [GHGEnergyConsumption_FuelPurchased_General_order_by!]) {
  GHGEnergyConsumption_FuelPurchased_General(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Type_of_Fuel_Purchased
    Quantity_of_fuel_Consumed
    Quality_of_fuel
    Point_of_Consumption
  }
  totalCount: GHGEnergyConsumption_FuelPurchased_General_aggregate(
    where: $activityFilter
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetGhgEnergyFuelPurchasedGeneralQuery__
 *
 * To run a query within a React component, call `useGetGhgEnergyFuelPurchasedGeneralQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEnergyFuelPurchasedGeneralQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEnergyFuelPurchasedGeneralQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgEnergyFuelPurchasedGeneralQuery(baseOptions?: Apollo.QueryHookOptions<GetGhgEnergyFuelPurchasedGeneralQuery, GetGhgEnergyFuelPurchasedGeneralQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgEnergyFuelPurchasedGeneralQuery, GetGhgEnergyFuelPurchasedGeneralQueryVariables>(GetGhgEnergyFuelPurchasedGeneralDocument, options);
      }
export function useGetGhgEnergyFuelPurchasedGeneralLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgEnergyFuelPurchasedGeneralQuery, GetGhgEnergyFuelPurchasedGeneralQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgEnergyFuelPurchasedGeneralQuery, GetGhgEnergyFuelPurchasedGeneralQueryVariables>(GetGhgEnergyFuelPurchasedGeneralDocument, options);
        }
export function useGetGhgEnergyFuelPurchasedGeneralSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgEnergyFuelPurchasedGeneralQuery, GetGhgEnergyFuelPurchasedGeneralQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgEnergyFuelPurchasedGeneralQuery, GetGhgEnergyFuelPurchasedGeneralQueryVariables>(GetGhgEnergyFuelPurchasedGeneralDocument, options);
        }
export type GetGhgEnergyFuelPurchasedGeneralQueryHookResult = ReturnType<typeof useGetGhgEnergyFuelPurchasedGeneralQuery>;
export type GetGhgEnergyFuelPurchasedGeneralLazyQueryHookResult = ReturnType<typeof useGetGhgEnergyFuelPurchasedGeneralLazyQuery>;
export type GetGhgEnergyFuelPurchasedGeneralSuspenseQueryHookResult = ReturnType<typeof useGetGhgEnergyFuelPurchasedGeneralSuspenseQuery>;
export type GetGhgEnergyFuelPurchasedGeneralQueryResult = Apollo.QueryResult<GetGhgEnergyFuelPurchasedGeneralQuery, GetGhgEnergyFuelPurchasedGeneralQueryVariables>;