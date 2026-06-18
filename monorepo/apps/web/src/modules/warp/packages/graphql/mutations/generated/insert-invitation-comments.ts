import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertFormInvitationCommentDocument = gql`
    mutation InsertFormInvitationComment($companyId: uuid, $content: String, $invitationId: uuid, $userId: uuid, $formFieldId: uuid!, $status: String) {
  insert_InvitationComment(
    on_conflict: {constraint: InvitationComment_pkey}
    objects: {companyId: $companyId, content: $content, invitationId: $invitationId, userId: $userId, formFieldId: $formFieldId}
  ) {
    returning {
      id
      content
      FormInvitation {
        InvitationComments_aggregate(where: {formFieldId: {_eq: $formFieldId}}) {
          aggregate {
            count
          }
        }
      }
    }
  }
  update_FormInvitation(
    where: {companyId: {_eq: $companyId}, id: {_eq: $invitationId}}
    _set: {status: $status, updated_by: $userId, updated_at: "now()"}
  ) {
    returning {
      id
    }
  }
}
    `;
export type InsertFormInvitationCommentMutationFn = Apollo.MutationFunction<Types.InsertFormInvitationCommentMutation, Types.InsertFormInvitationCommentMutationVariables>;

/**
 * __useInsertFormInvitationCommentMutation__
 *
 * To run a mutation, you first call `useInsertFormInvitationCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertFormInvitationCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertFormInvitationCommentMutation, { data, loading, error }] = useInsertFormInvitationCommentMutation({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      content: // value for 'content'
 *      invitationId: // value for 'invitationId'
 *      userId: // value for 'userId'
 *      formFieldId: // value for 'formFieldId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useInsertFormInvitationCommentMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertFormInvitationCommentMutation, Types.InsertFormInvitationCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertFormInvitationCommentMutation, Types.InsertFormInvitationCommentMutationVariables>(InsertFormInvitationCommentDocument, options);
      }
export type InsertFormInvitationCommentMutationHookResult = ReturnType<typeof useInsertFormInvitationCommentMutation>;
export type InsertFormInvitationCommentMutationResult = Apollo.MutationResult<Types.InsertFormInvitationCommentMutation>;
export type InsertFormInvitationCommentMutationOptions = Apollo.BaseMutationOptions<Types.InsertFormInvitationCommentMutation, Types.InsertFormInvitationCommentMutationVariables>;