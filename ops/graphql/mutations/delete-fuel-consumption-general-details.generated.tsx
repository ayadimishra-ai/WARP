import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteFuelConsumptionGeneralDetailsMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
}>;


export type DeleteFuelConsumptionGeneralDetailsMutation = { __typename?: 'mutation_root', delete_GHGEnergyConsumption_FuelPurchased_General?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_General_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', id: any, GHGEnergyConsumption_FuelPurchased_id: any, Type_of_Fuel_Purchased?: string | null, Quantity_of_fuel_Consumed?: any | null, Quantity_of_fuel_Consumed_uom?: string | null, Quality_of_fuel?: any | null, Point_of_Consumption?: string | null, supporting_docs?: any | null, kpi_em_Emission_QuantityOfFuelConsumed?: any | null, kpi_emf_Emission_QuantityOfFuelConsumed?: any | null, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', task_request_id: any } }> } | null };


export const DeleteFuelConsumptionGeneralDetailsDocument = gql`
    mutation deleteFuelConsumptionGeneralDetails($id: uuid!) {
  delete_GHGEnergyConsumption_FuelPurchased_General(where: {id: {_eq: $id}}) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quantity_of_fuel_Consumed
      Quantity_of_fuel_Consumed_uom
      Quality_of_fuel
      Point_of_Consumption
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
}
    `;
export type DeleteFuelConsumptionGeneralDetailsMutationFn = Apollo.MutationFunction<DeleteFuelConsumptionGeneralDetailsMutation, DeleteFuelConsumptionGeneralDetailsMutationVariables>;

/**
 * __useDeleteFuelConsumptionGeneralDetailsMutation__
 *
 * To run a mutation, you first call `useDeleteFuelConsumptionGeneralDetailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFuelConsumptionGeneralDetailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFuelConsumptionGeneralDetailsMutation, { data, loading, error }] = useDeleteFuelConsumptionGeneralDetailsMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteFuelConsumptionGeneralDetailsMutation(baseOptions?: Apollo.MutationHookOptions<DeleteFuelConsumptionGeneralDetailsMutation, DeleteFuelConsumptionGeneralDetailsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteFuelConsumptionGeneralDetailsMutation, DeleteFuelConsumptionGeneralDetailsMutationVariables>(DeleteFuelConsumptionGeneralDetailsDocument, options);
      }
export type DeleteFuelConsumptionGeneralDetailsMutationHookResult = ReturnType<typeof useDeleteFuelConsumptionGeneralDetailsMutation>;
export type DeleteFuelConsumptionGeneralDetailsMutationResult = Apollo.MutationResult<DeleteFuelConsumptionGeneralDetailsMutation>;
export type DeleteFuelConsumptionGeneralDetailsMutationOptions = Apollo.BaseMutationOptions<DeleteFuelConsumptionGeneralDetailsMutation, DeleteFuelConsumptionGeneralDetailsMutationVariables>;