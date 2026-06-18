import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetCountIfLocationIsMappedOrIfItsDataUploadedQueryVariables = Types.Exact<{
  address_id: Types.Scalars['uuid']['input'];
}>;


export type GetCountIfLocationIsMappedOrIfItsDataUploadedQuery = { __typename?: 'query_root', Addresses: Array<{ __typename?: 'Addresses', id: any, OrganizationAddresses: Array<{ __typename?: 'OrganizationAddress', id: any, UserOrganizationAddressMappings_aggregate: { __typename?: 'UserOrganizationAddressMapping_aggregate', aggregate?: { __typename?: 'UserOrganizationAddressMapping_aggregate_fields', count: number } | null }, TaskRequests_aggregate: { __typename?: 'TaskRequest_aggregate', aggregate?: { __typename?: 'TaskRequest_aggregate_fields', count: number } | null } }> }> };


export const GetCountIfLocationIsMappedOrIfItsDataUploadedDocument = gql`
    query getCountIfLocationIsMappedOrIfItsDataUploaded($address_id: uuid!) {
  Addresses(where: {id: {_eq: $address_id}}) {
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
 * __useGetCountIfLocationIsMappedOrIfItsDataUploadedQuery__
 *
 * To run a query within a React component, call `useGetCountIfLocationIsMappedOrIfItsDataUploadedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCountIfLocationIsMappedOrIfItsDataUploadedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCountIfLocationIsMappedOrIfItsDataUploadedQuery({
 *   variables: {
 *      address_id: // value for 'address_id'
 *   },
 * });
 */
export function useGetCountIfLocationIsMappedOrIfItsDataUploadedQuery(baseOptions: Apollo.QueryHookOptions<GetCountIfLocationIsMappedOrIfItsDataUploadedQuery, GetCountIfLocationIsMappedOrIfItsDataUploadedQueryVariables> & ({ variables: GetCountIfLocationIsMappedOrIfItsDataUploadedQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCountIfLocationIsMappedOrIfItsDataUploadedQuery, GetCountIfLocationIsMappedOrIfItsDataUploadedQueryVariables>(GetCountIfLocationIsMappedOrIfItsDataUploadedDocument, options);
      }
export function useGetCountIfLocationIsMappedOrIfItsDataUploadedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCountIfLocationIsMappedOrIfItsDataUploadedQuery, GetCountIfLocationIsMappedOrIfItsDataUploadedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCountIfLocationIsMappedOrIfItsDataUploadedQuery, GetCountIfLocationIsMappedOrIfItsDataUploadedQueryVariables>(GetCountIfLocationIsMappedOrIfItsDataUploadedDocument, options);
        }
export function useGetCountIfLocationIsMappedOrIfItsDataUploadedSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCountIfLocationIsMappedOrIfItsDataUploadedQuery, GetCountIfLocationIsMappedOrIfItsDataUploadedQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCountIfLocationIsMappedOrIfItsDataUploadedQuery, GetCountIfLocationIsMappedOrIfItsDataUploadedQueryVariables>(GetCountIfLocationIsMappedOrIfItsDataUploadedDocument, options);
        }
export type GetCountIfLocationIsMappedOrIfItsDataUploadedQueryHookResult = ReturnType<typeof useGetCountIfLocationIsMappedOrIfItsDataUploadedQuery>;
export type GetCountIfLocationIsMappedOrIfItsDataUploadedLazyQueryHookResult = ReturnType<typeof useGetCountIfLocationIsMappedOrIfItsDataUploadedLazyQuery>;
export type GetCountIfLocationIsMappedOrIfItsDataUploadedSuspenseQueryHookResult = ReturnType<typeof useGetCountIfLocationIsMappedOrIfItsDataUploadedSuspenseQuery>;
export type GetCountIfLocationIsMappedOrIfItsDataUploadedQueryResult = Apollo.QueryResult<GetCountIfLocationIsMappedOrIfItsDataUploadedQuery, GetCountIfLocationIsMappedOrIfItsDataUploadedQueryVariables>;