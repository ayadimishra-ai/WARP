import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetLatestAnsweredQuestionIdDocument = gql`
    query getLatestAnsweredQuestionId($invitationId: uuid) {
  FormSubmission(where: {invitationId: {_eq: $invitationId}}) {
    id
    invitationId
    Answers(
      order_by: {updated_at: desc}
      limit: 1
      where: {created_by: {_is_null: false}}
    ) {
      id
      questionId
    }
  }
}
    `;

/**
 * __useGetLatestAnsweredQuestionIdQuery__
 *
 * To run a query within a React component, call `useGetLatestAnsweredQuestionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLatestAnsweredQuestionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLatestAnsweredQuestionIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetLatestAnsweredQuestionIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetLatestAnsweredQuestionIdQuery, Types.GetLatestAnsweredQuestionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetLatestAnsweredQuestionIdQuery, Types.GetLatestAnsweredQuestionIdQueryVariables>(GetLatestAnsweredQuestionIdDocument, options);
      }
export function useGetLatestAnsweredQuestionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetLatestAnsweredQuestionIdQuery, Types.GetLatestAnsweredQuestionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetLatestAnsweredQuestionIdQuery, Types.GetLatestAnsweredQuestionIdQueryVariables>(GetLatestAnsweredQuestionIdDocument, options);
        }
export type GetLatestAnsweredQuestionIdQueryHookResult = ReturnType<typeof useGetLatestAnsweredQuestionIdQuery>;
export type GetLatestAnsweredQuestionIdLazyQueryHookResult = ReturnType<typeof useGetLatestAnsweredQuestionIdLazyQuery>;
export type GetLatestAnsweredQuestionIdQueryResult = Apollo.QueryResult<Types.GetLatestAnsweredQuestionIdQuery, Types.GetLatestAnsweredQuestionIdQueryVariables>;