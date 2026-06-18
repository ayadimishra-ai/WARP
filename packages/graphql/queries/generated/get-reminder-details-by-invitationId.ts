import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetReminderDetailsByInvitationIdDocument = gql`
    query getReminderDetailsByInvitationId($invitationId: uuid!) {
  Interim_Recommendation(
    where: {Interim_Answer: {FormSubmission: {invitationId: {_eq: $invitationId}}}}
  ) {
    id
    expectedDate
    recommendations
    interim_answer_id
    ReminderIntervalAfterDueDate
  }
}
    `;

/**
 * __useGetReminderDetailsByInvitationIdQuery__
 *
 * To run a query within a React component, call `useGetReminderDetailsByInvitationIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReminderDetailsByInvitationIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReminderDetailsByInvitationIdQuery({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useGetReminderDetailsByInvitationIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetReminderDetailsByInvitationIdQuery, Types.GetReminderDetailsByInvitationIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetReminderDetailsByInvitationIdQuery, Types.GetReminderDetailsByInvitationIdQueryVariables>(GetReminderDetailsByInvitationIdDocument, options);
      }
export function useGetReminderDetailsByInvitationIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetReminderDetailsByInvitationIdQuery, Types.GetReminderDetailsByInvitationIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetReminderDetailsByInvitationIdQuery, Types.GetReminderDetailsByInvitationIdQueryVariables>(GetReminderDetailsByInvitationIdDocument, options);
        }
export type GetReminderDetailsByInvitationIdQueryHookResult = ReturnType<typeof useGetReminderDetailsByInvitationIdQuery>;
export type GetReminderDetailsByInvitationIdLazyQueryHookResult = ReturnType<typeof useGetReminderDetailsByInvitationIdLazyQuery>;
export type GetReminderDetailsByInvitationIdQueryResult = Apollo.QueryResult<Types.GetReminderDetailsByInvitationIdQuery, Types.GetReminderDetailsByInvitationIdQueryVariables>;