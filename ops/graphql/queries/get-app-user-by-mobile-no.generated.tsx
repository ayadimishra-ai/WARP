import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAppUserByMobileNoQueryVariables = Types.Exact<{
  mobileNo: Types.Scalars['String']['input'];
}>;


export type GetAppUserByMobileNoQuery = { __typename?: 'query_root', AppUser: Array<{ __typename?: 'AppUser', id: any, name: string, metadata?: any | null }> };


export const GetAppUserByMobileNoDocument = gql`
    query GetAppUserByMobileNo($mobileNo: String!) {
  AppUser(where: {metadata: {_contains: [{phonenumber: $mobileNo}]}}) {
    id
    name
    metadata
  }
}
    `;

/**
 * __useGetAppUserByMobileNoQuery__
 *
 * To run a query within a React component, call `useGetAppUserByMobileNoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAppUserByMobileNoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAppUserByMobileNoQuery({
 *   variables: {
 *      mobileNo: // value for 'mobileNo'
 *   },
 * });
 */
export function useGetAppUserByMobileNoQuery(baseOptions: Apollo.QueryHookOptions<GetAppUserByMobileNoQuery, GetAppUserByMobileNoQueryVariables> & ({ variables: GetAppUserByMobileNoQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAppUserByMobileNoQuery, GetAppUserByMobileNoQueryVariables>(GetAppUserByMobileNoDocument, options);
      }
export function useGetAppUserByMobileNoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAppUserByMobileNoQuery, GetAppUserByMobileNoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAppUserByMobileNoQuery, GetAppUserByMobileNoQueryVariables>(GetAppUserByMobileNoDocument, options);
        }
export function useGetAppUserByMobileNoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAppUserByMobileNoQuery, GetAppUserByMobileNoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAppUserByMobileNoQuery, GetAppUserByMobileNoQueryVariables>(GetAppUserByMobileNoDocument, options);
        }
export type GetAppUserByMobileNoQueryHookResult = ReturnType<typeof useGetAppUserByMobileNoQuery>;
export type GetAppUserByMobileNoLazyQueryHookResult = ReturnType<typeof useGetAppUserByMobileNoLazyQuery>;
export type GetAppUserByMobileNoSuspenseQueryHookResult = ReturnType<typeof useGetAppUserByMobileNoSuspenseQuery>;
export type GetAppUserByMobileNoQueryResult = Apollo.QueryResult<GetAppUserByMobileNoQuery, GetAppUserByMobileNoQueryVariables>;