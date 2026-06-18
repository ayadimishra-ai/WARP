import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpsertFormResultDocument = gql`
    mutation upsertFormResult($invitationId: uuid!, $invitationStatus: String!, $input: [FormResult_insert_input!]!, $interimCheck: jsonb!) {
  insert_FormResult(
    objects: $input
    on_conflict: {constraint: FormResult_pkey, update_columns: [score, recommendations]}
  ) {
    affected_rows
  }
  update_FormInvitation(
    _set: {status: $invitationStatus, interimCheck: $interimCheck}
    where: {id: {_eq: $invitationId}}
  ) {
    affected_rows
  }
}
    `;
export type UpsertFormResultMutationFn = Apollo.MutationFunction<Types.UpsertFormResultMutation, Types.UpsertFormResultMutationVariables>;

/**
 * __useUpsertFormResultMutation__
 *
 * To run a mutation, you first call `useUpsertFormResultMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertFormResultMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertFormResultMutation, { data, loading, error }] = useUpsertFormResultMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      invitationStatus: // value for 'invitationStatus'
 *      input: // value for 'input'
 *      interimCheck: // value for 'interimCheck'
 *   },
 * });
 */
export function useUpsertFormResultMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpsertFormResultMutation, Types.UpsertFormResultMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpsertFormResultMutation, Types.UpsertFormResultMutationVariables>(UpsertFormResultDocument, options);
      }
export type UpsertFormResultMutationHookResult = ReturnType<typeof useUpsertFormResultMutation>;
export type UpsertFormResultMutationResult = Apollo.MutationResult<Types.UpsertFormResultMutation>;
export type UpsertFormResultMutationOptions = Apollo.BaseMutationOptions<Types.UpsertFormResultMutation, Types.UpsertFormResultMutationVariables>;