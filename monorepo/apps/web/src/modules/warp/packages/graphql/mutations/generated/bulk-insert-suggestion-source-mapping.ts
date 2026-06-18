import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertSuggestionSourceMappingDocument = gql`
    mutation bulkInsertSuggestionSourceMapping($objects: [SuggestionSourceMapping_insert_input!]!) {
  insert_SuggestionSourceMapping(objects: $objects) {
    affected_rows
    returning {
      id
      suggestionId
      sourceId
      suggestionPageNo
      suggestionInfoContent
      created_at
    }
  }
}
    `;
export type BulkInsertSuggestionSourceMappingMutationFn = Apollo.MutationFunction<Types.BulkInsertSuggestionSourceMappingMutation, Types.BulkInsertSuggestionSourceMappingMutationVariables>;

/**
 * __useBulkInsertSuggestionSourceMappingMutation__
 *
 * To run a mutation, you first call `useBulkInsertSuggestionSourceMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertSuggestionSourceMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertSuggestionSourceMappingMutation, { data, loading, error }] = useBulkInsertSuggestionSourceMappingMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useBulkInsertSuggestionSourceMappingMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertSuggestionSourceMappingMutation, Types.BulkInsertSuggestionSourceMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertSuggestionSourceMappingMutation, Types.BulkInsertSuggestionSourceMappingMutationVariables>(BulkInsertSuggestionSourceMappingDocument, options);
      }
export type BulkInsertSuggestionSourceMappingMutationHookResult = ReturnType<typeof useBulkInsertSuggestionSourceMappingMutation>;
export type BulkInsertSuggestionSourceMappingMutationResult = Apollo.MutationResult<Types.BulkInsertSuggestionSourceMappingMutation>;
export type BulkInsertSuggestionSourceMappingMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertSuggestionSourceMappingMutation, Types.BulkInsertSuggestionSourceMappingMutationVariables>;