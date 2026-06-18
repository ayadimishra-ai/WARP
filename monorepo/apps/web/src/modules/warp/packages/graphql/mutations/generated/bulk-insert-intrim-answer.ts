import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertInterimAnswerDocument = gql`
    mutation bulkInsertInterimAnswer($interinm_input: [Interim_Answer_insert_input!]!) {
  insert_Interim_Answer(
    objects: $interinm_input
    on_conflict: {constraint: Interim_Answer_formFieldId_submissionId_questionId_key, update_columns: [data, updated_by, isDeleted]}
  ) {
    affected_rows
    returning {
      id
      formFieldId
      questionId
      data
    }
  }
}
    `;
export type BulkInsertInterimAnswerMutationFn = Apollo.MutationFunction<Types.BulkInsertInterimAnswerMutation, Types.BulkInsertInterimAnswerMutationVariables>;

/**
 * __useBulkInsertInterimAnswerMutation__
 *
 * To run a mutation, you first call `useBulkInsertInterimAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertInterimAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertInterimAnswerMutation, { data, loading, error }] = useBulkInsertInterimAnswerMutation({
 *   variables: {
 *      interinm_input: // value for 'interinm_input'
 *   },
 * });
 */
export function useBulkInsertInterimAnswerMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertInterimAnswerMutation, Types.BulkInsertInterimAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertInterimAnswerMutation, Types.BulkInsertInterimAnswerMutationVariables>(BulkInsertInterimAnswerDocument, options);
      }
export type BulkInsertInterimAnswerMutationHookResult = ReturnType<typeof useBulkInsertInterimAnswerMutation>;
export type BulkInsertInterimAnswerMutationResult = Apollo.MutationResult<Types.BulkInsertInterimAnswerMutation>;
export type BulkInsertInterimAnswerMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertInterimAnswerMutation, Types.BulkInsertInterimAnswerMutationVariables>;