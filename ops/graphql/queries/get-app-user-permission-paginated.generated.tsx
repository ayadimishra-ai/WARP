import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAppUserPermissionPaginatedQueryVariables = Types.Exact<{
  where: Types.UserOrganizationAddressMapping_Bool_Exp;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  order_by?: Types.InputMaybe<Array<Types.UserOrganizationAddressMapping_Order_By> | Types.UserOrganizationAddressMapping_Order_By>;
}>;


export type GetAppUserPermissionPaginatedQuery = { __typename?: 'query_root', UserOrganizationAddressMapping: Array<{ __typename?: 'UserOrganizationAddressMapping', id: any, user_id: any, organization_id: any, activities: any, AppUser: { __typename?: 'AppUser', id: any, name: string, email: string, role: string, isRegistered: boolean }, OrganizationAddress?: { __typename?: 'OrganizationAddress', id: any, Address: { __typename?: 'Addresses', id: any, type: string, ownership_type: string, name: string } } | null }>, totalCount: { __typename?: 'UserOrganizationAddressMapping_aggregate', aggregate?: { __typename?: 'UserOrganizationAddressMapping_aggregate_fields', count: number } | null } };


export const GetAppUserPermissionPaginatedDocument = gql`
    query getAppUserPermissionPaginated($where: UserOrganizationAddressMapping_bool_exp!, $limit: Int, $offset: Int, $order_by: [UserOrganizationAddressMapping_order_by!]) {
  UserOrganizationAddressMapping(
    where: $where
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    user_id
    organization_id
    AppUser {
      id
      name
      email
      role
      isRegistered
    }
    OrganizationAddress {
      id
      Address {
        id
        type
        ownership_type
        name
      }
    }
    activities
  }
  totalCount: UserOrganizationAddressMapping_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetAppUserPermissionPaginatedQuery__
 *
 * To run a query within a React component, call `useGetAppUserPermissionPaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppUserPermissionPaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppUserPermissionPaginatedQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetAppUserPermissionPaginatedQuery(baseOptions: Apollo.QueryHookOptions<GetAppUserPermissionPaginatedQuery, GetAppUserPermissionPaginatedQueryVariables> & ({ variables: GetAppUserPermissionPaginatedQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAppUserPermissionPaginatedQuery, GetAppUserPermissionPaginatedQueryVariables>(GetAppUserPermissionPaginatedDocument, options);
      }
export function useGetAppUserPermissionPaginatedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAppUserPermissionPaginatedQuery, GetAppUserPermissionPaginatedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAppUserPermissionPaginatedQuery, GetAppUserPermissionPaginatedQueryVariables>(GetAppUserPermissionPaginatedDocument, options);
        }
export function useGetAppUserPermissionPaginatedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppUserPermissionPaginatedQuery, GetAppUserPermissionPaginatedQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAppUserPermissionPaginatedQuery, GetAppUserPermissionPaginatedQueryVariables>(GetAppUserPermissionPaginatedDocument, options);
        }
export type GetAppUserPermissionPaginatedQueryHookResult = ReturnType<typeof useGetAppUserPermissionPaginatedQuery>;
export type GetAppUserPermissionPaginatedLazyQueryHookResult = ReturnType<typeof useGetAppUserPermissionPaginatedLazyQuery>;
export type GetAppUserPermissionPaginatedSuspenseQueryHookResult = ReturnType<typeof useGetAppUserPermissionPaginatedSuspenseQuery>;
export type GetAppUserPermissionPaginatedQueryResult = Apollo.QueryResult<GetAppUserPermissionPaginatedQuery, GetAppUserPermissionPaginatedQueryVariables>;