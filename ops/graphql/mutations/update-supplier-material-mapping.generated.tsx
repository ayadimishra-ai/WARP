import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateSupplierMaterialMappingMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  set: Types.SupplierMaterialMapping_Set_Input;
}>;


export type UpdateSupplierMaterialMappingMutation = { __typename?: 'mutation_root', update_SupplierMaterialMapping_by_pk?: { __typename?: 'SupplierMaterialMapping', id: any, organization_id: any, supplier_address_mapping_id: any, org_material_master_id: any, From_Year: any, From_Month?: string | null, To_Year: any, To_Month?: string | null, updated_at: any } | null };


export const UpdateSupplierMaterialMappingDocument = gql`
    mutation updateSupplierMaterialMapping($id: uuid!, $set: SupplierMaterialMapping_set_input!) {
  update_SupplierMaterialMapping_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    organization_id
    supplier_address_mapping_id
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    updated_at
  }
}
    `;
export type UpdateSupplierMaterialMappingMutationFn = Apollo.MutationFunction<UpdateSupplierMaterialMappingMutation, UpdateSupplierMaterialMappingMutationVariables>;

/**
 * __useUpdateSupplierMaterialMappingMutation__
 *
 * To run a mutation, you first call `useUpdateSupplierMaterialMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSupplierMaterialMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSupplierMaterialMappingMutation, { data, loading, error }] = useUpdateSupplierMaterialMappingMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateSupplierMaterialMappingMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSupplierMaterialMappingMutation, UpdateSupplierMaterialMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSupplierMaterialMappingMutation, UpdateSupplierMaterialMappingMutationVariables>(UpdateSupplierMaterialMappingDocument, options);
      }
export type UpdateSupplierMaterialMappingMutationHookResult = ReturnType<typeof useUpdateSupplierMaterialMappingMutation>;
export type UpdateSupplierMaterialMappingMutationResult = Apollo.MutationResult<UpdateSupplierMaterialMappingMutation>;
export type UpdateSupplierMaterialMappingMutationOptions = Apollo.BaseMutationOptions<UpdateSupplierMaterialMappingMutation, UpdateSupplierMaterialMappingMutationVariables>;