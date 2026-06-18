import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetUserDetailByCompanyIdDocument = gql`
    query getUserDetailByCompanyId($companyId: uuid) {
  User(
    where: {companyId: {_eq: $companyId}, isActive: {_eq: true}, UserRoles: {roleName: {_nin: ["Inviter", "Analytics", "Consultant"]}}}
    order_by: {name: asc}
  ) {
    id
    name
    email
    details
    companyId
    UserRoles {
      userId
      roleName
      Role {
        id
        isActive
      }
    }
  }
}
    `;

/**
 * __useGetUserDetailByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetUserDetailByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetUserDetailByCompanyIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetUserDetailByCompanyIdQuery, Types.GetUserDetailByCompanyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetUserDetailByCompanyIdQuery, Types.GetUserDetailByCompanyIdQueryVariables>(GetUserDetailByCompanyIdDocument, options);
      }
export function useGetUserDetailByCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetUserDetailByCompanyIdQuery, Types.GetUserDetailByCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetUserDetailByCompanyIdQuery, Types.GetUserDetailByCompanyIdQueryVariables>(GetUserDetailByCompanyIdDocument, options);
        }
export type GetUserDetailByCompanyIdQueryHookResult = ReturnType<typeof useGetUserDetailByCompanyIdQuery>;
export type GetUserDetailByCompanyIdLazyQueryHookResult = ReturnType<typeof useGetUserDetailByCompanyIdLazyQuery>;
export type GetUserDetailByCompanyIdQueryResult = Apollo.QueryResult<Types.GetUserDetailByCompanyIdQuery, Types.GetUserDetailByCompanyIdQueryVariables>;