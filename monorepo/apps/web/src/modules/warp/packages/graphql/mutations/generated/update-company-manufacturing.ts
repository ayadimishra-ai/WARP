import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateCompanyDetailsDocument = gql`
    mutation updateCompanyDetails($companyId: uuid!, $IsManufacturing: Boolean, $metadata: jsonb!) {
  update_Company(
    _set: {metadata: $metadata, IsManufacturing: $IsManufacturing}
    where: {id: {_eq: $companyId}}
  ) {
    returning {
      id
      IsManufacturing
      parentCompanyId
    }
  }
}
    `;
export type UpdateCompanyDetailsMutationFn = Apollo.MutationFunction<Types.UpdateCompanyDetailsMutation, Types.UpdateCompanyDetailsMutationVariables>;

/**
 * __useUpdateCompanyDetailsMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyDetailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyDetailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyDetailsMutation, { data, loading, error }] = useUpdateCompanyDetailsMutation({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      IsManufacturing: // value for 'IsManufacturing'
 *      metadata: // value for 'metadata'
 *   },
 * });
 */
export function useUpdateCompanyDetailsMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateCompanyDetailsMutation, Types.UpdateCompanyDetailsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateCompanyDetailsMutation, Types.UpdateCompanyDetailsMutationVariables>(UpdateCompanyDetailsDocument, options);
      }
export type UpdateCompanyDetailsMutationHookResult = ReturnType<typeof useUpdateCompanyDetailsMutation>;
export type UpdateCompanyDetailsMutationResult = Apollo.MutationResult<Types.UpdateCompanyDetailsMutation>;
export type UpdateCompanyDetailsMutationOptions = Apollo.BaseMutationOptions<Types.UpdateCompanyDetailsMutation, Types.UpdateCompanyDetailsMutationVariables>;