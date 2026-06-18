import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateFuelConsumptionGeneralDetailsMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.GhgEnergyConsumption_FuelPurchased_General_Set_Input;
}>;


export type UpdateFuelConsumptionGeneralDetailsMutation = { __typename?: 'mutation_root', update_GHGEnergyConsumption_FuelPurchased_General?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_General_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', id: any, GHGEnergyConsumption_FuelPurchased_id: any, Type_of_Fuel_Purchased?: string | null, Quantity_of_fuel_Consumed?: any | null, Quantity_of_fuel_Consumed_uom?: string | null, Quality_of_fuel?: any | null, Point_of_Consumption?: string | null, supporting_docs?: any | null, updated_by?: any | null, updated_at: any, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', task_request_id: any } }> } | null };


export const UpdateFuelConsumptionGeneralDetailsDocument = gql`
    mutation updateFuelConsumptionGeneralDetails($id: uuid!, $set: GHGEnergyConsumption_FuelPurchased_General_set_input!) {
  update_GHGEnergyConsumption_FuelPurchased_General(
    where: {id: {_eq: $id}}
    _set: $set
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quantity_of_fuel_Consumed
      Quantity_of_fuel_Consumed_uom
      Quality_of_fuel
      Point_of_Consumption
      supporting_docs
      updated_by
      updated_at
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
}
    `;
export type UpdateFuelConsumptionGeneralDetailsMutationFn = Apollo.MutationFunction<UpdateFuelConsumptionGeneralDetailsMutation, UpdateFuelConsumptionGeneralDetailsMutationVariables>;

/**
 * __useUpdateFuelConsumptionGeneralDetailsMutation__
 *
 * To run a mutation, you first call `useUpdateFuelConsumptionGeneralDetailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFuelConsumptionGeneralDetailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFuelConsumptionGeneralDetailsMutation, { data, loading, error }] = useUpdateFuelConsumptionGeneralDetailsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateFuelConsumptionGeneralDetailsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFuelConsumptionGeneralDetailsMutation, UpdateFuelConsumptionGeneralDetailsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFuelConsumptionGeneralDetailsMutation, UpdateFuelConsumptionGeneralDetailsMutationVariables>(UpdateFuelConsumptionGeneralDetailsDocument, options);
      }
export type UpdateFuelConsumptionGeneralDetailsMutationHookResult = ReturnType<typeof useUpdateFuelConsumptionGeneralDetailsMutation>;
export type UpdateFuelConsumptionGeneralDetailsMutationResult = Apollo.MutationResult<UpdateFuelConsumptionGeneralDetailsMutation>;
export type UpdateFuelConsumptionGeneralDetailsMutationOptions = Apollo.BaseMutationOptions<UpdateFuelConsumptionGeneralDetailsMutation, UpdateFuelConsumptionGeneralDetailsMutationVariables>;