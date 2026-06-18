import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgTransportUpstreamTransportDetailsQueryVariables = Types.Exact<{
  activityFilter?: Types.InputMaybe<Types.GhgTransport_Upstream_Bool_Exp>;
  start?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  size?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  orderBy?: Types.InputMaybe<Array<Types.GhgTransport_Upstream_Order_By> | Types.GhgTransport_Upstream_Order_By>;
}>;


export type GetGhgTransportUpstreamTransportDetailsQuery = { __typename?: 'query_root', GHGTransport_Upstream: Array<{ __typename?: 'GHGTransport_Upstream', Material_Procured?: string | null, Third_Party_Suppliers_of_Material?: string | null, Locations_Procured_From?: string | null, Transport_Managed_by?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, Quantity_of_Fuel_Consumed?: any | null }>, totalCount: { __typename?: 'GHGTransport_Upstream_aggregate', aggregate?: { __typename?: 'GHGTransport_Upstream_aggregate_fields', count: number } | null } };


export const GetGhgTransportUpstreamTransportDetailsDocument = gql`
    query getGHGTransportUpstreamTransportDetails($activityFilter: GHGTransport_Upstream_bool_exp, $start: Int, $size: Int, $orderBy: [GHGTransport_Upstream_order_by!]) {
  GHGTransport_Upstream(
    where: $activityFilter
    offset: $start
    limit: $size
    order_by: $orderBy
  ) {
    Material_Procured
    Third_Party_Suppliers_of_Material
    Locations_Procured_From
    Transport_Managed_by
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    Quantity_of_Fuel_Consumed
  }
  totalCount: GHGTransport_Upstream_aggregate(where: $activityFilter) {
    aggregate {
      count
    }
  }
}
    `;

/**
 * __useGetGhgTransportUpstreamTransportDetailsQuery__
 *
 * To run a query within a React component, call `useGetGhgTransportUpstreamTransportDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgTransportUpstreamTransportDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgTransportUpstreamTransportDetailsQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgTransportUpstreamTransportDetailsQuery(baseOptions?: Apollo.QueryHookOptions<GetGhgTransportUpstreamTransportDetailsQuery, GetGhgTransportUpstreamTransportDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgTransportUpstreamTransportDetailsQuery, GetGhgTransportUpstreamTransportDetailsQueryVariables>(GetGhgTransportUpstreamTransportDetailsDocument, options);
      }
export function useGetGhgTransportUpstreamTransportDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgTransportUpstreamTransportDetailsQuery, GetGhgTransportUpstreamTransportDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgTransportUpstreamTransportDetailsQuery, GetGhgTransportUpstreamTransportDetailsQueryVariables>(GetGhgTransportUpstreamTransportDetailsDocument, options);
        }
export function useGetGhgTransportUpstreamTransportDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgTransportUpstreamTransportDetailsQuery, GetGhgTransportUpstreamTransportDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgTransportUpstreamTransportDetailsQuery, GetGhgTransportUpstreamTransportDetailsQueryVariables>(GetGhgTransportUpstreamTransportDetailsDocument, options);
        }
export type GetGhgTransportUpstreamTransportDetailsQueryHookResult = ReturnType<typeof useGetGhgTransportUpstreamTransportDetailsQuery>;
export type GetGhgTransportUpstreamTransportDetailsLazyQueryHookResult = ReturnType<typeof useGetGhgTransportUpstreamTransportDetailsLazyQuery>;
export type GetGhgTransportUpstreamTransportDetailsSuspenseQueryHookResult = ReturnType<typeof useGetGhgTransportUpstreamTransportDetailsSuspenseQuery>;
export type GetGhgTransportUpstreamTransportDetailsQueryResult = Apollo.QueryResult<GetGhgTransportUpstreamTransportDetailsQuery, GetGhgTransportUpstreamTransportDetailsQueryVariables>;