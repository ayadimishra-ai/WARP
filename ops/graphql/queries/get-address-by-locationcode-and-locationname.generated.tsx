import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAddressesByLocationCodeAndNameQueryVariables = Types.Exact<{
  locationName?: Types.InputMaybe<Types.Scalars['String']['input']>;
  organizationId?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type GetAddressesByLocationCodeAndNameQuery = { __typename?: 'query_root', OrganizationAddress: Array<{ __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', is_deleted: boolean, metadata?: any | null, latitude?: any | null, longitude?: any | null, client_master_id?: string | null, code?: string | null, facility_type?: string | null, full_address: string, name: string, ownership_type?: string | null, pincode?: string | null, type?: string | null, created_at: any, updated_at: any, city_id?: any | null, country_id?: any | null, created_by?: any | null, id: any, state_id?: any | null, updated_by?: any | null } }> };


export const GetAddressesByLocationCodeAndNameDocument = gql`
    query GetAddressesByLocationCodeAndName($locationName: String, $organizationId: uuid) {
  OrganizationAddress(
    where: {organization_id: {_eq: $organizationId}, Address: {name: {_ilike: $locationName}}}
  ) {
    Address {
      is_deleted
      metadata
      latitude
      longitude
      client_master_id
      code
      facility_type
      full_address
      name
      ownership_type
      pincode
      type
      created_at
      updated_at
      city_id
      country_id
      created_by
      id
      state_id
      updated_by
    }
  }
}
    `;

/**
 * __useGetAddressesByLocationCodeAndNameQuery__
 *
 * To run a query within a React component, call `useGetAddressesByLocationCodeAndNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressesByLocationCodeAndNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressesByLocationCodeAndNameQuery({
 *   variables: {
 *      locationName: // value for 'locationName'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetAddressesByLocationCodeAndNameQuery(baseOptions?: Apollo.QueryHookOptions<GetAddressesByLocationCodeAndNameQuery, GetAddressesByLocationCodeAndNameQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAddressesByLocationCodeAndNameQuery, GetAddressesByLocationCodeAndNameQueryVariables>(GetAddressesByLocationCodeAndNameDocument, options);
      }
export function useGetAddressesByLocationCodeAndNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAddressesByLocationCodeAndNameQuery, GetAddressesByLocationCodeAndNameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAddressesByLocationCodeAndNameQuery, GetAddressesByLocationCodeAndNameQueryVariables>(GetAddressesByLocationCodeAndNameDocument, options);
        }
export function useGetAddressesByLocationCodeAndNameSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAddressesByLocationCodeAndNameQuery, GetAddressesByLocationCodeAndNameQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAddressesByLocationCodeAndNameQuery, GetAddressesByLocationCodeAndNameQueryVariables>(GetAddressesByLocationCodeAndNameDocument, options);
        }
export type GetAddressesByLocationCodeAndNameQueryHookResult = ReturnType<typeof useGetAddressesByLocationCodeAndNameQuery>;
export type GetAddressesByLocationCodeAndNameLazyQueryHookResult = ReturnType<typeof useGetAddressesByLocationCodeAndNameLazyQuery>;
export type GetAddressesByLocationCodeAndNameSuspenseQueryHookResult = ReturnType<typeof useGetAddressesByLocationCodeAndNameSuspenseQuery>;
export type GetAddressesByLocationCodeAndNameQueryResult = Apollo.QueryResult<GetAddressesByLocationCodeAndNameQuery, GetAddressesByLocationCodeAndNameQueryVariables>;