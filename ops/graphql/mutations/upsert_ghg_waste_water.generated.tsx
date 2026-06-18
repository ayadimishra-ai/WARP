import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertGhgWasteWaterActivityMutationVariables = Types.Exact<{
  where: Types.GhgWasteWater_Bool_Exp;
  ghgWasteWaterData: Array<Types.GhgWasteWater_Insert_Input> | Types.GhgWasteWater_Insert_Input;
}>;


export type UpsertGhgWasteWaterActivityMutation = { __typename?: 'mutation_root', delete_GHGWasteWater?: { __typename?: 'GHGWasteWater_mutation_response', returning: Array<{ __typename?: 'GHGWasteWater', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, total_treated_effluent_reused_for_domestic_use: any, total_treated_effluent_reused_for_industrial_use?: any | null, total_treated_effluent_reused_for_landscaping?: any | null, total_treated_effluent_used_for_miscellaneous_uses?: any | null, uom_treated_effluent: string }> } | null, insert_GHGWasteWater?: { __typename?: 'GHGWasteWater_mutation_response', returning: Array<{ __typename?: 'GHGWasteWater', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, total_treated_effluent_reused_for_domestic_use: any, total_treated_effluent_reused_for_industrial_use?: any | null, total_treated_effluent_reused_for_landscaping?: any | null, total_treated_effluent_used_for_miscellaneous_uses?: any | null, uom_treated_effluent: string }> } | null };


export const UpsertGhgWasteWaterActivityDocument = gql`
    mutation upsertGHGWasteWaterActivity($where: GHGWasteWater_bool_exp!, $ghgWasteWaterData: [GHGWasteWater_insert_input!]!) {
  delete_GHGWasteWater(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_treated_effluent_reused_for_domestic_use
      total_treated_effluent_reused_for_industrial_use
      total_treated_effluent_reused_for_landscaping
      total_treated_effluent_used_for_miscellaneous_uses
      uom_treated_effluent
    }
  }
  insert_GHGWasteWater(
    objects: $ghgWasteWaterData
    on_conflict: {constraint: GHGWasteWater_pkey}
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
      total_treated_effluent_reused_for_domestic_use
      total_treated_effluent_reused_for_industrial_use
      total_treated_effluent_reused_for_landscaping
      total_treated_effluent_used_for_miscellaneous_uses
      uom_treated_effluent
    }
  }
}
    `;
export type UpsertGhgWasteWaterActivityMutationFn = Apollo.MutationFunction<UpsertGhgWasteWaterActivityMutation, UpsertGhgWasteWaterActivityMutationVariables>;

/**
 * __useUpsertGhgWasteWaterActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgWasteWaterActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgWasteWaterActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgWasteWaterActivityMutation, { data, loading, error }] = useUpsertGhgWasteWaterActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgWasteWaterData: // value for 'ghgWasteWaterData'
 *   },
 * });
 */
export function useUpsertGhgWasteWaterActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGhgWasteWaterActivityMutation, UpsertGhgWasteWaterActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGhgWasteWaterActivityMutation, UpsertGhgWasteWaterActivityMutationVariables>(UpsertGhgWasteWaterActivityDocument, options);
      }
export type UpsertGhgWasteWaterActivityMutationHookResult = ReturnType<typeof useUpsertGhgWasteWaterActivityMutation>;
export type UpsertGhgWasteWaterActivityMutationResult = Apollo.MutationResult<UpsertGhgWasteWaterActivityMutation>;
export type UpsertGhgWasteWaterActivityMutationOptions = Apollo.BaseMutationOptions<UpsertGhgWasteWaterActivityMutation, UpsertGhgWasteWaterActivityMutationVariables>;