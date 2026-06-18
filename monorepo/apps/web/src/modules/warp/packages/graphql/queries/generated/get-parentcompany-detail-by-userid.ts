import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetParentCompanyDetailByUserIdDocument = gql`
    query getParentCompanyDetailByUserId($userId: [uuid!]) {
  ParentCompanyMapping(where: {UserId: {_in: $userId}}) {
    Id
    UserId
    ParentUserId
    AddressId
  }
}
    `;

/**
 * __useGetParentCompanyDetailByUserIdQuery__
 *
 * To run a query within a React component, call `useGetParentCompanyDetailByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetParentCompanyDetailByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetParentCompanyDetailByUserIdQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetParentCompanyDetailByUserIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetParentCompanyDetailByUserIdQuery, Types.GetParentCompanyDetailByUserIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetParentCompanyDetailByUserIdQuery, Types.GetParentCompanyDetailByUserIdQueryVariables>(GetParentCompanyDetailByUserIdDocument, options);
      }
export function useGetParentCompanyDetailByUserIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetParentCompanyDetailByUserIdQuery, Types.GetParentCompanyDetailByUserIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetParentCompanyDetailByUserIdQuery, Types.GetParentCompanyDetailByUserIdQueryVariables>(GetParentCompanyDetailByUserIdDocument, options);
        }
// @ts-ignore
export function useGetParentCompanyDetailByUserIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetParentCompanyDetailByUserIdQuery, Types.GetParentCompanyDetailByUserIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetParentCompanyDetailByUserIdQuery, Types.GetParentCompanyDetailByUserIdQueryVariables>;
export function useGetParentCompanyDetailByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetParentCompanyDetailByUserIdQuery, Types.GetParentCompanyDetailByUserIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetParentCompanyDetailByUserIdQuery | undefined, Types.GetParentCompanyDetailByUserIdQueryVariables>;
export function useGetParentCompanyDetailByUserIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetParentCompanyDetailByUserIdQuery, Types.GetParentCompanyDetailByUserIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetParentCompanyDetailByUserIdQuery, Types.GetParentCompanyDetailByUserIdQueryVariables>(GetParentCompanyDetailByUserIdDocument, options);
        }
export type GetParentCompanyDetailByUserIdQueryHookResult = ReturnType<typeof useGetParentCompanyDetailByUserIdQuery>;
export type GetParentCompanyDetailByUserIdLazyQueryHookResult = ReturnType<typeof useGetParentCompanyDetailByUserIdLazyQuery>;
export type GetParentCompanyDetailByUserIdSuspenseQueryHookResult = ReturnType<typeof useGetParentCompanyDetailByUserIdSuspenseQuery>;
export type GetParentCompanyDetailByUserIdQueryResult = Apollo.QueryResult<Types.GetParentCompanyDetailByUserIdQuery, Types.GetParentCompanyDetailByUserIdQueryVariables>;