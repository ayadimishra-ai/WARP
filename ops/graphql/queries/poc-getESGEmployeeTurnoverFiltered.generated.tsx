import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetEsgEmployeeTurnoverByPeriodQueryVariables = Types.Exact<{
  fromDate: Types.Scalars['date']['input'];
  toDate: Types.Scalars['date']['input'];
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetEsgEmployeeTurnoverByPeriodQuery = { __typename?: 'query_root', poc_view_esg_employee_turnover: Array<{ __typename?: 'poc_view_esg_employee_turnover', organization_id?: any | null, year?: number | null, month?: number | null, period_date?: any | null, employment_type?: string | null, total_employees?: any | null, employees_exists?: any | null, employees_new_hires?: any | null }> };


export const GetEsgEmployeeTurnoverByPeriodDocument = gql`
    query getESGEmployeeTurnoverByPeriod($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_esg_employee_turnover(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    employment_type
    total_employees
    employees_exists
    employees_new_hires
  }
}
    `;

/**
 * __useGetEsgEmployeeTurnoverByPeriodQuery__
 *
 * To run a query within a React component, call `useGetEsgEmployeeTurnoverByPeriodQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEsgEmployeeTurnoverByPeriodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEsgEmployeeTurnoverByPeriodQuery({
 *   variables: {
 *      fromDate: // value for 'fromDate'
 *      toDate: // value for 'toDate'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetEsgEmployeeTurnoverByPeriodQuery(baseOptions: Apollo.QueryHookOptions<GetEsgEmployeeTurnoverByPeriodQuery, GetEsgEmployeeTurnoverByPeriodQueryVariables> & ({ variables: GetEsgEmployeeTurnoverByPeriodQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEsgEmployeeTurnoverByPeriodQuery, GetEsgEmployeeTurnoverByPeriodQueryVariables>(GetEsgEmployeeTurnoverByPeriodDocument, options);
      }
export function useGetEsgEmployeeTurnoverByPeriodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEsgEmployeeTurnoverByPeriodQuery, GetEsgEmployeeTurnoverByPeriodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEsgEmployeeTurnoverByPeriodQuery, GetEsgEmployeeTurnoverByPeriodQueryVariables>(GetEsgEmployeeTurnoverByPeriodDocument, options);
        }
export function useGetEsgEmployeeTurnoverByPeriodSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEsgEmployeeTurnoverByPeriodQuery, GetEsgEmployeeTurnoverByPeriodQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEsgEmployeeTurnoverByPeriodQuery, GetEsgEmployeeTurnoverByPeriodQueryVariables>(GetEsgEmployeeTurnoverByPeriodDocument, options);
        }
export type GetEsgEmployeeTurnoverByPeriodQueryHookResult = ReturnType<typeof useGetEsgEmployeeTurnoverByPeriodQuery>;
export type GetEsgEmployeeTurnoverByPeriodLazyQueryHookResult = ReturnType<typeof useGetEsgEmployeeTurnoverByPeriodLazyQuery>;
export type GetEsgEmployeeTurnoverByPeriodSuspenseQueryHookResult = ReturnType<typeof useGetEsgEmployeeTurnoverByPeriodSuspenseQuery>;
export type GetEsgEmployeeTurnoverByPeriodQueryResult = Apollo.QueryResult<GetEsgEmployeeTurnoverByPeriodQuery, GetEsgEmployeeTurnoverByPeriodQueryVariables>;