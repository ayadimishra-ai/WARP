import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpsertAnswerDocument = gql`
    mutation upsertAnswer($answerData: [Answer_insert_input!]!, $submissionId: uuid, $questionId: uuid) {
  delete_Answer(
    where: {_and: [{questionId: {_eq: $questionId}}, {submissionId: {_eq: $submissionId}}]}
  ) {
    affected_rows
  }
  insert_Answer(
    objects: $answerData
    on_conflict: {constraint: Answer_submissionId_questionId_formFieldId_key, update_columns: [data]}
  ) {
    affected_rows
  }
}
    `;
export type UpsertAnswerMutationFn = Apollo.MutationFunction<Types.UpsertAnswerMutation, Types.UpsertAnswerMutationVariables>;

/**
 * __useUpsertAnswerMutation__
 *
 * To run a mutation, you first call `useUpsertAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertAnswerMutation, { data, loading, error }] = useUpsertAnswerMutation({
 *   variables: {
 *      answerData: // value for 'answerData'
 *      submissionId: // value for 'submissionId'
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useUpsertAnswerMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpsertAnswerMutation, Types.UpsertAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpsertAnswerMutation, Types.UpsertAnswerMutationVariables>(UpsertAnswerDocument, options);
      }
export type UpsertAnswerMutationHookResult = ReturnType<typeof useUpsertAnswerMutation>;
export type UpsertAnswerMutationResult = Apollo.MutationResult<Types.UpsertAnswerMutation>;
export type UpsertAnswerMutationOptions = Apollo.BaseMutationOptions<Types.UpsertAnswerMutation, Types.UpsertAnswerMutationVariables>;