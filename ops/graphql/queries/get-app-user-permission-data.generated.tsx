import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAppUserPermissionDataQueryVariables = Types.Exact<{
  where: Types.UserOrganizationAddressMapping_Bool_Exp;
}>;


export type GetAppUserPermissionDataQuery = { __typename?: 'query_root', UserOrganizationAddressMapping: Array<{ __typename?: 'UserOrganizationAddressMapping', id: any, organization_id: any, activities: any, AppUser: { __typename?: 'AppUser', id: any, name: string }, OrganizationAddress?: { __typename?: 'OrganizationAddress', id: any, Address: { __typename?: 'Addresses', id: any, type?: string | null, ownership_type?: string | null, name: string } } | null }> };


export const GetAppUserPermissionDataDocument = gql`
    query getAppUserPermissionData($where: UserOrganizationAddressMapping_bool_exp!) {
  UserOrganizationAddressMapping(where: $where, order_by: {user_id: asc}) {
    id
    organization_id
    AppUser {
      id
      name
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
}
    `;

/**
 * __useGetAppUserPermissionDataQuery__
 *
 * To run a query within a React component, call `useGetAppUserPermissionDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppUserPermissionDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppUserPermissionDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetAppUserPermissionDataQuery(baseOptions: Apollo.QueryHookOptions<GetAppUserPermissionDataQuery, GetAppUserPermissionDataQueryVariables> & ({ variables: GetAppUserPermissionDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAppUserPermissionDataQuery, GetAppUserPermissionDataQueryVariables>(GetAppUserPermissionDataDocument, options);
      }
export function useGetAppUserPermissionDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAppUserPermissionDataQuery, GetAppUserPermissionDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAppUserPermissionDataQuery, GetAppUserPermissionDataQueryVariables>(GetAppUserPermissionDataDocument, options);
        }
export function useGetAppUserPermissionDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppUserPermissionDataQuery, GetAppUserPermissionDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAppUserPermissionDataQuery, GetAppUserPermissionDataQueryVariables>(GetAppUserPermissionDataDocument, options);
        }
export type GetAppUserPermissionDataQueryHookResult = ReturnType<typeof useGetAppUserPermissionDataQuery>;
export type GetAppUserPermissionDataLazyQueryHookResult = ReturnType<typeof useGetAppUserPermissionDataLazyQuery>;
export type GetAppUserPermissionDataSuspenseQueryHookResult = ReturnType<typeof useGetAppUserPermissionDataSuspenseQuery>;
export type GetAppUserPermissionDataQueryResult = Apollo.QueryResult<GetAppUserPermissionDataQuery, GetAppUserPermissionDataQueryVariables>;