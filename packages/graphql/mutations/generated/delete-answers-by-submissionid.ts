import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const DeleteAnswersBySubmissionIdDocument = gql`
    mutation DeleteAnswersBySubmissionId($SubmissionId: uuid!) {
  delete_Answer(where: {submissionId: {_eq: $SubmissionId}}) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export type DeleteAnswersBySubmissionIdMutationFn = Apollo.MutationFunction<Types.DeleteAnswersBySubmissionIdMutation, Types.DeleteAnswersBySubmissionIdMutationVariables>;

/**
 * __useDeleteAnswersBySubmissionIdMutation__
 *
 * To run a mutation, you first call `useDeleteAnswersBySubmissionIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAnswersBySubmissionIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAnswersBySubmissionIdMutation, { data, loading, error }] = useDeleteAnswersBySubmissionIdMutation({
 *   variables: {
 *      SubmissionId: // value for 'SubmissionId'
 *   },
 * });
 */
export function useDeleteAnswersBySubmissionIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteAnswersBySubmissionIdMutation, Types.DeleteAnswersBySubmissionIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteAnswersBySubmissionIdMutation, Types.DeleteAnswersBySubmissionIdMutationVariables>(DeleteAnswersBySubmissionIdDocument, options);
      }
export type DeleteAnswersBySubmissionIdMutationHookResult = ReturnType<typeof useDeleteAnswersBySubmissionIdMutation>;
export type DeleteAnswersBySubmissionIdMutationResult = Apollo.MutationResult<Types.DeleteAnswersBySubmissionIdMutation>;
export type DeleteAnswersBySubmissionIdMutationOptions = Apollo.BaseMutationOptions<Types.DeleteAnswersBySubmissionIdMutation, Types.DeleteAnswersBySubmissionIdMutationVariables>;