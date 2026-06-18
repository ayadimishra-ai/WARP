import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertGhgEnergyCaptivePowerMutationVariables = Types.Exact<{
  insertData: Array<Types.GhgEnergy_CaptivePower_Insert_Input> | Types.GhgEnergy_CaptivePower_Insert_Input;
}>;


export type InsertGhgEnergyCaptivePowerMutation = { __typename?: 'mutation_root', insert_GHGEnergy_CaptivePower?: { __typename?: 'GHGEnergy_CaptivePower_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'GHGEnergy_CaptivePower', id: any, organization_address_id: any, task_request_id: any, activity_task_request_id: any, Do_You_Generate_Captive_Power_for_Own_Use?: string | null, Type_of_Captive_Power?: string | null, supporting_docs?: any | null }> } | null };


export const InsertGhgEnergyCaptivePowerDocument = gql`
    mutation insertGHGEnergyCaptivePower($insertData: [GHGEnergy_CaptivePower_insert_input!]!) {
  insert_GHGEnergy_CaptivePower(
    objects: $insertData
    on_conflict: {constraint: GHGEnergy_CaptivePower_pkey}
  ) {
    affected_rows
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Do_You_Generate_Captive_Power_for_Own_Use
      Type_of_Captive_Power
      supporting_docs
      id
    }
  }
}
    `;
export type InsertGhgEnergyCaptivePowerMutationFn = Apollo.MutationFunction<InsertGhgEnergyCaptivePowerMutation, InsertGhgEnergyCaptivePowerMutationVariables>;

/**
 * __useInsertGhgEnergyCaptivePowerMutation__
 *
 * To run a mutation, you first call `useInsertGhgEnergyCaptivePowerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertGhgEnergyCaptivePowerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertGhgEnergyCaptivePowerMutation, { data, loading, error }] = useInsertGhgEnergyCaptivePowerMutation({
 *   variables: {
 *      insertData: // value for 'insertData'
 *   },
 * });
 */
export function useInsertGhgEnergyCaptivePowerMutation(baseOptions?: Apollo.MutationHookOptions<InsertGhgEnergyCaptivePowerMutation, InsertGhgEnergyCaptivePowerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertGhgEnergyCaptivePowerMutation, InsertGhgEnergyCaptivePowerMutationVariables>(InsertGhgEnergyCaptivePowerDocument, options);
      }
export type InsertGhgEnergyCaptivePowerMutationHookResult = ReturnType<typeof useInsertGhgEnergyCaptivePowerMutation>;
export type InsertGhgEnergyCaptivePowerMutationResult = Apollo.MutationResult<InsertGhgEnergyCaptivePowerMutation>;
export type InsertGhgEnergyCaptivePowerMutationOptions = Apollo.BaseMutationOptions<InsertGhgEnergyCaptivePowerMutation, InsertGhgEnergyCaptivePowerMutationVariables>;