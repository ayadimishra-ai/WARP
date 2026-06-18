import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetConversationMessagesDocument = gql`
    query GetConversationMessages($conversationId: uuid!, $limit: Int = 20, $cursor: timestamptz, $withCursor: Boolean = false) {
  AIMessages(
    where: {conversationId: {_eq: $conversationId}, _and: [{createdAt: {_lt: $cursor}}]}
    order_by: [{createdAt: desc}]
    limit: $limit
  ) @include(if: $withCursor) {
    messageId
    conversationId
    role
    content
    rephrasedContent
    sources
    type
    createdAt
    updatedAt
    metadata
  }
  AIMessagesAll: AIMessages(
    where: {conversationId: {_eq: $conversationId}}
    order_by: [{createdAt: desc}]
    limit: $limit
  ) @skip(if: $withCursor) {
    messageId
    conversationId
    role
    content
    rephrasedContent
    sources
    type
    createdAt
    updatedAt
    metadata
  }
}
    `;

/**
 * __useGetConversationMessagesQuery__
 *
 * To run a query within a React component, call `useGetConversationMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetConversationMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConversationMessagesQuery({
 *   variables: {
 *      conversationId: // value for 'conversationId'
 *      limit: // value for 'limit'
 *      cursor: // value for 'cursor'
 *      withCursor: // value for 'withCursor'
 *   },
 * });
 */
export function useGetConversationMessagesQuery(baseOptions: Apollo.QueryHookOptions<Types.GetConversationMessagesQuery, Types.GetConversationMessagesQueryVariables> & ({ variables: Types.GetConversationMessagesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetConversationMessagesQuery, Types.GetConversationMessagesQueryVariables>(GetConversationMessagesDocument, options);
      }
export function useGetConversationMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetConversationMessagesQuery, Types.GetConversationMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetConversationMessagesQuery, Types.GetConversationMessagesQueryVariables>(GetConversationMessagesDocument, options);
        }
// @ts-ignore
export function useGetConversationMessagesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetConversationMessagesQuery, Types.GetConversationMessagesQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetConversationMessagesQuery, Types.GetConversationMessagesQueryVariables>;
export function useGetConversationMessagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetConversationMessagesQuery, Types.GetConversationMessagesQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetConversationMessagesQuery | undefined, Types.GetConversationMessagesQueryVariables>;
export function useGetConversationMessagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetConversationMessagesQuery, Types.GetConversationMessagesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetConversationMessagesQuery, Types.GetConversationMessagesQueryVariables>(GetConversationMessagesDocument, options);
        }
export type GetConversationMessagesQueryHookResult = ReturnType<typeof useGetConversationMessagesQuery>;
export type GetConversationMessagesLazyQueryHookResult = ReturnType<typeof useGetConversationMessagesLazyQuery>;
export type GetConversationMessagesSuspenseQueryHookResult = ReturnType<typeof useGetConversationMessagesSuspenseQuery>;
export type GetConversationMessagesQueryResult = Apollo.QueryResult<Types.GetConversationMessagesQuery, Types.GetConversationMessagesQueryVariables>;