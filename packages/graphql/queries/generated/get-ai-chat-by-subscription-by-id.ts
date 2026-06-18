import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetSubscriptionByIdDocument = gql`
    query GetSubscriptionById($id: uuid!) {
  AIChatSubscription(where: {id: {_eq: $id}}) {
    id
    companyId
    subscriptionName
    hasDocumentRepo
    hasESG
    hasBRSR
    textualLimit
    graphicalLimit
    startDate
    endDate
    isActive
    note
    metadata
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetSubscriptionByIdQuery__
 *
 * To run a query within a React component, call `useGetSubscriptionByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubscriptionByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubscriptionByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetSubscriptionByIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetSubscriptionByIdQuery, Types.GetSubscriptionByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetSubscriptionByIdQuery, Types.GetSubscriptionByIdQueryVariables>(GetSubscriptionByIdDocument, options);
      }
export function useGetSubscriptionByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetSubscriptionByIdQuery, Types.GetSubscriptionByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetSubscriptionByIdQuery, Types.GetSubscriptionByIdQueryVariables>(GetSubscriptionByIdDocument, options);
        }
export type GetSubscriptionByIdQueryHookResult = ReturnType<typeof useGetSubscriptionByIdQuery>;
export type GetSubscriptionByIdLazyQueryHookResult = ReturnType<typeof useGetSubscriptionByIdLazyQuery>;
export type GetSubscriptionByIdQueryResult = Apollo.QueryResult<Types.GetSubscriptionByIdQuery, Types.GetSubscriptionByIdQueryVariables>;