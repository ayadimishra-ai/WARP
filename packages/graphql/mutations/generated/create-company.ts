import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const CreateCompanyDocument = gql`
    mutation createCompany($input: [Company_insert_input!]!) {
  insert_Company(objects: $input, on_conflict: {constraint: Company_name_key}) {
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
    }
  }
}
    `;
export type CreateCompanyMutationFn = Apollo.MutationFunction<Types.CreateCompanyMutation, Types.CreateCompanyMutationVariables>;

/**
 * __useCreateCompanyMutation__
 *
 * To run a mutation, you first call `useCreateCompanyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCompanyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCompanyMutation, { data, loading, error }] = useCreateCompanyMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCompanyMutation(baseOptions?: Apollo.MutationHookOptions<Types.CreateCompanyMutation, Types.CreateCompanyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.CreateCompanyMutation, Types.CreateCompanyMutationVariables>(CreateCompanyDocument, options);
      }
export type CreateCompanyMutationHookResult = ReturnType<typeof useCreateCompanyMutation>;
export type CreateCompanyMutationResult = Apollo.MutationResult<Types.CreateCompanyMutation>;
export type CreateCompanyMutationOptions = Apollo.BaseMutationOptions<Types.CreateCompanyMutation, Types.CreateCompanyMutationVariables>;