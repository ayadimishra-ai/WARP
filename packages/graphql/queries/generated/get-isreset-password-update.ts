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
export function useCheckIsPasswordResetQuery(baseOptions: Apollo.QueryHookOptions<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>(CheckIsPasswordResetDocument, options);
      }
export function useCheckIsPasswordResetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>(CheckIsPasswordResetDocument, options);
        }
export type CheckIsPasswordResetQueryHookResult = ReturnType<typeof useCheckIsPasswordResetQuery>;
export type CheckIsPasswordResetLazyQueryHookResult = ReturnType<typeof useCheckIsPasswordResetLazyQuery>;
export type CheckIsPasswordResetQueryResult = Apollo.QueryResult<Types.CheckIsPasswordResetQuery, Types.CheckIsPasswordResetQueryVariables>;