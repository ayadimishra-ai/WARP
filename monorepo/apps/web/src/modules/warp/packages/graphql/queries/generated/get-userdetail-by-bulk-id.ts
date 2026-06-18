import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetUserDetailByBulkIdDocument = gql`
    query getUserDetailByBulkId($id: [uuid!]) {
  User(where: {id: {_in: $id}, isActive: {_eq: true}}) {
    id
    name
  }
}
    `;

/**
 * __useGetUserDetailByBulkIdQuery__
 *
 * To run a query within a React component, call `useGetUserDetailByBulkIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailByBulkIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailByBulkIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserDetailByBulkIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetUserDetailByBulkIdQuery, Types.GetUserDetailByBulkIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetUserDetailByBulkIdQuery, Types.GetUserDetailByBulkIdQueryVariables>(GetUserDetailByBulkIdDocument, options);
      }
export function useGetUserDetailByBulkIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetUserDetailByBulkIdQuery, Types.GetUserDetailByBulkIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetUserDetailByBulkIdQuery, Types.GetUserDetailByBulkIdQueryVariables>(GetUserDetailByBulkIdDocument, options);
        }
// @ts-ignore
export function useGetUserDetailByBulkIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByBulkIdQuery, Types.GetUserDetailByBulkIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetUserDetailByBulkIdQuery, Types.GetUserDetailByBulkIdQueryVariables>;
export function useGetUserDetailByBulkIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByBulkIdQuery, Types.GetUserDetailByBulkIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetUserDetailByBulkIdQuery | undefined, Types.GetUserDetailByBulkIdQueryVariables>;
export function useGetUserDetailByBulkIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByBulkIdQuery, Types.GetUserDetailByBulkIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetUserDetailByBulkIdQuery, Types.GetUserDetailByBulkIdQueryVariables>(GetUserDetailByBulkIdDocument, options);
        }
export type GetUserDetailByBulkIdQueryHookResult = ReturnType<typeof useGetUserDetailByBulkIdQuery>;
export type GetUserDetailByBulkIdLazyQueryHookResult = ReturnType<typeof useGetUserDetailByBulkIdLazyQuery>;
export type GetUserDetailByBulkIdSuspenseQueryHookResult = ReturnType<typeof useGetUserDetailByBulkIdSuspenseQuery>;
export type GetUserDetailByBulkIdQueryResult = Apollo.QueryResult<Types.GetUserDetailByBulkIdQuery, Types.GetUserDetailByBulkIdQueryVariables>;