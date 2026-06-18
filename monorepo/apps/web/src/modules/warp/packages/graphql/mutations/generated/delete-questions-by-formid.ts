import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const DeleteQuestionsByFormIdDocument = gql`
    mutation DeleteQuestionsByFormId($formId: uuid!) {
  update_Question(
    where: {Section: {formId: {_eq: $formId}}}
    _set: {parentQuestionId: null}
  ) {
    affected_rows
  }
  delete_Question(where: {Section: {formId: {_eq: $formId}}}) {
    affected_rows
  }
}
    `;
export type DeleteQuestionsByFormIdMutationFn = Apollo.MutationFunction<Types.DeleteQuestionsByFormIdMutation, Types.DeleteQuestionsByFormIdMutationVariables>;

/**
 * __useDeleteQuestionsByFormIdMutation__
 *
 * To run a mutation, you first call `useDeleteQuestionsByFormIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteQuestionsByFormIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteQuestionsByFormIdMutation, { data, loading, error }] = useDeleteQuestionsByFormIdMutation({
 *   variables: {
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useDeleteQuestionsByFormIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteQuestionsByFormIdMutation, Types.DeleteQuestionsByFormIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteQuestionsByFormIdMutation, Types.DeleteQuestionsByFormIdMutationVariables>(DeleteQuestionsByFormIdDocument, options);
      }
export type DeleteQuestionsByFormIdMutationHookResult = ReturnType<typeof useDeleteQuestionsByFormIdMutation>;
export type DeleteQuestionsByFormIdMutationResult = Apollo.MutationResult<Types.DeleteQuestionsByFormIdMutation>;
export type DeleteQuestionsByFormIdMutationOptions = Apollo.BaseMutationOptions<Types.DeleteQuestionsByFormIdMutation, Types.DeleteQuestionsByFormIdMutationVariables>;