import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGhgTransportBusinessTravelDataQueryVariables = Types.Exact<{
  where: Types.GhgTransport_BusinessTravel_Bool_Exp;
}>;

export type GetGhgTransportBusinessTravelDataQuery = {
  __typename?: "query_root";
  GHGTransport_BusinessTravel: Array<{
    __typename?: "GHGTransport_BusinessTravel";
    task_request_id: any;
    organization_address_id: any;
    id: any;
    activity_task_request_id: any;
  }>;
};

export const GetGhgTransportBusinessTravelDataDocument = gql`
  query getGHGTransportBusinessTravelData(
    $where: GHGTransport_BusinessTravel_bool_exp!
  ) {
    GHGTransport_BusinessTravel(where: $where) {
      task_request_id
      organization_address_id
      id
      activity_task_request_id
    }
  }
`;

/**
 * __useGetGhgTransportBusinessTravelDataQuery__
 *
 * To run a query within a React component, call `useGetGhgTransportBusinessTravelDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgTransportBusinessTravelDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgTransportBusinessTravelDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetGhgTransportBusinessTravelDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGhgTransportBusinessTravelDataQuery,
    GetGhgTransportBusinessTravelDataQueryVariables
  > &
    (
      | {
          variables: GetGhgTransportBusinessTravelDataQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGhgTransportBusinessTravelDataQuery,
    GetGhgTransportBusinessTravelDataQueryVariables
  >(GetGhgTransportBusinessTravelDataDocument, options);
}
export function useGetGhgTransportBusinessTravelDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGhgTransportBusinessTravelDataQuery,
    GetGhgTransportBusinessTravelDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGhgTransportBusinessTravelDataQuery,
    GetGhgTransportBusinessTravelDataQueryVariables
  >(GetGhgTransportBusinessTravelDataDocument, options);
}
// @ts-ignore
export function useGetGhgTransportBusinessTravelDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGhgTransportBusinessTravelDataQuery,
    GetGhgTransportBusinessTravelDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGhgTransportBusinessTravelDataQuery,
  GetGhgTransportBusinessTravelDataQueryVariables
>;
export function useGetGhgTransportBusinessTravelDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgTransportBusinessTravelDataQuery,
        GetGhgTransportBusinessTravelDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGhgTransportBusinessTravelDataQuery | undefined,
  GetGhgTransportBusinessTravelDataQueryVariables
>;
export function useGetGhgTransportBusinessTravelDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGhgTransportBusinessTravelDataQuery,
        GetGhgTransportBusinessTravelDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGhgTransportBusinessTravelDataQuery,
    GetGhgTransportBusinessTravelDataQueryVariables
  >(GetGhgTransportBusinessTravelDataDocument, options);
}
export type GetGhgTransportBusinessTravelDataQueryHookResult = ReturnType<
  typeof useGetGhgTransportBusinessTravelDataQuery
>;
export type GetGhgTransportBusinessTravelDataLazyQueryHookResult = ReturnType<
  typeof useGetGhgTransportBusinessTravelDataLazyQuery
>;
export type GetGhgTransportBusinessTravelDataSuspenseQueryHookResult =
  ReturnType<typeof useGetGhgTransportBusinessTravelDataSuspenseQuery>;
export type GetGhgTransportBusinessTravelDataQueryResult = Apollo.QueryResult<
  GetGhgTransportBusinessTravelDataQuery,
  GetGhgTransportBusinessTravelDataQueryVariables
>;
