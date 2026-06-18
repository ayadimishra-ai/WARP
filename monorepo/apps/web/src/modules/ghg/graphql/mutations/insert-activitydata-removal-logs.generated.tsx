import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type Insert_ActivityDataRemovalLogsMutationVariables = Types.Exact<{
  objects:
    | Array<Types.ActivityDataRemovalLogs_Insert_Input>
    | Types.ActivityDataRemovalLogs_Insert_Input;
}>;

export type Insert_ActivityDataRemovalLogsMutation = {
  __typename?: "mutation_root";
  insert_ActivityDataRemovalLogs?: {
    __typename?: "ActivityDataRemovalLogs_mutation_response";
    returning: Array<{ __typename?: "ActivityDataRemovalLogs"; id: any }>;
  } | null;
};

export const Insert_ActivityDataRemovalLogsDocument = gql`
  mutation insert_ActivityDataRemovalLogs(
    $objects: [ActivityDataRemovalLogs_insert_input!]!
  ) {
    insert_ActivityDataRemovalLogs(objects: $objects) {
      returning {
        id
      }
    }
  }
`;
export type Insert_ActivityDataRemovalLogsMutationFn = Apollo.MutationFunction<
  Insert_ActivityDataRemovalLogsMutation,
  Insert_ActivityDataRemovalLogsMutationVariables
>;

/**
 * __useInsert_ActivityDataRemovalLogsMutation__
 *
 * To run a mutation, you first call `useInsert_ActivityDataRemovalLogsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsert_ActivityDataRemovalLogsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertActivityDataRemovalLogsMutation, { data, loading, error }] = useInsert_ActivityDataRemovalLogsMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useInsert_ActivityDataRemovalLogsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    Insert_ActivityDataRemovalLogsMutation,
    Insert_ActivityDataRemovalLogsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    Insert_ActivityDataRemovalLogsMutation,
    Insert_ActivityDataRemovalLogsMutationVariables
  >(Insert_ActivityDataRemovalLogsDocument, options);
}
export type Insert_ActivityDataRemovalLogsMutationHookResult = ReturnType<
  typeof useInsert_ActivityDataRemovalLogsMutation
>;
export type Insert_ActivityDataRemovalLogsMutationResult =
  Apollo.MutationResult<Insert_ActivityDataRemovalLogsMutation>;
export type Insert_ActivityDataRemovalLogsMutationOptions =
  Apollo.BaseMutationOptions<
    Insert_ActivityDataRemovalLogsMutation,
    Insert_ActivityDataRemovalLogsMutationVariables
  >;
