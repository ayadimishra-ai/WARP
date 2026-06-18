import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteAiFileActivityTaskRequestMappingMutationVariables =
  Types.Exact<{
    aiFileUploadIds:
      | Array<Types.Scalars["uuid"]["input"]>
      | Types.Scalars["uuid"]["input"];
  }>;

export type DeleteAiFileActivityTaskRequestMappingMutation = {
  __typename?: "mutation_root";
  delete_AIFileActivityTaskRequestMapping?: {
    __typename?: "AIFileActivityTaskRequestMapping_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "AIFileActivityTaskRequestMapping";
      id: any;
    }>;
  } | null;
};

export const DeleteAiFileActivityTaskRequestMappingDocument = gql`
  mutation DeleteAIFileActivityTaskRequestMapping($aiFileUploadIds: [uuid!]!) {
    delete_AIFileActivityTaskRequestMapping(
      where: { aifileupload_id: { _in: $aiFileUploadIds } }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`;
export type DeleteAiFileActivityTaskRequestMappingMutationFn =
  Apollo.MutationFunction<
    DeleteAiFileActivityTaskRequestMappingMutation,
    DeleteAiFileActivityTaskRequestMappingMutationVariables
  >;

/**
 * __useDeleteAiFileActivityTaskRequestMappingMutation__
 *
 * To run a mutation, you first call `useDeleteAiFileActivityTaskRequestMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAiFileActivityTaskRequestMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAiFileActivityTaskRequestMappingMutation, { data, loading, error }] = useDeleteAiFileActivityTaskRequestMappingMutation({
 *   variables: {
 *      aiFileUploadIds: // value for 'aiFileUploadIds'
 *   },
 * });
 */
export function useDeleteAiFileActivityTaskRequestMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteAiFileActivityTaskRequestMappingMutation,
    DeleteAiFileActivityTaskRequestMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteAiFileActivityTaskRequestMappingMutation,
    DeleteAiFileActivityTaskRequestMappingMutationVariables
  >(DeleteAiFileActivityTaskRequestMappingDocument, options);
}
export type DeleteAiFileActivityTaskRequestMappingMutationHookResult =
  ReturnType<typeof useDeleteAiFileActivityTaskRequestMappingMutation>;
export type DeleteAiFileActivityTaskRequestMappingMutationResult =
  Apollo.MutationResult<DeleteAiFileActivityTaskRequestMappingMutation>;
export type DeleteAiFileActivityTaskRequestMappingMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteAiFileActivityTaskRequestMappingMutation,
    DeleteAiFileActivityTaskRequestMappingMutationVariables
  >;
