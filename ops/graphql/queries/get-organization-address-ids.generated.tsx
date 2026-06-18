import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetOrganizationAddressIdsQueryVariables = Types.Exact<{
  organization_id: Types.Scalars['uuid']['input'];
}>;


export type GetOrganizationAddressIdsQuery = { __typename?: 'query_root', OrganizationAddress: Array<{ __typename?: 'OrganizationAddress', id: any }> };


export const GetOrganizationAddressIdsDocument = gql`
    query getOrganizationAddressIds($organization_id: uuid!) {
  OrganizationAddress(
    where: {organization_id: {_eq: $organization_id}, is_deleted: {_eq: false}}
  ) {
    id
  }
}
    `;

/**
 * __useGetOrganizationAddressIdsQuery__
 *
 * To run a query within a React component, call `useGetOrganizationAddressIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationAddressIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationAddressIdsQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetOrganizationAddressIdsQuery(baseOptions: Apollo.QueryHookOptions<GetOrganizationAddressIdsQuery, GetOrganizationAddressIdsQueryVariables> & ({ variables: GetOrganizationAddressIdsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrganizationAddressIdsQuery, GetOrganizationAddressIdsQueryVariables>(GetOrganizationAddressIdsDocument, options);
      }
export function useGetOrganizationAddressIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrganizationAddressIdsQuery, GetOrganizationAddressIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrganizationAddressIdsQuery, GetOrganizationAddressIdsQueryVariables>(GetOrganizationAddressIdsDocument, options);
        }
export function useGetOrganizationAddressIdsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrganizationAddressIdsQuery, GetOrganizationAddressIdsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrganizationAddressIdsQuery, GetOrganizationAddressIdsQueryVariables>(GetOrganizationAddressIdsDocument, options);
        }
export type GetOrganizationAddressIdsQueryHookResult = ReturnType<typeof useGetOrganizationAddressIdsQuery>;
export type GetOrganizationAddressIdsLazyQueryHookResult = ReturnType<typeof useGetOrganizationAddressIdsLazyQuery>;
export type GetOrganizationAddressIdsSuspenseQueryHookResult = ReturnType<typeof useGetOrganizationAddressIdsSuspenseQuery>;
export type GetOrganizationAddressIdsQueryResult = Apollo.QueryResult<GetOrganizationAddressIdsQuery, GetOrganizationAddressIdsQueryVariables>;