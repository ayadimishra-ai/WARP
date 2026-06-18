import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateSkipStatusByInvitationIdDocument = gql`
    mutation updateSkipStatusByInvitationId($status: Boolean, $formInvitationId: uuid!, $invitationStatus: String!) {
  update_FormInvitation(
    where: {id: {_eq: $formInvitationId}}
    _set: {status: $invitationStatus}
  ) {
    returning {
      id
      status
    }
  }
  insert_FormSubmission_one(
    object: {invitationId: $formInvitationId, isActive: true}
  ) {
    id
  }
}
    `;
export type UpdateSkipStatusByInvitationIdMutationFn = Apollo.MutationFunction<Types.UpdateSkipStatusByInvitationIdMutation, Types.UpdateSkipStatusByInvitationIdMutationVariables>;

/**
 * __useUpdateSkipStatusByInvitationIdMutation__
 *
 * To run a mutation, you first call `useUpdateSkipStatusByInvitationIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSkipStatusByInvitationIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSkipStatusByInvitationIdMutation, { data, loading, error }] = useUpdateSkipStatusByInvitationIdMutation({
 *   variables: {
 *      status: // value for 'status'
 *      formInvitationId: // value for 'formInvitationId'
 *      invitationStatus: // value for 'invitationStatus'
 *   },
 * });
 */
export function useUpdateSkipStatusByInvitationIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateSkipStatusByInvitationIdMutation, Types.UpdateSkipStatusByInvitationIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateSkipStatusByInvitationIdMutation, Types.UpdateSkipStatusByInvitationIdMutationVariables>(UpdateSkipStatusByInvitationIdDocument, options);
      }
export type UpdateSkipStatusByInvitationIdMutationHookResult = ReturnType<typeof useUpdateSkipStatusByInvitationIdMutation>;
export type UpdateSkipStatusByInvitationIdMutationResult = Apollo.MutationResult<Types.UpdateSkipStatusByInvitationIdMutation>;
export type UpdateSkipStatusByInvitationIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateSkipStatusByInvitationIdMutation, Types.UpdateSkipStatusByInvitationIdMutationVariables>;