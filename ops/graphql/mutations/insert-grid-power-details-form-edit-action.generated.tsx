import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertGridPowerDetailsFormEditActionMutationVariables = Types.Exact<{
  insertData: Types.GhgEnergyConsumption_GridPower_Insert_Input;
}>;


export type InsertGridPowerDetailsFormEditActionMutation = { __typename?: 'mutation_root', insert_GHGEnergyConsumption_GridPower_one?: { __typename?: 'GHGEnergyConsumption_GridPower', id: any } | null };


export const InsertGridPowerDetailsFormEditActionDocument = gql`
    mutation insertGridPowerDetailsFormEditAction($insertData: GHGEnergyConsumption_GridPower_insert_input!) {
  insert_GHGEnergyConsumption_GridPower_one(object: $insertData) {
    id
  }
}
    `;
export type InsertGridPowerDetailsFormEditActionMutationFn = Apollo.MutationFunction<InsertGridPowerDetailsFormEditActionMutation, InsertGridPowerDetailsFormEditActionMutationVariables>;

/**
 * __useInsertGridPowerDetailsFormEditActionMutation__
 *
 * To run a mutation, you first call `useInsertGridPowerDetailsFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertGridPowerDetailsFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertGridPowerDetailsFormEditActionMutation, { data, loading, error }] = useInsertGridPowerDetailsFormEditActionMutation({
 *   variables: {
 *      insertData: // value for 'insertData'
 *   },
 * });
 */
export function useInsertGridPowerDetailsFormEditActionMutation(baseOptions?: Apollo.MutationHookOptions<InsertGridPowerDetailsFormEditActionMutation, InsertGridPowerDetailsFormEditActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertGridPowerDetailsFormEditActionMutation, InsertGridPowerDetailsFormEditActionMutationVariables>(InsertGridPowerDetailsFormEditActionDocument, options);
      }
export type InsertGridPowerDetailsFormEditActionMutationHookResult = ReturnType<typeof useInsertGridPowerDetailsFormEditActionMutation>;
export type InsertGridPowerDetailsFormEditActionMutationResult = Apollo.MutationResult<InsertGridPowerDetailsFormEditActionMutation>;
export type InsertGridPowerDetailsFormEditActionMutationOptions = Apollo.BaseMutationOptions<InsertGridPowerDetailsFormEditActionMutation, InsertGridPowerDetailsFormEditActionMutationVariables>;