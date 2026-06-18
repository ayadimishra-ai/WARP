import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateAnswerDocument = gql`
    mutation updateAnswer($AnswerUpdate: [Answer_updates!]!) {
  update_Answer_many(updates: $AnswerUpdate) {
    returning {
      id
      questionId
      submissionId
    }
  }
}
    `;
export type UpdateAnswerMutationFn = Apollo.MutationFunction<Types.UpdateAnswerMutation, Types.UpdateAnswerMutationVariables>;

/**
 * __useUpdateAnswerMutation__
 *
 * To run a mutation, you first call `useUpdateAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAnswerMutation, { data, loading, error }] = useUpdateAnswerMutation({
 *   variables: {
 *      AnswerUpdate: // value for 'AnswerUpdate'
 *   },
 * });
 */
export function useUpdateAnswerMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateAnswerMutation, Types.UpdateAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateAnswerMutation, Types.UpdateAnswerMutationVariables>(UpdateAnswerDocument, options);
      }
export type UpdateAnswerMutationHookResult = ReturnType<typeof useUpdateAnswerMutation>;
export type UpdateAnswerMutationResult = Apollo.MutationResult<Types.UpdateAnswerMutation>;
export type UpdateAnswerMutationOptions = Apollo.BaseMutationOptions<Types.UpdateAnswerMutation, Types.UpdateAnswerMutationVariables>;