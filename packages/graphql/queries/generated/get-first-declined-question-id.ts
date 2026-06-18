import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetFirstDeclinedQuestionIdDocument = gql`
    query getFirstDeclinedQuestionId($invitationId: uuid!) {
  ReviewerDetailsMappingDeclined: ReviewerDetailsMapping(
    where: {_and: [{FormInvitationId: {_eq: $invitationId}}, {currentStatus: {_eq: "Declined"}}]}
    limit: 1
    order_by: {Question: {key: asc}}
  ) {
    id
    questionId
    created_at
  }
  ReviewerDetailsMappingResubmitted: ReviewerDetailsMapping(
    where: {_and: [{FormInvitationId: {_eq: $invitationId}}, {currentStatus: {_eq: "Re-Submitted"}}]}
    limit: 1
    order_by: {Question: {key: asc}}
  ) {
    id
    questionId
    created_at
  }
}
    `;

/**
 * __useGetFirstDeclinedQuestionIdQuery__
 *
 * To run a query within a React component, call `useGetFirstDeclinedQuestionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFirstDeclinedQuestionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFirstDeclinedQuestionIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetFirstDeclinedQuestionIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetFirstDeclinedQuestionIdQuery, Types.GetFirstDeclinedQuestionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetFirstDeclinedQuestionIdQuery, Types.GetFirstDeclinedQuestionIdQueryVariables>(GetFirstDeclinedQuestionIdDocument, options);
      }
export function useGetFirstDeclinedQuestionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetFirstDeclinedQuestionIdQuery, Types.GetFirstDeclinedQuestionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetFirstDeclinedQuestionIdQuery, Types.GetFirstDeclinedQuestionIdQueryVariables>(GetFirstDeclinedQuestionIdDocument, options);
        }
export type GetFirstDeclinedQuestionIdQueryHookResult = ReturnType<typeof useGetFirstDeclinedQuestionIdQuery>;
export type GetFirstDeclinedQuestionIdLazyQueryHookResult = ReturnType<typeof useGetFirstDeclinedQuestionIdLazyQuery>;
export type GetFirstDeclinedQuestionIdQueryResult = Apollo.QueryResult<Types.GetFirstDeclinedQuestionIdQuery, Types.GetFirstDeclinedQuestionIdQueryVariables>;