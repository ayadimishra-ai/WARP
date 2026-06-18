import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const DeleteUserDetailByIdDocument = gql`
    mutation deleteUserDetailById($id: uuid) {
  update_User(where: {id: {_eq: $id}}, _set: {isActive: false}) {
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
export type DeleteUserDetailByIdMutationFn = Apollo.MutationFunction<Types.DeleteUserDetailByIdMutation, Types.DeleteUserDetailByIdMutationVariables>;

/**
 * __useDeleteUserDetailByIdMutation__
 *
 * To run a mutation, you first call `useDeleteUserDetailByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserDetailByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserDetailByIdMutation, { data, loading, error }] = useDeleteUserDetailByIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteUserDetailByIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteUserDetailByIdMutation, Types.DeleteUserDetailByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteUserDetailByIdMutation, Types.DeleteUserDetailByIdMutationVariables>(DeleteUserDetailByIdDocument, options);
      }
export type DeleteUserDetailByIdMutationHookResult = ReturnType<typeof useDeleteUserDetailByIdMutation>;
export type DeleteUserDetailByIdMutationResult = Apollo.MutationResult<Types.DeleteUserDetailByIdMutation>;
export type DeleteUserDetailByIdMutationOptions = Apollo.BaseMutationOptions<Types.DeleteUserDetailByIdMutation, Types.DeleteUserDetailByIdMutationVariables>;