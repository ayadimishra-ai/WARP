import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAiFileDataByFileIdQueryVariables = Types.Exact<{
  file_id: Types.Scalars['uuid']['input'];
}>;


export type GetAiFileDataByFileIdQuery = { __typename?: 'query_root', AIFileData: Array<{ __typename?: 'AIFileData', id: any, file_id: any }> };


export const GetAiFileDataByFileIdDocument = gql`
    query GetAIFileDataByFileId($file_id: uuid!) {
  AIFileData(where: {file_id: {_eq: $file_id}}) {
    id
    file_id
  }
}
    `;

/**
 * __useGetAiFileDataByFileIdQuery__
 *
 * To run a query within a React component, call `useGetAiFileDataByFileIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiFileDataByFileIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiFileDataByFileIdQuery({
 *   variables: {
 *      file_id: // value for 'file_id'
 *   },
 * });
 */
export function useGetAiFileDataByFileIdQuery(baseOptions: Apollo.QueryHookOptions<GetAiFileDataByFileIdQuery, GetAiFileDataByFileIdQueryVariables> & ({ variables: GetAiFileDataByFileIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAiFileDataByFileIdQuery, GetAiFileDataByFileIdQueryVariables>(GetAiFileDataByFileIdDocument, options);
      }
export function useGetAiFileDataByFileIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAiFileDataByFileIdQuery, GetAiFileDataByFileIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAiFileDataByFileIdQuery, GetAiFileDataByFileIdQueryVariables>(GetAiFileDataByFileIdDocument, options);
        }
export function useGetAiFileDataByFileIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAiFileDataByFileIdQuery, GetAiFileDataByFileIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAiFileDataByFileIdQuery, GetAiFileDataByFileIdQueryVariables>(GetAiFileDataByFileIdDocument, options);
        }
export type GetAiFileDataByFileIdQueryHookResult = ReturnType<typeof useGetAiFileDataByFileIdQuery>;
export type GetAiFileDataByFileIdLazyQueryHookResult = ReturnType<typeof useGetAiFileDataByFileIdLazyQuery>;
export type GetAiFileDataByFileIdSuspenseQueryHookResult = ReturnType<typeof useGetAiFileDataByFileIdSuspenseQuery>;
export type GetAiFileDataByFileIdQueryResult = Apollo.QueryResult<GetAiFileDataByFileIdQuery, GetAiFileDataByFileIdQueryVariables>;