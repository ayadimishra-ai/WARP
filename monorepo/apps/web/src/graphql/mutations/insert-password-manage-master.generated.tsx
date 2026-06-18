import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertPasswordManageMasterMutationVariables = Types.Exact<{
  object: Types.Tbl_PasswordManageMaster_Insert_Input;
}>;

export type InsertPasswordManageMasterMutation = {
  __typename?: "mutation_root";
  insert_Tbl_PasswordManageMaster_one?: {
    __typename?: "Tbl_PasswordManageMaster";
    ChangePasswordGuid: any;
    EmailId?: string | null;
    Password?: string | null;
    PasswordCreateDate?: any | null;
  } | null;
};

export const InsertPasswordManageMasterDocument = gql`
  mutation InsertPasswordManageMaster(
    $object: Tbl_PasswordManageMaster_insert_input!
  ) {
    insert_Tbl_PasswordManageMaster_one(object: $object) {
      ChangePasswordGuid
      EmailId
      Password
      PasswordCreateDate
    }
  }
`;
export type InsertPasswordManageMasterMutationFn = Apollo.MutationFunction<
  InsertPasswordManageMasterMutation,
  InsertPasswordManageMasterMutationVariables
>;

/**
 * __useInsertPasswordManageMasterMutation__
 *
 * To run a mutation, you first call `useInsertPasswordManageMasterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertPasswordManageMasterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertPasswordManageMasterMutation, { data, loading, error }] = useInsertPasswordManageMasterMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertPasswordManageMasterMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertPasswordManageMasterMutation,
    InsertPasswordManageMasterMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertPasswordManageMasterMutation,
    InsertPasswordManageMasterMutationVariables
  >(InsertPasswordManageMasterDocument, options);
}
export type InsertPasswordManageMasterMutationHookResult = ReturnType<
  typeof useInsertPasswordManageMasterMutation
>;
export type InsertPasswordManageMasterMutationResult =
  Apollo.MutationResult<InsertPasswordManageMasterMutation>;
export type InsertPasswordManageMasterMutationOptions =
  Apollo.BaseMutationOptions<
    InsertPasswordManageMasterMutation,
    InsertPasswordManageMasterMutationVariables
  >;
