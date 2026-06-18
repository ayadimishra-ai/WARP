import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const CreateParentCompanyMappingDocument = gql`
    mutation createParentCompanyMapping($input: [ParentCompanyMapping_insert_input!]!) {
  insert_ParentCompanyMapping(
    objects: $input
    on_conflict: {constraint: ParentCompanyMapping_pkey}
  ) {
    returning {
      Id
      CompanyId
      ParentCompanyId
      User {
        id
        email
      }
    }
  }
}
    `;
export type CreateParentCompanyMappingMutationFn = Apollo.MutationFunction<Types.CreateParentCompanyMappingMutation, Types.CreateParentCompanyMappingMutationVariables>;

/**
 * __useCreateParentCompanyMappingMutation__
 *
 * To run a mutation, you first call `useCreateParentCompanyMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateParentCompanyMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createParentCompanyMappingMutation, { data, loading, error }] = useCreateParentCompanyMappingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateParentCompanyMappingMutation(baseOptions?: Apollo.MutationHookOptions<Types.CreateParentCompanyMappingMutation, Types.CreateParentCompanyMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.CreateParentCompanyMappingMutation, Types.CreateParentCompanyMappingMutationVariables>(CreateParentCompanyMappingDocument, options);
      }
export type CreateParentCompanyMappingMutationHookResult = ReturnType<typeof useCreateParentCompanyMappingMutation>;
export type CreateParentCompanyMappingMutationResult = Apollo.MutationResult<Types.CreateParentCompanyMappingMutation>;
export type CreateParentCompanyMappingMutationOptions = Apollo.BaseMutationOptions<Types.CreateParentCompanyMappingMutation, Types.CreateParentCompanyMappingMutationVariables>;