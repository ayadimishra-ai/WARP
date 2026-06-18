import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetEsgScope2EmissionQueryVariables = Types.Exact<{
  fromDate: Types.Scalars['date']['input'];
  toDate: Types.Scalars['date']['input'];
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetEsgScope2EmissionQuery = { __typename?: 'query_root', poc_view_emission_by_scope: Array<{ __typename?: 'poc_view_emission_by_scope', organization_id?: any | null, year?: any | null, month?: any | null, period_date?: any | null, em_scope2?: any | null }> };


export const GetEsgScope2EmissionDocument = gql`
    query getESGScope2Emission($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_emission_by_scope(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    em_scope2
  }
}
    `;

/**
 * __useGetEsgScope2EmissionQuery__
 *
 * To run a query within a React component, call `useGetEsgScope2EmissionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEsgScope2EmissionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEsgScope2EmissionQuery({
 *   variables: {
 *      fromDate: // value for 'fromDate'
 *      toDate: // value for 'toDate'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetEsgScope2EmissionQuery(baseOptions: Apollo.QueryHookOptions<GetEsgScope2EmissionQuery, GetEsgScope2EmissionQueryVariables> & ({ variables: GetEsgScope2EmissionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEsgScope2EmissionQuery, GetEsgScope2EmissionQueryVariables>(GetEsgScope2EmissionDocument, options);
      }
export function useGetEsgScope2EmissionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEsgScope2EmissionQuery, GetEsgScope2EmissionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEsgScope2EmissionQuery, GetEsgScope2EmissionQueryVariables>(GetEsgScope2EmissionDocument, options);
        }
export function useGetEsgScope2EmissionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEsgScope2EmissionQuery, GetEsgScope2EmissionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEsgScope2EmissionQuery, GetEsgScope2EmissionQueryVariables>(GetEsgScope2EmissionDocument, options);
        }
export type GetEsgScope2EmissionQueryHookResult = ReturnType<typeof useGetEsgScope2EmissionQuery>;
export type GetEsgScope2EmissionLazyQueryHookResult = ReturnType<typeof useGetEsgScope2EmissionLazyQuery>;
export type GetEsgScope2EmissionSuspenseQueryHookResult = ReturnType<typeof useGetEsgScope2EmissionSuspenseQuery>;
export type GetEsgScope2EmissionQueryResult = Apollo.QueryResult<GetEsgScope2EmissionQuery, GetEsgScope2EmissionQueryVariables>;