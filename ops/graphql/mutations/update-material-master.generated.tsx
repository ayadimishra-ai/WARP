import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateMaterialMasterMutationVariables = Types.Exact<{
  updates: Array<Types.OrgMaterialMaster_Updates> | Types.OrgMaterialMaster_Updates;
}>;


export type UpdateMaterialMasterMutation = { __typename?: 'mutation_root', update_OrgMaterialMaster_many?: Array<{ __typename?: 'OrgMaterialMaster_mutation_response', returning: Array<{ __typename?: 'OrgMaterialMaster', id: any, name: string, code?: string | null, type: string, Material_Weight_Per_Unit?: any | null, UoM_Material_Weight?: string | null, Material_Classification?: string | null, Material_Description?: string | null, Additional_Information?: string | null, organization_id: any, created_at: any, updated_at: any }> } | null> | null };


export const UpdateMaterialMasterDocument = gql`
    mutation updateMaterialMaster($updates: [OrgMaterialMaster_updates!]!) {
  update_OrgMaterialMaster_many(updates: $updates) {
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
export type UpdateMaterialMasterMutationFn = Apollo.MutationFunction<UpdateMaterialMasterMutation, UpdateMaterialMasterMutationVariables>;

/**
 * __useUpdateMaterialMasterMutation__
 *
 * To run a mutation, you first call `useUpdateMaterialMasterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMaterialMasterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMaterialMasterMutation, { data, loading, error }] = useUpdateMaterialMasterMutation({
 *   variables: {
 *      updates: // value for 'updates'
 *   },
 * });
 */
export function useUpdateMaterialMasterMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMaterialMasterMutation, UpdateMaterialMasterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMaterialMasterMutation, UpdateMaterialMasterMutationVariables>(UpdateMaterialMasterDocument, options);
      }
export type UpdateMaterialMasterMutationHookResult = ReturnType<typeof useUpdateMaterialMasterMutation>;
export type UpdateMaterialMasterMutationResult = Apollo.MutationResult<UpdateMaterialMasterMutation>;
export type UpdateMaterialMasterMutationOptions = Apollo.BaseMutationOptions<UpdateMaterialMasterMutation, UpdateMaterialMasterMutationVariables>;