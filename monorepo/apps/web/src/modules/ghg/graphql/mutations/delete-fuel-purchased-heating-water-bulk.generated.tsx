import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteFuelPurchasedHeatingWaterBulkMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteFuelPurchasedHeatingWaterBulkMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergyConsumption_FuelPurchased_HeatingWater?: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_HeatingWater";
      id: any;
      GHGEnergyConsumption_FuelPurchased_id: any;
      GHGEnergyConsumption_FuelPurchased: {
        __typename?: "GHGEnergyConsumption_FuelPurchased";
        id: any;
        task_request_id: any;
        organization_address_id: any;
      };
    }>;
  } | null;
};

export const DeleteFuelPurchasedHeatingWaterBulkDocument = gql`
  mutation deleteFuelPurchasedHeatingWaterBulk($ids: [uuid!]!) {
    delete_GHGEnergyConsumption_FuelPurchased_HeatingWater(
      where: { id: { _in: $ids } }
    ) {
      affected_rows
      returning {
        id
        GHGEnergyConsumption_FuelPurchased_id
        GHGEnergyConsumption_FuelPurchased {
          id
          task_request_id
          organization_address_id
        }
      }
    }
  }
`;
export type DeleteFuelPurchasedHeatingWaterBulkMutationFn =
  Apollo.MutationFunction<
    DeleteFuelPurchasedHeatingWaterBulkMutation,
    DeleteFuelPurchasedHeatingWaterBulkMutationVariables
  >;

/**
 * __useDeleteFuelPurchasedHeatingWaterBulkMutation__
 *
 * To run a mutation, you first call `useDeleteFuelPurchasedHeatingWaterBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFuelPurchasedHeatingWaterBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFuelPurchasedHeatingWaterBulkMutation, { data, loading, error }] = useDeleteFuelPurchasedHeatingWaterBulkMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteFuelPurchasedHeatingWaterBulkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteFuelPurchasedHeatingWaterBulkMutation,
    DeleteFuelPurchasedHeatingWaterBulkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteFuelPurchasedHeatingWaterBulkMutation,
    DeleteFuelPurchasedHeatingWaterBulkMutationVariables
  >(DeleteFuelPurchasedHeatingWaterBulkDocument, options);
}
export type DeleteFuelPurchasedHeatingWaterBulkMutationHookResult = ReturnType<
  typeof useDeleteFuelPurchasedHeatingWaterBulkMutation
>;
export type DeleteFuelPurchasedHeatingWaterBulkMutationResult =
  Apollo.MutationResult<DeleteFuelPurchasedHeatingWaterBulkMutation>;
export type DeleteFuelPurchasedHeatingWaterBulkMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteFuelPurchasedHeatingWaterBulkMutation,
    DeleteFuelPurchasedHeatingWaterBulkMutationVariables
  >;
