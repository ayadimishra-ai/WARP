import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertInterimRecommendationDocument = gql`
    mutation bulkInsertInterimRecommendation($interinm_recommendation: [Interim_Recommendation_insert_input!]!) {
  insert_Interim_Recommendation(
    objects: $interinm_recommendation
    on_conflict: {constraint: Interim_Recommendation_pkey}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export type BulkInsertInterimRecommendationMutationFn = Apollo.MutationFunction<Types.BulkInsertInterimRecommendationMutation, Types.BulkInsertInterimRecommendationMutationVariables>;

/**
 * __useBulkInsertInterimRecommendationMutation__
 *
 * To run a mutation, you first call `useBulkInsertInterimRecommendationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertInterimRecommendationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertInterimRecommendationMutation, { data, loading, error }] = useBulkInsertInterimRecommendationMutation({
 *   variables: {
 *      interinm_recommendation: // value for 'interinm_recommendation'
 *   },
 * });
 */
export function useBulkInsertInterimRecommendationMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertInterimRecommendationMutation, Types.BulkInsertInterimRecommendationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertInterimRecommendationMutation, Types.BulkInsertInterimRecommendationMutationVariables>(BulkInsertInterimRecommendationDocument, options);
      }
export type BulkInsertInterimRecommendationMutationHookResult = ReturnType<typeof useBulkInsertInterimRecommendationMutation>;
export type BulkInsertInterimRecommendationMutationResult = Apollo.MutationResult<Types.BulkInsertInterimRecommendationMutation>;
export type BulkInsertInterimRecommendationMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertInterimRecommendationMutation, Types.BulkInsertInterimRecommendationMutationVariables>;