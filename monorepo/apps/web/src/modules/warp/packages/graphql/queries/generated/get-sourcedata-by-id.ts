import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetSourceDataByIdDocument = gql`
    query getSourceDataById($sourceId: [uuid!]!) {
  Sources(where: {id: {_in: $sourceId}}) {
    id
    SourceFile {
      originalFileUrl
      originalFileName
      status
    }
  }
}
    `;

/**
 * __useGetSourceDataByIdQuery__
 *
 * To run a query within a React component, call `useGetSourceDataByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSourceDataByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSourceDataByIdQuery({
 *   variables: {
 *      sourceId: // value for 'sourceId'
 *   },
 * });
 */
export function useGetSourceDataByIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetSourceDataByIdQuery, Types.GetSourceDataByIdQueryVariables> & ({ variables: Types.GetSourceDataByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetSourceDataByIdQuery, Types.GetSourceDataByIdQueryVariables>(GetSourceDataByIdDocument, options);
      }
export function useGetSourceDataByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetSourceDataByIdQuery, Types.GetSourceDataByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetSourceDataByIdQuery, Types.GetSourceDataByIdQueryVariables>(GetSourceDataByIdDocument, options);
        }
// @ts-ignore
export function useGetSourceDataByIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetSourceDataByIdQuery, Types.GetSourceDataByIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetSourceDataByIdQuery, Types.GetSourceDataByIdQueryVariables>;
export function useGetSourceDataByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetSourceDataByIdQuery, Types.GetSourceDataByIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetSourceDataByIdQuery | undefined, Types.GetSourceDataByIdQueryVariables>;
export function useGetSourceDataByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetSourceDataByIdQuery, Types.GetSourceDataByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetSourceDataByIdQuery, Types.GetSourceDataByIdQueryVariables>(GetSourceDataByIdDocument, options);
        }
export type GetSourceDataByIdQueryHookResult = ReturnType<typeof useGetSourceDataByIdQuery>;
export type GetSourceDataByIdLazyQueryHookResult = ReturnType<typeof useGetSourceDataByIdLazyQuery>;
export type GetSourceDataByIdSuspenseQueryHookResult = ReturnType<typeof useGetSourceDataByIdSuspenseQuery>;
export type GetSourceDataByIdQueryResult = Apollo.QueryResult<Types.GetSourceDataByIdQuery, Types.GetSourceDataByIdQueryVariables>;