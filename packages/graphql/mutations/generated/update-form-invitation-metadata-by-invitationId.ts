import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateFormInvitationMetadataDocument = gql`
    mutation updateFormInvitationMetadata($formInvitationId: uuid!, $status: String!, $metadata: jsonb) {
  update_FormInvitation(
    where: {id: {_eq: $formInvitationId}}
    _set: {metadata: $metadata, status: $status}
  ) {
    returning {
      id
      status
      metadata
    }
  }
  insert_FormSubmission_one(
    object: {invitationId: $formInvitationId, isActive: true}
  ) {
    id
  }
}
    `;
export type UpdateFormInvitationMetadataMutationFn = Apollo.MutationFunction<Types.UpdateFormInvitationMetadataMutation, Types.UpdateFormInvitationMetadataMutationVariables>;

/**
 * __useUpdateFormInvitationMetadataMutation__
 *
 * To run a mutation, you first call `useUpdateFormInvitationMetadataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFormInvitationMetadataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFormInvitationMetadataMutation, { data, loading, error }] = useUpdateFormInvitationMetadataMutation({
 *   variables: {
 *      formInvitationId: // value for 'formInvitationId'
 *      status: // value for 'status'
 *      metadata: // value for 'metadata'
 *   },
 * });
 */
export function useUpdateFormInvitationMetadataMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateFormInvitationMetadataMutation, Types.UpdateFormInvitationMetadataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateFormInvitationMetadataMutation, Types.UpdateFormInvitationMetadataMutationVariables>(UpdateFormInvitationMetadataDocument, options);
      }
export type UpdateFormInvitationMetadataMutationHookResult = ReturnType<typeof useUpdateFormInvitationMetadataMutation>;
export type UpdateFormInvitationMetadataMutationResult = Apollo.MutationResult<Types.UpdateFormInvitationMetadataMutation>;
export type UpdateFormInvitationMetadataMutationOptions = Apollo.BaseMutationOptions<Types.UpdateFormInvitationMetadataMutation, Types.UpdateFormInvitationMetadataMutationVariables>;