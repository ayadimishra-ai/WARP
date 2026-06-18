import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkUpdateSuggestionsDocument = gql`
    mutation bulkUpdateSuggestions($suggestionData: [Suggestions_updates!]!) {
  update_Suggestions_many(updates: $suggestionData) {
    returning {
      id
      formInvitationId
      formFieldId
    }
  }
}
    `;
export type BulkUpdateSuggestionsMutationFn = Apollo.MutationFunction<Types.BulkUpdateSuggestionsMutation, Types.BulkUpdateSuggestionsMutationVariables>;

/**
 * __useBulkUpdateSuggestionsMutation__
 *
 * To run a mutation, you first call `useBulkUpdateSuggestionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpdateSuggestionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpdateSuggestionsMutation, { data, loading, error }] = useBulkUpdateSuggestionsMutation({
 *   variables: {
 *      suggestionData: // value for 'suggestionData'
 *   },
 * });
 */
export function useBulkUpdateSuggestionsMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkUpdateSuggestionsMutation, Types.BulkUpdateSuggestionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkUpdateSuggestionsMutation, Types.BulkUpdateSuggestionsMutationVariables>(BulkUpdateSuggestionsDocument, options);
      }
export type BulkUpdateSuggestionsMutationHookResult = ReturnType<typeof useBulkUpdateSuggestionsMutation>;
export type BulkUpdateSuggestionsMutationResult = Apollo.MutationResult<Types.BulkUpdateSuggestionsMutation>;
export type BulkUpdateSuggestionsMutationOptions = Apollo.BaseMutationOptions<Types.BulkUpdateSuggestionsMutation, Types.BulkUpdateSuggestionsMutationVariables>;