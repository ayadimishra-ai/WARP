import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ResetEmissionsForUoMMismatchMutationVariables = Types.Exact<{
  capitalGoodsUpdates: Array<Types.GhgCapital_Goods_Updates> | Types.GhgCapital_Goods_Updates;
  materialProcurementUpdates: Array<Types.GhgMaterialProcurement_Updates> | Types.GhgMaterialProcurement_Updates;
  transportUpstreamUpdates: Array<Types.GhgTransport_Upstream_Updates> | Types.GhgTransport_Upstream_Updates;
}>;


export type ResetEmissionsForUoMMismatchMutation = { __typename?: 'mutation_root', resetCapitalGoods?: Array<{ __typename?: 'GHGCapital_Goods_mutation_response', returning: Array<{ __typename?: 'GHGCapital_Goods', id: any, Material_Code?: string | null, kpi_em_EmissionBy_CapitalGoods?: any | null, kpi_emf_EmissionBy_CapitalGoods?: any | null, updated_at: any }> } | null> | null, resetMaterialProcurement?: Array<{ __typename?: 'GHGMaterialProcurement_mutation_response', returning: Array<{ __typename?: 'GHGMaterialProcurement', id: any, Material_Code?: string | null, kpi_em_EmissionBy_MaterialProcured?: any | null, kpi_emf_EmissionBy_MaterialProcured?: any | null, updated_at: any }> } | null> | null, resetTransportUpstream?: Array<{ __typename?: 'GHGTransport_Upstream_mutation_response', returning: Array<{ __typename?: 'GHGTransport_Upstream', id: any, Material_ID?: string | null, kpi_em_EmissionBy_MaterialProcured?: any | null, kpi_emf_EmissionBy_MaterialProcured?: any | null, updated_at: any }> } | null> | null };


export const ResetEmissionsForUoMMismatchDocument = gql`
    mutation resetEmissionsForUoMMismatch($capitalGoodsUpdates: [GHGCapital_Goods_updates!]!, $materialProcurementUpdates: [GHGMaterialProcurement_updates!]!, $transportUpstreamUpdates: [GHGTransport_Upstream_updates!]!) {
  resetCapitalGoods: update_GHGCapital_Goods_many(updates: $capitalGoodsUpdates) {
    returning {
      id
      Material_Code
      kpi_em_EmissionBy_CapitalGoods
      kpi_emf_EmissionBy_CapitalGoods
      updated_at
    }
  }
  resetMaterialProcurement: update_GHGMaterialProcurement_many(
    updates: $materialProcurementUpdates
  ) {
    returning {
      id
      Material_Code
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      updated_at
    }
  }
  resetTransportUpstream: update_GHGTransport_Upstream_many(
    updates: $transportUpstreamUpdates
  ) {
    returning {
      id
      Material_ID
      kpi_em_EmissionBy_MaterialProcured
      kpi_emf_EmissionBy_MaterialProcured
      updated_at
    }
  }
}
    `;
export type ResetEmissionsForUoMMismatchMutationFn = Apollo.MutationFunction<ResetEmissionsForUoMMismatchMutation, ResetEmissionsForUoMMismatchMutationVariables>;

/**
 * __useResetEmissionsForUoMMismatchMutation__
 *
 * To run a mutation, you first call `useResetEmissionsForUoMMismatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetEmissionsForUoMMismatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetEmissionsForUoMMismatchMutation, { data, loading, error }] = useResetEmissionsForUoMMismatchMutation({
 *   variables: {
 *      capitalGoodsUpdates: // value for 'capitalGoodsUpdates'
 *      materialProcurementUpdates: // value for 'materialProcurementUpdates'
 *      transportUpstreamUpdates: // value for 'transportUpstreamUpdates'
 *   },
 * });
 */
export function useResetEmissionsForUoMMismatchMutation(baseOptions?: Apollo.MutationHookOptions<ResetEmissionsForUoMMismatchMutation, ResetEmissionsForUoMMismatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResetEmissionsForUoMMismatchMutation, ResetEmissionsForUoMMismatchMutationVariables>(ResetEmissionsForUoMMismatchDocument, options);
      }
export type ResetEmissionsForUoMMismatchMutationHookResult = ReturnType<typeof useResetEmissionsForUoMMismatchMutation>;
export type ResetEmissionsForUoMMismatchMutationResult = Apollo.MutationResult<ResetEmissionsForUoMMismatchMutation>;
export type ResetEmissionsForUoMMismatchMutationOptions = Apollo.BaseMutationOptions<ResetEmissionsForUoMMismatchMutation, ResetEmissionsForUoMMismatchMutationVariables>;