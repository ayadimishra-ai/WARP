import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertCompanyDashboardMappingMutationVariables = Types.Exact<{
  object: Types.Tbl_CompanyDashboardMapping_Insert_Input;
}>;

export type InsertCompanyDashboardMappingMutation = {
  __typename?: "mutation_root";
  insert_Tbl_CompanyDashboardMapping_one?: {
    __typename?: "Tbl_CompanyDashboardMapping";
    CompanyDashboardMappingGuid: any;
    DashboardType?: string | null;
    CompanyGuid?: any | null;
    CompanyType?: string | null;
  } | null;
};

export const InsertCompanyDashboardMappingDocument = gql`
  mutation InsertCompanyDashboardMapping(
    $object: Tbl_CompanyDashboardMapping_insert_input!
  ) {
    insert_Tbl_CompanyDashboardMapping_one(object: $object) {
      CompanyDashboardMappingGuid
      DashboardType
      CompanyGuid
      CompanyType
    }
  }
`;
export type InsertCompanyDashboardMappingMutationFn = Apollo.MutationFunction<
  InsertCompanyDashboardMappingMutation,
  InsertCompanyDashboardMappingMutationVariables
>;

/**
 * __useInsertCompanyDashboardMappingMutation__
 *
 * To run a mutation, you first call `useInsertCompanyDashboardMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertCompanyDashboardMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertCompanyDashboardMappingMutation, { data, loading, error }] = useInsertCompanyDashboardMappingMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertCompanyDashboardMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertCompanyDashboardMappingMutation,
    InsertCompanyDashboardMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertCompanyDashboardMappingMutation,
    InsertCompanyDashboardMappingMutationVariables
  >(InsertCompanyDashboardMappingDocument, options);
}
export type InsertCompanyDashboardMappingMutationHookResult = ReturnType<
  typeof useInsertCompanyDashboardMappingMutation
>;
export type InsertCompanyDashboardMappingMutationResult =
  Apollo.MutationResult<InsertCompanyDashboardMappingMutation>;
export type InsertCompanyDashboardMappingMutationOptions =
  Apollo.BaseMutationOptions<
    InsertCompanyDashboardMappingMutation,
    InsertCompanyDashboardMappingMutationVariables
  >;
