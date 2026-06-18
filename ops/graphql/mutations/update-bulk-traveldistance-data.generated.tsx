import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateBulkTravelDistanceMutationVariables = Types.Exact<{
  TravelDistanceUpdate: Array<Types.TravelDistance_Updates> | Types.TravelDistance_Updates;
}>;


export type UpdateBulkTravelDistanceMutation = { __typename?: 'mutation_root', update_TravelDistance_many?: Array<{ __typename?: 'TravelDistance_mutation_response', returning: Array<{ __typename?: 'TravelDistance', id: any }> } | null> | null };


export const UpdateBulkTravelDistanceDocument = gql`
    mutation updateBulkTravelDistance($TravelDistanceUpdate: [TravelDistance_updates!]!) {
  update_TravelDistance_many(updates: $TravelDistanceUpdate) {
    returning {
      id
    }
  }
}
    `;
export type UpdateBulkTravelDistanceMutationFn = Apollo.MutationFunction<UpdateBulkTravelDistanceMutation, UpdateBulkTravelDistanceMutationVariables>;

/**
 * __useUpdateBulkTravelDistanceMutation__
 *
 * To run a mutation, you first call `useUpdateBulkTravelDistanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBulkTravelDistanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBulkTravelDistanceMutation, { data, loading, error }] = useUpdateBulkTravelDistanceMutation({
 *   variables: {
 *      TravelDistanceUpdate: // value for 'TravelDistanceUpdate'
 *   },
 * });
 */
export function useUpdateBulkTravelDistanceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateBulkTravelDistanceMutation, UpdateBulkTravelDistanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateBulkTravelDistanceMutation, UpdateBulkTravelDistanceMutationVariables>(UpdateBulkTravelDistanceDocument, options);
      }
export type UpdateBulkTravelDistanceMutationHookResult = ReturnType<typeof useUpdateBulkTravelDistanceMutation>;
export type UpdateBulkTravelDistanceMutationResult = Apollo.MutationResult<UpdateBulkTravelDistanceMutation>;
export type UpdateBulkTravelDistanceMutationOptions = Apollo.BaseMutationOptions<UpdateBulkTravelDistanceMutation, UpdateBulkTravelDistanceMutationVariables>;