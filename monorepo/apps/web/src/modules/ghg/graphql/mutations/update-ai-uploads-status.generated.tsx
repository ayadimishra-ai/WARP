import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateAiFileUploadsMutationVariables = Types.Exact<{
  where: Types.AiFileUploads_Bool_Exp;
  set: Types.AiFileUploads_Set_Input;
}>;

export type UpdateAiFileUploadsMutation = {
  __typename?: "mutation_root";
  update_AIFileUploads?: {
    __typename?: "AIFileUploads_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "AIFileUploads";
      id: any;
      file_name?: string | null;
      file_url?: string | null;
      status?: string | null;
      updated_at: any;
      updated_by?: any | null;
      file_metadata?: any | null;
      email_send_at?: any | null;
      errors?: any | null;
      is_deleted: boolean;
      identifier?: string | null;
      activity_code: string;
      created_by?: any | null;
      created_at: any;
    }>;
  } | null;
};

export const UpdateAiFileUploadsDocument = gql`
  mutation UpdateAIFileUploads(
    $where: AIFileUploads_bool_exp!
    $set: AIFileUploads_set_input!
  ) {
    update_AIFileUploads(where: $where, _set: $set) {
      affected_rows
      returning {
        id
        file_name
        file_url
        status
        updated_at
        updated_by
        file_metadata
        email_send_at
        errors
        is_deleted
        identifier
        activity_code
        created_by
        created_at
      }
    }
  }
`;
export type UpdateAiFileUploadsMutationFn = Apollo.MutationFunction<
  UpdateAiFileUploadsMutation,
  UpdateAiFileUploadsMutationVariables
>;

/**
 * __useUpdateAiFileUploadsMutation__
 *
 * To run a mutation, you first call `useUpdateAiFileUploadsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAiFileUploadsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAiFileUploadsMutation, { data, loading, error }] = useUpdateAiFileUploadsMutation({
 *   variables: {
 *      where: // value for 'where'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateAiFileUploadsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateAiFileUploadsMutation,
    UpdateAiFileUploadsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateAiFileUploadsMutation,
    UpdateAiFileUploadsMutationVariables
  >(UpdateAiFileUploadsDocument, options);
}
export type UpdateAiFileUploadsMutationHookResult = ReturnType<
  typeof useUpdateAiFileUploadsMutation
>;
export type UpdateAiFileUploadsMutationResult =
  Apollo.MutationResult<UpdateAiFileUploadsMutation>;
export type UpdateAiFileUploadsMutationOptions = Apollo.BaseMutationOptions<
  UpdateAiFileUploadsMutation,
  UpdateAiFileUploadsMutationVariables
>;
