import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateAiFileDataMutationVariables = Types.Exact<{
  where: Types.AiFileData_Bool_Exp;
  set: Types.AiFileData_Set_Input;
}>;

export type UpdateAiFileDataMutation = {
  __typename?: "mutation_root";
  update_AIFileData?: {
    __typename?: "AIFileData_mutation_response";
    affected_rows: number;
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

export const UpdateAiFileDataDocument = gql`
  mutation UpdateAIFileData(
    $where: AIFileData_bool_exp!
    $set: AIFileData_set_input!
  ) {
    update_AIFileData(where: $where, _set: $set) {
      affected_rows
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
export type UpdateAiFileDataMutationFn = Apollo.MutationFunction<
  UpdateAiFileDataMutation,
  UpdateAiFileDataMutationVariables
>;

/**
 * __useUpdateAiFileDataMutation__
 *
 * To run a mutation, you first call `useUpdateAiFileDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAiFileDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAiFileDataMutation, { data, loading, error }] = useUpdateAiFileDataMutation({
 *   variables: {
 *      where: // value for 'where'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateAiFileDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateAiFileDataMutation,
    UpdateAiFileDataMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateAiFileDataMutation,
    UpdateAiFileDataMutationVariables
  >(UpdateAiFileDataDocument, options);
}
export type UpdateAiFileDataMutationHookResult = ReturnType<
  typeof useUpdateAiFileDataMutation
>;
export type UpdateAiFileDataMutationResult =
  Apollo.MutationResult<UpdateAiFileDataMutation>;
export type UpdateAiFileDataMutationOptions = Apollo.BaseMutationOptions<
  UpdateAiFileDataMutation,
  UpdateAiFileDataMutationVariables
>;
