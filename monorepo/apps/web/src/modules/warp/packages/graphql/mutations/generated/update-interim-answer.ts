import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateInterimAnswerDocument = gql`
    mutation updateInterimAnswer($interimAnswerId: uuid!, $answerData: jsonb!) {
  update_Interim_Answer(
    where: {id: {_eq: $interimAnswerId}}
    _set: {data: $answerData}
  ) {
    affected_rows
  }
}
    `;
export type UpdateInterimAnswerMutationFn = Apollo.MutationFunction<Types.UpdateInterimAnswerMutation, Types.UpdateInterimAnswerMutationVariables>;

/**
 * __useUpdateInterimAnswerMutation__
 *
 * To run a mutation, you first call `useUpdateInterimAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInterimAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInterimAnswerMutation, { data, loading, error }] = useUpdateInterimAnswerMutation({
 *   variables: {
 *      interimAnswerId: // value for 'interimAnswerId'
 *      answerData: // value for 'answerData'
 *   },
 * });
 */
export function useUpdateInterimAnswerMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateInterimAnswerMutation, Types.UpdateInterimAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateInterimAnswerMutation, Types.UpdateInterimAnswerMutationVariables>(UpdateInterimAnswerDocument, options);
      }
export type UpdateInterimAnswerMutationHookResult = ReturnType<typeof useUpdateInterimAnswerMutation>;
export type UpdateInterimAnswerMutationResult = Apollo.MutationResult<Types.UpdateInterimAnswerMutation>;
export type UpdateInterimAnswerMutationOptions = Apollo.BaseMutationOptions<Types.UpdateInterimAnswerMutation, Types.UpdateInterimAnswerMutationVariables>;