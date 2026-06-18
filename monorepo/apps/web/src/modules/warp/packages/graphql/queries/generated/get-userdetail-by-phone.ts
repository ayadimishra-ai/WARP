import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetUserDetailByPhoneDocument = gql`
    query getUserDetailByPhone($phone: [String!]) {
  User(where: {phone: {_in: $phone}, isActive: {_eq: true}}) {
    phone
  }
}
    `;

/**
 * __useGetUserDetailByPhoneQuery__
 *
 * To run a query within a React component, call `useGetUserDetailByPhoneQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailByPhoneQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailByPhoneQuery({
 *   variables: {
 *      phone: // value for 'phone'
 *   },
 * });
 */
export function useGetUserDetailByPhoneQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetUserDetailByPhoneQuery, Types.GetUserDetailByPhoneQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetUserDetailByPhoneQuery, Types.GetUserDetailByPhoneQueryVariables>(GetUserDetailByPhoneDocument, options);
      }
export function useGetUserDetailByPhoneLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetUserDetailByPhoneQuery, Types.GetUserDetailByPhoneQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetUserDetailByPhoneQuery, Types.GetUserDetailByPhoneQueryVariables>(GetUserDetailByPhoneDocument, options);
        }
// @ts-ignore
export function useGetUserDetailByPhoneSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByPhoneQuery, Types.GetUserDetailByPhoneQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetUserDetailByPhoneQuery, Types.GetUserDetailByPhoneQueryVariables>;
export function useGetUserDetailByPhoneSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByPhoneQuery, Types.GetUserDetailByPhoneQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetUserDetailByPhoneQuery | undefined, Types.GetUserDetailByPhoneQueryVariables>;
export function useGetUserDetailByPhoneSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByPhoneQuery, Types.GetUserDetailByPhoneQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetUserDetailByPhoneQuery, Types.GetUserDetailByPhoneQueryVariables>(GetUserDetailByPhoneDocument, options);
        }
export type GetUserDetailByPhoneQueryHookResult = ReturnType<typeof useGetUserDetailByPhoneQuery>;
export type GetUserDetailByPhoneLazyQueryHookResult = ReturnType<typeof useGetUserDetailByPhoneLazyQuery>;
export type GetUserDetailByPhoneSuspenseQueryHookResult = ReturnType<typeof useGetUserDetailByPhoneSuspenseQuery>;
export type GetUserDetailByPhoneQueryResult = Apollo.QueryResult<Types.GetUserDetailByPhoneQuery, Types.GetUserDetailByPhoneQueryVariables>;