import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type BulkInsertSupplierMaterialMappingMutationVariables = Types.Exact<{
  objects: Array<Types.SupplierMaterialMapping_Insert_Input> | Types.SupplierMaterialMapping_Insert_Input;
}>;


export type BulkInsertSupplierMaterialMappingMutation = { __typename?: 'mutation_root', insert_SupplierMaterialMapping?: { __typename?: 'SupplierMaterialMapping_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'SupplierMaterialMapping', id: any, supplier_address_mapping_id: any, org_material_master_id: any, From_Year: any, From_Month?: string | null, To_Year: any, To_Month?: string | null, meta_data?: any | null, created_at: any }> } | null };


export const BulkInsertSupplierMaterialMappingDocument = gql`
    mutation bulkInsertSupplierMaterialMapping($objects: [SupplierMaterialMapping_insert_input!]!) {
  insert_SupplierMaterialMapping(objects: $objects) {
    affected_rows
    returning {
      id
      supplier_address_mapping_id
      org_material_master_id
      From_Year
      From_Month
      To_Year
      To_Month
      meta_data
      created_at
    }
  }
}
    `;
export type BulkInsertSupplierMaterialMappingMutationFn = Apollo.MutationFunction<BulkInsertSupplierMaterialMappingMutation, BulkInsertSupplierMaterialMappingMutationVariables>;

/**
 * __useBulkInsertSupplierMaterialMappingMutation__
 *
 * To run a mutation, you first call `useBulkInsertSupplierMaterialMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertSupplierMaterialMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertSupplierMaterialMappingMutation, { data, loading, error }] = useBulkInsertSupplierMaterialMappingMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useBulkInsertSupplierMaterialMappingMutation(baseOptions?: Apollo.MutationHookOptions<BulkInsertSupplierMaterialMappingMutation, BulkInsertSupplierMaterialMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BulkInsertSupplierMaterialMappingMutation, BulkInsertSupplierMaterialMappingMutationVariables>(BulkInsertSupplierMaterialMappingDocument, options);
      }
export type BulkInsertSupplierMaterialMappingMutationHookResult = ReturnType<typeof useBulkInsertSupplierMaterialMappingMutation>;
export type BulkInsertSupplierMaterialMappingMutationResult = Apollo.MutationResult<BulkInsertSupplierMaterialMappingMutation>;
export type BulkInsertSupplierMaterialMappingMutationOptions = Apollo.BaseMutationOptions<BulkInsertSupplierMaterialMappingMutation, BulkInsertSupplierMaterialMappingMutationVariables>;