import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const DeleteInterimFormLogsByQuestionIdsDocument = gql`
    mutation DeleteInterimFormLogsByQuestionIds($questionIds: [uuid!]!) {
  delete_InterimFormLogs(where: {questionId: {_in: $questionIds}}) {
    affected_rows
  }
}
    `;
export type DeleteInterimFormLogsByQuestionIdsMutationFn = Apollo.MutationFunction<Types.DeleteInterimFormLogsByQuestionIdsMutation, Types.DeleteInterimFormLogsByQuestionIdsMutationVariables>;

/**
 * __useDeleteInterimFormLogsByQuestionIdsMutation__
 *
 * To run a mutation, you first call `useDeleteInterimFormLogsByQuestionIdsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteInterimFormLogsByQuestionIdsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteInterimFormLogsByQuestionIdsMutation, { data, loading, error }] = useDeleteInterimFormLogsByQuestionIdsMutation({
 *   variables: {
 *      questionIds: // value for 'questionIds'
 *   },
 * });
 */
export function useDeleteInterimFormLogsByQuestionIdsMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteInterimFormLogsByQuestionIdsMutation, Types.DeleteInterimFormLogsByQuestionIdsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteInterimFormLogsByQuestionIdsMutation, Types.DeleteInterimFormLogsByQuestionIdsMutationVariables>(DeleteInterimFormLogsByQuestionIdsDocument, options);
      }
export type DeleteInterimFormLogsByQuestionIdsMutationHookResult = ReturnType<typeof useDeleteInterimFormLogsByQuestionIdsMutation>;
export type DeleteInterimFormLogsByQuestionIdsMutationResult = Apollo.MutationResult<Types.DeleteInterimFormLogsByQuestionIdsMutation>;
export type DeleteInterimFormLogsByQuestionIdsMutationOptions = Apollo.BaseMutationOptions<Types.DeleteInterimFormLogsByQuestionIdsMutation, Types.DeleteInterimFormLogsByQuestionIdsMutationVariables>;