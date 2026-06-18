import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertSupplierMaterialMappingMutationVariables = Types.Exact<{
  object: Types.SupplierMaterialMapping_Insert_Input;
}>;

export type InsertSupplierMaterialMappingMutation = {
  __typename?: "mutation_root";
  insert_SupplierMaterialMapping_one?: {
    __typename?: "SupplierMaterialMapping";
    id: any;
    organization_id: any;
    supplier_address_mapping_id: any;
    org_material_master_id: any;
    From_Year: any;
    From_Month?: string | null;
    To_Year: any;
    To_Month?: string | null;
    created_at: any;
  } | null;
};

export const InsertSupplierMaterialMappingDocument = gql`
  mutation insertSupplierMaterialMapping(
    $object: SupplierMaterialMapping_insert_input!
  ) {
    insert_SupplierMaterialMapping_one(object: $object) {
      id
      organization_id
      supplier_address_mapping_id
      org_material_master_id
      From_Year
      From_Month
      To_Year
      To_Month
      created_at
    }
  }
`;
export type InsertSupplierMaterialMappingMutationFn = Apollo.MutationFunction<
  InsertSupplierMaterialMappingMutation,
  InsertSupplierMaterialMappingMutationVariables
>;

/**
 * __useInsertSupplierMaterialMappingMutation__
 *
 * To run a mutation, you first call `useInsertSupplierMaterialMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertSupplierMaterialMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertSupplierMaterialMappingMutation, { data, loading, error }] = useInsertSupplierMaterialMappingMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertSupplierMaterialMappingMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertSupplierMaterialMappingMutation,
    InsertSupplierMaterialMappingMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertSupplierMaterialMappingMutation,
    InsertSupplierMaterialMappingMutationVariables
  >(InsertSupplierMaterialMappingDocument, options);
}
export type InsertSupplierMaterialMappingMutationHookResult = ReturnType<
  typeof useInsertSupplierMaterialMappingMutation
>;
export type InsertSupplierMaterialMappingMutationResult =
  Apollo.MutationResult<InsertSupplierMaterialMappingMutation>;
export type InsertSupplierMaterialMappingMutationOptions =
  Apollo.BaseMutationOptions<
    InsertSupplierMaterialMappingMutation,
    InsertSupplierMaterialMappingMutationVariables
  >;
