import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertQuestionsDocument = gql`
    mutation BulkInsertQuestions($objects: [Question_insert_input!]!) {
  insert_Question(
    objects: $objects
    on_conflict: {constraint: Question_pkey, update_columns: [sectionId, key, tags, content, weightage]}
  ) {
    affected_rows
    returning {
      id
      key
      content
      sectionId
      tags
      weightage
    }
  }
}
    `;
export type BulkInsertQuestionsMutationFn = Apollo.MutationFunction<Types.BulkInsertQuestionsMutation, Types.BulkInsertQuestionsMutationVariables>;

/**
 * __useBulkInsertQuestionsMutation__
 *
 * To run a mutation, you first call `useBulkInsertQuestionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertQuestionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertQuestionsMutation, { data, loading, error }] = useBulkInsertQuestionsMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useBulkInsertQuestionsMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertQuestionsMutation, Types.BulkInsertQuestionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertQuestionsMutation, Types.BulkInsertQuestionsMutationVariables>(BulkInsertQuestionsDocument, options);
      }
export type BulkInsertQuestionsMutationHookResult = ReturnType<typeof useBulkInsertQuestionsMutation>;
export type BulkInsertQuestionsMutationResult = Apollo.MutationResult<Types.BulkInsertQuestionsMutation>;
export type BulkInsertQuestionsMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertQuestionsMutation, Types.BulkInsertQuestionsMutationVariables>;