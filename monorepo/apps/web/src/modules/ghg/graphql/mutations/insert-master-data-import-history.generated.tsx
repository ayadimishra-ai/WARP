import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertMasterDataImportHistoryMutationVariables = Types.Exact<{
  input: Types.MasterDataImportHistory_Insert_Input;
}>;

export type InsertMasterDataImportHistoryMutation = {
  __typename?: "mutation_root";
  insert_MasterDataImportHistory_one?: {
    __typename?: "MasterDataImportHistory";
    id: any;
    organization_id?: any | null;
    import_method: string;
    file_name?: string | null;
    file_url?: string | null;
    status?: string | null;
    status_data?: any | null;
  } | null;
};

export const InsertMasterDataImportHistoryDocument = gql`
  mutation insertMasterDataImportHistory(
    $input: MasterDataImportHistory_insert_input!
  ) {
    insert_MasterDataImportHistory_one(object: $input) {
      id
      organization_id
      import_method
      file_name
      file_url
      status
      status_data
    }
  }
`;
export type InsertMasterDataImportHistoryMutationFn = Apollo.MutationFunction<
  InsertMasterDataImportHistoryMutation,
  InsertMasterDataImportHistoryMutationVariables
>;

/**
 * __useInsertMasterDataImportHistoryMutation__
 *
 * To run a mutation, you first call `useInsertMasterDataImportHistoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertMasterDataImportHistoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertMasterDataImportHistoryMutation, { data, loading, error }] = useInsertMasterDataImportHistoryMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertMasterDataImportHistoryMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertMasterDataImportHistoryMutation,
    InsertMasterDataImportHistoryMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertMasterDataImportHistoryMutation,
    InsertMasterDataImportHistoryMutationVariables
  >(InsertMasterDataImportHistoryDocument, options);
}
export type InsertMasterDataImportHistoryMutationHookResult = ReturnType<
  typeof useInsertMasterDataImportHistoryMutation
>;
export type InsertMasterDataImportHistoryMutationResult =
  Apollo.MutationResult<InsertMasterDataImportHistoryMutation>;
export type InsertMasterDataImportHistoryMutationOptions =
  Apollo.BaseMutationOptions<
    InsertMasterDataImportHistoryMutation,
    InsertMasterDataImportHistoryMutationVariables
  >;
