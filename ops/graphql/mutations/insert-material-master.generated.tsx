import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertMaterialMasterMutationVariables = Types.Exact<{
  objects: Array<Types.OrgMaterialMaster_Insert_Input> | Types.OrgMaterialMaster_Insert_Input;
}>;


export type InsertMaterialMasterMutation = { __typename?: 'mutation_root', insert_OrgMaterialMaster?: { __typename?: 'OrgMaterialMaster_mutation_response', returning: Array<{ __typename?: 'OrgMaterialMaster', id: any, name: string, code?: string | null, type: string, Material_Weight_Per_Unit?: any | null, UoM_Material_Weight?: string | null, Material_Classification?: string | null, Material_Description?: string | null, Additional_Information?: string | null, organization_id: any, created_at: any, updated_at: any }> } | null };


export const InsertMaterialMasterDocument = gql`
    mutation insertMaterialMaster($objects: [OrgMaterialMaster_insert_input!]!) {
  insert_OrgMaterialMaster(objects: $objects) {
    returning {
      id
      name
      code
      type
      Material_Weight_Per_Unit
      UoM_Material_Weight
      Material_Classification
      Material_Description
      Additional_Information
      organization_id
      created_at
      updated_at
    }
  }
}
    `;
export type InsertMaterialMasterMutationFn = Apollo.MutationFunction<InsertMaterialMasterMutation, InsertMaterialMasterMutationVariables>;

/**
 * __useInsertMaterialMasterMutation__
 *
 * To run a mutation, you first call `useInsertMaterialMasterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertMaterialMasterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertMaterialMasterMutation, { data, loading, error }] = useInsertMaterialMasterMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useInsertMaterialMasterMutation(baseOptions?: Apollo.MutationHookOptions<InsertMaterialMasterMutation, InsertMaterialMasterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertMaterialMasterMutation, InsertMaterialMasterMutationVariables>(InsertMaterialMasterDocument, options);
      }
export type InsertMaterialMasterMutationHookResult = ReturnType<typeof useInsertMaterialMasterMutation>;
export type InsertMaterialMasterMutationResult = Apollo.MutationResult<InsertMaterialMasterMutation>;
export type InsertMaterialMasterMutationOptions = Apollo.BaseMutationOptions<InsertMaterialMasterMutation, InsertMaterialMasterMutationVariables>;