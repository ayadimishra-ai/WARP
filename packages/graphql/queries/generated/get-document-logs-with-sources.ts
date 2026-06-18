import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetDocumentLogsWithSourcesDocument = gql`
    query GetDocumentLogsWithSources($where: DocumentLogs_bool_exp!, $limit: Int, $offset: Int, $order_by: [DocumentLogs_order_by!]) {
  DocumentLogs(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
    id
    companyId
    fileUrl
    originalFileName
    status
    createdAt
    createdBy
    fileName
    fileSize
    expiryDate
    documentLogsSources {
      id
      formInvitationId
      documentLogsId
      type
      url
      created_at
    }
    AISuggestedDocuments {
      title
      isOther
      id
    }
  }
}
    `;

/**
 * __useGetDocumentLogsWithSourcesQuery__
 *
 * To run a query within a React component, call `useGetDocumentLogsWithSourcesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentLogsWithSourcesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentLogsWithSourcesQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetDocumentLogsWithSourcesQuery(baseOptions: Apollo.QueryHookOptions<Types.GetDocumentLogsWithSourcesQuery, Types.GetDocumentLogsWithSourcesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetDocumentLogsWithSourcesQuery, Types.GetDocumentLogsWithSourcesQueryVariables>(GetDocumentLogsWithSourcesDocument, options);
      }
export function useGetDocumentLogsWithSourcesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetDocumentLogsWithSourcesQuery, Types.GetDocumentLogsWithSourcesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetDocumentLogsWithSourcesQuery, Types.GetDocumentLogsWithSourcesQueryVariables>(GetDocumentLogsWithSourcesDocument, options);
        }
export type GetDocumentLogsWithSourcesQueryHookResult = ReturnType<typeof useGetDocumentLogsWithSourcesQuery>;
export type GetDocumentLogsWithSourcesLazyQueryHookResult = ReturnType<typeof useGetDocumentLogsWithSourcesLazyQuery>;
export type GetDocumentLogsWithSourcesQueryResult = Apollo.QueryResult<Types.GetDocumentLogsWithSourcesQuery, Types.GetDocumentLogsWithSourcesQueryVariables>;