import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertKpiProductCarbonFootprintSupplierFacilityMutationVariables =
  Types.Exact<{
    kpiSupplierFacilityData:
      | Array<Types.KpiProductCarbonFootprintSupplierFacility_Insert_Input>
      | Types.KpiProductCarbonFootprintSupplierFacility_Insert_Input;
    deleteKpiSupplierFacilityData: Types.KpiProductCarbonFootprintSupplierFacility_Bool_Exp;
  }>;

export type InsertKpiProductCarbonFootprintSupplierFacilityMutation = {
  __typename?: "mutation_root";
  delete_KPIProductCarbonFootprintSupplierFacility?: {
    __typename?: "KPIProductCarbonFootprintSupplierFacility_mutation_response";
    returning: Array<{
      __typename?: "KPIProductCarbonFootprintSupplierFacility";
      id: any;
    }>;
  } | null;
  insert_KPIProductCarbonFootprintSupplierFacility?: {
    __typename?: "KPIProductCarbonFootprintSupplierFacility_mutation_response";
    returning: Array<{
      __typename?: "KPIProductCarbonFootprintSupplierFacility";
      id: any;
    }>;
  } | null;
};

export const InsertKpiProductCarbonFootprintSupplierFacilityDocument = gql`
  mutation insertKPIProductCarbonFootprintSupplierFacility(
    $kpiSupplierFacilityData: [KPIProductCarbonFootprintSupplierFacility_insert_input!]!
    $deleteKpiSupplierFacilityData: KPIProductCarbonFootprintSupplierFacility_bool_exp!
  ) {
    delete_KPIProductCarbonFootprintSupplierFacility(
      where: $deleteKpiSupplierFacilityData
    ) {
      returning {
        id
      }
    }
    insert_KPIProductCarbonFootprintSupplierFacility(
      objects: $kpiSupplierFacilityData
      on_conflict: {
        constraint: KPIProductCarbonFootprintSupplierFacility_pkey
        update_columns: [
          organization_id
          address_id
          region_id
          year
          month
          timestamp
          supplier_code
          buyer_material_code
          buyer_material_procurement_quantity
          buyer_material_procurement_uom
          allocation_percentage
          kpi_allocated_em_Grid_Power
          kpi_allocated_em_Captive_Power
          kpi_allocated_em_Fuel_Purchased
          kpi_allocated_em_Waste_Generation
          kpi_em_pcf_per_unit
          kpi_em_pcf_per_unit_uom
          metadata
          updated_by
          supplier_organization_address_id
        ]
      }
    ) {
      returning {
        id
      }
    }
  }
`;
export type InsertKpiProductCarbonFootprintSupplierFacilityMutationFn =
  Apollo.MutationFunction<
    InsertKpiProductCarbonFootprintSupplierFacilityMutation,
    InsertKpiProductCarbonFootprintSupplierFacilityMutationVariables
  >;

/**
 * __useInsertKpiProductCarbonFootprintSupplierFacilityMutation__
 *
 * To run a mutation, you first call `useInsertKpiProductCarbonFootprintSupplierFacilityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertKpiProductCarbonFootprintSupplierFacilityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertKpiProductCarbonFootprintSupplierFacilityMutation, { data, loading, error }] = useInsertKpiProductCarbonFootprintSupplierFacilityMutation({
 *   variables: {
 *      kpiSupplierFacilityData: // value for 'kpiSupplierFacilityData'
 *      deleteKpiSupplierFacilityData: // value for 'deleteKpiSupplierFacilityData'
 *   },
 * });
 */
export function useInsertKpiProductCarbonFootprintSupplierFacilityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertKpiProductCarbonFootprintSupplierFacilityMutation,
    InsertKpiProductCarbonFootprintSupplierFacilityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertKpiProductCarbonFootprintSupplierFacilityMutation,
    InsertKpiProductCarbonFootprintSupplierFacilityMutationVariables
  >(InsertKpiProductCarbonFootprintSupplierFacilityDocument, options);
}
export type InsertKpiProductCarbonFootprintSupplierFacilityMutationHookResult =
  ReturnType<typeof useInsertKpiProductCarbonFootprintSupplierFacilityMutation>;
export type InsertKpiProductCarbonFootprintSupplierFacilityMutationResult =
  Apollo.MutationResult<InsertKpiProductCarbonFootprintSupplierFacilityMutation>;
export type InsertKpiProductCarbonFootprintSupplierFacilityMutationOptions =
  Apollo.BaseMutationOptions<
    InsertKpiProductCarbonFootprintSupplierFacilityMutation,
    InsertKpiProductCarbonFootprintSupplierFacilityMutationVariables
  >;
