import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteCaptivePowerRenewableFormEditActionMutationVariables = Types.Exact<{
  deleteId: Types.Scalars['uuid']['input'];
}>;


export type DeleteCaptivePowerRenewableFormEditActionMutation = { __typename?: 'mutation_root', delete_GHGEnergy_CaptivePower_Renewable?: { __typename?: 'GHGEnergy_CaptivePower_Renewable_mutation_response', returning: Array<{ __typename?: 'GHGEnergy_CaptivePower_Renewable', id: any, GHGEnergyConsumption_CaptivePower_id: any, Type_of_Technology_Used?: string | null, Year_of_installation?: number | null, Unit_of_Energy_Generated_in_Kwh?: any | null, supporting_docs?: any | null, kpi_em_Emission_EnergyGenerated_kwh?: any | null, kpi_emf_Emission_EnergyGenerated_kwh?: any | null, GHGEnergy_CaptivePower: { __typename?: 'GHGEnergy_CaptivePower', id: any, task_request_id: any } }> } | null };


export const DeleteCaptivePowerRenewableFormEditActionDocument = gql`
    mutation deleteCaptivePowerRenewableFormEditAction($deleteId: uuid!) {
  delete_GHGEnergy_CaptivePower_Renewable(where: {id: {_eq: $deleteId}}) {
    returning {
      id
      GHGEnergyConsumption_CaptivePower_id
      Type_of_Technology_Used
      Year_of_installation
      Unit_of_Energy_Generated_in_Kwh
      supporting_docs
      kpi_em_Emission_EnergyGenerated_kwh
      kpi_emf_Emission_EnergyGenerated_kwh
      GHGEnergy_CaptivePower {
        id
        task_request_id
      }
    }
  }
}
    `;
export type DeleteCaptivePowerRenewableFormEditActionMutationFn = Apollo.MutationFunction<DeleteCaptivePowerRenewableFormEditActionMutation, DeleteCaptivePowerRenewableFormEditActionMutationVariables>;

/**
 * __useDeleteCaptivePowerRenewableFormEditActionMutation__
 *
 * To run a mutation, you first call `useDeleteCaptivePowerRenewableFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCaptivePowerRenewableFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCaptivePowerRenewableFormEditActionMutation, { data, loading, error }] = useDeleteCaptivePowerRenewableFormEditActionMutation({
 *   variables: {
 *      deleteId: // value for 'deleteId'
 *   },
 * });
 */
export function useDeleteCaptivePowerRenewableFormEditActionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCaptivePowerRenewableFormEditActionMutation, DeleteCaptivePowerRenewableFormEditActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCaptivePowerRenewableFormEditActionMutation, DeleteCaptivePowerRenewableFormEditActionMutationVariables>(DeleteCaptivePowerRenewableFormEditActionDocument, options);
      }
export type DeleteCaptivePowerRenewableFormEditActionMutationHookResult = ReturnType<typeof useDeleteCaptivePowerRenewableFormEditActionMutation>;
export type DeleteCaptivePowerRenewableFormEditActionMutationResult = Apollo.MutationResult<DeleteCaptivePowerRenewableFormEditActionMutation>;
export type DeleteCaptivePowerRenewableFormEditActionMutationOptions = Apollo.BaseMutationOptions<DeleteCaptivePowerRenewableFormEditActionMutation, DeleteCaptivePowerRenewableFormEditActionMutationVariables>;