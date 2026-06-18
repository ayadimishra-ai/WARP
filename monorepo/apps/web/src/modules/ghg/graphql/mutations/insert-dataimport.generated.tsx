import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertDataimportMutationVariables = Types.Exact<{
  input: Types.DataImportHistory_Insert_Input;
}>;

export type InsertDataimportMutation = {
  __typename?: "mutation_root";
  insert_DataImportHistory_one?: {
    __typename?: "DataImportHistory";
    id: any;
    organization_address_id?: any | null;
    import_method: string;
    file_name?: string | null;
    file_url?: string | null;
    status?: string | null;
    status_data?: any | null;
  } | null;
};

export const InsertDataimportDocument = gql`
  mutation insertDataimport($input: DataImportHistory_insert_input!) {
    insert_DataImportHistory_one(object: $input) {
      id
      organization_address_id
      import_method
      file_name
      file_url
      status
      status_data
    }
  }
`;
export type InsertDataimportMutationFn = Apollo.MutationFunction<
  InsertDataimportMutation,
  InsertDataimportMutationVariables
>;

/**
 * __useInsertDataimportMutation__
 *
 * To run a mutation, you first call `useInsertDataimportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertDataimportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertDataimportMutation, { data, loading, error }] = useInsertDataimportMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertDataimportMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertDataimportMutation,
    InsertDataimportMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertDataimportMutation,
    InsertDataimportMutationVariables
  >(InsertDataimportDocument, options);
}
export type InsertDataimportMutationHookResult = ReturnType<
  typeof useInsertDataimportMutation
>;
export type InsertDataimportMutationResult =
  Apollo.MutationResult<InsertDataimportMutation>;
export type InsertDataimportMutationOptions = Apollo.BaseMutationOptions<
  InsertDataimportMutation,
  InsertDataimportMutationVariables
>;
