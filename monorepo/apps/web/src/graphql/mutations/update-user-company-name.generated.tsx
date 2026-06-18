import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUserCompanyNameMutationVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
  companyName: Types.Scalars["String"]["input"];
}>;

export type UpdateUserCompanyNameMutation = {
  __typename?: "mutation_root";
  update_Tbl_Users_by_pk?: {
    __typename?: "Tbl_Users";
    UserGuid: any;
    CompanyName?: string | null;
  } | null;
};

export const UpdateUserCompanyNameDocument = gql`
  mutation UpdateUserCompanyName($userGuid: uuid!, $companyName: String!) {
    update_Tbl_Users_by_pk(
      pk_columns: { UserGuid: $userGuid }
      _set: { CompanyName: $companyName }
    ) {
      UserGuid
      CompanyName
    }
  }
`;
export type UpdateUserCompanyNameMutationFn = Apollo.MutationFunction<
  UpdateUserCompanyNameMutation,
  UpdateUserCompanyNameMutationVariables
>;

/**
 * __useUpdateUserCompanyNameMutation__
 *
 * To run a mutation, you first call `useUpdateUserCompanyNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserCompanyNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserCompanyNameMutation, { data, loading, error }] = useUpdateUserCompanyNameMutation({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *      companyName: // value for 'companyName'
 *   },
 * });
 */
export function useUpdateUserCompanyNameMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserCompanyNameMutation,
    UpdateUserCompanyNameMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserCompanyNameMutation,
    UpdateUserCompanyNameMutationVariables
  >(UpdateUserCompanyNameDocument, options);
}
export type UpdateUserCompanyNameMutationHookResult = ReturnType<
  typeof useUpdateUserCompanyNameMutation
>;
export type UpdateUserCompanyNameMutationResult =
  Apollo.MutationResult<UpdateUserCompanyNameMutation>;
export type UpdateUserCompanyNameMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserCompanyNameMutation,
  UpdateUserCompanyNameMutationVariables
>;
