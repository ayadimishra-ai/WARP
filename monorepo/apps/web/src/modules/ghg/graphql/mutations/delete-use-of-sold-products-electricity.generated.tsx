import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteUseOfSoldProductsElectricityMutationVariables = Types.Exact<{
  where: Types.GhgUseOfSoldProducts_Electricity_Bool_Exp;
}>;

export type DeleteUseOfSoldProductsElectricityMutation = {
  __typename?: "mutation_root";
  delete_GHGUseOfSoldProducts_Electricity?: {
    __typename?: "GHGUseOfSoldProducts_Electricity_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Electricity";
      id: any;
      task_request_id?: any | null;
    }>;
  } | null;
};

export const DeleteUseOfSoldProductsElectricityDocument = gql`
  mutation deleteUseOfSoldProductsElectricity(
    $where: GHGUseOfSoldProducts_Electricity_bool_exp!
  ) {
    delete_GHGUseOfSoldProducts_Electricity(where: $where) {
      returning {
        id
        task_request_id
      }
    }
  }
`;
export type DeleteUseOfSoldProductsElectricityMutationFn =
  Apollo.MutationFunction<
    DeleteUseOfSoldProductsElectricityMutation,
    DeleteUseOfSoldProductsElectricityMutationVariables
  >;

/**
 * __useDeleteUseOfSoldProductsElectricityMutation__
 *
 * To run a mutation, you first call `useDeleteUseOfSoldProductsElectricityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUseOfSoldProductsElectricityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUseOfSoldProductsElectricityMutation, { data, loading, error }] = useDeleteUseOfSoldProductsElectricityMutation({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useDeleteUseOfSoldProductsElectricityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteUseOfSoldProductsElectricityMutation,
    DeleteUseOfSoldProductsElectricityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteUseOfSoldProductsElectricityMutation,
    DeleteUseOfSoldProductsElectricityMutationVariables
  >(DeleteUseOfSoldProductsElectricityDocument, options);
}
export type DeleteUseOfSoldProductsElectricityMutationHookResult = ReturnType<
  typeof useDeleteUseOfSoldProductsElectricityMutation
>;
export type DeleteUseOfSoldProductsElectricityMutationResult =
  Apollo.MutationResult<DeleteUseOfSoldProductsElectricityMutation>;
export type DeleteUseOfSoldProductsElectricityMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteUseOfSoldProductsElectricityMutation,
    DeleteUseOfSoldProductsElectricityMutationVariables
  >;
