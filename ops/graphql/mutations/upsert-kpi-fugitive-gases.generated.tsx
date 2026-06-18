import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertKpiFugitiveGasesMutationVariables = Types.Exact<{
  kpiFugitiveData: Array<Types.KpiFugitiveGases_Insert_Input> | Types.KpiFugitiveGases_Insert_Input;
  deleteCondition: Types.KpiFugitiveGases_Bool_Exp;
}>;


export type UpsertKpiFugitiveGasesMutation = { __typename?: 'mutation_root', delete_KPIFugitiveGases?: { __typename?: 'KPIFugitiveGases_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'KPIFugitiveGases', id: any, organization_id: any, region_id: any, address_id: any, year: number, month: number, kpi_em_refrigerant_and_ac_systems?: any | null, kpi_em_fire_extinguisher?: any | null, kpi_em_industrial_gas?: any | null, kpi_consumption_refrigerant_and_ac_systems?: any | null, kpi_consumption_fire_extinguisher?: any | null, kpi_consumption_industrial_gas?: any | null, metadata?: any | null }> } | null, insert_KPIFugitiveGases?: { __typename?: 'KPIFugitiveGases_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'KPIFugitiveGases', id: any, organization_id: any, region_id: any, address_id: any, year: number, month: number, kpi_em_refrigerant_and_ac_systems?: any | null, kpi_em_fire_extinguisher?: any | null, kpi_em_industrial_gas?: any | null, kpi_consumption_refrigerant_and_ac_systems?: any | null, kpi_consumption_fire_extinguisher?: any | null, kpi_consumption_industrial_gas?: any | null, metadata?: any | null }> } | null };


export const UpsertKpiFugitiveGasesDocument = gql`
    mutation upsertKPIFugitiveGases($kpiFugitiveData: [KPIFugitiveGases_insert_input!]!, $deleteCondition: KPIFugitiveGases_bool_exp!) {
  delete_KPIFugitiveGases(where: $deleteCondition) {
    affected_rows
    returning {
      id
      organization_id
      region_id
      address_id
      year
      month
      kpi_em_refrigerant_and_ac_systems
      kpi_em_fire_extinguisher
      kpi_em_industrial_gas
      kpi_consumption_refrigerant_and_ac_systems
      kpi_consumption_fire_extinguisher
      kpi_consumption_industrial_gas
      metadata
    }
  }
  insert_KPIFugitiveGases(objects: $kpiFugitiveData) {
    affected_rows
    returning {
      id
      organization_id
      region_id
      address_id
      year
      month
      kpi_em_refrigerant_and_ac_systems
      kpi_em_fire_extinguisher
      kpi_em_industrial_gas
      kpi_consumption_refrigerant_and_ac_systems
      kpi_consumption_fire_extinguisher
      kpi_consumption_industrial_gas
      metadata
    }
  }
}
    `;
export type UpsertKpiFugitiveGasesMutationFn = Apollo.MutationFunction<UpsertKpiFugitiveGasesMutation, UpsertKpiFugitiveGasesMutationVariables>;

/**
 * __useUpsertKpiFugitiveGasesMutation__
 *
 * To run a mutation, you first call `useUpsertKpiFugitiveGasesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertKpiFugitiveGasesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertKpiFugitiveGasesMutation, { data, loading, error }] = useUpsertKpiFugitiveGasesMutation({
 *   variables: {
 *      kpiFugitiveData: // value for 'kpiFugitiveData'
 *      deleteCondition: // value for 'deleteCondition'
 *   },
 * });
 */
export function useUpsertKpiFugitiveGasesMutation(baseOptions?: Apollo.MutationHookOptions<UpsertKpiFugitiveGasesMutation, UpsertKpiFugitiveGasesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertKpiFugitiveGasesMutation, UpsertKpiFugitiveGasesMutationVariables>(UpsertKpiFugitiveGasesDocument, options);
      }
export type UpsertKpiFugitiveGasesMutationHookResult = ReturnType<typeof useUpsertKpiFugitiveGasesMutation>;
export type UpsertKpiFugitiveGasesMutationResult = Apollo.MutationResult<UpsertKpiFugitiveGasesMutation>;
export type UpsertKpiFugitiveGasesMutationOptions = Apollo.BaseMutationOptions<UpsertKpiFugitiveGasesMutation, UpsertKpiFugitiveGasesMutationVariables>;