import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateFormInvitationByCompanyIdAndFormIdDocument = gql`
    mutation updateFormInvitationByCompanyIdAndFormId($invitationId: [uuid!], $companyid: [uuid!], $formId: uuid!) {
  update_FormInvitation_many(
    updates: {where: {id: {_in: $invitationId}}, _set: {formId: $formId}}
  ) {
    affected_rows
  }
  update_CompanyFormFundtype_many(
    updates: {where: {companyId: {_in: $companyid}}, _set: {formId: $formId}}
  ) {
    affected_rows
  }
}
    `;
export type UpdateFormInvitationByCompanyIdAndFormIdMutationFn = Apollo.MutationFunction<Types.UpdateFormInvitationByCompanyIdAndFormIdMutation, Types.UpdateFormInvitationByCompanyIdAndFormIdMutationVariables>;

/**
 * __useUpdateFormInvitationByCompanyIdAndFormIdMutation__
 *
 * To run a mutation, you first call `useUpdateFormInvitationByCompanyIdAndFormIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormInvitationByCompanyIdAndFormIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFormInvitationByCompanyIdAndFormIdMutation, { data, loading, error }] = useUpdateFormInvitationByCompanyIdAndFormIdMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      companyid: // value for 'companyid'
 *      formId: // value for 'formId'
 *   },
 * });
 */
export function useUpdateFormInvitationByCompanyIdAndFormIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateFormInvitationByCompanyIdAndFormIdMutation, Types.UpdateFormInvitationByCompanyIdAndFormIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateFormInvitationByCompanyIdAndFormIdMutation, Types.UpdateFormInvitationByCompanyIdAndFormIdMutationVariables>(UpdateFormInvitationByCompanyIdAndFormIdDocument, options);
      }
export type UpdateFormInvitationByCompanyIdAndFormIdMutationHookResult = ReturnType<typeof useUpdateFormInvitationByCompanyIdAndFormIdMutation>;
export type UpdateFormInvitationByCompanyIdAndFormIdMutationResult = Apollo.MutationResult<Types.UpdateFormInvitationByCompanyIdAndFormIdMutation>;
export type UpdateFormInvitationByCompanyIdAndFormIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateFormInvitationByCompanyIdAndFormIdMutation, Types.UpdateFormInvitationByCompanyIdAndFormIdMutationVariables>;