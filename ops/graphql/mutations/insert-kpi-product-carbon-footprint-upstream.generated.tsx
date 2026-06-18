import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertKpiProductCarbonFootprintUpstreamMutationVariables = Types.Exact<{
  kpiUpstreamData: Array<Types.KpiProductCarbonFootprintUpstream_Insert_Input> | Types.KpiProductCarbonFootprintUpstream_Insert_Input;
  deleteKpiUpstreamData: Types.KpiProductCarbonFootprintUpstream_Bool_Exp;
}>;


export type InsertKpiProductCarbonFootprintUpstreamMutation = { __typename?: 'mutation_root', delete_KPIProductCarbonFootprintUpstream?: { __typename?: 'KPIProductCarbonFootprintUpstream_mutation_response', affected_rows: number } | null, insert_KPIProductCarbonFootprintUpstream?: { __typename?: 'KPIProductCarbonFootprintUpstream_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'KPIProductCarbonFootprintUpstream', id: any }> } | null };


export const InsertKpiProductCarbonFootprintUpstreamDocument = gql`
    mutation insertKPIProductCarbonFootprintUpstream($kpiUpstreamData: [KPIProductCarbonFootprintUpstream_insert_input!]!, $deleteKpiUpstreamData: KPIProductCarbonFootprintUpstream_bool_exp!) {
  delete_KPIProductCarbonFootprintUpstream(where: $deleteKpiUpstreamData) {
    affected_rows
  }
  insert_KPIProductCarbonFootprintUpstream(
    objects: $kpiUpstreamData
    on_conflict: {constraint: KPIProductCarbonFootprintUpstream_pkey, update_columns: [organization_id, address_id, region_id, year, month, timestamp, supplier_code, buyer_material_code, buyer_material_procurement_quantity, buyer_material_procurement_uom, kpi_em_upstream, kpi_em_pcf_per_unit, kpi_em_pcf_per_unit_uom, metadata, updated_at, updated_by]}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export type InsertKpiProductCarbonFootprintUpstreamMutationFn = Apollo.MutationFunction<InsertKpiProductCarbonFootprintUpstreamMutation, InsertKpiProductCarbonFootprintUpstreamMutationVariables>;

/**
 * __useInsertKpiProductCarbonFootprintUpstreamMutation__
 *
 * To run a mutation, you first call `useInsertKpiProductCarbonFootprintUpstreamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertKpiProductCarbonFootprintUpstreamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertKpiProductCarbonFootprintUpstreamMutation, { data, loading, error }] = useInsertKpiProductCarbonFootprintUpstreamMutation({
 *   variables: {
 *      kpiUpstreamData: // value for 'kpiUpstreamData'
 *      deleteKpiUpstreamData: // value for 'deleteKpiUpstreamData'
 *   },
 * });
 */
export function useInsertKpiProductCarbonFootprintUpstreamMutation(baseOptions?: Apollo.MutationHookOptions<InsertKpiProductCarbonFootprintUpstreamMutation, InsertKpiProductCarbonFootprintUpstreamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertKpiProductCarbonFootprintUpstreamMutation, InsertKpiProductCarbonFootprintUpstreamMutationVariables>(InsertKpiProductCarbonFootprintUpstreamDocument, options);
      }
export type InsertKpiProductCarbonFootprintUpstreamMutationHookResult = ReturnType<typeof useInsertKpiProductCarbonFootprintUpstreamMutation>;
export type InsertKpiProductCarbonFootprintUpstreamMutationResult = Apollo.MutationResult<InsertKpiProductCarbonFootprintUpstreamMutation>;
export type InsertKpiProductCarbonFootprintUpstreamMutationOptions = Apollo.BaseMutationOptions<InsertKpiProductCarbonFootprintUpstreamMutation, InsertKpiProductCarbonFootprintUpstreamMutationVariables>;