import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteCaptivePowerRenewableBulkMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteCaptivePowerRenewableBulkMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergy_CaptivePower_Renewable?: {
    __typename?: "GHGEnergy_CaptivePower_Renewable_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergy_CaptivePower_Renewable";
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

export const DeleteCaptivePowerRenewableBulkDocument = gql`
  mutation deleteCaptivePowerRenewableBulk($ids: [uuid!]!) {
    delete_GHGEnergy_CaptivePower_Renewable(where: { id: { _in: $ids } }) {
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
export type DeleteCaptivePowerRenewableBulkMutationFn = Apollo.MutationFunction<
  DeleteCaptivePowerRenewableBulkMutation,
  DeleteCaptivePowerRenewableBulkMutationVariables
>;

/**
 * __useDeleteCaptivePowerRenewableBulkMutation__
 *
 * To run a mutation, you first call `useDeleteCaptivePowerRenewableBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCaptivePowerRenewableBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCaptivePowerRenewableBulkMutation, { data, loading, error }] = useDeleteCaptivePowerRenewableBulkMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteCaptivePowerRenewableBulkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCaptivePowerRenewableBulkMutation,
    DeleteCaptivePowerRenewableBulkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCaptivePowerRenewableBulkMutation,
    DeleteCaptivePowerRenewableBulkMutationVariables
  >(DeleteCaptivePowerRenewableBulkDocument, options);
}
export type DeleteCaptivePowerRenewableBulkMutationHookResult = ReturnType<
  typeof useDeleteCaptivePowerRenewableBulkMutation
>;
export type DeleteCaptivePowerRenewableBulkMutationResult =
  Apollo.MutationResult<DeleteCaptivePowerRenewableBulkMutation>;
export type DeleteCaptivePowerRenewableBulkMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteCaptivePowerRenewableBulkMutation,
    DeleteCaptivePowerRenewableBulkMutationVariables
  >;
