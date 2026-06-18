import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteFuelPurchasedTransportationBulkMutationVariables =
  Types.Exact<{
    ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
  }>;

export type DeleteFuelPurchasedTransportationBulkMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergyConsumption_FuelPurchased_Transportation?: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_Transportation_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_Transportation";
      id: any;
      task_request_id: any;
      organization_address_id: any;
    }>;
  } | null;
};

export const DeleteFuelPurchasedTransportationBulkDocument = gql`
  mutation deleteFuelPurchasedTransportationBulk($ids: [uuid!]!) {
    delete_GHGEnergyConsumption_FuelPurchased_Transportation(
      where: { id: { _in: $ids } }
    ) {
      affected_rows
      returning {
        id
        task_request_id
        organization_address_id
      }
    }
  }
`;
export type DeleteFuelPurchasedTransportationBulkMutationFn =
  Apollo.MutationFunction<
    DeleteFuelPurchasedTransportationBulkMutation,
    DeleteFuelPurchasedTransportationBulkMutationVariables
  >;

/**
 * __useDeleteFuelPurchasedTransportationBulkMutation__
 *
 * To run a mutation, you first call `useDeleteFuelPurchasedTransportationBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFuelPurchasedTransportationBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFuelPurchasedTransportationBulkMutation, { data, loading, error }] = useDeleteFuelPurchasedTransportationBulkMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteFuelPurchasedTransportationBulkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteFuelPurchasedTransportationBulkMutation,
    DeleteFuelPurchasedTransportationBulkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteFuelPurchasedTransportationBulkMutation,
    DeleteFuelPurchasedTransportationBulkMutationVariables
  >(DeleteFuelPurchasedTransportationBulkDocument, options);
}
export type DeleteFuelPurchasedTransportationBulkMutationHookResult =
  ReturnType<typeof useDeleteFuelPurchasedTransportationBulkMutation>;
export type DeleteFuelPurchasedTransportationBulkMutationResult =
  Apollo.MutationResult<DeleteFuelPurchasedTransportationBulkMutation>;
export type DeleteFuelPurchasedTransportationBulkMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteFuelPurchasedTransportationBulkMutation,
    DeleteFuelPurchasedTransportationBulkMutationVariables
  >;
