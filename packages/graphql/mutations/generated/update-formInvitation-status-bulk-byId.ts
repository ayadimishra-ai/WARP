import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateFormInvitationStatusBulkbyIdDocument = gql`
    mutation updateFormInvitationStatusBulkbyId($formInvitationUpdateData: [FormInvitation_updates!]!, $webCurationUpdateData: [WebCuration_updates!]!, $aiBulkDocumentProcessingUpdateData: [AIBulkDocumentProcessing_updates!]!, $opsCurationUpdateData: [OPSToIQCuration_updates!]!) {
  update_FormInvitation_many(updates: $formInvitationUpdateData) {
    returning {
      id
      status
      formId
      companyId
      ParentCompanyMapping {
        ParentCompanyId
        companyByParentcompanyid {
          platformId
        }
      }
      Form {
        id
        formtype
      }
    }
  }
  update_WebCuration_many(updates: $webCurationUpdateData) {
    returning {
      id
      formInvitationId
      status
    }
  }
  update_AIBulkDocumentProcessing_many(
    updates: $aiBulkDocumentProcessingUpdateData
  ) {
    returning {
      id
      formInvitationId
      requestStatus
    }
  }
  update_OPSToIQCuration_many(updates: $opsCurationUpdateData) {
    returning {
      id
      formInvitationId
      status
    }
  }
}
    `;
export type UpdateFormInvitationStatusBulkbyIdMutationFn = Apollo.MutationFunction<Types.UpdateFormInvitationStatusBulkbyIdMutation, Types.UpdateFormInvitationStatusBulkbyIdMutationVariables>;

/**
 * __useUpdateFormInvitationStatusBulkbyIdMutation__
 *
 * To run a mutation, you first call `useUpdateFormInvitationStatusBulkbyIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormInvitationStatusBulkbyIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFormInvitationStatusBulkbyIdMutation, { data, loading, error }] = useUpdateFormInvitationStatusBulkbyIdMutation({
 *   variables: {
 *      formInvitationUpdateData: // value for 'formInvitationUpdateData'
 *      webCurationUpdateData: // value for 'webCurationUpdateData'
 *      aiBulkDocumentProcessingUpdateData: // value for 'aiBulkDocumentProcessingUpdateData'
 *      opsCurationUpdateData: // value for 'opsCurationUpdateData'
 *   },
 * });
 */
export function useUpdateFormInvitationStatusBulkbyIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateFormInvitationStatusBulkbyIdMutation, Types.UpdateFormInvitationStatusBulkbyIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateFormInvitationStatusBulkbyIdMutation, Types.UpdateFormInvitationStatusBulkbyIdMutationVariables>(UpdateFormInvitationStatusBulkbyIdDocument, options);
      }
export type UpdateFormInvitationStatusBulkbyIdMutationHookResult = ReturnType<typeof useUpdateFormInvitationStatusBulkbyIdMutation>;
export type UpdateFormInvitationStatusBulkbyIdMutationResult = Apollo.MutationResult<Types.UpdateFormInvitationStatusBulkbyIdMutation>;
export type UpdateFormInvitationStatusBulkbyIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateFormInvitationStatusBulkbyIdMutation, Types.UpdateFormInvitationStatusBulkbyIdMutationVariables>;