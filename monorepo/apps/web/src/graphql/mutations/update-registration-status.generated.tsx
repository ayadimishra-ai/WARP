import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateRegistrationStatusMutationVariables = Types.Exact<{
  companyGuid: Types.Scalars["uuid"]["input"];
  companyStatusGuid: Types.Scalars["uuid"]["input"];
  userGuid: Types.Scalars["uuid"]["input"];
  statusGuid: Types.Scalars["uuid"]["input"];
  password: Types.Scalars["String"]["input"];
  username: Types.Scalars["String"]["input"];
  phone: Types.Scalars["String"]["input"];
}>;

export type UpdateRegistrationStatusMutation = {
  __typename?: "mutation_root";
  update_Tbl_CompanyRoleMapping?: {
    __typename?: "Tbl_CompanyRoleMapping_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "Tbl_CompanyRoleMapping";
      CompanyGuid: any;
    }>;
  } | null;
  update_Tbl_UserRoleMapping?: {
    __typename?: "Tbl_UserRoleMapping_mutation_response";
    affected_rows: number;
  } | null;
  update_Tbl_Users?: {
    __typename?: "Tbl_Users_mutation_response";
    affected_rows: number;
  } | null;
};

export const UpdateRegistrationStatusDocument = gql`
  mutation updateRegistrationStatus(
    $companyGuid: uuid!
    $companyStatusGuid: uuid!
    $userGuid: uuid!
    $statusGuid: uuid!
    $password: String!
    $username: String!
    $phone: String!
  ) {
    update_Tbl_CompanyRoleMapping(
      where: { CompanyGuid: { _eq: $companyGuid } }
      _set: { StatusGuid: $companyStatusGuid }
    ) {
      affected_rows
      returning {
        CompanyGuid
      }
    }
    update_Tbl_UserRoleMapping(
      where: { UserGuid: { _eq: $userGuid } }
      _set: { StatusGuid: $statusGuid }
    ) {
      affected_rows
    }
    update_Tbl_Users(
      where: { UserGuid: { _eq: $userGuid } }
      _set: {
        Password: $password
        IsVerified: true
        FirstName: $username
        MobileNumber: $phone
      }
    ) {
      affected_rows
    }
  }
`;
export type UpdateRegistrationStatusMutationFn = Apollo.MutationFunction<
  UpdateRegistrationStatusMutation,
  UpdateRegistrationStatusMutationVariables
>;

/**
 * __useUpdateRegistrationStatusMutation__
 *
 * To run a mutation, you first call `useUpdateRegistrationStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRegistrationStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRegistrationStatusMutation, { data, loading, error }] = useUpdateRegistrationStatusMutation({
 *   variables: {
 *      companyGuid: // value for 'companyGuid'
 *      companyStatusGuid: // value for 'companyStatusGuid'
 *      userGuid: // value for 'userGuid'
 *      statusGuid: // value for 'statusGuid'
 *      password: // value for 'password'
 *      username: // value for 'username'
 *      phone: // value for 'phone'
 *   },
 * });
 */
export function useUpdateRegistrationStatusMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateRegistrationStatusMutation,
    UpdateRegistrationStatusMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateRegistrationStatusMutation,
    UpdateRegistrationStatusMutationVariables
  >(UpdateRegistrationStatusDocument, options);
}
export type UpdateRegistrationStatusMutationHookResult = ReturnType<
  typeof useUpdateRegistrationStatusMutation
>;
export type UpdateRegistrationStatusMutationResult =
  Apollo.MutationResult<UpdateRegistrationStatusMutation>;
export type UpdateRegistrationStatusMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateRegistrationStatusMutation,
    UpdateRegistrationStatusMutationVariables
  >;
