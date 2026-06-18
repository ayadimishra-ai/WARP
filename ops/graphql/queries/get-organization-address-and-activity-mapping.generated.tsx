import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetOrganizationAddressAndActivityMappingQueryVariables = Types.Exact<{
  userId: Types.Scalars['uuid']['input'];
}>;


export type GetOrganizationAddressAndActivityMappingQuery = { __typename?: 'query_root', UserOrganizationAddressMapping: Array<{ __typename?: 'UserOrganizationAddressMapping', id: any, activities: any, Organization: { __typename?: 'Organization', id: any, hasWasteWaterTreatmentPlant?: boolean | null }, OrganizationAddress?: { __typename?: 'OrganizationAddress', address_id: any, id: any, Address: { __typename?: 'Addresses', id: any, client_master_id?: string | null, ownership_type?: string | null, type?: string | null, name: string, is_wwtp: string } } | null }> };


export const GetOrganizationAddressAndActivityMappingDocument = gql`
    query getOrganizationAddressAndActivityMapping($userId: uuid!) {
  UserOrganizationAddressMapping(where: {user_id: {_eq: $userId}}) {
    id
    activities
    Organization {
      id
      hasWasteWaterTreatmentPlant
    }
    OrganizationAddress {
      address_id
      id
      Address {
        id
        client_master_id
        ownership_type
        type
        name
        is_wwtp
      }
    }
  }
}
    `;

/**
 * __useGetOrganizationAddressAndActivityMappingQuery__
 *
 * To run a query within a React component, call `useGetOrganizationAddressAndActivityMappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationAddressAndActivityMappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationAddressAndActivityMappingQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetOrganizationAddressAndActivityMappingQuery(baseOptions: Apollo.QueryHookOptions<GetOrganizationAddressAndActivityMappingQuery, GetOrganizationAddressAndActivityMappingQueryVariables> & ({ variables: GetOrganizationAddressAndActivityMappingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrganizationAddressAndActivityMappingQuery, GetOrganizationAddressAndActivityMappingQueryVariables>(GetOrganizationAddressAndActivityMappingDocument, options);
      }
export function useGetOrganizationAddressAndActivityMappingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrganizationAddressAndActivityMappingQuery, GetOrganizationAddressAndActivityMappingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrganizationAddressAndActivityMappingQuery, GetOrganizationAddressAndActivityMappingQueryVariables>(GetOrganizationAddressAndActivityMappingDocument, options);
        }
export function useGetOrganizationAddressAndActivityMappingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrganizationAddressAndActivityMappingQuery, GetOrganizationAddressAndActivityMappingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrganizationAddressAndActivityMappingQuery, GetOrganizationAddressAndActivityMappingQueryVariables>(GetOrganizationAddressAndActivityMappingDocument, options);
        }
export type GetOrganizationAddressAndActivityMappingQueryHookResult = ReturnType<typeof useGetOrganizationAddressAndActivityMappingQuery>;
export type GetOrganizationAddressAndActivityMappingLazyQueryHookResult = ReturnType<typeof useGetOrganizationAddressAndActivityMappingLazyQuery>;
export type GetOrganizationAddressAndActivityMappingSuspenseQueryHookResult = ReturnType<typeof useGetOrganizationAddressAndActivityMappingSuspenseQuery>;
export type GetOrganizationAddressAndActivityMappingQueryResult = Apollo.QueryResult<GetOrganizationAddressAndActivityMappingQuery, GetOrganizationAddressAndActivityMappingQueryVariables>;