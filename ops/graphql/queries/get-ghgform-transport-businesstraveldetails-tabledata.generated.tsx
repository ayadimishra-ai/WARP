import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgTransportBusinessTravelDetailsQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.GhgTransport_BusinessTravel_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  size?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  orderBy?: Types.InputMaybe<Array<Types.GhgTransport_BusinessTravel_Order_By> | Types.GhgTransport_BusinessTravel_Order_By>;
}>;


export type GetGhgTransportBusinessTravelDetailsQuery = { __typename?: 'query_root', GHGTransport_BusinessTravel: Array<{ __typename?: 'GHGTransport_BusinessTravel', Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null }>, totalCount: { __typename?: 'GHGTransport_BusinessTravel_aggregate', aggregate?: { __typename?: 'GHGTransport_BusinessTravel_aggregate_fields', count: number } | null } };


export const GetGhgTransportBusinessTravelDetailsDocument = gql`
    query getGHGTransportBusinessTravelDetails($activityFilter: GHGTransport_BusinessTravel_bool_exp, $start: Int, $size: Int, $orderBy: [GHGTransport_BusinessTravel_order_by!]) {
  GHGTransport_BusinessTravel(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
  }
  totalCount: GHGTransport_BusinessTravel_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetGhgTransportBusinessTravelDetailsQuery__
 *
 * To run a query within a React component, call `useGetGhgTransportBusinessTravelDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgTransportBusinessTravelDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgTransportBusinessTravelDetailsQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgTransportBusinessTravelDetailsQuery(baseOptions?: Apollo.QueryHookOptions<GetGhgTransportBusinessTravelDetailsQuery, GetGhgTransportBusinessTravelDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgTransportBusinessTravelDetailsQuery, GetGhgTransportBusinessTravelDetailsQueryVariables>(GetGhgTransportBusinessTravelDetailsDocument, options);
      }
export function useGetGhgTransportBusinessTravelDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgTransportBusinessTravelDetailsQuery, GetGhgTransportBusinessTravelDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgTransportBusinessTravelDetailsQuery, GetGhgTransportBusinessTravelDetailsQueryVariables>(GetGhgTransportBusinessTravelDetailsDocument, options);
        }
export function useGetGhgTransportBusinessTravelDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgTransportBusinessTravelDetailsQuery, GetGhgTransportBusinessTravelDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgTransportBusinessTravelDetailsQuery, GetGhgTransportBusinessTravelDetailsQueryVariables>(GetGhgTransportBusinessTravelDetailsDocument, options);
        }
export type GetGhgTransportBusinessTravelDetailsQueryHookResult = ReturnType<typeof useGetGhgTransportBusinessTravelDetailsQuery>;
export type GetGhgTransportBusinessTravelDetailsLazyQueryHookResult = ReturnType<typeof useGetGhgTransportBusinessTravelDetailsLazyQuery>;
export type GetGhgTransportBusinessTravelDetailsSuspenseQueryHookResult = ReturnType<typeof useGetGhgTransportBusinessTravelDetailsSuspenseQuery>;
export type GetGhgTransportBusinessTravelDetailsQueryResult = Apollo.QueryResult<GetGhgTransportBusinessTravelDetailsQuery, GetGhgTransportBusinessTravelDetailsQueryVariables>;