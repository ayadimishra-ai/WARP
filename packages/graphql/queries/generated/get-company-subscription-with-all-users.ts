import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetCompanySubscriptionWithAllUsersDocument = gql`
    query GetCompanySubscriptionWithAllUsers($companyId: uuid!) {
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
    AIChatUserAllocations(where: {isActive: {_eq: true}}) {
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
 * __useGetCompanySubscriptionWithAllUsersQuery__
 *
 * To run a query within a React component, call `useGetCompanySubscriptionWithAllUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanySubscriptionWithAllUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanySubscriptionWithAllUsersQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetCompanySubscriptionWithAllUsersQuery(baseOptions: Apollo.QueryHookOptions<Types.GetCompanySubscriptionWithAllUsersQuery, Types.GetCompanySubscriptionWithAllUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetCompanySubscriptionWithAllUsersQuery, Types.GetCompanySubscriptionWithAllUsersQueryVariables>(GetCompanySubscriptionWithAllUsersDocument, options);
      }
export function useGetCompanySubscriptionWithAllUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetCompanySubscriptionWithAllUsersQuery, Types.GetCompanySubscriptionWithAllUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetCompanySubscriptionWithAllUsersQuery, Types.GetCompanySubscriptionWithAllUsersQueryVariables>(GetCompanySubscriptionWithAllUsersDocument, options);
        }
export type GetCompanySubscriptionWithAllUsersQueryHookResult = ReturnType<typeof useGetCompanySubscriptionWithAllUsersQuery>;
export type GetCompanySubscriptionWithAllUsersLazyQueryHookResult = ReturnType<typeof useGetCompanySubscriptionWithAllUsersLazyQuery>;
export type GetCompanySubscriptionWithAllUsersQueryResult = Apollo.QueryResult<Types.GetCompanySubscriptionWithAllUsersQuery, Types.GetCompanySubscriptionWithAllUsersQueryVariables>;