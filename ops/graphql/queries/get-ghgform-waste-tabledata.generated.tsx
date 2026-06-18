import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgWasteQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.GhgWaste_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  size?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  orderBy?: Types.InputMaybe<Array<Types.GhgWaste_Order_By> | Types.GhgWaste_Order_By>;
}>;


export type GetGhgWasteQuery = { __typename?: 'query_root', GHGWaste: Array<{ __typename?: 'GHGWaste', Types_of_Waste_Generated?: string | null, Waste_Disposal_Managed_by?: string | null, Name_of_Third_Party?: string | null, Quantity_of_Waste?: any | null, Disposal_Mechanism?: string | null }>, totalCount: { __typename?: 'GHGWaste_aggregate', aggregate?: { __typename?: 'GHGWaste_aggregate_fields', count: number } | null } };


export const GetGhgWasteDocument = gql`
    query getGHGWaste($activityFilter: GHGWaste_bool_exp, $start: Int, $size: Int, $orderBy: [GHGWaste_order_by!]) {
  GHGWaste(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Types_of_Waste_Generated
    Waste_Disposal_Managed_by
    Name_of_Third_Party
    Quantity_of_Waste
    Disposal_Mechanism
  }
  totalCount: GHGWaste_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetGhgWasteQuery__
 *
 * To run a query within a React component, call `useGetGhgWasteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgWasteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgWasteQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgWasteQuery(baseOptions?: Apollo.QueryHookOptions<GetGhgWasteQuery, GetGhgWasteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgWasteQuery, GetGhgWasteQueryVariables>(GetGhgWasteDocument, options);
      }
export function useGetGhgWasteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgWasteQuery, GetGhgWasteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgWasteQuery, GetGhgWasteQueryVariables>(GetGhgWasteDocument, options);
        }
export function useGetGhgWasteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgWasteQuery, GetGhgWasteQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgWasteQuery, GetGhgWasteQueryVariables>(GetGhgWasteDocument, options);
        }
export type GetGhgWasteQueryHookResult = ReturnType<typeof useGetGhgWasteQuery>;
export type GetGhgWasteLazyQueryHookResult = ReturnType<typeof useGetGhgWasteLazyQuery>;
export type GetGhgWasteSuspenseQueryHookResult = ReturnType<typeof useGetGhgWasteSuspenseQuery>;
export type GetGhgWasteQueryResult = Apollo.QueryResult<GetGhgWasteQuery, GetGhgWasteQueryVariables>;