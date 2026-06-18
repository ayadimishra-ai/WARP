import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgProductionDetailsQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.GhgProductionDetails_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  size?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  orderBy?: Types.InputMaybe<Array<Types.GhgProductionDetails_Order_By> | Types.GhgProductionDetails_Order_By>;
}>;


export type GetGhgProductionDetailsQuery = { __typename?: 'query_root', GHGProductionDetails: Array<{ __typename?: 'GHGProductionDetails', Processes_Employed?: any | null, Product_ID?: string | null, Products_Manufactured_This_Month?: string | null, SKUs_Manufactured?: string | null, SKU_ID?: string | null, Total_Weight?: any | null }>, totalCount: { __typename?: 'GHGProductionDetails_aggregate', aggregate?: { __typename?: 'GHGProductionDetails_aggregate_fields', count: number } | null } };


export const GetGhgProductionDetailsDocument = gql`
    query getGHGProductionDetails($activityFilter: GHGProductionDetails_bool_exp, $start: Int, $size: Int, $orderBy: [GHGProductionDetails_order_by!]) {
  GHGProductionDetails(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Processes_Employed
    Product_ID
    Products_Manufactured_This_Month
    SKUs_Manufactured
    SKU_ID
    Total_Weight
  }
  totalCount: GHGProductionDetails_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetGhgProductionDetailsQuery__
 *
 * To run a query within a React component, call `useGetGhgProductionDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgProductionDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgProductionDetailsQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgProductionDetailsQuery(baseOptions?: Apollo.QueryHookOptions<GetGhgProductionDetailsQuery, GetGhgProductionDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgProductionDetailsQuery, GetGhgProductionDetailsQueryVariables>(GetGhgProductionDetailsDocument, options);
      }
export function useGetGhgProductionDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgProductionDetailsQuery, GetGhgProductionDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgProductionDetailsQuery, GetGhgProductionDetailsQueryVariables>(GetGhgProductionDetailsDocument, options);
        }
export function useGetGhgProductionDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgProductionDetailsQuery, GetGhgProductionDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgProductionDetailsQuery, GetGhgProductionDetailsQueryVariables>(GetGhgProductionDetailsDocument, options);
        }
export type GetGhgProductionDetailsQueryHookResult = ReturnType<typeof useGetGhgProductionDetailsQuery>;
export type GetGhgProductionDetailsLazyQueryHookResult = ReturnType<typeof useGetGhgProductionDetailsLazyQuery>;
export type GetGhgProductionDetailsSuspenseQueryHookResult = ReturnType<typeof useGetGhgProductionDetailsSuspenseQuery>;
export type GetGhgProductionDetailsQueryResult = Apollo.QueryResult<GetGhgProductionDetailsQuery, GetGhgProductionDetailsQueryVariables>;