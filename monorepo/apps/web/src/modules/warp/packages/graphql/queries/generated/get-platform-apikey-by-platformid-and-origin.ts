import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetPlatformApikeyByPlatformIdAndOriginDocument = gql`
    query getPlatformApikeyByPlatformIdAndOrigin($platformId: uuid!) {
  Platform(where: {id: {_eq: $platformId}}) {
    id
    apiKey
  }
}
    `;

/**
 * __useGetPlatformApikeyByPlatformIdAndOriginQuery__
 *
 * To run a query within a React component, call `useGetPlatformApikeyByPlatformIdAndOriginQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPlatformApikeyByPlatformIdAndOriginQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPlatformApikeyByPlatformIdAndOriginQuery({
 *   variables: {
 *      platformId: // value for 'platformId'
 *   },
 * });
 */
export function useGetPlatformApikeyByPlatformIdAndOriginQuery(baseOptions: Apollo.QueryHookOptions<Types.GetPlatformApikeyByPlatformIdAndOriginQuery, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables> & ({ variables: Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetPlatformApikeyByPlatformIdAndOriginQuery, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables>(GetPlatformApikeyByPlatformIdAndOriginDocument, options);
      }
export function useGetPlatformApikeyByPlatformIdAndOriginLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetPlatformApikeyByPlatformIdAndOriginQuery, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetPlatformApikeyByPlatformIdAndOriginQuery, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables>(GetPlatformApikeyByPlatformIdAndOriginDocument, options);
        }
// @ts-ignore
export function useGetPlatformApikeyByPlatformIdAndOriginSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetPlatformApikeyByPlatformIdAndOriginQuery, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetPlatformApikeyByPlatformIdAndOriginQuery, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables>;
export function useGetPlatformApikeyByPlatformIdAndOriginSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetPlatformApikeyByPlatformIdAndOriginQuery, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetPlatformApikeyByPlatformIdAndOriginQuery | undefined, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables>;
export function useGetPlatformApikeyByPlatformIdAndOriginSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetPlatformApikeyByPlatformIdAndOriginQuery, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetPlatformApikeyByPlatformIdAndOriginQuery, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables>(GetPlatformApikeyByPlatformIdAndOriginDocument, options);
        }
export type GetPlatformApikeyByPlatformIdAndOriginQueryHookResult = ReturnType<typeof useGetPlatformApikeyByPlatformIdAndOriginQuery>;
export type GetPlatformApikeyByPlatformIdAndOriginLazyQueryHookResult = ReturnType<typeof useGetPlatformApikeyByPlatformIdAndOriginLazyQuery>;
export type GetPlatformApikeyByPlatformIdAndOriginSuspenseQueryHookResult = ReturnType<typeof useGetPlatformApikeyByPlatformIdAndOriginSuspenseQuery>;
export type GetPlatformApikeyByPlatformIdAndOriginQueryResult = Apollo.QueryResult<Types.GetPlatformApikeyByPlatformIdAndOriginQuery, Types.GetPlatformApikeyByPlatformIdAndOriginQueryVariables>;