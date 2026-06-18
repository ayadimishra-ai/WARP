import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkUpsertAnswerDocument = gql`
    mutation bulkUpsertAnswer($submissionId: uuid, $answerData: [Answer_insert_input!]!) {
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
export type BulkUpsertAnswerMutationFn = Apollo.MutationFunction<Types.BulkUpsertAnswerMutation, Types.BulkUpsertAnswerMutationVariables>;

/**
 * __useBulkUpsertAnswerMutation__
 *
 * To run a mutation, you first call `useBulkUpsertAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpsertAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpsertAnswerMutation, { data, loading, error }] = useBulkUpsertAnswerMutation({
 *   variables: {
 *      submissionId: // value for 'submissionId'
 *      answerData: // value for 'answerData'
 *   },
 * });
 */
export function useBulkUpsertAnswerMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkUpsertAnswerMutation, Types.BulkUpsertAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkUpsertAnswerMutation, Types.BulkUpsertAnswerMutationVariables>(BulkUpsertAnswerDocument, options);
      }
export type BulkUpsertAnswerMutationHookResult = ReturnType<typeof useBulkUpsertAnswerMutation>;
export type BulkUpsertAnswerMutationResult = Apollo.MutationResult<Types.BulkUpsertAnswerMutation>;
export type BulkUpsertAnswerMutationOptions = Apollo.BaseMutationOptions<Types.BulkUpsertAnswerMutation, Types.BulkUpsertAnswerMutationVariables>;