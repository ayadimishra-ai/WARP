import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteUserOrganizationAddressMappingByUserIdMutationVariables =
  Types.Exact<{
    deleteUserOrganizationAddressMapping: Types.UserOrganizationAddressMapping_Bool_Exp;
  }>;

export type DeleteUserOrganizationAddressMappingByUserIdMutation = {
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
};

export const DeleteUserOrganizationAddressMappingByUserIdDocument = gql`
  mutation deleteUserOrganizationAddressMappingByUserId(
    $deleteUserOrganizationAddressMapping: UserOrganizationAddressMapping_bool_exp!
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
  }
`;
export type DeleteUserOrganizationAddressMappingByUserIdMutationFn =
  Apollo.MutationFunction<
    DeleteUserOrganizationAddressMappingByUserIdMutation,
    DeleteUserOrganizationAddressMappingByUserIdMutationVariables
  >;

/**
 * __useDeleteUserOrganizationAddressMappingByUserIdMutation__
 *
 * To run a mutation, you first call `useDeleteUserOrganizationAddressMappingByUserIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserOrganizationAddressMappingByUserIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserOrganizationAddressMappingByUserIdMutation, { data, loading, error }] = useDeleteUserOrganizationAddressMappingByUserIdMutation({
 *   variables: {
 *      deleteUserOrganizationAddressMapping: // value for 'deleteUserOrganizationAddressMapping'
 *   },
 * });
 */
export function useDeleteUserOrganizationAddressMappingByUserIdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteUserOrganizationAddressMappingByUserIdMutation,
    DeleteUserOrganizationAddressMappingByUserIdMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteUserOrganizationAddressMappingByUserIdMutation,
    DeleteUserOrganizationAddressMappingByUserIdMutationVariables
  >(DeleteUserOrganizationAddressMappingByUserIdDocument, options);
}
export type DeleteUserOrganizationAddressMappingByUserIdMutationHookResult =
  ReturnType<typeof useDeleteUserOrganizationAddressMappingByUserIdMutation>;
export type DeleteUserOrganizationAddressMappingByUserIdMutationResult =
  Apollo.MutationResult<DeleteUserOrganizationAddressMappingByUserIdMutation>;
export type DeleteUserOrganizationAddressMappingByUserIdMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteUserOrganizationAddressMappingByUserIdMutation,
    DeleteUserOrganizationAddressMappingByUserIdMutationVariables
  >;
