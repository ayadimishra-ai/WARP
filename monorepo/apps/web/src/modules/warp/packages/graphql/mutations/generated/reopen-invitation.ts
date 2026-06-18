import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const Reopen_InvitationDocument = gql`
    mutation reopen_invitation($companyId: uuid, $invitationId: uuid, $userId: uuid, $status: String) {
  update_FormInvitation(
    where: {companyId: {_eq: $companyId}, id: {_eq: $invitationId}}
    _set: {status: $status, updated_by: $userId, updated_at: "now()"}
  ) {
    returning {
      id
    }
  }
}
    `;
export type Reopen_InvitationMutationFn = Apollo.MutationFunction<Types.Reopen_InvitationMutation, Types.Reopen_InvitationMutationVariables>;

/**
 * __useReopen_InvitationMutation__
 *
 * To run a mutation, you first call `useReopen_InvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReopen_InvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reopenInvitationMutation, { data, loading, error }] = useReopen_InvitationMutation({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      invitationId: // value for 'invitationId'
 *      userId: // value for 'userId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useReopen_InvitationMutation(baseOptions?: Apollo.MutationHookOptions<Types.Reopen_InvitationMutation, Types.Reopen_InvitationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.Reopen_InvitationMutation, Types.Reopen_InvitationMutationVariables>(Reopen_InvitationDocument, options);
      }
export type Reopen_InvitationMutationHookResult = ReturnType<typeof useReopen_InvitationMutation>;
export type Reopen_InvitationMutationResult = Apollo.MutationResult<Types.Reopen_InvitationMutation>;
export type Reopen_InvitationMutationOptions = Apollo.BaseMutationOptions<Types.Reopen_InvitationMutation, Types.Reopen_InvitationMutationVariables>;