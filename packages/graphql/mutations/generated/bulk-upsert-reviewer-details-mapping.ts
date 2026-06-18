import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkUpsertReviewerDetailsMappingDocument = gql`
    mutation BulkUpsertReviewerDetailsMapping($objects: [ReviewerDetailsMapping_insert_input!]!) {
  insert_ReviewerDetailsMapping(
    objects: $objects
    on_conflict: {constraint: ReviewerDetailsMapping_pkey, update_columns: [currentStatus, updated_by]}
  ) {
    affected_rows
    returning {
      id
      currentStatus
      questionId
      FormInvitationId
    }
  }
}
    `;
export type BulkUpsertReviewerDetailsMappingMutationFn = Apollo.MutationFunction<Types.BulkUpsertReviewerDetailsMappingMutation, Types.BulkUpsertReviewerDetailsMappingMutationVariables>;

/**
 * __useBulkUpsertReviewerDetailsMappingMutation__
 *
 * To run a mutation, you first call `useBulkUpsertReviewerDetailsMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpsertReviewerDetailsMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpsertReviewerDetailsMappingMutation, { data, loading, error }] = useBulkUpsertReviewerDetailsMappingMutation({
 *   variables: {
 *      objects: // value for 'objects'
 *   },
 * });
 */
export function useBulkUpsertReviewerDetailsMappingMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkUpsertReviewerDetailsMappingMutation, Types.BulkUpsertReviewerDetailsMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkUpsertReviewerDetailsMappingMutation, Types.BulkUpsertReviewerDetailsMappingMutationVariables>(BulkUpsertReviewerDetailsMappingDocument, options);
      }
export type BulkUpsertReviewerDetailsMappingMutationHookResult = ReturnType<typeof useBulkUpsertReviewerDetailsMappingMutation>;
export type BulkUpsertReviewerDetailsMappingMutationResult = Apollo.MutationResult<Types.BulkUpsertReviewerDetailsMappingMutation>;
export type BulkUpsertReviewerDetailsMappingMutationOptions = Apollo.BaseMutationOptions<Types.BulkUpsertReviewerDetailsMappingMutation, Types.BulkUpsertReviewerDetailsMappingMutationVariables>;