import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateAppUserByIdMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  data: Types.AppUser_Set_Input;
}>;


export type UpdateAppUserByIdMutation = { __typename?: 'mutation_root', update_AppUser?: { __typename?: 'AppUser_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'AppUser', id: any, first_name?: string | null, last_name?: string | null, name: string }> } | null };


export const UpdateAppUserByIdDocument = gql`
    mutation updateAppUserById($id: uuid!, $data: AppUser_set_input!) {
  update_AppUser(where: {id: {_eq: $id}}, _set: $data) {
    affected_rows
    returning {
      id
      first_name
      last_name
      name
    }
  }
}
    `;
export type UpdateAppUserByIdMutationFn = Apollo.MutationFunction<UpdateAppUserByIdMutation, UpdateAppUserByIdMutationVariables>;

/**
 * __useUpdateAppUserByIdMutation__
 *
 * To run a mutation, you first call `useUpdateAppUserByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAppUserByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAppUserByIdMutation, { data, loading, error }] = useUpdateAppUserByIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateAppUserByIdMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAppUserByIdMutation, UpdateAppUserByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAppUserByIdMutation, UpdateAppUserByIdMutationVariables>(UpdateAppUserByIdDocument, options);
      }
export type UpdateAppUserByIdMutationHookResult = ReturnType<typeof useUpdateAppUserByIdMutation>;
export type UpdateAppUserByIdMutationResult = Apollo.MutationResult<UpdateAppUserByIdMutation>;
export type UpdateAppUserByIdMutationOptions = Apollo.BaseMutationOptions<UpdateAppUserByIdMutation, UpdateAppUserByIdMutationVariables>;