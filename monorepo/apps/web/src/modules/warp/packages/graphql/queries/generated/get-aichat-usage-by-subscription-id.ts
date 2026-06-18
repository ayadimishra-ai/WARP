import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAiChatUsageBySubscriptionIdDocument = gql`
    query GetAIChatUsageBySubscriptionId($subscriptionId: uuid!) {
  AIChatUsage(where: {subscriptionId: {_eq: $subscriptionId}}) {
    id
    subscriptionId
    companyId
    allocationId
    textualUsed
    graphicalUsed
    metadata
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetAiChatUsageBySubscriptionIdQuery__
 *
 * To run a query within a React component, call `useGetAiChatUsageBySubscriptionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiChatUsageBySubscriptionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiChatUsageBySubscriptionIdQuery({
 *   variables: {
 *      subscriptionId: // value for 'subscriptionId'
 *   },
 * });
 */
export function useGetAiChatUsageBySubscriptionIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAiChatUsageBySubscriptionIdQuery, Types.GetAiChatUsageBySubscriptionIdQueryVariables> & ({ variables: Types.GetAiChatUsageBySubscriptionIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAiChatUsageBySubscriptionIdQuery, Types.GetAiChatUsageBySubscriptionIdQueryVariables>(GetAiChatUsageBySubscriptionIdDocument, options);
      }
export function useGetAiChatUsageBySubscriptionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAiChatUsageBySubscriptionIdQuery, Types.GetAiChatUsageBySubscriptionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAiChatUsageBySubscriptionIdQuery, Types.GetAiChatUsageBySubscriptionIdQueryVariables>(GetAiChatUsageBySubscriptionIdDocument, options);
        }
// @ts-ignore
export function useGetAiChatUsageBySubscriptionIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetAiChatUsageBySubscriptionIdQuery, Types.GetAiChatUsageBySubscriptionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAiChatUsageBySubscriptionIdQuery, Types.GetAiChatUsageBySubscriptionIdQueryVariables>;
export function useGetAiChatUsageBySubscriptionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAiChatUsageBySubscriptionIdQuery, Types.GetAiChatUsageBySubscriptionIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetAiChatUsageBySubscriptionIdQuery | undefined, Types.GetAiChatUsageBySubscriptionIdQueryVariables>;
export function useGetAiChatUsageBySubscriptionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetAiChatUsageBySubscriptionIdQuery, Types.GetAiChatUsageBySubscriptionIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetAiChatUsageBySubscriptionIdQuery, Types.GetAiChatUsageBySubscriptionIdQueryVariables>(GetAiChatUsageBySubscriptionIdDocument, options);
        }
export type GetAiChatUsageBySubscriptionIdQueryHookResult = ReturnType<typeof useGetAiChatUsageBySubscriptionIdQuery>;
export type GetAiChatUsageBySubscriptionIdLazyQueryHookResult = ReturnType<typeof useGetAiChatUsageBySubscriptionIdLazyQuery>;
export type GetAiChatUsageBySubscriptionIdSuspenseQueryHookResult = ReturnType<typeof useGetAiChatUsageBySubscriptionIdSuspenseQuery>;
export type GetAiChatUsageBySubscriptionIdQueryResult = Apollo.QueryResult<Types.GetAiChatUsageBySubscriptionIdQuery, Types.GetAiChatUsageBySubscriptionIdQueryVariables>;