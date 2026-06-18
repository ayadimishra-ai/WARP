import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateFugitiveIndustrialGasDataMutationVariables = Types.Exact<{
  GHGIndustrialGasUpdation: Array<Types.GhgIndustrialGas_Updates> | Types.GhgIndustrialGas_Updates;
}>;


export type UpdateFugitiveIndustrialGasDataMutation = { __typename?: 'mutation_root', update_GHGIndustrialGas_many?: Array<{ __typename?: 'GHGIndustrialGas_mutation_response', returning: Array<{ __typename?: 'GHGIndustrialGas', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any }> } | null> | null };


export const UpdateFugitiveIndustrialGasDataDocument = gql`
    mutation updateFugitiveIndustrialGasData($GHGIndustrialGasUpdation: [GHGIndustrialGas_updates!]!) {
  update_GHGIndustrialGas_many(updates: $GHGIndustrialGasUpdation) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
    }
  }
}
    `;
export type UpdateFugitiveIndustrialGasDataMutationFn = Apollo.MutationFunction<UpdateFugitiveIndustrialGasDataMutation, UpdateFugitiveIndustrialGasDataMutationVariables>;

/**
 * __useUpdateFugitiveIndustrialGasDataMutation__
 *
 * To run a mutation, you first call `useUpdateFugitiveIndustrialGasDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFugitiveIndustrialGasDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFugitiveIndustrialGasDataMutation, { data, loading, error }] = useUpdateFugitiveIndustrialGasDataMutation({
 *   variables: {
 *      GHGIndustrialGasUpdation: // value for 'GHGIndustrialGasUpdation'
 *   },
 * });
 */
export function useUpdateFugitiveIndustrialGasDataMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFugitiveIndustrialGasDataMutation, UpdateFugitiveIndustrialGasDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFugitiveIndustrialGasDataMutation, UpdateFugitiveIndustrialGasDataMutationVariables>(UpdateFugitiveIndustrialGasDataDocument, options);
      }
export type UpdateFugitiveIndustrialGasDataMutationHookResult = ReturnType<typeof useUpdateFugitiveIndustrialGasDataMutation>;
export type UpdateFugitiveIndustrialGasDataMutationResult = Apollo.MutationResult<UpdateFugitiveIndustrialGasDataMutation>;
export type UpdateFugitiveIndustrialGasDataMutationOptions = Apollo.BaseMutationOptions<UpdateFugitiveIndustrialGasDataMutation, UpdateFugitiveIndustrialGasDataMutationVariables>;