import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateCompanyMutationVariables = Types.Exact<{
  input: Array<Types.Tbl_Companies_Updates> | Types.Tbl_Companies_Updates;
}>;

export type UpdateCompanyMutation = {
  __typename?: "mutation_root";
  update_Tbl_Companies_many?: Array<{
    __typename?: "Tbl_Companies_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_Companies";
      CompanyGuid: any;
      CompanyName?: string | null;
    }>;
  } | null> | null;
};

export const UpdateCompanyDocument = gql`
  mutation updateCompany($input: [Tbl_Companies_updates!]!) {
    update_Tbl_Companies_many(updates: $input) {
      affected_rows
      returning {
        CompanyGuid
        CompanyName
      }
    }
  }
`;
export type UpdateCompanyMutationFn = Apollo.MutationFunction<
  UpdateCompanyMutation,
  UpdateCompanyMutationVariables
>;

/**
 * __useUpdateCompanyMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyMutation, { data, loading, error }] = useUpdateCompanyMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCompanyMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCompanyMutation,
    UpdateCompanyMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateCompanyMutation,
    UpdateCompanyMutationVariables
  >(UpdateCompanyDocument, options);
}
export type UpdateCompanyMutationHookResult = ReturnType<
  typeof useUpdateCompanyMutation
>;
export type UpdateCompanyMutationResult =
  Apollo.MutationResult<UpdateCompanyMutation>;
export type UpdateCompanyMutationOptions = Apollo.BaseMutationOptions<
  UpdateCompanyMutation,
  UpdateCompanyMutationVariables
>;
