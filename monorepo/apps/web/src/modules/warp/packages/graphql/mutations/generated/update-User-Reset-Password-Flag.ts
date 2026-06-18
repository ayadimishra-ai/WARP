import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateUserResetPasswordFlagDocument = gql`
    mutation updateUserResetPasswordFlag($id: uuid!) {
  update_User(where: {id: {_eq: $id}}, _set: {IsPasswordReset: true}) {
    affected_rows
  }
}
    `;
export type UpdateUserResetPasswordFlagMutationFn = Apollo.MutationFunction<Types.UpdateUserResetPasswordFlagMutation, Types.UpdateUserResetPasswordFlagMutationVariables>;

/**
 * __useUpdateUserResetPasswordFlagMutation__
 *
 * To run a mutation, you first call `useUpdateUserResetPasswordFlagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserResetPasswordFlagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserResetPasswordFlagMutation, { data, loading, error }] = useUpdateUserResetPasswordFlagMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUpdateUserResetPasswordFlagMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateUserResetPasswordFlagMutation, Types.UpdateUserResetPasswordFlagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateUserResetPasswordFlagMutation, Types.UpdateUserResetPasswordFlagMutationVariables>(UpdateUserResetPasswordFlagDocument, options);
      }
export type UpdateUserResetPasswordFlagMutationHookResult = ReturnType<typeof useUpdateUserResetPasswordFlagMutation>;
export type UpdateUserResetPasswordFlagMutationResult = Apollo.MutationResult<Types.UpdateUserResetPasswordFlagMutation>;
export type UpdateUserResetPasswordFlagMutationOptions = Apollo.BaseMutationOptions<Types.UpdateUserResetPasswordFlagMutation, Types.UpdateUserResetPasswordFlagMutationVariables>;