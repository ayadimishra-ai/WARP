import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const AppendFormInvitationMetadataDocument = gql`
    mutation appendFormInvitationMetadata($invitationId: uuid!, $metadata: jsonb!) {
  update_FormInvitation(
    _append: {metadata: $metadata}
    where: {id: {_eq: $invitationId}}
  ) {
    affected_rows
    returning {
      id
      metadata
    }
  }
}
    `;
export type AppendFormInvitationMetadataMutationFn = Apollo.MutationFunction<Types.AppendFormInvitationMetadataMutation, Types.AppendFormInvitationMetadataMutationVariables>;

/**
 * __useAppendFormInvitationMetadataMutation__
 *
 * To run a mutation, you first call `useAppendFormInvitationMetadataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAppendFormInvitationMetadataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [appendFormInvitationMetadataMutation, { data, loading, error }] = useAppendFormInvitationMetadataMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *      metadata: // value for 'metadata'
 *   },
 * });
 */
export function useAppendFormInvitationMetadataMutation(baseOptions?: Apollo.MutationHookOptions<Types.AppendFormInvitationMetadataMutation, Types.AppendFormInvitationMetadataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.AppendFormInvitationMetadataMutation, Types.AppendFormInvitationMetadataMutationVariables>(AppendFormInvitationMetadataDocument, options);
      }
export type AppendFormInvitationMetadataMutationHookResult = ReturnType<typeof useAppendFormInvitationMetadataMutation>;
export type AppendFormInvitationMetadataMutationResult = Apollo.MutationResult<Types.AppendFormInvitationMetadataMutation>;
export type AppendFormInvitationMetadataMutationOptions = Apollo.BaseMutationOptions<Types.AppendFormInvitationMetadataMutation, Types.AppendFormInvitationMetadataMutationVariables>;