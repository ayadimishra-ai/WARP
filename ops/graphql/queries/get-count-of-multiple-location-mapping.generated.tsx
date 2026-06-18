import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryVariables = Types.Exact<{
  address_ids: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery = { __typename?: 'query_root', Addresses: Array<{ __typename?: 'Addresses', id: any, OrganizationAddresses: Array<{ __typename?: 'OrganizationAddress', id: any, UserOrganizationAddressMappings_aggregate: { __typename?: 'UserOrganizationAddressMapping_aggregate', aggregate?: { __typename?: 'UserOrganizationAddressMapping_aggregate_fields', count: number } | null }, TaskRequests_aggregate: { __typename?: 'TaskRequest_aggregate', aggregate?: { __typename?: 'TaskRequest_aggregate_fields', count: number } | null } }> }> };


export const GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedDocument = gql`
    query getCountIfMultipleLocationsAreMappedOrHaveDataUploaded($address_ids: [uuid!]!) {
  Addresses(where: {id: {_in: $address_ids}}) {
    id
    OrganizationAddresses {
      id
      UserOrganizationAddressMappings_aggregate(
        where: {AppUser: {role: {_eq: "LocationExecutive"}}}
      ) {
        aggregate {
          count
        }
      }
      TaskRequests_aggregate {
        aggregate {
          count
        }
      }
    }
  }
}
    `;

/**
 * __useGetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery__
 *
 * To run a query within a React component, call `useGetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery({
 *   variables: {
 *      address_ids: // value for 'address_ids'
 *   },
 * });
 */
export function useGetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery(baseOptions: Apollo.QueryHookOptions<GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery, GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryVariables> & ({ variables: GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery, GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryVariables>(GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedDocument, options);
      }
export function useGetCountIfMultipleLocationsAreMappedOrHaveDataUploadedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery, GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery, GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryVariables>(GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedDocument, options);
        }
export function useGetCountIfMultipleLocationsAreMappedOrHaveDataUploadedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery, GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery, GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryVariables>(GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedDocument, options);
        }
export type GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryHookResult = ReturnType<typeof useGetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery>;
export type GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedLazyQueryHookResult = ReturnType<typeof useGetCountIfMultipleLocationsAreMappedOrHaveDataUploadedLazyQuery>;
export type GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedSuspenseQueryHookResult = ReturnType<typeof useGetCountIfMultipleLocationsAreMappedOrHaveDataUploadedSuspenseQuery>;
export type GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryResult = Apollo.QueryResult<GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQuery, GetCountIfMultipleLocationsAreMappedOrHaveDataUploadedQueryVariables>;