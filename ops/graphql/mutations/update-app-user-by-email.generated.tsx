import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateAppUserByEmailMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  orgId: Types.Scalars['uuid']['input'];
  data: Types.AppUser_Set_Input;
}>;


export type UpdateAppUserByEmailMutation = { __typename?: 'mutation_root', update_AppUser_many?: Array<{ __typename?: 'AppUser_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'AppUser', id: any, first_name?: string | null, last_name?: string | null, name: string }> } | null> | null };


export const UpdateAppUserByEmailDocument = gql`
    mutation updateAppUserByEmail($email: String!, $orgId: uuid!, $data: AppUser_set_input!) {
  update_AppUser_many(
    updates: {where: {_and: [{email: {_eq: $email}, organization_id: {_eq: $orgId}}]}, _set: $data}
  ) {
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
export type UpdateAppUserByEmailMutationFn = Apollo.MutationFunction<UpdateAppUserByEmailMutation, UpdateAppUserByEmailMutationVariables>;

/**
 * __useUpdateAppUserByEmailMutation__
 *
 * To run a mutation, you first call `useUpdateAppUserByEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAppUserByEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAppUserByEmailMutation, { data, loading, error }] = useUpdateAppUserByEmailMutation({
 *   variables: {
 *      email: // value for 'email'
 *      orgId: // value for 'orgId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateAppUserByEmailMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAppUserByEmailMutation, UpdateAppUserByEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAppUserByEmailMutation, UpdateAppUserByEmailMutationVariables>(UpdateAppUserByEmailDocument, options);
      }
export type UpdateAppUserByEmailMutationHookResult = ReturnType<typeof useUpdateAppUserByEmailMutation>;
export type UpdateAppUserByEmailMutationResult = Apollo.MutationResult<UpdateAppUserByEmailMutation>;
export type UpdateAppUserByEmailMutationOptions = Apollo.BaseMutationOptions<UpdateAppUserByEmailMutation, UpdateAppUserByEmailMutationVariables>;