import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetDocumentsForExpiryDocument = gql`
    query GetDocumentsForExpiry($where_30: DocumentLogs_bool_exp!, $where_20: DocumentLogs_bool_exp!, $where_5: DocumentLogs_bool_exp!, $where_expired: DocumentLogs_bool_exp!) {
  reminder_30: DocumentLogs(where: $where_30) {
    id
    fileName
    originalFileName
    expiryDate
    createdBy
    companyId
    metadata
  }
  reminder_20: DocumentLogs(where: $where_20) {
    id
    fileName
    originalFileName
    expiryDate
    createdBy
    companyId
    metadata
  }
  reminder_5: DocumentLogs(where: $where_5) {
    id
    fileName
    originalFileName
    expiryDate
    createdBy
    companyId
    metadata
  }
  expired: DocumentLogs(where: $where_expired) {
    id
    fileName
    originalFileName
    expiryDate
    createdBy
    companyId
    metadata
  }
}
    `;

/**
 * __useGetDocumentsForExpiryQuery__
 *
 * To run a query within a React component, call `useGetDocumentsForExpiryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentsForExpiryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentsForExpiryQuery({
 *   variables: {
 *      where_30: // value for 'where_30'
 *      where_20: // value for 'where_20'
 *      where_5: // value for 'where_5'
 *      where_expired: // value for 'where_expired'
 *   },
 * });
 */
export function useGetDocumentsForExpiryQuery(baseOptions: Apollo.QueryHookOptions<Types.GetDocumentsForExpiryQuery, Types.GetDocumentsForExpiryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetDocumentsForExpiryQuery, Types.GetDocumentsForExpiryQueryVariables>(GetDocumentsForExpiryDocument, options);
      }
export function useGetDocumentsForExpiryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetDocumentsForExpiryQuery, Types.GetDocumentsForExpiryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetDocumentsForExpiryQuery, Types.GetDocumentsForExpiryQueryVariables>(GetDocumentsForExpiryDocument, options);
        }
export type GetDocumentsForExpiryQueryHookResult = ReturnType<typeof useGetDocumentsForExpiryQuery>;
export type GetDocumentsForExpiryLazyQueryHookResult = ReturnType<typeof useGetDocumentsForExpiryLazyQuery>;
export type GetDocumentsForExpiryQueryResult = Apollo.QueryResult<Types.GetDocumentsForExpiryQuery, Types.GetDocumentsForExpiryQueryVariables>;