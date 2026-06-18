import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetDocumentLogsByFileNameAndSizeDocument = gql`
    query GetDocumentLogsByFileNameAndSize($where: DocumentLogs_bool_exp!) {
  DocumentLogs(where: $where) {
    id
    originalFileName
    fileSize
    aiSuggestedDocumentId
    AISuggestedDocuments {
      title
      isOther
    }
    status
    fileUrl
    createdBy
    companyId
    error
  }
}
    `;

/**
 * __useGetDocumentLogsByFileNameAndSizeQuery__
 *
 * To run a query within a React component, call `useGetDocumentLogsByFileNameAndSizeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentLogsByFileNameAndSizeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentLogsByFileNameAndSizeQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetDocumentLogsByFileNameAndSizeQuery(baseOptions: Apollo.QueryHookOptions<Types.GetDocumentLogsByFileNameAndSizeQuery, Types.GetDocumentLogsByFileNameAndSizeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetDocumentLogsByFileNameAndSizeQuery, Types.GetDocumentLogsByFileNameAndSizeQueryVariables>(GetDocumentLogsByFileNameAndSizeDocument, options);
      }
export function useGetDocumentLogsByFileNameAndSizeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetDocumentLogsByFileNameAndSizeQuery, Types.GetDocumentLogsByFileNameAndSizeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetDocumentLogsByFileNameAndSizeQuery, Types.GetDocumentLogsByFileNameAndSizeQueryVariables>(GetDocumentLogsByFileNameAndSizeDocument, options);
        }
export type GetDocumentLogsByFileNameAndSizeQueryHookResult = ReturnType<typeof useGetDocumentLogsByFileNameAndSizeQuery>;
export type GetDocumentLogsByFileNameAndSizeLazyQueryHookResult = ReturnType<typeof useGetDocumentLogsByFileNameAndSizeLazyQuery>;
export type GetDocumentLogsByFileNameAndSizeQueryResult = Apollo.QueryResult<Types.GetDocumentLogsByFileNameAndSizeQuery, Types.GetDocumentLogsByFileNameAndSizeQueryVariables>;