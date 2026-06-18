import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetLatestAssignedQuestionIdDocument = gql`
    query getLatestAssignedQuestionId($invitationId: uuid, $userId: uuid) {
  AssesseeUserMapping(
    where: {_and: [{userId: {_eq: $userId}}], InvitationId: {_eq: $invitationId}}
    limit: 1
    order_by: {updated_at: desc}
  ) {
    id
    userId
    questionId
    InvitationId
  }
}
    `;

/**
 * __useGetLatestAssignedQuestionIdQuery__
 *
 * To run a query within a React component, call `useGetLatestAssignedQuestionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLatestAssignedQuestionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLatestAssignedQuestionIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetLatestAssignedQuestionIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetLatestAssignedQuestionIdQuery, Types.GetLatestAssignedQuestionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetLatestAssignedQuestionIdQuery, Types.GetLatestAssignedQuestionIdQueryVariables>(GetLatestAssignedQuestionIdDocument, options);
      }
export function useGetLatestAssignedQuestionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetLatestAssignedQuestionIdQuery, Types.GetLatestAssignedQuestionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetLatestAssignedQuestionIdQuery, Types.GetLatestAssignedQuestionIdQueryVariables>(GetLatestAssignedQuestionIdDocument, options);
        }
export type GetLatestAssignedQuestionIdQueryHookResult = ReturnType<typeof useGetLatestAssignedQuestionIdQuery>;
export type GetLatestAssignedQuestionIdLazyQueryHookResult = ReturnType<typeof useGetLatestAssignedQuestionIdLazyQuery>;
export type GetLatestAssignedQuestionIdQueryResult = Apollo.QueryResult<Types.GetLatestAssignedQuestionIdQuery, Types.GetLatestAssignedQuestionIdQueryVariables>;