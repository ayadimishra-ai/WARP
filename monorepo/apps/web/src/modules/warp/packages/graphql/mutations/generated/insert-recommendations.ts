import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertRecommendationsDocument = gql`
    mutation insertRecommendations($answerData: [Interim_Answer_insert_input!]!, $recommendationsData: [Interim_Recommendation_insert_input!]!) {
  insert_Interim_Answer(
    objects: $answerData
    on_conflict: {constraint: Interim_Answer_formFieldId_submissionId_questionId_key, update_columns: [data]}
  ) {
    affected_rows
    returning {
      id
      Interim_Recommendations {
        id
      }
    }
  }
  insert_Interim_Recommendation(objects: $recommendationsData) {
    affected_rows
    returning {
      id
      interim_answer_id
    }
  }
}
    `;
export type InsertRecommendationsMutationFn = Apollo.MutationFunction<Types.InsertRecommendationsMutation, Types.InsertRecommendationsMutationVariables>;

/**
 * __useInsertRecommendationsMutation__
 *
 * To run a mutation, you first call `useInsertRecommendationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertRecommendationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertRecommendationsMutation, { data, loading, error }] = useInsertRecommendationsMutation({
 *   variables: {
 *      answerData: // value for 'answerData'
 *      recommendationsData: // value for 'recommendationsData'
 *   },
 * });
 */
export function useInsertRecommendationsMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertRecommendationsMutation, Types.InsertRecommendationsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertRecommendationsMutation, Types.InsertRecommendationsMutationVariables>(InsertRecommendationsDocument, options);
      }
export type InsertRecommendationsMutationHookResult = ReturnType<typeof useInsertRecommendationsMutation>;
export type InsertRecommendationsMutationResult = Apollo.MutationResult<Types.InsertRecommendationsMutation>;
export type InsertRecommendationsMutationOptions = Apollo.BaseMutationOptions<Types.InsertRecommendationsMutation, Types.InsertRecommendationsMutationVariables>;