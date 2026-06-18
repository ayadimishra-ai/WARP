import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetNullDistanceTravelDdistanceDataQueryVariables = Types.Exact<{
  fromdate: Types.Scalars['timestamptz']['input'];
  todate: Types.Scalars['timestamptz']['input'];
}>;


export type GetNullDistanceTravelDdistanceDataQuery = { __typename?: 'query_root', TravelDistance: Array<{ __typename?: 'TravelDistance', id: any, from_location_country?: string | null, from_location_pincode?: string | null, to_location_country?: string | null, to_location_pincode?: string | null, mode_of_transport?: string | null }> };


export const GetNullDistanceTravelDdistanceDataDocument = gql`
    query getNullDistanceTravelDdistanceData($fromdate: timestamptz!, $todate: timestamptz!) {
  TravelDistance(
    where: {created_at: {_gte: $fromdate, _lte: $todate}, distance: {_is_null: true}}
    limit: 500
  ) {
    id
    from_location_country
    from_location_pincode
    to_location_country
    to_location_pincode
    mode_of_transport
  }
}
    `;

/**
 * __useGetNullDistanceTravelDdistanceDataQuery__
 *
 * To run a query within a React component, call `useGetNullDistanceTravelDdistanceDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNullDistanceTravelDdistanceDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNullDistanceTravelDdistanceDataQuery({
 *   variables: {
 *      fromdate: // value for 'fromdate'
 *      todate: // value for 'todate'
 *   },
 * });
 */
export function useGetNullDistanceTravelDdistanceDataQuery(baseOptions: Apollo.QueryHookOptions<GetNullDistanceTravelDdistanceDataQuery, GetNullDistanceTravelDdistanceDataQueryVariables> & ({ variables: GetNullDistanceTravelDdistanceDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNullDistanceTravelDdistanceDataQuery, GetNullDistanceTravelDdistanceDataQueryVariables>(GetNullDistanceTravelDdistanceDataDocument, options);
      }
export function useGetNullDistanceTravelDdistanceDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNullDistanceTravelDdistanceDataQuery, GetNullDistanceTravelDdistanceDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNullDistanceTravelDdistanceDataQuery, GetNullDistanceTravelDdistanceDataQueryVariables>(GetNullDistanceTravelDdistanceDataDocument, options);
        }
export function useGetNullDistanceTravelDdistanceDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNullDistanceTravelDdistanceDataQuery, GetNullDistanceTravelDdistanceDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNullDistanceTravelDdistanceDataQuery, GetNullDistanceTravelDdistanceDataQueryVariables>(GetNullDistanceTravelDdistanceDataDocument, options);
        }
export type GetNullDistanceTravelDdistanceDataQueryHookResult = ReturnType<typeof useGetNullDistanceTravelDdistanceDataQuery>;
export type GetNullDistanceTravelDdistanceDataLazyQueryHookResult = ReturnType<typeof useGetNullDistanceTravelDdistanceDataLazyQuery>;
export type GetNullDistanceTravelDdistanceDataSuspenseQueryHookResult = ReturnType<typeof useGetNullDistanceTravelDdistanceDataSuspenseQuery>;
export type GetNullDistanceTravelDdistanceDataQueryResult = Apollo.QueryResult<GetNullDistanceTravelDdistanceDataQuery, GetNullDistanceTravelDdistanceDataQueryVariables>;