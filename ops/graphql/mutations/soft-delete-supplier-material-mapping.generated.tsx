import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SoftDeleteSupplierMaterialMappingMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  updatedBy: Types.Scalars['uuid']['input'];
}>;


export type SoftDeleteSupplierMaterialMappingMutation = { __typename?: 'mutation_root', update_SupplierMaterialMapping_by_pk?: { __typename?: 'SupplierMaterialMapping', id: any, is_deleted: boolean } | null };


export const SoftDeleteSupplierMaterialMappingDocument = gql`
    mutation softDeleteSupplierMaterialMapping($id: uuid!, $updatedBy: uuid!) {
  update_SupplierMaterialMapping_by_pk(
    pk_columns: {id: $id}
    _set: {is_deleted: true, updated_by: $updatedBy}
  ) {
    id
    is_deleted
  }
}
    `;
export type SoftDeleteSupplierMaterialMappingMutationFn = Apollo.MutationFunction<SoftDeleteSupplierMaterialMappingMutation, SoftDeleteSupplierMaterialMappingMutationVariables>;

/**
 * __useSoftDeleteSupplierMaterialMappingMutation__
 *
 * To run a mutation, you first call `useSoftDeleteSupplierMaterialMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSoftDeleteSupplierMaterialMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [softDeleteSupplierMaterialMappingMutation, { data, loading, error }] = useSoftDeleteSupplierMaterialMappingMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updatedBy: // value for 'updatedBy'
 *   },
 * });
 */
export function useSoftDeleteSupplierMaterialMappingMutation(baseOptions?: Apollo.MutationHookOptions<SoftDeleteSupplierMaterialMappingMutation, SoftDeleteSupplierMaterialMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SoftDeleteSupplierMaterialMappingMutation, SoftDeleteSupplierMaterialMappingMutationVariables>(SoftDeleteSupplierMaterialMappingDocument, options);
      }
export type SoftDeleteSupplierMaterialMappingMutationHookResult = ReturnType<typeof useSoftDeleteSupplierMaterialMappingMutation>;
export type SoftDeleteSupplierMaterialMappingMutationResult = Apollo.MutationResult<SoftDeleteSupplierMaterialMappingMutation>;
export type SoftDeleteSupplierMaterialMappingMutationOptions = Apollo.BaseMutationOptions<SoftDeleteSupplierMaterialMappingMutation, SoftDeleteSupplierMaterialMappingMutationVariables>;