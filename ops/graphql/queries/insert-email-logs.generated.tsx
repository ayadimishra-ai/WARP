import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InsertEmailLogMutationVariables = Types.Exact<{
  object: Array<Types.EmailLogs_Insert_Input> | Types.EmailLogs_Insert_Input;
}>;


export type InsertEmailLogMutation = { __typename?: 'mutation_root', insert_EmailLogs?: { __typename?: 'EmailLogs_mutation_response', returning: Array<{ __typename?: 'EmailLogs', id: any, status?: string | null, created_at: any }> } | null };


export const InsertEmailLogDocument = gql`
    mutation InsertEmailLog($object: [EmailLogs_insert_input!]!) {
  insert_EmailLogs(objects: $object) {
    returning {
      id
      status
      created_at
    }
  }
}
    `;
export type InsertEmailLogMutationFn = Apollo.MutationFunction<InsertEmailLogMutation, InsertEmailLogMutationVariables>;

/**
 * __useInsertEmailLogMutation__
 *
 * To run a mutation, you first call `useInsertEmailLogMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertEmailLogMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertEmailLogMutation, { data, loading, error }] = useInsertEmailLogMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertEmailLogMutation(baseOptions?: Apollo.MutationHookOptions<InsertEmailLogMutation, InsertEmailLogMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InsertEmailLogMutation, InsertEmailLogMutationVariables>(InsertEmailLogDocument, options);
      }
export type InsertEmailLogMutationHookResult = ReturnType<typeof useInsertEmailLogMutation>;
export type InsertEmailLogMutationResult = Apollo.MutationResult<InsertEmailLogMutation>;
export type InsertEmailLogMutationOptions = Apollo.BaseMutationOptions<InsertEmailLogMutation, InsertEmailLogMutationVariables>;