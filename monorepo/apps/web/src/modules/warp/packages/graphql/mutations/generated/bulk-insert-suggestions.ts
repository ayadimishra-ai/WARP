import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertSuggestionsDocument = gql`
    mutation bulkInsertSuggestions($objects: [Suggestions_insert_input!]!) {
  insert_Suggestions(objects: $objects) {
    affected_rows
    returning {
      id
      formFieldId
      formInvitationId
      isSelected
      selectedByUserId
      suggestion
      created_at
    }
  }
}
    `;
export type BulkInsertSuggestionsMutationFn = Apollo.MutationFunction<Types.BulkInsertSuggestionsMutation, Types.BulkInsertSuggestionsMutationVariables>;

/**
 * __useBulkInsertSuggestionsMutation__
 *
 * To run a mutation, you first call `useBulkInsertSuggestionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertSuggestionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertSuggestionsMutation, { data, loading, error }] = useBulkInsertSuggestionsMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useBulkInsertSuggestionsMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertSuggestionsMutation, Types.BulkInsertSuggestionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertSuggestionsMutation, Types.BulkInsertSuggestionsMutationVariables>(BulkInsertSuggestionsDocument, options);
      }
export type BulkInsertSuggestionsMutationHookResult = ReturnType<typeof useBulkInsertSuggestionsMutation>;
export type BulkInsertSuggestionsMutationResult = Apollo.MutationResult<Types.BulkInsertSuggestionsMutation>;
export type BulkInsertSuggestionsMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertSuggestionsMutation, Types.BulkInsertSuggestionsMutationVariables>;