import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkUpsertAnswerforAiDocument = gql`
    mutation bulkUpsertAnswerforAI($submissionId: uuid, $answerData: [Answer_insert_input!]!) {
  delete_Answer(where: {_and: [{submissionId: {_eq: $submissionId}}]}) {
    affected_rows
  }
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
export type BulkUpsertAnswerforAiMutationFn = Apollo.MutationFunction<Types.BulkUpsertAnswerforAiMutation, Types.BulkUpsertAnswerforAiMutationVariables>;

/**
 * __useBulkUpsertAnswerforAiMutation__
 *
 * To run a mutation, you first call `useBulkUpsertAnswerforAiMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpsertAnswerforAiMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpsertAnswerforAiMutation, { data, loading, error }] = useBulkUpsertAnswerforAiMutation({
 *   variables: {
 *      submissionId: // value for 'submissionId'
 *      answerData: // value for 'answerData'
 *   },
 * });
 */
export function useBulkUpsertAnswerforAiMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkUpsertAnswerforAiMutation, Types.BulkUpsertAnswerforAiMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkUpsertAnswerforAiMutation, Types.BulkUpsertAnswerforAiMutationVariables>(BulkUpsertAnswerforAiDocument, options);
      }
export type BulkUpsertAnswerforAiMutationHookResult = ReturnType<typeof useBulkUpsertAnswerforAiMutation>;
export type BulkUpsertAnswerforAiMutationResult = Apollo.MutationResult<Types.BulkUpsertAnswerforAiMutation>;
export type BulkUpsertAnswerforAiMutationOptions = Apollo.BaseMutationOptions<Types.BulkUpsertAnswerforAiMutation, Types.BulkUpsertAnswerforAiMutationVariables>;