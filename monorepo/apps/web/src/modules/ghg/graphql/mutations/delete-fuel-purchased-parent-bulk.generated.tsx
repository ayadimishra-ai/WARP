import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteFuelPurchasedParentBulkMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteFuelPurchasedParentBulkMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergyConsumption_FuelPurchased?: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased";
      id: any;
      task_request_id: any;
    }>;
  } | null;
};

export const DeleteFuelPurchasedParentBulkDocument = gql`
  mutation deleteFuelPurchasedParentBulk($ids: [uuid!]!) {
    delete_GHGEnergyConsumption_FuelPurchased(where: { id: { _in: $ids } }) {
      affected_rows
      returning {
        id
        task_request_id
      }
    }
  }
`;
export type DeleteFuelPurchasedParentBulkMutationFn = Apollo.MutationFunction<
  DeleteFuelPurchasedParentBulkMutation,
  DeleteFuelPurchasedParentBulkMutationVariables
>;

/**
 * __useDeleteFuelPurchasedParentBulkMutation__
 *
 * To run a mutation, you first call `useDeleteFuelPurchasedParentBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFuelPurchasedParentBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFuelPurchasedParentBulkMutation, { data, loading, error }] = useDeleteFuelPurchasedParentBulkMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteFuelPurchasedParentBulkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteFuelPurchasedParentBulkMutation,
    DeleteFuelPurchasedParentBulkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteFuelPurchasedParentBulkMutation,
    DeleteFuelPurchasedParentBulkMutationVariables
  >(DeleteFuelPurchasedParentBulkDocument, options);
}
export type DeleteFuelPurchasedParentBulkMutationHookResult = ReturnType<
  typeof useDeleteFuelPurchasedParentBulkMutation
>;
export type DeleteFuelPurchasedParentBulkMutationResult =
  Apollo.MutationResult<DeleteFuelPurchasedParentBulkMutation>;
export type DeleteFuelPurchasedParentBulkMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteFuelPurchasedParentBulkMutation,
    DeleteFuelPurchasedParentBulkMutationVariables
  >;
