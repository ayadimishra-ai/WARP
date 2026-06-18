import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertAppUserActivityPermissionMutationVariables = Types.Exact<{
  deleteUserOrganizationAddressMapping: Types.UserOrganizationAddressMapping_Bool_Exp;
  userOrgAddressMappingData:
    | Array<Types.UserOrganizationAddressMapping_Insert_Input>
    | Types.UserOrganizationAddressMapping_Insert_Input;
}>;

export type UpsertAppUserActivityPermissionMutation = {
  __typename?: "mutation_root";
  delete_UserOrganizationAddressMapping?: {
    __typename?: "UserOrganizationAddressMapping_mutation_response";
    returning: Array<{
      __typename?: "UserOrganizationAddressMapping";
      id: any;
      organization_address_id?: any | null;
      user_id: any;
      activities: any;
    }>;
  } | null;
  insert_UserOrganizationAddressMapping?: {
    __typename?: "UserOrganizationAddressMapping_mutation_response";
    returning: Array<{
      __typename?: "UserOrganizationAddressMapping";
      id: any;
      organization_address_id?: any | null;
      user_id: any;
      activities: any;
      AppUser: {
        __typename?: "AppUser";
        name: string;
        email: string;
        isRegistered: boolean;
      };
      Organization: { __typename?: "Organization"; name: string };
    }>;
  } | null;
};

export const UpsertAppUserActivityPermissionDocument = gql`
  mutation upsertAppUserActivityPermission(
    $deleteUserOrganizationAddressMapping: UserOrganizationAddressMapping_bool_exp!
    $userOrgAddressMappingData: [UserOrganizationAddressMapping_insert_input!]!
  ) {
    delete_UserOrganizationAddressMapping(
      where: $deleteUserOrganizationAddressMapping
    ) {
      returning {
        id
        organization_address_id
        user_id
        activities
      }
    }
    insert_UserOrganizationAddressMapping(
      objects: $userOrgAddressMappingData
      on_conflict: { constraint: UserOrganizationAddressMapping_pkey }
    ) {
      returning {
        id
        organization_address_id
        user_id
        activities
        AppUser {
          name
          email
          isRegistered
        }
        Organization {
          name
        }
      }
    }
  }
`;
export type UpsertAppUserActivityPermissionMutationFn = Apollo.MutationFunction<
  UpsertAppUserActivityPermissionMutation,
  UpsertAppUserActivityPermissionMutationVariables
>;

/**
 * __useUpsertAppUserActivityPermissionMutation__
 *
 * To run a mutation, you first call `useUpsertAppUserActivityPermissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertAppUserActivityPermissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertAppUserActivityPermissionMutation, { data, loading, error }] = useUpsertAppUserActivityPermissionMutation({
 *   variables: {
 *      deleteUserOrganizationAddressMapping: // value for 'deleteUserOrganizationAddressMapping'
 *      userOrgAddressMappingData: // value for 'userOrgAddressMappingData'
 *   },
 * });
 */
export function useUpsertAppUserActivityPermissionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertAppUserActivityPermissionMutation,
    UpsertAppUserActivityPermissionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertAppUserActivityPermissionMutation,
    UpsertAppUserActivityPermissionMutationVariables
  >(UpsertAppUserActivityPermissionDocument, options);
}
export type UpsertAppUserActivityPermissionMutationHookResult = ReturnType<
  typeof useUpsertAppUserActivityPermissionMutation
>;
export type UpsertAppUserActivityPermissionMutationResult =
  Apollo.MutationResult<UpsertAppUserActivityPermissionMutation>;
export type UpsertAppUserActivityPermissionMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertAppUserActivityPermissionMutation,
    UpsertAppUserActivityPermissionMutationVariables
  >;
