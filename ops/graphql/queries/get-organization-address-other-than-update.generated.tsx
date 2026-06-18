import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetOrganizationAddressOtherThanUpdateQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
  addressId: Types.Scalars['uuid']['input'];
  updateAddressName: Types.Scalars['String']['input'];
}>;


export type GetOrganizationAddressOtherThanUpdateQuery = { __typename?: 'query_root', OrganizationAddress: Array<{ __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', id: any } }> };


export const GetOrganizationAddressOtherThanUpdateDocument = gql`
    query getOrganizationAddressOtherThanUpdate($organizationId: uuid!, $addressId: uuid!, $updateAddressName: String!) {
  OrganizationAddress(
    where: {organization_id: {_eq: $organizationId}, address_id: {_neq: $addressId}, Address: {name: {_like: $updateAddressName}}}
  ) {
    Address {
      id
    }
  }
}
    `;

/**
 * __useGetOrganizationAddressOtherThanUpdateQuery__
 *
 * To run a query within a React component, call `useGetOrganizationAddressOtherThanUpdateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationAddressOtherThanUpdateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationAddressOtherThanUpdateQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      addressId: // value for 'addressId'
 *      updateAddressName: // value for 'updateAddressName'
 *   },
 * });
 */
export function useGetOrganizationAddressOtherThanUpdateQuery(baseOptions: Apollo.QueryHookOptions<GetOrganizationAddressOtherThanUpdateQuery, GetOrganizationAddressOtherThanUpdateQueryVariables> & ({ variables: GetOrganizationAddressOtherThanUpdateQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrganizationAddressOtherThanUpdateQuery, GetOrganizationAddressOtherThanUpdateQueryVariables>(GetOrganizationAddressOtherThanUpdateDocument, options);
      }
export function useGetOrganizationAddressOtherThanUpdateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrganizationAddressOtherThanUpdateQuery, GetOrganizationAddressOtherThanUpdateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrganizationAddressOtherThanUpdateQuery, GetOrganizationAddressOtherThanUpdateQueryVariables>(GetOrganizationAddressOtherThanUpdateDocument, options);
        }
export function useGetOrganizationAddressOtherThanUpdateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrganizationAddressOtherThanUpdateQuery, GetOrganizationAddressOtherThanUpdateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrganizationAddressOtherThanUpdateQuery, GetOrganizationAddressOtherThanUpdateQueryVariables>(GetOrganizationAddressOtherThanUpdateDocument, options);
        }
export type GetOrganizationAddressOtherThanUpdateQueryHookResult = ReturnType<typeof useGetOrganizationAddressOtherThanUpdateQuery>;
export type GetOrganizationAddressOtherThanUpdateLazyQueryHookResult = ReturnType<typeof useGetOrganizationAddressOtherThanUpdateLazyQuery>;
export type GetOrganizationAddressOtherThanUpdateSuspenseQueryHookResult = ReturnType<typeof useGetOrganizationAddressOtherThanUpdateSuspenseQuery>;
export type GetOrganizationAddressOtherThanUpdateQueryResult = Apollo.QueryResult<GetOrganizationAddressOtherThanUpdateQuery, GetOrganizationAddressOtherThanUpdateQueryVariables>;