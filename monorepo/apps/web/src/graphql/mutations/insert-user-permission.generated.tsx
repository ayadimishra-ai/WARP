import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertUserPermissionMutationVariables = Types.Exact<{
  object: Types.Tbl_UserPermissions_Insert_Input;
}>;

export type InsertUserPermissionMutation = {
  __typename?: "mutation_root";
  insert_Tbl_UserPermissions_one?: {
    __typename?: "Tbl_UserPermissions";
    UserPermissionGuid: any;
    UserGuid?: any | null;
    PermissionGuid: any;
    Rights: any;
  } | null;
};

export const InsertUserPermissionDocument = gql`
  mutation InsertUserPermission($object: Tbl_UserPermissions_insert_input!) {
    insert_Tbl_UserPermissions_one(object: $object) {
      UserPermissionGuid
      UserGuid
      PermissionGuid
      Rights
    }
  }
`;
export type InsertUserPermissionMutationFn = Apollo.MutationFunction<
  InsertUserPermissionMutation,
  InsertUserPermissionMutationVariables
>;

/**
 * __useInsertUserPermissionMutation__
 *
 * To run a mutation, you first call `useInsertUserPermissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertUserPermissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertUserPermissionMutation, { data, loading, error }] = useInsertUserPermissionMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertUserPermissionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertUserPermissionMutation,
    InsertUserPermissionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertUserPermissionMutation,
    InsertUserPermissionMutationVariables
  >(InsertUserPermissionDocument, options);
}
export type InsertUserPermissionMutationHookResult = ReturnType<
  typeof useInsertUserPermissionMutation
>;
export type InsertUserPermissionMutationResult =
  Apollo.MutationResult<InsertUserPermissionMutation>;
export type InsertUserPermissionMutationOptions = Apollo.BaseMutationOptions<
  InsertUserPermissionMutation,
  InsertUserPermissionMutationVariables
>;
