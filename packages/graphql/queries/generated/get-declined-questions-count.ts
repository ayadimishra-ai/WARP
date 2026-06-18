import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetDeclinedQuestionsCountDocument = gql`
    query getDeclinedQuestionsCount($invitationId: uuid!) {
  ReviewerDetailsMapping_aggregate(
    where: {_and: [{FormInvitationId: {_eq: $invitationId}}, {currentStatus: {_eq: "Declined"}}]}
  ) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetDeclinedQuestionsCountQuery__
 *
 * To run a query within a React component, call `useGetDeclinedQuestionsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDeclinedQuestionsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDeclinedQuestionsCountQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetDeclinedQuestionsCountQuery(baseOptions: Apollo.QueryHookOptions<Types.GetDeclinedQuestionsCountQuery, Types.GetDeclinedQuestionsCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetDeclinedQuestionsCountQuery, Types.GetDeclinedQuestionsCountQueryVariables>(GetDeclinedQuestionsCountDocument, options);
      }
export function useGetDeclinedQuestionsCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetDeclinedQuestionsCountQuery, Types.GetDeclinedQuestionsCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetDeclinedQuestionsCountQuery, Types.GetDeclinedQuestionsCountQueryVariables>(GetDeclinedQuestionsCountDocument, options);
        }
export type GetDeclinedQuestionsCountQueryHookResult = ReturnType<typeof useGetDeclinedQuestionsCountQuery>;
export type GetDeclinedQuestionsCountLazyQueryHookResult = ReturnType<typeof useGetDeclinedQuestionsCountLazyQuery>;
export type GetDeclinedQuestionsCountQueryResult = Apollo.QueryResult<Types.GetDeclinedQuestionsCountQuery, Types.GetDeclinedQuestionsCountQueryVariables>;