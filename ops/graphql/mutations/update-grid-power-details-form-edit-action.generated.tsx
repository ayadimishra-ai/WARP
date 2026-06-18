import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateGridPowerDetailsFormEditActionMutationVariables = Types.Exact<{
  editId?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
  editData?: Types.InputMaybe<Types.GhgEnergyConsumption_GridPower_Set_Input>;
}>;


export type UpdateGridPowerDetailsFormEditActionMutation = { __typename?: 'mutation_root', update_GHGEnergyConsumption_GridPower?: { __typename?: 'GHGEnergyConsumption_GridPower_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_GridPower', id: any }> } | null };


export const UpdateGridPowerDetailsFormEditActionDocument = gql`
    mutation updateGridPowerDetailsFormEditAction($editId: uuid, $editData: GHGEnergyConsumption_GridPower_set_input) {
  update_GHGEnergyConsumption_GridPower(
    where: {id: {_eq: $editId}}
    _set: $editData
  ) {
    returning {
      id
    }
  }
}
    `;
export type UpdateGridPowerDetailsFormEditActionMutationFn = Apollo.MutationFunction<UpdateGridPowerDetailsFormEditActionMutation, UpdateGridPowerDetailsFormEditActionMutationVariables>;

/**
 * __useUpdateGridPowerDetailsFormEditActionMutation__
 *
 * To run a mutation, you first call `useUpdateGridPowerDetailsFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGridPowerDetailsFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGridPowerDetailsFormEditActionMutation, { data, loading, error }] = useUpdateGridPowerDetailsFormEditActionMutation({
 *   variables: {
 *      editId: // value for 'editId'
 *      editData: // value for 'editData'
 *   },
 * });
 */
export function useUpdateGridPowerDetailsFormEditActionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGridPowerDetailsFormEditActionMutation, UpdateGridPowerDetailsFormEditActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGridPowerDetailsFormEditActionMutation, UpdateGridPowerDetailsFormEditActionMutationVariables>(UpdateGridPowerDetailsFormEditActionDocument, options);
      }
export type UpdateGridPowerDetailsFormEditActionMutationHookResult = ReturnType<typeof useUpdateGridPowerDetailsFormEditActionMutation>;
export type UpdateGridPowerDetailsFormEditActionMutationResult = Apollo.MutationResult<UpdateGridPowerDetailsFormEditActionMutation>;
export type UpdateGridPowerDetailsFormEditActionMutationOptions = Apollo.BaseMutationOptions<UpdateGridPowerDetailsFormEditActionMutation, UpdateGridPowerDetailsFormEditActionMutationVariables>;