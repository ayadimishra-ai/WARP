import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertReviewerDetailsMappingDocument = gql`
    mutation InsertReviewerDetailsMapping($questionId: uuid!, $currentStatus: String!, $createdBy: uuid!, $updatedBy: uuid!, $formInvitationId: uuid!) {
  insert_ReviewerDetailsMapping_one(
    object: {questionId: $questionId, currentStatus: $currentStatus, created_by: $createdBy, updated_by: $updatedBy, FormInvitationId: $formInvitationId}
  ) {
    id
    currentStatus
    questionId
    FormInvitationId
  }
}
    `;
export type InsertReviewerDetailsMappingMutationFn = Apollo.MutationFunction<Types.InsertReviewerDetailsMappingMutation, Types.InsertReviewerDetailsMappingMutationVariables>;

/**
 * __useInsertReviewerDetailsMappingMutation__
 *
 * To run a mutation, you first call `useInsertReviewerDetailsMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertReviewerDetailsMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertReviewerDetailsMappingMutation, { data, loading, error }] = useInsertReviewerDetailsMappingMutation({
 *   variables: {
 *      questionId: // value for 'questionId'
 *      currentStatus: // value for 'currentStatus'
 *      createdBy: // value for 'createdBy'
 *      updatedBy: // value for 'updatedBy'
 *      formInvitationId: // value for 'formInvitationId'
 *   },
 * });
 */
export function useInsertReviewerDetailsMappingMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertReviewerDetailsMappingMutation, Types.InsertReviewerDetailsMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertReviewerDetailsMappingMutation, Types.InsertReviewerDetailsMappingMutationVariables>(InsertReviewerDetailsMappingDocument, options);
      }
export type InsertReviewerDetailsMappingMutationHookResult = ReturnType<typeof useInsertReviewerDetailsMappingMutation>;
export type InsertReviewerDetailsMappingMutationResult = Apollo.MutationResult<Types.InsertReviewerDetailsMappingMutation>;
export type InsertReviewerDetailsMappingMutationOptions = Apollo.BaseMutationOptions<Types.InsertReviewerDetailsMappingMutation, Types.InsertReviewerDetailsMappingMutationVariables>;