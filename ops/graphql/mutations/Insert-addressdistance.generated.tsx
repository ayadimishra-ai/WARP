import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertAddressDistanceMutationVariables = Types.Exact<{
  input: Array<Types.AddressDistance_Insert_Input> | Types.AddressDistance_Insert_Input;
}>;


export type InsertAddressDistanceMutation = { __typename?: 'mutation_root', insert_AddressDistance?: { __typename?: 'AddressDistance_mutation_response', returning: Array<{ __typename?: 'AddressDistance', id: any }> } | null };


export const InsertAddressDistanceDocument = gql`
    mutation InsertAddressDistance($input: [AddressDistance_insert_input!]!) {
  insert_AddressDistance(objects: $input) {
    returning {
      id
    }
  }
}
    `;
export type InsertAddressDistanceMutationFn = Apollo.MutationFunction<InsertAddressDistanceMutation, InsertAddressDistanceMutationVariables>;

/**
 * __useInsertAddressDistanceMutation__
 *
 * To run a mutation, you first call `useInsertAddressDistanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertAddressDistanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertAddressDistanceMutation, { data, loading, error }] = useInsertAddressDistanceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertAddressDistanceMutation(baseOptions?: Apollo.MutationHookOptions<InsertAddressDistanceMutation, InsertAddressDistanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertAddressDistanceMutation, InsertAddressDistanceMutationVariables>(InsertAddressDistanceDocument, options);
      }
export type InsertAddressDistanceMutationHookResult = ReturnType<typeof useInsertAddressDistanceMutation>;
export type InsertAddressDistanceMutationResult = Apollo.MutationResult<InsertAddressDistanceMutation>;
export type InsertAddressDistanceMutationOptions = Apollo.BaseMutationOptions<InsertAddressDistanceMutation, InsertAddressDistanceMutationVariables>;