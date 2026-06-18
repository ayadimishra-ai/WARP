import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertFormInvitationDocument = gql`
    mutation InsertFormInvitation($object: [FormInvitation_insert_input!]!, $companyId: uuid!) {
  insert_FormInvitation(
    objects: $object
    on_conflict: {constraint: FormInvitation_pkey}
  ) {
    returning {
      id
      companyId
      email
      formId
      status
      interimCheck
      Form {
        id
        name
      }
    }
  }
  update_ParentCompanyMapping(
    _set: {isActive: false}
    where: {_and: [{CompanyId: {_eq: $companyId}}, {ParentCompanyId: {_is_null: true}}]}
  ) {
    affected_rows
  }
}
    `;
export type InsertFormInvitationMutationFn = Apollo.MutationFunction<Types.InsertFormInvitationMutation, Types.InsertFormInvitationMutationVariables>;

/**
 * __useInsertFormInvitationMutation__
 *
 * To run a mutation, you first call `useInsertFormInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertFormInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertFormInvitationMutation, { data, loading, error }] = useInsertFormInvitationMutation({
 *   variables: {
 *      object: // value for 'object'
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useInsertFormInvitationMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertFormInvitationMutation, Types.InsertFormInvitationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertFormInvitationMutation, Types.InsertFormInvitationMutationVariables>(InsertFormInvitationDocument, options);
      }
export type InsertFormInvitationMutationHookResult = ReturnType<typeof useInsertFormInvitationMutation>;
export type InsertFormInvitationMutationResult = Apollo.MutationResult<Types.InsertFormInvitationMutation>;
export type InsertFormInvitationMutationOptions = Apollo.BaseMutationOptions<Types.InsertFormInvitationMutation, Types.InsertFormInvitationMutationVariables>;