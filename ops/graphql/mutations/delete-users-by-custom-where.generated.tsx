import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteAppUserMutationVariables = Types.Exact<{
  where: Types.AppUser_Bool_Exp;
}>;


export type DeleteAppUserMutation = { __typename?: 'mutation_root', delete_AppUser?: { __typename?: 'AppUser_mutation_response', returning: Array<{ __typename?: 'AppUser', id: any }> } | null };


export const DeleteAppUserDocument = gql`
    mutation deleteAppUser($where: AppUser_bool_exp!) {
  delete_AppUser(where: $where) {
    returning {
      id
    }
  }
}
    `;
export type DeleteAppUserMutationFn = Apollo.MutationFunction<DeleteAppUserMutation, DeleteAppUserMutationVariables>;

/**
 * __useDeleteAppUserMutation__
 *
 * To run a mutation, you first call `useDeleteAppUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAppUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAppUserMutation, { data, loading, error }] = useDeleteAppUserMutation({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useDeleteAppUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAppUserMutation, DeleteAppUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAppUserMutation, DeleteAppUserMutationVariables>(DeleteAppUserDocument, options);
      }
export type DeleteAppUserMutationHookResult = ReturnType<typeof useDeleteAppUserMutation>;
export type DeleteAppUserMutationResult = Apollo.MutationResult<DeleteAppUserMutation>;
export type DeleteAppUserMutationOptions = Apollo.BaseMutationOptions<DeleteAppUserMutation, DeleteAppUserMutationVariables>;