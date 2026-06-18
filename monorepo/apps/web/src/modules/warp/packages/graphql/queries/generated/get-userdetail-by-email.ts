import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetUserDetailByEmailDocument = gql`
    query getUserDetailByEmail($newEmail: [String!]) {
  User(where: {email: {_in: $newEmail}}) {
    email
    id
    name
    companyId
    AddressMappings {
      AddressId
      id
    }
  }
  Company(where: {primaryContact: {_contains: {email: $newEmail}}}) {
    id
    name
    primaryContact
  }
}
    `;

/**
 * __useGetUserDetailByEmailQuery__
 *
 * To run a query within a React component, call `useGetUserDetailByEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailByEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailByEmailQuery({
 *   variables: {
 *      newEmail: // value for 'newEmail'
 *   },
 * });
 */
export function useGetUserDetailByEmailQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetUserDetailByEmailQuery, Types.GetUserDetailByEmailQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetUserDetailByEmailQuery, Types.GetUserDetailByEmailQueryVariables>(GetUserDetailByEmailDocument, options);
      }
export function useGetUserDetailByEmailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetUserDetailByEmailQuery, Types.GetUserDetailByEmailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetUserDetailByEmailQuery, Types.GetUserDetailByEmailQueryVariables>(GetUserDetailByEmailDocument, options);
        }
// @ts-ignore
export function useGetUserDetailByEmailSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByEmailQuery, Types.GetUserDetailByEmailQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetUserDetailByEmailQuery, Types.GetUserDetailByEmailQueryVariables>;
export function useGetUserDetailByEmailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByEmailQuery, Types.GetUserDetailByEmailQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetUserDetailByEmailQuery | undefined, Types.GetUserDetailByEmailQueryVariables>;
export function useGetUserDetailByEmailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetUserDetailByEmailQuery, Types.GetUserDetailByEmailQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetUserDetailByEmailQuery, Types.GetUserDetailByEmailQueryVariables>(GetUserDetailByEmailDocument, options);
        }
export type GetUserDetailByEmailQueryHookResult = ReturnType<typeof useGetUserDetailByEmailQuery>;
export type GetUserDetailByEmailLazyQueryHookResult = ReturnType<typeof useGetUserDetailByEmailLazyQuery>;
export type GetUserDetailByEmailSuspenseQueryHookResult = ReturnType<typeof useGetUserDetailByEmailSuspenseQuery>;
export type GetUserDetailByEmailQueryResult = Apollo.QueryResult<Types.GetUserDetailByEmailQuery, Types.GetUserDetailByEmailQueryVariables>;