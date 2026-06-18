import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpsertFormInvitationCompetionDocument = gql`
    mutation upsertFormInvitationCompetion($invitationId: uuid!, $completion: String!) {
  update_FormInvitation(
    _set: {completion: $completion}
    where: {id: {_eq: $invitationId}}
  ) {
    affected_rows
  }
}
    `;
export type UpsertFormInvitationCompetionMutationFn = Apollo.MutationFunction<Types.UpsertFormInvitationCompetionMutation, Types.UpsertFormInvitationCompetionMutationVariables>;

/**
 * __useUpsertFormInvitationCompetionMutation__
 *
 * To run a mutation, you first call `useUpsertFormInvitationCompetionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertFormInvitationCompetionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertFormInvitationCompetionMutation, { data, loading, error }] = useUpsertFormInvitationCompetionMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      completion: // value for 'completion'
 *   },
 * });
 */
export function useUpsertFormInvitationCompetionMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpsertFormInvitationCompetionMutation, Types.UpsertFormInvitationCompetionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpsertFormInvitationCompetionMutation, Types.UpsertFormInvitationCompetionMutationVariables>(UpsertFormInvitationCompetionDocument, options);
      }
export type UpsertFormInvitationCompetionMutationHookResult = ReturnType<typeof useUpsertFormInvitationCompetionMutation>;
export type UpsertFormInvitationCompetionMutationResult = Apollo.MutationResult<Types.UpsertFormInvitationCompetionMutation>;
export type UpsertFormInvitationCompetionMutationOptions = Apollo.BaseMutationOptions<Types.UpsertFormInvitationCompetionMutation, Types.UpsertFormInvitationCompetionMutationVariables>;