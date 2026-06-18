import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgEnergyGridPowerDetailsQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.GhgEnergyConsumption_GridPower_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  size?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  orderBy?: Types.InputMaybe<Array<Types.GhgEnergyConsumption_GridPower_Order_By> | Types.GhgEnergyConsumption_GridPower_Order_By>;
}>;


export type GetGhgEnergyGridPowerDetailsQuery = { __typename?: 'query_root', GHGEnergyConsumption_GridPower: Array<{ __typename?: 'GHGEnergyConsumption_GridPower', Name_of_Distribution_Company?: string | null, PowerConsumed_through_Grid_Kwh?: any | null, PowerPurchased_through_PPA_Kwh_Renewable?: any | null, PowerPurchased_through_PPA_Kwh_NonRenewable?: any | null, NameOfCompany_PPA_Renewable?: string | null, NameOfCompany_PPA_NonRenewable?: string | null, PowerPurchased_through_REC_Kwh?: any | null }>, totalCount: { __typename?: 'GHGEnergyConsumption_GridPower_aggregate', aggregate?: { __typename?: 'GHGEnergyConsumption_GridPower_aggregate_fields', count: number } | null } };


export const GetGhgEnergyGridPowerDetailsDocument = gql`
    query getGHGEnergyGridPowerDetails($activityFilter: GHGEnergyConsumption_GridPower_bool_exp, $start: Int, $size: Int, $orderBy: [GHGEnergyConsumption_GridPower_order_by!]) {
  GHGEnergyConsumption_GridPower(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Name_of_Distribution_Company
    PowerConsumed_through_Grid_Kwh
    PowerPurchased_through_PPA_Kwh_Renewable
    PowerPurchased_through_PPA_Kwh_NonRenewable
    NameOfCompany_PPA_Renewable
    NameOfCompany_PPA_NonRenewable
    PowerPurchased_through_REC_Kwh
    PowerPurchased_through_REC_Kwh
  }
  totalCount: GHGEnergyConsumption_GridPower_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetGhgEnergyGridPowerDetailsQuery__
 *
 * To run a query within a React component, call `useGetGhgEnergyGridPowerDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgEnergyGridPowerDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgEnergyGridPowerDetailsQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgEnergyGridPowerDetailsQuery(baseOptions?: Apollo.QueryHookOptions<GetGhgEnergyGridPowerDetailsQuery, GetGhgEnergyGridPowerDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgEnergyGridPowerDetailsQuery, GetGhgEnergyGridPowerDetailsQueryVariables>(GetGhgEnergyGridPowerDetailsDocument, options);
      }
export function useGetGhgEnergyGridPowerDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgEnergyGridPowerDetailsQuery, GetGhgEnergyGridPowerDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgEnergyGridPowerDetailsQuery, GetGhgEnergyGridPowerDetailsQueryVariables>(GetGhgEnergyGridPowerDetailsDocument, options);
        }
export function useGetGhgEnergyGridPowerDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetGhgEnergyGridPowerDetailsQuery, GetGhgEnergyGridPowerDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgEnergyGridPowerDetailsQuery, GetGhgEnergyGridPowerDetailsQueryVariables>(GetGhgEnergyGridPowerDetailsDocument, options);
        }
export type GetGhgEnergyGridPowerDetailsQueryHookResult = ReturnType<typeof useGetGhgEnergyGridPowerDetailsQuery>;
export type GetGhgEnergyGridPowerDetailsLazyQueryHookResult = ReturnType<typeof useGetGhgEnergyGridPowerDetailsLazyQuery>;
export type GetGhgEnergyGridPowerDetailsSuspenseQueryHookResult = ReturnType<typeof useGetGhgEnergyGridPowerDetailsSuspenseQuery>;
export type GetGhgEnergyGridPowerDetailsQueryResult = Apollo.QueryResult<GetGhgEnergyGridPowerDetailsQuery, GetGhgEnergyGridPowerDetailsQueryVariables>;