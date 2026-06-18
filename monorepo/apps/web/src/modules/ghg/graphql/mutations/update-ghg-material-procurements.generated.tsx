import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateGhgMaterialProcurementsMutationVariables = Types.Exact<{
  GHGMaterialProcurement:
    | Array<Types.GhgMaterialProcurement_Updates>
    | Types.GhgMaterialProcurement_Updates;
}>;

export type UpdateGhgMaterialProcurementsMutation = {
  __typename?: "mutation_root";
  update_GHGMaterialProcurement_many?: Array<{
    __typename?: "GHGMaterialProcurement_mutation_response";
    returning: Array<{
      __typename?: "GHGMaterialProcurement";
      id: any;
      activity_task_request_id: any;
      organization_address_id: any;
      task_request_id: any;
      Material_Code?: string | null;
      Supplier_Code?: string | null;
      Material_Quantity_Procured?: any | null;
      Material_Quantity_Procured_uom?: string | null;
      kpi_em_EmissionBy_MaterialProcured?: any | null;
      kpi_emf_EmissionBy_MaterialProcured?: any | null;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      supporting_docs?: any | null;
    }>;
  } | null> | null;
};

export const UpdateGhgMaterialProcurementsDocument = gql`
  mutation updateGhgMaterialProcurements(
    $GHGMaterialProcurement: [GHGMaterialProcurement_updates!]!
  ) {
    update_GHGMaterialProcurement_many(updates: $GHGMaterialProcurement) {
      returning {
        id
        activity_task_request_id
        organization_address_id
        task_request_id
        Material_Code
        Supplier_Code
        Material_Quantity_Procured
        Material_Quantity_Procured_uom
        kpi_em_EmissionBy_MaterialProcured
        kpi_emf_EmissionBy_MaterialProcured
        created_at
        updated_at
        created_by
        updated_by
        supporting_docs
      }
    }
  }
`;
export type UpdateGhgMaterialProcurementsMutationFn = Apollo.MutationFunction<
  UpdateGhgMaterialProcurementsMutation,
  UpdateGhgMaterialProcurementsMutationVariables
>;

/**
 * __useUpdateGhgMaterialProcurementsMutation__
 *
 * To run a mutation, you first call `useUpdateGhgMaterialProcurementsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGhgMaterialProcurementsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGhgMaterialProcurementsMutation, { data, loading, error }] = useUpdateGhgMaterialProcurementsMutation({
 *   variables: {
 *      GHGMaterialProcurement: // value for 'GHGMaterialProcurement'
 *   },
 * });
 */
export function useUpdateGhgMaterialProcurementsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateGhgMaterialProcurementsMutation,
    UpdateGhgMaterialProcurementsMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateGhgMaterialProcurementsMutation,
    UpdateGhgMaterialProcurementsMutationVariables
  >(UpdateGhgMaterialProcurementsDocument, options);
}
export type UpdateGhgMaterialProcurementsMutationHookResult = ReturnType<
  typeof useUpdateGhgMaterialProcurementsMutation
>;
export type UpdateGhgMaterialProcurementsMutationResult =
  Apollo.MutationResult<UpdateGhgMaterialProcurementsMutation>;
export type UpdateGhgMaterialProcurementsMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateGhgMaterialProcurementsMutation,
    UpdateGhgMaterialProcurementsMutationVariables
  >;
