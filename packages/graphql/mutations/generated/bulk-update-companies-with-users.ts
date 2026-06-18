import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkUpdateCompaniesWithUsersDocument = gql`
    mutation BulkUpdateCompaniesWithUsers($companyUpdate: [Company_updates!]!, $userUpdate: [User_updates!]!, $userroleUpdate: [UserRole_updates!]!, $parentCompanyMapping: [ParentCompanyMapping_updates!]!) {
  update_Company_many(updates: $companyUpdate) {
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
  update_User_many(updates: $userUpdate) {
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
  update_UserRole_many(updates: $userroleUpdate) {
    returning {
      userId
      roleName
    }
  }
  update_ParentCompanyMapping_many(updates: $parentCompanyMapping) {
    returning {
      Id
      ParentCompanyId
    }
  }
}
    `;
export type BulkUpdateCompaniesWithUsersMutationFn = Apollo.MutationFunction<Types.BulkUpdateCompaniesWithUsersMutation, Types.BulkUpdateCompaniesWithUsersMutationVariables>;

/**
 * __useBulkUpdateCompaniesWithUsersMutation__
 *
 * To run a mutation, you first call `useBulkUpdateCompaniesWithUsersMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpdateCompaniesWithUsersMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpdateCompaniesWithUsersMutation, { data, loading, error }] = useBulkUpdateCompaniesWithUsersMutation({
 *   variables: {
 *      companyUpdate: // value for 'companyUpdate'
 *      userUpdate: // value for 'userUpdate'
 *      userroleUpdate: // value for 'userroleUpdate'
 *      parentCompanyMapping: // value for 'parentCompanyMapping'
 *   },
 * });
 */
export function useBulkUpdateCompaniesWithUsersMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkUpdateCompaniesWithUsersMutation, Types.BulkUpdateCompaniesWithUsersMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkUpdateCompaniesWithUsersMutation, Types.BulkUpdateCompaniesWithUsersMutationVariables>(BulkUpdateCompaniesWithUsersDocument, options);
      }
export type BulkUpdateCompaniesWithUsersMutationHookResult = ReturnType<typeof useBulkUpdateCompaniesWithUsersMutation>;
export type BulkUpdateCompaniesWithUsersMutationResult = Apollo.MutationResult<Types.BulkUpdateCompaniesWithUsersMutation>;
export type BulkUpdateCompaniesWithUsersMutationOptions = Apollo.BaseMutationOptions<Types.BulkUpdateCompaniesWithUsersMutation, Types.BulkUpdateCompaniesWithUsersMutationVariables>;