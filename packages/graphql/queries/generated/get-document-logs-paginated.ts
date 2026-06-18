import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetDocumentLogsPaginatedDocument = gql`
    query GetDocumentLogsPaginated($companyId: uuid!, $limit: Int = 20, $cursor: timestamptz, $withCursor: Boolean = false, $searchTerm: String) {
  DocumentLogs(
    where: {companyId: {_eq: $companyId}, status: {_in: ["Processing", "Processed"]}, extractionPercentage: {_is_null: false}, _and: [{createdAt: {_lt: $cursor}}, {_or: [{originalFileName: {_ilike: $searchTerm}}, {fileName: {_ilike: $searchTerm}}, {_and: [{AISuggestedDocuments: {title: {_ilike: $searchTerm}}}, {AISuggestedDocuments: {isOther: {_neq: true}}}]}]}]}
    order_by: [{createdAt: desc}]
    limit: $limit
  ) @include(if: $withCursor) {
    id
    companyId
    originalFileName
    fileName
    fileUrl
    status
    extractionPercentage
    aiSuggestedDocumentId
    createdAt
    updatedAt
    AISuggestedDocuments {
      id
      title
      isOther
    }
  }
  DocumentLogsAll: DocumentLogs(
    where: {companyId: {_eq: $companyId}, status: {_in: ["Processing", "Processed"]}, extractionPercentage: {_is_null: false}, _or: [{originalFileName: {_ilike: $searchTerm}}, {fileName: {_ilike: $searchTerm}}, {_and: [{AISuggestedDocuments: {title: {_ilike: $searchTerm}}}, {AISuggestedDocuments: {isOther: {_neq: true}}}]}]}
    order_by: [{createdAt: desc}]
    limit: $limit
  ) @skip(if: $withCursor) {
    id
    companyId
    originalFileName
    fileName
    fileUrl
    status
    extractionPercentage
    aiSuggestedDocumentId
    createdAt
    updatedAt
    AISuggestedDocuments {
      id
      title
      isOther
    }
  }
}
    `;

/**
 * __useGetDocumentLogsPaginatedQuery__
 *
 * To run a query within a React component, call `useGetDocumentLogsPaginatedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentLogsPaginatedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentLogsPaginatedQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      limit: // value for 'limit'
 *      cursor: // value for 'cursor'
 *      withCursor: // value for 'withCursor'
 *      searchTerm: // value for 'searchTerm'
 *   },
 * });
 */
export function useGetDocumentLogsPaginatedQuery(baseOptions: Apollo.QueryHookOptions<Types.GetDocumentLogsPaginatedQuery, Types.GetDocumentLogsPaginatedQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetDocumentLogsPaginatedQuery, Types.GetDocumentLogsPaginatedQueryVariables>(GetDocumentLogsPaginatedDocument, options);
      }
export function useGetDocumentLogsPaginatedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetDocumentLogsPaginatedQuery, Types.GetDocumentLogsPaginatedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetDocumentLogsPaginatedQuery, Types.GetDocumentLogsPaginatedQueryVariables>(GetDocumentLogsPaginatedDocument, options);
        }
export type GetDocumentLogsPaginatedQueryHookResult = ReturnType<typeof useGetDocumentLogsPaginatedQuery>;
export type GetDocumentLogsPaginatedLazyQueryHookResult = ReturnType<typeof useGetDocumentLogsPaginatedLazyQuery>;
export type GetDocumentLogsPaginatedQueryResult = Apollo.QueryResult<Types.GetDocumentLogsPaginatedQuery, Types.GetDocumentLogsPaginatedQueryVariables>;