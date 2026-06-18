import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type AiFileActivityInsertTaskRequestMutationVariables = Types.Exact<{
  input:
    | Array<Types.AiFileActivityTaskRequestMapping_Insert_Input>
    | Types.AiFileActivityTaskRequestMapping_Insert_Input;
  where: Types.AiFileActivityTaskRequestMapping_Bool_Exp;
}>;

export type AiFileActivityInsertTaskRequestMutation = {
  __typename?: "mutation_root";
  delete_AIFileActivityTaskRequestMapping?: {
    __typename?: "AIFileActivityTaskRequestMapping_mutation_response";
    returning: Array<{
      __typename?: "AIFileActivityTaskRequestMapping";
      id: any;
      aifileupload_id?: any | null;
    }>;
  } | null;
  insert_AIFileActivityTaskRequestMapping?: {
    __typename?: "AIFileActivityTaskRequestMapping_mutation_response";
    returning: Array<{
      __typename?: "AIFileActivityTaskRequestMapping";
      id: any;
      activity_task_request_id?: any | null;
      aifileupload_id?: any | null;
      task_request_id?: any | null;
    }>;
  } | null;
};

export const AiFileActivityInsertTaskRequestDocument = gql`
  mutation AIFileActivityInsertTaskRequest(
    $input: [AIFileActivityTaskRequestMapping_insert_input!]!
    $where: AIFileActivityTaskRequestMapping_bool_exp!
  ) {
    delete_AIFileActivityTaskRequestMapping(where: $where) {
      returning {
        id
        aifileupload_id
      }
    }
    insert_AIFileActivityTaskRequestMapping(objects: $input) {
      returning {
        id
        activity_task_request_id
        aifileupload_id
        task_request_id
      }
    }
  }
`;
export type AiFileActivityInsertTaskRequestMutationFn = Apollo.MutationFunction<
  AiFileActivityInsertTaskRequestMutation,
  AiFileActivityInsertTaskRequestMutationVariables
>;

/**
 * __useAiFileActivityInsertTaskRequestMutation__
 *
 * To run a mutation, you first call `useAiFileActivityInsertTaskRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAiFileActivityInsertTaskRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [aiFileActivityInsertTaskRequestMutation, { data, loading, error }] = useAiFileActivityInsertTaskRequestMutation({
 *   variables: {
 *      input: // value for 'input'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useAiFileActivityInsertTaskRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AiFileActivityInsertTaskRequestMutation,
    AiFileActivityInsertTaskRequestMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AiFileActivityInsertTaskRequestMutation,
    AiFileActivityInsertTaskRequestMutationVariables
  >(AiFileActivityInsertTaskRequestDocument, options);
}
export type AiFileActivityInsertTaskRequestMutationHookResult = ReturnType<
  typeof useAiFileActivityInsertTaskRequestMutation
>;
export type AiFileActivityInsertTaskRequestMutationResult =
  Apollo.MutationResult<AiFileActivityInsertTaskRequestMutation>;
export type AiFileActivityInsertTaskRequestMutationOptions =
  Apollo.BaseMutationOptions<
    AiFileActivityInsertTaskRequestMutation,
    AiFileActivityInsertTaskRequestMutationVariables
  >;
