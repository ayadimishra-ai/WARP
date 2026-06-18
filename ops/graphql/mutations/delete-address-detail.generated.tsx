import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteAddressByIdMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  is_deleted?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;


export type DeleteAddressByIdMutation = { __typename?: 'mutation_root', update_Addresses?: { __typename?: 'Addresses_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'Addresses', id: any, name: string, code?: string | null, full_address: string, pincode?: string | null, country_id?: any | null, state_id?: any | null, city_id?: any | null, type?: string | null, metadata?: any | null, ownership_type?: string | null, facility_type?: string | null, updated_at: any, updated_by?: any | null, is_deleted: boolean }> } | null };

export type DeleteOrganizationAddressByIdMutationVariables = Types.Exact<{
  id: Types.Scalars['uuid']['input'];
  is_deleted?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;


export type DeleteOrganizationAddressByIdMutation = { __typename?: 'mutation_root', update_OrganizationAddress?: { __typename?: 'OrganizationAddress_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'OrganizationAddress', id: any, is_deleted: boolean }> } | null };


export const DeleteAddressByIdDocument = gql`
    mutation DeleteAddressById($id: uuid!, $is_deleted: Boolean) {
  update_Addresses(where: {id: {_eq: $id}}, _set: {is_deleted: true}) {
    affected_rows
    returning {
      id
      name
      code
      full_address
      pincode
      country_id
      state_id
      city_id
      type
      metadata
      ownership_type
      facility_type
      updated_at
      updated_by
      is_deleted
    }
  }
}
    `;
export type DeleteAddressByIdMutationFn = Apollo.MutationFunction<DeleteAddressByIdMutation, DeleteAddressByIdMutationVariables>;

/**
 * __useDeleteAddressByIdMutation__
 *
 * To run a mutation, you first call `useDeleteAddressByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAddressByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAddressByIdMutation, { data, loading, error }] = useDeleteAddressByIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *      is_deleted: // value for 'is_deleted'
 *   },
 * });
 */
export function useDeleteAddressByIdMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAddressByIdMutation, DeleteAddressByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAddressByIdMutation, DeleteAddressByIdMutationVariables>(DeleteAddressByIdDocument, options);
      }
export type DeleteAddressByIdMutationHookResult = ReturnType<typeof useDeleteAddressByIdMutation>;
export type DeleteAddressByIdMutationResult = Apollo.MutationResult<DeleteAddressByIdMutation>;
export type DeleteAddressByIdMutationOptions = Apollo.BaseMutationOptions<DeleteAddressByIdMutation, DeleteAddressByIdMutationVariables>;
export const DeleteOrganizationAddressByIdDocument = gql`
    mutation DeleteOrganizationAddressById($id: uuid!, $is_deleted: Boolean) {
  update_OrganizationAddress(
    where: {address_id: {_eq: $id}}
    _set: {is_deleted: true}
  ) {
    affected_rows
    returning {
      id
      is_deleted
    }
  }
}
    `;
export type DeleteOrganizationAddressByIdMutationFn = Apollo.MutationFunction<DeleteOrganizationAddressByIdMutation, DeleteOrganizationAddressByIdMutationVariables>;

/**
 * __useDeleteOrganizationAddressByIdMutation__
 *
 * To run a mutation, you first call `useDeleteOrganizationAddressByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOrganizationAddressByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOrganizationAddressByIdMutation, { data, loading, error }] = useDeleteOrganizationAddressByIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *      is_deleted: // value for 'is_deleted'
 *   },
 * });
 */
export function useDeleteOrganizationAddressByIdMutation(baseOptions?: Apollo.MutationHookOptions<DeleteOrganizationAddressByIdMutation, DeleteOrganizationAddressByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteOrganizationAddressByIdMutation, DeleteOrganizationAddressByIdMutationVariables>(DeleteOrganizationAddressByIdDocument, options);
      }
export type DeleteOrganizationAddressByIdMutationHookResult = ReturnType<typeof useDeleteOrganizationAddressByIdMutation>;
export type DeleteOrganizationAddressByIdMutationResult = Apollo.MutationResult<DeleteOrganizationAddressByIdMutation>;
export type DeleteOrganizationAddressByIdMutationOptions = Apollo.BaseMutationOptions<DeleteOrganizationAddressByIdMutation, DeleteOrganizationAddressByIdMutationVariables>;