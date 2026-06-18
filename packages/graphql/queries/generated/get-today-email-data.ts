import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetTodayEmailDataDocument = gql`
    query getTodayEmailData($startDate: timestamptz, $endDate: timestamptz, $status: String, $limit: Int) {
  EmailNotifications(
    where: {created_at: {_gte: $startDate, _lte: $endDate}, status: {_eq: $status}}
    limit: $limit
  ) {
    id
    emailId
    subject
    invitationId
    mailBody
    configData
    ccEmails
    bccEmailId
  }
}
    `;

/**
 * __useGetTodayEmailDataQuery__
 *
 * To run a query within a React component, call `useGetTodayEmailDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTodayEmailDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTodayEmailDataQuery({
 *   variables: {
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      status: // value for 'status'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetTodayEmailDataQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetTodayEmailDataQuery, Types.GetTodayEmailDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetTodayEmailDataQuery, Types.GetTodayEmailDataQueryVariables>(GetTodayEmailDataDocument, options);
      }
export function useGetTodayEmailDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetTodayEmailDataQuery, Types.GetTodayEmailDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetTodayEmailDataQuery, Types.GetTodayEmailDataQueryVariables>(GetTodayEmailDataDocument, options);
        }
export type GetTodayEmailDataQueryHookResult = ReturnType<typeof useGetTodayEmailDataQuery>;
export type GetTodayEmailDataLazyQueryHookResult = ReturnType<typeof useGetTodayEmailDataLazyQuery>;
export type GetTodayEmailDataQueryResult = Apollo.QueryResult<Types.GetTodayEmailDataQuery, Types.GetTodayEmailDataQueryVariables>;