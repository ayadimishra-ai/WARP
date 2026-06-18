import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUserCompanyMappingMutationVariables = Types.Exact<{
  input:
    | Array<Types.Tbl_UserCompanyMapping_Updates>
    | Types.Tbl_UserCompanyMapping_Updates;
}>;

export type UpdateUserCompanyMappingMutation = {
  __typename?: "mutation_root";
  update_Tbl_UserCompanyMapping_many?: Array<{
    __typename?: "Tbl_UserCompanyMapping_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_UserCompanyMapping";
      UserGuid?: any | null;
    }>;
  } | null> | null;
};

export const UpdateUserCompanyMappingDocument = gql`
  mutation updateUserCompanyMapping(
    $input: [Tbl_UserCompanyMapping_updates!]!
  ) {
    update_Tbl_UserCompanyMapping_many(updates: $input) {
      affected_rows
      returning {
        UserGuid
      }
    }
  }
`;
export type UpdateUserCompanyMappingMutationFn = Apollo.MutationFunction<
  UpdateUserCompanyMappingMutation,
  UpdateUserCompanyMappingMutationVariables
>;

/**
 * __useUpdateUserCompanyMappingMutation__
 *
 * To run a mutation, you first call `useUpdateUserCompanyMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserCompanyMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserCompanyMappingMutation, { data, loading, error }] = useUpdateUserCompanyMappingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserCompanyMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserCompanyMappingMutation,
    UpdateUserCompanyMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserCompanyMappingMutation,
    UpdateUserCompanyMappingMutationVariables
  >(UpdateUserCompanyMappingDocument, options);
}
export type UpdateUserCompanyMappingMutationHookResult = ReturnType<
  typeof useUpdateUserCompanyMappingMutation
>;
export type UpdateUserCompanyMappingMutationResult =
  Apollo.MutationResult<UpdateUserCompanyMappingMutation>;
export type UpdateUserCompanyMappingMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateUserCompanyMappingMutation,
    UpdateUserCompanyMappingMutationVariables
  >;
