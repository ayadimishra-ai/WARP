import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateFormInvitationDocument = gql`
    mutation updateFormInvitation($invitationId: uuid!, $set: FormInvitation_set_input!) {
  update_FormInvitation(_set: $set, where: {id: {_eq: $invitationId}}) {
    affected_rows
    returning {
      id
      status
      metadata
    }
  }
}
    `;
export type UpdateFormInvitationMutationFn = Apollo.MutationFunction<Types.UpdateFormInvitationMutation, Types.UpdateFormInvitationMutationVariables>;

/**
 * __useUpdateFormInvitationMutation__
 *
 * To run a mutation, you first call `useUpdateFormInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFormInvitationMutation, { data, loading, error }] = useUpdateFormInvitationMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateFormInvitationMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateFormInvitationMutation, Types.UpdateFormInvitationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateFormInvitationMutation, Types.UpdateFormInvitationMutationVariables>(UpdateFormInvitationDocument, options);
      }
export type UpdateFormInvitationMutationHookResult = ReturnType<typeof useUpdateFormInvitationMutation>;
export type UpdateFormInvitationMutationResult = Apollo.MutationResult<Types.UpdateFormInvitationMutation>;
export type UpdateFormInvitationMutationOptions = Apollo.BaseMutationOptions<Types.UpdateFormInvitationMutation, Types.UpdateFormInvitationMutationVariables>;