import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CreateUserRoleMappingMutationVariables = Types.Exact<{
  object:
    | Array<Types.Tbl_UserRoleMapping_Insert_Input>
    | Types.Tbl_UserRoleMapping_Insert_Input;
}>;

export type CreateUserRoleMappingMutation = {
  __typename?: "mutation_root";
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

export const CreateUserRoleMappingDocument = gql`
  mutation createUserRoleMapping(
    $object: [Tbl_UserRoleMapping_insert_input!]!
  ) {
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
export type CreateUserRoleMappingMutationFn = Apollo.MutationFunction<
  CreateUserRoleMappingMutation,
  CreateUserRoleMappingMutationVariables
>;

/**
 * __useCreateUserRoleMappingMutation__
 *
 * To run a mutation, you first call `useCreateUserRoleMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserRoleMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserRoleMappingMutation, { data, loading, error }] = useCreateUserRoleMappingMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateUserRoleMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateUserRoleMappingMutation,
    CreateUserRoleMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateUserRoleMappingMutation,
    CreateUserRoleMappingMutationVariables
  >(CreateUserRoleMappingDocument, options);
}
export type CreateUserRoleMappingMutationHookResult = ReturnType<
  typeof useCreateUserRoleMappingMutation
>;
export type CreateUserRoleMappingMutationResult =
  Apollo.MutationResult<CreateUserRoleMappingMutation>;
export type CreateUserRoleMappingMutationOptions = Apollo.BaseMutationOptions<
  CreateUserRoleMappingMutation,
  CreateUserRoleMappingMutationVariables
>;
