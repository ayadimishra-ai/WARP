import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertUserRoleMappingMutationVariables = Types.Exact<{
  userguid:
    | Array<Types.Scalars["uuid"]["input"]>
    | Types.Scalars["uuid"]["input"];
  object:
    | Array<Types.Tbl_UserRoleMapping_Insert_Input>
    | Types.Tbl_UserRoleMapping_Insert_Input;
}>;

export type UpsertUserRoleMappingMutation = {
  __typename?: "mutation_root";
  delete_Tbl_UserRoleMapping?: {
    __typename?: "Tbl_UserRoleMapping_mutation_response";
    returning: Array<{
      __typename?: "Tbl_UserRoleMapping";
      UserRoleMappingGuid: any;
      UserGuid: any;
      RoleGuid: any;
    }>;
  } | null;
  insert_Tbl_UserRoleMapping?: {
    __typename?: "Tbl_UserRoleMapping_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_UserRoleMapping";
      UserRoleMappingGuid: any;
      UserGuid: any;
      RoleGuid: any;
    }>;
  } | null;
};

export const UpsertUserRoleMappingDocument = gql`
  mutation upsertUserRoleMapping(
    $userguid: [uuid!]!
    $object: [Tbl_UserRoleMapping_insert_input!]!
  ) {
    delete_Tbl_UserRoleMapping(where: { UserGuid: { _in: $userguid } }) {
      returning {
        UserRoleMappingGuid
        UserGuid
        RoleGuid
      }
    }
    insert_Tbl_UserRoleMapping(objects: $object) {
      affected_rows
      returning {
        UserRoleMappingGuid
        UserGuid
        RoleGuid
      }
    }
  }
`;
export type UpsertUserRoleMappingMutationFn = Apollo.MutationFunction<
  UpsertUserRoleMappingMutation,
  UpsertUserRoleMappingMutationVariables
>;

/**
 * __useUpsertUserRoleMappingMutation__
 *
 * To run a mutation, you first call `useUpsertUserRoleMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertUserRoleMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertUserRoleMappingMutation, { data, loading, error }] = useUpsertUserRoleMappingMutation({
 *   variables: {
 *      userguid: // value for 'userguid'
 *      object: // value for 'object'
 *   },
 * });
 */
export function useUpsertUserRoleMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertUserRoleMappingMutation,
    UpsertUserRoleMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertUserRoleMappingMutation,
    UpsertUserRoleMappingMutationVariables
  >(UpsertUserRoleMappingDocument, options);
}
export type UpsertUserRoleMappingMutationHookResult = ReturnType<
  typeof useUpsertUserRoleMappingMutation
>;
export type UpsertUserRoleMappingMutationResult =
  Apollo.MutationResult<UpsertUserRoleMappingMutation>;
export type UpsertUserRoleMappingMutationOptions = Apollo.BaseMutationOptions<
  UpsertUserRoleMappingMutation,
  UpsertUserRoleMappingMutationVariables
>;
