import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetParentCompanyMappingByAddressIdDocument = gql`
    query getParentCompanyMappingByAddressId($companyId: uuid, $parentUserId: uuid) {
  ParentCompanyMapping(
    where: {CompanyId: {_eq: $companyId}, ParentUserId: {_eq: $parentUserId}}
  ) {
    AddressId
    User {
      email
      id
      name
      UserRoles {
        userId
        roleName
      }
    }
  }
  Addresses(where: {companyId: {_eq: $companyId}}) {
    id
  }
}
    `;

/**
 * __useGetParentCompanyMappingByAddressIdQuery__
 *
 * To run a query within a React component, call `useGetParentCompanyMappingByAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetParentCompanyMappingByAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetParentCompanyMappingByAddressIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      parentUserId: // value for 'parentUserId'
 *   },
 * });
 */
export function useGetParentCompanyMappingByAddressIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetParentCompanyMappingByAddressIdQuery, Types.GetParentCompanyMappingByAddressIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetParentCompanyMappingByAddressIdQuery, Types.GetParentCompanyMappingByAddressIdQueryVariables>(GetParentCompanyMappingByAddressIdDocument, options);
      }
export function useGetParentCompanyMappingByAddressIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetParentCompanyMappingByAddressIdQuery, Types.GetParentCompanyMappingByAddressIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetParentCompanyMappingByAddressIdQuery, Types.GetParentCompanyMappingByAddressIdQueryVariables>(GetParentCompanyMappingByAddressIdDocument, options);
        }
export type GetParentCompanyMappingByAddressIdQueryHookResult = ReturnType<typeof useGetParentCompanyMappingByAddressIdQuery>;
export type GetParentCompanyMappingByAddressIdLazyQueryHookResult = ReturnType<typeof useGetParentCompanyMappingByAddressIdLazyQuery>;
export type GetParentCompanyMappingByAddressIdQueryResult = Apollo.QueryResult<Types.GetParentCompanyMappingByAddressIdQuery, Types.GetParentCompanyMappingByAddressIdQueryVariables>;