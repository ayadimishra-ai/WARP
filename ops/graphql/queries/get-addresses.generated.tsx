import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAddressesQueryVariables = Types.Exact<{
  organisationAddressId: Types.Scalars['uuid']['input'];
}>;


export type GetAddressesQuery = { __typename?: 'query_root', OrganizationAddress: Array<{ __typename?: 'OrganizationAddress', id: any, Address: { __typename?: 'Addresses', id: any, name: string, code?: string | null, pincode?: string | null, type?: string | null, ownership_type?: string | null } }> };


export const GetAddressesDocument = gql`
    query getAddresses($organisationAddressId: uuid!) {
  OrganizationAddress(where: {organization_id: {_eq: $organisationAddressId}}) {
    id
    Address {
      id
      name
      code
      pincode
      type
      ownership_type
    }
  }
}
    `;

/**
 * __useGetAddressesQuery__
 *
 * To run a query within a React component, call `useGetAddressesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressesQuery({
 *   variables: {
 *      organisationAddressId: // value for 'organisationAddressId'
 *   },
 * });
 */
export function useGetAddressesQuery(baseOptions: Apollo.QueryHookOptions<GetAddressesQuery, GetAddressesQueryVariables> & ({ variables: GetAddressesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAddressesQuery, GetAddressesQueryVariables>(GetAddressesDocument, options);
      }
export function useGetAddressesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAddressesQuery, GetAddressesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAddressesQuery, GetAddressesQueryVariables>(GetAddressesDocument, options);
        }
export function useGetAddressesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAddressesQuery, GetAddressesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAddressesQuery, GetAddressesQueryVariables>(GetAddressesDocument, options);
        }
export type GetAddressesQueryHookResult = ReturnType<typeof useGetAddressesQuery>;
export type GetAddressesLazyQueryHookResult = ReturnType<typeof useGetAddressesLazyQuery>;
export type GetAddressesSuspenseQueryHookResult = ReturnType<typeof useGetAddressesSuspenseQuery>;
export type GetAddressesQueryResult = Apollo.QueryResult<GetAddressesQuery, GetAddressesQueryVariables>;