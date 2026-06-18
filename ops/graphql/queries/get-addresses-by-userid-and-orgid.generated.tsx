import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetLocationsAndAddressesQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
  userId: Types.Scalars['uuid']['input'];
}>;


export type GetLocationsAndAddressesQuery = { __typename?: 'query_root', UserOrganizationAddressMapping: Array<{ __typename?: 'UserOrganizationAddressMapping', organization_address_id?: any | null, activities: any, OrganizationAddress?: { __typename?: 'OrganizationAddress', id: any, Address: { __typename?: 'Addresses', id: any, name: string, City?: { __typename?: 'City', name: string } | null } } | null }> };


export const GetLocationsAndAddressesDocument = gql`
    query getLocationsAndAddresses($organizationId: uuid!, $userId: uuid!) {
  UserOrganizationAddressMapping(
    where: {organization_id: {_eq: $organizationId}, user_id: {_eq: $userId}}
  ) {
    organization_address_id
    activities
    OrganizationAddress {
      id
      Address {
        id
        name
        City {
          name
        }
      }
    }
  }
}
    `;

/**
 * __useGetLocationsAndAddressesQuery__
 *
 * To run a query within a React component, call `useGetLocationsAndAddressesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLocationsAndAddressesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLocationsAndAddressesQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetLocationsAndAddressesQuery(baseOptions: Apollo.QueryHookOptions<GetLocationsAndAddressesQuery, GetLocationsAndAddressesQueryVariables> & ({ variables: GetLocationsAndAddressesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLocationsAndAddressesQuery, GetLocationsAndAddressesQueryVariables>(GetLocationsAndAddressesDocument, options);
      }
export function useGetLocationsAndAddressesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLocationsAndAddressesQuery, GetLocationsAndAddressesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLocationsAndAddressesQuery, GetLocationsAndAddressesQueryVariables>(GetLocationsAndAddressesDocument, options);
        }
export function useGetLocationsAndAddressesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetLocationsAndAddressesQuery, GetLocationsAndAddressesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetLocationsAndAddressesQuery, GetLocationsAndAddressesQueryVariables>(GetLocationsAndAddressesDocument, options);
        }
export type GetLocationsAndAddressesQueryHookResult = ReturnType<typeof useGetLocationsAndAddressesQuery>;
export type GetLocationsAndAddressesLazyQueryHookResult = ReturnType<typeof useGetLocationsAndAddressesLazyQuery>;
export type GetLocationsAndAddressesSuspenseQueryHookResult = ReturnType<typeof useGetLocationsAndAddressesSuspenseQuery>;
export type GetLocationsAndAddressesQueryResult = Apollo.QueryResult<GetLocationsAndAddressesQuery, GetLocationsAndAddressesQueryVariables>;