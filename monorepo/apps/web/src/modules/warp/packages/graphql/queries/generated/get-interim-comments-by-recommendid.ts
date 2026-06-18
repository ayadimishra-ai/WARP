import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetinterimcommentsbyrecommendidDocument = gql`
    query getinterimcommentsbyrecommendid($recommendationId: uuid) {
  Interim_Comments(
    where: {interim_recommendation_id: {_eq: $recommendationId}}
    order_by: {created_at: asc}
  ) {
    id
    comments
    upload_document
    updated_by
    updated_at
    filename
    interim_recommendation_id
    created_by
    created_at
    User {
      id
      name
    }
    Interim_Recommendation {
      status
    }
  }
}
    `;

/**
 * __useGetinterimcommentsbyrecommendidQuery__
 *
 * To run a query within a React component, call `useGetinterimcommentsbyrecommendidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetinterimcommentsbyrecommendidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetinterimcommentsbyrecommendidQuery({
 *   variables: {
 *      recommendationId: // value for 'recommendationId'
 *   },
 * });
 */
export function useGetinterimcommentsbyrecommendidQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetinterimcommentsbyrecommendidQuery, Types.GetinterimcommentsbyrecommendidQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetinterimcommentsbyrecommendidQuery, Types.GetinterimcommentsbyrecommendidQueryVariables>(GetinterimcommentsbyrecommendidDocument, options);
      }
export function useGetinterimcommentsbyrecommendidLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetinterimcommentsbyrecommendidQuery, Types.GetinterimcommentsbyrecommendidQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetinterimcommentsbyrecommendidQuery, Types.GetinterimcommentsbyrecommendidQueryVariables>(GetinterimcommentsbyrecommendidDocument, options);
        }
// @ts-ignore
export function useGetinterimcommentsbyrecommendidSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetinterimcommentsbyrecommendidQuery, Types.GetinterimcommentsbyrecommendidQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetinterimcommentsbyrecommendidQuery, Types.GetinterimcommentsbyrecommendidQueryVariables>;
export function useGetinterimcommentsbyrecommendidSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetinterimcommentsbyrecommendidQuery, Types.GetinterimcommentsbyrecommendidQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetinterimcommentsbyrecommendidQuery | undefined, Types.GetinterimcommentsbyrecommendidQueryVariables>;
export function useGetinterimcommentsbyrecommendidSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetinterimcommentsbyrecommendidQuery, Types.GetinterimcommentsbyrecommendidQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetinterimcommentsbyrecommendidQuery, Types.GetinterimcommentsbyrecommendidQueryVariables>(GetinterimcommentsbyrecommendidDocument, options);
        }
export type GetinterimcommentsbyrecommendidQueryHookResult = ReturnType<typeof useGetinterimcommentsbyrecommendidQuery>;
export type GetinterimcommentsbyrecommendidLazyQueryHookResult = ReturnType<typeof useGetinterimcommentsbyrecommendidLazyQuery>;
export type GetinterimcommentsbyrecommendidSuspenseQueryHookResult = ReturnType<typeof useGetinterimcommentsbyrecommendidSuspenseQuery>;
export type GetinterimcommentsbyrecommendidQueryResult = Apollo.QueryResult<Types.GetinterimcommentsbyrecommendidQuery, Types.GetinterimcommentsbyrecommendidQueryVariables>;