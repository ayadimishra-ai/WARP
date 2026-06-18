import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateAnswerIdinInterimAnswerDocument = gql`
    mutation updateAnswerIdinInterimAnswer($InterimAnswerUpdate: [Interim_Answer_updates!]!, $oldSubmissionId: uuid) {
  update_Interim_Answer_many(updates: $InterimAnswerUpdate) {
    returning {
      id
      answerId
    }
  }
  update_Interim_Answer(
    _set: {isViewOnly: true}
    where: {submissionId: {_eq: $oldSubmissionId}}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export type UpdateAnswerIdinInterimAnswerMutationFn = Apollo.MutationFunction<Types.UpdateAnswerIdinInterimAnswerMutation, Types.UpdateAnswerIdinInterimAnswerMutationVariables>;

/**
 * __useUpdateAnswerIdinInterimAnswerMutation__
 *
 * To run a mutation, you first call `useUpdateAnswerIdinInterimAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAnswerIdinInterimAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAnswerIdinInterimAnswerMutation, { data, loading, error }] = useUpdateAnswerIdinInterimAnswerMutation({
 *   variables: {
 *      InterimAnswerUpdate: // value for 'InterimAnswerUpdate'
 *      oldSubmissionId: // value for 'oldSubmissionId'
 *   },
 * });
 */
export function useUpdateAnswerIdinInterimAnswerMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateAnswerIdinInterimAnswerMutation, Types.UpdateAnswerIdinInterimAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateAnswerIdinInterimAnswerMutation, Types.UpdateAnswerIdinInterimAnswerMutationVariables>(UpdateAnswerIdinInterimAnswerDocument, options);
      }
export type UpdateAnswerIdinInterimAnswerMutationHookResult = ReturnType<typeof useUpdateAnswerIdinInterimAnswerMutation>;
export type UpdateAnswerIdinInterimAnswerMutationResult = Apollo.MutationResult<Types.UpdateAnswerIdinInterimAnswerMutation>;
export type UpdateAnswerIdinInterimAnswerMutationOptions = Apollo.BaseMutationOptions<Types.UpdateAnswerIdinInterimAnswerMutation, Types.UpdateAnswerIdinInterimAnswerMutationVariables>;