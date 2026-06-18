import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertQuestionnaireLogDocument = gql`
    mutation InsertQuestionnaireLog($formid: uuid!, $form_title: String, $form_description: String, $number_of_questions: String, $time_in_minutes: String, $form_type: String, $file_url: String, $created_by: uuid!, $event_type: String!) {
  insert_newformslogs_one(
    object: {formid: $formid, form_title: $form_title, form_description: $form_description, number_of_questions: $number_of_questions, time_in_minutes: $time_in_minutes, form_type: $form_type, file_url: $file_url, created_by: $created_by, event_type: $event_type}
  ) {
    id
    formid
    form_title
    form_description
    number_of_questions
    time_in_minutes
    form_type
    file_url
    created_by
    created_at
    event_type
  }
}
    `;
export type InsertQuestionnaireLogMutationFn = Apollo.MutationFunction<Types.InsertQuestionnaireLogMutation, Types.InsertQuestionnaireLogMutationVariables>;

/**
 * __useInsertQuestionnaireLogMutation__
 *
 * To run a mutation, you first call `useInsertQuestionnaireLogMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertQuestionnaireLogMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertQuestionnaireLogMutation, { data, loading, error }] = useInsertQuestionnaireLogMutation({
 *   variables: {
 *      formid: // value for 'formid'
 *      form_title: // value for 'form_title'
 *      form_description: // value for 'form_description'
 *      number_of_questions: // value for 'number_of_questions'
 *      time_in_minutes: // value for 'time_in_minutes'
 *      form_type: // value for 'form_type'
 *      file_url: // value for 'file_url'
 *      created_by: // value for 'created_by'
 *      event_type: // value for 'event_type'
 *   },
 * });
 */
export function useInsertQuestionnaireLogMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertQuestionnaireLogMutation, Types.InsertQuestionnaireLogMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertQuestionnaireLogMutation, Types.InsertQuestionnaireLogMutationVariables>(InsertQuestionnaireLogDocument, options);
      }
export type InsertQuestionnaireLogMutationHookResult = ReturnType<typeof useInsertQuestionnaireLogMutation>;
export type InsertQuestionnaireLogMutationResult = Apollo.MutationResult<Types.InsertQuestionnaireLogMutation>;
export type InsertQuestionnaireLogMutationOptions = Apollo.BaseMutationOptions<Types.InsertQuestionnaireLogMutation, Types.InsertQuestionnaireLogMutationVariables>;