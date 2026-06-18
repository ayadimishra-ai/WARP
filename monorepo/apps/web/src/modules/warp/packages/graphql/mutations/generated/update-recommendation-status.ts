import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateRecommendationStatusDocument = gql`
    mutation updateRecommendationStatus($status: String, $recommendationId: uuid, $isApproved: Boolean) {
  update_Interim_Recommendation(
    _set: {status: $status, isApproved: $isApproved}
    where: {id: {_eq: $recommendationId}}
  ) {
    affected_rows
    returning {
      id
      status
    }
  }
}
    `;
export type UpdateRecommendationStatusMutationFn = Apollo.MutationFunction<Types.UpdateRecommendationStatusMutation, Types.UpdateRecommendationStatusMutationVariables>;

/**
 * __useUpdateRecommendationStatusMutation__
 *
 * To run a mutation, you first call `useUpdateRecommendationStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRecommendationStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRecommendationStatusMutation, { data, loading, error }] = useUpdateRecommendationStatusMutation({
 *   variables: {
 *      status: // value for 'status'
 *      recommendationId: // value for 'recommendationId'
 *      isApproved: // value for 'isApproved'
 *   },
 * });
 */
export function useUpdateRecommendationStatusMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateRecommendationStatusMutation, Types.UpdateRecommendationStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateRecommendationStatusMutation, Types.UpdateRecommendationStatusMutationVariables>(UpdateRecommendationStatusDocument, options);
      }
export type UpdateRecommendationStatusMutationHookResult = ReturnType<typeof useUpdateRecommendationStatusMutation>;
export type UpdateRecommendationStatusMutationResult = Apollo.MutationResult<Types.UpdateRecommendationStatusMutation>;
export type UpdateRecommendationStatusMutationOptions = Apollo.BaseMutationOptions<Types.UpdateRecommendationStatusMutation, Types.UpdateRecommendationStatusMutationVariables>;