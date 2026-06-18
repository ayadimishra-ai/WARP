import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateParentCompanyMappingbyCompanyIdDocument = gql`
    mutation UpdateParentCompanyMappingbyCompanyId($companyId: uuid!) {
  update_ParentCompanyMapping(
    _set: {isActive: false}
    where: {_and: [{CompanyId: {_eq: $companyId}}, {ParentCompanyId: {_is_null: true}}]}
  ) {
    affected_rows
  }
}
    `;
export type UpdateParentCompanyMappingbyCompanyIdMutationFn = Apollo.MutationFunction<Types.UpdateParentCompanyMappingbyCompanyIdMutation, Types.UpdateParentCompanyMappingbyCompanyIdMutationVariables>;

/**
 * __useUpdateParentCompanyMappingbyCompanyIdMutation__
 *
 * To run a mutation, you first call `useUpdateParentCompanyMappingbyCompanyIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateParentCompanyMappingbyCompanyIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateParentCompanyMappingbyCompanyIdMutation, { data, loading, error }] = useUpdateParentCompanyMappingbyCompanyIdMutation({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useUpdateParentCompanyMappingbyCompanyIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateParentCompanyMappingbyCompanyIdMutation, Types.UpdateParentCompanyMappingbyCompanyIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateParentCompanyMappingbyCompanyIdMutation, Types.UpdateParentCompanyMappingbyCompanyIdMutationVariables>(UpdateParentCompanyMappingbyCompanyIdDocument, options);
      }
export type UpdateParentCompanyMappingbyCompanyIdMutationHookResult = ReturnType<typeof useUpdateParentCompanyMappingbyCompanyIdMutation>;
export type UpdateParentCompanyMappingbyCompanyIdMutationResult = Apollo.MutationResult<Types.UpdateParentCompanyMappingbyCompanyIdMutation>;
export type UpdateParentCompanyMappingbyCompanyIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateParentCompanyMappingbyCompanyIdMutation, Types.UpdateParentCompanyMappingbyCompanyIdMutationVariables>;