import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertGhgFreshWaterActivityMutationVariables = Types.Exact<{
  where: Types.GhgFreshWater_Bool_Exp;
  ghgFreshWaterData: Array<Types.GhgFreshWater_Insert_Input> | Types.GhgFreshWater_Insert_Input;
}>;


export type UpsertGhgFreshWaterActivityMutation = { __typename?: 'mutation_root', delete_GHGFreshWater?: { __typename?: 'GHGFreshWater_mutation_response', returning: Array<{ __typename?: 'GHGFreshWater', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, total_fresh_water_used_for_domestic_use: any, total_fresh_water_used_for_industrial_use?: any | null, total_fresh_water_used_for_landscaping?: any | null, total_fresh_water_used_for_miscellaneous_uses?: any | null, uom_freshwater: string }> } | null, insert_GHGFreshWater?: { __typename?: 'GHGFreshWater_mutation_response', returning: Array<{ __typename?: 'GHGFreshWater', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, total_fresh_water_used_for_domestic_use: any, total_fresh_water_used_for_industrial_use?: any | null, total_fresh_water_used_for_landscaping?: any | null, total_fresh_water_used_for_miscellaneous_uses?: any | null, uom_freshwater: string }> } | null };


export const UpsertGhgFreshWaterActivityDocument = gql`
    mutation upsertGHGFreshWaterActivity($where: GHGFreshWater_bool_exp!, $ghgFreshWaterData: [GHGFreshWater_insert_input!]!) {
  delete_GHGFreshWater(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_fresh_water_used_for_domestic_use
      total_fresh_water_used_for_industrial_use
      total_fresh_water_used_for_landscaping
      total_fresh_water_used_for_miscellaneous_uses
      uom_freshwater
    }
  }
  insert_GHGFreshWater(
    objects: $ghgFreshWaterData
    on_conflict: {constraint: GHGFreshWater_pkey}
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
      total_fresh_water_used_for_domestic_use
      total_fresh_water_used_for_industrial_use
      total_fresh_water_used_for_landscaping
      total_fresh_water_used_for_miscellaneous_uses
      uom_freshwater
    }
  }
}
    `;
export type UpsertGhgFreshWaterActivityMutationFn = Apollo.MutationFunction<UpsertGhgFreshWaterActivityMutation, UpsertGhgFreshWaterActivityMutationVariables>;

/**
 * __useUpsertGhgFreshWaterActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgFreshWaterActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgFreshWaterActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgFreshWaterActivityMutation, { data, loading, error }] = useUpsertGhgFreshWaterActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgFreshWaterData: // value for 'ghgFreshWaterData'
 *   },
 * });
 */
export function useUpsertGhgFreshWaterActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGhgFreshWaterActivityMutation, UpsertGhgFreshWaterActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGhgFreshWaterActivityMutation, UpsertGhgFreshWaterActivityMutationVariables>(UpsertGhgFreshWaterActivityDocument, options);
      }
export type UpsertGhgFreshWaterActivityMutationHookResult = ReturnType<typeof useUpsertGhgFreshWaterActivityMutation>;
export type UpsertGhgFreshWaterActivityMutationResult = Apollo.MutationResult<UpsertGhgFreshWaterActivityMutation>;
export type UpsertGhgFreshWaterActivityMutationOptions = Apollo.BaseMutationOptions<UpsertGhgFreshWaterActivityMutation, UpsertGhgFreshWaterActivityMutationVariables>;