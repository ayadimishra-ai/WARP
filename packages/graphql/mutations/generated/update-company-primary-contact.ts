import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateCompanyPrimaryContactDocument = gql`
    mutation UpdateCompanyPrimaryContact($companyId: uuid, $primaryContact: jsonb!) {
  update_Company(
    _set: {primaryContact: $primaryContact}
    where: {id: {_eq: $companyId}}
  ) {
    returning {
      id
      primaryContact
    }
  }
}
    `;
export type UpdateCompanyPrimaryContactMutationFn = Apollo.MutationFunction<Types.UpdateCompanyPrimaryContactMutation, Types.UpdateCompanyPrimaryContactMutationVariables>;

/**
 * __useUpdateCompanyPrimaryContactMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyPrimaryContactMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyPrimaryContactMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyPrimaryContactMutation, { data, loading, error }] = useUpdateCompanyPrimaryContactMutation({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      primaryContact: // value for 'primaryContact'
 *   },
 * });
 */
export function useUpdateCompanyPrimaryContactMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateCompanyPrimaryContactMutation, Types.UpdateCompanyPrimaryContactMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateCompanyPrimaryContactMutation, Types.UpdateCompanyPrimaryContactMutationVariables>(UpdateCompanyPrimaryContactDocument, options);
      }
export type UpdateCompanyPrimaryContactMutationHookResult = ReturnType<typeof useUpdateCompanyPrimaryContactMutation>;
export type UpdateCompanyPrimaryContactMutationResult = Apollo.MutationResult<Types.UpdateCompanyPrimaryContactMutation>;
export type UpdateCompanyPrimaryContactMutationOptions = Apollo.BaseMutationOptions<Types.UpdateCompanyPrimaryContactMutation, Types.UpdateCompanyPrimaryContactMutationVariables>;