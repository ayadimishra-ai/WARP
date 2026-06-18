import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertFormInvitationNewCompanyDocument = gql`
    mutation InsertFormInvitationNewCompany($object: [FormInvitation_insert_input!]!) {
  insert_FormInvitation(
    objects: $object
    on_conflict: {constraint: FormInvitation_pkey}
  ) {
    returning {
      id
      email
      companyId
      formId
      status
      interimCheck
      reviewerDetails
      Form {
        id
        name
      }
    }
  }
}
    `;
export type InsertFormInvitationNewCompanyMutationFn = Apollo.MutationFunction<Types.InsertFormInvitationNewCompanyMutation, Types.InsertFormInvitationNewCompanyMutationVariables>;

/**
 * __useInsertFormInvitationNewCompanyMutation__
 *
 * To run a mutation, you first call `useInsertFormInvitationNewCompanyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertFormInvitationNewCompanyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertFormInvitationNewCompanyMutation, { data, loading, error }] = useInsertFormInvitationNewCompanyMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useInsertFormInvitationNewCompanyMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertFormInvitationNewCompanyMutation, Types.InsertFormInvitationNewCompanyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertFormInvitationNewCompanyMutation, Types.InsertFormInvitationNewCompanyMutationVariables>(InsertFormInvitationNewCompanyDocument, options);
      }
export type InsertFormInvitationNewCompanyMutationHookResult = ReturnType<typeof useInsertFormInvitationNewCompanyMutation>;
export type InsertFormInvitationNewCompanyMutationResult = Apollo.MutationResult<Types.InsertFormInvitationNewCompanyMutation>;
export type InsertFormInvitationNewCompanyMutationOptions = Apollo.BaseMutationOptions<Types.InsertFormInvitationNewCompanyMutation, Types.InsertFormInvitationNewCompanyMutationVariables>;