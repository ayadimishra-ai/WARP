import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgTransportDownstreamTransportDetailsQueryVariables =
  Types.Exact<{
    activityFilter?: Types.InputMaybe<Types.GhgTransport_Downstream_Bool_Exp>;
    start?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    size?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
    orderBy?: Types.InputMaybe<
      | Array<Types.GhgTransport_Downstream_Order_By>
      | Types.GhgTransport_Downstream_Order_By
    >;
  }>;

export type GetGhgTransportDownstreamTransportDetailsQuery = {
  __typename?: "query_root";
  GHGTransport_Downstream: Array<{
    __typename?: "GHGTransport_Downstream";
    Which_Products?: string | null;
    Which_SKUs?: string | null;
    Destination_Location_Name?: string | null;
    Transport_Managed_by?: string | null;
    Mode_of_Transport?: string | null;
  }>;
  totalCount: {
    __typename?: "GHGTransport_Downstream_aggregate";
    aggregate?: {
      __typename?: "GHGTransport_Downstream_aggregate_fields";
      count: number;
    } | null;
  };
};

export const GetGhgTransportDownstreamTransportDetailsDocument = gql`
  query getGHGTransportDownstreamTransportDetails(
    $activityFilter: GHGTransport_Downstream_bool_exp
    $start: Int
    $size: Int
    $orderBy: [GHGTransport_Downstream_order_by!]
  ) {
    GHGTransport_Downstream(
      where: $activityFilter
      offset: $start
      limit: $size
      order_by: $orderBy
    ) {
      Which_Products
      Which_SKUs
      Destination_Location_Name
      Transport_Managed_by
      Mode_of_Transport
    }
    totalCount: GHGTransport_Downstream_aggregate(where: $activityFilter) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * __useGetGhgTransportDownstreamTransportDetailsQuery__
 *
 * To run a query within a React component, call `useGetGhgTransportDownstreamTransportDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgTransportDownstreamTransportDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgTransportDownstreamTransportDetailsQuery({
 *   variables: {
 *      activityFilter: // value for 'activityFilter'
 *      start: // value for 'start'
 *      size: // value for 'size'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetGhgTransportDownstreamTransportDetailsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetGhgTransportDownstreamTransportDetailsQuery,
    GetGhgTransportDownstreamTransportDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgTransportDownstreamTransportDetailsQuery,
    GetGhgTransportDownstreamTransportDetailsQueryVariables
  >(GetGhgTransportDownstreamTransportDetailsDocument, options);
}
export function useGetGhgTransportDownstreamTransportDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgTransportDownstreamTransportDetailsQuery,
    GetGhgTransportDownstreamTransportDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgTransportDownstreamTransportDetailsQuery,
    GetGhgTransportDownstreamTransportDetailsQueryVariables
  >(GetGhgTransportDownstreamTransportDetailsDocument, options);
}
// @ts-ignore
export function useGetGhgTransportDownstreamTransportDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgTransportDownstreamTransportDetailsQuery,
    GetGhgTransportDownstreamTransportDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgTransportDownstreamTransportDetailsQuery,
  GetGhgTransportDownstreamTransportDetailsQueryVariables
>;
export function useGetGhgTransportDownstreamTransportDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgTransportDownstreamTransportDetailsQuery,
        GetGhgTransportDownstreamTransportDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgTransportDownstreamTransportDetailsQuery | undefined,
  GetGhgTransportDownstreamTransportDetailsQueryVariables
>;
export function useGetGhgTransportDownstreamTransportDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgTransportDownstreamTransportDetailsQuery,
        GetGhgTransportDownstreamTransportDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgTransportDownstreamTransportDetailsQuery,
    GetGhgTransportDownstreamTransportDetailsQueryVariables
  >(GetGhgTransportDownstreamTransportDetailsDocument, options);
}
export type GetGhgTransportDownstreamTransportDetailsQueryHookResult =
  ReturnType<typeof useGetGhgTransportDownstreamTransportDetailsQuery>;
export type GetGhgTransportDownstreamTransportDetailsLazyQueryHookResult =
  ReturnType<typeof useGetGhgTransportDownstreamTransportDetailsLazyQuery>;
export type GetGhgTransportDownstreamTransportDetailsSuspenseQueryHookResult =
  ReturnType<typeof useGetGhgTransportDownstreamTransportDetailsSuspenseQuery>;
export type GetGhgTransportDownstreamTransportDetailsQueryResult =
  Apollo.QueryResult<
    GetGhgTransportDownstreamTransportDetailsQuery,
    GetGhgTransportDownstreamTransportDetailsQueryVariables
  >;
