import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAppUserDataWithPaginationQueryVariables = Types.Exact<{
  where: Types.AppUser_Bool_Exp;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  order_by?: Types.InputMaybe<Array<Types.AppUser_Order_By> | Types.AppUser_Order_By>;
}>;


export type GetAppUserDataWithPaginationQuery = { __typename?: 'query_root', AppUser: Array<{ __typename?: 'AppUser', id: any, name: string, email: string, organization_id: any, role: string, metadata?: any | null, created_by?: any | null, updated_by?: any | null, is_deleted: boolean, created_at: any, isRegistered: boolean }>, totalUsersCount: { __typename?: 'AppUser_aggregate', aggregate?: { __typename?: 'AppUser_aggregate_fields', totalRows: number } | null } };


export const GetAppUserDataWithPaginationDocument = gql`
    query getAppUserDataWithPagination($where: AppUser_bool_exp!, $limit: Int, $offset: Int, $order_by: [AppUser_order_by!]) {
  AppUser(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
    id
    name
    email
    organization_id
    role
    metadata
    created_by
    updated_by
    is_deleted
    created_at
    isRegistered
  }
  totalUsersCount: AppUser_aggregate(where: $where) {
    aggregate {
      totalRows: count
    }
  }
}
    `;

/**
 * __useGetAppUserDataWithPaginationQuery__
 *
 * To run a query within a React component, call `useGetAppUserDataWithPaginationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppUserDataWithPaginationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppUserDataWithPaginationQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetAppUserDataWithPaginationQuery(baseOptions: Apollo.QueryHookOptions<GetAppUserDataWithPaginationQuery, GetAppUserDataWithPaginationQueryVariables> & ({ variables: GetAppUserDataWithPaginationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAppUserDataWithPaginationQuery, GetAppUserDataWithPaginationQueryVariables>(GetAppUserDataWithPaginationDocument, options);
      }
export function useGetAppUserDataWithPaginationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAppUserDataWithPaginationQuery, GetAppUserDataWithPaginationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAppUserDataWithPaginationQuery, GetAppUserDataWithPaginationQueryVariables>(GetAppUserDataWithPaginationDocument, options);
        }
export function useGetAppUserDataWithPaginationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppUserDataWithPaginationQuery, GetAppUserDataWithPaginationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAppUserDataWithPaginationQuery, GetAppUserDataWithPaginationQueryVariables>(GetAppUserDataWithPaginationDocument, options);
        }
export type GetAppUserDataWithPaginationQueryHookResult = ReturnType<typeof useGetAppUserDataWithPaginationQuery>;
export type GetAppUserDataWithPaginationLazyQueryHookResult = ReturnType<typeof useGetAppUserDataWithPaginationLazyQuery>;
export type GetAppUserDataWithPaginationSuspenseQueryHookResult = ReturnType<typeof useGetAppUserDataWithPaginationSuspenseQuery>;
export type GetAppUserDataWithPaginationQueryResult = Apollo.QueryResult<GetAppUserDataWithPaginationQuery, GetAppUserDataWithPaginationQueryVariables>;