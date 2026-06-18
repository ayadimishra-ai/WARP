import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertAddressesMutationVariables = Types.Exact<{
  AddressData: Array<Types.Addresses_Insert_Input> | Types.Addresses_Insert_Input;
}>;


export type InsertAddressesMutation = { __typename?: 'mutation_root', insert_Addresses?: { __typename?: 'Addresses_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'Addresses', id: any, name: string, code?: string | null, client_master_id?: string | null, full_address: string, pincode?: string | null, country_id?: any | null, state_id?: any | null, city_id?: any | null, type?: string | null, metadata?: any | null, is_wwtp: string, is_deleted: boolean, ownership_type?: string | null, facility_type?: string | null, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null, OrganizationAddresses: Array<{ __typename?: 'OrganizationAddress', id: any, organization_id: any, address_id: any, metadata?: any | null, is_deleted: boolean, created_at: any, updated_at: any, created_by?: any | null, updated_by?: any | null }> }> } | null };


export const InsertAddressesDocument = gql`
    mutation insertAddresses($AddressData: [Addresses_insert_input!]!) {
  insert_Addresses(
    objects: $AddressData
    on_conflict: {constraint: Addresses_pkey}
  ) {
    affected_rows
    returning {
      id
      name
      code
      client_master_id
      full_address
      pincode
      country_id
      state_id
      city_id
      type
      metadata
      is_wwtp
      is_deleted
      ownership_type
      facility_type
      created_at
      updated_at
      created_by
      updated_by
      OrganizationAddresses {
        id
        organization_id
        address_id
        metadata
        is_deleted
        created_at
        updated_at
        created_by
        updated_by
      }
    }
  }
}
    `;
export type InsertAddressesMutationFn = Apollo.MutationFunction<InsertAddressesMutation, InsertAddressesMutationVariables>;

/**
 * __useInsertAddressesMutation__
 *
 * To run a mutation, you first call `useInsertAddressesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertAddressesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertAddressesMutation, { data, loading, error }] = useInsertAddressesMutation({
 *   variables: {
 *      AddressData: // value for 'AddressData'
 *   },
 * });
 */
export function useInsertAddressesMutation(baseOptions?: Apollo.MutationHookOptions<InsertAddressesMutation, InsertAddressesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertAddressesMutation, InsertAddressesMutationVariables>(InsertAddressesDocument, options);
      }
export type InsertAddressesMutationHookResult = ReturnType<typeof useInsertAddressesMutation>;
export type InsertAddressesMutationResult = Apollo.MutationResult<InsertAddressesMutation>;
export type InsertAddressesMutationOptions = Apollo.BaseMutationOptions<InsertAddressesMutation, InsertAddressesMutationVariables>;