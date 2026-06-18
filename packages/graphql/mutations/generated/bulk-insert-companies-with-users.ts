import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertCompaniesWithUsersDocument = gql`
    mutation BulkInsertCompaniesWithUsers($companyInput: [Company_insert_input!]!, $userInput: [User_insert_input!]!, $parentCompanyInput: [ParentCompanyMapping_insert_input!]!) {
  insert_Company(
    objects: $companyInput
    on_conflict: {constraint: Company_name_key}
  ) {
    returning {
      id
      name
      country
      details
      primaryContact
      parentCompanyId
      created_by
      updated_by
      created_at
      updated_at
      isActive
    }
  }
  insert_User(objects: $userInput) {
    returning {
      id
      name
      email
      emailVerified
      details
      image
      companyId
      phone
      phoneVerified
      created_by
      updated_by
      created_at
      updated_at
      isActive
      UserRoles {
        roleName
      }
    }
  }
  insert_ParentCompanyMapping(
    objects: $parentCompanyInput
    on_conflict: {constraint: ParentCompanyMapping_pkey}
  ) {
    returning {
      Id
      CompanyId
      ParentCompanyId
    }
  }
}
    `;
export type BulkInsertCompaniesWithUsersMutationFn = Apollo.MutationFunction<Types.BulkInsertCompaniesWithUsersMutation, Types.BulkInsertCompaniesWithUsersMutationVariables>;

/**
 * __useBulkInsertCompaniesWithUsersMutation__
 *
 * To run a mutation, you first call `useBulkInsertCompaniesWithUsersMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertCompaniesWithUsersMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertCompaniesWithUsersMutation, { data, loading, error }] = useBulkInsertCompaniesWithUsersMutation({
 *   variables: {
 *      companyInput: // value for 'companyInput'
 *      userInput: // value for 'userInput'
 *      parentCompanyInput: // value for 'parentCompanyInput'
 *   },
 * });
 */
export function useBulkInsertCompaniesWithUsersMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertCompaniesWithUsersMutation, Types.BulkInsertCompaniesWithUsersMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertCompaniesWithUsersMutation, Types.BulkInsertCompaniesWithUsersMutationVariables>(BulkInsertCompaniesWithUsersDocument, options);
      }
export type BulkInsertCompaniesWithUsersMutationHookResult = ReturnType<typeof useBulkInsertCompaniesWithUsersMutation>;
export type BulkInsertCompaniesWithUsersMutationResult = Apollo.MutationResult<Types.BulkInsertCompaniesWithUsersMutation>;
export type BulkInsertCompaniesWithUsersMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertCompaniesWithUsersMutation, Types.BulkInsertCompaniesWithUsersMutationVariables>;