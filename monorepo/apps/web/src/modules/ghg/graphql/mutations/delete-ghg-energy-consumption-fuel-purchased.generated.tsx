import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteGhgEnergyConsumptionFuelPurchasedMutationVariables =
  Types.Exact<{
    id: Types.Scalars["uuid"]["input"];
  }>;

export type DeleteGhgEnergyConsumptionFuelPurchasedMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergyConsumption_FuelPurchased?: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_mutation_response";
    affected_rows: number;
  } | null;
};

export const DeleteGhgEnergyConsumptionFuelPurchasedDocument = gql`
  mutation deleteGHGEnergyConsumptionFuelPurchased($id: uuid!) {
    delete_GHGEnergyConsumption_FuelPurchased(
      where: {
        id: { _eq: $id }
        _and: [
          { _not: { GHGEnergyConsumption_FuelPurchased_Generals: {} } }
          { _not: { GHGEnergyConsumption_FuelPurchased_Auxiliaries: {} } }
          { _not: { GHGEnergyConsumption_FuelPurchased_HeatingWaters: {} } }
        ]
      }
    ) {
      affected_rows
    }
  }
`;
export type DeleteGhgEnergyConsumptionFuelPurchasedMutationFn =
  Apollo.MutationFunction<
    DeleteGhgEnergyConsumptionFuelPurchasedMutation,
    DeleteGhgEnergyConsumptionFuelPurchasedMutationVariables
  >;

/**
 * __useDeleteGhgEnergyConsumptionFuelPurchasedMutation__
 *
 * To run a mutation, you first call `useDeleteGhgEnergyConsumptionFuelPurchasedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGhgEnergyConsumptionFuelPurchasedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGhgEnergyConsumptionFuelPurchasedMutation, { data, loading, error }] = useDeleteGhgEnergyConsumptionFuelPurchasedMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGhgEnergyConsumptionFuelPurchasedMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteGhgEnergyConsumptionFuelPurchasedMutation,
    DeleteGhgEnergyConsumptionFuelPurchasedMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteGhgEnergyConsumptionFuelPurchasedMutation,
    DeleteGhgEnergyConsumptionFuelPurchasedMutationVariables
  >(DeleteGhgEnergyConsumptionFuelPurchasedDocument, options);
}
export type DeleteGhgEnergyConsumptionFuelPurchasedMutationHookResult =
  ReturnType<typeof useDeleteGhgEnergyConsumptionFuelPurchasedMutation>;
export type DeleteGhgEnergyConsumptionFuelPurchasedMutationResult =
  Apollo.MutationResult<DeleteGhgEnergyConsumptionFuelPurchasedMutation>;
export type DeleteGhgEnergyConsumptionFuelPurchasedMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteGhgEnergyConsumptionFuelPurchasedMutation,
    DeleteGhgEnergyConsumptionFuelPurchasedMutationVariables
  >;
