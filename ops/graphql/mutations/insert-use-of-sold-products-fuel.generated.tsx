import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertUseOfSoldProductsFuelMutationVariables = Types.Exact<{
  objects: Array<Types.GhgUseOfSoldProducts_Fuel_Insert_Input> | Types.GhgUseOfSoldProducts_Fuel_Insert_Input;
}>;


export type InsertUseOfSoldProductsFuelMutation = { __typename?: 'mutation_root', insert_GHGUseOfSoldProducts_Fuel?: { __typename?: 'GHGUseOfSoldProducts_Fuel_mutation_response', returning: Array<{ __typename?: 'GHGUseOfSoldProducts_Fuel', id: any, task_request_id?: any | null }> } | null };


export const InsertUseOfSoldProductsFuelDocument = gql`
    mutation insertUseOfSoldProductsFuel($objects: [GHGUseOfSoldProducts_Fuel_insert_input!]!) {
  insert_GHGUseOfSoldProducts_Fuel(objects: $objects) {
    returning {
      id
      task_request_id
    }
  }
}
    `;
export type InsertUseOfSoldProductsFuelMutationFn = Apollo.MutationFunction<InsertUseOfSoldProductsFuelMutation, InsertUseOfSoldProductsFuelMutationVariables>;

/**
 * __useInsertUseOfSoldProductsFuelMutation__
 *
 * To run a mutation, you first call `useInsertUseOfSoldProductsFuelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertUseOfSoldProductsFuelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertUseOfSoldProductsFuelMutation, { data, loading, error }] = useInsertUseOfSoldProductsFuelMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useInsertUseOfSoldProductsFuelMutation(baseOptions?: Apollo.MutationHookOptions<InsertUseOfSoldProductsFuelMutation, InsertUseOfSoldProductsFuelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertUseOfSoldProductsFuelMutation, InsertUseOfSoldProductsFuelMutationVariables>(InsertUseOfSoldProductsFuelDocument, options);
      }
export type InsertUseOfSoldProductsFuelMutationHookResult = ReturnType<typeof useInsertUseOfSoldProductsFuelMutation>;
export type InsertUseOfSoldProductsFuelMutationResult = Apollo.MutationResult<InsertUseOfSoldProductsFuelMutation>;
export type InsertUseOfSoldProductsFuelMutationOptions = Apollo.BaseMutationOptions<InsertUseOfSoldProductsFuelMutation, InsertUseOfSoldProductsFuelMutationVariables>;