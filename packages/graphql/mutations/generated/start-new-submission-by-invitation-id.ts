import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const StartNewSubmissionByInvitationIdDocument = gql`
    mutation startNewSubmissionByInvitationId($invitationId: uuid!) {
  update_FormInvitation(
    _set: {status: "Draft"}
    where: {_and: [{id: {_eq: $invitationId}}, {status: {_eq: "Invited"}}]}
  ) {
    affected_rows
  }
}
    `;
export type StartNewSubmissionByInvitationIdMutationFn = Apollo.MutationFunction<Types.StartNewSubmissionByInvitationIdMutation, Types.StartNewSubmissionByInvitationIdMutationVariables>;

/**
 * __useStartNewSubmissionByInvitationIdMutation__
 *
 * To run a mutation, you first call `useStartNewSubmissionByInvitationIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartNewSubmissionByInvitationIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startNewSubmissionByInvitationIdMutation, { data, loading, error }] = useStartNewSubmissionByInvitationIdMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useStartNewSubmissionByInvitationIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.StartNewSubmissionByInvitationIdMutation, Types.StartNewSubmissionByInvitationIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.StartNewSubmissionByInvitationIdMutation, Types.StartNewSubmissionByInvitationIdMutationVariables>(StartNewSubmissionByInvitationIdDocument, options);
      }
export type StartNewSubmissionByInvitationIdMutationHookResult = ReturnType<typeof useStartNewSubmissionByInvitationIdMutation>;
export type StartNewSubmissionByInvitationIdMutationResult = Apollo.MutationResult<Types.StartNewSubmissionByInvitationIdMutation>;
export type StartNewSubmissionByInvitationIdMutationOptions = Apollo.BaseMutationOptions<Types.StartNewSubmissionByInvitationIdMutation, Types.StartNewSubmissionByInvitationIdMutationVariables>;