import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertGhgIndustrialGasActivityMutationVariables = Types.Exact<{
  where: Types.GhgIndustrialGas_Bool_Exp;
  ghgIndustrialGasData: Array<Types.GhgIndustrialGas_Insert_Input> | Types.GhgIndustrialGas_Insert_Input;
}>;


export type UpsertGhgIndustrialGasActivityMutation = { __typename?: 'mutation_root', delete_GHGIndustrialGas?: { __typename?: 'GHGIndustrialGas_mutation_response', returning: Array<{ __typename?: 'GHGIndustrialGas', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, type_of_industrial_gas_used?: string | null, quantity_of_industrial_gas_filled?: any | null, uom_industrial_gas?: string | null }> } | null, insert_GHGIndustrialGas?: { __typename?: 'GHGIndustrialGas_mutation_response', returning: Array<{ __typename?: 'GHGIndustrialGas', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, type_of_industrial_gas_used?: string | null, quantity_of_industrial_gas_filled?: any | null, uom_industrial_gas?: string | null }> } | null };


export const UpsertGhgIndustrialGasActivityDocument = gql`
    mutation upsertGHGIndustrialGasActivity($where: GHGIndustrialGas_bool_exp!, $ghgIndustrialGasData: [GHGIndustrialGas_insert_input!]!) {
  delete_GHGIndustrialGas(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      type_of_industrial_gas_used
      quantity_of_industrial_gas_filled
      uom_industrial_gas
    }
  }
  insert_GHGIndustrialGas(
    objects: $ghgIndustrialGasData
    on_conflict: {constraint: GHGIndustrialGas_pkey}
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      type_of_industrial_gas_used
      quantity_of_industrial_gas_filled
      uom_industrial_gas
    }
  }
}
    `;
export type UpsertGhgIndustrialGasActivityMutationFn = Apollo.MutationFunction<UpsertGhgIndustrialGasActivityMutation, UpsertGhgIndustrialGasActivityMutationVariables>;

/**
 * __useUpsertGhgIndustrialGasActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgIndustrialGasActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgIndustrialGasActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgIndustrialGasActivityMutation, { data, loading, error }] = useUpsertGhgIndustrialGasActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgIndustrialGasData: // value for 'ghgIndustrialGasData'
 *   },
 * });
 */
export function useUpsertGhgIndustrialGasActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGhgIndustrialGasActivityMutation, UpsertGhgIndustrialGasActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGhgIndustrialGasActivityMutation, UpsertGhgIndustrialGasActivityMutationVariables>(UpsertGhgIndustrialGasActivityDocument, options);
      }
export type UpsertGhgIndustrialGasActivityMutationHookResult = ReturnType<typeof useUpsertGhgIndustrialGasActivityMutation>;
export type UpsertGhgIndustrialGasActivityMutationResult = Apollo.MutationResult<UpsertGhgIndustrialGasActivityMutation>;
export type UpsertGhgIndustrialGasActivityMutationOptions = Apollo.BaseMutationOptions<UpsertGhgIndustrialGasActivityMutation, UpsertGhgIndustrialGasActivityMutationVariables>;