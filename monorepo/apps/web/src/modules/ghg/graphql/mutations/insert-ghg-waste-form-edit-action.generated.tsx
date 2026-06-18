import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertGhgWasteFormEditActionMutationVariables = Types.Exact<{
  insertData: Types.GhgWaste_Insert_Input;
}>;

export type InsertGhgWasteFormEditActionMutation = {
  __typename?: "mutation_root";
  insert_GHGWaste_one?: {
    __typename?: "GHGWaste";
    id: any;
    task_request_id: any;
  } | null;
};

export const InsertGhgWasteFormEditActionDocument = gql`
  mutation insertGHGWasteFormEditAction($insertData: GHGWaste_insert_input!) {
    insert_GHGWaste_one(object: $insertData) {
      id
      task_request_id
    }
  }
`;
export type InsertGhgWasteFormEditActionMutationFn = Apollo.MutationFunction<
  InsertGhgWasteFormEditActionMutation,
  InsertGhgWasteFormEditActionMutationVariables
>;

/**
 * __useInsertGhgWasteFormEditActionMutation__
 *
 * To run a mutation, you first call `useInsertGhgWasteFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertGhgWasteFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertGhgWasteFormEditActionMutation, { data, loading, error }] = useInsertGhgWasteFormEditActionMutation({
 *   variables: {
 *      insertData: // value for 'insertData'
 *   },
 * });
 */
export function useInsertGhgWasteFormEditActionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertGhgWasteFormEditActionMutation,
    InsertGhgWasteFormEditActionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertGhgWasteFormEditActionMutation,
    InsertGhgWasteFormEditActionMutationVariables
  >(InsertGhgWasteFormEditActionDocument, options);
}
export type InsertGhgWasteFormEditActionMutationHookResult = ReturnType<
  typeof useInsertGhgWasteFormEditActionMutation
>;
export type InsertGhgWasteFormEditActionMutationResult =
  Apollo.MutationResult<InsertGhgWasteFormEditActionMutation>;
export type InsertGhgWasteFormEditActionMutationOptions =
  Apollo.BaseMutationOptions<
    InsertGhgWasteFormEditActionMutation,
    InsertGhgWasteFormEditActionMutationVariables
  >;
