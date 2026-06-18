import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertAiFileDataMutationVariables = Types.Exact<{
  input: Array<Types.AiFileData_Insert_Input> | Types.AiFileData_Insert_Input;
}>;

export type InsertAiFileDataMutation = {
  __typename?: "mutation_root";
  insert_AIFileData?: {
    __typename?: "AIFileData_mutation_response";
    returning: Array<{
      __typename?: "AIFileData";
      id: any;
      file_id: any;
      previous_reading_date?: any | null;
      present_reading_date?: any | null;
      extracted_values?: any | null;
      edited_values?: any | null;
    }>;
  } | null;
};

export const InsertAiFileDataDocument = gql`
  mutation InsertAIFileData($input: [AIFileData_insert_input!]!) {
    insert_AIFileData(objects: $input) {
      returning {
        id
        file_id
        previous_reading_date
        present_reading_date
        extracted_values
        edited_values
      }
    }
  }
`;
export type InsertAiFileDataMutationFn = Apollo.MutationFunction<
  InsertAiFileDataMutation,
  InsertAiFileDataMutationVariables
>;

/**
 * __useInsertAiFileDataMutation__
 *
 * To run a mutation, you first call `useInsertAiFileDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertAiFileDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertAiFileDataMutation, { data, loading, error }] = useInsertAiFileDataMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertAiFileDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertAiFileDataMutation,
    InsertAiFileDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertAiFileDataMutation,
    InsertAiFileDataMutationVariables
  >(InsertAiFileDataDocument, options);
}
export type InsertAiFileDataMutationHookResult = ReturnType<
  typeof useInsertAiFileDataMutation
>;
export type InsertAiFileDataMutationResult =
  Apollo.MutationResult<InsertAiFileDataMutation>;
export type InsertAiFileDataMutationOptions = Apollo.BaseMutationOptions<
  InsertAiFileDataMutation,
  InsertAiFileDataMutationVariables
>;
