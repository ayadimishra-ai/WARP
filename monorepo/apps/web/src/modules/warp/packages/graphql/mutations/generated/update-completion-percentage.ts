import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateCompletionPercentageDocument = gql`
    mutation updateCompletionPercentage($invitationId: uuid!, $completionPercentage: String!) {
  update_FormInvitation(
    _set: {completion: $completionPercentage}
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
export type UpdateCompletionPercentageMutationFn = Apollo.MutationFunction<Types.UpdateCompletionPercentageMutation, Types.UpdateCompletionPercentageMutationVariables>;

/**
 * __useUpdateCompletionPercentageMutation__
 *
 * To run a mutation, you first call `useUpdateCompletionPercentageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompletionPercentageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompletionPercentageMutation, { data, loading, error }] = useUpdateCompletionPercentageMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      completionPercentage: // value for 'completionPercentage'
 *   },
 * });
 */
export function useUpdateCompletionPercentageMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateCompletionPercentageMutation, Types.UpdateCompletionPercentageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateCompletionPercentageMutation, Types.UpdateCompletionPercentageMutationVariables>(UpdateCompletionPercentageDocument, options);
      }
export type UpdateCompletionPercentageMutationHookResult = ReturnType<typeof useUpdateCompletionPercentageMutation>;
export type UpdateCompletionPercentageMutationResult = Apollo.MutationResult<Types.UpdateCompletionPercentageMutation>;
export type UpdateCompletionPercentageMutationOptions = Apollo.BaseMutationOptions<Types.UpdateCompletionPercentageMutation, Types.UpdateCompletionPercentageMutationVariables>;