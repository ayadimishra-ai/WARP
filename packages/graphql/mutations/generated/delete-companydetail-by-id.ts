import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const DeleteCompanyDetailsByIdDocument = gql`
    mutation deleteCompanyDetailsById($id: uuid) {
  update_Company(where: {id: {_eq: $id}}, _set: {isActive: false}) {
    affected_rows
    returning {
      id
      name
      primaryContact
      details
      parentCompanyId
      platformId
      created_by
      updated_by
      country
      isActive
    }
  }
}
    `;
export type DeleteCompanyDetailsByIdMutationFn = Apollo.MutationFunction<Types.DeleteCompanyDetailsByIdMutation, Types.DeleteCompanyDetailsByIdMutationVariables>;

/**
 * __useDeleteCompanyDetailsByIdMutation__
 *
 * To run a mutation, you first call `useDeleteCompanyDetailsByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCompanyDetailsByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCompanyDetailsByIdMutation, { data, loading, error }] = useDeleteCompanyDetailsByIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCompanyDetailsByIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteCompanyDetailsByIdMutation, Types.DeleteCompanyDetailsByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteCompanyDetailsByIdMutation, Types.DeleteCompanyDetailsByIdMutationVariables>(DeleteCompanyDetailsByIdDocument, options);
      }
export type DeleteCompanyDetailsByIdMutationHookResult = ReturnType<typeof useDeleteCompanyDetailsByIdMutation>;
export type DeleteCompanyDetailsByIdMutationResult = Apollo.MutationResult<Types.DeleteCompanyDetailsByIdMutation>;
export type DeleteCompanyDetailsByIdMutationOptions = Apollo.BaseMutationOptions<Types.DeleteCompanyDetailsByIdMutation, Types.DeleteCompanyDetailsByIdMutationVariables>;