import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertFormDetailsOneDocument = gql`
    mutation InsertFormDetailsOne($formid: uuid!, $framework: String!, $focusArea: jsonb!, $timeInMinutes: Int!, $bodyTemplate: String!, $questions: Int!) {
  insert_FormDetails_one(
    object: {formId: $formid, framework: $framework, focusArea: $focusArea, timeInMinutes: $timeInMinutes, bodyTemplate: $bodyTemplate, questions: $questions}
  ) {
    id
    formId
  }
}
    `;
export type InsertFormDetailsOneMutationFn = Apollo.MutationFunction<Types.InsertFormDetailsOneMutation, Types.InsertFormDetailsOneMutationVariables>;

/**
 * __useInsertFormDetailsOneMutation__
 *
 * To run a mutation, you first call `useInsertFormDetailsOneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertFormDetailsOneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertFormDetailsOneMutation, { data, loading, error }] = useInsertFormDetailsOneMutation({
 *   variables: {
 *      formid: // value for 'formid'
 *      framework: // value for 'framework'
 *      focusArea: // value for 'focusArea'
 *      timeInMinutes: // value for 'timeInMinutes'
 *      bodyTemplate: // value for 'bodyTemplate'
 *      questions: // value for 'questions'
 *   },
 * });
 */
export function useInsertFormDetailsOneMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertFormDetailsOneMutation, Types.InsertFormDetailsOneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertFormDetailsOneMutation, Types.InsertFormDetailsOneMutationVariables>(InsertFormDetailsOneDocument, options);
      }
export type InsertFormDetailsOneMutationHookResult = ReturnType<typeof useInsertFormDetailsOneMutation>;
export type InsertFormDetailsOneMutationResult = Apollo.MutationResult<Types.InsertFormDetailsOneMutation>;
export type InsertFormDetailsOneMutationOptions = Apollo.BaseMutationOptions<Types.InsertFormDetailsOneMutation, Types.InsertFormDetailsOneMutationVariables>;