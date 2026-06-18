import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertUserPermissionsMutationVariables = Types.Exact<{
  userguid:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
  input:
    | Array<Types.Tbl_UserPermissions_Insert_Input>
    | Types.Tbl_UserPermissions_Insert_Input;
}>;

export type UpsertUserPermissionsMutation = {
  __typename?: "mutation_root";
  delete_Tbl_UserPermissions?: {
    __typename?: "Tbl_UserPermissions_mutation_response";
    returning: Array<{
      __typename?: "Tbl_UserPermissions";
      UserGuid?: any | null;
      PermissionGuid: any;
    }>;
  } | null;
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

export const UpsertUserPermissionsDocument = gql`
  mutation upsertUserPermissions(
    $userguid: [uuid!]!
    $input: [Tbl_UserPermissions_insert_input!]!
  ) {
    delete_Tbl_UserPermissions(where: { UserGuid: { _in: $userguid } }) {
      returning {
        UserGuid
        PermissionGuid
      }
    }
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
export type UpsertUserPermissionsMutationFn = Apollo.MutationFunction<
  UpsertUserPermissionsMutation,
  UpsertUserPermissionsMutationVariables
>;

/**
 * __useUpsertUserPermissionsMutation__
 *
 * To run a mutation, you first call `useUpsertUserPermissionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertUserPermissionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertUserPermissionsMutation, { data, loading, error }] = useUpsertUserPermissionsMutation({
 *   variables: {
 *      userguid: // value for 'userguid'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpsertUserPermissionsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertUserPermissionsMutation,
    UpsertUserPermissionsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertUserPermissionsMutation,
    UpsertUserPermissionsMutationVariables
  >(UpsertUserPermissionsDocument, options);
}
export type UpsertUserPermissionsMutationHookResult = ReturnType<
  typeof useUpsertUserPermissionsMutation
>;
export type UpsertUserPermissionsMutationResult =
  Apollo.MutationResult<UpsertUserPermissionsMutation>;
export type UpsertUserPermissionsMutationOptions = Apollo.BaseMutationOptions<
  UpsertUserPermissionsMutation,
  UpsertUserPermissionsMutationVariables
>;
