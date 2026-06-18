import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateFormInvitationStatusDocument = gql`
    mutation updateFormInvitationStatus($invitationId: uuid!, $invitationStatus: String!) {
  update_FormInvitation(
    _set: {status: $invitationStatus}
    where: {id: {_eq: $invitationId}}
  ) {
    affected_rows
    returning {
      id
      status
    }
  }
}
    `;
export type UpdateFormInvitationStatusMutationFn = Apollo.MutationFunction<Types.UpdateFormInvitationStatusMutation, Types.UpdateFormInvitationStatusMutationVariables>;

/**
 * __useUpdateFormInvitationStatusMutation__
 *
 * To run a mutation, you first call `useUpdateFormInvitationStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormInvitationStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFormInvitationStatusMutation, { data, loading, error }] = useUpdateFormInvitationStatusMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      invitationStatus: // value for 'invitationStatus'
 *   },
 * });
 */
export function useUpdateFormInvitationStatusMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateFormInvitationStatusMutation, Types.UpdateFormInvitationStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateFormInvitationStatusMutation, Types.UpdateFormInvitationStatusMutationVariables>(UpdateFormInvitationStatusDocument, options);
      }
export type UpdateFormInvitationStatusMutationHookResult = ReturnType<typeof useUpdateFormInvitationStatusMutation>;
export type UpdateFormInvitationStatusMutationResult = Apollo.MutationResult<Types.UpdateFormInvitationStatusMutation>;
export type UpdateFormInvitationStatusMutationOptions = Apollo.BaseMutationOptions<Types.UpdateFormInvitationStatusMutation, Types.UpdateFormInvitationStatusMutationVariables>;