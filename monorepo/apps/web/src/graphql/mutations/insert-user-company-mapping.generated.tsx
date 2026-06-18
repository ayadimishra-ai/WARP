import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CreateUserCompanyMappingMutationVariables = Types.Exact<{
  object:
    | Array<Types.Tbl_UserCompanyMapping_Insert_Input>
    | Types.Tbl_UserCompanyMapping_Insert_Input;
}>;

export type CreateUserCompanyMappingMutation = {
  __typename?: "mutation_root";
  insert_Tbl_UserCompanyMapping?: {
    __typename?: "Tbl_UserCompanyMapping_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_UserCompanyMapping";
      UserCompanyMappingGuid: any;
      UserGuid?: any | null;
      CompanyGuid?: any | null;
    }>;
  } | null;
};

export const CreateUserCompanyMappingDocument = gql`
  mutation createUserCompanyMapping(
    $object: [Tbl_UserCompanyMapping_insert_input!]!
  ) {
    insert_Tbl_UserCompanyMapping(objects: $object) {
      affected_rows
      returning {
        UserCompanyMappingGuid
        UserGuid
        CompanyGuid
      }
    }
  }
`;
export type CreateUserCompanyMappingMutationFn = Apollo.MutationFunction<
  CreateUserCompanyMappingMutation,
  CreateUserCompanyMappingMutationVariables
>;

/**
 * __useCreateUserCompanyMappingMutation__
 *
 * To run a mutation, you first call `useCreateUserCompanyMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserCompanyMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserCompanyMappingMutation, { data, loading, error }] = useCreateUserCompanyMappingMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateUserCompanyMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateUserCompanyMappingMutation,
    CreateUserCompanyMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateUserCompanyMappingMutation,
    CreateUserCompanyMappingMutationVariables
  >(CreateUserCompanyMappingDocument, options);
}
export type CreateUserCompanyMappingMutationHookResult = ReturnType<
  typeof useCreateUserCompanyMappingMutation
>;
export type CreateUserCompanyMappingMutationResult =
  Apollo.MutationResult<CreateUserCompanyMappingMutation>;
export type CreateUserCompanyMappingMutationOptions =
  Apollo.BaseMutationOptions<
    CreateUserCompanyMappingMutation,
    CreateUserCompanyMappingMutationVariables
  >;
