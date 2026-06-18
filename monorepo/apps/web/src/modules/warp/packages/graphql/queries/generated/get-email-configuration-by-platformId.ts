import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetEmailConfigurationByplatformIdDocument = gql`
    query GetEmailConfigurationByplatformId($platformId: uuid) {
  EmailConfiguration(where: {platformId: {_eq: $platformId}}) {
    fromEmail
    host
    port
    isSecure
    user
    password
  }
}
    `;

/**
 * __useGetEmailConfigurationByplatformIdQuery__
 *
 * To run a query within a React component, call `useGetEmailConfigurationByplatformIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmailConfigurationByplatformIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmailConfigurationByplatformIdQuery({
 *   variables: {
 *      platformId: // value for 'platformId'
 *   },
 * });
 */
export function useGetEmailConfigurationByplatformIdQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetEmailConfigurationByplatformIdQuery, Types.GetEmailConfigurationByplatformIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetEmailConfigurationByplatformIdQuery, Types.GetEmailConfigurationByplatformIdQueryVariables>(GetEmailConfigurationByplatformIdDocument, options);
      }
export function useGetEmailConfigurationByplatformIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetEmailConfigurationByplatformIdQuery, Types.GetEmailConfigurationByplatformIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetEmailConfigurationByplatformIdQuery, Types.GetEmailConfigurationByplatformIdQueryVariables>(GetEmailConfigurationByplatformIdDocument, options);
        }
// @ts-ignore
export function useGetEmailConfigurationByplatformIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetEmailConfigurationByplatformIdQuery, Types.GetEmailConfigurationByplatformIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetEmailConfigurationByplatformIdQuery, Types.GetEmailConfigurationByplatformIdQueryVariables>;
export function useGetEmailConfigurationByplatformIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetEmailConfigurationByplatformIdQuery, Types.GetEmailConfigurationByplatformIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetEmailConfigurationByplatformIdQuery | undefined, Types.GetEmailConfigurationByplatformIdQueryVariables>;
export function useGetEmailConfigurationByplatformIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetEmailConfigurationByplatformIdQuery, Types.GetEmailConfigurationByplatformIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetEmailConfigurationByplatformIdQuery, Types.GetEmailConfigurationByplatformIdQueryVariables>(GetEmailConfigurationByplatformIdDocument, options);
        }
export type GetEmailConfigurationByplatformIdQueryHookResult = ReturnType<typeof useGetEmailConfigurationByplatformIdQuery>;
export type GetEmailConfigurationByplatformIdLazyQueryHookResult = ReturnType<typeof useGetEmailConfigurationByplatformIdLazyQuery>;
export type GetEmailConfigurationByplatformIdSuspenseQueryHookResult = ReturnType<typeof useGetEmailConfigurationByplatformIdSuspenseQuery>;
export type GetEmailConfigurationByplatformIdQueryResult = Apollo.QueryResult<Types.GetEmailConfigurationByplatformIdQuery, Types.GetEmailConfigurationByplatformIdQueryVariables>;