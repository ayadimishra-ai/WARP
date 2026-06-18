import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetCompanyAiSubscriptionsDocument = gql`
    query GetCompanyAISubscriptions($companyId: uuid!) {
  AISubscriptions(where: {companyId: {_eq: $companyId}}) {
    id
    subscriptionPlan
    isActive
    Form {
      id
      name
    }
  }
}
    `;

/**
 * __useGetCompanyAiSubscriptionsQuery__
 *
 * To run a query within a React component, call `useGetCompanyAiSubscriptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyAiSubscriptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyAiSubscriptionsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetCompanyAiSubscriptionsQuery(baseOptions: Apollo.QueryHookOptions<Types.GetCompanyAiSubscriptionsQuery, Types.GetCompanyAiSubscriptionsQueryVariables> & ({ variables: Types.GetCompanyAiSubscriptionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetCompanyAiSubscriptionsQuery, Types.GetCompanyAiSubscriptionsQueryVariables>(GetCompanyAiSubscriptionsDocument, options);
      }
export function useGetCompanyAiSubscriptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetCompanyAiSubscriptionsQuery, Types.GetCompanyAiSubscriptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetCompanyAiSubscriptionsQuery, Types.GetCompanyAiSubscriptionsQueryVariables>(GetCompanyAiSubscriptionsDocument, options);
        }
// @ts-ignore
export function useGetCompanyAiSubscriptionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetCompanyAiSubscriptionsQuery, Types.GetCompanyAiSubscriptionsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetCompanyAiSubscriptionsQuery, Types.GetCompanyAiSubscriptionsQueryVariables>;
export function useGetCompanyAiSubscriptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetCompanyAiSubscriptionsQuery, Types.GetCompanyAiSubscriptionsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetCompanyAiSubscriptionsQuery | undefined, Types.GetCompanyAiSubscriptionsQueryVariables>;
export function useGetCompanyAiSubscriptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetCompanyAiSubscriptionsQuery, Types.GetCompanyAiSubscriptionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetCompanyAiSubscriptionsQuery, Types.GetCompanyAiSubscriptionsQueryVariables>(GetCompanyAiSubscriptionsDocument, options);
        }
export type GetCompanyAiSubscriptionsQueryHookResult = ReturnType<typeof useGetCompanyAiSubscriptionsQuery>;
export type GetCompanyAiSubscriptionsLazyQueryHookResult = ReturnType<typeof useGetCompanyAiSubscriptionsLazyQuery>;
export type GetCompanyAiSubscriptionsSuspenseQueryHookResult = ReturnType<typeof useGetCompanyAiSubscriptionsSuspenseQuery>;
export type GetCompanyAiSubscriptionsQueryResult = Apollo.QueryResult<Types.GetCompanyAiSubscriptionsQuery, Types.GetCompanyAiSubscriptionsQueryVariables>;