import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertIntoInterimCommentsDocument = gql`
    mutation insertIntoInterimComments($interim_recommendation_id: uuid, $comments: String, $upload_document: String!, $filename: String!, $userId: uuid, $status: String, $recommendationId: uuid, $isApproved: Boolean, $invitationId: uuid) {
  insert_Interim_Comments(
    on_conflict: {constraint: Interim_Comments_pkey}
    objects: {comments: $comments, filename: $filename, upload_document: $upload_document, interim_recommendation_id: $interim_recommendation_id, created_by: $userId, updated_by: $userId, invitationId: $invitationId}
  ) {
    returning {
      id
      comments
    }
  }
  update_Interim_Recommendation(
    _set: {status: $status, isApproved: $isApproved, updated_at: now}
    where: {id: {_eq: $recommendationId}}
  ) {
    affected_rows
  }
}
    `;
export type InsertIntoInterimCommentsMutationFn = Apollo.MutationFunction<Types.InsertIntoInterimCommentsMutation, Types.InsertIntoInterimCommentsMutationVariables>;

/**
 * __useInsertIntoInterimCommentsMutation__
 *
 * To run a mutation, you first call `useInsertIntoInterimCommentsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertIntoInterimCommentsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertIntoInterimCommentsMutation, { data, loading, error }] = useInsertIntoInterimCommentsMutation({
 *   variables: {
 *      interim_recommendation_id: // value for 'interim_recommendation_id'
 *      comments: // value for 'comments'
 *      upload_document: // value for 'upload_document'
 *      filename: // value for 'filename'
 *      userId: // value for 'userId'
 *      status: // value for 'status'
 *      recommendationId: // value for 'recommendationId'
 *      isApproved: // value for 'isApproved'
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useInsertIntoInterimCommentsMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertIntoInterimCommentsMutation, Types.InsertIntoInterimCommentsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertIntoInterimCommentsMutation, Types.InsertIntoInterimCommentsMutationVariables>(InsertIntoInterimCommentsDocument, options);
      }
export type InsertIntoInterimCommentsMutationHookResult = ReturnType<typeof useInsertIntoInterimCommentsMutation>;
export type InsertIntoInterimCommentsMutationResult = Apollo.MutationResult<Types.InsertIntoInterimCommentsMutation>;
export type InsertIntoInterimCommentsMutationOptions = Apollo.BaseMutationOptions<Types.InsertIntoInterimCommentsMutation, Types.InsertIntoInterimCommentsMutationVariables>;