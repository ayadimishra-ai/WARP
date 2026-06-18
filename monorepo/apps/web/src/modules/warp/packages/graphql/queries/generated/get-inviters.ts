import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetInvitersDocument = gql`
    query GetInviters {
  User(where: {UserRoles: {roleName: {_eq: "Inviter"}}}) {
    id
    name
    email
    Company {
      id
      name
    }
  }
}
    `;

/**
 * __useGetInvitersQuery__
 *
 * To run a query within a React component, call `useGetInvitersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetInvitersQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetInvitersQuery, Types.GetInvitersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetInvitersQuery, Types.GetInvitersQueryVariables>(GetInvitersDocument, options);
      }
export function useGetInvitersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetInvitersQuery, Types.GetInvitersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetInvitersQuery, Types.GetInvitersQueryVariables>(GetInvitersDocument, options);
        }
// @ts-ignore
export function useGetInvitersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetInvitersQuery, Types.GetInvitersQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitersQuery, Types.GetInvitersQueryVariables>;
export function useGetInvitersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitersQuery, Types.GetInvitersQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetInvitersQuery | undefined, Types.GetInvitersQueryVariables>;
export function useGetInvitersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetInvitersQuery, Types.GetInvitersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetInvitersQuery, Types.GetInvitersQueryVariables>(GetInvitersDocument, options);
        }
export type GetInvitersQueryHookResult = ReturnType<typeof useGetInvitersQuery>;
export type GetInvitersLazyQueryHookResult = ReturnType<typeof useGetInvitersLazyQuery>;
export type GetInvitersSuspenseQueryHookResult = ReturnType<typeof useGetInvitersSuspenseQuery>;
export type GetInvitersQueryResult = Apollo.QueryResult<Types.GetInvitersQuery, Types.GetInvitersQueryVariables>;