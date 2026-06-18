import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetQuestionnaireLogsDocument = gql`
    query GetQuestionnaireLogs($formid: uuid!, $limit: Int!, $offset: Int!, $where: newformslogs_bool_exp!, $orderBy: [newformslogs_order_by!]) {
  newformslogs(
    limit: $limit
    offset: $offset
    where: {_and: [{formid: {_eq: $formid}}, $where]}
    order_by: $orderBy
  ) {
    id
    event_type
    form_title
    number_of_questions
    time_in_minutes
    form_type
    created_at
    User {
      name
      email
    }
  }
  newformslogs_aggregate(where: {_and: [{formid: {_eq: $formid}}, $where]}) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetQuestionnaireLogsQuery__
 *
 * To run a query within a React component, call `useGetQuestionnaireLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetQuestionnaireLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetQuestionnaireLogsQuery({
 *   variables: {
 *      formid: // value for 'formid'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetQuestionnaireLogsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetQuestionnaireLogsQuery, Types.GetQuestionnaireLogsQueryVariables> & ({ variables: Types.GetQuestionnaireLogsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetQuestionnaireLogsQuery, Types.GetQuestionnaireLogsQueryVariables>(GetQuestionnaireLogsDocument, options);
      }
export function useGetQuestionnaireLogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetQuestionnaireLogsQuery, Types.GetQuestionnaireLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetQuestionnaireLogsQuery, Types.GetQuestionnaireLogsQueryVariables>(GetQuestionnaireLogsDocument, options);
        }
// @ts-ignore
export function useGetQuestionnaireLogsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetQuestionnaireLogsQuery, Types.GetQuestionnaireLogsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetQuestionnaireLogsQuery, Types.GetQuestionnaireLogsQueryVariables>;
export function useGetQuestionnaireLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetQuestionnaireLogsQuery, Types.GetQuestionnaireLogsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetQuestionnaireLogsQuery | undefined, Types.GetQuestionnaireLogsQueryVariables>;
export function useGetQuestionnaireLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetQuestionnaireLogsQuery, Types.GetQuestionnaireLogsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetQuestionnaireLogsQuery, Types.GetQuestionnaireLogsQueryVariables>(GetQuestionnaireLogsDocument, options);
        }
export type GetQuestionnaireLogsQueryHookResult = ReturnType<typeof useGetQuestionnaireLogsQuery>;
export type GetQuestionnaireLogsLazyQueryHookResult = ReturnType<typeof useGetQuestionnaireLogsLazyQuery>;
export type GetQuestionnaireLogsSuspenseQueryHookResult = ReturnType<typeof useGetQuestionnaireLogsSuspenseQuery>;
export type GetQuestionnaireLogsQueryResult = Apollo.QueryResult<Types.GetQuestionnaireLogsQuery, Types.GetQuestionnaireLogsQueryVariables>;