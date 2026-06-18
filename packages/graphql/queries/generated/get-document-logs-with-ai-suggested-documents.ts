import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetDocumentLogsWithAiSuggestedDocumentsDocument = gql`
    query GetDocumentLogsWithAISuggestedDocuments($where: DocumentLogs_bool_exp) {
  DocumentLogs(where: $where, order_by: [{createdAt: desc}]) {
    id
    originalFileName
    fileName
    fileSize
    fileUrl
    status
    createdAt
    createdBy
    deletedAt
    deletedBy
    cardName
    version
    aiSuggestedDocumentId
    expiryDate
    raraResponse
    error
    AISuggestedDocuments {
      id
      title
      isOther
    }
    CreatedByUser: UserByCreatedBy {
      id
      name
    }
    DeletedByUser: DeletedByUser {
      id
      name
    }
  }
}
    `;

/**
 * __useGetDocumentLogsWithAiSuggestedDocumentsQuery__
 *
 * To run a query within a React component, call `useGetDocumentLogsWithAiSuggestedDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentLogsWithAiSuggestedDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentLogsWithAiSuggestedDocumentsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetDocumentLogsWithAiSuggestedDocumentsQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetDocumentLogsWithAiSuggestedDocumentsQuery, Types.GetDocumentLogsWithAiSuggestedDocumentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetDocumentLogsWithAiSuggestedDocumentsQuery, Types.GetDocumentLogsWithAiSuggestedDocumentsQueryVariables>(GetDocumentLogsWithAiSuggestedDocumentsDocument, options);
      }
export function useGetDocumentLogsWithAiSuggestedDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetDocumentLogsWithAiSuggestedDocumentsQuery, Types.GetDocumentLogsWithAiSuggestedDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetDocumentLogsWithAiSuggestedDocumentsQuery, Types.GetDocumentLogsWithAiSuggestedDocumentsQueryVariables>(GetDocumentLogsWithAiSuggestedDocumentsDocument, options);
        }
export type GetDocumentLogsWithAiSuggestedDocumentsQueryHookResult = ReturnType<typeof useGetDocumentLogsWithAiSuggestedDocumentsQuery>;
export type GetDocumentLogsWithAiSuggestedDocumentsLazyQueryHookResult = ReturnType<typeof useGetDocumentLogsWithAiSuggestedDocumentsLazyQuery>;
export type GetDocumentLogsWithAiSuggestedDocumentsQueryResult = Apollo.QueryResult<Types.GetDocumentLogsWithAiSuggestedDocumentsQuery, Types.GetDocumentLogsWithAiSuggestedDocumentsQueryVariables>;