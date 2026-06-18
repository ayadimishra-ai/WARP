import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkUpdateInterimRecommendationByInterimAnswerIdDocument = gql`
    mutation bulkUpdateInterimRecommendationByInterimAnswerId($Interim_Recommendation: [Interim_Recommendation_updates!]!) {
  update_Interim_Recommendation_many(updates: $Interim_Recommendation) {
    returning {
      id
      status
    }
  }
}
    `;
export type BulkUpdateInterimRecommendationByInterimAnswerIdMutationFn = Apollo.MutationFunction<Types.BulkUpdateInterimRecommendationByInterimAnswerIdMutation, Types.BulkUpdateInterimRecommendationByInterimAnswerIdMutationVariables>;

/**
 * __useBulkUpdateInterimRecommendationByInterimAnswerIdMutation__
 *
 * To run a mutation, you first call `useBulkUpdateInterimRecommendationByInterimAnswerIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpdateInterimRecommendationByInterimAnswerIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpdateInterimRecommendationByInterimAnswerIdMutation, { data, loading, error }] = useBulkUpdateInterimRecommendationByInterimAnswerIdMutation({
 *   variables: {
 *      Interim_Recommendation: // value for 'Interim_Recommendation'
 *   },
 * });
 */
export function useBulkUpdateInterimRecommendationByInterimAnswerIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkUpdateInterimRecommendationByInterimAnswerIdMutation, Types.BulkUpdateInterimRecommendationByInterimAnswerIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkUpdateInterimRecommendationByInterimAnswerIdMutation, Types.BulkUpdateInterimRecommendationByInterimAnswerIdMutationVariables>(BulkUpdateInterimRecommendationByInterimAnswerIdDocument, options);
      }
export type BulkUpdateInterimRecommendationByInterimAnswerIdMutationHookResult = ReturnType<typeof useBulkUpdateInterimRecommendationByInterimAnswerIdMutation>;
export type BulkUpdateInterimRecommendationByInterimAnswerIdMutationResult = Apollo.MutationResult<Types.BulkUpdateInterimRecommendationByInterimAnswerIdMutation>;
export type BulkUpdateInterimRecommendationByInterimAnswerIdMutationOptions = Apollo.BaseMutationOptions<Types.BulkUpdateInterimRecommendationByInterimAnswerIdMutation, Types.BulkUpdateInterimRecommendationByInterimAnswerIdMutationVariables>;