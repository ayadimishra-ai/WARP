import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateAssesseeUserMappingbyInvitationIdDocument = gql`
    mutation UpdateAssesseeUserMappingbyInvitationId($invitationId: uuid!, $invitationStatus: String!, $userId: uuid!, $questionId: uuid!, $updatedAt: timestamptz!) {
  update_AssesseeUserMapping(
    _set: {Status: $invitationStatus, updated_by: $userId, updated_at: $updatedAt}
    where: {_and: [{InvitationId: {_eq: $invitationId}}, {questionId: {_eq: $questionId}}]}
  ) {
    affected_rows
  }
}
    `;
export type UpdateAssesseeUserMappingbyInvitationIdMutationFn = Apollo.MutationFunction<Types.UpdateAssesseeUserMappingbyInvitationIdMutation, Types.UpdateAssesseeUserMappingbyInvitationIdMutationVariables>;

/**
 * __useUpdateAssesseeUserMappingbyInvitationIdMutation__
 *
 * To run a mutation, you first call `useUpdateAssesseeUserMappingbyInvitationIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAssesseeUserMappingbyInvitationIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAssesseeUserMappingbyInvitationIdMutation, { data, loading, error }] = useUpdateAssesseeUserMappingbyInvitationIdMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      invitationStatus: // value for 'invitationStatus'
 *      userId: // value for 'userId'
 *      questionId: // value for 'questionId'
 *      updatedAt: // value for 'updatedAt'
 *   },
 * });
 */
export function useUpdateAssesseeUserMappingbyInvitationIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateAssesseeUserMappingbyInvitationIdMutation, Types.UpdateAssesseeUserMappingbyInvitationIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateAssesseeUserMappingbyInvitationIdMutation, Types.UpdateAssesseeUserMappingbyInvitationIdMutationVariables>(UpdateAssesseeUserMappingbyInvitationIdDocument, options);
      }
export type UpdateAssesseeUserMappingbyInvitationIdMutationHookResult = ReturnType<typeof useUpdateAssesseeUserMappingbyInvitationIdMutation>;
export type UpdateAssesseeUserMappingbyInvitationIdMutationResult = Apollo.MutationResult<Types.UpdateAssesseeUserMappingbyInvitationIdMutation>;
export type UpdateAssesseeUserMappingbyInvitationIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateAssesseeUserMappingbyInvitationIdMutation, Types.UpdateAssesseeUserMappingbyInvitationIdMutationVariables>;