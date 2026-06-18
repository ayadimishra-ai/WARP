import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetPlatformAndUserDetailsToGenerateTokenDocument = gql`
    query getPlatformAndUserDetailsToGenerateToken($sharedKey: uuid!, $secretKey: String!, $companyId: uuid!, $userEmail: String!) {
  Platform(where: {id: {_eq: $sharedKey}, apiKey: {_eq: $secretKey}}) {
    id
    Companies(where: {id: {_eq: $companyId}}) {
      id
      Users(where: {companyId: {_eq: $companyId}, email: {_eq: $userEmail}}) {
        id
        companyId
        email
        UserRoles {
          roleName
        }
      }
    }
  }
}
    `;

/**
 * __useGetPlatformAndUserDetailsToGenerateTokenQuery__
 *
 * To run a query within a React component, call `useGetPlatformAndUserDetailsToGenerateTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPlatformAndUserDetailsToGenerateTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPlatformAndUserDetailsToGenerateTokenQuery({
 *   variables: {
 *      sharedKey: // value for 'sharedKey'
 *      secretKey: // value for 'secretKey'
 *      companyId: // value for 'companyId'
 *      userEmail: // value for 'userEmail'
 *   },
 * });
 */
export function useGetPlatformAndUserDetailsToGenerateTokenQuery(baseOptions: Apollo.QueryHookOptions<Types.GetPlatformAndUserDetailsToGenerateTokenQuery, Types.GetPlatformAndUserDetailsToGenerateTokenQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetPlatformAndUserDetailsToGenerateTokenQuery, Types.GetPlatformAndUserDetailsToGenerateTokenQueryVariables>(GetPlatformAndUserDetailsToGenerateTokenDocument, options);
      }
export function useGetPlatformAndUserDetailsToGenerateTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetPlatformAndUserDetailsToGenerateTokenQuery, Types.GetPlatformAndUserDetailsToGenerateTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetPlatformAndUserDetailsToGenerateTokenQuery, Types.GetPlatformAndUserDetailsToGenerateTokenQueryVariables>(GetPlatformAndUserDetailsToGenerateTokenDocument, options);
        }
export type GetPlatformAndUserDetailsToGenerateTokenQueryHookResult = ReturnType<typeof useGetPlatformAndUserDetailsToGenerateTokenQuery>;
export type GetPlatformAndUserDetailsToGenerateTokenLazyQueryHookResult = ReturnType<typeof useGetPlatformAndUserDetailsToGenerateTokenLazyQuery>;
export type GetPlatformAndUserDetailsToGenerateTokenQueryResult = Apollo.QueryResult<Types.GetPlatformAndUserDetailsToGenerateTokenQuery, Types.GetPlatformAndUserDetailsToGenerateTokenQueryVariables>;