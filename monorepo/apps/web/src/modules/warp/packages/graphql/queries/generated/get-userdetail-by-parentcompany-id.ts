import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetUserDetailByParentCompanyIdDocument = gql`
    query getUserDetailByParentCompanyId($companyId: uuid, $userId: uuid) {
  ParentCompanyMapping(
    where: {ParentCompanyId: {_eq: $companyId}, User: {id: {_is_null: false}}}
  ) {
    Id
    CompanyId
    ParentCompanyId
    UserId
    ParentUserId
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
  User(where: {id: {_eq: $userId}}) {
    email
    id
    name
    companyId
    UserRoles {
      userId
      roleName
    }
  }
}
    `;

/**
 * __useGetUserDetailByParentCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetUserDetailByParentCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailByParentCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailByParentCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserDetailByParentCompanyIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetUserDetailByParentCompanyIdQuery, Types.GetUserDetailByParentCompanyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetUserDetailByParentCompanyIdQuery, Types.GetUserDetailByParentCompanyIdQueryVariables>(GetUserDetailByParentCompanyIdDocument, options);
      }
export function useGetUserDetailByParentCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetUserDetailByParentCompanyIdQuery, Types.GetUserDetailByParentCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetUserDetailByParentCompanyIdQuery, Types.GetUserDetailByParentCompanyIdQueryVariables>(GetUserDetailByParentCompanyIdDocument, options);
        }
// @ts-ignore
export function useGetUserDetailByParentCompanyIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByParentCompanyIdQuery, Types.GetUserDetailByParentCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetUserDetailByParentCompanyIdQuery, Types.GetUserDetailByParentCompanyIdQueryVariables>;
export function useGetUserDetailByParentCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByParentCompanyIdQuery, Types.GetUserDetailByParentCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetUserDetailByParentCompanyIdQuery | undefined, Types.GetUserDetailByParentCompanyIdQueryVariables>;
export function useGetUserDetailByParentCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByParentCompanyIdQuery, Types.GetUserDetailByParentCompanyIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetUserDetailByParentCompanyIdQuery, Types.GetUserDetailByParentCompanyIdQueryVariables>(GetUserDetailByParentCompanyIdDocument, options);
        }
export type GetUserDetailByParentCompanyIdQueryHookResult = ReturnType<typeof useGetUserDetailByParentCompanyIdQuery>;
export type GetUserDetailByParentCompanyIdLazyQueryHookResult = ReturnType<typeof useGetUserDetailByParentCompanyIdLazyQuery>;
export type GetUserDetailByParentCompanyIdSuspenseQueryHookResult = ReturnType<typeof useGetUserDetailByParentCompanyIdSuspenseQuery>;
export type GetUserDetailByParentCompanyIdQueryResult = Apollo.QueryResult<Types.GetUserDetailByParentCompanyIdQuery, Types.GetUserDetailByParentCompanyIdQueryVariables>;