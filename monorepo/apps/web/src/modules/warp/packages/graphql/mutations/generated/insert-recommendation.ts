import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertRecommendationDocument = gql`
    mutation insertRecommendation($recommendationsData: [Interim_Recommendation_insert_input!]!) {
  insert_Interim_Recommendation(objects: $recommendationsData) {
    affected_rows
    returning {
      id
      interim_answer_id
      recommendations
      expectedDate
    }
  }
}
    `;
export type InsertRecommendationMutationFn = Apollo.MutationFunction<Types.InsertRecommendationMutation, Types.InsertRecommendationMutationVariables>;

/**
 * __useInsertRecommendationMutation__
 *
 * To run a mutation, you first call `useInsertRecommendationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertRecommendationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertRecommendationMutation, { data, loading, error }] = useInsertRecommendationMutation({
 *   variables: {
 *      recommendationsData: // value for 'recommendationsData'
 *   },
 * });
 */
export function useInsertRecommendationMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertRecommendationMutation, Types.InsertRecommendationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertRecommendationMutation, Types.InsertRecommendationMutationVariables>(InsertRecommendationDocument, options);
      }
export type InsertRecommendationMutationHookResult = ReturnType<typeof useInsertRecommendationMutation>;
export type InsertRecommendationMutationResult = Apollo.MutationResult<Types.InsertRecommendationMutation>;
export type InsertRecommendationMutationOptions = Apollo.BaseMutationOptions<Types.InsertRecommendationMutation, Types.InsertRecommendationMutationVariables>;