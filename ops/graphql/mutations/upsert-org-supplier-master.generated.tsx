import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpsertOrgSupplierMasterMutationVariables = Types.Exact<{
  insert: Array<Types.OrgSupplierMaster_Insert_Input> | Types.OrgSupplierMaster_Insert_Input;
  updates: Array<Types.OrgSupplierMaster_Updates> | Types.OrgSupplierMaster_Updates;
}>;


export type UpsertOrgSupplierMasterMutation = { __typename?: 'mutation_root', insert_OrgSupplierMaster?: { __typename?: 'OrgSupplierMaster_mutation_response', returning: Array<{ __typename?: 'OrgSupplierMaster', id: any, client_master_id?: string | null, name: string, code?: string | null, category?: string | null, organization_id: any, supplier_admin_email_id?: string | null, supplier_admin_name?: string | null, onboarding_date?: any | null, supplier_gst_or_license_number?: string | null, metadata?: any | null }> } | null, update_OrgSupplierMaster_many?: Array<{ __typename?: 'OrgSupplierMaster_mutation_response', returning: Array<{ __typename?: 'OrgSupplierMaster', id: any, client_master_id?: string | null, name: string, code?: string | null, category?: string | null, organization_id: any, supplier_admin_email_id?: string | null, supplier_admin_name?: string | null, onboarding_date?: any | null, supplier_gst_or_license_number?: string | null, metadata?: any | null }> } | null> | null };


export const UpsertOrgSupplierMasterDocument = gql`
    mutation upsertOrgSupplierMaster($insert: [OrgSupplierMaster_insert_input!]!, $updates: [OrgSupplierMaster_updates!]!) {
  insert_OrgSupplierMaster(
    objects: $insert
    on_conflict: {constraint: OrgSupplierMaster_pkey}
  ) {
    returning {
      id
      client_master_id
      name
      code
      category
      organization_id
      supplier_admin_email_id
      supplier_admin_name
      onboarding_date
      supplier_gst_or_license_number
      metadata
    }
  }
  update_OrgSupplierMaster_many(updates: $updates) {
    returning {
      id
      client_master_id
      name
      code
      category
      organization_id
      supplier_admin_email_id
      supplier_admin_name
      onboarding_date
      supplier_gst_or_license_number
      metadata
    }
  }
}
    `;
export type UpsertOrgSupplierMasterMutationFn = Apollo.MutationFunction<UpsertOrgSupplierMasterMutation, UpsertOrgSupplierMasterMutationVariables>;

/**
 * __useUpsertOrgSupplierMasterMutation__
 *
 * To run a mutation, you first call `useUpsertOrgSupplierMasterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertOrgSupplierMasterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertOrgSupplierMasterMutation, { data, loading, error }] = useUpsertOrgSupplierMasterMutation({
 *   variables: {
 *      insert: // value for 'insert'
 *      updates: // value for 'updates'
 *   },
 * });
 */
export function useUpsertOrgSupplierMasterMutation(baseOptions?: Apollo.MutationHookOptions<UpsertOrgSupplierMasterMutation, UpsertOrgSupplierMasterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertOrgSupplierMasterMutation, UpsertOrgSupplierMasterMutationVariables>(UpsertOrgSupplierMasterDocument, options);
      }
export type UpsertOrgSupplierMasterMutationHookResult = ReturnType<typeof useUpsertOrgSupplierMasterMutation>;
export type UpsertOrgSupplierMasterMutationResult = Apollo.MutationResult<UpsertOrgSupplierMasterMutation>;
export type UpsertOrgSupplierMasterMutationOptions = Apollo.BaseMutationOptions<UpsertOrgSupplierMasterMutation, UpsertOrgSupplierMasterMutationVariables>;