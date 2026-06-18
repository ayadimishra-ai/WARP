import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateInterimAnswerByQuestionIdAndSubmissionIdDocument = gql`
    mutation updateInterimAnswerByQuestionIdAndSubmissionId($Interim_AnswerUpdate: [Interim_Answer_updates!]!) {
  update_Interim_Answer_many(updates: $Interim_AnswerUpdate) {
    returning {
      id
      questionId
      submissionId
      status
      data
      interim_answer_id
      FormField {
        interface
      }
      Interim_Recommendations {
        id
        status
        answeroption
      }
      Interim_Answer {
        id
        interim_answer_id
        Interim_Recommendations {
          id
          status
          answeroption
        }
      }
    }
  }
}
    `;
export type UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationFn = Apollo.MutationFunction<Types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutation, Types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationVariables>;

/**
 * __useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation__
 *
 * To run a mutation, you first call `useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInterimAnswerByQuestionIdAndSubmissionIdMutation, { data, loading, error }] = useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation({
 *   variables: {
 *      Interim_AnswerUpdate: // value for 'Interim_AnswerUpdate'
 *   },
 * });
 */
export function useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutation, Types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutation, Types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationVariables>(UpdateInterimAnswerByQuestionIdAndSubmissionIdDocument, options);
      }
export type UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationHookResult = ReturnType<typeof useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation>;
export type UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationResult = Apollo.MutationResult<Types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutation>;
export type UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutation, Types.UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationVariables>;