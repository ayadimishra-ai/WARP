import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetDocumentLogsDocument = gql`
    query GetDocumentLogs($where: DocumentLogs_bool_exp!) {
  DocumentLogs(where: $where, order_by: {createdAt: desc}) {
    AISuggestedDocuments {
      title
      isOther
      id
      masterDocumentKey
    }
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
    expiryDate
    error
    deletedBy
    deletedAt
    cardName
    version
    createdAt
    raraResponse
    uploadedFromInvitationId
    extractionPercentage
    UserByCreatedBy {
      id
      name
    }
  }
}
    `;

/**
 * __useGetDocumentLogsQuery__
 *
 * To run a query within a React component, call `useGetDocumentLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentLogsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetDocumentLogsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetDocumentLogsQuery, Types.GetDocumentLogsQueryVariables> & ({ variables: Types.GetDocumentLogsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetDocumentLogsQuery, Types.GetDocumentLogsQueryVariables>(GetDocumentLogsDocument, options);
      }
export function useGetDocumentLogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetDocumentLogsQuery, Types.GetDocumentLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetDocumentLogsQuery, Types.GetDocumentLogsQueryVariables>(GetDocumentLogsDocument, options);
        }
// @ts-ignore
export function useGetDocumentLogsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetDocumentLogsQuery, Types.GetDocumentLogsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetDocumentLogsQuery, Types.GetDocumentLogsQueryVariables>;
export function useGetDocumentLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetDocumentLogsQuery, Types.GetDocumentLogsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetDocumentLogsQuery | undefined, Types.GetDocumentLogsQueryVariables>;
export function useGetDocumentLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetDocumentLogsQuery, Types.GetDocumentLogsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetDocumentLogsQuery, Types.GetDocumentLogsQueryVariables>(GetDocumentLogsDocument, options);
        }
export type GetDocumentLogsQueryHookResult = ReturnType<typeof useGetDocumentLogsQuery>;
export type GetDocumentLogsLazyQueryHookResult = ReturnType<typeof useGetDocumentLogsLazyQuery>;
export type GetDocumentLogsSuspenseQueryHookResult = ReturnType<typeof useGetDocumentLogsSuspenseQuery>;
export type GetDocumentLogsQueryResult = Apollo.QueryResult<Types.GetDocumentLogsQuery, Types.GetDocumentLogsQueryVariables>;