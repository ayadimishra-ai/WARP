import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertGhgWaterWithdrawalActivityMutationVariables = Types.Exact<{
  where: Types.GhgWaterWithdrawal_Bool_Exp;
  ghgWaterWithdrawalData: Array<Types.GhgWaterWithdrawal_Insert_Input> | Types.GhgWaterWithdrawal_Insert_Input;
}>;


export type UpsertGhgWaterWithdrawalActivityMutation = { __typename?: 'mutation_root', delete_GHGWaterWithdrawal?: { __typename?: 'GHGWaterWithdrawal_mutation_response', returning: Array<{ __typename?: 'GHGWaterWithdrawal', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, total_fresh_water_withdrawal: any, uom_freshwater?: string | null, source_of_fresh_water?: string | null }> } | null, insert_GHGWaterWithdrawal?: { __typename?: 'GHGWaterWithdrawal_mutation_response', returning: Array<{ __typename?: 'GHGWaterWithdrawal', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, total_fresh_water_withdrawal: any, uom_freshwater?: string | null, source_of_fresh_water?: string | null }> } | null };


export const UpsertGhgWaterWithdrawalActivityDocument = gql`
    mutation upsertGHGWaterWithdrawalActivity($where: GHGWaterWithdrawal_bool_exp!, $ghgWaterWithdrawalData: [GHGWaterWithdrawal_insert_input!]!) {
  delete_GHGWaterWithdrawal(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      created_at
      updated_at
      created_by
      updated_by
      total_fresh_water_withdrawal
      uom_freshwater
      source_of_fresh_water
    }
  }
  insert_GHGWaterWithdrawal(
    objects: $ghgWaterWithdrawalData
    on_conflict: {constraint: GHGWaterWithdrawal_pkey}
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
      total_fresh_water_withdrawal
      uom_freshwater
      source_of_fresh_water
    }
  }
}
    `;
export type UpsertGhgWaterWithdrawalActivityMutationFn = Apollo.MutationFunction<UpsertGhgWaterWithdrawalActivityMutation, UpsertGhgWaterWithdrawalActivityMutationVariables>;

/**
 * __useUpsertGhgWaterWithdrawalActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgWaterWithdrawalActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgWaterWithdrawalActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgWaterWithdrawalActivityMutation, { data, loading, error }] = useUpsertGhgWaterWithdrawalActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgWaterWithdrawalData: // value for 'ghgWaterWithdrawalData'
 *   },
 * });
 */
export function useUpsertGhgWaterWithdrawalActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGhgWaterWithdrawalActivityMutation, UpsertGhgWaterWithdrawalActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGhgWaterWithdrawalActivityMutation, UpsertGhgWaterWithdrawalActivityMutationVariables>(UpsertGhgWaterWithdrawalActivityDocument, options);
      }
export type UpsertGhgWaterWithdrawalActivityMutationHookResult = ReturnType<typeof useUpsertGhgWaterWithdrawalActivityMutation>;
export type UpsertGhgWaterWithdrawalActivityMutationResult = Apollo.MutationResult<UpsertGhgWaterWithdrawalActivityMutation>;
export type UpsertGhgWaterWithdrawalActivityMutationOptions = Apollo.BaseMutationOptions<UpsertGhgWaterWithdrawalActivityMutation, UpsertGhgWaterWithdrawalActivityMutationVariables>;