import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateCompanyDetailByIdDocument = gql`
    mutation updateCompanyDetailById($input: [Company_updates!]!) {
  update_Company_many(updates: $input) {
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
export type UpdateCompanyDetailByIdMutationFn = Apollo.MutationFunction<Types.UpdateCompanyDetailByIdMutation, Types.UpdateCompanyDetailByIdMutationVariables>;

/**
 * __useUpdateCompanyDetailByIdMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyDetailByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyDetailByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyDetailByIdMutation, { data, loading, error }] = useUpdateCompanyDetailByIdMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCompanyDetailByIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateCompanyDetailByIdMutation, Types.UpdateCompanyDetailByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateCompanyDetailByIdMutation, Types.UpdateCompanyDetailByIdMutationVariables>(UpdateCompanyDetailByIdDocument, options);
      }
export type UpdateCompanyDetailByIdMutationHookResult = ReturnType<typeof useUpdateCompanyDetailByIdMutation>;
export type UpdateCompanyDetailByIdMutationResult = Apollo.MutationResult<Types.UpdateCompanyDetailByIdMutation>;
export type UpdateCompanyDetailByIdMutationOptions = Apollo.BaseMutationOptions<Types.UpdateCompanyDetailByIdMutation, Types.UpdateCompanyDetailByIdMutationVariables>;