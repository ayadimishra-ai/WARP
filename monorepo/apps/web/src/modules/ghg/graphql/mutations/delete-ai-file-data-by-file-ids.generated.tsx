import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteAiFileDataByFileIdsMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteAiFileDataByFileIdsMutation = {
  __typename?: "mutation_root";
  delete_AIFileData?: {
    __typename?: "AIFileData_mutation_response";
    affected_rows: number;
    returning: Array<{ __typename?: "AIFileData"; id: any }>;
  } | null;
};

export const DeleteAiFileDataByFileIdsDocument = gql`
  mutation DeleteAIFileDataByFileIds($ids: [uuid!]!) {
    delete_AIFileData(where: { file_id: { _in: $ids } }) {
      affected_rows
      returning {
        id
      }
    }
  }
`;
export type DeleteAiFileDataByFileIdsMutationFn = Apollo.MutationFunction<
  DeleteAiFileDataByFileIdsMutation,
  DeleteAiFileDataByFileIdsMutationVariables
>;

/**
 * __useDeleteAiFileDataByFileIdsMutation__
 *
 * To run a mutation, you first call `useDeleteAiFileDataByFileIdsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAiFileDataByFileIdsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAiFileDataByFileIdsMutation, { data, loading, error }] = useDeleteAiFileDataByFileIdsMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteAiFileDataByFileIdsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteAiFileDataByFileIdsMutation,
    DeleteAiFileDataByFileIdsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteAiFileDataByFileIdsMutation,
    DeleteAiFileDataByFileIdsMutationVariables
  >(DeleteAiFileDataByFileIdsDocument, options);
}
export type DeleteAiFileDataByFileIdsMutationHookResult = ReturnType<
  typeof useDeleteAiFileDataByFileIdsMutation
>;
export type DeleteAiFileDataByFileIdsMutationResult =
  Apollo.MutationResult<DeleteAiFileDataByFileIdsMutation>;
export type DeleteAiFileDataByFileIdsMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteAiFileDataByFileIdsMutation,
    DeleteAiFileDataByFileIdsMutationVariables
  >;
