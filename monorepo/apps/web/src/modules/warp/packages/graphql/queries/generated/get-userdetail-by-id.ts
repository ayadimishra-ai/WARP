import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetUserDetailByIdDocument = gql`
    query getUserDetailById($id: uuid) {
  User(where: {id: {_eq: $id}, isActive: {_eq: true}}) {
    id
    name
    email
    emailVerified
    phone
    phoneVerified
    image
    details
    companyId
    created_by
    updated_by
  }
}
    `;

/**
 * __useGetUserDetailByIdQuery__
 *
 * To run a query within a React component, call `useGetUserDetailByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserDetailByIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetUserDetailByIdQuery, Types.GetUserDetailByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetUserDetailByIdQuery, Types.GetUserDetailByIdQueryVariables>(GetUserDetailByIdDocument, options);
      }
export function useGetUserDetailByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetUserDetailByIdQuery, Types.GetUserDetailByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetUserDetailByIdQuery, Types.GetUserDetailByIdQueryVariables>(GetUserDetailByIdDocument, options);
        }
// @ts-ignore
export function useGetUserDetailByIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByIdQuery, Types.GetUserDetailByIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetUserDetailByIdQuery, Types.GetUserDetailByIdQueryVariables>;
export function useGetUserDetailByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByIdQuery, Types.GetUserDetailByIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetUserDetailByIdQuery | undefined, Types.GetUserDetailByIdQueryVariables>;
export function useGetUserDetailByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByIdQuery, Types.GetUserDetailByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetUserDetailByIdQuery, Types.GetUserDetailByIdQueryVariables>(GetUserDetailByIdDocument, options);
        }
export type GetUserDetailByIdQueryHookResult = ReturnType<typeof useGetUserDetailByIdQuery>;
export type GetUserDetailByIdLazyQueryHookResult = ReturnType<typeof useGetUserDetailByIdLazyQuery>;
export type GetUserDetailByIdSuspenseQueryHookResult = ReturnType<typeof useGetUserDetailByIdSuspenseQuery>;
export type GetUserDetailByIdQueryResult = Apollo.QueryResult<Types.GetUserDetailByIdQuery, Types.GetUserDetailByIdQueryVariables>;