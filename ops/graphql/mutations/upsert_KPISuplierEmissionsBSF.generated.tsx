import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertKpiSuplierEmissionsBsfMutationVariables = Types.Exact<{
  where: Types.KpiSuplierEmissionsBsf_Bool_Exp;
  SupplierEmissionData: Array<Types.KpiSuplierEmissionsBsf_Insert_Input> | Types.KpiSuplierEmissionsBsf_Insert_Input;
}>;


export type UpsertKpiSuplierEmissionsBsfMutation = { __typename?: 'mutation_root', delete_KPISuplierEmissionsBSF?: { __typename?: 'KPISuplierEmissionsBSF_mutation_response', returning: Array<{ __typename?: 'KPISuplierEmissionsBSF', id: any }> } | null, insert_KPISuplierEmissionsBSF?: { __typename?: 'KPISuplierEmissionsBSF_mutation_response', returning: Array<{ __typename?: 'KPISuplierEmissionsBSF', id: any, supplier_code: string, kpi_em_TotalPowerPurchased?: any | null, kpi_em_TotalEmission_MaterialProcurement?: any | null, kpi_em_TotalEmission_FuelConsumption?: any | null, kpi_em_UpstreamTransport?: any | null, kpi_em_TotalEmission_WasteGeneration?: any | null }> } | null };


export const UpsertKpiSuplierEmissionsBsfDocument = gql`
    mutation upsertKPISuplierEmissionsBSF($where: KPISuplierEmissionsBSF_bool_exp!, $SupplierEmissionData: [KPISuplierEmissionsBSF_insert_input!]!) {
  delete_KPISuplierEmissionsBSF(where: $where) {
    returning {
      id
    }
  }
  insert_KPISuplierEmissionsBSF(objects: $SupplierEmissionData) {
    returning {
      id
      supplier_code
      kpi_em_TotalPowerPurchased
      kpi_em_TotalEmission_MaterialProcurement
      kpi_em_TotalEmission_FuelConsumption
      kpi_em_UpstreamTransport
      kpi_em_TotalEmission_WasteGeneration
    }
  }
}
    `;
export type UpsertKpiSuplierEmissionsBsfMutationFn = Apollo.MutationFunction<UpsertKpiSuplierEmissionsBsfMutation, UpsertKpiSuplierEmissionsBsfMutationVariables>;

/**
 * __useUpsertKpiSuplierEmissionsBsfMutation__
 *
 * To run a mutation, you first call `useUpsertKpiSuplierEmissionsBsfMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertKpiSuplierEmissionsBsfMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertKpiSuplierEmissionsBsfMutation, { data, loading, error }] = useUpsertKpiSuplierEmissionsBsfMutation({
 *   variables: {
 *      where: // value for 'where'
 *      SupplierEmissionData: // value for 'SupplierEmissionData'
 *   },
 * });
 */
export function useUpsertKpiSuplierEmissionsBsfMutation(baseOptions?: Apollo.MutationHookOptions<UpsertKpiSuplierEmissionsBsfMutation, UpsertKpiSuplierEmissionsBsfMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertKpiSuplierEmissionsBsfMutation, UpsertKpiSuplierEmissionsBsfMutationVariables>(UpsertKpiSuplierEmissionsBsfDocument, options);
      }
export type UpsertKpiSuplierEmissionsBsfMutationHookResult = ReturnType<typeof useUpsertKpiSuplierEmissionsBsfMutation>;
export type UpsertKpiSuplierEmissionsBsfMutationResult = Apollo.MutationResult<UpsertKpiSuplierEmissionsBsfMutation>;
export type UpsertKpiSuplierEmissionsBsfMutationOptions = Apollo.BaseMutationOptions<UpsertKpiSuplierEmissionsBsfMutation, UpsertKpiSuplierEmissionsBsfMutationVariables>;