import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteUseOfSoldProductsFuelMutationVariables = Types.Exact<{
  where: Types.GhgUseOfSoldProducts_Fuel_Bool_Exp;
}>;

export type DeleteUseOfSoldProductsFuelMutation = {
  __typename?: "mutation_root";
  delete_GHGUseOfSoldProducts_Fuel?: {
    __typename?: "GHGUseOfSoldProducts_Fuel_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Fuel";
      id: any;
      task_request_id?: any | null;
    }>;
  } | null;
};

export const DeleteUseOfSoldProductsFuelDocument = gql`
  mutation deleteUseOfSoldProductsFuel(
    $where: GHGUseOfSoldProducts_Fuel_bool_exp!
  ) {
    delete_GHGUseOfSoldProducts_Fuel(where: $where) {
      returning {
        id
        task_request_id
      }
    }
  }
`;
export type DeleteUseOfSoldProductsFuelMutationFn = Apollo.MutationFunction<
  DeleteUseOfSoldProductsFuelMutation,
  DeleteUseOfSoldProductsFuelMutationVariables
>;

/**
 * __useDeleteUseOfSoldProductsFuelMutation__
 *
 * To run a mutation, you first call `useDeleteUseOfSoldProductsFuelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUseOfSoldProductsFuelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUseOfSoldProductsFuelMutation, { data, loading, error }] = useDeleteUseOfSoldProductsFuelMutation({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useDeleteUseOfSoldProductsFuelMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteUseOfSoldProductsFuelMutation,
    DeleteUseOfSoldProductsFuelMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteUseOfSoldProductsFuelMutation,
    DeleteUseOfSoldProductsFuelMutationVariables
  >(DeleteUseOfSoldProductsFuelDocument, options);
}
export type DeleteUseOfSoldProductsFuelMutationHookResult = ReturnType<
  typeof useDeleteUseOfSoldProductsFuelMutation
>;
export type DeleteUseOfSoldProductsFuelMutationResult =
  Apollo.MutationResult<DeleteUseOfSoldProductsFuelMutation>;
export type DeleteUseOfSoldProductsFuelMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteUseOfSoldProductsFuelMutation,
    DeleteUseOfSoldProductsFuelMutationVariables
  >;
