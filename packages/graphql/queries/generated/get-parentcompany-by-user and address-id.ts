import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetParentCompanyByUserAndAddressIdDocument = gql`
    query getParentCompanyByUserAndAddressId($userId: [uuid!], $parentUserId: uuid!, $addressId: uuid!) {
  ParentCompanyMapping(
    where: {UserId: {_in: $userId}, ParentUserId: {_eq: $parentUserId}, AddressId: {_eq: $addressId}}
  ) {
    Id
    UserId
    ParentUserId
    AddressId
    User {
      email
    }
  }
}
    `;

/**
 * __useGetParentCompanyByUserAndAddressIdQuery__
 *
 * To run a query within a React component, call `useGetParentCompanyByUserAndAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetParentCompanyByUserAndAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetParentCompanyByUserAndAddressIdQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      parentUserId: // value for 'parentUserId'
 *      addressId: // value for 'addressId'
 *   },
 * });
 */
export function useGetParentCompanyByUserAndAddressIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetParentCompanyByUserAndAddressIdQuery, Types.GetParentCompanyByUserAndAddressIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetParentCompanyByUserAndAddressIdQuery, Types.GetParentCompanyByUserAndAddressIdQueryVariables>(GetParentCompanyByUserAndAddressIdDocument, options);
      }
export function useGetParentCompanyByUserAndAddressIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetParentCompanyByUserAndAddressIdQuery, Types.GetParentCompanyByUserAndAddressIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetParentCompanyByUserAndAddressIdQuery, Types.GetParentCompanyByUserAndAddressIdQueryVariables>(GetParentCompanyByUserAndAddressIdDocument, options);
        }
export type GetParentCompanyByUserAndAddressIdQueryHookResult = ReturnType<typeof useGetParentCompanyByUserAndAddressIdQuery>;
export type GetParentCompanyByUserAndAddressIdLazyQueryHookResult = ReturnType<typeof useGetParentCompanyByUserAndAddressIdLazyQuery>;
export type GetParentCompanyByUserAndAddressIdQueryResult = Apollo.QueryResult<Types.GetParentCompanyByUserAndAddressIdQuery, Types.GetParentCompanyByUserAndAddressIdQueryVariables>;