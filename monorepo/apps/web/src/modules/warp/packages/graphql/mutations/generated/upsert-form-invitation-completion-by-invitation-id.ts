import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpsertFormInvitationCompletionDocument = gql`
    mutation upsertFormInvitationCompletion($invitationId: uuid!, $completion: String!) {
  update_FormInvitation(
    _set: {completion: $completion}
    where: {id: {_eq: $invitationId}}
  ) {
    affected_rows
  }
}
    `;
export type UpsertFormInvitationCompletionMutationFn = Apollo.MutationFunction<Types.UpsertFormInvitationCompletionMutation, Types.UpsertFormInvitationCompletionMutationVariables>;

/**
 * __useUpsertFormInvitationCompletionMutation__
 *
 * To run a mutation, you first call `useUpsertFormInvitationCompletionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertFormInvitationCompletionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertFormInvitationCompletionMutation, { data, loading, error }] = useUpsertFormInvitationCompletionMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      completion: // value for 'completion'
 *   },
 * });
 */
export function useUpsertFormInvitationCompletionMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpsertFormInvitationCompletionMutation, Types.UpsertFormInvitationCompletionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpsertFormInvitationCompletionMutation, Types.UpsertFormInvitationCompletionMutationVariables>(UpsertFormInvitationCompletionDocument, options);
      }
export type UpsertFormInvitationCompletionMutationHookResult = ReturnType<typeof useUpsertFormInvitationCompletionMutation>;
export type UpsertFormInvitationCompletionMutationResult = Apollo.MutationResult<Types.UpsertFormInvitationCompletionMutation>;
export type UpsertFormInvitationCompletionMutationOptions = Apollo.BaseMutationOptions<Types.UpsertFormInvitationCompletionMutation, Types.UpsertFormInvitationCompletionMutationVariables>;