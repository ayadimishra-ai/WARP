import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteCaptivePowerNonRenewableBulkMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteCaptivePowerNonRenewableBulkMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergy_CaptivePower_NonRenewable?: {
    __typename?: "GHGEnergy_CaptivePower_NonRenewable_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergy_CaptivePower_NonRenewable";
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

export const DeleteCaptivePowerNonRenewableBulkDocument = gql`
  mutation deleteCaptivePowerNonRenewableBulk($ids: [uuid!]!) {
    delete_GHGEnergy_CaptivePower_NonRenewable(where: { id: { _in: $ids } }) {
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
export type DeleteCaptivePowerNonRenewableBulkMutationFn =
  Apollo.MutationFunction<
    DeleteCaptivePowerNonRenewableBulkMutation,
    DeleteCaptivePowerNonRenewableBulkMutationVariables
  >;

/**
 * __useDeleteCaptivePowerNonRenewableBulkMutation__
 *
 * To run a mutation, you first call `useDeleteCaptivePowerNonRenewableBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCaptivePowerNonRenewableBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCaptivePowerNonRenewableBulkMutation, { data, loading, error }] = useDeleteCaptivePowerNonRenewableBulkMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteCaptivePowerNonRenewableBulkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCaptivePowerNonRenewableBulkMutation,
    DeleteCaptivePowerNonRenewableBulkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCaptivePowerNonRenewableBulkMutation,
    DeleteCaptivePowerNonRenewableBulkMutationVariables
  >(DeleteCaptivePowerNonRenewableBulkDocument, options);
}
export type DeleteCaptivePowerNonRenewableBulkMutationHookResult = ReturnType<
  typeof useDeleteCaptivePowerNonRenewableBulkMutation
>;
export type DeleteCaptivePowerNonRenewableBulkMutationResult =
  Apollo.MutationResult<DeleteCaptivePowerNonRenewableBulkMutation>;
export type DeleteCaptivePowerNonRenewableBulkMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteCaptivePowerNonRenewableBulkMutation,
    DeleteCaptivePowerNonRenewableBulkMutationVariables
  >;
