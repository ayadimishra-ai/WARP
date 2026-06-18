import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertCaptivePowerNonRenewableFuelFormEditActionMutationVariables = Types.Exact<{
  insertData: Types.GhgEnergy_CaptivePower_NonRenewable_Insert_Input;
}>;


export type InsertCaptivePowerNonRenewableFuelFormEditActionMutation = { __typename?: 'mutation_root', insert_GHGEnergy_CaptivePower_NonRenewable_one?: { __typename?: 'GHGEnergy_CaptivePower_NonRenewable', id: any, GHGEnergyConsumption_CaptivePower_id: any, GHGEnergy_CaptivePower: { __typename?: 'GHGEnergy_CaptivePower', id: any, task_request_id: any } } | null };


export const InsertCaptivePowerNonRenewableFuelFormEditActionDocument = gql`
    mutation insertCaptivePowerNonRenewableFuelFormEditAction($insertData: GHGEnergy_CaptivePower_NonRenewable_insert_input!) {
  insert_GHGEnergy_CaptivePower_NonRenewable_one(
    object: $insertData
    on_conflict: {constraint: GHGEnergy_CaptivePower_NonRenewable_pkey, update_columns: [Type_of_Fuel_Used, Quantity_of_fuel_consumed, Quantity_of_fuel_consumed_uom, Quality_of_fuel, Unit_of_Energy_Generated_in_Kwh, updated_by, updated_at]}
  ) {
    id
    GHGEnergyConsumption_CaptivePower_id
    GHGEnergy_CaptivePower {
      id
      task_request_id
    }
  }
}
    `;
export type InsertCaptivePowerNonRenewableFuelFormEditActionMutationFn = Apollo.MutationFunction<InsertCaptivePowerNonRenewableFuelFormEditActionMutation, InsertCaptivePowerNonRenewableFuelFormEditActionMutationVariables>;

/**
 * __useInsertCaptivePowerNonRenewableFuelFormEditActionMutation__
 *
 * To run a mutation, you first call `useInsertCaptivePowerNonRenewableFuelFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertCaptivePowerNonRenewableFuelFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertCaptivePowerNonRenewableFuelFormEditActionMutation, { data, loading, error }] = useInsertCaptivePowerNonRenewableFuelFormEditActionMutation({
 *   variables: {
 *      insertData: // value for 'insertData'
 *   },
 * });
 */
export function useInsertCaptivePowerNonRenewableFuelFormEditActionMutation(baseOptions?: Apollo.MutationHookOptions<InsertCaptivePowerNonRenewableFuelFormEditActionMutation, InsertCaptivePowerNonRenewableFuelFormEditActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertCaptivePowerNonRenewableFuelFormEditActionMutation, InsertCaptivePowerNonRenewableFuelFormEditActionMutationVariables>(InsertCaptivePowerNonRenewableFuelFormEditActionDocument, options);
      }
export type InsertCaptivePowerNonRenewableFuelFormEditActionMutationHookResult = ReturnType<typeof useInsertCaptivePowerNonRenewableFuelFormEditActionMutation>;
export type InsertCaptivePowerNonRenewableFuelFormEditActionMutationResult = Apollo.MutationResult<InsertCaptivePowerNonRenewableFuelFormEditActionMutation>;
export type InsertCaptivePowerNonRenewableFuelFormEditActionMutationOptions = Apollo.BaseMutationOptions<InsertCaptivePowerNonRenewableFuelFormEditActionMutation, InsertCaptivePowerNonRenewableFuelFormEditActionMutationVariables>;