import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertOrgSupplierMasterMutationVariables = Types.Exact<{
  supplierMasterData: Array<Types.OrgSupplierMaster_Insert_Input> | Types.OrgSupplierMaster_Insert_Input;
}>;


export type InsertOrgSupplierMasterMutation = { __typename?: 'mutation_root', insert_OrgSupplierMaster?: { __typename?: 'OrgSupplierMaster_mutation_response', returning: Array<{ __typename?: 'OrgSupplierMaster', id: any, name: string, code?: string | null, category: string, client_master_id?: string | null, organization_id: any }> } | null };


export const InsertOrgSupplierMasterDocument = gql`
    mutation insertOrgSupplierMaster($supplierMasterData: [OrgSupplierMaster_insert_input!]!) {
  insert_OrgSupplierMaster(
    objects: $supplierMasterData
    on_conflict: {constraint: OrgSupplierMaster_pkey}
  ) {
    returning {
      id
      name
      code
      category
      client_master_id
      organization_id
    }
  }
}
    `;
export type InsertOrgSupplierMasterMutationFn = Apollo.MutationFunction<InsertOrgSupplierMasterMutation, InsertOrgSupplierMasterMutationVariables>;

/**
 * __useInsertOrgSupplierMasterMutation__
 *
 * To run a mutation, you first call `useInsertOrgSupplierMasterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertOrgSupplierMasterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertOrgSupplierMasterMutation, { data, loading, error }] = useInsertOrgSupplierMasterMutation({
 *   variables: {
 *      supplierMasterData: // value for 'supplierMasterData'
 *   },
 * });
 */
export function useInsertOrgSupplierMasterMutation(baseOptions?: Apollo.MutationHookOptions<InsertOrgSupplierMasterMutation, InsertOrgSupplierMasterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertOrgSupplierMasterMutation, InsertOrgSupplierMasterMutationVariables>(InsertOrgSupplierMasterDocument, options);
      }
export type InsertOrgSupplierMasterMutationHookResult = ReturnType<typeof useInsertOrgSupplierMasterMutation>;
export type InsertOrgSupplierMasterMutationResult = Apollo.MutationResult<InsertOrgSupplierMasterMutation>;
export type InsertOrgSupplierMasterMutationOptions = Apollo.BaseMutationOptions<InsertOrgSupplierMasterMutation, InsertOrgSupplierMasterMutationVariables>;