import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteCaptivePowerParentBulkMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteCaptivePowerParentBulkMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergy_CaptivePower?: {
    __typename?: "GHGEnergy_CaptivePower_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergy_CaptivePower";
      id: any;
      task_request_id: any;
    }>;
  } | null;
};

export const DeleteCaptivePowerParentBulkDocument = gql`
  mutation deleteCaptivePowerParentBulk($ids: [uuid!]!) {
    delete_GHGEnergy_CaptivePower(where: { id: { _in: $ids } }) {
      affected_rows
      returning {
        id
        task_request_id
      }
    }
  }
`;
export type DeleteCaptivePowerParentBulkMutationFn = Apollo.MutationFunction<
  DeleteCaptivePowerParentBulkMutation,
  DeleteCaptivePowerParentBulkMutationVariables
>;

/**
 * __useDeleteCaptivePowerParentBulkMutation__
 *
 * To run a mutation, you first call `useDeleteCaptivePowerParentBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCaptivePowerParentBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCaptivePowerParentBulkMutation, { data, loading, error }] = useDeleteCaptivePowerParentBulkMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteCaptivePowerParentBulkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCaptivePowerParentBulkMutation,
    DeleteCaptivePowerParentBulkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCaptivePowerParentBulkMutation,
    DeleteCaptivePowerParentBulkMutationVariables
  >(DeleteCaptivePowerParentBulkDocument, options);
}
export type DeleteCaptivePowerParentBulkMutationHookResult = ReturnType<
  typeof useDeleteCaptivePowerParentBulkMutation
>;
export type DeleteCaptivePowerParentBulkMutationResult =
  Apollo.MutationResult<DeleteCaptivePowerParentBulkMutation>;
export type DeleteCaptivePowerParentBulkMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteCaptivePowerParentBulkMutation,
    DeleteCaptivePowerParentBulkMutationVariables
  >;
