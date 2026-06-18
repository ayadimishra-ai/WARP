import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUserRoleByUserIdMutationVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
  roleGuid: Types.Scalars["uuid"]["input"];
}>;

export type UpdateUserRoleByUserIdMutation = {
  __typename?: "mutation_root";
  update_Tbl_UserRoleMapping?: {
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

export const UpdateUserRoleByUserIdDocument = gql`
  mutation updateUserRoleByUserId($userGuid: uuid!, $roleGuid: uuid!) {
    update_Tbl_UserRoleMapping(
      where: { UserGuid: { _eq: $userGuid } }
      _set: { RoleGuid: $roleGuid }
    ) {
      affected_rows
      returning {
        UserRoleMappingGuid
        UserGuid
        RoleGuid
      }
    }
  }
`;
export type UpdateUserRoleByUserIdMutationFn = Apollo.MutationFunction<
  UpdateUserRoleByUserIdMutation,
  UpdateUserRoleByUserIdMutationVariables
>;

/**
 * __useUpdateUserRoleByUserIdMutation__
 *
 * To run a mutation, you first call `useUpdateUserRoleByUserIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserRoleByUserIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserRoleByUserIdMutation, { data, loading, error }] = useUpdateUserRoleByUserIdMutation({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *      roleGuid: // value for 'roleGuid'
 *   },
 * });
 */
export function useUpdateUserRoleByUserIdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserRoleByUserIdMutation,
    UpdateUserRoleByUserIdMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserRoleByUserIdMutation,
    UpdateUserRoleByUserIdMutationVariables
  >(UpdateUserRoleByUserIdDocument, options);
}
export type UpdateUserRoleByUserIdMutationHookResult = ReturnType<
  typeof useUpdateUserRoleByUserIdMutation
>;
export type UpdateUserRoleByUserIdMutationResult =
  Apollo.MutationResult<UpdateUserRoleByUserIdMutation>;
export type UpdateUserRoleByUserIdMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserRoleByUserIdMutation,
  UpdateUserRoleByUserIdMutationVariables
>;
