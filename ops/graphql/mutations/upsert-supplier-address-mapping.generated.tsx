import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertSupplierAddressMappingMutationVariables = Types.Exact<{
  objects: Array<Types.SupplierAddressMapping_Insert_Input> | Types.SupplierAddressMapping_Insert_Input;
}>;


export type UpsertSupplierAddressMappingMutation = { __typename?: 'mutation_root', insert_SupplierAddressMapping?: { __typename?: 'SupplierAddressMapping_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'SupplierAddressMapping', id: any, address_id: any, org_supplier_master_id: any, supplier_organization_address_id?: any | null, metadata?: any | null, is_deleted: boolean, created_by?: any | null, updated_by?: any | null }> } | null };


export const UpsertSupplierAddressMappingDocument = gql`
    mutation upsertSupplierAddressMapping($objects: [SupplierAddressMapping_insert_input!]!) {
  insert_SupplierAddressMapping(
    objects: $objects
    on_conflict: {constraint: SupplierAddressMapping_pkey, update_columns: [address_id, org_supplier_master_id, updated_by]}
  ) {
    affected_rows
    returning {
      id
      address_id
      org_supplier_master_id
      supplier_organization_address_id
      metadata
      is_deleted
      created_by
      updated_by
    }
  }
}
    `;
export type UpsertSupplierAddressMappingMutationFn = Apollo.MutationFunction<UpsertSupplierAddressMappingMutation, UpsertSupplierAddressMappingMutationVariables>;

/**
 * __useUpsertSupplierAddressMappingMutation__
 *
 * To run a mutation, you first call `useUpsertSupplierAddressMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSupplierAddressMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSupplierAddressMappingMutation, { data, loading, error }] = useUpsertSupplierAddressMappingMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useUpsertSupplierAddressMappingMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSupplierAddressMappingMutation, UpsertSupplierAddressMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSupplierAddressMappingMutation, UpsertSupplierAddressMappingMutationVariables>(UpsertSupplierAddressMappingDocument, options);
      }
export type UpsertSupplierAddressMappingMutationHookResult = ReturnType<typeof useUpsertSupplierAddressMappingMutation>;
export type UpsertSupplierAddressMappingMutationResult = Apollo.MutationResult<UpsertSupplierAddressMappingMutation>;
export type UpsertSupplierAddressMappingMutationOptions = Apollo.BaseMutationOptions<UpsertSupplierAddressMappingMutation, UpsertSupplierAddressMappingMutationVariables>;