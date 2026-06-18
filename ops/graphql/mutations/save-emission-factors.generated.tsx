import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SaveemissonFactorDataMutationVariables = Types.Exact<{
  insertData: Array<Types.Co2EmissionFactorMaster_Insert_Input> | Types.Co2EmissionFactorMaster_Insert_Input;
  updateData: Array<Types.Co2EmissionFactorMaster_Updates> | Types.Co2EmissionFactorMaster_Updates;
}>;


export type SaveemissonFactorDataMutation = { __typename?: 'mutation_root', insert_CO2EmissionFactorMaster?: { __typename?: 'CO2EmissionFactorMaster_mutation_response', returning: Array<{ __typename?: 'CO2EmissionFactorMaster', id: any, geography?: string | null, year: number, month?: any | null, region?: any | null, category?: string | null, activity?: string | null, sub_activity?: string | null, type?: string | null, sub_type?: string | null, configuration?: string | null, fuel_type?: string | null, factor: any, factor_uom: string, metadata?: any | null, group?: any | null, created_by?: any | null, updated_by?: any | null }> } | null, update_CO2EmissionFactorMaster_many?: Array<{ __typename?: 'CO2EmissionFactorMaster_mutation_response', returning: Array<{ __typename?: 'CO2EmissionFactorMaster', id: any, geography?: string | null, year: number, month?: any | null, region?: any | null, category?: string | null, activity?: string | null, sub_activity?: string | null, type?: string | null, sub_type?: string | null, configuration?: string | null, fuel_type?: string | null, factor: any, factor_uom: string, metadata?: any | null, group?: any | null, created_by?: any | null, updated_by?: any | null }> } | null> | null };


export const SaveemissonFactorDataDocument = gql`
    mutation saveemissonFactorData($insertData: [CO2EmissionFactorMaster_insert_input!]!, $updateData: [CO2EmissionFactorMaster_updates!]!) {
  insert_CO2EmissionFactorMaster(
    on_conflict: {constraint: CO2EmissionFactorMaster_pkey}
    objects: $insertData
  ) {
    returning {
      id
      geography
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
  update_CO2EmissionFactorMaster_many(updates: $updateData) {
    returning {
      id
      geography
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
      id
    }
  }
}
    `;
export type SaveemissonFactorDataMutationFn = Apollo.MutationFunction<SaveemissonFactorDataMutation, SaveemissonFactorDataMutationVariables>;

/**
 * __useSaveemissonFactorDataMutation__
 *
 * To run a mutation, you first call `useSaveemissonFactorDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveemissonFactorDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveemissonFactorDataMutation, { data, loading, error }] = useSaveemissonFactorDataMutation({
 *   variables: {
 *      insertData: // value for 'insertData'
 *      updateData: // value for 'updateData'
 *   },
 * });
 */
export function useSaveemissonFactorDataMutation(baseOptions?: Apollo.MutationHookOptions<SaveemissonFactorDataMutation, SaveemissonFactorDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveemissonFactorDataMutation, SaveemissonFactorDataMutationVariables>(SaveemissonFactorDataDocument, options);
      }
export type SaveemissonFactorDataMutationHookResult = ReturnType<typeof useSaveemissonFactorDataMutation>;
export type SaveemissonFactorDataMutationResult = Apollo.MutationResult<SaveemissonFactorDataMutation>;
export type SaveemissonFactorDataMutationOptions = Apollo.BaseMutationOptions<SaveemissonFactorDataMutation, SaveemissonFactorDataMutationVariables>;