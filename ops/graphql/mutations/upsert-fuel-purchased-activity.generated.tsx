import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertFuelPurchasedActivityMutationVariables = Types.Exact<{
  GHGEnergyConsumption_FuelPurchased_General_id: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
  GHGEnergyConsumption_FuelPurchased_Auxiliary_id: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
  GHGEnergyConsumption_FuelPurchased_HeatingWater__id: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
  Auxdata: Array<Types.GhgEnergyConsumption_FuelPurchased_Auxiliary_Insert_Input> | Types.GhgEnergyConsumption_FuelPurchased_Auxiliary_Insert_Input;
  Generaldata: Array<Types.GhgEnergyConsumption_FuelPurchased_General_Insert_Input> | Types.GhgEnergyConsumption_FuelPurchased_General_Insert_Input;
  HeatingWaterdata: Array<Types.GhgEnergyConsumption_FuelPurchased_HeatingWater_Insert_Input> | Types.GhgEnergyConsumption_FuelPurchased_HeatingWater_Insert_Input;
}>;


export type UpsertFuelPurchasedActivityMutation = { __typename?: 'mutation_root', delete_GHGEnergyConsumption_FuelPurchased_General?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_General_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', id: any, GHGEnergyConsumption_FuelPurchased_id: any, Type_of_Fuel_Purchased?: string | null, Quantity_of_fuel_Consumed?: any | null, Quantity_of_fuel_Consumed_uom?: string | null, Quality_of_fuel?: any | null, Point_of_Consumption?: string | null, supporting_docs?: any | null, kpi_em_Emission_QuantityOfFuelConsumed?: any | null, kpi_emf_Emission_QuantityOfFuelConsumed?: any | null, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', task_request_id: any } }> } | null, delete_GHGEnergyConsumption_FuelPurchased_HeatingWater?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_HeatingWater_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_HeatingWater', id: any, GHGEnergyConsumption_FuelPurchased_id: any, Type_of_Fuel_Purchased?: string | null, Quality_of_fuel?: any | null, Used_for_Which_SKUs?: string | null, Quantity_of_fuel_consumed?: any | null, Quantity_of_fuel_consumed_uom?: string | null, supporting_docs?: any | null, kpi_em_Emission_QuantityOfFuelConsumed?: any | null, kpi_emf_Emission_QuantityOfFuelConsumed?: any | null, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', task_request_id: any } }> } | null, delete_GHGEnergyConsumption_FuelPurchased_Auxiliary?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_Auxiliary_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_Auxiliary', id: any, GHGEnergyConsumption_FuelPurchased_id: any, Type_of_Auxiliary_Fuel_Purchased?: string | null, Used_for_Which_SKUs?: string | null, Quantity_of_fuel_consumed?: any | null, Quantity_of_fuel_consumed_uom?: string | null, supporting_docs?: any | null, kpi_em_Emission_QuantityOfFuelConsumed?: any | null, kpi_emf_Emission_QuantityOfFuelConsumed?: any | null, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', task_request_id: any } }> } | null, insert_GHGEnergyConsumption_FuelPurchased_Auxiliary?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_Auxiliary_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_Auxiliary', id: any, GHGEnergyConsumption_FuelPurchased_id: any, Type_of_Auxiliary_Fuel_Purchased?: string | null, Used_for_Which_SKUs?: string | null, Quantity_of_fuel_consumed?: any | null, Quantity_of_fuel_consumed_uom?: string | null, supporting_docs?: any | null, kpi_em_Emission_QuantityOfFuelConsumed?: any | null, kpi_emf_Emission_QuantityOfFuelConsumed?: any | null, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', task_request_id: any } }> } | null, insert_GHGEnergyConsumption_FuelPurchased_General?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_General_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_General', id: any, GHGEnergyConsumption_FuelPurchased_id: any, Type_of_Fuel_Purchased?: string | null, Quantity_of_fuel_Consumed?: any | null, Quantity_of_fuel_Consumed_uom?: string | null, Quality_of_fuel?: any | null, Point_of_Consumption?: string | null, supporting_docs?: any | null, kpi_em_Emission_QuantityOfFuelConsumed?: any | null, kpi_emf_Emission_QuantityOfFuelConsumed?: any | null, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', task_request_id: any } }> } | null, insert_GHGEnergyConsumption_FuelPurchased_HeatingWater?: { __typename?: 'GHGEnergyConsumption_FuelPurchased_HeatingWater_mutation_response', returning: Array<{ __typename?: 'GHGEnergyConsumption_FuelPurchased_HeatingWater', id: any, GHGEnergyConsumption_FuelPurchased_id: any, Type_of_Fuel_Purchased?: string | null, Quality_of_fuel?: any | null, Used_for_Which_SKUs?: string | null, Quantity_of_fuel_consumed?: any | null, Quantity_of_fuel_consumed_uom?: string | null, supporting_docs?: any | null, kpi_em_Emission_QuantityOfFuelConsumed?: any | null, kpi_emf_Emission_QuantityOfFuelConsumed?: any | null, GHGEnergyConsumption_FuelPurchased: { __typename?: 'GHGEnergyConsumption_FuelPurchased', task_request_id: any } }> } | null };


export const UpsertFuelPurchasedActivityDocument = gql`
    mutation upsertFuelPurchasedActivity($GHGEnergyConsumption_FuelPurchased_General_id: [uuid!]!, $GHGEnergyConsumption_FuelPurchased_Auxiliary_id: [uuid!]!, $GHGEnergyConsumption_FuelPurchased_HeatingWater__id: [uuid!]!, $Auxdata: [GHGEnergyConsumption_FuelPurchased_Auxiliary_insert_input!]!, $Generaldata: [GHGEnergyConsumption_FuelPurchased_General_insert_input!]!, $HeatingWaterdata: [GHGEnergyConsumption_FuelPurchased_HeatingWater_insert_input!]!) {
  delete_GHGEnergyConsumption_FuelPurchased_General(
    where: {GHGEnergyConsumption_FuelPurchased_id: {_in: $GHGEnergyConsumption_FuelPurchased_General_id}}
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
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
  delete_GHGEnergyConsumption_FuelPurchased_HeatingWater(
    where: {GHGEnergyConsumption_FuelPurchased_id: {_in: $GHGEnergyConsumption_FuelPurchased_HeatingWater__id}}
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quality_of_fuel
      Used_for_Which_SKUs
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
  delete_GHGEnergyConsumption_FuelPurchased_Auxiliary(
    where: {GHGEnergyConsumption_FuelPurchased_id: {_in: $GHGEnergyConsumption_FuelPurchased_Auxiliary_id}}
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Auxiliary_Fuel_Purchased
      Used_for_Which_SKUs
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
  insert_GHGEnergyConsumption_FuelPurchased_Auxiliary(
    objects: $Auxdata
    on_conflict: {constraint: GHGEnergyConsumption_FuelPurchased_Auxiliary_pkey}
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Auxiliary_Fuel_Purchased
      Used_for_Which_SKUs
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
      supporting_docs
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
  insert_GHGEnergyConsumption_FuelPurchased_General(
    objects: $Generaldata
    on_conflict: {constraint: GHGEnergyConsumption_FuelPurchased_General_pkey}
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
      kpi_em_Emission_QuantityOfFuelConsumed
      kpi_emf_Emission_QuantityOfFuelConsumed
      GHGEnergyConsumption_FuelPurchased {
        task_request_id
      }
    }
  }
  insert_GHGEnergyConsumption_FuelPurchased_HeatingWater(
    objects: $HeatingWaterdata
    on_conflict: {constraint: GHGEnergyConsumption_FuelPurchased_HeatingWater_pkey}
  ) {
    returning {
      id
      GHGEnergyConsumption_FuelPurchased_id
      Type_of_Fuel_Purchased
      Quality_of_fuel
      Used_for_Which_SKUs
      Quantity_of_fuel_consumed
      Quantity_of_fuel_consumed_uom
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
export type UpsertFuelPurchasedActivityMutationFn = Apollo.MutationFunction<UpsertFuelPurchasedActivityMutation, UpsertFuelPurchasedActivityMutationVariables>;

/**
 * __useUpsertFuelPurchasedActivityMutation__
 *
 * To run a mutation, you first call `useUpsertFuelPurchasedActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertFuelPurchasedActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertFuelPurchasedActivityMutation, { data, loading, error }] = useUpsertFuelPurchasedActivityMutation({
 *   variables: {
 *      GHGEnergyConsumption_FuelPurchased_General_id: // value for 'GHGEnergyConsumption_FuelPurchased_General_id'
 *      GHGEnergyConsumption_FuelPurchased_Auxiliary_id: // value for 'GHGEnergyConsumption_FuelPurchased_Auxiliary_id'
 *      GHGEnergyConsumption_FuelPurchased_HeatingWater__id: // value for 'GHGEnergyConsumption_FuelPurchased_HeatingWater__id'
 *      Auxdata: // value for 'Auxdata'
 *      Generaldata: // value for 'Generaldata'
 *      HeatingWaterdata: // value for 'HeatingWaterdata'
 *   },
 * });
 */
export function useUpsertFuelPurchasedActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpsertFuelPurchasedActivityMutation, UpsertFuelPurchasedActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertFuelPurchasedActivityMutation, UpsertFuelPurchasedActivityMutationVariables>(UpsertFuelPurchasedActivityDocument, options);
      }
export type UpsertFuelPurchasedActivityMutationHookResult = ReturnType<typeof useUpsertFuelPurchasedActivityMutation>;
export type UpsertFuelPurchasedActivityMutationResult = Apollo.MutationResult<UpsertFuelPurchasedActivityMutation>;
export type UpsertFuelPurchasedActivityMutationOptions = Apollo.BaseMutationOptions<UpsertFuelPurchasedActivityMutation, UpsertFuelPurchasedActivityMutationVariables>;