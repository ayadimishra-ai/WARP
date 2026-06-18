import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetProcessingAndUploadingFilesWithCountQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetProcessingAndUploadingFilesWithCountQuery = { __typename?: 'query_root', AIFileUploads_aggregate: { __typename?: 'AIFileUploads_aggregate', aggregate?: { __typename?: 'AIFileUploads_aggregate_fields', count: number } | null } };


export const GetProcessingAndUploadingFilesWithCountDocument = gql`
    query GetProcessingAndUploadingFilesWithCount {
  AIFileUploads_aggregate(
    where: {status: {_in: ["Processing", "Uploading"]}, is_deleted: {_eq: false}}
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetProcessingAndUploadingFilesWithCountQuery__
 *
 * To run a query within a React component, call `useGetProcessingAndUploadingFilesWithCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProcessingAndUploadingFilesWithCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProcessingAndUploadingFilesWithCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetProcessingAndUploadingFilesWithCountQuery(baseOptions?: Apollo.QueryHookOptions<GetProcessingAndUploadingFilesWithCountQuery, GetProcessingAndUploadingFilesWithCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProcessingAndUploadingFilesWithCountQuery, GetProcessingAndUploadingFilesWithCountQueryVariables>(GetProcessingAndUploadingFilesWithCountDocument, options);
      }
export function useGetProcessingAndUploadingFilesWithCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProcessingAndUploadingFilesWithCountQuery, GetProcessingAndUploadingFilesWithCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProcessingAndUploadingFilesWithCountQuery, GetProcessingAndUploadingFilesWithCountQueryVariables>(GetProcessingAndUploadingFilesWithCountDocument, options);
        }
export function useGetProcessingAndUploadingFilesWithCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProcessingAndUploadingFilesWithCountQuery, GetProcessingAndUploadingFilesWithCountQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProcessingAndUploadingFilesWithCountQuery, GetProcessingAndUploadingFilesWithCountQueryVariables>(GetProcessingAndUploadingFilesWithCountDocument, options);
        }
export type GetProcessingAndUploadingFilesWithCountQueryHookResult = ReturnType<typeof useGetProcessingAndUploadingFilesWithCountQuery>;
export type GetProcessingAndUploadingFilesWithCountLazyQueryHookResult = ReturnType<typeof useGetProcessingAndUploadingFilesWithCountLazyQuery>;
export type GetProcessingAndUploadingFilesWithCountSuspenseQueryHookResult = ReturnType<typeof useGetProcessingAndUploadingFilesWithCountSuspenseQuery>;
export type GetProcessingAndUploadingFilesWithCountQueryResult = Apollo.QueryResult<GetProcessingAndUploadingFilesWithCountQuery, GetProcessingAndUploadingFilesWithCountQueryVariables>;