import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateInvitationToDraftByInvitationIdDocument = gql`
    mutation updateInvitationToDraftByInvitationId($invitationId: [uuid!]!) {
  update_FormInvitation(
    _set: {status: "Draft"}
    where: {_and: [{id: {_in: $invitationId}}, {status: {_eq: "Invited"}}]}
  ) {
    affected_rows
  }
}
    `;
export type UpdateInvitationToDraftByInvitationIdMutationFn = Apollo.MutationFunction<Types.UpdateInvitationToDraftByInvitationIdMutation, Types.UpdateInvitationToDraftByInvitationIdMutationVariables>;

/**
 * __useUpdateInvitationToDraftByInvitationIdMutation__
 *
 * To run a mutation, you first call `useUpdateInvitationToDraftByInvitationIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInvitationToDraftByInvitationIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInvitationToDraftByInvitationIdMutation, { data, loading, error }] = useUpdateInvitationToDraftByInvitationIdMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useUpdateInvitationToDraftByInvitationIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateInvitationToDraftByInvitationIdMutation, Types.UpdateInvitationToDraftByInvitationIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateInvitationToDraftByInvitationIdMutation, Types.UpdateInvitationToDraftByInvitationIdMutationVariables>(UpdateInvitationToDraftByInvitationIdDocument, options);
      }
export type UpdateInvitationToDraftByInvitationIdMutationHookResult = ReturnType<typeof useUpdateInvitationToDraftByInvitationIdMutation>;
export type UpdateInvitationToDraftByInvitationIdMutationResult = Apollo.MutationResult<Types.UpdateInvitationToDraftByInvitationIdMutation>;
export type UpdateInvitationToDraftByInvitationIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateInvitationToDraftByInvitationIdMutation, Types.UpdateInvitationToDraftByInvitationIdMutationVariables>;