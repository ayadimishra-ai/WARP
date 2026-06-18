import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateAssesseeUserMappingResponderStatusByResponderDocument = gql`
    mutation UpdateAssesseeUserMappingResponderStatusByResponder($invitationId: uuid!, $userId: uuid!, $ResponderStatus: String!, $updatedAt: timestamptz!) {
  update_AssesseeUserMapping(
    _set: {updated_by: $userId, updated_at: $updatedAt, ResponderStatus: $ResponderStatus}
    where: {_and: [{InvitationId: {_eq: $invitationId}}, {userId: {_eq: $userId}}]}
  ) {
    affected_rows
  }
}
    `;
export type UpdateAssesseeUserMappingResponderStatusByResponderMutationFn = Apollo.MutationFunction<Types.UpdateAssesseeUserMappingResponderStatusByResponderMutation, Types.UpdateAssesseeUserMappingResponderStatusByResponderMutationVariables>;

/**
 * __useUpdateAssesseeUserMappingResponderStatusByResponderMutation__
 *
 * To run a mutation, you first call `useUpdateAssesseeUserMappingResponderStatusByResponderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAssesseeUserMappingResponderStatusByResponderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAssesseeUserMappingResponderStatusByResponderMutation, { data, loading, error }] = useUpdateAssesseeUserMappingResponderStatusByResponderMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      userId: // value for 'userId'
 *      ResponderStatus: // value for 'ResponderStatus'
 *      updatedAt: // value for 'updatedAt'
 *   },
 * });
 */
export function useUpdateAssesseeUserMappingResponderStatusByResponderMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateAssesseeUserMappingResponderStatusByResponderMutation, Types.UpdateAssesseeUserMappingResponderStatusByResponderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateAssesseeUserMappingResponderStatusByResponderMutation, Types.UpdateAssesseeUserMappingResponderStatusByResponderMutationVariables>(UpdateAssesseeUserMappingResponderStatusByResponderDocument, options);
      }
export type UpdateAssesseeUserMappingResponderStatusByResponderMutationHookResult = ReturnType<typeof useUpdateAssesseeUserMappingResponderStatusByResponderMutation>;
export type UpdateAssesseeUserMappingResponderStatusByResponderMutationResult = Apollo.MutationResult<Types.UpdateAssesseeUserMappingResponderStatusByResponderMutation>;
export type UpdateAssesseeUserMappingResponderStatusByResponderMutationOptions = Apollo.BaseMutationOptions<Types.UpdateAssesseeUserMappingResponderStatusByResponderMutation, Types.UpdateAssesseeUserMappingResponderStatusByResponderMutationVariables>;