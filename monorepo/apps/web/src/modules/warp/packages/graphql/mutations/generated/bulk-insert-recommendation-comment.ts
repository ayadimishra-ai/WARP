import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertRecommendationCommentDocument = gql`
    mutation bulkInsertRecommendationComment($interim_recommendation: [Interim_Recommendation_insert_input!]!, $interim_comments: [Interim_Comments_insert_input!]!) {
  insert_Interim_Recommendation(
    objects: $interim_recommendation
    on_conflict: {constraint: Interim_Recommendation_pkey}
  ) {
    affected_rows
    returning {
      id
    }
  }
  insert_Interim_Comments(
    objects: $interim_comments
    on_conflict: {constraint: Interim_Comments_pkey}
  ) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export type BulkInsertRecommendationCommentMutationFn = Apollo.MutationFunction<Types.BulkInsertRecommendationCommentMutation, Types.BulkInsertRecommendationCommentMutationVariables>;

/**
 * __useBulkInsertRecommendationCommentMutation__
 *
 * To run a mutation, you first call `useBulkInsertRecommendationCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertRecommendationCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertRecommendationCommentMutation, { data, loading, error }] = useBulkInsertRecommendationCommentMutation({
 *   variables: {
 *      interim_recommendation: // value for 'interim_recommendation'
 *      interim_comments: // value for 'interim_comments'
 *   },
 * });
 */
export function useBulkInsertRecommendationCommentMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertRecommendationCommentMutation, Types.BulkInsertRecommendationCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertRecommendationCommentMutation, Types.BulkInsertRecommendationCommentMutationVariables>(BulkInsertRecommendationCommentDocument, options);
      }
export type BulkInsertRecommendationCommentMutationHookResult = ReturnType<typeof useBulkInsertRecommendationCommentMutation>;
export type BulkInsertRecommendationCommentMutationResult = Apollo.MutationResult<Types.BulkInsertRecommendationCommentMutation>;
export type BulkInsertRecommendationCommentMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertRecommendationCommentMutation, Types.BulkInsertRecommendationCommentMutationVariables>;