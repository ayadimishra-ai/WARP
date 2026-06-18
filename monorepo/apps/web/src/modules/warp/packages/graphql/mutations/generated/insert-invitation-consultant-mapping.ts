import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertInvitationConsultantMappingDocument = gql`
    mutation insertInvitationConsultantMapping($object: [InvitationConsultantMapping_insert_input!]!) {
  insert_InvitationConsultantMapping(
    objects: $object
    on_conflict: {constraint: InvitationConsultantMapping_pkey}
  ) {
    returning {
      id
      invitationId
      consultantUserId
      consultantCompanyId
    }
  }
}
    `;
export type InsertInvitationConsultantMappingMutationFn = Apollo.MutationFunction<Types.InsertInvitationConsultantMappingMutation, Types.InsertInvitationConsultantMappingMutationVariables>;

/**
 * __useInsertInvitationConsultantMappingMutation__
 *
 * To run a mutation, you first call `useInsertInvitationConsultantMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertInvitationConsultantMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertInvitationConsultantMappingMutation, { data, loading, error }] = useInsertInvitationConsultantMappingMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertInvitationConsultantMappingMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertInvitationConsultantMappingMutation, Types.InsertInvitationConsultantMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertInvitationConsultantMappingMutation, Types.InsertInvitationConsultantMappingMutationVariables>(InsertInvitationConsultantMappingDocument, options);
      }
export type InsertInvitationConsultantMappingMutationHookResult = ReturnType<typeof useInsertInvitationConsultantMappingMutation>;
export type InsertInvitationConsultantMappingMutationResult = Apollo.MutationResult<Types.InsertInvitationConsultantMappingMutation>;
export type InsertInvitationConsultantMappingMutationOptions = Apollo.BaseMutationOptions<Types.InsertInvitationConsultantMappingMutation, Types.InsertInvitationConsultantMappingMutationVariables>;