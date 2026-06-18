import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateAddressMutationVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
  addressId: Types.Scalars['uuid']['input'];
  updateAddress: Types.Addresses_Set_Input;
}>;


export type UpdateAddressMutation = { __typename?: 'mutation_root', update_Addresses?: { __typename?: 'Addresses_mutation_response', returning: Array<{ __typename?: 'Addresses', id: any, name: string, code?: string | null, full_address: string, pincode?: string | null, country_id?: any | null, state_id?: any | null, city_id?: any | null, type?: string | null, metadata?: any | null, ownership_type?: string | null, facility_type?: string | null, updated_at: any, updated_by?: any | null, is_deleted: boolean }> } | null };


export const UpdateAddressDocument = gql`
    mutation updateAddress($organizationId: uuid!, $addressId: uuid!, $updateAddress: Addresses_set_input!) {
  update_Addresses(
    where: {id: {_eq: $addressId}, OrganizationAddresses: {organization_id: {_eq: $organizationId}, address_id: {_eq: $addressId}}}
    _set: $updateAddress
  ) {
    returning {
      id
      name
      code
      full_address
      pincode
      country_id
      state_id
      city_id
      type
      metadata
      ownership_type
      facility_type
      updated_at
      updated_by
      is_deleted
    }
  }
}
    `;
export type UpdateAddressMutationFn = Apollo.MutationFunction<UpdateAddressMutation, UpdateAddressMutationVariables>;

/**
 * __useUpdateAddressMutation__
 *
 * To run a mutation, you first call `useUpdateAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAddressMutation, { data, loading, error }] = useUpdateAddressMutation({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      addressId: // value for 'addressId'
 *      updateAddress: // value for 'updateAddress'
 *   },
 * });
 */
export function useUpdateAddressMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAddressMutation, UpdateAddressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAddressMutation, UpdateAddressMutationVariables>(UpdateAddressDocument, options);
      }
export type UpdateAddressMutationHookResult = ReturnType<typeof useUpdateAddressMutation>;
export type UpdateAddressMutationResult = Apollo.MutationResult<UpdateAddressMutation>;
export type UpdateAddressMutationOptions = Apollo.BaseMutationOptions<UpdateAddressMutation, UpdateAddressMutationVariables>;