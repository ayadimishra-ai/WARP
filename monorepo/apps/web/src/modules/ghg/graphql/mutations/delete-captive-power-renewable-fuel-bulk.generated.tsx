import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteCaptivePowerRenewableFuelBulkMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteCaptivePowerRenewableFuelBulkMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergy_CaptivePower_Renewable_Fuel?: {
    __typename?: "GHGEnergy_CaptivePower_Renewable_Fuel_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergy_CaptivePower_Renewable_Fuel";
      id: any;
      GHGEnergyConsumption_CaptivePower_id: any;
      GHGEnergy_CaptivePower: {
        __typename?: "GHGEnergy_CaptivePower";
        id: any;
        task_request_id: any;
        organization_address_id: any;
      };
    }>;
  } | null;
};

export const DeleteCaptivePowerRenewableFuelBulkDocument = gql`
  mutation deleteCaptivePowerRenewableFuelBulk($ids: [uuid!]!) {
    delete_GHGEnergy_CaptivePower_Renewable_Fuel(where: { id: { _in: $ids } }) {
      affected_rows
      returning {
        id
        GHGEnergyConsumption_CaptivePower_id
        GHGEnergy_CaptivePower {
          id
          task_request_id
          organization_address_id
        }
      }
    }
  }
`;
export type DeleteCaptivePowerRenewableFuelBulkMutationFn =
  Apollo.MutationFunction<
    DeleteCaptivePowerRenewableFuelBulkMutation,
    DeleteCaptivePowerRenewableFuelBulkMutationVariables
  >;

/**
 * __useDeleteCaptivePowerRenewableFuelBulkMutation__
 *
 * To run a mutation, you first call `useDeleteCaptivePowerRenewableFuelBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCaptivePowerRenewableFuelBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCaptivePowerRenewableFuelBulkMutation, { data, loading, error }] = useDeleteCaptivePowerRenewableFuelBulkMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteCaptivePowerRenewableFuelBulkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCaptivePowerRenewableFuelBulkMutation,
    DeleteCaptivePowerRenewableFuelBulkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCaptivePowerRenewableFuelBulkMutation,
    DeleteCaptivePowerRenewableFuelBulkMutationVariables
  >(DeleteCaptivePowerRenewableFuelBulkDocument, options);
}
export type DeleteCaptivePowerRenewableFuelBulkMutationHookResult = ReturnType<
  typeof useDeleteCaptivePowerRenewableFuelBulkMutation
>;
export type DeleteCaptivePowerRenewableFuelBulkMutationResult =
  Apollo.MutationResult<DeleteCaptivePowerRenewableFuelBulkMutation>;
export type DeleteCaptivePowerRenewableFuelBulkMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteCaptivePowerRenewableFuelBulkMutation,
    DeleteCaptivePowerRenewableFuelBulkMutationVariables
  >;
