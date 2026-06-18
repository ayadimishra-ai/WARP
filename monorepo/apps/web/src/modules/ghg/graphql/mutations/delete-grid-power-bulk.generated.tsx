import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteGridPowerBulkMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteGridPowerBulkMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergyConsumption_GridPower?: {
    __typename?: "GHGEnergyConsumption_GridPower_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergyConsumption_GridPower";
      id: any;
      organization_address_id: any;
      task_request_id: any;
    }>;
  } | null;
};

export const DeleteGridPowerBulkDocument = gql`
  mutation deleteGridPowerBulk($ids: [uuid!]!) {
    delete_GHGEnergyConsumption_GridPower(where: { id: { _in: $ids } }) {
      affected_rows
      returning {
        id
        organization_address_id
        task_request_id
      }
    }
  }
`;
export type DeleteGridPowerBulkMutationFn = Apollo.MutationFunction<
  DeleteGridPowerBulkMutation,
  DeleteGridPowerBulkMutationVariables
>;

/**
 * __useDeleteGridPowerBulkMutation__
 *
 * To run a mutation, you first call `useDeleteGridPowerBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGridPowerBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGridPowerBulkMutation, { data, loading, error }] = useDeleteGridPowerBulkMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteGridPowerBulkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteGridPowerBulkMutation,
    DeleteGridPowerBulkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteGridPowerBulkMutation,
    DeleteGridPowerBulkMutationVariables
  >(DeleteGridPowerBulkDocument, options);
}
export type DeleteGridPowerBulkMutationHookResult = ReturnType<
  typeof useDeleteGridPowerBulkMutation
>;
export type DeleteGridPowerBulkMutationResult =
  Apollo.MutationResult<DeleteGridPowerBulkMutation>;
export type DeleteGridPowerBulkMutationOptions = Apollo.BaseMutationOptions<
  DeleteGridPowerBulkMutation,
  DeleteGridPowerBulkMutationVariables
>;
