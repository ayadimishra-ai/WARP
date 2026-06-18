import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertUseOfSoldProductsRefrigerantMutationVariables = Types.Exact<{
  objects: Array<Types.GhgUseOfSoldProducts_Refrigerant_Insert_Input> | Types.GhgUseOfSoldProducts_Refrigerant_Insert_Input;
}>;


export type InsertUseOfSoldProductsRefrigerantMutation = { __typename?: 'mutation_root', insert_GHGUseOfSoldProducts_Refrigerant?: { __typename?: 'GHGUseOfSoldProducts_Refrigerant_mutation_response', returning: Array<{ __typename?: 'GHGUseOfSoldProducts_Refrigerant', id: any, task_request_id?: any | null }> } | null };


export const InsertUseOfSoldProductsRefrigerantDocument = gql`
    mutation insertUseOfSoldProductsRefrigerant($objects: [GHGUseOfSoldProducts_Refrigerant_insert_input!]!) {
  insert_GHGUseOfSoldProducts_Refrigerant(objects: $objects) {
    returning {
      id
      task_request_id
    }
  }
}
    `;
export type InsertUseOfSoldProductsRefrigerantMutationFn = Apollo.MutationFunction<InsertUseOfSoldProductsRefrigerantMutation, InsertUseOfSoldProductsRefrigerantMutationVariables>;

/**
 * __useInsertUseOfSoldProductsRefrigerantMutation__
 *
 * To run a mutation, you first call `useInsertUseOfSoldProductsRefrigerantMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertUseOfSoldProductsRefrigerantMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertUseOfSoldProductsRefrigerantMutation, { data, loading, error }] = useInsertUseOfSoldProductsRefrigerantMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useInsertUseOfSoldProductsRefrigerantMutation(baseOptions?: Apollo.MutationHookOptions<InsertUseOfSoldProductsRefrigerantMutation, InsertUseOfSoldProductsRefrigerantMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertUseOfSoldProductsRefrigerantMutation, InsertUseOfSoldProductsRefrigerantMutationVariables>(InsertUseOfSoldProductsRefrigerantDocument, options);
      }
export type InsertUseOfSoldProductsRefrigerantMutationHookResult = ReturnType<typeof useInsertUseOfSoldProductsRefrigerantMutation>;
export type InsertUseOfSoldProductsRefrigerantMutationResult = Apollo.MutationResult<InsertUseOfSoldProductsRefrigerantMutation>;
export type InsertUseOfSoldProductsRefrigerantMutationOptions = Apollo.BaseMutationOptions<InsertUseOfSoldProductsRefrigerantMutation, InsertUseOfSoldProductsRefrigerantMutationVariables>;