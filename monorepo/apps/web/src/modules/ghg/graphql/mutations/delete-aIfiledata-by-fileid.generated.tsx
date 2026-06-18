import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteAiFileDatabyfileidMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteAiFileDatabyfileidMutation = {
  __typename?: "mutation_root";
  delete_AIFileData?: {
    __typename?: "AIFileData_mutation_response";
    affected_rows: number;
    returning: Array<{ __typename?: "AIFileData"; id: any }>;
  } | null;
};

export const DeleteAiFileDatabyfileidDocument = gql`
  mutation DeleteAIFileDatabyfileid($ids: [uuid!]!) {
    delete_AIFileData(where: { file_id: { _in: $ids } }) {
      affected_rows
      returning {
        id
      }
    }
  }
`;
export type DeleteAiFileDatabyfileidMutationFn = Apollo.MutationFunction<
  DeleteAiFileDatabyfileidMutation,
  DeleteAiFileDatabyfileidMutationVariables
>;

/**
 * __useDeleteAiFileDatabyfileidMutation__
 *
 * To run a mutation, you first call `useDeleteAiFileDatabyfileidMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAiFileDatabyfileidMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAiFileDatabyfileidMutation, { data, loading, error }] = useDeleteAiFileDatabyfileidMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteAiFileDatabyfileidMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteAiFileDatabyfileidMutation,
    DeleteAiFileDatabyfileidMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteAiFileDatabyfileidMutation,
    DeleteAiFileDatabyfileidMutationVariables
  >(DeleteAiFileDatabyfileidDocument, options);
}
export type DeleteAiFileDatabyfileidMutationHookResult = ReturnType<
  typeof useDeleteAiFileDatabyfileidMutation
>;
export type DeleteAiFileDatabyfileidMutationResult =
  Apollo.MutationResult<DeleteAiFileDatabyfileidMutation>;
export type DeleteAiFileDatabyfileidMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteAiFileDatabyfileidMutation,
    DeleteAiFileDatabyfileidMutationVariables
  >;
