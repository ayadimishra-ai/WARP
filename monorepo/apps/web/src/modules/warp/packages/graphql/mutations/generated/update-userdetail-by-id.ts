import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateUserDetailByIdDocument = gql`
    mutation updateUserDetailById($input: [User_updates!]!) {
  update_User_many(updates: $input) {
    affected_rows
    returning {
      id
      name
      email
      emailVerified
      phone
      phoneVerified
      image
      details
      companyId
      created_by
      updated_by
      isActive
    }
  }
}
    `;
export type UpdateUserDetailByIdMutationFn = Apollo.MutationFunction<Types.UpdateUserDetailByIdMutation, Types.UpdateUserDetailByIdMutationVariables>;

/**
 * __useUpdateUserDetailByIdMutation__
 *
 * To run a mutation, you first call `useUpdateUserDetailByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserDetailByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserDetailByIdMutation, { data, loading, error }] = useUpdateUserDetailByIdMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserDetailByIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateUserDetailByIdMutation, Types.UpdateUserDetailByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateUserDetailByIdMutation, Types.UpdateUserDetailByIdMutationVariables>(UpdateUserDetailByIdDocument, options);
      }
export type UpdateUserDetailByIdMutationHookResult = ReturnType<typeof useUpdateUserDetailByIdMutation>;
export type UpdateUserDetailByIdMutationResult = Apollo.MutationResult<Types.UpdateUserDetailByIdMutation>;
export type UpdateUserDetailByIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateUserDetailByIdMutation, Types.UpdateUserDetailByIdMutationVariables>;