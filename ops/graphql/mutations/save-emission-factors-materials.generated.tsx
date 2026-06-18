import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SaveemissonFactorMaterialDataMutationVariables = Types.Exact<{
  insertData: Array<Types.Co2EmissionFactorMaster_Material_Insert_Input> | Types.Co2EmissionFactorMaster_Material_Insert_Input;
  updateData: Array<Types.Co2EmissionFactorMaster_Material_Updates> | Types.Co2EmissionFactorMaster_Material_Updates;
}>;


export type SaveemissonFactorMaterialDataMutation = { __typename?: 'mutation_root', insert_CO2EmissionFactorMaster_Material?: { __typename?: 'CO2EmissionFactorMaster_Material_mutation_response', returning: Array<{ __typename?: 'CO2EmissionFactorMaster_Material', id: any, geography?: string | null, organization_id?: any | null, year: number, month?: any | null, region?: any | null, category?: string | null, activity?: string | null, sub_activity?: string | null, type?: string | null, sub_type?: string | null, configuration?: string | null, fuel_type?: string | null, factor: any, factor_uom: string, metadata?: any | null, group?: any | null, created_by?: any | null, updated_by?: any | null }> } | null, update_CO2EmissionFactorMaster_Material_many?: Array<{ __typename?: 'CO2EmissionFactorMaster_Material_mutation_response', returning: Array<{ __typename?: 'CO2EmissionFactorMaster_Material', id: any, geography?: string | null, organization_id?: any | null, year: number, month?: any | null, region?: any | null, category?: string | null, activity?: string | null, sub_activity?: string | null, type?: string | null, sub_type?: string | null, configuration?: string | null, fuel_type?: string | null, factor: any, factor_uom: string, metadata?: any | null, group?: any | null, created_by?: any | null, updated_by?: any | null }> } | null> | null };


export const SaveemissonFactorMaterialDataDocument = gql`
    mutation saveemissonFactorMaterialData($insertData: [CO2EmissionFactorMaster_Material_insert_input!]!, $updateData: [CO2EmissionFactorMaster_Material_updates!]!) {
  insert_CO2EmissionFactorMaster_Material(
    on_conflict: {constraint: CO2EmissionFactorMaster_Material_pkey}
    objects: $insertData
  ) {
    returning {
      id
      geography
      organization_id
      year
      month
      region
      category
      activity
      sub_activity
      type
      sub_type
      configuration
      fuel_type
      factor
      factor_uom
      metadata
      group
      created_by
      updated_by
    }
  }
  update_CO2EmissionFactorMaster_Material_many(updates: $updateData) {
    returning {
      id
      geography
      organization_id
      year
      month
      region
      category
      activity
      sub_activity
      type
      sub_type
      configuration
      fuel_type
      factor
      factor_uom
      metadata
      group
      created_by
      updated_by
    }
  }
}
    `;
export type SaveemissonFactorMaterialDataMutationFn = Apollo.MutationFunction<SaveemissonFactorMaterialDataMutation, SaveemissonFactorMaterialDataMutationVariables>;

/**
 * __useSaveemissonFactorMaterialDataMutation__
 *
 * To run a mutation, you first call `useSaveemissonFactorMaterialDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveemissonFactorMaterialDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveemissonFactorMaterialDataMutation, { data, loading, error }] = useSaveemissonFactorMaterialDataMutation({
 *   variables: {
 *      insertData: // value for 'insertData'
 *      updateData: // value for 'updateData'
 *   },
 * });
 */
export function useSaveemissonFactorMaterialDataMutation(baseOptions?: Apollo.MutationHookOptions<SaveemissonFactorMaterialDataMutation, SaveemissonFactorMaterialDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveemissonFactorMaterialDataMutation, SaveemissonFactorMaterialDataMutationVariables>(SaveemissonFactorMaterialDataDocument, options);
      }
export type SaveemissonFactorMaterialDataMutationHookResult = ReturnType<typeof useSaveemissonFactorMaterialDataMutation>;
export type SaveemissonFactorMaterialDataMutationResult = Apollo.MutationResult<SaveemissonFactorMaterialDataMutation>;
export type SaveemissonFactorMaterialDataMutationOptions = Apollo.BaseMutationOptions<SaveemissonFactorMaterialDataMutation, SaveemissonFactorMaterialDataMutationVariables>;