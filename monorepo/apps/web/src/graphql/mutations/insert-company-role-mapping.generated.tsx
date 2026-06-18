import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CreateCompanyRoleMappingMutationVariables = Types.Exact<{
  object:
    | Array<Types.Tbl_CompanyRoleMapping_Insert_Input>
    | Types.Tbl_CompanyRoleMapping_Insert_Input;
}>;

export type CreateCompanyRoleMappingMutation = {
  __typename?: "mutation_root";
  insert_Tbl_CompanyRoleMapping?: {
    __typename?: "Tbl_CompanyRoleMapping_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_CompanyRoleMapping";
      CompanyRoleMappingGuid: any;
      CompanyGuid: any;
      RoleGuid: any;
    }>;
  } | null;
};

export const CreateCompanyRoleMappingDocument = gql`
  mutation createCompanyRoleMapping(
    $object: [Tbl_CompanyRoleMapping_insert_input!]!
  ) {
    insert_Tbl_CompanyRoleMapping(objects: $object) {
      affected_rows
      returning {
        CompanyRoleMappingGuid
        CompanyGuid
        RoleGuid
      }
    }
  }
`;
export type CreateCompanyRoleMappingMutationFn = Apollo.MutationFunction<
  CreateCompanyRoleMappingMutation,
  CreateCompanyRoleMappingMutationVariables
>;

/**
 * __useCreateCompanyRoleMappingMutation__
 *
 * To run a mutation, you first call `useCreateCompanyRoleMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCompanyRoleMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCompanyRoleMappingMutation, { data, loading, error }] = useCreateCompanyRoleMappingMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateCompanyRoleMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateCompanyRoleMappingMutation,
    CreateCompanyRoleMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateCompanyRoleMappingMutation,
    CreateCompanyRoleMappingMutationVariables
  >(CreateCompanyRoleMappingDocument, options);
}
export type CreateCompanyRoleMappingMutationHookResult = ReturnType<
  typeof useCreateCompanyRoleMappingMutation
>;
export type CreateCompanyRoleMappingMutationResult =
  Apollo.MutationResult<CreateCompanyRoleMappingMutation>;
export type CreateCompanyRoleMappingMutationOptions =
  Apollo.BaseMutationOptions<
    CreateCompanyRoleMappingMutation,
    CreateCompanyRoleMappingMutationVariables
  >;
