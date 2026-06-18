import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertRecommendationReminderEmailsDocument = gql`
    mutation insertRecommendationReminderEmails($emailId: String!, $ccEmailId: String!, $subject: String!, $invitationId: uuid, $bccEmailId: String) {
  insert_EmailNotifications(
    objects: {emailId: $emailId, ccEmailId: $ccEmailId, subject: $subject, invitationId: $invitationId, bccEmailId: $bccEmailId}
  ) {
    affected_rows
    returning {
      id
      emailId
    }
  }
}
    `;
export type InsertRecommendationReminderEmailsMutationFn = Apollo.MutationFunction<Types.InsertRecommendationReminderEmailsMutation, Types.InsertRecommendationReminderEmailsMutationVariables>;

/**
 * __useInsertRecommendationReminderEmailsMutation__
 *
 * To run a mutation, you first call `useInsertRecommendationReminderEmailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertRecommendationReminderEmailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertRecommendationReminderEmailsMutation, { data, loading, error }] = useInsertRecommendationReminderEmailsMutation({
 *   variables: {
 *      emailId: // value for 'emailId'
 *      ccEmailId: // value for 'ccEmailId'
 *      subject: // value for 'subject'
 *      invitationId: // value for 'invitationId'
 *      bccEmailId: // value for 'bccEmailId'
 *   },
 * });
 */
export function useInsertRecommendationReminderEmailsMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertRecommendationReminderEmailsMutation, Types.InsertRecommendationReminderEmailsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertRecommendationReminderEmailsMutation, Types.InsertRecommendationReminderEmailsMutationVariables>(InsertRecommendationReminderEmailsDocument, options);
      }
export type InsertRecommendationReminderEmailsMutationHookResult = ReturnType<typeof useInsertRecommendationReminderEmailsMutation>;
export type InsertRecommendationReminderEmailsMutationResult = Apollo.MutationResult<Types.InsertRecommendationReminderEmailsMutation>;
export type InsertRecommendationReminderEmailsMutationOptions = Apollo.BaseMutationOptions<Types.InsertRecommendationReminderEmailsMutation, Types.InsertRecommendationReminderEmailsMutationVariables>;