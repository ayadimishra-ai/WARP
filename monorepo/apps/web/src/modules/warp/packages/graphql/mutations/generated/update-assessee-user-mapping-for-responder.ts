import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateAssesseeUserMappingForResponderDocument = gql`
    mutation UpdateAssesseeUserMappingForResponder($invitationId: uuid!, $invitationStatus: String!, $userId: uuid!, $questionId: uuid!, $isResponder: Boolean, $updatedAt: timestamptz!, $responderStatus: String!) {
  update_AssesseeUserMapping(
    _set: {Status: $invitationStatus, updated_by: $userId, IsResponder: $isResponder, updated_at: $updatedAt, ResponderStatus: $responderStatus}
    where: {_and: [{InvitationId: {_eq: $invitationId}}, {questionId: {_eq: $questionId}}]}
  ) {
    affected_rows
  }
}
    `;
export type UpdateAssesseeUserMappingForResponderMutationFn = Apollo.MutationFunction<Types.UpdateAssesseeUserMappingForResponderMutation, Types.UpdateAssesseeUserMappingForResponderMutationVariables>;

/**
 * __useUpdateAssesseeUserMappingForResponderMutation__
 *
 * To run a mutation, you first call `useUpdateAssesseeUserMappingForResponderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAssesseeUserMappingForResponderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAssesseeUserMappingForResponderMutation, { data, loading, error }] = useUpdateAssesseeUserMappingForResponderMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      invitationStatus: // value for 'invitationStatus'
 *      userId: // value for 'userId'
 *      questionId: // value for 'questionId'
 *      isResponder: // value for 'isResponder'
 *      updatedAt: // value for 'updatedAt'
 *      responderStatus: // value for 'responderStatus'
 *   },
 * });
 */
export function useUpdateAssesseeUserMappingForResponderMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateAssesseeUserMappingForResponderMutation, Types.UpdateAssesseeUserMappingForResponderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateAssesseeUserMappingForResponderMutation, Types.UpdateAssesseeUserMappingForResponderMutationVariables>(UpdateAssesseeUserMappingForResponderDocument, options);
      }
export type UpdateAssesseeUserMappingForResponderMutationHookResult = ReturnType<typeof useUpdateAssesseeUserMappingForResponderMutation>;
export type UpdateAssesseeUserMappingForResponderMutationResult = Apollo.MutationResult<Types.UpdateAssesseeUserMappingForResponderMutation>;
export type UpdateAssesseeUserMappingForResponderMutationOptions = Apollo.BaseMutationOptions<Types.UpdateAssesseeUserMappingForResponderMutation, Types.UpdateAssesseeUserMappingForResponderMutationVariables>;