import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertUserPermissionsMutationVariables = Types.Exact<{
  input:
    | Array<Types.Tbl_UserPermissions_Insert_Input>
    | Types.Tbl_UserPermissions_Insert_Input;
}>;

export type InsertUserPermissionsMutation = {
  __typename?: "mutation_root";
  insert_Tbl_UserPermissions?: {
    __typename?: "Tbl_UserPermissions_mutation_response";
    returning: Array<{
      __typename?: "Tbl_UserPermissions";
      UserPermissionGuid: any;
      UserGuid?: any | null;
      PermissionGuid: any;
      Rights: any;
      Tbl_Permission: {
        __typename?: "Tbl_Permissions";
        Tbl_Page: {
          __typename?: "Tbl_Pages";
          PageKey: string;
          PlatformType?: string | null;
        };
      };
    }>;
  } | null;
};

export const InsertUserPermissionsDocument = gql`
  mutation insertUserPermissions($input: [Tbl_UserPermissions_insert_input!]!) {
    insert_Tbl_UserPermissions(objects: $input) {
      returning {
        UserPermissionGuid
        UserGuid
        PermissionGuid
        Rights
        Tbl_Permission {
          Tbl_Page {
            PageKey
            PlatformType
          }
        }
      }
    }
  }
`;
export type InsertUserPermissionsMutationFn = Apollo.MutationFunction<
  InsertUserPermissionsMutation,
  InsertUserPermissionsMutationVariables
>;

/**
 * __useInsertUserPermissionsMutation__
 *
 * To run a mutation, you first call `useInsertUserPermissionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertUserPermissionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertUserPermissionsMutation, { data, loading, error }] = useInsertUserPermissionsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertUserPermissionsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertUserPermissionsMutation,
    InsertUserPermissionsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertUserPermissionsMutation,
    InsertUserPermissionsMutationVariables
  >(InsertUserPermissionsDocument, options);
}
export type InsertUserPermissionsMutationHookResult = ReturnType<
  typeof useInsertUserPermissionsMutation
>;
export type InsertUserPermissionsMutationResult =
  Apollo.MutationResult<InsertUserPermissionsMutation>;
export type InsertUserPermissionsMutationOptions = Apollo.BaseMutationOptions<
  InsertUserPermissionsMutation,
  InsertUserPermissionsMutationVariables
>;
