import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateReviewerDetailsMappingDocument = gql`
    mutation UpdateReviewerDetailsMapping($id: uuid!, $currentStatus: String!, $updatedBy: uuid!) {
  update_ReviewerDetailsMapping_by_pk(
    pk_columns: {id: $id}
    _set: {currentStatus: $currentStatus, updated_by: $updatedBy}
  ) {
    id
    currentStatus
    questionId
    FormInvitationId
  }
}
    `;
export type UpdateReviewerDetailsMappingMutationFn = Apollo.MutationFunction<Types.UpdateReviewerDetailsMappingMutation, Types.UpdateReviewerDetailsMappingMutationVariables>;

/**
 * __useUpdateReviewerDetailsMappingMutation__
 *
 * To run a mutation, you first call `useUpdateReviewerDetailsMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateReviewerDetailsMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateReviewerDetailsMappingMutation, { data, loading, error }] = useUpdateReviewerDetailsMappingMutation({
 *   variables: {
 *      id: // value for 'id'
 *      currentStatus: // value for 'currentStatus'
 *      updatedBy: // value for 'updatedBy'
 *   },
 * });
 */
export function useUpdateReviewerDetailsMappingMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateReviewerDetailsMappingMutation, Types.UpdateReviewerDetailsMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateReviewerDetailsMappingMutation, Types.UpdateReviewerDetailsMappingMutationVariables>(UpdateReviewerDetailsMappingDocument, options);
      }
export type UpdateReviewerDetailsMappingMutationHookResult = ReturnType<typeof useUpdateReviewerDetailsMappingMutation>;
export type UpdateReviewerDetailsMappingMutationResult = Apollo.MutationResult<Types.UpdateReviewerDetailsMappingMutation>;
export type UpdateReviewerDetailsMappingMutationOptions = Apollo.BaseMutationOptions<Types.UpdateReviewerDetailsMappingMutation, Types.UpdateReviewerDetailsMappingMutationVariables>;