import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertKpiEnergyMutationVariables = Types.Exact<{
  kpienergydata: Array<Types.KpiEnergy_Insert_Input> | Types.KpiEnergy_Insert_Input;
  deletekpienergydata: Types.KpiEnergy_Bool_Exp;
}>;


export type InsertKpiEnergyMutation = { __typename?: 'mutation_root', delete_KPIEnergy?: { __typename?: 'KPIEnergy_mutation_response', returning: Array<{ __typename?: 'KPIEnergy', id: any }> } | null, insert_KPIEnergy?: { __typename?: 'KPIEnergy_mutation_response', returning: Array<{ __typename?: 'KPIEnergy', id: any }> } | null };


export const InsertKpiEnergyDocument = gql`
    mutation insertKPIEnergy($kpienergydata: [KPIEnergy_insert_input!]!, $deletekpienergydata: KPIEnergy_bool_exp!) {
  delete_KPIEnergy(where: $deletekpienergydata) {
    returning {
      id
    }
  }
  insert_KPIEnergy(
    objects: $kpienergydata
    on_conflict: {constraint: KPIEnergy_pkey}
  ) {
    returning {
      id
    }
  }
}
    `;
export type InsertKpiEnergyMutationFn = Apollo.MutationFunction<InsertKpiEnergyMutation, InsertKpiEnergyMutationVariables>;

/**
 * __useInsertKpiEnergyMutation__
 *
 * To run a mutation, you first call `useInsertKpiEnergyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertKpiEnergyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertKpiEnergyMutation, { data, loading, error }] = useInsertKpiEnergyMutation({
 *   variables: {
 *      kpienergydata: // value for 'kpienergydata'
 *      deletekpienergydata: // value for 'deletekpienergydata'
 *   },
 * });
 */
export function useInsertKpiEnergyMutation(baseOptions?: Apollo.MutationHookOptions<InsertKpiEnergyMutation, InsertKpiEnergyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertKpiEnergyMutation, InsertKpiEnergyMutationVariables>(InsertKpiEnergyDocument, options);
      }
export type InsertKpiEnergyMutationHookResult = ReturnType<typeof useInsertKpiEnergyMutation>;
export type InsertKpiEnergyMutationResult = Apollo.MutationResult<InsertKpiEnergyMutation>;
export type InsertKpiEnergyMutationOptions = Apollo.BaseMutationOptions<InsertKpiEnergyMutation, InsertKpiEnergyMutationVariables>;