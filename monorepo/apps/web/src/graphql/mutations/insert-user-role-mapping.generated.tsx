import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertUserRoleMappingMutationVariables = Types.Exact<{
  input:
    | Array<Types.Tbl_UserRoleMapping_Insert_Input>
    | Types.Tbl_UserRoleMapping_Insert_Input;
}>;

export type InsertUserRoleMappingMutation = {
  __typename?: "mutation_root";
  insert_Tbl_UserRoleMapping?: {
    __typename?: "Tbl_UserRoleMapping_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_UserRoleMapping";
      UserGuid: any;
      StatusGuid?: any | null;
      RoleGuid: any;
    }>;
  } | null;
};

export const InsertUserRoleMappingDocument = gql`
  mutation insertUserRoleMapping($input: [Tbl_UserRoleMapping_insert_input!]!) {
    insert_Tbl_UserRoleMapping(objects: $input) {
      affected_rows
      returning {
        UserGuid
        StatusGuid
        RoleGuid
      }
    }
  }
`;
export type InsertUserRoleMappingMutationFn = Apollo.MutationFunction<
  InsertUserRoleMappingMutation,
  InsertUserRoleMappingMutationVariables
>;

/**
 * __useInsertUserRoleMappingMutation__
 *
 * To run a mutation, you first call `useInsertUserRoleMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertUserRoleMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertUserRoleMappingMutation, { data, loading, error }] = useInsertUserRoleMappingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertUserRoleMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertUserRoleMappingMutation,
    InsertUserRoleMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertUserRoleMappingMutation,
    InsertUserRoleMappingMutationVariables
  >(InsertUserRoleMappingDocument, options);
}
export type InsertUserRoleMappingMutationHookResult = ReturnType<
  typeof useInsertUserRoleMappingMutation
>;
export type InsertUserRoleMappingMutationResult =
  Apollo.MutationResult<InsertUserRoleMappingMutation>;
export type InsertUserRoleMappingMutationOptions = Apollo.BaseMutationOptions<
  InsertUserRoleMappingMutation,
  InsertUserRoleMappingMutationVariables
>;
