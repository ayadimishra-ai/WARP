import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAiChatUsageByCompanyIdDocument = gql`
    query GetAIChatUsageByCompanyId($companyId: uuid!) {
  AIChatUsage(where: {companyId: {_eq: $companyId}}) {
    id
    subscriptionId
    companyId
    textualUsed
    graphicalUsed
    metadata
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetAiChatUsageByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetAiChatUsageByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAiChatUsageByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAiChatUsageByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetAiChatUsageByCompanyIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetAiChatUsageByCompanyIdQuery, Types.GetAiChatUsageByCompanyIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAiChatUsageByCompanyIdQuery, Types.GetAiChatUsageByCompanyIdQueryVariables>(GetAiChatUsageByCompanyIdDocument, options);
      }
export function useGetAiChatUsageByCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAiChatUsageByCompanyIdQuery, Types.GetAiChatUsageByCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAiChatUsageByCompanyIdQuery, Types.GetAiChatUsageByCompanyIdQueryVariables>(GetAiChatUsageByCompanyIdDocument, options);
        }
export type GetAiChatUsageByCompanyIdQueryHookResult = ReturnType<typeof useGetAiChatUsageByCompanyIdQuery>;
export type GetAiChatUsageByCompanyIdLazyQueryHookResult = ReturnType<typeof useGetAiChatUsageByCompanyIdLazyQuery>;
export type GetAiChatUsageByCompanyIdQueryResult = Apollo.QueryResult<Types.GetAiChatUsageByCompanyIdQuery, Types.GetAiChatUsageByCompanyIdQueryVariables>;