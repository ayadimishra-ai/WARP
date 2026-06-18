import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertGhgFuelPurchasedTransportation_ActivityMutationVariables = Types.Exact<{
  where: Types.GhgEnergyConsumption_FuelPurchased_Transportation_Bool_Exp;
  fuelpurchasedtransportation: Array<Types.GhgEnergyConsumption_FuelPurchased_Transportation_Insert_Input> | Types.GhgEnergyConsumption_FuelPurchased_Transportation_Insert_Input;
}>;


export type UpsertGhgFuelPurchasedTransportation_ActivityMutation = { __typename?: 'mutation_root', delete_GHGEnergyConsumption_FuelPurchased_Transportation?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_Transportation_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_Transportation', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, Vehicle_Type_Used_for_Road_Transport?: string | null, Type_of_Fuel_Purchased?: string | null, Quantity_of_fuel_purchased: any, UoM_for_fuel_purchased: string, Distance_travelled?: any | null, Transportation_Type: string, supporting_docs?: any | null }> } | null, insert_GHGEnergyConsumption_FuelPurchased_Transportation?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_Transportation_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_Transportation', id: any, task_request_id: any, organization_address_id: any, activity_task_request_id: any, Vehicle_Type_Used_for_Road_Transport?: string | null, Type_of_Fuel_Purchased?: string | null, Quantity_of_fuel_purchased: any, UoM_for_fuel_purchased: string, Distance_travelled?: any | null, Transportation_Type: string, supporting_docs?: any | null }> } | null };


export const UpsertGhgFuelPurchasedTransportation_ActivityDocument = gql`
    mutation upsertGHGFuelPurchasedTransportation_Activity($where: GHGEnergyConsumption_FuelPurchased_Transportation_bool_exp!, $fuelpurchasedtransportation: [GHGEnergyConsumption_FuelPurchased_Transportation_insert_input!]!) {
  delete_GHGEnergyConsumption_FuelPurchased_Transportation(where: $where) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      Vehicle_Type_Used_for_Road_Transport
      Type_of_Fuel_Purchased
      Quantity_of_fuel_purchased
      UoM_for_fuel_purchased
      Distance_travelled
      Transportation_Type
      supporting_docs
    }
  }
  insert_GHGEnergyConsumption_FuelPurchased_Transportation(
    objects: $fuelpurchasedtransportation
    on_conflict: {constraint: GHGEnergyConsumption_FuelPurchased_Transportation_pkey}
  ) {
    returning {
      id
      task_request_id
      organization_address_id
      activity_task_request_id
      Vehicle_Type_Used_for_Road_Transport
      Type_of_Fuel_Purchased
      Quantity_of_fuel_purchased
      UoM_for_fuel_purchased
      Distance_travelled
      Transportation_Type
      supporting_docs
    }
  }
}
    `;
export type UpsertGhgFuelPurchasedTransportation_ActivityMutationFn = Apollo.MutationFunction<UpsertGhgFuelPurchasedTransportation_ActivityMutation, UpsertGhgFuelPurchasedTransportation_ActivityMutationVariables>;

/**
 * __useUpsertGhgFuelPurchasedTransportation_ActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgFuelPurchasedTransportation_ActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgFuelPurchasedTransportation_ActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgFuelPurchasedTransportationActivityMutation, { data, loading, error }] = useUpsertGhgFuelPurchasedTransportation_ActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      fuelpurchasedtransportation: // value for 'fuelpurchasedtransportation'
 *   },
 * });
 */
export function useUpsertGhgFuelPurchasedTransportation_ActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGhgFuelPurchasedTransportation_ActivityMutation, UpsertGhgFuelPurchasedTransportation_ActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGhgFuelPurchasedTransportation_ActivityMutation, UpsertGhgFuelPurchasedTransportation_ActivityMutationVariables>(UpsertGhgFuelPurchasedTransportation_ActivityDocument, options);
      }
export type UpsertGhgFuelPurchasedTransportation_ActivityMutationHookResult = ReturnType<typeof useUpsertGhgFuelPurchasedTransportation_ActivityMutation>;
export type UpsertGhgFuelPurchasedTransportation_ActivityMutationResult = Apollo.MutationResult<UpsertGhgFuelPurchasedTransportation_ActivityMutation>;
export type UpsertGhgFuelPurchasedTransportation_ActivityMutationOptions = Apollo.BaseMutationOptions<UpsertGhgFuelPurchasedTransportation_ActivityMutation, UpsertGhgFuelPurchasedTransportation_ActivityMutationVariables>;