import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertTaskRequestMutationVariables = Types.Exact<{
  input: Array<Types.TaskRequest_Insert_Input> | Types.TaskRequest_Insert_Input;
}>;


export type InsertTaskRequestMutation = { __typename?: 'mutation_root', insert_TaskRequest?: { __typename?: 'TaskRequest_mutation_response', returning: Array<{ __typename?: 'TaskRequest', id: any, organization_address_id: any, month: string, year?: number | null, status?: string | null, metadata?: any | null, is_deleted: boolean }> } | null };


export const InsertTaskRequestDocument = gql`
    mutation InsertTaskRequest($input: [TaskRequest_insert_input!]!) {
  insert_TaskRequest(objects: $input) {
    returning {
      id
      organization_address_id
      month
      year
      status
      metadata
      is_deleted
    }
  }
}
    `;
export type InsertTaskRequestMutationFn = Apollo.MutationFunction<InsertTaskRequestMutation, InsertTaskRequestMutationVariables>;

/**
 * __useInsertTaskRequestMutation__
 *
 * To run a mutation, you first call `useInsertTaskRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertTaskRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertTaskRequestMutation, { data, loading, error }] = useInsertTaskRequestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useInsertTaskRequestMutation(baseOptions?: Apollo.MutationHookOptions<InsertTaskRequestMutation, InsertTaskRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertTaskRequestMutation, InsertTaskRequestMutationVariables>(InsertTaskRequestDocument, options);
      }
export type InsertTaskRequestMutationHookResult = ReturnType<typeof useInsertTaskRequestMutation>;
export type InsertTaskRequestMutationResult = Apollo.MutationResult<InsertTaskRequestMutation>;
export type InsertTaskRequestMutationOptions = Apollo.BaseMutationOptions<InsertTaskRequestMutation, InsertTaskRequestMutationVariables>;