import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const CheckIsPasswordResetDocument = gql`
    query CheckIsPasswordReset($email: String!) {
  User(where: {email: {_eq: $email}}) {
    id
    IsPasswordReset
  }
}
    `;

/**
 * __useCheckIsPasswordResetQuery__
 *
 * To run a query within a React component, call `useCheckIsPasswordResetQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckIsPasswordResetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckIsPasswordResetQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useCheckIsPasswordResetQuery(baseOptions: Apollo.QueryHookOptions<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables> & ({ variables: Types.CheckIsPasswordResetQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>(CheckIsPasswordResetDocument, options);
      }
export function useCheckIsPasswordResetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>(CheckIsPasswordResetDocument, options);
        }
// @ts-ignore
export function useCheckIsPasswordResetSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>): Apollo.UseSuspenseQueryResult<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>;
export function useCheckIsPasswordResetSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>): Apollo.UseSuspenseQueryResult<Types.CheckIsPasswordResetQuery | undefined, Types.CheckIsPasswordResetQueryVariables>;
export function useCheckIsPasswordResetSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>(CheckIsPasswordResetDocument, options);
        }
export type CheckIsPasswordResetQueryHookResult = ReturnType<typeof useCheckIsPasswordResetQuery>;
export type CheckIsPasswordResetLazyQueryHookResult = ReturnType<typeof useCheckIsPasswordResetLazyQuery>;
export type CheckIsPasswordResetSuspenseQueryHookResult = ReturnType<typeof useCheckIsPasswordResetSuspenseQuery>;
export type CheckIsPasswordResetQueryResult = Apollo.QueryResult<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>;