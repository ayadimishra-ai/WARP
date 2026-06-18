import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateInterimRecommendationByInterimAnswerIdDocument = gql`
    mutation updateInterimRecommendationByInterimAnswerId($interimAnswerId: uuid!, $status: String!) {
  update_Interim_Recommendation(
    where: {interim_answer_id: {_eq: $interimAnswerId}}
    _set: {status: $status}
  ) {
    affected_rows
  }
}
    `;
export type UpdateInterimRecommendationByInterimAnswerIdMutationFn = Apollo.MutationFunction<Types.UpdateInterimRecommendationByInterimAnswerIdMutation, Types.UpdateInterimRecommendationByInterimAnswerIdMutationVariables>;

/**
 * __useUpdateInterimRecommendationByInterimAnswerIdMutation__
 *
 * To run a mutation, you first call `useUpdateInterimRecommendationByInterimAnswerIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInterimRecommendationByInterimAnswerIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInterimRecommendationByInterimAnswerIdMutation, { data, loading, error }] = useUpdateInterimRecommendationByInterimAnswerIdMutation({
 *   variables: {
 *      interimAnswerId: // value for 'interimAnswerId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateInterimRecommendationByInterimAnswerIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateInterimRecommendationByInterimAnswerIdMutation, Types.UpdateInterimRecommendationByInterimAnswerIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateInterimRecommendationByInterimAnswerIdMutation, Types.UpdateInterimRecommendationByInterimAnswerIdMutationVariables>(UpdateInterimRecommendationByInterimAnswerIdDocument, options);
      }
export type UpdateInterimRecommendationByInterimAnswerIdMutationHookResult = ReturnType<typeof useUpdateInterimRecommendationByInterimAnswerIdMutation>;
export type UpdateInterimRecommendationByInterimAnswerIdMutationResult = Apollo.MutationResult<Types.UpdateInterimRecommendationByInterimAnswerIdMutation>;
export type UpdateInterimRecommendationByInterimAnswerIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateInterimRecommendationByInterimAnswerIdMutation, Types.UpdateInterimRecommendationByInterimAnswerIdMutationVariables>;