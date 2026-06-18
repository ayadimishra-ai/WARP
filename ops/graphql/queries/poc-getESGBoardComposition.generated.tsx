import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetEsgBoardCompositionByPeriodQueryVariables = Types.Exact<{
  fromDate: Types.Scalars['date']['input'];
  toDate: Types.Scalars['date']['input'];
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetEsgBoardCompositionByPeriodQuery = { __typename?: 'query_root', poc_view_esg_board_omposition: Array<{ __typename?: 'poc_view_esg_board_omposition', organization_id?: any | null, year?: number | null, month?: number | null, period_date?: any | null, total_female_directors?: any | null }> };


export const GetEsgBoardCompositionByPeriodDocument = gql`
    query getESGBoardCompositionByPeriod($fromDate: date!, $toDate: date!, $organizationId: uuid!) {
  poc_view_esg_board_omposition(
    where: {period_date: {_gte: $fromDate, _lte: $toDate}, organization_id: {_eq: $organizationId}}
    order_by: {period_date: asc}
  ) {
    organization_id
    year
    month
    period_date
    total_female_directors
  }
}
    `;

/**
 * __useGetEsgBoardCompositionByPeriodQuery__
 *
 * To run a query within a React component, call `useGetEsgBoardCompositionByPeriodQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEsgBoardCompositionByPeriodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEsgBoardCompositionByPeriodQuery({
 *   variables: {
 *      fromDate: // value for 'fromDate'
 *      toDate: // value for 'toDate'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetEsgBoardCompositionByPeriodQuery(baseOptions: Apollo.QueryHookOptions<GetEsgBoardCompositionByPeriodQuery, GetEsgBoardCompositionByPeriodQueryVariables> & ({ variables: GetEsgBoardCompositionByPeriodQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEsgBoardCompositionByPeriodQuery, GetEsgBoardCompositionByPeriodQueryVariables>(GetEsgBoardCompositionByPeriodDocument, options);
      }
export function useGetEsgBoardCompositionByPeriodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEsgBoardCompositionByPeriodQuery, GetEsgBoardCompositionByPeriodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEsgBoardCompositionByPeriodQuery, GetEsgBoardCompositionByPeriodQueryVariables>(GetEsgBoardCompositionByPeriodDocument, options);
        }
export function useGetEsgBoardCompositionByPeriodSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEsgBoardCompositionByPeriodQuery, GetEsgBoardCompositionByPeriodQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEsgBoardCompositionByPeriodQuery, GetEsgBoardCompositionByPeriodQueryVariables>(GetEsgBoardCompositionByPeriodDocument, options);
        }
export type GetEsgBoardCompositionByPeriodQueryHookResult = ReturnType<typeof useGetEsgBoardCompositionByPeriodQuery>;
export type GetEsgBoardCompositionByPeriodLazyQueryHookResult = ReturnType<typeof useGetEsgBoardCompositionByPeriodLazyQuery>;
export type GetEsgBoardCompositionByPeriodSuspenseQueryHookResult = ReturnType<typeof useGetEsgBoardCompositionByPeriodSuspenseQuery>;
export type GetEsgBoardCompositionByPeriodQueryResult = Apollo.QueryResult<GetEsgBoardCompositionByPeriodQuery, GetEsgBoardCompositionByPeriodQueryVariables>;