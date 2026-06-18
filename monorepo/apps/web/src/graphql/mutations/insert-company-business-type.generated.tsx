import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CreateCompanyBusinessTypeMutationVariables = Types.Exact<{
  object:
    | Array<Types.Tbl_CompanyBusinessType_Insert_Input>
    | Types.Tbl_CompanyBusinessType_Insert_Input;
}>;

export type CreateCompanyBusinessTypeMutation = {
  __typename?: "mutation_root";
  insert_Tbl_CompanyBusinessType?: {
    __typename?: "Tbl_CompanyBusinessType_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_CompanyBusinessType";
      CompanyBusinessTypeGuid: any;
      CompanyGuid?: any | null;
      BusinessTypeGuid?: any | null;
    }>;
  } | null;
};

export const CreateCompanyBusinessTypeDocument = gql`
  mutation createCompanyBusinessType(
    $object: [Tbl_CompanyBusinessType_insert_input!]!
  ) {
    insert_Tbl_CompanyBusinessType(objects: $object) {
      affected_rows
      returning {
        CompanyBusinessTypeGuid
        CompanyGuid
        BusinessTypeGuid
      }
    }
  }
`;
export type CreateCompanyBusinessTypeMutationFn = Apollo.MutationFunction<
  CreateCompanyBusinessTypeMutation,
  CreateCompanyBusinessTypeMutationVariables
>;

/**
 * __useCreateCompanyBusinessTypeMutation__
 *
 * To run a mutation, you first call `useCreateCompanyBusinessTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCompanyBusinessTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCompanyBusinessTypeMutation, { data, loading, error }] = useCreateCompanyBusinessTypeMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateCompanyBusinessTypeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateCompanyBusinessTypeMutation,
    CreateCompanyBusinessTypeMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateCompanyBusinessTypeMutation,
    CreateCompanyBusinessTypeMutationVariables
  >(CreateCompanyBusinessTypeDocument, options);
}
export type CreateCompanyBusinessTypeMutationHookResult = ReturnType<
  typeof useCreateCompanyBusinessTypeMutation
>;
export type CreateCompanyBusinessTypeMutationResult =
  Apollo.MutationResult<CreateCompanyBusinessTypeMutation>;
export type CreateCompanyBusinessTypeMutationOptions =
  Apollo.BaseMutationOptions<
    CreateCompanyBusinessTypeMutation,
    CreateCompanyBusinessTypeMutationVariables
  >;
