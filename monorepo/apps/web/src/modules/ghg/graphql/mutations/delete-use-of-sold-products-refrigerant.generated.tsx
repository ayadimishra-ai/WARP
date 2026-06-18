import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteUseOfSoldProductsRefrigerantMutationVariables = Types.Exact<{
  where: Types.GhgUseOfSoldProducts_Refrigerant_Bool_Exp;
}>;

export type DeleteUseOfSoldProductsRefrigerantMutation = {
  __typename?: "mutation_root";
  delete_GHGUseOfSoldProducts_Refrigerant?: {
    __typename?: "GHGUseOfSoldProducts_Refrigerant_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Refrigerant";
      id: any;
      task_request_id?: any | null;
    }>;
  } | null;
};

export const DeleteUseOfSoldProductsRefrigerantDocument = gql`
  mutation deleteUseOfSoldProductsRefrigerant(
    $where: GHGUseOfSoldProducts_Refrigerant_bool_exp!
  ) {
    delete_GHGUseOfSoldProducts_Refrigerant(where: $where) {
      returning {
        id
        task_request_id
      }
    }
  }
`;
export type DeleteUseOfSoldProductsRefrigerantMutationFn =
  Apollo.MutationFunction<
    DeleteUseOfSoldProductsRefrigerantMutation,
    DeleteUseOfSoldProductsRefrigerantMutationVariables
  >;

/**
 * __useDeleteUseOfSoldProductsRefrigerantMutation__
 *
 * To run a mutation, you first call `useDeleteUseOfSoldProductsRefrigerantMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUseOfSoldProductsRefrigerantMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUseOfSoldProductsRefrigerantMutation, { data, loading, error }] = useDeleteUseOfSoldProductsRefrigerantMutation({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useDeleteUseOfSoldProductsRefrigerantMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteUseOfSoldProductsRefrigerantMutation,
    DeleteUseOfSoldProductsRefrigerantMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteUseOfSoldProductsRefrigerantMutation,
    DeleteUseOfSoldProductsRefrigerantMutationVariables
  >(DeleteUseOfSoldProductsRefrigerantDocument, options);
}
export type DeleteUseOfSoldProductsRefrigerantMutationHookResult = ReturnType<
  typeof useDeleteUseOfSoldProductsRefrigerantMutation
>;
export type DeleteUseOfSoldProductsRefrigerantMutationResult =
  Apollo.MutationResult<DeleteUseOfSoldProductsRefrigerantMutation>;
export type DeleteUseOfSoldProductsRefrigerantMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteUseOfSoldProductsRefrigerantMutation,
    DeleteUseOfSoldProductsRefrigerantMutationVariables
  >;
