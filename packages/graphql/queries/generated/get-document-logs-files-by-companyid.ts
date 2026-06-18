import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetDocumentLogsFilesByCompanyIdDocument = gql`
    query getDocumentLogsFilesByCompanyId($companyId: uuid) {
  DocumentLogs(where: {companyId: {_eq: $companyId}}) {
    id
    companyId
    originalFileName
    status
    aiSuggestedDocumentId
    updatedBy
    updatedAt
    fileSize
    fileName
    fileUrl
    createdBy
    error
    deletedBy
    deletedAt
  }
}
    `;

/**
 * __useGetDocumentLogsFilesByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetDocumentLogsFilesByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentLogsFilesByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentLogsFilesByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetDocumentLogsFilesByCompanyIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetDocumentLogsFilesByCompanyIdQuery, Types.GetDocumentLogsFilesByCompanyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetDocumentLogsFilesByCompanyIdQuery, Types.GetDocumentLogsFilesByCompanyIdQueryVariables>(GetDocumentLogsFilesByCompanyIdDocument, options);
      }
export function useGetDocumentLogsFilesByCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetDocumentLogsFilesByCompanyIdQuery, Types.GetDocumentLogsFilesByCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetDocumentLogsFilesByCompanyIdQuery, Types.GetDocumentLogsFilesByCompanyIdQueryVariables>(GetDocumentLogsFilesByCompanyIdDocument, options);
        }
export type GetDocumentLogsFilesByCompanyIdQueryHookResult = ReturnType<typeof useGetDocumentLogsFilesByCompanyIdQuery>;
export type GetDocumentLogsFilesByCompanyIdLazyQueryHookResult = ReturnType<typeof useGetDocumentLogsFilesByCompanyIdLazyQuery>;
export type GetDocumentLogsFilesByCompanyIdQueryResult = Apollo.QueryResult<Types.GetDocumentLogsFilesByCompanyIdQuery, Types.GetDocumentLogsFilesByCompanyIdQueryVariables>;