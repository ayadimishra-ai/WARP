import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateFormInvitationInterimCheckByIdDocument = gql`
    mutation updateFormInvitationInterimCheckById($InvitationId: uuid, $InterimCheck: jsonb!, $Completion: String) {
  update_FormInvitation(
    where: {id: {_eq: $InvitationId}}
    _set: {interimCheck: $InterimCheck, completion: $Completion}
  ) {
    returning {
      id
    }
  }
}
    `;
export type UpdateFormInvitationInterimCheckByIdMutationFn = Apollo.MutationFunction<Types.UpdateFormInvitationInterimCheckByIdMutation, Types.UpdateFormInvitationInterimCheckByIdMutationVariables>;

/**
 * __useUpdateFormInvitationInterimCheckByIdMutation__
 *
 * To run a mutation, you first call `useUpdateFormInvitationInterimCheckByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormInvitationInterimCheckByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFormInvitationInterimCheckByIdMutation, { data, loading, error }] = useUpdateFormInvitationInterimCheckByIdMutation({
 *   variables: {
 *      InvitationId: // value for 'InvitationId'
 *      InterimCheck: // value for 'InterimCheck'
 *      Completion: // value for 'Completion'
 *   },
 * });
 */
export function useUpdateFormInvitationInterimCheckByIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateFormInvitationInterimCheckByIdMutation, Types.UpdateFormInvitationInterimCheckByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateFormInvitationInterimCheckByIdMutation, Types.UpdateFormInvitationInterimCheckByIdMutationVariables>(UpdateFormInvitationInterimCheckByIdDocument, options);
      }
export type UpdateFormInvitationInterimCheckByIdMutationHookResult = ReturnType<typeof useUpdateFormInvitationInterimCheckByIdMutation>;
export type UpdateFormInvitationInterimCheckByIdMutationResult = Apollo.MutationResult<Types.UpdateFormInvitationInterimCheckByIdMutation>;
export type UpdateFormInvitationInterimCheckByIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateFormInvitationInterimCheckByIdMutation, Types.UpdateFormInvitationInterimCheckByIdMutationVariables>;