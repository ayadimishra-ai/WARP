import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgEnergyCaptivePowerNonRenewableQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.GhgEnergy_CaptivePower_NonRenewable_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  size?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  orderBy?: Types.InputMaybe<Array<Types.GhgEnergy_CaptivePower_NonRenewable_Order_By> | Types.GhgEnergy_CaptivePower_NonRenewable_Order_By>;
}>;


export type GetGhgEnergyCaptivePowerNonRenewableQuery = { __typename?: 'query_root', GHGEnergy_CaptivePower_NonRenewable: Array<{ __typename?: 'GHGEnergy_CaptivePower_NonRenewable', Type_of_Fuel_Used?: string | null, Quantity_of_fuel_consumed?: any | null, Quality_of_fuel?: any | null, Unit_of_Energy_Generated_in_Kwh?: any | null }>, totalCount: { __typename?: 'GHGEnergy_CaptivePower_NonRenewable_aggregate', aggregate?: { __typename?: 'GHGEnergy_CaptivePower_NonRenewable_aggregate_fields', count: number } | null } };


export const GetGhgEnergyCaptivePowerNonRenewableDocument = gql`
    query getGHGEnergyCaptivePowerNonRenewable($activityFilter: GHGEnergy_CaptivePower_NonRenewable_bool_exp, $start: Int, $size: Int, $orderBy: [GHGEnergy_CaptivePower_NonRenewable_order_by!]) {
  GHGEnergy_CaptivePower_NonRenewable(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Type_of_Fuel_Used
    Quantity_of_fuel_consumed
    Quality_of_fuel
    Unit_of_Energy_Generated_in_Kwh
  }
  totalCount: GHGEnergy_CaptivePower_NonRenewable_aggregate(
    where: $activityFilter
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetGhgEnergyCaptivePowerNonRenewableQuery__
 *
 * To run a query within a React component, call `useGetGhgEnergyCaptivePowerNonRenewableQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEnergyCaptivePowerNonRenewableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEnergyCaptivePowerNonRenewableQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgEnergyCaptivePowerNonRenewableQuery(baseOptions?: Apollo.QueryHookOptions<GetGhgEnergyCaptivePowerNonRenewableQuery, GetGhgEnergyCaptivePowerNonRenewableQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgEnergyCaptivePowerNonRenewableQuery, GetGhgEnergyCaptivePowerNonRenewableQueryVariables>(GetGhgEnergyCaptivePowerNonRenewableDocument, options);
      }
export function useGetGhgEnergyCaptivePowerNonRenewableLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgEnergyCaptivePowerNonRenewableQuery, GetGhgEnergyCaptivePowerNonRenewableQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgEnergyCaptivePowerNonRenewableQuery, GetGhgEnergyCaptivePowerNonRenewableQueryVariables>(GetGhgEnergyCaptivePowerNonRenewableDocument, options);
        }
export function useGetGhgEnergyCaptivePowerNonRenewableSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgEnergyCaptivePowerNonRenewableQuery, GetGhgEnergyCaptivePowerNonRenewableQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgEnergyCaptivePowerNonRenewableQuery, GetGhgEnergyCaptivePowerNonRenewableQueryVariables>(GetGhgEnergyCaptivePowerNonRenewableDocument, options);
        }
export type GetGhgEnergyCaptivePowerNonRenewableQueryHookResult = ReturnType<typeof useGetGhgEnergyCaptivePowerNonRenewableQuery>;
export type GetGhgEnergyCaptivePowerNonRenewableLazyQueryHookResult = ReturnType<typeof useGetGhgEnergyCaptivePowerNonRenewableLazyQuery>;
export type GetGhgEnergyCaptivePowerNonRenewableSuspenseQueryHookResult = ReturnType<typeof useGetGhgEnergyCaptivePowerNonRenewableSuspenseQuery>;
export type GetGhgEnergyCaptivePowerNonRenewableQueryResult = Apollo.QueryResult<GetGhgEnergyCaptivePowerNonRenewableQuery, GetGhgEnergyCaptivePowerNonRenewableQueryVariables>;