import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetViewAppUserDataWithPaginationQueryVariables = Types.Exact<{
  where: Types.View_App_User_Bool_Exp;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  order_by?: Types.InputMaybe<Array<Types.View_App_User_Order_By> | Types.View_App_User_Order_By>;
}>;


export type GetViewAppUserDataWithPaginationQuery = { __typename?: 'query_root', view_app_user: Array<{ __typename?: 'view_app_user', id?: any | null, name?: string | null, email?: string | null, organization_id?: any | null, role?: string | null, metadata?: any | null, mobile?: string | null, created_by?: any | null, updated_by?: any | null, is_deleted?: boolean | null, created_at?: any | null }>, totalUsersCount: { __typename?: 'view_app_user_aggregate', aggregate?: { __typename?: 'view_app_user_aggregate_fields', totalRows: number } | null } };


export const GetViewAppUserDataWithPaginationDocument = gql`
    query getViewAppUserDataWithPagination($where: view_app_user_bool_exp!, $limit: Int, $offset: Int, $order_by: [view_app_user_order_by!]) {
  view_app_user(
    where: $where
    order_by: $order_by
    limit: $limit
    offset: $offset
  ) {
    id
    name
    email
    organization_id
    role
    metadata
    mobile
    created_by
    updated_by
    is_deleted
    created_at
  }
  totalUsersCount: view_app_user_aggregate(where: $where) {
    aggregate {
      totalRows: count
    }
  }
}
    `;

/**
 * __useGetViewAppUserDataWithPaginationQuery__
 *
 * To run a query within a React component, call `useGetViewAppUserDataWithPaginationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetViewAppUserDataWithPaginationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewAppUserDataWithPaginationQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetViewAppUserDataWithPaginationQuery(baseOptions: Apollo.QueryHookOptions<GetViewAppUserDataWithPaginationQuery, GetViewAppUserDataWithPaginationQueryVariables> & ({ variables: GetViewAppUserDataWithPaginationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewAppUserDataWithPaginationQuery, GetViewAppUserDataWithPaginationQueryVariables>(GetViewAppUserDataWithPaginationDocument, options);
      }
export function useGetViewAppUserDataWithPaginationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewAppUserDataWithPaginationQuery, GetViewAppUserDataWithPaginationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewAppUserDataWithPaginationQuery, GetViewAppUserDataWithPaginationQueryVariables>(GetViewAppUserDataWithPaginationDocument, options);
        }
export function useGetViewAppUserDataWithPaginationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetViewAppUserDataWithPaginationQuery, GetViewAppUserDataWithPaginationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetViewAppUserDataWithPaginationQuery, GetViewAppUserDataWithPaginationQueryVariables>(GetViewAppUserDataWithPaginationDocument, options);
        }
export type GetViewAppUserDataWithPaginationQueryHookResult = ReturnType<typeof useGetViewAppUserDataWithPaginationQuery>;
export type GetViewAppUserDataWithPaginationLazyQueryHookResult = ReturnType<typeof useGetViewAppUserDataWithPaginationLazyQuery>;
export type GetViewAppUserDataWithPaginationSuspenseQueryHookResult = ReturnType<typeof useGetViewAppUserDataWithPaginationSuspenseQuery>;
export type GetViewAppUserDataWithPaginationQueryResult = Apollo.QueryResult<GetViewAppUserDataWithPaginationQuery, GetViewAppUserDataWithPaginationQueryVariables>;