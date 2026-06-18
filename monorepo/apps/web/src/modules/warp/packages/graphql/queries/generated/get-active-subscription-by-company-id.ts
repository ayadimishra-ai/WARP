import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetActiveSubscriptionByCompanyIdDocument = gql`
    query GetActiveSubscriptionByCompanyId($companyId: uuid!, $userId: uuid!) {
  AIChatSubscription(
    where: {companyId: {_eq: $companyId}, isActive: {_eq: true}, startDate: {_lte: "now()"}, endDate: {_gte: "now()"}}
    order_by: {createdAt: desc}
    limit: 1
  ) {
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
    createdAt
    updatedAt
    Company {
      id
      name
    }
    AIChatUserAllocations(
      where: {userId: {_eq: $userId}, isActive: {_eq: true}}
      limit: 1
    ) {
      id
      userId
      textualAllocated
      graphicalAllocated
      isActive
      allocatedBy
      metadata
      createdAt
      updatedAt
      AIChatUsages(limit: 1) {
        id
        textualUsed
        graphicalUsed
        metadata
        createdAt
        updatedAt
      }
    }
  }
}
    `;

/**
 * __useGetActiveSubscriptionByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetActiveSubscriptionByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveSubscriptionByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveSubscriptionByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetActiveSubscriptionByCompanyIdQuery(baseOptions: Apollo.QueryHookOptions<Types.GetActiveSubscriptionByCompanyIdQuery, Types.GetActiveSubscriptionByCompanyIdQueryVariables> & ({ variables: Types.GetActiveSubscriptionByCompanyIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetActiveSubscriptionByCompanyIdQuery, Types.GetActiveSubscriptionByCompanyIdQueryVariables>(GetActiveSubscriptionByCompanyIdDocument, options);
      }
export function useGetActiveSubscriptionByCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetActiveSubscriptionByCompanyIdQuery, Types.GetActiveSubscriptionByCompanyIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetActiveSubscriptionByCompanyIdQuery, Types.GetActiveSubscriptionByCompanyIdQueryVariables>(GetActiveSubscriptionByCompanyIdDocument, options);
        }
// @ts-ignore
export function useGetActiveSubscriptionByCompanyIdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetActiveSubscriptionByCompanyIdQuery, Types.GetActiveSubscriptionByCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetActiveSubscriptionByCompanyIdQuery, Types.GetActiveSubscriptionByCompanyIdQueryVariables>;
export function useGetActiveSubscriptionByCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetActiveSubscriptionByCompanyIdQuery, Types.GetActiveSubscriptionByCompanyIdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetActiveSubscriptionByCompanyIdQuery | undefined, Types.GetActiveSubscriptionByCompanyIdQueryVariables>;
export function useGetActiveSubscriptionByCompanyIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetActiveSubscriptionByCompanyIdQuery, Types.GetActiveSubscriptionByCompanyIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetActiveSubscriptionByCompanyIdQuery, Types.GetActiveSubscriptionByCompanyIdQueryVariables>(GetActiveSubscriptionByCompanyIdDocument, options);
        }
export type GetActiveSubscriptionByCompanyIdQueryHookResult = ReturnType<typeof useGetActiveSubscriptionByCompanyIdQuery>;
export type GetActiveSubscriptionByCompanyIdLazyQueryHookResult = ReturnType<typeof useGetActiveSubscriptionByCompanyIdLazyQuery>;
export type GetActiveSubscriptionByCompanyIdSuspenseQueryHookResult = ReturnType<typeof useGetActiveSubscriptionByCompanyIdSuspenseQuery>;
export type GetActiveSubscriptionByCompanyIdQueryResult = Apollo.QueryResult<Types.GetActiveSubscriptionByCompanyIdQuery, Types.GetActiveSubscriptionByCompanyIdQueryVariables>;