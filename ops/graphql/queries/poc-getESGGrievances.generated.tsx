import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetEsgGrievancesByPeriodQueryVariables = Types.Exact<{
  fromDate: Types.Scalars['date']['input'];
  toDate: Types.Scalars['date']['input'];
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetEsgGrievancesByPeriodQuery = { __typename?: 'query_root', poc_view_esg_grievances: Array<{ __typename?: 'poc_view_esg_grievances', organization_id?: any | null, year?: number | null, month?: number | null, period_date?: any | null, stakeholder_category?: string | null, total_complaints?: any | null }> };


export const GetEsgGrievancesByPeriodDocument = gql`
    query getESGGrievancesByPeriod($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_esg_grievances(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    stakeholder_category
    total_complaints
  }
}
    `;

/**
 * __useGetEsgGrievancesByPeriodQuery__
 *
 * To run a query within a React component, call `useGetEsgGrievancesByPeriodQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEsgGrievancesByPeriodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEsgGrievancesByPeriodQuery({
 *   variables: {
 *      fromDate: // value for 'fromDate'
 *      toDate: // value for 'toDate'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetEsgGrievancesByPeriodQuery(baseOptions: Apollo.QueryHookOptions<GetEsgGrievancesByPeriodQuery, GetEsgGrievancesByPeriodQueryVariables> & ({ variables: GetEsgGrievancesByPeriodQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEsgGrievancesByPeriodQuery, GetEsgGrievancesByPeriodQueryVariables>(GetEsgGrievancesByPeriodDocument, options);
      }
export function useGetEsgGrievancesByPeriodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEsgGrievancesByPeriodQuery, GetEsgGrievancesByPeriodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEsgGrievancesByPeriodQuery, GetEsgGrievancesByPeriodQueryVariables>(GetEsgGrievancesByPeriodDocument, options);
        }
export function useGetEsgGrievancesByPeriodSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEsgGrievancesByPeriodQuery, GetEsgGrievancesByPeriodQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEsgGrievancesByPeriodQuery, GetEsgGrievancesByPeriodQueryVariables>(GetEsgGrievancesByPeriodDocument, options);
        }
export type GetEsgGrievancesByPeriodQueryHookResult = ReturnType<typeof useGetEsgGrievancesByPeriodQuery>;
export type GetEsgGrievancesByPeriodLazyQueryHookResult = ReturnType<typeof useGetEsgGrievancesByPeriodLazyQuery>;
export type GetEsgGrievancesByPeriodSuspenseQueryHookResult = ReturnType<typeof useGetEsgGrievancesByPeriodSuspenseQuery>;
export type GetEsgGrievancesByPeriodQueryResult = Apollo.QueryResult<GetEsgGrievancesByPeriodQuery, GetEsgGrievancesByPeriodQueryVariables>;