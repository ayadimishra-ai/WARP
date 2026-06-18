import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteFuelPurchasedAuxiliaryBulkMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteFuelPurchasedAuxiliaryBulkMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergyConsumption_FuelPurchased_Auxiliary?: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_Auxiliary";
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

export const DeleteFuelPurchasedAuxiliaryBulkDocument = gql`
  mutation deleteFuelPurchasedAuxiliaryBulk($ids: [uuid!]!) {
    delete_GHGEnergyConsumption_FuelPurchased_Auxiliary(
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
export type DeleteFuelPurchasedAuxiliaryBulkMutationFn =
  Apollo.MutationFunction<
    DeleteFuelPurchasedAuxiliaryBulkMutation,
    DeleteFuelPurchasedAuxiliaryBulkMutationVariables
  >;

/**
 * __useDeleteFuelPurchasedAuxiliaryBulkMutation__
 *
 * To run a mutation, you first call `useDeleteFuelPurchasedAuxiliaryBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFuelPurchasedAuxiliaryBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFuelPurchasedAuxiliaryBulkMutation, { data, loading, error }] = useDeleteFuelPurchasedAuxiliaryBulkMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteFuelPurchasedAuxiliaryBulkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteFuelPurchasedAuxiliaryBulkMutation,
    DeleteFuelPurchasedAuxiliaryBulkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteFuelPurchasedAuxiliaryBulkMutation,
    DeleteFuelPurchasedAuxiliaryBulkMutationVariables
  >(DeleteFuelPurchasedAuxiliaryBulkDocument, options);
}
export type DeleteFuelPurchasedAuxiliaryBulkMutationHookResult = ReturnType<
  typeof useDeleteFuelPurchasedAuxiliaryBulkMutation
>;
export type DeleteFuelPurchasedAuxiliaryBulkMutationResult =
  Apollo.MutationResult<DeleteFuelPurchasedAuxiliaryBulkMutation>;
export type DeleteFuelPurchasedAuxiliaryBulkMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteFuelPurchasedAuxiliaryBulkMutation,
    DeleteFuelPurchasedAuxiliaryBulkMutationVariables
  >;
