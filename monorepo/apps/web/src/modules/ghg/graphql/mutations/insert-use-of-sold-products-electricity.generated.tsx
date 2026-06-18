import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertUseOfSoldProductsElectricityMutationVariables = Types.Exact<{
  objects:
    | Array<Types.GhgUseOfSoldProducts_Electricity_Insert_Input>
    | Types.GhgUseOfSoldProducts_Electricity_Insert_Input;
}>;

export type InsertUseOfSoldProductsElectricityMutation = {
  __typename?: "mutation_root";
  insert_GHGUseOfSoldProducts_Electricity?: {
    __typename?: "GHGUseOfSoldProducts_Electricity_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Electricity";
      id: any;
      task_request_id?: any | null;
    }>;
  } | null;
};

export const InsertUseOfSoldProductsElectricityDocument = gql`
  mutation insertUseOfSoldProductsElectricity(
    $objects: [GHGUseOfSoldProducts_Electricity_insert_input!]!
  ) {
    insert_GHGUseOfSoldProducts_Electricity(objects: $objects) {
      returning {
        id
        task_request_id
      }
    }
  }
`;
export type InsertUseOfSoldProductsElectricityMutationFn =
  Apollo.MutationFunction<
    InsertUseOfSoldProductsElectricityMutation,
    InsertUseOfSoldProductsElectricityMutationVariables
  >;

/**
 * __useInsertUseOfSoldProductsElectricityMutation__
 *
 * To run a mutation, you first call `useInsertUseOfSoldProductsElectricityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertUseOfSoldProductsElectricityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertUseOfSoldProductsElectricityMutation, { data, loading, error }] = useInsertUseOfSoldProductsElectricityMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useInsertUseOfSoldProductsElectricityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertUseOfSoldProductsElectricityMutation,
    InsertUseOfSoldProductsElectricityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertUseOfSoldProductsElectricityMutation,
    InsertUseOfSoldProductsElectricityMutationVariables
  >(InsertUseOfSoldProductsElectricityDocument, options);
}
export type InsertUseOfSoldProductsElectricityMutationHookResult = ReturnType<
  typeof useInsertUseOfSoldProductsElectricityMutation
>;
export type InsertUseOfSoldProductsElectricityMutationResult =
  Apollo.MutationResult<InsertUseOfSoldProductsElectricityMutation>;
export type InsertUseOfSoldProductsElectricityMutationOptions =
  Apollo.BaseMutationOptions<
    InsertUseOfSoldProductsElectricityMutation,
    InsertUseOfSoldProductsElectricityMutationVariables
  >;
