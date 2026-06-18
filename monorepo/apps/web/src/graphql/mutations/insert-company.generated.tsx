import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertCompanyMutationVariables = Types.Exact<{
  companyInput: Types.Tbl_Companies_Insert_Input;
}>;

export type InsertCompanyMutation = {
  __typename?: "mutation_root";
  insert_Tbl_Companies_one?: {
    __typename?: "Tbl_Companies";
    CompanyGuid: any;
    CompanyName?: string | null;
    CountryGuid?: any | null;
    IsActive?: boolean | null;
    CreatedDate?: any | null;
    CreatedBy?: any | null;
  } | null;
};

export const InsertCompanyDocument = gql`
  mutation InsertCompany($companyInput: Tbl_Companies_insert_input!) {
    insert_Tbl_Companies_one(object: $companyInput) {
      CompanyGuid
      CompanyName
      CountryGuid
      IsActive
      CreatedDate
      CreatedBy
    }
  }
`;
export type InsertCompanyMutationFn = Apollo.MutationFunction<
  InsertCompanyMutation,
  InsertCompanyMutationVariables
>;

/**
 * __useInsertCompanyMutation__
 *
 * To run a mutation, you first call `useInsertCompanyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertCompanyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertCompanyMutation, { data, loading, error }] = useInsertCompanyMutation({
 *   variables: {
 *      companyInput: // value for 'companyInput'
 *   },
 * });
 */
export function useInsertCompanyMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertCompanyMutation,
    InsertCompanyMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertCompanyMutation,
    InsertCompanyMutationVariables
  >(InsertCompanyDocument, options);
}
export type InsertCompanyMutationHookResult = ReturnType<
  typeof useInsertCompanyMutation
>;
export type InsertCompanyMutationResult =
  Apollo.MutationResult<InsertCompanyMutation>;
export type InsertCompanyMutationOptions = Apollo.BaseMutationOptions<
  InsertCompanyMutation,
  InsertCompanyMutationVariables
>;
