import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateUserRoleMappingStatusMutationVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
  statusGuid: Types.Scalars["uuid"]["input"];
}>;

export type UpdateUserRoleMappingStatusMutation = {
  __typename?: "mutation_root";
  update_Tbl_UserRoleMapping?: {
    __typename?: "Tbl_UserRoleMapping_mutation_response";
    returning: Array<{ __typename?: "Tbl_UserRoleMapping"; UserGuid: any }>;
  } | null;
};

export const UpdateUserRoleMappingStatusDocument = gql`
  mutation updateUserRoleMappingStatus($userGuid: uuid!, $statusGuid: uuid!) {
    update_Tbl_UserRoleMapping(
      _set: { StatusGuid: $statusGuid }
      where: { UserGuid: { _eq: $userGuid } }
    ) {
      returning {
        UserGuid
      }
    }
  }
`;
export type UpdateUserRoleMappingStatusMutationFn = Apollo.MutationFunction<
  UpdateUserRoleMappingStatusMutation,
  UpdateUserRoleMappingStatusMutationVariables
>;

/**
 * __useUpdateUserRoleMappingStatusMutation__
 *
 * To run a mutation, you first call `useUpdateUserRoleMappingStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserRoleMappingStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserRoleMappingStatusMutation, { data, loading, error }] = useUpdateUserRoleMappingStatusMutation({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *      statusGuid: // value for 'statusGuid'
 *   },
 * });
 */
export function useUpdateUserRoleMappingStatusMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserRoleMappingStatusMutation,
    UpdateUserRoleMappingStatusMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserRoleMappingStatusMutation,
    UpdateUserRoleMappingStatusMutationVariables
  >(UpdateUserRoleMappingStatusDocument, options);
}
export type UpdateUserRoleMappingStatusMutationHookResult = ReturnType<
  typeof useUpdateUserRoleMappingStatusMutation
>;
export type UpdateUserRoleMappingStatusMutationResult =
  Apollo.MutationResult<UpdateUserRoleMappingStatusMutation>;
export type UpdateUserRoleMappingStatusMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateUserRoleMappingStatusMutation,
    UpdateUserRoleMappingStatusMutationVariables
  >;
