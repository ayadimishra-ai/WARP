import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetUserConversationsDocument = gql`
    query GetUserConversations($userId: uuid!, $limit: Int = 20, $cursor: timestamptz, $withCursor: Boolean = false, $searchTerm: String = "") {
  search_conversations_fts_cursor(
    args: {search_text: $searchTerm, user_id_filter: $userId, cursor_time: $cursor, result_limit: $limit}
  ) @include(if: $withCursor) {
    conversationId
    userId
    companyId
    allocationId
    title
    createdAt
    updatedAt
    isActive
  }
  AIConversationsAll: search_conversations_fts(
    args: {search_text: $searchTerm, user_id_filter: $userId, result_limit: $limit}
  ) @skip(if: $withCursor) {
    conversationId
    userId
    companyId
    allocationId
    title
    createdAt
    updatedAt
    isActive
  }
}
    `;

/**
 * __useGetUserConversationsQuery__
 *
 * To run a query within a React component, call `useGetUserConversationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserConversationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserConversationsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      limit: // value for 'limit'
 *      cursor: // value for 'cursor'
 *      withCursor: // value for 'withCursor'
 *      searchTerm: // value for 'searchTerm'
 *   },
 * });
 */
export function useGetUserConversationsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetUserConversationsQuery, Types.GetUserConversationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetUserConversationsQuery, Types.GetUserConversationsQueryVariables>(GetUserConversationsDocument, options);
      }
export function useGetUserConversationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetUserConversationsQuery, Types.GetUserConversationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetUserConversationsQuery, Types.GetUserConversationsQueryVariables>(GetUserConversationsDocument, options);
        }
export type GetUserConversationsQueryHookResult = ReturnType<typeof useGetUserConversationsQuery>;
export type GetUserConversationsLazyQueryHookResult = ReturnType<typeof useGetUserConversationsLazyQuery>;
export type GetUserConversationsQueryResult = Apollo.QueryResult<Types.GetUserConversationsQuery, Types.GetUserConversationsQueryVariables>;