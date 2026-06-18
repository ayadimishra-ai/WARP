import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertAnswerDocument = gql`
    mutation bulkInsertAnswer($answerData: [Answer_insert_input!]!) {
  insert_Answer(objects: $answerData, on_conflict: {constraint: Answer_pkey}) {
    affected_rows
    returning {
      id
      submissionId
      formFieldId
    }
  }
}
    `;
export type BulkInsertAnswerMutationFn = Apollo.MutationFunction<Types.BulkInsertAnswerMutation, Types.BulkInsertAnswerMutationVariables>;

/**
 * __useBulkInsertAnswerMutation__
 *
 * To run a mutation, you first call `useBulkInsertAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertAnswerMutation, { data, loading, error }] = useBulkInsertAnswerMutation({
 *   variables: {
 *      answerData: // value for 'answerData'
 *   },
 * });
 */
export function useBulkInsertAnswerMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertAnswerMutation, Types.BulkInsertAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertAnswerMutation, Types.BulkInsertAnswerMutationVariables>(BulkInsertAnswerDocument, options);
      }
export type BulkInsertAnswerMutationHookResult = ReturnType<typeof useBulkInsertAnswerMutation>;
export type BulkInsertAnswerMutationResult = Apollo.MutationResult<Types.BulkInsertAnswerMutation>;
export type BulkInsertAnswerMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertAnswerMutation, Types.BulkInsertAnswerMutationVariables>;