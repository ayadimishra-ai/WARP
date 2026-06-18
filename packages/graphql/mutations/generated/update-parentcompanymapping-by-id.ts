import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateParentCompanyMappingbyIdDocument = gql`
    mutation UpdateParentCompanyMappingbyId($parentCompanyId: uuid!, $companyId: uuid!) {
  update_ParentCompanyMapping(
    _set: {isActive: false}
    where: {_and: [{CompanyId: {_eq: $companyId}}, {ParentCompanyId: {_eq: $parentCompanyId}}]}
  ) {
    affected_rows
  }
}
    `;
export type UpdateParentCompanyMappingbyIdMutationFn = Apollo.MutationFunction<Types.UpdateParentCompanyMappingbyIdMutation, Types.UpdateParentCompanyMappingbyIdMutationVariables>;

/**
 * __useUpdateParentCompanyMappingbyIdMutation__
 *
 * To run a mutation, you first call `useUpdateParentCompanyMappingbyIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateParentCompanyMappingbyIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateParentCompanyMappingbyIdMutation, { data, loading, error }] = useUpdateParentCompanyMappingbyIdMutation({
 *   variables: {
 *      parentCompanyId: // value for 'parentCompanyId'
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useUpdateParentCompanyMappingbyIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateParentCompanyMappingbyIdMutation, Types.UpdateParentCompanyMappingbyIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateParentCompanyMappingbyIdMutation, Types.UpdateParentCompanyMappingbyIdMutationVariables>(UpdateParentCompanyMappingbyIdDocument, options);
      }
export type UpdateParentCompanyMappingbyIdMutationHookResult = ReturnType<typeof useUpdateParentCompanyMappingbyIdMutation>;
export type UpdateParentCompanyMappingbyIdMutationResult = Apollo.MutationResult<Types.UpdateParentCompanyMappingbyIdMutation>;
export type UpdateParentCompanyMappingbyIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateParentCompanyMappingbyIdMutation, Types.UpdateParentCompanyMappingbyIdMutationVariables>;