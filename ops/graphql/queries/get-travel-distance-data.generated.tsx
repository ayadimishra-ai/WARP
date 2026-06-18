import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetTravelDistanceDetailQueryVariables = Types.Exact<{
  where: Types.TravelDistance_Bool_Exp;
}>;


export type GetTravelDistanceDetailQuery = { __typename?: 'query_root', TravelDistance: Array<{ __typename?: 'TravelDistance', from_location_pincode?: string | null, from_location_country?: string | null, to_location_pincode?: string | null, to_location_country?: string | null, mode_of_transport?: string | null, distance?: any | null }> };


export const GetTravelDistanceDetailDocument = gql`
    query getTravelDistanceDetail($where: TravelDistance_bool_exp!) {
  TravelDistance(where: $where) {
    from_location_pincode
    from_location_country
    to_location_pincode
    to_location_country
    mode_of_transport
    distance
  }
}
    `;

/**
 * __useGetTravelDistanceDetailQuery__
 *
 * To run a query within a React component, call `useGetTravelDistanceDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTravelDistanceDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTravelDistanceDetailQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetTravelDistanceDetailQuery(baseOptions: Apollo.QueryHookOptions<GetTravelDistanceDetailQuery, GetTravelDistanceDetailQueryVariables> & ({ variables: GetTravelDistanceDetailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTravelDistanceDetailQuery, GetTravelDistanceDetailQueryVariables>(GetTravelDistanceDetailDocument, options);
      }
export function useGetTravelDistanceDetailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTravelDistanceDetailQuery, GetTravelDistanceDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTravelDistanceDetailQuery, GetTravelDistanceDetailQueryVariables>(GetTravelDistanceDetailDocument, options);
        }
export function useGetTravelDistanceDetailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTravelDistanceDetailQuery, GetTravelDistanceDetailQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTravelDistanceDetailQuery, GetTravelDistanceDetailQueryVariables>(GetTravelDistanceDetailDocument, options);
        }
export type GetTravelDistanceDetailQueryHookResult = ReturnType<typeof useGetTravelDistanceDetailQuery>;
export type GetTravelDistanceDetailLazyQueryHookResult = ReturnType<typeof useGetTravelDistanceDetailLazyQuery>;
export type GetTravelDistanceDetailSuspenseQueryHookResult = ReturnType<typeof useGetTravelDistanceDetailSuspenseQuery>;
export type GetTravelDistanceDetailQueryResult = Apollo.QueryResult<GetTravelDistanceDetailQuery, GetTravelDistanceDetailQueryVariables>;