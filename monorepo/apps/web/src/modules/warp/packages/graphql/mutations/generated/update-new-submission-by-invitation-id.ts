import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateNewSubmissionByInvitationIdDocument = gql`
    mutation updateNewSubmissionByInvitationId($invitationId: uuid!, $formId: uuid!, $metadata: jsonb!, $companyId: uuid!, $isManufacturing: Boolean!) {
  update_FormInvitation(
    _set: {formId: $formId}
    where: {_and: [{id: {_eq: $invitationId}}]}
  ) {
    affected_rows
  }
  update_Company(
    _set: {metadata: $metadata, IsManufacturing: $isManufacturing}
    where: {_and: [{id: {_eq: $companyId}}]}
  ) {
    affected_rows
  }
  update_CompanyFormFundtype(
    where: {companyId: {_eq: $companyId}}
    _set: {formId: $formId}
  ) {
    affected_rows
  }
}
    `;
export type UpdateNewSubmissionByInvitationIdMutationFn = Apollo.MutationFunction<Types.UpdateNewSubmissionByInvitationIdMutation, Types.UpdateNewSubmissionByInvitationIdMutationVariables>;

/**
 * __useUpdateNewSubmissionByInvitationIdMutation__
 *
 * To run a mutation, you first call `useUpdateNewSubmissionByInvitationIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNewSubmissionByInvitationIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNewSubmissionByInvitationIdMutation, { data, loading, error }] = useUpdateNewSubmissionByInvitationIdMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      formId: // value for 'formId'
 *      metadata: // value for 'metadata'
 *      companyId: // value for 'companyId'
 *      isManufacturing: // value for 'isManufacturing'
 *   },
 * });
 */
export function useUpdateNewSubmissionByInvitationIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateNewSubmissionByInvitationIdMutation, Types.UpdateNewSubmissionByInvitationIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateNewSubmissionByInvitationIdMutation, Types.UpdateNewSubmissionByInvitationIdMutationVariables>(UpdateNewSubmissionByInvitationIdDocument, options);
      }
export type UpdateNewSubmissionByInvitationIdMutationHookResult = ReturnType<typeof useUpdateNewSubmissionByInvitationIdMutation>;
export type UpdateNewSubmissionByInvitationIdMutationResult = Apollo.MutationResult<Types.UpdateNewSubmissionByInvitationIdMutation>;
export type UpdateNewSubmissionByInvitationIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateNewSubmissionByInvitationIdMutation, Types.UpdateNewSubmissionByInvitationIdMutationVariables>;