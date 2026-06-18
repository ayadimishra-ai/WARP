import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateGhgEnergyConsumption_FuelPurchasedDataMutationVariables =
  Types.Exact<{
    GHGEnergyConsumption_FuelPurchased_General:
      | Array<Types.GhgEnergyConsumption_FuelPurchased_General_Updates>
      | Types.GhgEnergyConsumption_FuelPurchased_General_Updates;
    GHGEnergyConsumption_FuelPurchased_HeatingWater:
      | Array<Types.GhgEnergyConsumption_FuelPurchased_HeatingWater_Updates>
      | Types.GhgEnergyConsumption_FuelPurchased_HeatingWater_Updates;
    GHGEnergyConsumption_FuelPurchased_Auxiliary:
      | Array<Types.GhgEnergyConsumption_FuelPurchased_Auxiliary_Updates>
      | Types.GhgEnergyConsumption_FuelPurchased_Auxiliary_Updates;
    GHGEnergyConsumption_FuelPurchased_Transportation:
      | Array<Types.GhgEnergyConsumption_FuelPurchased_Transportation_Updates>
      | Types.GhgEnergyConsumption_FuelPurchased_Transportation_Updates;
  }>;

export type UpdateGhgEnergyConsumption_FuelPurchasedDataMutation = {
  __typename?: "mutation_root";
  update_GHGEnergyConsumption_FuelPurchased_General_many?: Array<{
    __typename?: "GHGEnergyConsumption_FuelPurchased_General_mutation_response";
    returning: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_General";
      id: any;
      kpi_em_Scope3_Category3?: any | null;
      kpi_emf_Scope3_Category3?: any | null;
    }>;
  } | null> | null;
  update_GHGEnergyConsumption_FuelPurchased_HeatingWater_many?: Array<{
    __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater_mutation_response";
    returning: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater";
      id: any;
    }>;
  } | null> | null;
  update_GHGEnergyConsumption_FuelPurchased_Auxiliary_many?: Array<{
    __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary_mutation_response";
    returning: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary";
      id: any;
    }>;
  } | null> | null;
  update_GHGEnergyConsumption_FuelPurchased_Transportation_many?: Array<{
    __typename?: "GHGEnergyConsumption_FuelPurchased_Transportation_mutation_response";
    returning: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_Transportation";
      id: any;
    }>;
  } | null> | null;
};

export const UpdateGhgEnergyConsumption_FuelPurchasedDataDocument = gql`
  mutation updateGHGEnergyConsumption_FuelPurchasedData(
    $GHGEnergyConsumption_FuelPurchased_General: [GHGEnergyConsumption_FuelPurchased_General_updates!]!
    $GHGEnergyConsumption_FuelPurchased_HeatingWater: [GHGEnergyConsumption_FuelPurchased_HeatingWater_updates!]!
    $GHGEnergyConsumption_FuelPurchased_Auxiliary: [GHGEnergyConsumption_FuelPurchased_Auxiliary_updates!]!
    $GHGEnergyConsumption_FuelPurchased_Transportation: [GHGEnergyConsumption_FuelPurchased_Transportation_updates!]!
  ) {
    update_GHGEnergyConsumption_FuelPurchased_General_many(
      updates: $GHGEnergyConsumption_FuelPurchased_General
    ) {
      returning {
        id
        kpi_em_Scope3_Category3
        kpi_emf_Scope3_Category3
      }
    }
    update_GHGEnergyConsumption_FuelPurchased_HeatingWater_many(
      updates: $GHGEnergyConsumption_FuelPurchased_HeatingWater
    ) {
      returning {
        id
      }
    }
    update_GHGEnergyConsumption_FuelPurchased_Auxiliary_many(
      updates: $GHGEnergyConsumption_FuelPurchased_Auxiliary
    ) {
      returning {
        id
      }
    }
    update_GHGEnergyConsumption_FuelPurchased_Transportation_many(
      updates: $GHGEnergyConsumption_FuelPurchased_Transportation
    ) {
      returning {
        id
      }
    }
  }
`;
export type UpdateGhgEnergyConsumption_FuelPurchasedDataMutationFn =
  Apollo.MutationFunction<
    UpdateGhgEnergyConsumption_FuelPurchasedDataMutation,
    UpdateGhgEnergyConsumption_FuelPurchasedDataMutationVariables
  >;

/**
 * __useUpdateGhgEnergyConsumption_FuelPurchasedDataMutation__
 *
 * To run a mutation, you first call `useUpdateGhgEnergyConsumption_FuelPurchasedDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGhgEnergyConsumption_FuelPurchasedDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGhgEnergyConsumptionFuelPurchasedDataMutation, { data, loading, error }] = useUpdateGhgEnergyConsumption_FuelPurchasedDataMutation({
 *   variables: {
 *      GHGEnergyConsumption_FuelPurchased_General: // value for 'GHGEnergyConsumption_FuelPurchased_General'
 *      GHGEnergyConsumption_FuelPurchased_HeatingWater: // value for 'GHGEnergyConsumption_FuelPurchased_HeatingWater'
 *      GHGEnergyConsumption_FuelPurchased_Auxiliary: // value for 'GHGEnergyConsumption_FuelPurchased_Auxiliary'
 *      GHGEnergyConsumption_FuelPurchased_Transportation: // value for 'GHGEnergyConsumption_FuelPurchased_Transportation'
 *   },
 * });
 */
export function useUpdateGhgEnergyConsumption_FuelPurchasedDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateGhgEnergyConsumption_FuelPurchasedDataMutation,
    UpdateGhgEnergyConsumption_FuelPurchasedDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateGhgEnergyConsumption_FuelPurchasedDataMutation,
    UpdateGhgEnergyConsumption_FuelPurchasedDataMutationVariables
  >(UpdateGhgEnergyConsumption_FuelPurchasedDataDocument, options);
}
export type UpdateGhgEnergyConsumption_FuelPurchasedDataMutationHookResult =
  ReturnType<typeof useUpdateGhgEnergyConsumption_FuelPurchasedDataMutation>;
export type UpdateGhgEnergyConsumption_FuelPurchasedDataMutationResult =
  Apollo.MutationResult<UpdateGhgEnergyConsumption_FuelPurchasedDataMutation>;
export type UpdateGhgEnergyConsumption_FuelPurchasedDataMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateGhgEnergyConsumption_FuelPurchasedDataMutation,
    UpdateGhgEnergyConsumption_FuelPurchasedDataMutationVariables
  >;
